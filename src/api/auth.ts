import axios from 'axios';
import { RegisterSchema, registerSchema } from '@/lib/types';
import {users as dummyUsers} from '@/lib/data';
import { User } from '@/lib/types';

const API= {
    baseURL: 'https://bask-backend.onrender.com/api',
    timeout: 60000
}

export async function registerUser(data: RegisterSchema) {
  const response = await axios.post(`${API.baseURL}/auth/register`, data, { timeout: API.timeout });
  return response.data;
}

export async function loginUser(email: string, password: string) {
  const response = await axios.post(`${API.baseURL}/auth/login`, { email, password }, { timeout: API.timeout, withCredentials: true });
  return response.data;
}

export async function getUserProfile() {
  const response = await axios.get(`${API.baseURL}/auth/profile`, { timeout: API.timeout, withCredentials: true });
  return response.data;
}

export function getRandomDummyUser() {
  return dummyUsers[Math.floor(Math.random() * dummyUsers.length)];
}

export function mapBackendUserToFrontendUser(backendUser: any): User {
  const randomDummy = getRandomDummyUser();

  return {
    id: backendUser.user.id,

    // Combine real backend data with dummy data
    name: `${backendUser.user.firstName} ${backendUser.user.lastName}`,
    type: backendUser.user.accountType,

    // Use dummy user's avatar instead of placeholder
    avatarId: randomDummy.avatarId,

    // Use dummy user's bio
    bio: randomDummy.bio ?? "",

    // Use dummy user's social graph
    connections: randomDummy.connections ?? [],
    followers: randomDummy.followers ?? [],
    following: randomDummy.following ?? [],

    // Use dummy user's stats if they exist
    stats: randomDummy.stats ?? {},

    // Use their dummy profile cover if available
    profileCoverId: randomDummy.profileCoverId,
  };
}

export async function createPost(content: FormData) {
  const response = await axios.post(`${API.baseURL}/posts`, content, { timeout: API.timeout, withCredentials: true });
  return response.data;
}

export async function getPosts() {
  const response = await axios.get(`${API.baseURL}/posts/feed`, { timeout: API.timeout, withCredentials: true });
  return response.data;
}