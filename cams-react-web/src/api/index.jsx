// Export service modules as namespaces
import * as assetServiceExports from './services/asset';


// Expose services as namespaced object
export const assetService = assetServiceExports;




// Constants for access control
// 根據後端的 AccessPagePermission 定義頁面權限常數
export const PAGE_PERMISSIONS = {
  // 0-3 位
  INVENTORY_FRAGMENT: 1 << 0,            // 2^0 = 1
  MANUAL_INVENTORY_FRAGMENT: 1 << 1,     // 2^1 = 2
  SEARCH_ITEM_FRAGMENT: 1 << 2,          // 2^2 = 4
  UPDATE_ROOM_ITEM_FRAGMENT: 1 << 3,     // 2^3 = 8

  // 4-7 位
  UPDATE_ITEM_LOCATION_FRAGMENT: 1 << 4, // 2^4 = 16
  ADD_ITEM_FRAGMENT: 1 << 5,             // 2^5 = 32
  DELETE_ITEM_FRAGMENT: 1 << 6,          // 2^6 = 64
  NEW_ROOM_FRAGMENT: 1 << 7,             // 2^7 = 128

  // 8-15 位
  HOME: 1 << 8,                          // 2^8 = 256
  BORROW: 1 << 9,                        // 2^9 = 512 (等同於 BORROW_PAGE)
  RETURN: 1 << 10,                       // 2^10 = 1024
  USER_MANAGEMENT: 1 << 11,              // 2^11 = 2048
  REPORT: 1 << 12,                       // 2^12 = 4096
  CAMPUS_MANAGEMENT: 1 << 13,            // 2^13 = 8192
  ROOM_MANAGEMENT: 1 << 14,              // 2^14 = 16384
  ITEM_MANAGEMENT: 1 << 15,              // 2^15 = 32768
  
  // 16-23 位
  RFID: 1 << 16,                         // 2^16 = 65536
  USER_INFO: 1 << 17,                    // 2^17 = 131072
  CHECK: 1 << 18,                        // 2^18 = 262144
};


// 根據後端的 Permission 定義訪問級別常數
export const ACCESS_LEVELS = {
  ADMIN: 0,
  STAFF: 50,  // 假設 STAFF 權限介於 ADMIN 和 TEACHER 之間
  TEACHER: 100,
  TECHNICIAN: 100,
  STUDENT: 1000,
  USER: 1000,  // USER 等同於 STUDENT 權限
  GUEST: 10000
};