import { configureStore } from "@reduxjs/toolkit";
import { getDataReducer } from "./getData";

export const store = configureStore({
    reducer:{
        getData: getDataReducer
    }
})
