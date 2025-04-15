import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    items:[],
    error:null
};

const returnSlice = createSlice({
    name:'return',
    initialState,
    reducers:{

        returnSuccess:(state, action) => {
            state.items = action.payload;
        },

        returnError: (state,action) => {
            state.error = action.payload;
        },
        
    }
});

export const {returnSuccess, returnError} = returnSlice.actions;
export default returnSlice.reducer;