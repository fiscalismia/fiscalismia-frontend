import React, { SetStateAction, useEffect } from 'react';
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
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import Typography from '@mui/material/Typography';
import CancelIcon from '@mui/icons-material/CancelSharp';
import Stack from '@mui/material/Stack';
import { Paper, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { foodItemInputCategories as foodCategories } from '../../resources/resource_properties';
import { serverConfig } from '../../resources/serverConfig';
import {
  postFoodItemImg,
  FileSizeError,
  deleteFoodItemImg,
  deleteFoodItemDiscount
} from '../../services/pgConnections';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import MuiAlert from '@mui/material/Alert';
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
import { locales } from '../../utils/localeConfiguration';
import { toastOptions } from '../../utils/sharedFunctions';
import { toast } from 'react-toastify';

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

export type ContentCardDiscount = {
  foodItemId: string;
  header: string;
  subtitle: string;
  originalPrice: string;
  discountPrice: string;
  discountPercentage: string;
  store: string;
  startDate: string;
  discount_start_date: string;
  endDate: string;
  dealDuration: string;
  daysLeft: string | null;
  startsInDays: string | null;
  details: string[] | null;
  img: string | null;
  elevation?: number;
  imgHeight?: number;
  refreshParent: React.Dispatch<SetStateAction<string>>;
};

/**
 * JSX rendered as HTML for grocery deal data extracted from the db.
 * Is used solely for rendering temporary grocery deals valid at certain effective dates.
 * Includes several additional fields compared to ContentCardCosts from sharedFunctions.
 * @param props
 * @returns
 */
export default function ContentCardDiscounts(props: ContentCardDiscount) {
  const { palette } = useTheme();
  const {
    foodItemId,
    header,
    subtitle,
    originalPrice,
    discountPrice,
    discountPercentage,
    store,
    startDate,
    discount_start_date,
    endDate,
    dealDuration,
    daysLeft,
    startsInDays,
    details,
    img,
    elevation,
    imgHeight,
    refreshParent
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
    if (reason && reason === 'clickaway') {
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
      setNotificationMessage(response.message);
      setNotificationSeverity('warning');
      setNotificationOpen(true);
      return;
    } else if (response instanceof FileSizeError) {
      setNotificationMessage(response.message);
      setNotificationSeverity('warning');
      setNotificationOpen(true);
      return;
    }
    if (response?.status == 200) {
      const filepath = response.data.filepath;
      setImgFilePath(serverConfig.API_BASE_URL.concat('/').concat(filepath));
      setNotificationMessage(locales().CONTENT_CARD_DISCOOUNT_NOTIFICATION_MESSAGE_IMG_PERSIST_SUCCESS(filepath));
      setNotificationSeverity('success');
      setNotificationOpen(true);
    } else if (response?.status == 409) {
      setNotificationMessage(locales().CONTENT_CARD_DISCOOUNT_NOTIFICATION_MESSAGE_IMG_UPLOAD_CONFLICT);
      setNotificationSeverity('error');
      setNotificationOpen(true);
    } else if (response?.status == 400) {
      setNotificationMessage(locales().CONTENT_CARD_DISCOOUNT_NOTIFICATION_MESSAGE_IMG_UPLOAD_BAD_REQUEST);
      setNotificationSeverity('error');
      setNotificationOpen(true);
    }
  };

  /**
   * deletes image from database and backend persistence location
   * @param event
   */
  const handleImgDeletion = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const response = await deleteFoodItemImg(foodItemId);
    if (response.results[0]?.filepath) {
      setNotificationMessage(
        locales().CONTENT_CARD_DISCOOUNT_NOTIFICATION_MESSAGE_IMG_DELETE_SUCCESS(response.results[0].filepath)
      );
      setNotificationSeverity('info');
      setImgFilePath(null);
      setNotificationOpen(true);
    } else {
      setNotificationMessage(locales().CONTENT_CARD_DISCOOUNT_NOTIFICATION_MESSAGE_IMG_DELETE_FAILURE);
      setNotificationSeverity('error');
      setNotificationOpen(true);
    }
  };

  /**
   * Deletes backend food item discount from database. renders only if image is null or deleted
   * @param event
   */
  const handleDiscountDeletion = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const response = await deleteFoodItemDiscount(foodItemId, discount_start_date);
    if (response.results[0]?.id) {
      toast.info(
        locales().CONTENT_CARD_DISCOOUNT_NOTIFICATION_MESSAGE_DISCOUNT_DELETE_SUCCESS(response.results[0].id),
        toastOptions
      );
      refreshParent(response.results[0].id);
    } else {
      toast.error(locales().CONTENT_CARD_DISCOOUNT_NOTIFICATION_MESSAGE_DISCOUNT_DELETE_FAILURE, toastOptions);
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
          height: '100%',
          border: `1px solid ${palette.border.light}`,
          paddingBottom: 1.5
        }}
        square
      >
        {renderImgDeletion ? (
          <Box sx={{ position: 'relative' }}>
            {/* IMAGE queried from server */}
            <CardMedia
              component="img"
              sx={{ height: imgHeight ? imgHeight : 200 }}
              image={img ? img : imgFilePath ? imgFilePath : undefined}
              title={header}
            />
            {/* DELETE IMG Btn */}
            <Tooltip placement="bottom" title={locales().CONTENT_CARD_DISCOOUNT_DELETE_FOOD_DISCOUNT_IMAGE_TOOLTIP}>
              <IconButton size="large" sx={{ position: 'absolute', right: 0, top: 0 }} onClick={handleImgDeletion}>
                <CancelIcon sx={{ borderRadius: 5, backgroundColor: '#cccccc' }} fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          // UPLOAD IMAGE
          <CardActions
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex',
              position: 'relative'
            }}
          >
            <Paper elevation={4}>
              <form
                action={`${serverConfig.API_BASE_URL}/upload/food_item_img`}
                method="post"
                encType="multipart/form-data"
              >
                <Button
                  sx={{
                    borderRadius: 0,
                    paddingY: 2,
                    color: '#eee',
                    border: `1px solid ${palette.border.light}`,
                    backgroundColor: 'rgba(128,128,128,0.5)'
                  }}
                  component="label"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                >
                  {locales().GENERAL_UPLOAD_IMG}
                  <VisuallyHiddenInput type="file" onChange={handleFileUpload} />
                </Button>
              </form>
            </Paper>
            {/* DELETE Food Item Discount Btn */}
            <Tooltip placement="bottom" title={locales().CONTENT_CARD_DISCOOUNT_DELETE_FOOD_DISCOUNT_TOOLTIP}>
              <IconButton size="large" sx={{ position: 'absolute', right: 0, top: 0 }} onClick={handleDiscountDeletion}>
                <CancelIcon sx={{ borderRadius: 5, backgroundColor: palette.error.light }} fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </CardActions>
        )}
        <CardContent sx={{ padding: 0 }}>
          <Grid container spacing={1} sx={{ padding: 0 }}>
            {/* HEADER */}
            <Grid display="flex" justifyContent="center" alignItems="center" xs={header ? 12 : 0} sx={{ padding: 0 }}>
              {header ? (
                <Typography
                  variant="overline"
                  sx={{ fontSize: 16, paddingX: 2, letterSpacing: 2 }}
                  color="text.secondary"
                >
                  {header}
                </Typography>
              ) : null}
            </Grid>

            {/* STORE IMAGES */}
            <Grid
              xs={4}
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{
                paddingLeft: 2,
                borderTop: `1px solid ${palette.border.light}`,
                borderBottom: `1px solid ${palette.border.light}`
              }}
            >
              {store ? (
                <Box
                  component="img"
                  sx={{
                    height: 96,
                    width: 96,
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
              display={(originalPrice && discountPrice) || subtitle ? 'flex' : 'none'}
              justifyContent="flex-start"
              alignItems="center"
              sx={{ borderTop: `1px solid ${palette.border.light}`, borderBottom: `1px solid ${palette.border.light}` }}
            >
              <Stack>
                {originalPrice && discountPrice ? (
                  <Grid sx={{ mt: 0.2 }} display="flex">
                    <Typography
                      variant="h6"
                      sx={{
                        textDecoration: 'line-through',
                        fontSize: 16,
                        marginTop: 0.4,
                        fontWeight: 300,
                        fontStyle: 'italic'
                      }}
                    >
                      {originalPrice}
                    </Typography>
                    <Typography sx={{ ml: 1, fontWeight: 500 }} variant="h6">
                      {discountPrice}
                    </Typography>
                  </Grid>
                ) : null}
                {subtitle ? (
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 0.2, fontSize: 15, letterSpacing: 1 }}
                    color="text.secondary"
                  >
                    {subtitle}
                  </Typography>
                ) : null}
              </Stack>
            </Grid>

            {/* discount percentage */}
            <Grid
              xs={4}
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{
                paddingLeft: 2,
                borderTop: `1px solid ${palette.border.light}`,
                borderBottom: `1px solid ${palette.border.light}`
              }}
            >
              {discountPercentage ? (
                <Paper elevation={0}>
                  <Chip
                    label={discountPercentage}
                    sx={{
                      borderRadius: 0,
                      paddingY: 3,
                      border: `1px solid ${palette.border.light}`,
                      fontSize: 17,
                      fontWeight: 500,
                      color: '#ffffff',
                      backgroundColor: palette.success.main
                    }}
                  />
                </Paper>
              ) : null}
            </Grid>

            {/* DETAILS */}
            <Grid
              xs={12}
              display={details || startDate || endDate ? 'flex' : 'none'}
              justifyContent="center"
              alignItems="center"
              sx={{ paddingLeft: 2, paddingRight: 2, paddingBottom: 0, paddingTop: 0 }}
            >
              <Stack sx={{ mt: 1, minWidth: '100%' }}>
                {daysLeft ? (
                  <Chip
                    label={daysLeft}
                    sx={{ borderRadius: 0, mt: 0.5, fontWeight: 600 }}
                    variant="outlined"
                    color="success"
                    icon={<EventAvailableIcon />}
                  />
                ) : null}
                {startsInDays ? (
                  <Chip
                    label={startsInDays}
                    sx={{ borderRadius: 0, mt: 0.5, letterSpacing: 2, fontWeight: 300 }}
                    variant="outlined"
                    color="error"
                    icon={<EventBusyIcon />}
                  />
                ) : null}
                <Chip
                  label={dealDuration}
                  sx={{ borderRadius: 0, mt: 0.5 }}
                  variant="outlined"
                  color="success"
                  icon={<HourglassBottomIcon />}
                />
                <Chip
                  label={startDate}
                  sx={{ borderRadius: 0, mt: 0.5 }}
                  variant="outlined"
                  color="success"
                  icon={<EventAvailableIcon />}
                />
                <Chip label={endDate} sx={{ borderRadius: 0, mt: 0.5 }} variant="outlined" icon={<EventBusyIcon />} />
                {details ? (
                  <Typography noWrap sx={{ mt: 0.3 }} variant="body2">
                    {details.map((e: string, i: number) => (
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
