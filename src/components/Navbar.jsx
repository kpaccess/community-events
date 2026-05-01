'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import LogoutIcon from '@mui/icons-material/Logout';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useApp } from '@/context/AppContext';

const NAV_LINKS = [
  { label: 'Events', href: '/events', icon: <EventIcon sx={{ fontSize: 18 }} /> },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUser, isAdmin, logout } = useApp();

  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    setAnchorEl(null);
    setDrawerOpen(false);
    logout();
    router.push('/');
  };

  const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

  return (
    <AppBar position="sticky" elevation={0} sx={{ color: 'text.primary', zIndex: 1100 }}>
      <Toolbar sx={{ px: { xs: 2, md: 4 }, py: 1, maxWidth: 1280, mx: 'auto', width: '100%' }}>
        {/* Logo */}
        <Box
          component={Link}
          href="/"
          sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            textDecoration: 'none', flexGrow: 0, mr: 4,
          }}
        >
          <Box sx={{
            width: 34, height: 34,
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(79,70,229,0.4)',
          }}>
            <Typography sx={{ color: '#fff', fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1rem', lineHeight: 1 }}>
              G
            </Typography>
          </Box>
          <Typography sx={{
            fontFamily: '"Syne", sans-serif',
            fontWeight: 800, fontSize: '1.25rem',
            color: 'primary.dark',
            display: { xs: 'none', sm: 'block' },
          }}>
            Gather
          </Typography>
        </Box>

        {/* Desktop Nav */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexGrow: 1 }}>
            {NAV_LINKS.map(link => (
              <Button
                key={link.href}
                component={Link}
                href={link.href}
                startIcon={link.icon}
                sx={{
                  color: isActive(link.href) ? 'primary.main' : 'text.secondary',
                  background: isActive(link.href) ? 'rgba(79,70,229,0.08)' : 'transparent',
                  fontWeight: isActive(link.href) ? 700 : 500,
                  '&:hover': { background: 'rgba(79,70,229,0.06)', color: 'primary.main' },
                  px: 2, py: 0.75,
                }}
              >
                {link.label}
              </Button>
            ))}
            {isAdmin && (
              <>
                <Button
                  component={Link}
                  href="/dashboard"
                  startIcon={<DashboardIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    color: isActive('/dashboard') ? 'primary.main' : 'text.secondary',
                    background: isActive('/dashboard') ? 'rgba(79,70,229,0.08)' : 'transparent',
                    fontWeight: isActive('/dashboard') ? 700 : 500,
                    '&:hover': { background: 'rgba(79,70,229,0.06)', color: 'primary.main' },
                    px: 2, py: 0.75,
                  }}
                >
                  Dashboard
                </Button>
                <Button
                  component={Link}
                  href="/events/create"
                  variant="contained"
                  startIcon={<AddCircleIcon />}
                  size="small"
                  sx={{ ml: 1 }}
                >
                  New Event
                </Button>
              </>
            )}
          </Box>
        )}

        {!isMobile && <Box sx={{ flexGrow: 1 }} />}

        {/* Auth Buttons / User Menu */}
        {!currentUser ? (
          !isMobile ? (
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                component={Link} href="/auth/login"
                variant="outlined" color="primary"
                sx={{ px: 3, py: 0.75 }}
              >
                Log in
              </Button>
              <Button
                component={Link} href="/auth/signup"
                variant="contained" color="primary"
                sx={{ px: 3, py: 0.75 }}
              >
                Sign up
              </Button>
            </Box>
          ) : (
            <IconButton onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          )
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {isAdmin && (
              <Chip
                label="Admin"
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  display: { xs: 'none', sm: 'flex' },
                }}
              />
            )}
            {isMobile && (
              <IconButton onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}
            {!isMobile && (
              <>
                <Avatar
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{ cursor: 'pointer', width: 36, height: 36, fontSize: '0.85rem' }}
                >
                  {currentUser.avatar}
                </Avatar>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  PaperProps={{ sx: { mt: 1, minWidth: 200, borderRadius: 2 } }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={700}>{currentUser.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{currentUser.email}</Typography>
                  </Box>
                  <Divider />
                  {isAdmin && (
                    <MenuItem onClick={() => { setAnchorEl(null); router.push('/dashboard'); }}>
                      <DashboardIcon sx={{ mr: 1.5, fontSize: 18, color: 'primary.main' }} />
                      Dashboard
                    </MenuItem>
                  )}
                  {isAdmin && (
                    <MenuItem onClick={() => { setAnchorEl(null); router.push('/events/create'); }}>
                      <AddCircleIcon sx={{ mr: 1.5, fontSize: 18, color: 'primary.main' }} />
                      New Event
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <LogoutIcon sx={{ mr: 1.5, fontSize: 18 }} />
                    Log out
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        )}

        {/* Mobile Drawer */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
          PaperProps={{ sx: { width: 280, p: 2 } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, mt: 1 }}>
            <Box sx={{
              width: 34, height: 34,
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Typography sx={{ color: '#fff', fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1rem' }}>G</Typography>
            </Box>
            <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.25rem', color: 'primary.dark' }}>
              Gather
            </Typography>
          </Box>

          {currentUser && (
            <Box sx={{ mb: 2, p: 2, background: 'rgba(79,70,229,0.06)', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 40, height: 40 }}>{currentUser.avatar}</Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>{currentUser.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{currentUser.role}</Typography>
                </Box>
              </Box>
            </Box>
          )}

          <List disablePadding>
            {NAV_LINKS.map(link => (
              <ListItemButton key={link.href} component={Link} href={link.href} onClick={() => setDrawerOpen(false)}
                sx={{ borderRadius: 2, mb: 0.5 }}
              >
                {link.icon}
                <ListItemText primary={link.label} sx={{ ml: 1.5 }} />
              </ListItemButton>
            ))}
            {isAdmin && (
              <>
                <ListItemButton component={Link} href="/dashboard" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2, mb: 0.5 }}>
                  <DashboardIcon sx={{ fontSize: 20 }} />
                  <ListItemText primary="Dashboard" sx={{ ml: 1.5 }} />
                </ListItemButton>
                <ListItemButton component={Link} href="/events/create" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2, mb: 0.5 }}>
                  <AddCircleIcon sx={{ fontSize: 20 }} />
                  <ListItemText primary="New Event" sx={{ ml: 1.5 }} />
                </ListItemButton>
              </>
            )}
          </List>

          <Divider sx={{ my: 2 }} />

          {!currentUser ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button variant="outlined" fullWidth component={Link} href="/auth/login" onClick={() => setDrawerOpen(false)}>Log in</Button>
              <Button variant="contained" fullWidth component={Link} href="/auth/signup" onClick={() => setDrawerOpen(false)}>Sign up</Button>
            </Box>
          ) : (
            <Button
              variant="outlined" color="error" fullWidth
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Log out
            </Button>
          )}
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}
