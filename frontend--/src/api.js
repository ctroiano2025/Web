// src/api/api.js

import axios from 'axios';

// URL BASE do seu backend
const API_BASE_URL = 'http://localhost:3000'; 

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});