import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { a, i, nav, s, tr } from "framer-motion/client";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "./axios_Interceptors";


interface JwtPayload {
    exp: number;
}
const USER_API_URL = '/api/v1/users/';
const AUTH_API_URL = 'http://localhost:8080/api/v1/auth/';
const TEAM_API_URL = '/api/v1/teams/';
const VIEW_API_URL = '/api/v1/views/';
const EVENT_AND_MATCHES_API_URL = '/api/v1/event/';

// =======================================================
// =================== Helper Functions ===================
// =======================================================

export const isTokenExpired = (token: string): boolean => {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.exp * 1000 < Date.now();
};

// =======================================================
// =================== Auth Endpoints ====================
// =======================================================

export const loginEndpoint = async (body : any) => {
    const response = await axios.post(`${AUTH_API_URL}login`, body ,{withCredentials : true});
    return response.data;
};

export const registerEndpoint = async (body : any) => {
    const response = await axios.post(`${AUTH_API_URL}register`, body);
    return response.data;
}
export const refreshTokenEndpoint = async () => {
    const response = await axios.post(`${AUTH_API_URL}refresh`, {}, {withCredentials: true});
    return response.data;
}
// =======================================================
// =================== User Endpoints ====================
// =======================================================

export const verifyEndpoint = async (VerificationCode: Number) => {
    const response = await api.post(`${USER_API_URL}verify/${VerificationCode}`);
    return response.data;
}

export const enableEndPoint = async (userId: Number) => {
    const response = await api.post(`${USER_API_URL}enable/${userId}`);
    return response.data;
}

export const notEnabledPlayers = async () => {
    const response = await api.get(`${USER_API_URL}pendingMapping`);
    return response.data;
}

export const profileEndpoint = async () => {
    const response = await api.get(`${USER_API_URL}profile`);
    return response.data.profile;
}

export const profileByIdEndpoint = async (userId: number) => {
    const response = await api.get(`${USER_API_URL}Profile/${userId}`);
    return response.data.profile;
}

export const playerRows = async () => { 
    const response = await api.get(`${USER_API_URL}player/playersRows`);
    return response.data;
}
export const playersWithoutTeam = async () => { 
    const response = await api.get(`${USER_API_URL}player/playersWithoutTeam`);
    return response.data;
}
export const playersInTeam = async () => { 
    const response = await api.get(`${USER_API_URL}player/playersInTeam`);
    return response.data;
}
export const addReaction = async (playerId) => { 
    const response = await api.post(`${USER_API_URL}player/react/${playerId}`);
    return response.data;
}
export const updateUser = async (playerData : any) => { 
    const response = await api.post(`${USER_API_URL}updateUser` , playerData);
    return response.data;
}
export const removeReaction = async (playerId) => { 
    const response = await api.get(`${USER_API_URL}player/deleteReact/${playerId}`);
    return response.data;
}
export const findReactions = async (playerId) => { 
    const response = await api.get(`${USER_API_URL}player/findReactions/${playerId}`);
    return response.data;
}

export const scouterEndPoint = async () => { 
    const response = await api.get(`${USER_API_URL}scouter/scouters`);
    return response.data;
}

export const captainEndPoint = async () => { 
    const response = await api.get(`${USER_API_URL}captain/captains`);
    return response.data;
}

// export const getPlayersByState = async () => {
//     const response = await api.get(`${USER_API_URL}getPlayersByState`);
//     return response.data;
// }

// =======================================================
// =================== Team Endpoints ====================
// =======================================================

export const deletePlayerFromTeam =async (playerId : Number)=>{
    const response = await api.get(`${TEAM_API_URL}deletePlayerFromTeam/${playerId}`)
    return response
}

export const updateTeam =async (team)=>{
    const response = await api.post(`${TEAM_API_URL}updateTeam`, team)
    return response
}

export const teamsList =async ()=>{
    const response = await api.get(`${TEAM_API_URL}teamsList`)
    return response.data
}

export const team =async (teamId)=>{
    const response = await api.get(`${TEAM_API_URL}team/${teamId}`)
    return response.data
}
export const getState =async ()=>{
    const response = await api.get(`${TEAM_API_URL}getState`)
    return response.data
}

// =======================================================
// =================== View Endpoints ====================
// =======================================================

export const viewTeam =async (teamId)=>{
    const response = await api.post(`${VIEW_API_URL}viewTeam/${teamId}`)
    return response.data
}

export const viewPlayer =async (playerId)=>{
    const response = await api.post(`${VIEW_API_URL}viewPlayer/${playerId}`)
    return response.data
}
export const views =async ()=>{
    const response = await api.get(`${VIEW_API_URL}views`)
    return response.data
}

// =======================================================
// ============= Event and Matches Endpoints =============
// =======================================================

export const createEvent =async (eventRequest : any)=>{
    const response = await api.post(`${EVENT_AND_MATCHES_API_URL}newEvent`, eventRequest)
    return response.data
}
export const approveTeam =async (registrationRequest : any)=>{
    const response = await api.post(`${EVENT_AND_MATCHES_API_URL}approveTeam`, registrationRequest)
    return response.data
}
export const allEvents =async ()=>{
    const response = await api.get(`${EVENT_AND_MATCHES_API_URL}allEvents`)
    return response.data
}
export const registerForEvent =async (registrationRequest : any)=>{
    const response = await api.post(`${EVENT_AND_MATCHES_API_URL}register`, registrationRequest)
    return response.data
}
export const deleteEvent =async (id:number)=>{
    const response = await api.get(`${EVENT_AND_MATCHES_API_URL}deleteEvent/${id}`)
    return response.data
}
export const eventById =async (id:number)=>{
    const response = await api.get(`${EVENT_AND_MATCHES_API_URL}eventById/${id}`)
    return response.data
}
export const createMatch =async (MatchRequest : any)=>{
    const response = await api.post(`${EVENT_AND_MATCHES_API_URL}createMatch`, MatchRequest)
    return response.data
}
