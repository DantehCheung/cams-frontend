import { createSlice } from "@reduxjs/toolkit"; // createSlice create reducer

// when amend state, the state inside store through reducers to received an action
const tabSlice = createSlice({
  name: "tab",
  initialState: {
    isCollapse: false,
  },
  reducers: {
    collapseMenu: (state) => {
      state.isCollapse = !state.isCollapse;
    },
  },
});

export const { collapseMenu } = tabSlice.actions; // actions include all reducer's methods
export default tabSlice.reducer;
