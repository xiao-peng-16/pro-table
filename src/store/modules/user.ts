import { defineStore } from 'pinia'
import { store } from '../index'
import { loginApi } from '@/api/system/user'
import { LoginParams } from '@/api/system/user/types'

export interface UserInfo {
  name: string,
  avatar: string,
}

export interface UserState {
  token: string,
  userInfo: UserInfo,
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: undefined,
    userInfo: undefined,
  }),
  getters: {
    getToken(): string {
      return this.token
    },
    getUserInfo(): UserInfo {
      return this.userInfo
    },
  },
  actions: {
    setToken(token: string) {
      this.token = token
      // http.ts 请求接口需要使用
      window.localStorage.setItem('token', token)
    },
    // 登录
    login(loginParams: LoginParams) {
      return new Promise((resolve, reject) => {
        loginApi(loginParams).then(res => {
          console.log('res', res)
          if (res.code === 0) {
            this.setToken(res.data)
            resolve(res.data)
          } else {
            reject(res.message)
          }
        }).catch(error => {
          reject(error)
        })
      })
    },
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
    },
  },
  persist: {
    paths: ['token']
  }
})


export const useUserStoreWithOut = () => {
  return useUserStore(store)
}
