<template>
  <div class="p-pagination">
    <el-pagination
        ref="ElPaginationRef"
        v-model:current-page="pageParam.pageNum"
        v-model:page-size="pageParam.pageSize"
        :total="props.total"
        :size="proTableGlobalConfig?.proTableSize ?? 'default'"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        v-bind="attrs"
        :page-sizes="proTableGlobalConfig.pageSizes"
        :background="showBackground()"
        :layout="showLayout()"
    />
  </div>
</template>

<script setup lang="ts">
  import '../style/index.scss'
  import { reactive, ref, useAttrs} from "vue";
  import { ElPagination } from "element-plus";
  import { PageParam, ProTableGlobalConfig } from '@/components/base/ProTable/types'
  import { getInitPageParam } from '@/components/base/ProTable/components/CustomView/utils/useGlobalConfig'
  const attrs = useAttrs()
  const props = defineProps<{
    // 数据总行数
    total: number
    // ProTable全局配置
    proTableGlobalConfig: ProTableGlobalConfig
  }>()
  const emit = defineEmits<{
    (e: 'queryPage', pageParams)
  }>()

  const ElPaginationRef = ref<InstanceType<typeof ElPagination>>()


  // 分页参数初始值
  const initPageParam = getInitPageParam()
  // 分页参数
  const pageParam: PageParam = reactive({...initPageParam})


  // 查询事件
  const queryPage = () => {
    emit('queryPage', pageParam)
  }


  // 分页页数变更事件
  const handleCurrentChange = (current: number) => {
    pageParam.pageNum = current
    queryPage()
  }


  // 分页size变更事件
  const handleSizeChange  = (size: number) => {
    pageParam.pageNum = 1
    pageParam.pageSize = size
    queryPage()
  }


  // 重置分页参数
  const reset = (resetSize = false): PageParam => {
    pageParam.pageNum = 1
    if (resetSize) {
      pageParam.pageSize = initPageParam.pageSize
    }
    return pageParam
  }



  // 背景块
  const showBackground = () => {
    if (attrs.background || attrs.background === '') {
      return true
    }
    return !(attrs.small || attrs.small === '')
  }

  // 布局
  const showLayout = ():string => {
    if (attrs.layout) {
      return attrs.layout as string
    }
    if (attrs.small || attrs.small === '') {
      return 'total, sizes, prev, pager, next'
    }
    return 'total, sizes, prev, pager, next, jumper'
  }

  defineExpose({
    queryPage,
    reset,
  })

</script>

<style scoped>
</style>
