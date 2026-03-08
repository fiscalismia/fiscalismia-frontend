import React from 'react';
import ReactDOM from 'react-dom/client';
import Fiscalismia from './routes/Fiscalismia';
import SignInSide from './components/SignInSide';
import { paths } from './resources/router_navigation_paths';
import { AuthProvider, ProtectedRoute } from './services/userAuthentication';
import ErrorPage from './components/ErrorPage';
import './index.css';
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route, Navigate } from 'react-router-dom';
const router = createBrowserRouter(
  createRoutesFromElements(
    <React.Fragment>
      {/* Level 0 */}
      <Route
        index
        path="/"
        element={<Navigate to={paths.LOGIN} />}
        // loader={rootLoader}
        // action={rootAction}
        errorElement={<ErrorPage />}
      />
      <Route
        path={paths.LOGIN}
        element={<SignInSide />}
        // loader={rootLoader}
        // action={rootAction}
        errorElement={<ErrorPage />}
      />
      <Route element={<ProtectedRoute />} errorElement={<ErrorPage />}>
        {/* Level 1 */}
        <Route
          path={`${paths.APP_ROOT_PATH}/*`}
          element={<Fiscalismia />}
          // loader={rootLoader}
          // action={rootAction}
          errorElement={<ErrorPage />}
        >
          {/* Level 2 */}
        </Route>
      </Route>
      <Route
        path="*"
        element={<></>}
        errorElement={<ErrorPage isNoMatch={true} />}
        loader={() => {
          throw new Response(null, { status: 404, statusText: 'not found' });
        }}
      />
    </React.Fragment>
  )
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
