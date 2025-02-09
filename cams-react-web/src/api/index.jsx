import http from "./axios";


export const getData = () => {
  return http.request({
    url: "home/getData",
    method: "get",
    params: {},
  });
};


export const getMenu = (data) => {
  return http.request({
    url: "permission/getMenu",
    method: "post",
    data: { username, password }, // Change params to data
  });
};
