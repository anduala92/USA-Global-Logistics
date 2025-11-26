import { AppBar, Toolbar, Typography, CssBaseline, Drawer, List, ListItemButton, ListItemText, Box, Button, IconButton, Tooltip, Menu, MenuItem, Divider } from '@mui/material';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { clearTokens, loadTokens, getAccessToken } from '../auth/tokenStore';
import { useEffect, useState } from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { api } from '../api/client';

const drawerWidth = 260;

export function Layout() {
  const location = useLocation();
  const items = [
    { to: '/', label: 'Dashboard' },
    { to: '/customers', label: 'Customers' },
    { to: '/orders', label: 'Orders' },
    { to: '/locations', label: 'Locations' },
    { to: '/vehicle-models', label: 'Vehicle Models' },
    { to: '/vehicles', label: 'Vehicles' },
    { to: '/carriers', label: 'Carriers' },
    { to: '/drivers', label: 'Drivers' },
    { to: '/shipments', label: 'Shipments' },
  ];

  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    loadTokens();
    const token = getAccessToken();
    if (token) {
      api.get('/auth/me').then(res => setUser(res.data)).catch(() => setUser(null));
    }
  }, []);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const doLogout = () => { handleClose(); clearTokens(); window.location.href = '/login'; };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#0f172a' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap component="div" sx={{ color: '#fff' }}>
            USA Global Logistics
          </Typography>
          <Box>
            {user ? (
              <>
                <Tooltip title={`${user.email} (${user.role})`}>
                  <IconButton color="inherit" onClick={handleMenu} size="large">
                    <AccountCircleIcon />
                  </IconButton>
                </Tooltip>
                <Menu anchorEl={anchorEl} open={open} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
                  <MenuItem disabled>Signed in as</MenuItem>
                  <MenuItem disabled><strong>{user.email}</strong></MenuItem>
                  <Divider />
                  <MenuItem disabled>Role: {user.role}</MenuItem>
                  <MenuItem disabled>Password: •••••• (hidden)</MenuItem>
                  <Divider />
                  <MenuItem onClick={doLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/login">Login</Button>
                <Button color="inherit" component={Link} to="/register">Register</Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            height: '100vh',
            overflow: 'hidden',
            bgcolor: '#f5f7fb',
            borderRight: '1px solid #e5e7eb',
          },
        }}
      >
        <Toolbar />
        <List>
          {items.map((it) => (
            <ListItemButton key={it.to} component={Link} to={it.to} selected={location.pathname === it.to}>
              <ListItemText primary={it.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          p: 3,
          bgcolor: 'rgba(255,255,255,1)',
          backdropFilter: 'saturate(180%) blur(2px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
