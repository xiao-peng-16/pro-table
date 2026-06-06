<template>
  <div class="pro-pagination">
    <el-pagination
        ref="ElPaginationRef"
        v-model:current-page="pageParam.pageNum"
        v-model:page-size="pageParam.pageSize"
        :total="props.total"
        :size="proTableGlobalConfig?.proTableSize ?? 'default'"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        v-bind="attrs"
        :page-sizes="proTableGlobalConfig.pageSizes"
        :background="showBackground()"
        :layout="showLayout()"
    />
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, useAttrs} from "vue";
  import { ElPagination } from "element-plus";
  import { PageParam, ProTableGlobalConfig } from '@/components/base/ProTable/types'
  import { getInitPageParam } from '@/components/base/ProTable/components/CustomView/utils/useGlobalConfig'
  const attrs = useAttrs()
  const props = defineProps<{
    // 数据总行数
    total: number
    // ProTable全局配置
    proTableGlobalConfig: ProTableGlobalConfig
  }>()
  const emit = defineEmits<{
    (e: 'queryPage', pageParams)
  }>()

  const ElPaginationRef = ref<InstanceType<typeof ElPagination>>()


  // 分页参数初始值
  const initPageParam = getInitPageParam()
  // 分页参数
  const pageParam: PageParam = reactive({...initPageParam})


  // 查询事件
  const queryPage = () => {
    emit('queryPage', pageParam)
  }


  // 分页页数变更事件
  const handleCurrentChange = (current: number) => {
    pageParam.pageNum = current
    queryPage()
  }


  // 分页size变更事件
  const handleSizeChange  = (size: number) => {
    pageParam.pageNum = 1
    pageParam.pageSize = size
    queryPage()
  }


  // 重置分页参数
  const reset = (resetSize = false): PageParam => {
    pageParam.pageNum = 1
    if (resetSize) {
      pageParam.pageSize = initPageParam.pageSize
    }
    return pageParam
  }



  // 背景块
  const showBackground = () => {
    if (attrs.background || attrs.background === '') {
      return true
    }
    return !(attrs.small || attrs.small === '')
  }

  // 布局
  const showLayout = ():string => {
    if (attrs.layout) {
      return attrs.layout as string
    }
    if (attrs.small || attrs.small === '') {
      return 'total, prev, pager, next, sizes'
    }
    return 'total, prev, pager, next, sizes, jumper'
  }

  defineExpose({
    queryPage,
    reset,
  })

</script>

<style scoped lang="scss">
  // 自定义分页组件样式
  .pro-pagination {
    // 穿透 Element Plus 分页内部结构，统一分页按钮视觉风格
    :deep(.el-pagination) {
      // 上一页/下一页按钮使用透明背景和边框，和页码按钮保持一致
      .btn-prev,
      .btn-next {
        background-color: transparent;
        border: 1px solid var(--color-g-300, var(--el-border-color));
        transition: border-color 0.15s;

        // 非禁用状态下 hover 使用主题色，提供可点击反馈
        &:hover:not(.is-disabled) {
          color: var(--el-color-primary);
          border-color: var(--el-color-primary);
        }
      }

      // 页码按钮样式，覆盖 Element Plus 默认加粗和背景
      li {
        box-sizing: border-box;
        font-weight: 400 !important;
        background-color: transparent;
        border: 1px solid var(--color-g-300, var(--el-border-color));
        transition: border-color 0.15s;

        // 当前页使用主题色底色，明确区分选中状态
        &.is-active {
          font-weight: 400;
          color: #fff;
          background-color: var(--el-color-primary);
          border: 1px solid var(--el-color-primary);
        }

        // 普通页码 hover 只高亮边框，避免和当前页背景态混淆
        &:hover:not(.is-disabled) {
          border-color: var(--el-color-primary);
        }
      }
    }
  }
</style>
