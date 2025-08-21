import Cookies from 'js-cookie';

export const setAuthCookie = (token: string, user: any) => {
  // Set token cookie (httpOnly for security would be better, but this is client-side)
  Cookies.set('token', token, { expires: 7 }); // Expires in 7 days
  
  // Set user data cookie
  Cookies.set('user', JSON.stringify(user), { expires: 7 });
};

export const getAuthCookie = () => {
  const token = Cookies.get('token');
  const userStr = Cookies.get('user');
  
  if (!token || !userStr) return null;
  
  try {
    const user = JSON.parse(userStr);
    return { token, user };
  } catch (error) {
    return null;
  }
};

export const removeAuthCookie = () => {
  Cookies.remove('token');
  Cookies.remove('user');
};