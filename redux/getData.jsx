import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiFunction } from "../api/apiFunction";
import { getAllBooksApi, getAlleventsApi, getAllNewUserApi, getBusBySchoolIdApi, getClassesApi, getCommunicationApi, getCourseApi, getExamApi, getFeesApi, getInfoApi, getMyselfApi, getTimeTableApi, getUserApi, getUserByIdApi } from "../api/apis";

export const getUserByIdRedux = createAsyncThunk("getData/getUserByIdRedux", async({id})=>{
    const response = await apiFunction(getUserByIdApi, [id], {}, "get", true);
    if(response){
        return response
    }
})

export const getUserRedux = createAsyncThunk("getData/getUserRedux", async()=>{
    const response = await apiFunction(getUserApi, [], {}, "get", true);
    if(response){
        const users = response.users.filter((user) => String(user.schoolId) === String(localStorage.getItem("schoolId")))
        return users
    }
})

export const getClassesRedux = createAsyncThunk("getData/getClassesRedux", async()=>{
    const response = await apiFunction(getClassesApi, [], {}, "get", true);
     if(response){
        const classes = response.classes.filter((classe) => String(classe.schoolId) === String(localStorage.getItem("schoolId")))
        return classes
    }
})

export const getTimeTableRedux = createAsyncThunk("getData/getTimeTableRedux", async()=>{
    const response = await apiFunction(getTimeTableApi, [], {}, "get", true)
    if(response){
        const timeTables = response.timeTables.filter((timeTable) => String(timeTable.schoolId) === String(localStorage.getItem("schoolId")))
        return timeTables
    }
})

export const getExamsRedux = createAsyncThunk("getData/getExamsRedux", async()=>{
    const response = await apiFunction(getExamApi, [], {}, "get", true)
    if(response){
        const exams = response.exams.filter((exam) => String(exam.schoolId) === String(localStorage.getItem("schoolId")))
        return exams
    }
})

export const getCoursesRedux = createAsyncThunk("getData/getCoursesRedux", async()=>{
    const response = await apiFunction(getCourseApi, [], {}, "get", true)
    if(response){
        const courses = response.courses.filter((course) => String(course.schoolId) === String(localStorage.getItem("schoolId")))
        return courses
    }
})

export const getCommunicationRedux = createAsyncThunk("getData/getCommunicationRedux", async(type)=>{
    console.log(type)
    const response = await apiFunction(getCommunicationApi, [type], {}, "get", true)
    if(response){
        const chats = response.chats.filter((chat) => String(chat.schoolId) === String(localStorage.getItem("schoolId")))
        return chats
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
        const fees = response.fees.filter((fee) => String(fee.schoolId) === String(localStorage.getItem("schoolId")))
        return fees
    }
})

export const getNewUserRedux = createAsyncThunk("getData/getNewUserRedux", async()=>{
    const response = await apiFunction(getAllNewUserApi, [], {}, "get", true)
    if(response){
        const newUsers = response.data.filter((newUser) => String(newUser.schoolId) === String(localStorage.getItem("schoolId")))
        return newUsers
    }
})

export const getEventsRedux = createAsyncThunk("getData/getEventsRedux", async () => {

    const response = await apiFunction(getAlleventsApi, [], {}, "get", true);
    if (response) {
        const events = response.data.filter((event) => String(event.schoolId) === String(localStorage.getItem("schoolId")))
        return events
    }

})


export const getInfoRedux = createAsyncThunk("getData/getInfoRedux", async () => {

    const response = await apiFunction(getInfoApi, [], {}, "get", true);
    if (response) {
        const info = response.info.filter((info) => String(info.schoolId) === String(localStorage.getItem("schoolId")))
        return info
    }

})

export const getAllBooksRedux = createAsyncThunk("getData/getAllBooksRedux", async () => {
    const response = await apiFunction(getAllBooksApi, [], {}, "get", true)
    if (response) {
        console.log(response)
        return response.books
    }
})

export const getBusRedux = createAsyncThunk("getData/getBusRedux", async()=>{
    const response = await apiFunction(getBusBySchoolIdApi, [localStorage.getItem("schoolId")], {}, "get", true)
    if(response){
        console.log(response)
        return response.bus
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
    events: null,
    info: null,
    books: null,
    buses: null,
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
        .addCase(getInfoRedux.pending, (state, action)=>{
            state.loading = true
            state.info = null
            state.error = null
        })
        .addCase(getInfoRedux.fulfilled, (state, action)=>{
            state.loading = false
            state.info = action.payload
            state.error = null
        })
        .addCase(getInfoRedux.rejected, (state, action)=>{
            state.loading = false
            state.info = null
            state.error = action.payload
        })
        .addCase(getNewUserRedux.pending, (state, action)=>{
            state.loading = true
            state.newUsers = null
            state.error = null
        })
        .addCase(getNewUserRedux.fulfilled, (state, action)=>{
            state.loading = false
            state.newUsers = action.payload
            state.error = null
        })
        .addCase(getNewUserRedux.rejected, (state, action)=>{
            state.loading = false
            state.newUsers = null
            state.error = action.payload
        })
        .addCase(getAllBooksRedux.pending, (state, action)=>{
            state.loading = true
            state.books = null
            state.error = null
        })
        .addCase(getAllBooksRedux.fulfilled, (state, action)=>{
            state.loading = false
            state.books = action.payload
            state.error = null
        })
        .addCase(getAllBooksRedux.rejected, (state, action)=>{
            state.loading = false
            state.books = null
            state.error = action.payload
        })
        .addCase(getBusRedux.pending, (state, action)=>{
            state.loading = true
            state.buses = null
            state.error = null
        })
        .addCase(getBusRedux.fulfilled, (state, action)=>{
            state.loading = false
            state.buses = action.payload
            state.error = null
        })
        .addCase(getBusRedux.rejected, (state, action)=>{
            state.loading = false
            state.buses = null
            state.error = action.payload
        })
    }
})

export const getDataReducer = getDataSlice.reducer