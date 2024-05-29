import jwt from 'jsonwebtoken';

export const generateToken = ({ payload, tokenSecret, expiresIn }) => {
  return jwt.sign(payload, tokenSecret, {
    expiresIn,
  });
};

export const sendCookie = ({ res, name, token }) => {
  res.cookie(name, token, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secure: true,
    sameSite: 'none',
  });
};

// To remove cookies, we need to have the same options as res.cookie https://expressjs.com/en/4x/api.html#res.clearCookie
export const deleteCookie = ({ res, name }) => {
  res.clearCookie(name, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
};
