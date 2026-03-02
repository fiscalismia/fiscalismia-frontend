import { AppBar, Box, Stack, Typography } from '@mui/material';
import { resourceProperties as res } from '../resources/resource_properties';
import { useTheme } from '@mui/material/styles';

/**
 * Footer with current year, App Name
 * @returns
 */
export default function Footer(): JSX.Element {
  const { palette } = useTheme();
  return (
    <AppBar component="div" position="static" elevation={0} sx={{ zIndex: 0 }}>
      <Box component="footer" sx={{ p: 2, margin: '0 auto' }}>
        <Stack direction="row">
          <Typography
            color="text.secondary"
            sx={{ fontSize: '85%', fontWeight: 300, letterSpacing: 2, color: palette.common.white }}
          >
            {res.APP_NAME}&nbsp;
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ fontSize: '85%', fontWeight: 300, letterSpacing: 3, color: palette.common.white }}
          >
            {new Date().getFullYear()}&nbsp;|&nbsp;
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ fontSize: '85%', fontWeight: 300, letterSpacing: 1, color: palette.common.white }}
          >
            {res.FOOTER_TEXT}&nbsp;v{__APP_VERSION__}
          </Typography>
        </Stack>
      </Box>
    </AppBar>
  );
}
