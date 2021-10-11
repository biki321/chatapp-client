import axios from "axios";
console.log(process.env.REACT_APP_BASE_URL, "process.env.REACT_APP_BASE_URL");
const axiosIns = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosIns;
