import React, { useState } from 'react';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LogoutBtn from './minor/Button_Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import { menuEntries } from './minor/MenuEntries';
import { resourceProperties as res } from '../resources/resource_properties';
import { paths } from '../resources/router_navigation_paths';

const item = {
  py: '2px',
  px: 3,
  color: 'rgba(255, 255, 255, 0.7)',
  '&:hover': {
    bgcolor: 'rgba(248,208,130,0.3)',
    color: 'rgba(248,204,116,0.9)'
  },
  '&.Mui-selected:hover': {
    bgcolor: 'rgba(248,208,130,0.3)',
    color: 'rgba(255, 255, 255, 0.7)'
  },
  '&.Mui-selected': {
    bgcolor: 'rgba(255, 255, 255, 0.8)',
    color: 'rgba(20,20,20,0.9)'
  }
};

interface NavigatorProps {
  setContentHeader: React.Dispatch<
    React.SetStateAction<{
      header: string;
      subHeader: string;
      path: string;
    }>
  >;
  open?: boolean;
  onClose?: () => void;
  variant?: 'permanent' | 'persistent' | 'temporary' | undefined;
  sxProps?: any;
  drawerWidth: number;
}

/**
 * Vertical Menu to the Left side with Menu Entries leading to path Selection for React Router
 * @param {NavigatorProps} props
 * @returns Vertical HTML Navigation Bar, hidden on small screens with a toggle button
 */
export default function Navigator(props: NavigatorProps): JSX.Element {
  const [selectedRelativePath, setSelectedRelativePath] = useState<string | null>('');
  const { open, onClose, variant, sxProps, drawerWidth } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuSelection = (parentId: string, childId: string, path: string) => {
    const contentHeader = {
      header: parentId,
      subHeader: childId,
      path: path
    };
    props.setContentHeader(contentHeader);
    setSelectedRelativePath(path);
    navigate(`${paths.APP_ROOT_PATH}${path}`);
  };

  const isMenuEntrySelected = (path: string) => {
    const localLocation = location.pathname.split(`${paths.APP_ROOT_PATH}`);
    return path === selectedRelativePath ? true : path === localLocation[1] ? true : false;
  };

  const isHomeSelected = () => {
    if (location.pathname === paths.APP_ROOT_PATH) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <Drawer variant={variant} sx={sxProps} open={open} onClose={onClose} PaperProps={{ style: { width: drawerWidth } }}>
      <List disablePadding>
        {/* FISCALISMIA */}
        <ListItem sx={{ paddingY: 1, color: '#fff' }}>
          <ListItemIcon sx={{ fontSize: 20 }}>🔥</ListItemIcon>
          <ListItemText
            primary={res.APP_NAME}
            primaryTypographyProps={{
              textTransform: 'uppercase',
              letterSpacing: 4,
              fontSize: '22px !important',
              fontWeight: '300 !important'
            }}
          />
        </ListItem>
        <Divider />
        {/* HOME */}
        <ListItem sx={{ padding: 0 }}>
          <ListItemButton
            selected={isHomeSelected()}
            sx={{ ...item }}
            onClick={() => {
              setSelectedRelativePath(null);
              props.setContentHeader({ header: res.HOME, subHeader: '', path: paths.APP_ROOT_PATH });
              navigate(paths.APP_ROOT_PATH);
            }}
          >
            <ListItemText
              primary={res.HOME}
              primaryTypographyProps={{
                letterSpacing: 2,
                lineHeight: 2,
                fontSize: '16px !important',
                fontWeight: '400 !important',
                marginLeft: 2
              }}
            />
          </ListItemButton>
        </ListItem>
        <Divider />
        {/* NAVBAR MENU */}
        {menuEntries.map((parent) => (
          <Box key={parent!.id}>
            <ListItem sx={{ py: 2, px: 3 }}>
              <ListItemText sx={{ color: '#ffffff' }}>{parent!.id}</ListItemText>
            </ListItem>
            {parent!.children.map((child) => (
              <ListItem disablePadding key={child!.id}>
                <ListItemButton
                  selected={isMenuEntrySelected(child!.path)}
                  sx={{ ...item }}
                  onClick={() => handleMenuSelection(parent!.id, child!.id, child!.path)}
                >
                  <ListItemIcon>{child!.icon}</ListItemIcon>
                  <ListItemText>{child!.id}</ListItemText>
                </ListItemButton>
              </ListItem>
            ))}
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}
        <ListItem
          sx={{
            color: 'rgba(245,81,81,0.9)',
            padding: 0,
            '&:hover': {
              bgcolor: 'rgba(245,81,81,0.3)'
            }
          }}
        >
          <LogoutBtn fullWidth={true} />
        </ListItem>
      </List>
    </Drawer>
  );
}
