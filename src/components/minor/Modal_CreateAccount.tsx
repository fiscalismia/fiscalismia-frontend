import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import EmailIcon from '@mui/icons-material/Email';
import Modal from '@mui/material/Modal';
import Input from '@mui/material/Input';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyIcon from '@mui/icons-material/Key';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import { createUserCredentials } from '../../services/pgConnections';
import { UserCredentials } from '../../types/custom/customTypes';
import { locales } from '../../utils/localeConfiguration';
import { toast } from 'react-toastify';
import { toastOptions } from '../../utils/sharedFunctions';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
};

const regExEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const usernameRegExp = /^[a-zA-Z0-9_]{3,32}$/;
/**
 * Displayed on Login Page to allow for user registry
 * Opens a Dialog Modal with fields for username, email and password.
 * @returns
 */
export default function CreateAccountModal() {
  const { palette } = useTheme();
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  // Validation
  const [isUsernameValidationError, setIsUsernameValidationError] = React.useState(false);
  const [usernameValidationErrorMessage, setUsernameValidationErrorMessage] = React.useState('');
  const [isPasswordValidationError, setIsPasswordValidationError] = React.useState(false);
  const [passwordValidationErrorMessage, setPasswordValidationErrorMessage] = React.useState('');
  const [isEmailValidationError, setIsEmailValidationError] = React.useState(false);
  const [emailValidationErrorMessage, setEmailValidationErrorMessage] = React.useState('');
  // Inputs
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [email, setEmail] = React.useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  /**
   * queries DB for user credential insertion
   * notifies user on success or error
   */
  const persistUserCredentialsAndSettings = async () => {
    const credentials: UserCredentials = { username, email, password };
    const response = await createUserCredentials(credentials);
    if (response?.results[0]?.username === username) {
      setOpen(false);
      toast.success(locales().NOTIFICATIONS_ACCOUNT_CREATION_SUCCESS(response.results[0].username), toastOptions);
      await new Promise((resolve) => {
        setTimeout(() => {
          navigate(0);
          resolve('reload page');
        }, 2500);
      });
    } else {
      setOpen(false);
      toast.error(locales().NOTIFICATIONS_ACCOUNT_CREATION_ERROR, toastOptions);
    }
  };

  const validateInput = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    let errorPresent = false;
    if (!username) {
      errorPresent = true;
      setIsUsernameValidationError(true);
      setUsernameValidationErrorMessage(locales().MINOR_INPUT_CREATE_ACCOUNT_MODAL_USERNAME_VALIDATION_ERROR_MSG_1);
    } else {
      setIsUsernameValidationError(false);
      setUsernameValidationErrorMessage('');
    }
    if (username?.length < 3) {
      errorPresent = true;
      setIsUsernameValidationError(true);
      setUsernameValidationErrorMessage(locales().MINOR_INPUT_CREATE_ACCOUNT_MODAL_USERNAME_VALIDATION_ERROR_MSG_2);
    } else {
      setIsUsernameValidationError(false);
      setUsernameValidationErrorMessage('');
    }
    if (!usernameRegExp.test(username)) {
      errorPresent = true;
      setIsUsernameValidationError(true);
      setUsernameValidationErrorMessage(locales().MINOR_INPUT_CREATE_ACCOUNT_MODAL_USERNAME_VALIDATION_ERROR_MSG_3);
    } else {
      setIsUsernameValidationError(false);
      setUsernameValidationErrorMessage('');
    }
    if (!password) {
      errorPresent = true;
      setIsPasswordValidationError(true);
      setPasswordValidationErrorMessage(locales().MINOR_INPUT_CREATE_ACCOUNT_MODAL_PASSWORD_VALIDATION_ERROR_MSG_1);
    } else {
      setIsPasswordValidationError(false);
      setPasswordValidationErrorMessage('');
    }
    if (password?.length < 8) {
      errorPresent = true;
      setIsPasswordValidationError(true);
      setPasswordValidationErrorMessage(locales().MINOR_INPUT_CREATE_ACCOUNT_MODAL_PASSWORD_VALIDATION_ERROR_MSG_2);
    } else {
      setIsPasswordValidationError(false);
      setPasswordValidationErrorMessage('');
    }
    if (!regExEmail.test(email)) {
      errorPresent = true;
      setIsEmailValidationError(true);
      setEmailValidationErrorMessage(locales().MINOR_INPUT_CREATE_ACCOUNT_MODAL_EMAIL_VALIDATION_ERROR_MSG_1);
    } else {
      setIsEmailValidationError(false);
      setEmailValidationErrorMessage('');
    }
    if (errorPresent) {
      // Errors present => return
      return;
    } else {
      // Errors missing => save to db
      persistUserCredentialsAndSettings();
    }
  };

  const inputChangeListener = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    switch (e.target.id) {
      case 'create_username':
        setUsername(e.target.value.trim());
        break;
      case 'create_password':
        setPassword(e.target.value.trim());
        break;
      case 'create_email':
        setEmail(e.target.value.trim());
        break;
    }
  };

  return (
    <>
      <Button onClick={handleOpen} fullWidth color="secondary" variant="outlined" sx={{ mb: 2 }}>
        {locales().GENERAL_CREATE_ACCOUNT}
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          {/* USERNAME */}
          <FormControl fullWidth sx={{ m: 1 }} variant="standard">
            <InputLabel color="secondary" htmlFor="create_username">
              {locales().GENERAL_USERNAME}
            </InputLabel>
            <Input
              id="create_username"
              value={username}
              onChange={inputChangeListener}
              type="text"
              color="secondary"
              error={isUsernameValidationError}
              startAdornment={
                <InputAdornment position="start">
                  <AccountCircleIcon />
                </InputAdornment>
              }
            />
            <FormHelperText sx={{ color: palette.error.main }}>{usernameValidationErrorMessage}</FormHelperText>
          </FormControl>
          {/* EMAIL */}
          <FormControl fullWidth sx={{ m: 1 }} variant="standard">
            <InputLabel color="secondary" htmlFor="create_email">
              {locales().GENERAL_EMAIL}
            </InputLabel>
            <Input
              id="create_email"
              value={email}
              onChange={inputChangeListener}
              type="text"
              color="secondary"
              error={isEmailValidationError}
              startAdornment={
                <InputAdornment position="start">
                  <EmailIcon />
                </InputAdornment>
              }
            />
            <FormHelperText sx={{ color: palette.error.main }}>{emailValidationErrorMessage}</FormHelperText>
          </FormControl>
          {/* PASSWORD */}
          <FormControl fullWidth sx={{ m: 1 }} variant="standard">
            <InputLabel color="secondary" htmlFor="create_password">
              {locales().GENERAL_PASSWORD}
            </InputLabel>
            <Input
              id="create_password"
              value={password}
              onChange={inputChangeListener}
              type="password"
              color="secondary"
              error={isPasswordValidationError}
              startAdornment={
                <InputAdornment position="start">
                  <KeyIcon />
                </InputAdornment>
              }
            />
            <FormHelperText sx={{ color: palette.error.main }}>{passwordValidationErrorMessage}</FormHelperText>
          </FormControl>
          {/* SPEICHERN */}
          <Button
            onClick={validateInput}
            sx={{
              borderRadius: 0,
              margin: '0 auto',
              ml: 1,
              mt: 2,
              border: '1px solid rgba(0,0,0,0.7)',
              width: '100%',
              boxShadow: '3px 3px 5px 2px rgba(64,64,64, 0.7)'
            }}
            variant="contained"
            color="secondary"
            endIcon={<FileDownloadDoneIcon />}
          >
            {locales().GENERAL_SAVE}
          </Button>
        </Box>
      </Modal>
    </>
  );
}
