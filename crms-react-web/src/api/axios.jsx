import axios from "axios";

const baseUrl = "/api";

// axios second encapsulation core
class HttpRequest {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  getInsideConfig() {
    const config = {
      baseURL: this.baseUrl,
      header: {},
    };
    return config;
  }

  interceptors(instance) {
    // add request interceptors
    instance.interceptors.request.use(
      function (config) {
        // before send request operation
        return config;
      },
      function (error) {
        // when request error
        return Promise.reject(error);
      }
    );

    // add response interceptors
    instance.interceptors.response.use(
      function (response) {
        // when get response data
        return response;
      },
      function (error) {
        console.log(error, "error");
        // when get response error
        return Promise.reject(error);
      }
    );
  }

  request(options) {
    options = { ...this.getInsideConfig(), ...options };
    // create axios instance
    const instance = axios.create();
    this.interceptors(instance);
    return instance(options);
  }
}

export default new HttpRequest(baseUrl);
