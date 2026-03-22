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
import { ProTable, FilterItem, TableColumnItem, PageResponse } from '@/components/base/ProTable'
import { deptEnum, roleEnum, statusEnum, genderEnum, sourceEnum, queryMockUsers } from './table-test.mock.js'

// 搜索条件
const filters: FilterItem[] = [
  {
    label: '账号',
    prop: 'username',
  },
  {
    label: '姓名',
    prop: 'nickName',
  },
  {
    label: '邮箱',
    prop: 'email',
  },
  {
    label: '手机号',
    prop: 'phone',
  },
  {
    label: '工号',
    prop: 'jobNo',
  },
  {
    label: '登录IP',
    prop: 'loginIp',
  },
  {
    type: 'select',
    label: '性别',
    prop: 'gender',
    enumItems: genderEnum,
  },
  {
    type: 'select',
    label: '注册来源',
    prop: 'registerSource',
    enumItems: sourceEnum,
  },
  {
    type: 'select',
    label: '部门',
    prop: 'deptId',
    enumItems: deptEnum,
  },
  {
    type: 'select',
    label: '角色',
    prop: 'roleCode',
    enumItems: roleEnum,
  },
  {
    type: 'select',
    label: '状态',
    prop: 'status',
    enumItems: statusEnum,
  },
  {
    type: 'datetimerange',
    label: '创建时间',
    prop: ['createTimeStart', 'createTimeEnd'],
    defaultShortcut: 'currentYear',
  },
  {
    type: 'datetimerange',
    label: '更新时间',
    prop: ['updateTimeStart', 'updateTimeEnd'],
    defaultShortcut: 'currentYear',
  },
  {
    label: '创建人',
    prop: 'creator',
  },
  {
    label: '更新人',
    prop: 'updater',
  },
]


// 列表字段
const columns: TableColumnItem[] = [
  {
    type: 'selection',
    width: 50,
  },
  {
    type: 'index',
    label: '序号',
    width: 70,
    align: 'center',
  },
  {
    label: '账号',
    prop: 'username',
    minWidth: 140,
    fixed: 'left',
  },
  {
    label: '姓名',
    prop: 'nickName',
    minWidth: 120,
  },
  {
    label: '手机号',
    prop: 'phone',
    width: 140,
  },
  {
    label: '邮箱',
    prop: 'email',
    minWidth: 180,
  },
  {
    label: '性别',
    prop: 'gender',
    enumItems: genderEnum,
    width: 90,
  },
  {
    label: '工号',
    prop: 'jobNo',
    width: 110,
  },
  {
    label: '登录IP',
    prop: 'loginIp',
    minWidth: 140,
  },
  {
    label: '注册来源',
    prop: 'registerSource',
    enumItems: sourceEnum,
    minWidth: 120,
  },
  {
    label: '部门',
    prop: 'deptId',
    enumItems: deptEnum,
    width: 120,
  },
  {
    label: '角色',
    prop: 'roleCode',
    enumItems: roleEnum,
    width: 140,
  },
  {
    label: '状态',
    prop: 'status',
    enumItems: statusEnum,
    tagTypeMap: {
      1: 'success',
      0: 'danger',
      default: 'info',
    },
    width: 100,
  },
  {
    label: '最近登录时间',
    prop: 'lastLoginTime',
    width: 180,
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
  },
  {
    label: '创建时间',
    prop: 'createTime',
    width: 180,
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
  },
  {
    label: '更新时间',
    prop: 'updateTime',
    width: 180,
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
  },
  {
    label: '创建人',
    prop: 'creator',
    width: 100,
  },
  {
    label: '更新人',
    prop: 'updater',
    width: 100,
  },
  {
    label: '备注',
    prop: 'remark',
    minWidth: 220,
    showOverflowTooltip: false,
  },
  {
    label: '操作',
    slot: 'column_operate', // 插槽
    fixed: 'right',
    width: 180,
  },
]

// 获取数据方法
const getData = async (param): Promise<PageResponse<any>> => {
  const result = queryMockUsers(param)
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(result)
    }, 300)
  })
}
</script>

<style scoped></style>
