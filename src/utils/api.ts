import request from '@/utils/request'

export const loginFun = (data: any) => {
	return request.post(`https://sdicm.foton.com.cn/ollinapp/basic/user/login`,data)
}

/** 
 * @description 获取地图配置文件 
 * 
*/
export const getMapConfigJson = () => {
	return request.get(`mapConfig.json`)
}