import axios from "axios";
import { Storage } from "../Storage";


const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AxiosInstance = (params, options) => {
    
    const instance = axios.create({
        baseURL : BASE_URL, 
        withCredentials: true,
        ...options
    })

    // 요청시
    // instance.interceptors.request.use(
    //     (config) => {
    //         console.log(config);
    //         // const token = localStorage.getItem('jwtToken');
    //         // if (token) {
    //         // config.headers['Authorization'] = `Bearer ${token}`;
    //         // }
    //         return config;
    //     },
    //     (error) => {
    //         return Promise.reject(error);
    //     }
    // );

    instance.interceptors.response.use(
        (response) => response,async (error) => {
            // 요청 인터셉터에서 401 에러 처리. 토큰이 만료 되었을 경우
            if (error.response && error.response.status === 401) {
                
                // 로그아웃 처리
                Storage.setSession("login", false);
                window.location.reload();
                
            }
            return Promise.reject(error);
        }
      );

    return instance;
}

  
export default AxiosInstance;