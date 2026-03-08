import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

/**
 * Example Material UI Elements to configure Palette Colors
 * @param root0
 * @param root0.show destructured flag indicating if the test is to be shown
 * @returns several interface elements to test a palette if show === true
 */
export default function PaletteAndThemeTest({ show = false }) {
  if (!show) {
    return <></>;
  }
  return (
    <Paper elevation={12} sx={{ p: 2, borderRadius: 0 }}>
      <Stack direction="row" spacing={1}>
        <Button size="large" variant="contained" color="primary">
          Primary
        </Button>
        <Button size="large" variant="contained" color="secondary">
          Secondary
        </Button>
        <Button size="large" variant="contained" color="tertiary">
          Tertiary
        </Button>
        <Button size="large" variant="contained" color="info">
          Info
        </Button>
        <Button size="large" variant="contained" color="success">
          Success
        </Button>
        <Button size="large" variant="contained" color="warning">
          Warning
        </Button>
        <Button size="large" variant="contained" color="error">
          Error
        </Button>
      </Stack>

      <Divider />
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Button size="large" variant="outlined" color="primary">
          Primary
        </Button>
        <Button size="large" variant="outlined" color="secondary">
          Secondary
        </Button>
        <Button size="large" variant="outlined" color="tertiary">
          Tertiary
        </Button>
        <Button size="large" variant="outlined" color="info">
          Info
        </Button>
        <Button size="large" variant="outlined" color="success">
          Success
        </Button>
        <Button size="large" variant="outlined" color="warning">
          Warning
        </Button>
        <Button size="large" variant="outlined" color="error">
          Error
        </Button>
      </Stack>

      <Divider />
      <Stack direction="row" spacing={4} sx={{ mt: 1 }}>
        <Button size="large" variant="text" color="primary">
          Primary
        </Button>
        <Button size="large" variant="text" color="secondary">
          Secondary
        </Button>
        <Button size="large" variant="text" color="tertiary">
          Tertiary
        </Button>
        <Button size="large" variant="text" color="info">
          Info
        </Button>
        <Button size="large" variant="text" color="success">
          Success
        </Button>
        <Button size="large" variant="text" color="warning">
          Warning
        </Button>
        <Button size="large" variant="text" color="error">
          Error
        </Button>
      </Stack>

      <Divider />

      <Stack direction="row" sx={{ width: '100%', mt: 1 }} spacing={0}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          This is an error alert
        </Alert>
        <Alert severity="warning">
          <AlertTitle>Warning</AlertTitle>
          This is a warning alert
        </Alert>
        <Alert severity="info">
          <AlertTitle>Info</AlertTitle>
          This is an info alert
        </Alert>
        <Alert severity="success">
          <AlertTitle>Success</AlertTitle>
          This is a success alert
        </Alert>
      </Stack>

      <Divider />
      <Stack direction="row" sx={{ width: '100%', mt: 1 }} spacing={0}>
        <Alert severity="error" variant="filled">
          <AlertTitle>Error</AlertTitle>
          This is an error alert
        </Alert>
        <Alert severity="warning" variant="filled">
          <AlertTitle>Warning</AlertTitle>
          This is a warning alert
        </Alert>
        <Alert severity="info" variant="filled">
          <AlertTitle>Info</AlertTitle>
          This is an info alert
        </Alert>
        <Alert severity="success" variant="filled">
          <AlertTitle>Success</AlertTitle>
          This is a success alert
        </Alert>
      </Stack>

      <Divider />
      <Stack direction="row" sx={{ width: '100%', mt: 1 }} spacing={0}>
        <Alert severity="error" variant="outlined">
          <AlertTitle>Error</AlertTitle>
          This is an error alert
        </Alert>
        <Alert severity="warning" variant="outlined">
          <AlertTitle>Warning</AlertTitle>
          This is a warning alert
        </Alert>
        <Alert severity="info" variant="outlined">
          <AlertTitle>Info</AlertTitle>
          This is an info alert
        </Alert>
        <Alert severity="success" variant="outlined">
          <AlertTitle>Success</AlertTitle>
          This is a success alert
        </Alert>
      </Stack>

      <Box sx={{ width: '100%', maxWidth: 500 }}>
        <Typography variant="h1" gutterBottom>
          h1. Heading
        </Typography>
        <Typography variant="h2" gutterBottom>
          h2. Heading
        </Typography>
        <Typography variant="h3" gutterBottom>
          h3. Heading
        </Typography>
        <Typography variant="h4" gutterBottom>
          h4. Heading
        </Typography>
        <Typography variant="h5" gutterBottom>
          h5. Heading
        </Typography>
        <Typography variant="h6" gutterBottom>
          h6. Heading
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          subtitle1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
        </Typography>
        <Typography variant="subtitle2" gutterBottom>
          subtitle2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur
        </Typography>
        <Typography variant="body1" gutterBottom>
          body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur unde suscipit, quam
          beatae rerum inventore consectetur, neque doloribus, cupiditate numquam dignissimos laborum fugiat deleniti?
          Eum quasi quidem quibusdam.
        </Typography>
        <Typography variant="body2" gutterBottom>
          body2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos blanditiis tenetur unde suscipit, quam
          beatae rerum inventore consectetur, neque doloribus, cupiditate numquam dignissimos laborum fugiat deleniti?
          Eum quasi quidem quibusdam.
        </Typography>
        <Typography variant="button" display="block" gutterBottom>
          button text
        </Typography>
        <Typography variant="caption" display="block" gutterBottom>
          caption text
        </Typography>
        <Typography variant="overline" display="block" gutterBottom>
          overline text
        </Typography>
      </Box>
    </Paper>
  );
}
