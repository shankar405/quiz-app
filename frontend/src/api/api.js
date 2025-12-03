import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API = axios.create({
  baseURL: API_URL, 
  withCredentials: true,
});

export const createUser = (username) =>
  API.post("/user/create", { username });

export const startMatch = (username) =>
  API.post("/match/start", { username });

export const submitAllAnswers = (data) =>
  API.post("/quiz/submit-all", data);
export const getWinner = (sessionId) =>
  API.get(`/quiz/winner/${sessionId}`);
export default API;
