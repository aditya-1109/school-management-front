import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiFunction } from "../api/apiFunction";
import { getAlleventsApi, getAllNewUserApi, getClassesApi, getCommunicationApi, getCourseApi, getExamApi, getFeesApi, getMyselfApi, getTimeTableApi, getUserApi, getUserByIdApi } from "../api/apis";

export const getUserByIdRedux = createAsyncThunk("getData/getUserByIdRedux", async({id})=>{
    const response = await apiFunction(getUserByIdApi, [id], {}, "get", true);
    if(response){
        return response
    }
})

export const getUserRedux = createAsyncThunk("getData/getUserRedux", async()=>{
    const response = await apiFunction(getUserApi, [], {}, "get", true);
    if(response){
        return response.users
    }
})

export const getClassesRedux = createAsyncThunk("getData/getClassesRedux", async()=>{
    const response = await apiFunction(getClassesApi, [], {}, "get", true);
     if(response){
        return response.classes
    }
})

export const getTimeTableRedux = createAsyncThunk("getData/getTimeTableRedux", async()=>{
    const response = await apiFunction(getTimeTableApi, [], {}, "get", true)
    if(response){
        return response.timeTables
    }
})

export const getExamsRedux = createAsyncThunk("getData/getExamsRedux", async()=>{
    const response = await apiFunction(getExamApi, [], {}, "get", true)
    if(response){
        return response.exams
    }
})

export const getCoursesRedux = createAsyncThunk("getData/getCoursesRedux", async()=>{
    const response = await apiFunction(getCourseApi, [], {}, "get", true)
    if(response){
        return response.courses
    }
})

export const getCommunicationRedux = createAsyncThunk("getData/getCommunicationRedux", async(type)=>{
    console.log(type)
    const response = await apiFunction(getCommunicationApi, [type], {}, "get", true)
    if(response){
        return response.chats
    }
})

export const getMyselfRedux = createAsyncThunk("getData/getMyselfRedux", async()=>{
    const response = await apiFunction(getMyselfApi, [], {}, "get", true)
    if(response){
        return response.mySelf
    }
})

export const getFeesRedux = createAsyncThunk("getData/getFeesRedux", async()=>{
    const response = await apiFunction(getFeesApi, [], {}, "get", true)
    if(response){
        console.log(response)
        return response.fees
    }
})

export const getNewUserRedux = createAsyncThunk("getData/getNewUserRedux", async()=>{
    const response = await apiFunction(getAllNewUserApi, [], {}, "get", true)
    if(response){
        console.log(response)
        return response.data
    }
})

export const getEventsRedux = createAsyncThunk("getData/getEventsRedux", async () => {

    const response = await apiFunction(getAlleventsApi, [], {}, "get", true);
    if (response) {
        return response.data
    }

})




const initialState = {
    loading: false, 
    error: null,
    users: null,
    usersById: null,
    classes: null, 
    timeTables: null,
    exams: null,
    courses: null,
    chats: null,
    myself: null,
    fees: null,
    newUsers: null,
    events: null
}

const getDataSlice = createSlice({
    name:"getData",
    initialState: initialState,
    reducers: {},
    extraReducers: (builder)=>{
        builder
        .addCase(getUserRedux.pending, (state, action)=>{
            state.loading = true
            state.users = null
            state.error = null
        })
        .addCase(getUserRedux.fulfilled, (state, action)=>{
            state.loading = false
            state.users = action.payload
            state.error = null
        })
        .addCase(getUserRedux.rejected, (state, action)=>{
            state.loading = false
            state.users = null
            state.error = action.payload
        })
        .addCase(getUserByIdRedux.pending, (state, action)=>{
            state.loading = true
            state.usersById = null
            state.error = null
        })
        .addCase(getUserByIdRedux.fulfilled, (state, action)=>{
            state.loading = false
            state.usersById = action.payload
            state.error = null
        })
        .addCase(getUserByIdRedux.rejected, (state, action)=>{
            state.loading = false
            state.usersById = null
            state.error = action.payload
        })
        .addCase(getClassesRedux.pending, (state, action)=>{
            state.loading = true
            state.classes = null
            state.error = null
        })
        .addCase(getClassesRedux.fulfilled, (state, action)=>{
            state.loading = false
            state.classes = action.payload
            state.error = null
        })
        .addCase(getClassesRedux.rejected, (state, action)=>{
            state.loading = false
            state.classes = null
            state.error = action.payload
        })
        .addCase(getTimeTableRedux.pending, (state, action)=>{
            state.loading = true
            state.timeTables = null
            state.error = null
        })
        .addCase(getTimeTableRedux.fulfilled, (state, action)=>{
            state.loading = false
            state.timeTables = action.payload
            state.error = null
        })
        .addCase(getTimeTableRedux.rejected, (state, action)=>{
            state.loading = false
            state.timeTables = null
            state.error = action.payload
        })
        .addCase(getExamsRedux.pending, (state, action)=>{
            state.loading = true
            state.exams = null
            state.error = null
        })
        .addCase(getExamsRedux.fulfilled, (state, action)=>{
            state.loading = false
            state.exams = action.payload
            state.error = null
        })
        .addCase(getExamsRedux.rejected, (state, action)=>{
            state.loading = false
            state.exams = null
            state.error = action.payload
        })
        .addCase(getCoursesRedux.pending, (state, action)=>{
            state.loading = true
            state.courses = null
            state.error = null
        })
        .addCase(getCoursesRedux.fulfilled, (state, action)=>{
            state.loading = false
            state.courses = action.payload
            state.error = null
        })
        .addCase(getCoursesRedux.rejected, (state, action)=>{
            state.loading = false
            state.courses = null
            state.error = action.payload
        })
        .addCase(getCommunicationRedux.pending, (state, action)=>{
            state.loading = true
            state.chats = null
            state.error = null
        })
        .addCase(getCommunicationRedux.fulfilled, (state, action)=>{
            state.loading = false
            state.chats = action.payload
            state.error = null
        })
        .addCase(getCommunicationRedux.rejected, (state, action)=>{
            state.loading = false
            state.chats = null
            state.error = action.payload
        })
        .addCase(getMyselfRedux.pending, (state, action)=>{
            state.loading = true
            state.myself = null
            state.error = null
        })
        .addCase(getMyselfRedux.fulfilled, (state, action)=>{
            state.loading = false
            state.myself = action.payload
            state.error = null
        })
        .addCase(getMyselfRedux.rejected, (state, action)=>{
            state.loading = false
            state.myself = null
            state.error = action.payload
        })
        .addCase(getFeesRedux.pending, (state, action)=>{
            state.loading = true
            state.fees = null
            state.error = null
        })
        .addCase(getFeesRedux.fulfilled, (state, action)=>{
            state.loading = false
            state.fees = action.payload
            state.error = null
        })
        .addCase(getFeesRedux.rejected, (state, action)=>{
            state.loading = false
            state.fees = null
            state.error = action.payload
        })
        .addCase(getEventsRedux.pending, (state, action)=>{
            state.loading = true
            state.events = null
            state.error = null
        })
        .addCase(getEventsRedux.fulfilled, (state, action)=>{
            state.loading = false
            state.events = action.payload
            state.error = null
        })
        .addCase(getEventsRedux.rejected, (state, action)=>{
            state.loading = false
            state.events = null
            state.error = action.payload
        })
        
    }
})

export const getDataReducer = getDataSlice.reducer