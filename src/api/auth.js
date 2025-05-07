import axios from "axios";
import qs from "qs";

export const register = async (userData) => {
  return axios.post(
    `${process.env.REACT_APP_API_URL}/api/auth/register`,
    userData,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const login = async (userData) => {
  return axios.post(
    `${process.env.REACT_APP_API_URL}/api/auth/login`,
    qs.stringify(userData),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
};
