export const componentConfig = {
    // Dialog 弹框
    dialog: {
        draggable: true,            // elementPlus 是否启用可拖拽功能
        lockScroll: true,           // elementPlus 是否在 Dialog 出现时将 body 滚动锁定
        destroyOnClose: true,       // elementPlus 是否关闭 Dialog 时，销毁其中的元素
    },
    // table 表格
    table: {
        border: true,               // elementPlus 是否带有纵向边框
        stripe: true,               // elementPlus 是否为斑马纹
        showOverflowTooltip: true,  // elementPlus 是否隐藏额外内容并在单元格悬停时使用 Tooltip 显示它们
        highlightCurrentRow: true,  // elementPlus 是否要高亮当前行
    },
    // 分页
    pagination: {
        pageNumKey: 'pageNum',      // 分页参数字段名，与后端保存一直
        pageSizeKey: 'pageSize',    // 分页参数字段名，与后端保存一直
        defaultPageSize: 10,        // elementPlus 默认分页大小
        pageSizes: [10, 30, 50, 100, 200, 300, 500],    // elementPlus 每页显示个数选择器的选项设置
    }
}
