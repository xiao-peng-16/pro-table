<template>
  <el-table-column
      v-if="item.visible ?? true"
      v-bind="item"
      :prop="item.prop"
      :formatter="item.render"
      :renderHeader="item.renderHeader"
      :show-overflow-tooltip="true"
  >
    <!-- 多级表头树形结构 -->
    <template v-if="item.children" #default="{ row, column, cellValue, $index }">
      <TableColumn v-for="(children, index) in item.children" :item=children>
          <!-- 插槽透传 -->
          <template v-for="itemSlot in getTableColumnSlots(children)" :key="itemSlot" v-slot:[itemSlot]="temp">
            <slot :name="itemSlot" v-bind="temp"></slot>
          </template>
      </TableColumn>
    </template>
    <template v-else-if="item.slot" #default="{ row, column, cellValue, $index }">
      <slot :name="item.slot" :row="row" :column="column" :cellValue="cellValue" :index="$index"></slot>
    </template>

    <!-- 表头插槽透传 -->
    <template v-if="item.slotHeader" #header="{ column, $index }">
      <slot :name="item.slotHeader" :row="null" :column="column" :cellValue="null" :index="$index"></slot>
    </template>
    <!-- 表头label Tooltip弹框提示 -->
    <template v-else-if="item.labelTooltip && !(item.slotHeader && item.renderHeader)" #header="{ column, $index }">
      <el-tooltip placement="top" effect="dark" :content="item.labelTooltip" >
        <span style="cursor: pointer;">{{ item.label }}</span>
      </el-tooltip>
    </template>

  </el-table-column>
</template>

<script setup lang="ts" name="TableColumn">
  import { ElTableColumn, ElTooltip } from "element-plus";
  import { TableColumnItem } from '@/components/base/ProTable'
  import { getTableColumnSlots } from "@/components/base/ProTable/utils"
  const props = withDefaults(
    defineProps<{
      item: TableColumnItem,
    }>(),
    {
      item: () => null,
    }
  )
</script>


<style scoped>
</style>
