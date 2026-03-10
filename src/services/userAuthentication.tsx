/* eslint-disable no-console */
import { useState, useContext, createContext, useEffect } from 'react';
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

  return <AuthContext.Provider value={loggedInAs as AuthInfo}>{children}</AuthContext.Provider>;
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
 * @param isAdmin
 * @returns true if loginUserName === token.user.userName
 */
export const isUserTokenValid = (
  token: string | null,
  loginUserName: string | null = null,
  isAdmin: boolean | null
) => {
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
    // Additional check for admin user
    if (isAdmin && decodedToken?.user?.userName !== 'admin') {
      console.error('Admin Route Access denied.');
      return false;
    }
    console.debug(`Token of user [${loginUserName}] is valid.`);
    return true;
  } else {
    console.error('Token Authentication failed.');
    return false;
  }
};

interface ProtectedRouteProps {
  isAdmin: boolean;
}
/**
 * 1) calls the helper function isUserTokenValid to guarantee that the token's user's userName and loginUserName match
 * 2) Intercepts HTTP API RESPONSES to check for status 401 = UNAUTHORIZED which gets thrown by authentication.js in backend
 * @param {ProtectedRouteProps} props isAdmin signifies if the route should be strictly accessible by the admin only
 * @returns all children Routes being Protected if true; Navigates to redirectPath if false
 */
export const ProtectedRoute = (props: ProtectedRouteProps) => {
  const { isAdmin } = props;
  const redirectPath = paths.LOGIN;
  const location = useLocation();
  const { token, loginUserName, setToken, setLoginUserName } = useAuth();
  // intercepts each axios response and in case of error and status code 401 = UNAUTHORIZED, invalidates session
  // this guarantees that backend responses from expired or revoked session tokens do not succeed.
  useEffect(() => {
    const responseId = axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response.status === 401) {
          console.error('USER NOT AUTHENTICATED WITH BACKEND');
          window.localStorage.setItem(localStorageKeys.authenticated, 'false');
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(responseId);
  }, []);
  const isAccessDenied = !isUserTokenValid(token, loginUserName, false);
  if (!isAccessDenied && isAdmin) {
    const isAdminAccessDenied = !isUserTokenValid(token, loginUserName, true);
    if (isAdminAccessDenied) {
      // Authenticated but not admin -- redirect to app home, don't destroy session
      return <Navigate to={paths.APP_ROOT_PATH} replace state={{ from: location }} />;
    }
  }
  if (isAccessDenied) {
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
