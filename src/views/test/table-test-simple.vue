<template>
  <ProTable
    :filters="filters"
    :columns="columns"
    :get-table-data="getData"
    custom-id="pro-table-test1"
  >
      <!-- 表格顶部按钮插槽 -->
      <template #table-top>
        <el-button type="primary">新增</el-button>
      </template>

    <!-- 按钮区插槽  下面 slot: 'column_operate'  -->
    <template #column_operate="{ row }">
      <el-button link type="primary">查看</el-button>
      <el-button link type="primary">编辑</el-button>
      <el-button link type="danger">禁用</el-button>
    </template>
  </ProTable>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ProTable, FilterItem, TableColumnItem, PageResponse } from '@/components/base/ProTable'
import { queryMockUsers, deptEnum } from './table-test.mock.js'

// 枚举值用于 搜索条件[下拉框] 和 列表字段映射
const genderEnum = [
  { value: 'M', label: '男' },
  { value: 'F', label: '女' },
]

// 搜索条件
const filters = computed<FilterItem[]>(() => [
  {
    label: '姓名',
    prop: 'nickName',
  },
  {
    type: 'select',           // 类型：下拉框   （详情参考 src\components\base\ProTable\types\index.ts）
    label: '性别',            // 标题           （详情参考 src\components\base\ProTable\types\index.ts）
    prop: 'gender',           // 字段名         （详情参考 src\components\base\ProTable\types\index.ts）
    enumItems: genderEnum,    // 枚举下拉框     （详情参考 src\components\base\ProTable\types\index.ts）
    value: 'M'                // 默认初始值     （详情参考 src\components\base\ProTable\types\index.ts）
  },
  {
    type: 'cascader',         // 类型：级联选择  （详情参考 src\components\base\ProTable\types\index.ts）
    label: '部门',
    prop: 'deptId',
    enumItems: deptEnum,
  },
  {
    type: 'datetimerange',    // 类型：时间范围选择
    label: '创建时间',        // 标题
    prop: ['createTimeStart', 'createTimeEnd'],   // 时间范围搜索 [开始时间字段， 结束时间字段] （详情参考 src\components\base\ProTable\types\index.ts）
    defaultShortcut: 'currentYear',               
  },
])

// 列表字段
const columns = computed<TableColumnItem[]>(() => [
  {
    type: 'selection',
    width: 50,
  },
  {
    label: '姓名',
    prop: 'nickName',
    minWidth: 120,
  },
  {
    label: '性别',
    prop: 'gender',
    enumItems: genderEnum,    // 枚举映射 将后端值映射为枚举对应中文描述
    width: 90,
  },
  {
    label: '操作',
    slot: 'column_operate', // 插槽   （详情参考 src\components\base\ProTable\types\index.ts）
    fixed: 'right',         // 右对齐 （详情参考 src\components\base\ProTable\types\index.ts）
    width: 180,
  },
])

// 获取数据方法
const getData = async (param): Promise<PageResponse<any>> => {
  // 模拟调用后端接口
  const result = queryMockUsers(param)
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(result)
    }, 300)
  })
}
</script>