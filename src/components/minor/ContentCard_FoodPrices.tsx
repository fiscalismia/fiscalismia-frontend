import React, { useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { AxiosError } from 'axios';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CancelIcon from '@mui/icons-material/CancelSharp';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import Stack from '@mui/system/Stack';
import Paper from '@mui/material/Paper';
import aldi from '/imgs/supermarkets/aldi1.png';
import metro from '/imgs/supermarkets/metro1.png';
import kaufland from '/imgs/supermarkets/kaufland1.png';
import lidl from '/imgs/supermarkets/lidl1.png';
import netto from '/imgs/supermarkets/netto1.png';
import rewe from '/imgs/supermarkets/rewe1.png';
import amazon from '/imgs/supermarkets/amazon1.png';
import edeka from '/imgs/supermarkets/edeka1.png';
import butcher from '/imgs/supermarkets/butcher1.png';
import online from '/imgs/supermarkets/online1.png';
// import online2 from '/imgs/supermarkets/online2.png';
import all from '/imgs/supermarkets/alle1.png';
import { styled } from '@mui/material/styles';
import { serverConfig } from '../../resources/serverConfig';
import {
  resourceProperties as res,
  foodItemInputCategories as foodCategories
} from '../../resources/resource_properties';
import { postFoodItemImg, FileSizeError, deleteFoodItemImg } from '../../services/pgConnections';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import CloseIcon from '@mui/icons-material/Close';
import MuiAlert from '@mui/material/Alert';
import { locales } from '../../utils/localeConfiguration';

const Alert = React.forwardRef(function Alert(props: any, ref: any) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
});

export type ContentCardFoodPrice = {
  foodItemId: string;
  header: string;
  subtitle: string;
  originalPrice: string;
  store: string;
  pricePerKg: string;
  kcalAmount: string;
  lastUpdated: string;
  details: string[] | null;
  img: string | null;
  elevation?: number;
  imgHeight?: number;
};

/**
 * JSX rendered as HTML for food price data extracted from the db.
 * Is used solely for rendering food items, their price and macronutrient information and the date of last update.
 * Includes several additional fields compared to ContentCardCosts from sharedFunctions.
 * @param props
 * @returns
 */
export default function ContentCardFoodPrices(props: ContentCardFoodPrice) {
  const { palette } = useTheme();
  const {
    foodItemId,
    header,
    subtitle,
    originalPrice,
    store,
    pricePerKg,
    kcalAmount,
    lastUpdated,
    details,
    img,
    elevation,
    imgHeight
  } = props;
  const [notificationOpen, setNotificationOpen] = React.useState(false);
  const [notificationMessage, setNotificationMessage] = React.useState('This is a notification.');
  const [notificationSeverity, setNotificationSeverity] = React.useState('info');
  const [imgFilePath, setImgFilePath] = React.useState<string | null>(img);
  const [renderImgDeletion, setRenderImgDeletion] = React.useState<boolean>(img ? true : false);

  useEffect(() => {
    setRenderImgDeletion(imgFilePath ? true : false);
  }, [imgFilePath]);

  const handleSnackbarClose = (_event: React.SyntheticEvent<any> | Event, reason: SnackbarCloseReason): void => {
    if (reason === 'clickaway') {
      return;
    }
    setNotificationOpen(false);
  };

  const getSupermarketLogo = () => {
    switch (store) {
      case foodCategories.JSON_STORES.aldi:
        return aldi;
      case foodCategories.JSON_STORES.lidl:
        return lidl;
      case foodCategories.JSON_STORES.kaufland:
        return kaufland;
      case foodCategories.JSON_STORES.rewe:
        return rewe;
      case foodCategories.JSON_STORES.metro:
        return metro;
      case foodCategories.JSON_STORES.amazon:
        return amazon;
      case foodCategories.JSON_STORES.netto:
        return netto;
      case foodCategories.JSON_STORES.edeka:
        return edeka;
      case foodCategories.JSON_STORES.butcher:
        return butcher;
      case foodCategories.JSON_STORES.online:
        return online;
      case foodCategories.JSON_STORES.all:
        return all;
      default:
        break;
    }
  };

  /**
   * Validation of user input is done in postFoodItemImg
   * - File Size
   * - File Extension
   * HTTP Status Responses are handled server-side
   * - 200 OK Log file path to user
   * - 409 Conflict - can be remedied via user input
   * - 400 unknown error
   * @param {*} event file is contained in event.target.files[0]
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const response = await postFoodItemImg(event, foodItemId);
    if (response instanceof AxiosError) {
      // User Notification via Snackbar
      setNotificationMessage(response.message);
      setNotificationSeverity('warning');
      setNotificationOpen(true);
      return;
    } else if (response instanceof FileSizeError) {
      // User Notification via Snackbar
      setNotificationMessage(response.message);
      setNotificationSeverity('warning');
      setNotificationOpen(true);
      return;
    }
    if (response?.status == 200) {
      const filepath = response.data.filepath;
      setImgFilePath(serverConfig.API_BASE_URL.concat('/').concat(filepath));
      setNotificationMessage(`File persisted in path: ${filepath}`);
      setNotificationSeverity('success');
      setNotificationOpen(true);
    } else if (response?.status == 409) {
      setNotificationMessage('STATUS 409: choose a different image.');
      setNotificationSeverity('error');
      setNotificationOpen(true);
    } else if (response?.status == 400) {
      setNotificationMessage('STATUS 400: image could not be processed.');
      setNotificationSeverity('error');
      setNotificationOpen(true);
    }
  };

  const handleImgDeletion = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const response = await deleteFoodItemImg(foodItemId);
    if (response.results[0]?.filepath) {
      setNotificationMessage(`Image successfully deleted from path: ${response.results[0].filepath}`);
      setNotificationSeverity('info');
      setImgFilePath(null);
      setNotificationOpen(true);
    } else {
      setNotificationMessage('Image could not be deleted');
      setNotificationSeverity('error');
      setNotificationOpen(true);
    }
  };

  return (
    <>
      {/* CUSTOM USER NOTIFICATION FOR LEARNING INSTEAD OF TOAST */}
      <Snackbar
        open={notificationOpen}
        autoHideDuration={8000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={handleSnackbarClose}
        message={notificationMessage}
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={() => handleSnackbarClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Alert onClose={handleSnackbarClose} severity={notificationSeverity} sx={{ width: '100%' }}>
          {notificationMessage}
        </Alert>
      </Snackbar>
      {/* FOOD ITEM CARD */}
      <Card
        elevation={elevation ? elevation : 4}
        variant="elevation"
        sx={{
          margin: 0,
          height: img === res.NO_IMG ? '240px' : imgHeight ? `${imgHeight + 240}px` : '440px',
          border: `1px solid ${palette.border.light}`,
          paddingBottom: 1.5
        }}
        square
      >
        {img === res.NO_IMG ? (
          <></>
        ) : renderImgDeletion ? (
          <Box sx={{ position: 'relative' }}>
            {/* IMAGE queried from server */}
            <CardMedia
              component="img"
              sx={{ height: imgHeight ? imgHeight : 200 }}
              image={img ? img : imgFilePath ? imgFilePath : undefined}
              title={header}
            />
            {/* DELETE IMG Btn */}
            <IconButton size="large" sx={{ position: 'absolute', right: 0, top: 0 }} onClick={handleImgDeletion}>
              <CancelIcon sx={{ borderRadius: 5, backgroundColor: '#cccccc' }} fontSize="inherit" />
            </IconButton>
          </Box>
        ) : (
          // UPLOAD IMAGE
          <CardActions
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex'
            }}
          >
            <Paper elevation={4}>
              <Button
                sx={{
                  borderRadius: 0,
                  paddingY: 2,
                  color: '#ffffff',
                  border: `1px solid ${palette.border.light}`,
                  backgroundColor: 'rgba(128,128,128,0.3)'
                }}
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
              >
                {locales().GENERAL_UPLOAD_IMG}
                <VisuallyHiddenInput type="file" onChange={handleFileUpload} />
              </Button>
            </Paper>
          </CardActions>
        )}
        <CardContent sx={{ padding: 0 }}>
          <Grid container spacing={1} sx={{ padding: 0 }}>
            {/* HEADER */}
            <Grid
              display="flex"
              justifyContent="center"
              alignItems="center"
              xs={header ? 12 : 0}
              sx={{ padding: 0, height: '75px' }}
            >
              {header ? (
                <Typography
                  variant="overline"
                  sx={{ fontSize: 14, paddingX: 2, letterSpacing: 2 }}
                  color="text.secondary"
                >
                  {header}
                </Typography>
              ) : null}
            </Grid>
            {/* store */}
            <Grid
              xs={3.5}
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{ paddingLeft: 2, borderTop: `1px solid ${palette.border.light}` }}
            >
              {store ? (
                <Box
                  component="img"
                  sx={{
                    height: 56,
                    width: 56,
                    maxHeight: { xs: 96, md: 96 },
                    maxWidth: { xs: 96, md: 96 }
                  }}
                  alt={store}
                  src={getSupermarketLogo()}
                />
              ) : null}
            </Grid>
            {/* title & subtitle */}
            <Grid
              xs={4}
              display={originalPrice || subtitle ? 'flex' : 'none'}
              justifyContent="center"
              alignItems="center"
              sx={{ borderTop: `1px solid ${palette.border.light}` }}
            >
              <Stack>
                {originalPrice ? (
                  <Typography sx={{ ml: 2, fontWeight: 500, fontSize: 16 }} variant="h6">
                    {originalPrice}
                  </Typography>
                ) : null}
                {subtitle ? (
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 0.2, ml: 1.5, fontSize: 15, letterSpacing: 1 }}
                    color="text.secondary"
                  >
                    {subtitle}
                  </Typography>
                ) : null}
              </Stack>
            </Grid>
            {/* price per kg */}
            <Grid
              xs={4.5}
              display="flex"
              justifyContent="flex-start"
              alignItems="center"
              sx={{ display: 'flex', borderTop: `1px solid ${palette.border.light}` }}
            >
              {pricePerKg ? (
                <Paper elevation={0}>
                  <Chip
                    label={pricePerKg}
                    sx={{
                      borderRadius: 0,
                      paddingX: 0,
                      paddingY: 4,
                      border: `1px solid ${palette.border.light}`,
                      fontSize: 14,
                      fontWeight: 400,
                      '& .MuiChip-label': {
                        whiteSpace: 'pre-wrap'
                      }
                    }}
                  />
                </Paper>
              ) : null}
            </Grid>
            {/* DETAILS */}
            <Grid
              xs={12}
              display={details || lastUpdated ? 'flex' : 'none'}
              justifyContent="center"
              alignItems="center"
              sx={{ paddingLeft: 2, paddingRight: 2, paddingBottom: 0, paddingTop: 0 }}
            >
              <Stack sx={{ mt: 0.5, minWidth: '100%' }}>
                <Chip
                  label={kcalAmount}
                  sx={{
                    borderRadius: 0,
                    borderWidth: 2,
                    letterSpacing: 1,
                    fontSize: 13,
                    fontWeight: 400,
                    height: '31px;',
                    paddingTop: '2px'
                  }}
                  variant="outlined"
                  color="primary"
                  icon={<LocalFireDepartmentIcon />}
                />
                <Chip
                  label={lastUpdated}
                  sx={{
                    mt: 0.7,
                    borderRadius: 0,
                    letterSpacing: 1,
                    borderWidth: 2,
                    fontSize: 13,
                    fontWeight: 400,
                    height: '31px;',
                    paddingTop: '2px'
                  }}
                  variant="outlined"
                  color="primary"
                  icon={<EventAvailableIcon />}
                />
                {details ? (
                  <Typography noWrap sx={{ mt: 0.3 }} variant="body2">
                    {details.map((e, i) => (
                      <React.Fragment key={e}>
                        • {e}
                        {i < details.length - 1 ? <br /> : null}
                      </React.Fragment>
                    ))}
                  </Typography>
                ) : null}
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );
}
