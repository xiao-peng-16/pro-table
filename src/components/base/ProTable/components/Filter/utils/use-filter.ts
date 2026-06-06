import { FilterItem, dateTypes, dateRangeTypes  } from '@/components/base/ProTable'
import { getDateRangeList } from '@/components/base/ProTable/utils'
import dayjs from 'dayjs'


// 初始默认值类型valueType处理
const initValueTypeHandle =  (item:FilterItem) => {
  if (item.value === undefined || item.value === null) {
    // 日期范围快捷操作
    if (dateRangeTypes.includes(item.type) && item.defaultShortcut) {
      item.value = getDateRangeList(item.defaultShortcut)
      if (item.value === undefined || item.value === null) {
        throw new Error(`[Filter] 日期范围类型[${item.type}]的[${item.label}-${item.field}] 快捷日期[${item.defaultShortcut}]未匹配 \n当前FilterItem=${JSON.stringify(item)}`)
      }
    }
  }
}


/**
 * 处理日期数据
 * @param value 
 * @param timeTpye 
 * @returns 
 */
const handleDate = (value: Date | string, timeTpye: 'start' | 'end' = 'start'): string => {
  if (value instanceof Date) {
    value = dayjs(value).format('YYYY-MM-DD HH:mm:ss')
  } else if (typeof value === 'string'){
    const maxLength = 19;
    value = value.replace("T", "");
    if (value.length > maxLength) {
      value = value.substring(0, maxLength);
    } else if (value.length == 'YYYY-MM-DD'.length) {
      value = value + (timeTpye === 'start' ? " 00:00:00" : ' 23:59:59');
    } else if (value.length == 'YYYY-MM-DD HH'.length) {
      value = value +  (timeTpye === 'start' ? ":00:00" : ':59:59');
    } else if (value.length == 'YYYY-MM-DD HH:mm'.length) {
      value = value +  (timeTpye === 'start' ? ":00" : ':59');
    }
  }
  return value
}

/**
 * 数据转换
 * @param item 
 * @param value 
 * @param timeTpye 时间范围类型时，该字段为开始时间还是结束时间
 */
const convertValue = (item:FilterItem, value:any, timeTpye: 'start' | 'end' = 'start') => {
  // 日期范围
  if (dateRangeTypes.includes(item.type)) {
    if (value instanceof Date) {
      if (item.type === 'yearrange') {
        value = timeTpye === 'start' ? dayjs(value).startOf('year').format('YYYY-MM-DD HH:mm:ss') : dayjs(value).endOf('year').format('YYYY-MM-DD HH:mm:ss')
      } else if (item.type === 'monthrange') {
        value = timeTpye === 'start' ? dayjs(value).startOf('month').format('YYYY-MM-DD HH:mm:ss') : dayjs(value).endOf('month').format('YYYY-MM-DD HH:mm:ss')
      } else if (item.type === 'daterange') {
        value = timeTpye === 'start' ? dayjs(value).startOf('day').format('YYYY-MM-DD HH:mm:ss') : dayjs(value).endOf('day').format('YYYY-MM-DD HH:mm:ss')
      } else {
        value = dayjs(value).format('YYYY-MM-DD HH:mm:ss')
      }
      // 日期格式化  如果指定了格式化
      if (item.dateFormat) {
        value = dayjs(value).format(item.dateFormat)
      }
    } else if (typeof value === 'string'){
      value = handleDate(value, timeTpye)
    }
  } else if (dateTypes.includes(item.type)) {
    if (Array.isArray(value)) {
      value = value.map(item => handleDate(item))
    } else {
      value = handleDate(value)
    }
  }
  return value
}


/**
 * 获取Filter参数初始值
 * @param list 
 * @returns 
 */
export const getInitFilterParam = (list:FilterItem[]):any => {
  const initFilterParam = {}
  list.forEach(item => {
    initValueTypeHandle(item)
    if (item.value) {
      if (typeof item.field === 'string') {
        initFilterParam[item.field] = convertValue(item, item.value)
      } else if (Array.isArray(item.field) && item.field.length != 0) {
        if (!Array.isArray(item.value) || item.field.length != item.value.length) {
          throw new Error(`[Filter] 日期范围类型[${item.type}]的[${item.label}-${item.field}]field数组和value数组length需保持一致 \n当前FilterItem=${JSON.stringify(item)}`)
        }
        for (let index in item.field) {
          initFilterParam[item.field[index]] = convertValue(item, item.value[index], Number(index) === 0 ? 'start' : 'end')
        }
      }
    }
  })
  return initFilterParam
}


/**
 * 获取Form item field对应字段名， (因为存在日期范围类型 field和value为数组，from中绑定的field只能有一个)
 * @param list 
 */
export const getFormItemField = (item:FilterItem) => {
  if (typeof item.field === 'string') {
    return item.field
  } else if (Array.isArray(item.field)) {
    return item.field?.join('_')
  }
}


/**
 * 获取Filter Form表单初始值 (因为存在日期范围类型 field和value为数组，from中绑定的field只能有一个)
 * @param list 
 * @returns 
 */
export const getInitFilterForm = (list:FilterItem[]):object => {
  const initFilterParam = {}
  list.forEach(item => {
    initValueTypeHandle(item)
    if (item.value) {
      if (typeof item.field === 'string') {
        initFilterParam[item.field] = convertValue(item, item.value)
      } else if (Array.isArray(item.field) && item.field.length != 0) {
        // Form表单中临时用field数组第一个， 后面查询时[getFilterParam]会进行转换
        const valueList = []
        for (let index in item.field) {
          valueList.push(convertValue(item, item.value[index], Number(index) === 0 ? 'start' : 'end'))
        }
        initFilterParam[getFormItemField(item)] = convertValue(item, valueList)
      }
    }
  })
  return initFilterParam
}



/**
 * 获取Filter参数 
 * @param list 
 * @returns 
 */
export const getFilterParam = (list:FilterItem[], form:object):any => {
  const filterParam = {}
  list.forEach(item => {
    if (typeof item.field === 'string') {
      filterParam[item.field] = convertValue(item, form[item.field])
    } else if (Array.isArray(item.field) && item.field.length != 0) {
      const valueList = form[getFormItemField(item)]
      for (let index in valueList) {
        filterParam[item.field[index]] = convertValue(item, valueList[index], Number(index) === 0 ? 'start' : 'end')
      }
    }
  })
  return filterParam
}
