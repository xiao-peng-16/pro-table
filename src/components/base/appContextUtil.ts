import { App, AppContext } from 'vue'

  let appContext:AppContext 

  // 设置应用上下文
  export const setAppContext = (app: App) => {
    appContext = (app as any)._context
  }

  // 获取应用上下文
  export const getAppContext = ():AppContext =>  {
    if (!appContext) {
      throw new Error('AppContext has not been initialized. Call setAppContext first.')
    }
    return appContext
  }