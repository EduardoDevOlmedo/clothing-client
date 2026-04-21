import { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton,
  Dialog, DialogTitle, DialogContent, Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { getUser, logout } from '../auth.js';

export default function Nav({ onNewDrop }) {
  const user = getUser();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function go(fn) {
    setOpen(false);
    fn();
  }


  const isDashboard = location.pathname === '/';

  const actions = [
    { label: isDashboard ? 'Nuevo drop' : 'Ver drop', icon: isDashboard ? <AddIcon /> : null, variant: 'outlined', fn: () => onNewDrop?.() },
    { label: 'Nueva prenda', variant: 'outlined', fn: () => navigate('/nueva-prenda') },
    { label: 'Resumen', variant: 'text', fn: () => navigate('/resumen') },
    { label: 'Salir', icon: <LogoutIcon />, variant: 'text', fn: () => { logout(); navigate('/login'); } },
  ];

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, textTransform: 'uppercase' }}>
          {user?.storeName + ' CLOTHES'}
        </Typography>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          {actions.map((a) => (
            <Button
              key={a.label}
              variant={a.variant}
              startIcon={a.icon}
              onClick={a.fn}
            >
              {a.label}
            </Button>
          ))}
        </Box>

        <IconButton
          sx={{ display: { md: 'none', xs: 'flex' } }}
          onClick={() => setOpen(true)}
          edge="end"
          aria-label="menu"
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Menu</DialogTitle>
        <DialogContent>
          <Stack spacing={1} sx={{ pt: 1 }}>
            {actions.map((a) => (
              <Button
                key={a.label}
                variant={a.variant}
                startIcon={a.icon}
                onClick={() => go(a.fn)}
                fullWidth
              >
                {a.label}
              </Button>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>
    </AppBar>
  );
}
