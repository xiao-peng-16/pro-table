<template>
  <el-form
    ref="elRef"
    :class="`cxp-form ${styleClass}`"
    v-bind="attrs"
    :label-position="(attrs.labelPosition as 'top' | 'left' | 'right') ?? 'left'"
    :label-width="props.labelWidth ? props.labelWidth : props.text ? '' : '130px'"
    :scroll-into-view-options="props.scrollIntoViewOptions || { behavior: 'smooth' }"
  >
    <div v-if="!isCollapse" class="table">
      <slot></slot>
    </div>
    <slot v-else></slot>
  </el-form>
</template>

<script setup lang="ts" name="Form">
  import '../style/index.scss'
  import { ElForm, FormProps } from 'element-plus'
  import { defineExpose, ref, computed, useSlots, useAttrs, provide } from 'vue'
  const elRef = ref<InstanceType<typeof ElForm>>()
  const attrs = useAttrs()
  const slots = useSlots()
  const props = withDefaults(
    defineProps<{
      column?: number //列数
      border?: boolean //边框
      text?: boolean //文本样式
      scrollIntoViewOptions?: any
    }>(),
    {
      column: 1,
      border: false,
      text: false,
      scrollIntoViewOptions: null
    }
  )
  provide('column', props.column)
  const styleClass = computed(() => {
    const defaultStyle = props.border ? 'table-style' : 'default-style'
    let customeStyle = ''
    if (props.column > 1) {
      switch (props.column) {
        case 2:
          customeStyle = ' two-col'
          break
        case 4:
          customeStyle = defaultStyle === 'default-style' ? ' four-col' : ' three-col'
          break
        case 3:
        default:
          customeStyle = ' three-col'
          break
      }
    }
    //text 文本类型
    if (props.text) {
      customeStyle += ' text-style'
    }
    return `${defaultStyle}${customeStyle}`
  })
  //带折叠面板
  const isCollapse = computed(() => {
    //插槽内部注释也算dom
    return slots.default().length > 0 && slots.default()[0].type.name === 'JlcCollapse' ? true : false
  })
  defineExpose({
    validate: computed(() => elRef.value.validate),
    validateField: computed(() => elRef.value.validateField),
    resetFields: computed(() => elRef.value.resetFields),
    scrollToField: computed(() => elRef.value.scrollToField),
    clearValidate: computed(() => elRef.value.clearValidate)
  })
</script>

