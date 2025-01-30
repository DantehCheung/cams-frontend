import Mock from "mockjs";
import homeApi from "./mockServerData/home";
import testApi from "./mockServerData/test";

// intercept all requests to /api/users
Mock.mock(/home\/getData/, homeApi.getStatisticalData);
