import axios from 'axios';
import { RegisterSchema, registerSchema } from '@/lib/types';
import {users as dummyUsers} from '@/lib/data';
import { User } from '@/lib/types';

const API= {
    baseURL: 'https://bask-backend.onrender.com/api',
    timeout: 30000
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

export async function getAllUsersNonAdmin() {
  const response = await axios.get(`${API.baseURL}/users  `, { timeout: API.timeout, withCredentials: true });
  return response.data;
}

export async function getUserPosts(userId: string) {
  const response = await axios.get(`${API.baseURL}/posts/user/${userId}`, { timeout: API.timeout, withCredentials: true });
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
    token: backendUser.token,
  };
}

export function mapBackendUserToFrontendUserWithoutUserKey(backendUser: any): User {
  const randomDummy = getRandomDummyUser();

  return {
    id: backendUser.id,

    // Combine real backend data with dummy data
    name: `${backendUser.firstName} ${backendUser.lastName}`,
    type: backendUser.accountType,

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

export async function getPosts({ page = 1}) {
  const response = await axios.get(`${API.baseURL}/posts/feed`, { timeout: API.timeout, withCredentials: true });
  return response.data;
}

export async function getComments(postId: string) {
  const response = await axios.get(`${API.baseURL}/posts/${postId}/comments`, { timeout: API.timeout, withCredentials: true });
  return response.data;
}

export async function addComment(postId: string, content: string) {
  const response = await axios.post(`${API.baseURL}/posts/${postId}/comments`, { content }, { timeout: API.timeout, withCredentials: true });
  return response.data;
}

export async function likePost(postId: string) {
  const response = await axios.post(`${API.baseURL}/posts/${postId}/like`, {}, { timeout: API.timeout, withCredentials: true });
  return response.data;
}

export async function checkIfPostIsLiked(postId: string) {
  const response = await axios.get(`${API.baseURL}/posts/${postId}/like`, { timeout: API.timeout, withCredentials: true });
  return response.data;
}

export async function getAllUsers() {
  const response = await axios.get(`${API.baseURL}/admin/users`, { timeout: API.timeout, withCredentials: true });
  return response.data;
}

export async function getAllPosts() {
  const response = await axios.get(`${API.baseURL}/admin/posts`, { timeout: API.timeout, withCredentials: true });
  return response.data;
}

export async function getAllEvents() {
  const response = await axios.get(`${API.baseURL}/admin/events`, { timeout: API.timeout, withCredentials: true });
  return response.data;
}

export async function deleteComment(commentId: string) {
  const response = await axios.delete(`${API.baseURL}/comments/${commentId}`, { timeout: API.timeout, withCredentials: true });
  return response.data;
}

export async function createEvent(data: FormData) {
  const response = await axios.post(`${API.baseURL}/events`, data, { timeout: API.timeout, withCredentials: true });
  return response.data;
}

export async function getUserConversations() {
  const response = await axios.get(`${API.baseURL}/conversations`, { timeout: API.timeout, withCredentials: true });
  return response.data;
}

export async function getConversationMessages(conversationId: string | null) {
  const response = await axios.get(`${API.baseURL}/conversations/${conversationId}/messages`, { timeout: API.timeout, withCredentials: true });
  return response.data;
}


// Not async function to get token from local storage
export function getAuthToken() {
  const response = localStorage.getItem('authToken');
  return response;
}

export async function getAllEventsPublic() {
  const response = await axios.get(`${API.baseURL}/events`, { timeout: API.timeout });
  return response.data;
}