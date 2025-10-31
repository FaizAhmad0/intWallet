import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:7000",
  withCredentials: true,
});

export default API;
