<template>
  <ElDialog
    v-model="modelValue"
    v-bind="attrs"
    class="dialog-wrapper"
    :draggable="(attrs.draggable as boolean) ?? config?.dialog?.draggable"
    :lock-scroll="(attrs.lockScroll as boolean) ?? config?.dialog?.lockScroll"
    :destroy-on-close="(attrs.destroyOnClose as boolean) ?? config?.dialog?.destroyOnClose"
    :fullscreen="isFullscreen"
    :show-close="false"
    :close-on-click-modal="false"
  >
    <template #header="{ close, titleId, titleClass }">
      <div class="dialog-header-wrapper">
        <slot name="header" :close="close" :titleId="titleId" :titleClass="titleClass">{{ title }}</slot>
        <div class="dialog-header-btn-wrapper">
          <!-- 切换全屏按钮 -->
          <Icon
            v-if="fullscreen"
            @click="switchFullscreen"
            class="dialog-header-btn"
            :icon="isFullscreen ? 'vi-radix-icons:exit-full-screen' : 'vi-radix-icons:enter-full-screen'"
            color="var(--el-color-info)"
            hover-color="var(--el-color-primary)"
          />
          <!-- 关闭按钮 -->
          <Icon
            @click="close"
            class="dialog-header-btn"
            icon="vi-ep:close"
            color="var(--el-color-info)"
            hover-color="var(--el-color-primary)"
          />
        </div>
      </div>
    </template>
    <slot></slot>
    <template v-if="slots.footer" #footer>
      <slot name="footer"></slot>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed, useAttrs, ref, useSlots } from 'vue'
  import { ElDialog, ElScrollbar } from 'element-plus'
  import { componentConfig as config } from '@/components/base'
  import { Icon } from "@/components"
  import { ElDialogProps } from "@/components"
  const slots  = useSlots()
  const attrs = useAttrs()
  const props = withDefaults(
    defineProps<{
      title: string
      fullscreen: boolean // 是否展示切换全屏按钮
    } & /* @vue-ignore */ ElDialogProps>(),
    {
      fullscreen: true
    }
  )

  // 是否全屏
  const isFullscreen = ref(false)
  // 切换全屏按钮
  const switchFullscreen = () => {
    isFullscreen.value = !isFullscreen.value
  }

</script>

<style lang="scss">
.dialog-wrapper.el-dialog{
  --el-dialog-padding-primary: 0px;
  .el-dialog__header {
    padding: 16px 24px;
    border-bottom: 1px solid #f2f2f2;
    cursor: auto !important;
    .dialog-header-wrapper{
      position: relative;
      width: 100%;
      font-size: 16px;
      font-weight: bold;
      .dialog-header-btn-wrapper{
        position: absolute;
        top: 0px;
        right: 0px;
        .dialog-header-btn {
          cursor: pointer;
          margin-left: 10px;
        }
      }
    }
  }
  .el-dialog__body {
    padding: 20px 24px;
    border-top:  1px solid #f2f2f2;
  }
  .el-dialog__footer {
    padding: 10px 24px;
    border-top:  1px solid #f2f2f2;
  }

}



</style>
