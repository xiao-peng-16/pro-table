/// <reference types="vite/client" />

/**
 * Vite 注入到 import.meta.env 的环境变量类型声明。
 * 只有以 VITE_ 开头的变量才会暴露给前端代码。
 */
interface ImportMetaEnv {
  /**
   * 接口基础地址
   * - 开发环境通常是 /api（走 Vite 代理）
   * - 生产环境通常是完整域名
   */
  readonly VITE_APP_BASE_API: string
}

/**
 * import.meta 的类型补充：用于让 TS 正确识别 env 字段。
 */
interface ImportMeta {
  readonly env: ImportMetaEnv
}

/**
 * .vue 单文件组件模块声明。
 * 让 TS 能把 .vue 文件当作 Vue 组件模块进行类型推断。
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}
