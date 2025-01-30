import Mock from "mockjs";
import assetApi from "./mockServerData/asset";

// intercept all requests to /api/users
Mock.mock(/home\/getData/, assetApi.getSchoolAssetData);
