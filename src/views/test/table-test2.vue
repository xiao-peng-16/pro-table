<template>
  <div class="table-test-page">
    <div style="font-size: 12px;">
      <div>搜索条件参数</div>
      <div>{{ filterForm }}</div>
    </div>

    <div style="display: flex;">
      <!-- 左侧树形结构 -->
      <div style="width: 200px;">
        <ElTree
            ref="treeEl"
            :data="deptEnum"
            highlight-current
            :expand-on-click-node="false"
            node-key="value"
            :current-node-key="filterForm.deptId"
            @node-click="onSelectMenuTree"
        >
        </ElTree>
      </div>

      <!-- 右侧表格 -->
      <ProTable
        ref="ProTableRef"
        v-model="filterForm"
        :filters="filters"
        :columns="columns"
        :get-table-data="getData"
        custom-id="pro-table-test2"
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
    </div>
  </div>

</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ProTable, FilterItem, TableColumnItem, PageResponse } from '@/components/base/ProTable'
import { deptEnum, deptFlatEnum, roleEnum, statusEnum, genderEnum, sourceEnum, queryMockUsers } from './table-test.mock.js'


const ProTableRef = ref<InstanceType<typeof ProTable>>()

const filterForm = ref({})
// 选择菜单树
const onSelectMenuTree = (node) => {
  filterForm.value.deptId = node.value
  ProTableRef.value
}


// 搜索条件
const filters = computed<FilterItem[]>(() => [
    {
    type: 'cascader',
    label: '部门',
    field: 'deptId',
    options: deptEnum,
    // 属性可透传 checkStrictly 参考Element-plus [cascader]
    props: {  
      checkStrictly: true
    }
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
    type: 'cascader',
    label: '部门',
    field: 'deptId',
    options: deptEnum,
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


// 列表字段
const columns = computed<TableColumnItem[]>(() => [
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
  {
    label: '操作',
    slot: 'column_operate', // 插槽
    fixed: 'right',
    width: 180,
  },
])

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
