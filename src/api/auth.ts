import axios from 'axios';
import { RegisterSchema, registerSchema } from '@/lib/types';
import {users as dummyUsers} from '@/lib/data';
import { User } from '@/lib/types';

const API = {
  baseURL: 'https://bask-backend-slo6.onrender.com/api',
  timeout: 30000
};

// Create axios instance with interceptor
const apiClient = axios.create({
  baseURL: API.baseURL,
  timeout: API.timeout,
});

// Add request interceptor to attach token to every request
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    // If token exists, add it to Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors (token expired/invalid)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired, clear it
      localStorage.removeItem('authToken');
      // Optionally redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export async function registerUser(data: RegisterSchema) {
  const response = await apiClient.post('/auth/register', data);
  
  // Save token if registration returns one
  if (response.data.token) {
    localStorage.setItem('authToken', response.data.token);
  }
  
  return response.data;
}

export async function loginUser(email: string, password: string) {
  const response = await apiClient.post('/auth/login', { email, password });
  
  // CRITICAL: Save the token to localStorage
  if (response.data.token) {
    localStorage.setItem('authToken', response.data.token);
  }
  
  return response.data;
}

export async function logoutUser() {
  // Clear the token from localStorage
  localStorage.removeItem('authToken');
}

export async function getUserProfile() {
  const response = await apiClient.get('/auth/profile');
  return response.data;
}

export async function getAllUsersNonAdmin() {
  const response = await apiClient.get('/users');
  return response.data;
}

export async function getUserPosts(userId: string) {
  const response = await apiClient.get(`/posts/user/${userId}`);
  return response.data;
}

export function getRandomDummyUser() {
  return dummyUsers[Math.floor(Math.random() * dummyUsers.length)];
}

export function mapBackendUserToFrontendUser(backendUser: any): User {
  const randomDummy = getRandomDummyUser();

  return {
    id: backendUser.user.id,
    name: `${backendUser.user.firstName} ${backendUser.user.lastName}`,
    type: backendUser.user.accountType,
    avatarId: randomDummy.avatarId,
    bio: randomDummy.bio ?? "",
    connections: randomDummy.connections ?? [],
    followers: randomDummy.followers ?? [],
    following: randomDummy.following ?? [],
    stats: randomDummy.stats ?? {},
    profileCoverId: randomDummy.profileCoverId,
    token: backendUser.token,
  };
}

export function mapBackendUserToFrontendUserWithoutUserKey(backendUser: any): User {
  const randomDummy = getRandomDummyUser();

  return {
    id: backendUser.id,
    name: `${backendUser.firstName} ${backendUser.lastName}`,
    type: backendUser.accountType,
    avatarId: randomDummy.avatarId,
    bio: randomDummy.bio ?? "",
    connections: randomDummy.connections ?? [],
    followers: randomDummy.followers ?? [],
    following: randomDummy.following ?? [],
    stats: randomDummy.stats ?? {},
    profileCoverId: randomDummy.profileCoverId,
  };
}

export async function createPost(content: FormData) {
  const response = await apiClient.post('/posts', content);
  return response.data;
}

export async function getPosts({ page = 1 }) {
  const response = await apiClient.get('/posts/feed', {
    params: { page }
  });
  return response.data;
}

export async function getComments(postId: string) {
  const response = await apiClient.get(`/posts/${postId}/comments`);
  return response.data;
}

export async function addComment(postId: string, content: string) {
  const response = await apiClient.post(`/posts/${postId}/comments`, { content });
  return response.data;
}

export async function likePost(postId: string) {
  const response = await apiClient.post(`/posts/${postId}/like`, {});
  return response.data;
}

export async function checkIfPostIsLiked(postId: string) {
  const response = await apiClient.get(`/posts/${postId}/like`);
  return response.data;
}

export async function getAllUsers() {
  const response = await apiClient.get('/admin/users');
  return response.data;
}

export async function getAllPosts() {
  const response = await apiClient.get('/admin/posts');
  return response.data;
}

export async function getAllEvents() {
  const response = await apiClient.get('/admin/events');
  return response.data;
}

export async function deleteComment(commentId: string) {
  const response = await apiClient.delete(`/comments/${commentId}`);
  return response.data;
}

export async function createEvent(data: FormData) {
  const response = await apiClient.post('/events', data);
  return response.data;
}

export async function getUserConversations() {
  const response = await apiClient.get('/conversations');
  return response.data;
}

export async function getConversationMessages(conversationId: string | null) {
  const response = await apiClient.get(`/conversations/${conversationId}/messages`);
  return response.data;
}

// Get token from localStorage
export function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

// Public endpoint - no auth required
export async function getAllEventsPublic() {
  const response = await axios.get(`${API.baseURL}/events`, { timeout: API.timeout });
  return response.data;
}

export async function follow(userId: string) {
  const response = await apiClient.post(`/users/${userId}/follow`, {});
  return response.data;
}

export async function unfollow(userId: string) {
  const response = await apiClient.delete(`/users/${userId}/follow`, {});
  return response.data;
}

export async function userFollowers(userId: string) {
  const response = await apiClient.get(`/users/${userId}/followers`, {});
  return response.data;
}

export async function userFollowing(userId: string) {
  const response = await apiClient.get(`/users/${userId}/following`, {});
  return response.data;
}