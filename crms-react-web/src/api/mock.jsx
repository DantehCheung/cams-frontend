import Mock from "mockjs";
import assetApi from "./mockServerData/asset";
import permissionApi from "./mockServerData/permission";

// intercept all requests to /api/users
Mock.mock(/home\/getData/, assetApi.getSchoolAssetData);

Mock.mock(/permission\/getMenu/,'post',permissionApi.)
