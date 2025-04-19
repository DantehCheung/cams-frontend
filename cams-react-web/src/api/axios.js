// api/axios.js
import axios from 'axios';

const baseurl = `${window.location.origin.replace(':5173', ':8787')}/api/`;


// Create an Axios instance that directly connects to the SpringBoot backend
const axiosInstance = axios.create({
  baseURL: `${baseurl}`,  // Direct connection to SpringBoot server
  timeout: 10000,
  withCredentials: true, // Enable cookies for secure auth
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Global token variables (stored in memory, not localStorage)
let authToken = null;
let refreshToken = null; // 新增變數來存儲 refreshToken

// 修改 setAuthToken 函數以接受 refreshToken 參數
export const setAuthToken = (token, newRefreshToken = null) => {
  authToken = token;
  
  // 如果提供了 refreshToken，也進行更新
  if (newRefreshToken !== null) {
    refreshToken = newRefreshToken;
  }
  
  // When token is set, update axios default headers
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

// 導出一個函數，允許直接從外部取得當前的 refreshToken
export const getAuthTokens = () => {
  return { authToken };
};

// 在 AuthContext 中根據需要更新令牌的函數
export const updateAuthTokens = (token, newRefreshToken) => {
  authToken = token;
  refreshToken = newRefreshToken;
  
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

// 更新攔截器中的刷新邏輯
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // 添加詳細日誌來追蹤錯誤
    console.log('攔截到錯誤:', error.response?.status, error.response?.data);
    
    // 檢查是否為 E10 錯誤代碼 (Token Invalid)
    const isE10Error = error.response?.data?.errorCode === "E10" || 
                       (error.response?.data && JSON.stringify(error.response.data).includes('"errorCode":"E10"'));
    
    console.log('是否為 E10 錯誤:', isE10Error);
    
    // 如果是 401 錯誤或者 E10 錯誤，且尚未嘗試刷新令牌
    if ((error.response?.status === 401 || isE10Error) && !originalRequest._retry && refreshToken) {
      console.log('開始嘗試刷新令牌');
      originalRequest._retry = true;
      
      try {
        // 只發送 refreshToken
        const refreshResponse = await axios.post(
          `${baseurl}refresh-token`, 
          { refreshToken: refreshToken },
          { withCredentials: true }
        );
        
        console.log('刷新令牌響應:', refreshResponse.data);
        
        if (refreshResponse.data && refreshResponse.data.token) {
          // 更新內存中的令牌，保留原有的 refreshToken
          setAuthToken(refreshResponse.data.token);
          console.log('令牌已刷新，正在重試原始請求');
          
          // 重試原始請求
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('令牌刷新失敗:', refreshError.response?.data || refreshError);
        // 清除令牌
        setAuthToken(null);
      }
    }
    console.error('API Error:', error.response?.data || error);
    return Promise.reject(error);
  }
);

export default axiosInstance;