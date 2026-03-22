import { defineStore } from 'pinia'

import { store } from '../index'
import { cloneDeep } from 'lodash'



import { menuRouterItem } from '@/types/menuRouterItem'
import { menuDataTest } from './menuDataTest'

export interface PermissionState {
  routers: AppRouteRecordRaw[]
  addRouters: AppRouteRecordRaw[]
  isAddRouters: boolean
  menuRouters: menuRouterItem[]
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    routers: [],
    addRouters: [],
    isAddRouters: false,
    menuRouters: []
  }),
  getters: {
    getRouters(): AppRouteRecordRaw[] {
      return this.routers
    },
    getAddRouters(): AppRouteRecordRaw[] {
      return cloneDeep(this.addRouters)
    },
    getIsAddRouters(): boolean {
      return this.isAddRouters
    },
    getMenuRouters(): menuRouterItem[] {
      // return this.menuRouters
      return menuDataTest
    },
    getCurrentMenuRouter(): menuRouterItem[] {
      // return this.menuRouters
      return menuDataTest
    }
  },
  actions: {
    generateRoutes(
      type: 'server' | 'frontEnd' | 'static',
      routers?: AppCustomRouteRecordRaw[] | string[]
    ): Promise<unknown> {
      return new Promise<void>((resolve) => {
       
        resolve()
      })
    },
    setIsAddRouters(state: boolean): void {
      this.isAddRouters = state
    },
    setmenuRouters(menuRouters: menuRouterItem[]): void {
      this.menuRouters = menuRouters
    }
  },
  persist: {
    paths: ['routers', 'addRouters', 'menuRouters']
  }
})

export const usePermissionStoreWithOut = () => {
  return usePermissionStore(store)
}
