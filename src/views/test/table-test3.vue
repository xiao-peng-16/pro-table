<template>
  <div class="table-test-page">
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
          custom-id="pro-table-test_3"
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
    field: 'deptId',
    options: deptEnum,
  },
  {
    label: '账号',
    field: 'username',
  },
  {
    label: '姓名',
    field: 'nickName',
  },
    {
    type: 'select',
    label: '性别',
    field: 'gender',
    options: genderEnum,
  },
  {
    label: '邮箱',
    field: 'email',
  },
  {
    label: '手机号',
    field: 'phone',
  },
  {
    label: '工号',
    field: 'jobNo',
  },
  {
    label: '登录IP',
    field: 'loginIp',
  },

  {
    type: 'select',
    label: '注册来源',
    field: 'registerSource',
    options: sourceEnum,
  },
  {
    type: 'select',
    label: '角色',
    field: 'roleCode',
    options: roleEnum,
  },
  {
    type: 'select',
    label: '状态',
    field: 'status',
    options: statusEnum,
  },
  {
    type: 'datetimerange',
    label: '创建时间',
    field: ['createTimeStart', 'createTimeEnd'],
    defaultShortcut: 'currentYear',
  },
  {
    type: 'datetimerange',
    label: '更新时间',
    field: ['updateTimeStart', 'updateTimeEnd'],
    defaultShortcut: 'currentYear',
  },
  {
    label: '创建人',
    field: 'creator',
  },
  {
    label: '更新人',
    field: 'updater',
  },
])


// 列表字段_1
const columns_1 = computed<TableColumnItem[]>(() => [
  {
    label: '账号',
    field: 'username',
    minWidth: 140,
    fixed: 'left',
  },
  {
    label: '姓名',
    field: 'nickName',
    minWidth: 120,
  },
  {
    label: '手机号',
    field: 'phone',
    width: 140,
  },
  {
    label: '邮箱',
    field: 'email',
    minWidth: 180,
  },
  {
    label: '性别',
    field: 'gender',
    options: genderEnum,
    width: 90,
  },
  {
    label: '工号',
    field: 'jobNo',
    width: 110,
  },
])



// 列表字段_2
const columns_2 = computed<TableColumnItem[]>(() => [
  {
    label: '姓名',
    field: 'nickName',
    minWidth: 120,
  },
  {
    label: '登录IP',
    field: 'loginIp',
    minWidth: 140,
  },
  {
    label: '注册来源',
    field: 'registerSource',
    options: sourceEnum,
    minWidth: 120,
  },
  {
    label: '部门',
    field: 'deptId',
    options: deptFlatEnum,
    width: 120,
  },
  {
    label: '角色',
    field: 'roleCode',
    options: roleEnum,
    width: 140,
  },
  {
    label: '状态',
    field: 'status',
    options: statusEnum,
    tagTypeMap: {
      1: 'success',
      0: 'danger',
      default: 'info',
    },
    width: 100,
  },
  {
    label: '最近登录时间',
    field: 'lastLoginTime',
    width: 180,
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
  },
  {
    label: '创建时间',
    field: 'createTime',
    width: 180,
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
  },
  {
    label: '更新时间',
    field: 'updateTime',
    width: 180,
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
  },
  {
    label: '创建人',
    field: 'creator',
    width: 100,
  },
  {
    label: '更新人',
    field: 'updater',
    width: 100,
  },
  {
    label: '备注',
    field: 'remark',
    minWidth: 220,
    showOverflowTooltip: false,
  },
])


/**
 * 搜索条件参数变更触发查询事件
 * @param newFilterParam 新的搜索过滤条件参数
 */
const onFilterQuery = (filterParam) => {
  ProTableRef_1.value?.filterQuery(filterParam)
  ProTableRef_2.value?.filterQuery(filterParam)
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
