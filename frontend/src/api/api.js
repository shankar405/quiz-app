import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000", 
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
