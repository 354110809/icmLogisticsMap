import axios from 'axios';//引入axios
import qs from "qs";//引入序列化对象的库

axios.create({
    baseURL: process.env.NODE_ENV === 'production' ? '' : '',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    }
})

// 声明一个axios拦截器 请求前拦截 一般用于携带token
axios.interceptors.request.use(config => {
    return config;
}, err => {
    return Promise.reject(err);
});

// 声明一个axios拦截器 请求后拦截 服务器返回结果时候判断再返回
axios.interceptors.response.use(res => {
    if (res.status === 200) {
        return res.data
    } else {
        return res
    }
}, err => {
    console.error(err)
    return err;
});
const request = {
    post(url:any, data = {}) {
        return axios.post(url, data)
    },
    get(url:any, data = {}) {
        return axios.get(url, {
            params: data
        })
    }
};
export default request