import { reactive } from 'vue';
import { eachTree, treeMap, filter } from '@/utils/tree';
/**
 * @deprecated 不推荐使用，感觉过于繁琐，不是很灵活 可能会在某个版本中删除
 */
export const useCrudSchemas = (crudSchema) => {
    // 所有结构数据
    const allSchemas = reactive({
        searchSchema: [],
        tableColumns: [],
        formSchema: [],
        detailSchema: []
    });
    const searchSchema = filterSearchSchema(crudSchema);
    // @ts-ignore
    allSchemas.searchSchema = searchSchema || [];
    const tableColumns = filterTableSchema(crudSchema);
    allSchemas.tableColumns = tableColumns || [];
    const formSchema = filterFormSchema(crudSchema);
    allSchemas.formSchema = formSchema;
    const detailSchema = filterDescriptionsSchema(crudSchema);
    allSchemas.detailSchema = detailSchema;
    return {
        allSchemas
    };
};
// 过滤 Search 结构
const filterSearchSchema = (crudSchema) => {
    const searchSchema = [];
    const length = crudSchema.length;
    for (let i = 0; i < length; i++) {
        const schemaItem = crudSchema[i];
        if (schemaItem.search?.hidden === true) {
            continue;
        }
        // 判断是否隐藏
        const searchSchemaItem = {
            component: schemaItem?.search?.component || 'Input',
            ...schemaItem.search,
            field: schemaItem.field,
            label: schemaItem.search?.label || schemaItem.label
        };
        searchSchema.push(searchSchemaItem);
    }
    return searchSchema;
};
// 过滤 table 结构
const filterTableSchema = (crudSchema) => {
    const tableColumns = treeMap(crudSchema, {
        conversion: (schema) => {
            if (!schema?.table?.hidden) {
                return {
                    ...schema,
                    ...schema.table
                };
            }
        }
    });
    // 第一次过滤会有 undefined 所以需要二次过滤
    return filter(tableColumns, (data) => {
        if (data.children === void 0) {
            delete data.children;
        }
        return !!data.field;
    });
};
// 过滤 form 结构
const filterFormSchema = (crudSchema) => {
    const formSchema = [];
    const length = crudSchema.length;
    for (let i = 0; i < length; i++) {
        const formItem = crudSchema[i];
        const formSchemaItem = {
            component: formItem?.form?.component || 'Input',
            ...formItem.form,
            field: formItem.field,
            label: formItem.form?.label || formItem.label
        };
        formSchema.push(formSchemaItem);
    }
    return formSchema;
};
// 过滤 descriptions 结构
const filterDescriptionsSchema = (crudSchema) => {
    const descriptionsSchema = [];
    eachTree(crudSchema, (schemaItem) => {
        // 判断是否隐藏
        if (!schemaItem?.detail?.hidden) {
            const descriptionsSchemaItem = {
                ...schemaItem.detail,
                field: schemaItem.field,
                label: schemaItem.detail?.label || schemaItem.label
            };
            // 删除不必要的字段
            delete descriptionsSchemaItem.hidden;
            descriptionsSchema.push(descriptionsSchemaItem);
        }
    });
    return descriptionsSchema;
};
