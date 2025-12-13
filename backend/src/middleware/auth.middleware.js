import config from '../config/env.js';

export const authErrorHandler = (
  error,
  req,
  res,
  next
) => {
  if (error.message.includes('access_denied') || error.message.includes('cancelled')) {
    return res.redirect(`${config.frontendUrl}/login?status=cancelled`);
  }
  
  next(error);
};