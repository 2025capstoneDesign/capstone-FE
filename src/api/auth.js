import axios from "axios";
import qs from "qs";

const API_BASE_URL = 'http://localhost:8000';

export const register = async (userData) => {
    return axios.post(
        `${API_BASE_URL}/api/auth/register`,
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
        `${API_BASE_URL}/api/auth/login`,
        qs.stringify(userData),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }
    );
};