import { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { login, getUserSpecificSettings } from '../services/pgConnections';
import { IconButton, Stack } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { resourceProperties as res, localStorageKeys } from '../resources/resource_properties';
import { paths } from '../resources/router_navigation_paths';
import { useAuth, isUserTokenValid, isJwtToken } from '../services/userAuthentication';
import CreateAccountModal from './minor/Modal_CreateAccount';
import { UserCredentials } from '../types/custom/customTypes';
import { locales } from '../utils/localeConfiguration';
import forestImg from '/imgs/forest-tooLarge.jpg';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import { toastOptions } from '../utils/sharedFunctions';

/**
 * Footer with current year, App Name and Optional DEMO Header
 * @returns
 */
function LoginHeader(): JSX.Element {
  return (
    <Box component="header" sx={{ p: 2, margin: '0 auto', mb: 2 }}>
      <Stack direction="row">
        <Typography
          color="text.secondary"
          sx={{ fontWeight: 300, letterSpacing: 4, fontSize: 18, textTransform: 'uppercase' }}
        >
          {res.APP_NAME}
        </Typography>
        <Typography
          color="text.secondary"
          sx={{
            display: __ENVIRONMENT__ === 'demo' ? 'inline' : 'none',
            marginLeft: 1,
            fontWeight: 300,
            letterSpacing: 4,
            fontSize: 18,
            textTransform: 'uppercase'
          }}
        >
          {res.DEMO}
        </Typography>
        <Typography color="text.secondary" sx={{ marginLeft: 1, fontWeight: 300, letterSpacing: 4, fontSize: 18 }}>
          {new Date().getFullYear()}
        </Typography>
      </Stack>
    </Box>
  );
}

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      light: '#63ccff',
      main: '#63ccff',
      dark: '#006db3'
    },
    secondary: {
      light: '#68456e',
      main: '#bd9fc2',
      dark: '#d3bcd6'
    }
  }
});

/**
 * @returns Login Page with Sign Up Modal
 */
export default function SignInSide(): JSX.Element {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(
    window.localStorage.getItem(localStorageKeys.token) === 'true' ? true : false
  );
  const navigate = useNavigate();
  const { loginUserName, setToken, setLoginUserName } = useAuth();
  // After successfully logging in and authenticating the token, user settings are queried from the DB and redirect to Homepage is triggered
  useEffect(() => {
    const getUserSettings = async () => {
      try {
        if (!loginUserName) throw new Error(res.ERROR_USER_SETTINGS_NOT_DEFINED);
        const response = await getUserSpecificSettings(loginUserName);
        if (response?.results?.length > 0) {
          const userSettingsMap: Map<string, string> = new Map();
          response.results.forEach(({ setting_key, setting_value }: { setting_key: string; setting_value: string }) => {
            userSettingsMap.set(setting_key, setting_value);
          });
          window.localStorage.setItem(
            localStorageKeys.selectedMode,
            userSettingsMap.get(localStorageKeys.selectedMode)!
          );
          window.localStorage.setItem(
            localStorageKeys.selectedLanguage,
            userSettingsMap.get(localStorageKeys.selectedLanguage)!
          );
          window.localStorage.setItem(
            localStorageKeys.selectedPalette,
            userSettingsMap.get(localStorageKeys.selectedPalette)!
          );
        }
      } finally {
        navigate(paths.APP_ROOT_PATH, { replace: true });
      }
    };
    if (authenticated) {
      getUserSettings();
    }
  }, [authenticated]);

  const handleLogin = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const user: UserCredentials = { username: username, email: null, password: password };
    const response = await login(user);
    if (isJwtToken(response)) {
      window.localStorage.setItem(localStorageKeys.token, response);
      window.localStorage.setItem(localStorageKeys.loginUserName, username);
      setLoginUserName(username);
      setToken(response);
      if (isUserTokenValid(response, username)) {
        window.localStorage.setItem(localStorageKeys.authenticated, 'true');
        setAuthenticated(true);
      }
    } else {
      toast.error(locales().NOTIFICATIONS_LOGIN_FAILED, toastOptions);
    }
  };

  const inputChangeListener = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    switch (e.target.id) {
      case 'username':
        setUsername(e.target.value);
        break;
      case 'password':
        setPassword(e.target.value);
        break;
    }
  };

  // because user settings are still being loaded after loginUserName has been set, only display this page after a timeout
  // if useNavigate has already forwarded to a different page, nothing is rendered for the user
  if (window.localStorage.getItem(localStorageKeys.loginUserName)) {
    // setTimeout(function () { // TODO avoid briefly displaying "logged in already" after click on Login
    return (
      <>
        <p>{res.USER_ALREADY_LOGGED_IN(window.localStorage.getItem(localStorageKeys.loginUserName)!)}</p>
        <IconButton
          color="primary"
          onClick={() => {
            navigate(paths.APP_ROOT_PATH, { replace: true });
          }}
        >
          <HomeIcon />
          {res.HOME}
        </IconButton>
      </>
    );
    // }, 2000);
  }

  return (
    <ThemeProvider theme={theme}>
      <ToastContainer newestOnTop pauseOnFocusLoss position="top-right" />
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          xs={false}
          sm={false}
          md={6}
          lg={8}
          sx={{
            backgroundImage: `url(${forestImg})`,
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) => (t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900]),
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <Grid xs={12} md={6} lg={4} component={Paper} elevation={6} square>
          <Box
            sx={{
              mx: 4,
              mb: 8,
              mt: '20vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <LoginHeader />
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              {locales().GENERAL_SIGN_IN}
            </Typography>
            <Box component="form" noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label={locales().GENERAL_USERNAME}
                autoComplete="username"
                autoFocus
                value={username}
                onChange={inputChangeListener}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label={locales().GENERAL_PASSWORD}
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={inputChangeListener}
              />
              <Button
                onClick={handleLogin}
                fullWidth
                variant="contained"
                sx={{ mt: 1, mb: 2.5, bgcolor: 'primary.main' }}
              >
                {res.LOGIN}
              </Button>
              <CreateAccountModal />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
