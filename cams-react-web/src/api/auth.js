import axiosInstance from './axios';
import { PAGE_PERMISSIONS, ACCESS_LEVELS } from './index';

// 現有功能
export const login = async (credentials) => {
  try {
    const response = await axiosInstance.post('loginbypw', credentials);
    if (response.data && !response.data.errorCode) {
      // 登入成功，儲存權限資訊
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      // 儲存使用者資訊
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      
      // 儲存權限級別和頁面訪問權限 (確保以數值形式儲存)
      const accessLevel = response.data.accessLevel !== undefined ? Number(response.data.accessLevel) : ACCESS_LEVELS.GUEST;
      localStorage.setItem('accessLevel', accessLevel);
      
      const accessPage = response.data.accessPage !== undefined ? Number(response.data.accessPage) : 0;
      localStorage.setItem('accessPage', accessPage);
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};



export const refreshToken = async () => {
  const response = await axiosInstance.post('refresh-token');
  return response.data;
};

export const logout = () => {
  // 清除所有授權資訊
  localStorage.removeItem('authToken');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('accessLevel');
  localStorage.removeItem('accessPage');
  localStorage.removeItem('pendingConfirm');
  return axiosInstance.post('logout');
};

// 新增的權限控制功能
export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  // Stronger check - ensure token exists AND is not empty/null/undefined
  return !!token && token.length > 0;
};

export const getAccessLevel = () => {
  const level = localStorage.getItem('accessLevel');
  // Ensure we're working with numbers, not strings
  return level ? parseInt(level, 10) : null;
};

export const getAccessPage = () => {
  const page = localStorage.getItem('accessPage');
  // Ensure we're working with numbers, not strings
  return page ? parseInt(page, 10) : null;
};

// 檢查使用者是否有特定頁面的訪問權限
export const hasPagePermission = (pagePermission) => {
  if (!isAuthenticated()) return false;
  
  const userPageAccess = getAccessPage();
  if (userPageAccess === null) return false;
  
 //  console.log('User page access:', userPageAccess, 'Required bit:', pagePermission, 'Result:', (userPageAccess & pagePermission) !== 0);
  return (userPageAccess & pagePermission) !== 0;
};

// 檢查使用者角色權限級別
export const hasRolePermission = (requiredLevel) => {
  if (!isAuthenticated()) return false;
  
  const userLevel = getAccessLevel();
  if (userLevel === null) return false;
  
  // console.log('User level:', userLevel, 'Required level:', requiredLevel);
  // 較小的值代表更高權限
  return userLevel <= requiredLevel;
};

// 綜合檢查頁面和角色權限
export const hasPermission = (requiredLevel, requiredPageBit) => {
  // 檢查身份驗證
  if (!isAuthenticated()) return false;
  
  // 檢查角色權限
  if (!hasRolePermission(requiredLevel)) return false;
  
  // 檢查頁面權限
  if (requiredPageBit !== 0 && !hasPagePermission(requiredPageBit)) return false;
  
  return true;
};

// 特定檢查是否可以訪問借閱頁面
export const canAccessBorrowPage = () => {
  return hasPermission(ACCESS_LEVELS.STUDENT, PAGE_PERMISSIONS.BORROW);
};