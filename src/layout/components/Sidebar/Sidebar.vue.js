import '../../style/sidebar.scss';
import { computed, ref, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElCascader, ElScrollbar } from "element-plus";
import SidebarItem from './SidebarItem.vue';
import { useAppStore } from '@/store/modules/app';
import { usePermissionStore } from '@/store/modules/permission';
const appStore = useAppStore();
// 菜单折叠
const collapse = computed(() => appStore.getCollapse);
const { push, currentRoute } = useRouter();
// 激活的菜单栏
const activeMenu = computed(() => {
    const { fullPath } = currentRoute.value;
    return fullPath;
});
const permissionStore = usePermissionStore();
const menuRouters = permissionStore.getMenuRouters;
const cascaderPath = ref();
const onSelectMenu = (path) => {
    push({ path });
    nextTick(() => {
        cascaderPath.value = undefined;
    });
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar-wrapper" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "logo-wrapper" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "img-wrapper" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    src: "@/assets/imgs/logo.png",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (!__VLS_ctx.collapse) }, null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "menu-select-wrapper" },
});
const __VLS_0 = {}.ElCascader;
/** @type {[typeof __VLS_components.ElCascader, typeof __VLS_components.elCascader, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.cascaderPath),
    options: (__VLS_ctx.menuRouters),
    filterable: true,
    props: ({ label: 'title', value: 'path', emitPath: false, expandTrigger: 'hover' }),
    placeholder: "搜索菜单",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.cascaderPath),
    options: (__VLS_ctx.menuRouters),
    filterable: true,
    props: ({ label: 'title', value: 'path', emitPath: false, expandTrigger: 'hover' }),
    placeholder: "搜索菜单",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onChange: (__VLS_ctx.onSelectMenu)
};
var __VLS_3;
const __VLS_8 = {}.ElScrollbar;
/** @type {[typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, typeof __VLS_components.ElScrollbar, typeof __VLS_components.elScrollbar, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    wrapClass: "scrollbar-wrapper",
}));
const __VLS_10 = __VLS_9({
    wrapClass: "scrollbar-wrapper",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.ElMenu;
/** @type {[typeof __VLS_components.ElMenu, typeof __VLS_components.elMenu, typeof __VLS_components.ElMenu, typeof __VLS_components.elMenu, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    defaultActive: (__VLS_ctx.activeMenu),
    collapse: (__VLS_ctx.collapse),
}));
const __VLS_14 = __VLS_13({
    defaultActive: (__VLS_ctx.activeMenu),
    collapse: (__VLS_ctx.collapse),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.menuRouters))) {
    /** @type {[typeof SidebarItem, ]} */ ;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent(SidebarItem, new SidebarItem({
        item: (item),
    }));
    const __VLS_17 = __VLS_16({
        item: (item),
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
}
var __VLS_15;
var __VLS_11;
/** @type {__VLS_StyleScopedClasses['sidebar-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['logo-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['img-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['menu-select-wrapper']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            ElCascader: ElCascader,
            ElScrollbar: ElScrollbar,
            SidebarItem: SidebarItem,
            collapse: collapse,
            activeMenu: activeMenu,
            menuRouters: menuRouters,
            cascaderPath: cascaderPath,
            onSelectMenu: onSelectMenu,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
