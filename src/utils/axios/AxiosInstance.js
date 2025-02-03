import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AxiosInstance = (params, options) => {
    const instance = axios.create({
        baseURL : BASE_URL, 
        withCredentials: true,
        ...options
    })

    // 요청시 Authorization 헤더에 JWT가 추가
    // instance.interceptors.request.use(
    //     (config) => {
    //         const token = localStorage.getItem('jwtToken');
    //         if (token) {
    //         config.headers['Authorization'] = `Bearer ${token}`;
    //         }
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
                // console.log('Token expired, refreshing token...');
                // 새 토큰을 요청하기 위한 리프레시 토큰
                // try {
                //     const refreshToken = localStorage.getItem('refreshToken'); 
                //     const response = await Axios.POST('/refresh-token', {
                //         RefreshToken: refreshToken,
                //     });

                //     if(response.data.Result !== "Success") {
                //         return Promise.reject(error);
                //     }

                //     const newToken = response.data.Token;
                //     localStorage.setItem('jwtToken', newToken);

                //     // 이전 요청 다시 시도
                //     error.config.headers['Authorization'] = `Bearer ${newToken}`;
                //     return instance.request(error.config);
                // } catch (refreshError) {
                //     // console.error('Failed to refresh token:', refreshError);
                //     // 로그아웃 처리 또는 사용자 알림
                // }
            }
            return Promise.reject(error);
        }
      );

    return instance;
}

  
export default AxiosInstance;