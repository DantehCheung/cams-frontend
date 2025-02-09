import {createSlice} from '@reduxjs/toolkit';

const initialState = {
    items : [],
    error: null,
}

const borrowSlice = createSlice({
    name: 'borrow',
    initialState,
    reducers:{
        borrowSuccess: (state, action) => {
            state.items = action.payload;
        },
        borrowFailure: (state, action) => {
            state.error = action.payload;
        },

    } // reducers
});

// export action creators
export const {  borrowSuccess, borrowFailure} = borrowSlice.actions;
export default borrowSlice.reducer;