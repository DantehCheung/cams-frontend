import { configureStore } from "@reduxjs/toolkit";
import TabReducer from "./modules/tabStore";

// combine all modules here
export default configureStore({
  reducer: {
    // define the name by u -> tab
    tab: TabReducer,
  },
});
