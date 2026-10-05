import { apiFetch } from "../utils/api";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
const AuthContext = createContext(null);
const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
const STORAGE_KEY = "autocare_auth_session";
export function AuthProvider({ children }) {
 const [user,setUser]=useState(null),[token,setToken]=useState(""),[initializing,setInitializing]=useState(true);
 useEffect(()=>{try{const saved=JSON.parse(sessionStorage.getItem(STORAGE_KEY)||"null");if(saved?.token&&saved?.user){setToken(saved.token);setUser(saved.user);}}catch{}finally{setInitializing(false)}},[]);
 const login=useCallback(async(credentials)=>{try{const endpoint=credentials.role==="admin"?"admin-login":"customer-login";const body=credentials.role==="admin"?{email:credentials.email,password:credentials.password}:{registrationNumber:credentials.registrationNumber,phone:credentials.phone};const r=await apiFetch(`${API}/api/auth/${endpoint}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)return {success:false,message:d.error||"Login failed."};setUser(d.user);setToken(d.token);try{sessionStorage.setItem(STORAGE_KEY,JSON.stringify({user:d.user,token:d.token,vehicle:d.vehicle||null}));}catch{}return {success:true,user:d.user};}catch{return {success:false,message:"Cannot reach the server. Check that the backend is running."}}},[]);
 const logout=useCallback(()=>{setUser(null);setToken("");try{sessionStorage.removeItem(STORAGE_KEY)}catch{}},[]);
 const updateUser=useCallback((updated)=>setUser(u=>({...u,...updated})),[]);
 return <AuthContext.Provider value={{user,token,login,logout,updateUser,initializing}}>{children}</AuthContext.Provider>;
}
export function useAuth(){const ctx=useContext(AuthContext);if(!ctx)throw new Error("useAuth must be used within AuthProvider");return ctx;}
