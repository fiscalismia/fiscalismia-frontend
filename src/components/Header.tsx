import React from 'react';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { Divider } from '@mui/material';
import SettingsAndProfileAppBar from './minor/SettingsAndProfileAppBar';
import { RouteInfo } from '../types/custom/customTypes';

interface HeaderProps {
  onDrawerToggle: () => void;
  contentHeader: RouteInfo;
}
/**
 * Top of the page, dynamic dependent on react-router navigation
 * @param {HeaderProps} props header and subHeader
 * @returns A horizontal Header HTML container with header and subheader strings and an interactive menu bar.
 */
function Header(props: HeaderProps) {
  const { palette } = useTheme();
  const { onDrawerToggle } = props;
  const { header, subHeader } = props.contentHeader;

  return (
    <React.Fragment>
      {/* SETTINGS, GITHUB ICON, PROFILE, LOGOUT App Bar */}
      <SettingsAndProfileAppBar onDrawerToggle={onDrawerToggle} />
      {/* Content Header Text */}
      <AppBar component="div" position="static" elevation={0} sx={{ zIndex: 0 }}>
        <Grid container alignItems="center" spacing={0}>
          <Grid xs sx={{ mt: '10px', ml: 2 }}>
            <Divider />
            {/* HEADER */}
            <Typography
              color="inherit"
              variant="h4"
              fontSize={26}
              fontWeight={300}
              sx={{ paddingTop: '1px', paddingBottom: '1px', ml: 2 }}
            >
              {header}
            </Typography>
            <Divider />
          </Grid>
        </Grid>
      </AppBar>
      {/* Content Header relative Tab Navigation */}
      <AppBar
        component="div"
        position="static"
        elevation={0}
        sx={{ zIndex: 0, borderBottom: `4px solid ${palette.secondary.dark}` }}
      >
        {/* SUBHEADER */}
        <Typography
          variant="h5"
          letterSpacing={2}
          fontSize={22}
          textTransform={'uppercase'}
          fontWeight={300}
          sx={{ ml: 4, paddingTop: 1.5, paddingBottom: 0.5 }}
        >
          {subHeader}
        </Typography>
      </AppBar>
    </React.Fragment>
  );
}

export default Header;
