import axios from 'axios';
import { RegisterSchema, registerSchema } from '@/lib/types';

const API= {
    baseURL: 'https://bask-backend.onrender.com/api',
    timeout: 10000
}

export async function registerUser(data: RegisterSchema) {
  const response = await axios.post(`${API.baseURL}/auth/register`, data, { timeout: API.timeout });
  return response.data;
}