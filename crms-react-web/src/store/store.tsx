import { configureStore } from "@reduxjs/toolkit";
import TabReducer from "./reducers/tab";

export default configureStore({
  reducer: {
    // define the name by u -> tab
    tab: TabReducer,
  },
});
