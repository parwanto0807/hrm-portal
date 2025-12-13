// src/utils/require.js
import { createRequire } from 'module';

export const require = createRequire(import.meta.url);

// Pre-load common packages untuk performa
export const packages = {
  express: () => require('express'),
  cors: () => require('cors'),
  helmet: () => require('helmet'),
  morgan: () => require('morgan'),
  session: () => require('express-session'),
  passport: () => require('passport'),
  'passport-google-oauth20': () => require('passport-google-oauth20'),
  'passport-jwt': () => require('passport-jwt'),
  jsonwebtoken: () => require('jsonwebtoken'),
  bcryptjs: () => require('bcryptjs'),
};