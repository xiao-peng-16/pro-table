<template>
  <el-collapse :class="`cxp-collapse${styleClass}`" v-model="modelValue" v-bind="$attrs">
    <slot @addCollapseItemName="addCollapseItemName"></slot>
  </el-collapse>
</template>

<script setup lang="ts" name="JlcCollapse">
  import '../style/index.scss'
  import { ElCollapse } from 'element-plus'
  import { computed, provide } from 'vue'
  const props = withDefaults(
    defineProps<{
      accordion?: boolean // 是否手风琴模式
      readOnly?: boolean // 只读,不显示展开
    }>(),
    {
      accordion: false,
      readOnly: null
    }
  )


  const modelValue = defineModel<string[]>()
  if (!props.accordion && !modelValue.value) {
    modelValue.value = []
    const registerCollapseItemName = (name: string) => {
      modelValue.value.push(name)
    }
    provide('registerCollapseItemName', registerCollapseItemName)
  }

  const styleClass = computed(() => {
    let customeStyle = ''
    if (props.readOnly) {
      customeStyle += ' read-only'
    }
    return `${customeStyle}`
  })



</script>

