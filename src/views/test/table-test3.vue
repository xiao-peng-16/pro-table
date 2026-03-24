<template>

  <el-card shadow="never">
    <!-- 公共搜索条件 -->
    <Filter
      :filters="filters"
      custom-id="pro-table-test_0"
      @query="onFilterQuery"
    >
    </Filter>
  </el-card>


  <div style="display: flex;justify-content: space-between;">
       <!-- 第一个表格 -->
      <el-card shadow="never" style="width: 45%;">
        <template #header>第一个表格</template>
        <ProTable
          ref="ProTableRef_1"
          :columns="columns_1"
          :get-table-data="getData_1"
          custom-id="pro-table-test_1"
        >
        </ProTable>
      </el-card>

       <!-- 第二个表格 -->
      <el-card shadow="never" style="width: 45%;">
        <template #header>第二个表格</template>
        <ProTable
          ref="ProTableRef_2"
          :columns="columns_2"
          :get-table-data="getData_2"
          custom-id="pro-table-test1_2"
        >
        </ProTable>
      </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ProTable, Filter, FilterItem, TableColumnItem, PageResponse } from '@/components/base/ProTable'
import { deptEnum, deptFlatEnum, roleEnum, statusEnum, genderEnum, sourceEnum, queryMockUsers } from './table-test.mock.js'


  const ProTableRef_1 = ref<InstanceType<typeof ProTable>>()
  const ProTableRef_2 = ref<InstanceType<typeof ProTable>>()


// 搜索条件
const filters = computed<FilterItem[]>(() => [
  {
    type: 'cascader',
    label: '部门',
    prop: 'deptId',
    enumItems: deptEnum,
  },
  {
    label: '账号',
    prop: 'username',
  },
  {
    label: '姓名',
    prop: 'nickName',
  },
    {
    type: 'select',
    label: '性别',
    prop: 'gender',
    enumItems: genderEnum,
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
    label: '注册来源',
    prop: 'registerSource',
    enumItems: sourceEnum,
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
])


// 列表字段_1
const columns_1 = computed<TableColumnItem[]>(() => [
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
])



// 列表字段_2
const columns_2 = computed<TableColumnItem[]>(() => [
  {
    label: '姓名',
    prop: 'nickName',
    minWidth: 120,
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
    enumItems: deptFlatEnum,
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
])


/**
 * 搜索条件参数变更触发查询事件
 * @param newFilterParam 新的搜索过滤条件参数
 */
const onFilterQuery = (filterParam) => {
  ProTableRef_1.value?.onFilterQuery(filterParam)
  ProTableRef_2.value?.onFilterQuery(filterParam)
}

// 获取数据方法
const getData_1 = async (param): Promise<PageResponse<any>> => {
  console.log('requestParam ', param)
  const result = queryMockUsers(param)
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(result)
    }, 300)
  })
}

// 获取数据方法
const getData_2 = async (param): Promise<PageResponse<any>> => {
  console.log('requestParam ', param)
  const result = queryMockUsers(param)
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(result)
    }, 300)
  })
}
</script>

<style scoped></style>
