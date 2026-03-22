import axios from 'axios';
import { ElMessage } from 'element-plus';
// 从环境变量读取接口前缀；未配置时回退到 /api
const BASE_API = import.meta.env.VITE_APP_BASE_API || '/api';
// Token key
const TOKEN_KEY = 'Authorization';
// 请求成功状态码
const SUCCESS_CODE = 0;
const axiosInstance = axios.create({
    // 请求URL公共前缀（开发/生产环境可通过 .env.* 配置切换）
    baseURL: BASE_API,
    // 超时
    timeout: 10000
});
// 请求默认Content-Type
axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';
/**
 * 创建请求
 * @param method        请求方法
 * @param url           接口当前
 * @param config        axios配置
 * @returns
 */
const createRequest = (method, url, config = {}) => {
    const paramKey = ['post', 'put', 'patch'].includes(method) ? 'data' : 'params';
    return (req) => {
        const { headers, responseType } = config;
        return axiosInstance.request({
            url: url,
            method,
            [paramKey]: req || {},
            responseType: responseType,
            headers: {
                [TOKEN_KEY ?? 'Authorization']: getToken() ?? '',
                ...headers
            },
            ...config,
        });
    };
};
// 响应拦截器
axiosInstance.interceptors.response.use((response) => {
    if (response?.config?.responseType === 'blob') {
        // 如果是文件流，直接过
        return response;
    }
    else {
        const code = response?.data?.code;
        if (code === SUCCESS_CODE) {
            return response.data;
        }
        else {
            const message = response?.data?.message ?? '请求失败，请稍后重试';
            ElMessage.error(message);
            if (code === 401) {
                // const userStore = useUserStoreWithOut()
                // userStore.logout()
            }
            return Promise.reject(new Error(message));
        }
    }
}, error => {
    console.log('err' + error);
    let { message } = error;
    if (message == "Network Error") {
        message = "后端接口连接异常";
    }
    else if (message.includes("timeout")) {
        message = "系统接口请求超时";
    }
    else if (message.includes("Request failed with status code")) {
        message = "系统接口" + message.slice(-3) + "异常";
    }
    ElMessage({ message: message, type: 'error', duration: 5 * 1000 });
    return Promise.reject(error);
});
// 获取Token
export const getToken = () => {
    return window.localStorage.getItem('token');
};
// 设置Token
export const setToken = (token) => {
    return window.localStorage.setItem('token', token);
};
export default {
    get: (url, config) => {
        return createRequest('get', url, config);
    },
    post: (url, config) => {
        return createRequest('post', url, config);
    },
    delete: (url, config) => {
        return createRequest('delete', url, config);
    },
    put: (url, config) => {
        return createRequest('put', url, config);
    },
};
