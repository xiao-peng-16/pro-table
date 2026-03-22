import '../../style/theme-setting.scss';
import { ref, computed } from 'vue';
import { useAppStore } from '@/store/modules/app';
import { ElDrawer, ElDivider, ElRadioGroup, ElRadio, ElSwitch, ElButton } from "element-plus";
const appStore = useAppStore();
const drawerVisible = ref(false);
// 开启抽屉
const openDrawer = () => {
    drawerVisible.value = true;
};
// 系统主题
const systemTheme = computed(() => appStore.getSystemTheme);
const onChangeSystemTheme = (systemTheme) => {
    appStore.setSystemTheme(systemTheme);
};
// fixed固定头部工具栏和tag标签页
const fixedHeader = computed(() => appStore.getFixedHeader);
// 切换fixed固定头部工具栏和tag标签页
const toggleFixedHeader = (show) => {
    appStore.setFixedHeader(show);
};
// 菜单折叠Icon
const collapseIcon = computed(() => appStore.getCollapseIcon);
// 切换菜单折叠Icon
const toggleCollapseIcon = (show) => {
    appStore.setCollapseIcon(show);
};
// 面包屑
const breadcrumb = computed(() => appStore.getBreadcrumb);
// 切换面包屑
const toggleBreadcrumb = (show) => {
    appStore.setBreadcrumb(show);
    appStore.setBreadcrumbIcon(show);
};
// 面包屑Icon
const breadcrumbIcon = computed(() => appStore.getBreadcrumbIcon);
// 切换面包屑Icon
const toggleBreadcrumbIcon = (show) => {
    appStore.setBreadcrumbIcon(show);
};
// 标签页
const tagsView = computed(() => appStore.getTagsView);
// 切换面包屑
const toggleTagsView = (show) => {
    appStore.setTagsView(show);
    appStore.setTagsViewIcon(show);
};
// 面包屑Icon
const tagsViewIcon = computed(() => appStore.getTagsViewIcon);
// 切换标签页Icon
const toggleTagsViewIcon = (show) => {
    appStore.setTagsViewIcon(show);
};
// 重置设置
const resetSetting = () => {
    appStore.$reset();
};
const __VLS_exposed = {
    openDrawer
};
defineExpose(__VLS_exposed);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
const __VLS_0 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "theme-setting-wrapper" },
    modelValue: (__VLS_ctx.drawerVisible),
    title: "项目设置",
    size: "350px",
    zIndex: (100),
}));
const __VLS_2 = __VLS_1({
    ...{ class: "theme-setting-wrapper" },
    modelValue: (__VLS_ctx.drawerVisible),
    title: "项目设置",
    size: "350px",
    zIndex: (100),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_4 = {};
__VLS_3.slots.default;
const __VLS_5 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({}));
const __VLS_7 = __VLS_6({}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_8.slots.default;
var __VLS_8;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "system-theme-wrapper" },
});
const __VLS_9 = {}.ElRadioGroup;
/** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.systemTheme),
}));
const __VLS_11 = __VLS_10({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.systemTheme),
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
let __VLS_13;
let __VLS_14;
let __VLS_15;
const __VLS_16 = {
    onChange: (__VLS_ctx.onChangeSystemTheme)
};
__VLS_12.slots.default;
const __VLS_17 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    value: "system-theme-default",
}));
const __VLS_19 = __VLS_18({
    value: "system-theme-default",
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
__VLS_20.slots.default;
var __VLS_20;
const __VLS_21 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    value: "system-theme-light",
}));
const __VLS_23 = __VLS_22({
    value: "system-theme-light",
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
__VLS_24.slots.default;
var __VLS_24;
const __VLS_25 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    value: "system-theme-dark",
}));
const __VLS_27 = __VLS_26({
    value: "system-theme-dark",
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
__VLS_28.slots.default;
var __VLS_28;
var __VLS_12;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-item-wrapper" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_29 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.fixedHeader),
}));
const __VLS_31 = __VLS_30({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.fixedHeader),
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
let __VLS_33;
let __VLS_34;
let __VLS_35;
const __VLS_36 = {
    onChange: (__VLS_ctx.toggleFixedHeader)
};
var __VLS_32;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-item-wrapper" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_37 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.collapseIcon),
}));
const __VLS_39 = __VLS_38({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.collapseIcon),
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
let __VLS_41;
let __VLS_42;
let __VLS_43;
const __VLS_44 = {
    onChange: (__VLS_ctx.toggleCollapseIcon)
};
var __VLS_40;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-item-wrapper" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_45 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.breadcrumb),
}));
const __VLS_47 = __VLS_46({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.breadcrumb),
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
let __VLS_49;
let __VLS_50;
let __VLS_51;
const __VLS_52 = {
    onChange: (__VLS_ctx.toggleBreadcrumb)
};
var __VLS_48;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-item-wrapper" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_53 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.breadcrumbIcon),
}));
const __VLS_55 = __VLS_54({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.breadcrumbIcon),
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
let __VLS_57;
let __VLS_58;
let __VLS_59;
const __VLS_60 = {
    onChange: (__VLS_ctx.toggleBreadcrumbIcon)
};
var __VLS_56;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-item-wrapper" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_61 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.tagsView),
}));
const __VLS_63 = __VLS_62({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.tagsView),
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
let __VLS_65;
let __VLS_66;
let __VLS_67;
const __VLS_68 = {
    onChange: (__VLS_ctx.toggleTagsView)
};
var __VLS_64;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "setting-item-wrapper" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_69 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.tagsViewIcon),
}));
const __VLS_71 = __VLS_70({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.tagsViewIcon),
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
let __VLS_73;
let __VLS_74;
let __VLS_75;
const __VLS_76 = {
    onChange: (__VLS_ctx.toggleTagsViewIcon)
};
var __VLS_72;
const __VLS_77 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({}));
const __VLS_79 = __VLS_78({}, ...__VLS_functionalComponentArgsRest(__VLS_78));
const __VLS_81 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
    ...{ 'onClick': {} },
    type: "danger",
    ...{ style: {} },
}));
const __VLS_83 = __VLS_82({
    ...{ 'onClick': {} },
    type: "danger",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_82));
let __VLS_85;
let __VLS_86;
let __VLS_87;
const __VLS_88 = {
    onClick: (__VLS_ctx.resetSetting)
};
__VLS_84.slots.default;
var __VLS_84;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['theme-setting-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['system-theme-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['setting-item-wrapper']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ElDrawer: ElDrawer,
            ElDivider: ElDivider,
            ElRadioGroup: ElRadioGroup,
            ElRadio: ElRadio,
            ElSwitch: ElSwitch,
            ElButton: ElButton,
            drawerVisible: drawerVisible,
            systemTheme: systemTheme,
            onChangeSystemTheme: onChangeSystemTheme,
            fixedHeader: fixedHeader,
            toggleFixedHeader: toggleFixedHeader,
            collapseIcon: collapseIcon,
            toggleCollapseIcon: toggleCollapseIcon,
            breadcrumb: breadcrumb,
            toggleBreadcrumb: toggleBreadcrumb,
            breadcrumbIcon: breadcrumbIcon,
            toggleBreadcrumbIcon: toggleBreadcrumbIcon,
            tagsView: tagsView,
            toggleTagsView: toggleTagsView,
            tagsViewIcon: tagsViewIcon,
            toggleTagsViewIcon: toggleTagsViewIcon,
            resetSetting: resetSetting,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
});
; /* PartiallyEnd: #4569/main.vue */
