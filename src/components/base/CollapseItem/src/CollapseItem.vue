<template>
  <el-collapse-item
    ref="collapseItemRef"
    :class="`cxp-collapse-item ${slots.after ? 'after' : ''} ${styleClass}`"
    :name="name"
    v-bind="$attrs"
    :disabled="getDisable"
  >
    <template #title>
      <!-- 默认设置 -->
      <slot v-if="slots.title" name="title"></slot>
      <div v-else class="layout">
        <span class="title">{{ $attrs.title }}</span>
        <span v-if="props.subTitle" class="subtitle">{{ props.subTitle }}</span>
      </div>
      <span class="arrow-title"></span>
      <div v-if="slots.after" name="after" class="after" @click="afterClick">
        <slot name="after"></slot>
      </div>
    </template>

    <template #default>
      <slot name="default"></slot>
    </template>
  </el-collapse-item>
</template>

<script setup lang="ts" name="JlcCollapseItem">
  import '../style/index.scss'
  import { ElCollapseItem } from 'element-plus'
  import { useSlots, computed, ref, getCurrentInstance, inject } from 'vue'
  const slots = useSlots()
  const props = withDefaults(
    defineProps<{
      name: string // 唯一标志符
      subTitle?: string
      readOnly?: boolean //只读,不显示展开
    }>(),
    {
      subTitle: null,
      readOnly: null
    }
  )

  // 注册 collapse-item name 到 collapse组件 用于默认展开所有
  const registerCollapseItemName = inject('registerCollapseItemName', (name)=>{})
  registerCollapseItemName?.(props.name)

  const collapseItemRef = ref()
  const getDisable = computed(() => {
    let isDisable = false
    if (props.readOnly) {
      isDisable = true
    } else if (props.readOnly !== null) {
      isDisable = false
    }
    //是否已在父级设置全部只读
    const isAllReadOnly = (getCurrentInstance().parent.attrs.class as string).includes('read-only')
    return isAllReadOnly ? (!isDisable && props.readOnly !== null ? false : true) : isDisable
  })
  
  const styleClass = computed(() => {
    let customeStyle = ''
    if (props.readOnly) {
      customeStyle += ' read-only'
    } else if (props.readOnly !== null && !props.readOnly) {
      customeStyle += ' default'
    }
    return `${customeStyle}`
  })
  const afterClick = (event) => {
    event.stopPropagation()
  }
</script>

