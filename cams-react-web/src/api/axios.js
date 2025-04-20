// api/axios.js
import axios from 'axios';

const baseurl = `${window.location.origin.replace(':5173', ':8787')}/api/`;


// Create an Axios instance that directly connects to the SpringBoot backend
const axiosInstance = axios.create({
  baseURL: `${baseurl}`,  // Direct connection to SpringBoot server
  timeout: 10000,
  withCredentials: true, // Enable cookies for secure auth
  headers: {
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
export const getRefreshToken = () => {
  return refreshToken ;
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
/* axiosInstance.interceptors.response.use(
  async response => {
    if (response.data.errorCode) {
      console.log(`ErrorCode detected: ${response.data.errorCode}`);
      const originalRequest = response.config;
      // 處理特定的錯誤代碼，例如 E10 或 E04
      if (response.data.errorCode === "E10" || response.data.errorCode === "E04") {
        console.log("Token expired or invalid, attempting to renew...");

        // 嘗試刷新 Token
        const refreshResponse = await axiosInstance.post("renewtoken", {
          refreshToken: refreshToken,
        });

        if (refreshResponse.data && !refreshResponse.data.errorCode) {
          // 更新新的 Token
          setAuthToken(refreshResponse.data.token, refreshResponse.data.refreshToken);

          // 更新原始請求的 Authorization 標頭
          originalRequest.data.token = refreshResponse.data.token;

          // 使用新的 Token 重試原始請求
          try {
            const retryResponse = await axiosInstance(originalRequest);
            if (retryResponse.data && !retryResponse.data.errorCode) {
              return retryResponse.data;
            } else {
              console.error("Retry request failed:", retryResponse.data);
              return { error: retryResponse.data };
            }
          } catch (retryError) {
            console.error("Retry request error:", retryError);
            return { error: retryError.message };
          }
        } else {
          console.error("Failed to renew token:", refreshResponse.data);
          return { error: refreshResponse.data };
        }
      }
    }

    // 如果沒有 errorCode，返回正常的響應
    return Promise.resolve(response);
  }, // 對於成功的響應，直接返回
  async error => {
    const originalRequest = error.config;

    // 添加詳細日誌來追蹤錯誤
    console.log('攔截到錯誤:', error.response?.status, error.response?.data);

    // 檢查是否為 E10 或 E04 錯誤代碼 (Token Invalid 或過期)
    const isTokenError = error.response?.data?.errorCode === "E10" ||
      error.response?.data?.errorCode === "E04";

    console.log('是否為 Token 錯誤:', isTokenError);

    // 如果不是 Token 錯誤，或者刷新令牌失敗，直接拒絕請求
    console.error('API Error:', error.response?.data || error);
    return Promise.reject(error);
  }
); */

export default axiosInstance;