import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    items: [],
    error: null
};

const checkSlice = createSlice({
    name: 'check',
    initialState,
    reducers: {
        checkSuccess: (state, action) => {
            state.items = action.payload;
        },
        checkError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const {checkSuccess, checkError} = checkSlice.actions;
export default checkSlice.reducer;