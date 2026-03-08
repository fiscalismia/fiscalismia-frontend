/* eslint-disable no-console */
import { useState, useContext, createContext } from 'react';
import axios from 'axios';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { paths } from '../resources/router_navigation_paths';
import { localStorageKeys } from '../resources/resource_properties';
import { jwtDecode } from 'jwt-decode';
import { AuthInfo, CustomJwtToken, User } from '../types/custom/customTypes';
/**
 * React Router context receiving token, authenticated loginUserName and respective setters as values
 */
const AuthContext = createContext<AuthInfo>({
  token: null,
  setToken: () => {},
  loginUserName: null,
  setLoginUserName: () => {}
});

/**
 * The React Context Provider containing contextual values available to all of its children components
 * @param {*} param0 the children being nested within the React Context
 * @returns The Authentication Context containing a context value and all children components within the Route
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState(window.localStorage.getItem(localStorageKeys.token) || null);
  const [loginUserName, setLoginUserName] = useState(
    window.localStorage.getItem(localStorageKeys.loginUserName) || null
  );

  const loggedInAs: AuthInfo = {
    token: token,
    setToken: setToken,
    loginUserName: loginUserName,
    setLoginUserName: setLoginUserName
  };

  return <AuthContext.Provider value={loggedInAs as any}>{children}</AuthContext.Provider>;
};

/**
 * helper method for getting the AuthContext
 * @returns AuthContext containing token, loginUserName and respective setters as values
 */
export const useAuth = (): AuthInfo => {
  return useContext(AuthContext);
};

/**
 * attempts to decode a provided token
 * @param {*} token a string containing a supposed jwt-token for decoding
 * @returns true if decoded token contains userName
 */
export const isJwtToken = (token: string) => {
  if (!token) {
    return false;
  }
  const { user }: { user: User } = jwtDecode<CustomJwtToken>(token);
  return user.userName ? true : false;
};

export const invalidateSession = (setToken: AuthInfo['setToken'], setLoginUserName: AuthInfo['setLoginUserName']) => {
  window.localStorage.removeItem(localStorageKeys.token);
  window.localStorage.removeItem(localStorageKeys.loginUserName);
  window.localStorage.removeItem(localStorageKeys.authenticated);
  window.localStorage.removeItem(localStorageKeys.selectedMode);
  window.localStorage.removeItem(localStorageKeys.selectedPalette);
  window.localStorage.removeItem(localStorageKeys.selectedLanguage);
  setToken(null);
  setLoginUserName(null);
  console.debug('Invalidated session.');
};

/**
 * decodes a provided token and compares the contained user objects userName field with the loginUserName parameter
 * @param {*} token jwt-token
 * @param {*} loginUserName username supplied during login process
 * @returns true if loginUserName === token.user.userName
 */
export const isUserTokenValid = (token: string, loginUserName: string | null = null) => {
  if (!token) {
    console.error('Token undefined.');
    return false;
  }
  const decodedToken: CustomJwtToken = jwtDecode<CustomJwtToken>(token);
  if (decodedToken?.user?.userName === loginUserName) {
    const secondsSinceEpoch = Math.floor(new Date().getTime() / 1000);
    const tokenExpiresAt = decodedToken.exp;
    if (tokenExpiresAt && tokenExpiresAt < secondsSinceEpoch) {
      console.error(`Token expired [${secondsSinceEpoch - tokenExpiresAt}] seconds ago.`);
      return false;
    }
    console.debug(`Token of user [${loginUserName}] is valid.`);
    return true;
  } else {
    console.error('Token Authentication failed.');
    return false;
  }
};

/**
 * 1) calls the helper function isUserTokenValid to guarantee that the token's user's userName and loginUserName match
 * 2) Intercepts HTTP API RESPONSES to check for status 401 = UNAUTHORIZED which gets thrown by authentication.js in backend
 * @returns all children Routes being Protected if true; Navigates to redirectPath if false
 */
export const ProtectedRoute = () => {
  const redirectPath = paths.LOGIN;
  const location = useLocation();
  const { token, loginUserName, setToken, setLoginUserName } = useAuth() as unknown as AuthInfo; // TODO fix as unknown
  // intercepts each axios response and in case of error and status code 401 = UNAUTHORIZED, invalidates session
  // this guarantees that backend responses from expired or revoked session tokens do not succeed.
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response.status === 401) {
        console.error('USER NOT AUTHENTICATED WITH DB');
        window.localStorage.setItem(localStorageKeys.authenticated, 'false');
      }
      return error;
    }
  );
  if (token && !isUserTokenValid(token, loginUserName)) {
    console.error('PROTECTED ROUTE ACCESS [DENIED]');
    window.localStorage.setItem(localStorageKeys.authenticated, 'false');
  }
  if (window.localStorage.getItem(localStorageKeys.authenticated) !== 'true') {
    invalidateSession(setToken, setLoginUserName);
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  } else {
    return <Outlet />;
  }
};
