import axios from 'axios';

const API = axios.create({
  baseURL: "https://job-portal-5uy9.vercel.app/api", // Naya live Vercel domain URL
  withCredentials: true
});

export default API;