import { configureStore } from "@reduxjs/toolkit";
import TabReducer from "./modules/tabStore";
import borrowReducer from './modules/borrowSlice';
import returnReducer from './modules/returnSlice';
import checkReducer from './modules/checkSlice';
// combine all modules here
export default configureStore({
  reducer: {
    // define the name by u -> tab
    tab: TabReducer,
    borrow: borrowReducer,
    return: returnReducer,
    check: checkReducer,
  },
});
