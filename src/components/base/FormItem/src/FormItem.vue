<template>
  <el-form-item
    class="form-item"
    :style="styleClass"
    v-bind="$attrs"
    :class="`${slots.bottom ? 'label-top ' : ''}` + ' ' + `${props.span ? 'span span' + props.span : ''}`"
  >
    <template v-if="$attrs.label || slots.label" #label="{ label }">
      <slot v-if="slots.label" name="label" :label="label"></slot>
      <template v-else>
        <span>{{ label }}</span>
      </template>
    </template>
    <template #error="{ error }">
      <slot v-if="slots.error" name="error" :error="error"></slot>
      <div v-else class="error">
        <div class="svg">
          <svg
            id="mx_n_1700621538723"
            t="1700621538722"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="1680"
            width="200"
            height="200"
          >
            <path
              d="M512 0a512 512 0 1 1 0 1024A512 512 0 0 1 512 0z m-16 768a48 48 0 1 0 0 96 48 48 0 0 0 0-96z m0-576a48 48 0 0 0-47.552 41.472L448 240v416a48 48 0 0 0 95.552 6.528l0.448-6.528v-416A48 48 0 0 0 496 192z"
              p-id="1681"
              fill="#F55353"
            ></path>
          </svg>
        </div>
        <span>{{ error }}</span>
      </div>
    </template>
    <template #default>
      <div class="content">
        <div v-if="slots.before" class="before">
          <slot name="before"></slot>
        </div>

        <div>
          <slot></slot>
        </div>
        <div v-if="slots.after" class="after">
          <slot name="after"></slot>
        </div>
      </div>
      <div v-if="slots.bottom" class="bottom">
        <slot name="bottom"></slot>
      </div>
    </template>
  </el-form-item>
</template>

<script setup lang="ts" name="FormItem">
  import '../style/index.scss'
  import { ElFormItem, FormItemProps } from 'element-plus'
  import { useSlots, useAttrs, computed, inject } from 'vue'
  const attrs = useAttrs()
  const slots = useSlots()
  const props = withDefaults(
    defineProps<{
      span?: number //合并列数
      spanRow?: number //合并行数
    }>(),
    {
      span: 1,
      spanRow: null
    }
  )
  const parentColumn = inject('column')
  const styleClass = computed(() => {
    const customeStyle = {}
    const spanCol = (Number(props.span) > Number(parentColumn)) || Number(props.span) === 0 ? Number(parentColumn) : Number(props.span)
    switch (spanCol) {
      case 1:
        customeStyle['grid-column-start'] = 'span 1'
        break
      case 2:
        customeStyle['grid-column-start'] = 'span 2'
        break
      case 3:
      default:
        customeStyle['grid-column-start'] = 'span 3'
        break
    }
    if (props.spanRow) {
      customeStyle['grid-row-start'] = `span ${props.spanRow}`
    }
    return customeStyle
  })
</script>

