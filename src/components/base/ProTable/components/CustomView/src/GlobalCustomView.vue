<template>
  <div class="global-custom-view">
  <el-form label-position="left">
    <!-- 搜索条件展示行数 -->
    <el-form-item label="搜索条件展示行数：">
      <el-radio-group v-model="proTableGlobalConfig.filterIsShowAll">
        <el-radio :value="true">显示所有</el-radio>
        <el-radio :value="false">
          <span>默认显示</span>
          <span v-if="proTableGlobalConfig.filterIsShowAll">N</span>
          <el-input-number v-else v-model="proTableGlobalConfig.filterShowRow" :min="1" :max="99" :precision="0" style="margin: 0 5px;"/>
          <span>行, 可展开显示所有</span>
        </el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 表格高度是否自适应 -->
    <el-form-item label=" 表格高度：">
      <el-radio-group v-model="proTableGlobalConfig.proTableAutoMaxHeight">
        <el-radio :value="false">随内容变高</el-radio>
        <el-radio :value="true">自适应（表格内部滚动条 表头位置固定方便查看）</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 表格大小尺寸 -->
    <el-form-item label="表格大小尺寸：">
      <el-radio-group v-model="proTableGlobalConfig.proTableSize">
        <el-radio value="small">小</el-radio>
        <el-radio value="default">中</el-radio>
        <el-radio value="large">大</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 表格设置 -->
    <el-form-item label="表格设置：">
        <el-checkbox v-model="proTableGlobalConfig.tableIsBorder" label="纵向边框" />
        <el-checkbox v-model="proTableGlobalConfig.tableIsStripe" label="斑马线" />
    </el-form-item>

    <div style="display: flex;justify-content:space-between;">
    <!-- 分页默认大小 -->
    <el-form-item label="分页默认大小设置:">
      <el-select v-model="proTableGlobalConfig.pageDefaultSize"style="width: 240px">
        <el-option v-for="item in [10, 20, 30] " :value="item" :label="`${item}条/页`"/>
      </el-select>
    <!-- 分页可选大小集合 -->
    </el-form-item>
        <el-form-item label="分页可选大小集合:">
      <el-select v-model="proTableGlobalConfig.pageSizes" multiple collapse-tags tag-type="primary" style="width: 240px">
        <el-option v-for="item in [10, 20, 30, 40, 50, 100, 150, 200, 300, 500] " :value="item" :label="`${item}条/页`"/>
      </el-select>
    </el-form-item>
    </div>

  </el-form>

    <!-- 底部操作按钮 -->
    <div class="custom-btn__container">
      <el-button @click="cancel">取消</el-button>
      <el-button @click="resetConfig">重置</el-button>
      <el-button type="primary" @click="saveConfig">保存设置</el-button>
    </div>
  </div>
</template>


<script setup lang="ts" name="GlobalCustomView">
  import '../style/index.scss'
  import { ref } from 'vue'
  import type { ProTableGlobalConfig } from '@/components/base/ProTable'
  import { ElForm, ElFormItem, ElRadioGroup, ElRadio, ElCheckbox, ElInputNumber, ElButton } from "element-plus"
  import { clearGlobalConfig, loadGlobalConfig, saveGlobalConfig, getDefaultProTalbeGolbalConfig } from '../utils/useGlobalConfig'

  const emit = defineEmits<{
    // [全局]自定义配置完成
    (e: 'update:custom-global')
    // 取消
    (e: 'cancel')
  }>()

  // 全局配置
  const proTableGlobalConfig = ref<ProTableGlobalConfig>(loadGlobalConfig())

  // 重置配置
  const resetConfig = () => {
    clearGlobalConfig()
    proTableGlobalConfig.value = getDefaultProTalbeGolbalConfig()
  }

  // 保存配置
  const saveConfig = () => {
    saveGlobalConfig(proTableGlobalConfig.value)
    emit('update:custom-global')
  }

  // 取消
  const cancel = () => {
    emit('cancel')
  }

</script>
