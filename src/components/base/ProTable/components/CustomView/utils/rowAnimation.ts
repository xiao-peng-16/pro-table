import type { Ref } from 'vue'

/**
 * rowAnimation.ts 作用：
 * 1) 统一承载 CustomView（Filter/Table）行移动动画的基础能力；
 * 2) 提供"串行执行守卫"，确保连续操作按触发顺序执行，不丢操作；
 * 3) 提供 DOM 行探测、过渡结束等待、位移动画与样式清理，避免重复维护。
 *
 * 设计边界：
 * - 本文件只负责"动画基础层"，不包含业务规则（fixed 分区、步长计算、边界策略）；
 * - 业务层（useFilterCustomOperation / useTableCustomOperation）负责决定"是否执行"和"如何改数据"。
 */

export type RowMoveType = 'up' | 'down'

type AnimationTaskHandler = () => Promise<void>

// 单段位移动画时长（ms）：控制当前块与受影响区块的主运动速度。
const MOVE_ANIMATION_MS = 400

// 反向区块延迟时长（ms）：让两组元素错峰开始，减少重叠突兀感。
const MOVE_ANIMATION_DELAY_MS = 200

// 过渡结束兜底时长（ms）：主动画 + 延迟 + 安全缓冲，避免 transitionend 丢失导致流程卡住。
const MOVE_ANIMATION_FALLBACK_MS = MOVE_ANIMATION_MS + MOVE_ANIMATION_DELAY_MS + 200

/**
 * 创建"串行动画守卫"执行器：
 * - 连续触发的动作会排队执行，不会在忙时直接丢弃；
 * - 前序任务异常不会打断后续队列；
 * - 统一返回 boolean：true=当前任务执行完成。
 *
 * 实现机制：
 * - animationQueue 串联所有待执行任务，形成链式调用；
 * - 使用 Promise 链确保任务顺序，即使某个任务 throw，链仍继续（通过 .then(fn, fn) 处理异常）。
 * 返回的 Promise 会始终 resolve，调用方通过返回值 true 判断任务执行完成。
 */
export const createAnimationGuardRunner = () => {
  // 注意：isAnimating 虽然被设置但未在逻辑中实际使用，仅作状态记录保留。
  let isAnimating = false
  let animationQueue: Promise<void> = Promise.resolve()

  return (handler: AnimationTaskHandler): Promise<boolean> => {
    const runCurrentTask = async (): Promise<boolean> => {
      isAnimating = true
      try {
        await handler()
        return true
      } finally {
        isAnimating = false
      }
    }

    const currentTask = animationQueue.then(runCurrentTask, runCurrentTask)
    animationQueue = currentTask.then(
      () => undefined,
      () => undefined
    )
    return currentTask
  }
}

/**
 * 等待一批元素的过渡动画结束：
 * - 优先依赖 transitionend，确保视觉结束后再做数据提交；
 * - 同时提供超时兜底，防止事件丢失导致流程卡住。
 *
 * 内部实现要点：
 * - 使用 Set 去重：避免同一 DOM 元素多次注册监听导致 promise 重复 resolve；
 * - finished 标记：确保 resolve 只执行一次，防止 transitionend 冒泡或多事件触发导致多次回调；
 * - pendingCount 计数：每个元素的 transitionend 只递减一次，等所有元素都触发后才 resolve；
 * - event.target === element：只统计"目标行自身"的 transitionend，忽略子元素（如 td、展开行）冒泡上来的事件；
 * - propertyName 过滤：只关心 transform位移过渡，忽略 opacity/color 等其他 CSS 属性的 transitionend，避免误判；
 * - timeout 兜底：transitionend 事件在某些浏览器/场景下可能丢失（如快速切换 tab、元素被移除），超时后强制 resolve。
 */
export const waitForRowTransitionEnd = (elements: HTMLElement[]): Promise<void> => {
  return new Promise((resolve) => {
    // 使用 Set 去重：避免同一 DOM 元素多次注册监听导致 promise 重复 resolve
    const uniqueElements = Array.from(new Set(elements))
    // 空数组直接 resolve，避免后续逻辑产生无意义的监听
    if (!uniqueElements.length) {
      resolve()
      return
    }

    let finished = false
    // pendingCount 初始化为元素个数：每个元素只递减一次，等所有元素的 transitionend 都触发后才 resolve
    // 这样设计确保"所有行都动画结束"才进入下一阶段，避免部分行提前完成导致数据不一致
    let pendingCount = uniqueElements.length
    // listeners Map：存储每个元素对应的监听函数，便于后续统一清理
    const listeners = new Map<HTMLElement, (event: TransitionEvent) => void>()

    const finish = () => {
      // 防重：确保 resolve 只执行一次，防止 transitionend 冒泡或多事件触发导致多次回调
      if (finished) {
        return
      }
      finished = true
      // 统一移除所有监听，避免内存泄漏
      listeners.forEach((listener, element) => {
        element.removeEventListener('transitionend', listener)
      })
      listeners.clear()
      resolve()
    }

    // handleTransitionEnd 只负责计数与收口判断，不处理具体事件细节
    // 这样分离关注点：事件过滤在 onTransitionEnd 里做，计数收口在这里做
    const handleTransitionEnd = () => {
      pendingCount -= 1
      if (pendingCount <= 0) {
        finish()
      }
    }

    // 逐个元素注册 transitionend 监听：每个元素需要独立监听，以确保精确捕获该元素的动画完成事件
    // 如果用事件委托（把监听注册到父元素），无法区分"哪个具体行"完成了过渡
    uniqueElements.forEach((element) => {
      const onTransitionEnd = (event: TransitionEvent) => {
        // 只统计"当前行元素自身"的事件，忽略子元素冒泡的 transitionend
        if (event.target !== element) {
          return
        }
        // 只关心位移动画，避免 opacity/color 等其他过渡提前触发完成
        if (event.propertyName !== 'transform' && event.propertyName !== '-webkit-transform') {
          return
        }

        // 找到监听函数后立即移除，避免同一元素的 transitionend 被重复触发（CSS 动画可能触发多次）
        const listener = listeners.get(element)
        if (listener) {
          element.removeEventListener('transitionend', listener)
          listeners.delete(element)
        }
        // 只有命中有效 transition 后才调用 handleTransitionEnd，避免无效事件触发计数
        handleTransitionEnd()
      }

      // listeners.set 目的是：把监听函数存到 Map 里，后续 finish() 时可以统一移除所有监听
      // 同时在事件触发时可以凭此找到并删除该元素的监听，避免重复回调
      listeners.set(element, onTransitionEnd)
      element.addEventListener('transitionend', onTransitionEnd)
    })

    // 与事件监听并行存在：transitionend 事件在某些浏览器/场景下可能丢失（如快速切换 tab、元素被移除），超时后强制 resolve
    window.setTimeout(finish, MOVE_ANIMATION_FALLBACK_MS)
  })
}

/**
 * 从 Table 组件实例中探测可查询行节点的根元素。
 * 兼容不同挂载阶段和构建模式。
 */
const resolveTableRootElement = (tableRef: Ref): HTMLElement | undefined => {
  const tableInstance = tableRef?.value as any

  // 候选根节点来源（按可靠性排序）
  const candidates = [
    // Element Plus / 自定义 Table 组件暴露的根元素获取方法
    tableInstance?.getTableRootEl?.(),
    // Vue 组件实例的根 DOM 元素
    tableInstance?.$el,
    // Vue3 渲染层根元素
    tableInstance?.$?.vnode?.el,
    // Vue3 子树根元素
    tableInstance?.$?.subTree?.el,
    // Vue2 组件代理的根元素
    tableInstance?.$?.proxy?.$el,
  ]

  // 只要候选对象具备 querySelectorAll 方法，即视为有效的表格根元素
  return candidates.find((candidate) => {
    return candidate && typeof candidate.querySelectorAll === 'function'
  }) as HTMLElement | undefined
}

/**
 * 获取当前表格渲染出来的所有行元素。
 */
export const getTableRowElList = (tableRef: Ref): HTMLElement[] => {
  const tableEl = resolveTableRootElement(tableRef)
  if (!tableEl) {
    return []
  }
  // 使用 .el-table__row class 选择器定位 Element Plus 表格的行 DOM
  return Array.from(tableEl.querySelectorAll('.el-table__row')) as HTMLElement[]
}

/**
 * 行位移动画：执行两组元素的反向位移，模拟表格行交换位置。
 */
export const moveRowElement = (
  itemList_1: HTMLElement[],
  itemList_2: HTMLElement[],
  type: RowMoveType
) => {
  if (!itemList_1.length || !itemList_2.length) {
    return
  }

  // 用 offsetTop 判断哪组在视觉上方（offsetTop 越小越靠上）
  const itemTop_1 = itemList_1[0].offsetTop
  const itemTop_2 = itemList_2[0].offsetTop
  const upList = itemTop_1 > itemTop_2 ? itemList_1 : itemList_2
  const downList = itemTop_1 < itemTop_2 ? itemList_1 : itemList_2
  const allList = [...itemList_1, ...itemList_2]

  // 统一设置 transition 保证动画生效，设置较高 zIndex 避免动画过程中被遮挡
  allList.forEach((item) => {
    item.style.transition = `transform ${MOVE_ANIMATION_MS}ms ease-in-out`
    item.style.zIndex = '10'
  })

  // 移动方向相反的一侧添加延迟（200ms），让两组元素错峰开始运动，减少视觉重叠的突兀感
  if (type === 'up') {
    // type='up' 时：下移区域（downList）延迟，让上移区域先动
    downList.forEach((item) => {
      item.style.transitionDelay = `${MOVE_ANIMATION_DELAY_MS}ms`
      item.style.zIndex = '5'
    })
  } else {
    // type='down' 时：上移区域（upList）延迟，让下移区域先动
    upList.forEach((item) => {
      item.style.transitionDelay = `${MOVE_ANIMATION_DELAY_MS}ms`
      item.style.zIndex = '5'
    })
  }

  // 分别累加各组所有行的高度（包含多行/树形子节点），保证跨步移动时位移准确
  const upHeight = upList.reduce((total, item) => total + item.offsetHeight, 0)
  const downHeight = downList.reduce((total, item) => total + item.offsetHeight, 0)

  // translateY 正负含义：负值向上移动，正值向下移动
  // 两组元素的位移量正好是对方的高度，从而实现"交换位置"的视觉效果
  upList.forEach((item) => {
    item.style.transform = `translateY(${-downHeight}px)`
  })
  downList.forEach((item) => {
    item.style.transform = `translateY(${upHeight}px)`
  })
}

/**
 * 清理动画产生的临时行内样式，恢复表格默认布局。
 * 动画结束后需要立即清理，否则：
 * - transform 会导致行定位持续偏移；
 * - transition/transitionDelay 会影响后续交互响应速度；
 * - zIndex 残留可能遮挡其他行。
 * 同时添加 'move' class 触发表格内部可能存在的 CSS transition 优化。
 */
export const clearRowAnimationStyle = (tableRowElList: HTMLElement[]) => {
  for (let index = 0; index < tableRowElList.length; index++) {
    const element = tableRowElList[index]
    element.removeAttribute('style')
    element.classList.add('move')
  }
}
