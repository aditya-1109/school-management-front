import React, { useState } from "react";
import { apiFunction } from "../../api/apiFunction";
import { loginUserApi } from "../../api/apis";
import { useNavigate } from "react-router";
import Toast from "../Components/Toast";

export default function Login() {
  const [data, setData] = useState({ email: "", password: "" });
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)

  const submitData = async()=>{
    const response = await apiFunction(loginUserApi, [], data, "post", false)
    if(response.success){
        localStorage.setItem("token", response.token)
        navigate("/home")
    }else{
        setToast({message: response.message, type: "error"})
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 via-orange-400 to-amber-300 relative overflow-hidden">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Background Blur Circle */}
      <div className="absolute w-96 h-96 bg-white/20 rounded-full blur-3xl top-[-100px] left-[-100px]" />
      <div className="absolute w-96 h-96 bg-orange-300/30 rounded-full blur-3xl bottom-[-120px] right-[-120px]" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-lg shadow-2xl rounded-3xl p-8 border border-white/40">

        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-2">
            Login to continue to your dashboard
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="example@abc.com"
              value={data.email}
              onChange={(e) =>
                setData({ ...data, email: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={data.password}
              onChange={(e) =>
                setData({ ...data, password: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
            />
          </div>

          {/* Button */}
          <button onClick={submitData} disabled={!data.email || !data.password} className="w-full bg-orange-500 disabled:bg-gray-400 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl shadow-md transition duration-300">
            Login
          </button>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 School Management System
        </p>

      </div>
    </div>
  );
}
