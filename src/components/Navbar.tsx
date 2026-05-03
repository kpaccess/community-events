'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
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

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    setAnchorEl(null);
    setDrawerOpen(false);
    await logout();
    router.push('/');
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <AppBar position="sticky" elevation={0} sx={{ color: 'text.primary', zIndex: 1100 }}>
      <Toolbar sx={{ px: { xs: 2, md: 4 }, py: 1, maxWidth: 1280, mx: 'auto', width: '100%' }}>
        {/* Logo */}
        <Box component={Link} href="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', flexGrow: 0, mr: 4 }}>
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
          <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.25rem', color: 'primary.dark', display: { xs: 'none', sm: 'block' } }}>
            Gather
          </Typography>
        </Box>

        {/* Desktop Nav */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexGrow: 1 }}>
            {NAV_LINKS.map(link => (
              <Button key={link.href} component={Link} href={link.href} startIcon={link.icon}
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
                <Button component={Link} href="/dashboard" startIcon={<DashboardIcon sx={{ fontSize: 18 }} />}
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
                <Button component={Link} href="/events/create" variant="contained" startIcon={<AddCircleIcon />} size="small" sx={{ ml: 1 }}>
                  New Event
                </Button>
              </>
            )}
          </Box>
        )}

        {!isMobile && <Box sx={{ flexGrow: 1 }} />}

        {/* Auth / User Menu */}
        {!currentUser ? (
          !isMobile ? (
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button component={Link} href="/auth/login" variant="outlined" color="primary" sx={{ px: 3, py: 0.75 }}>Log in</Button>
              <Button component={Link} href="/auth/signup" variant="contained" color="primary" sx={{ px: 3, py: 0.75 }}>Sign up</Button>
            </Box>
          ) : (
            <IconButton onClick={() => setDrawerOpen(true)}><MenuIcon /></IconButton>
          )
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {isAdmin && (
              <Chip label="Admin" size="small" sx={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: '#fff', fontWeight: 700, fontSize: '0.7rem', display: { xs: 'none', sm: 'flex' } }} />
            )}
            {isMobile && <IconButton onClick={() => setDrawerOpen(true)}><MenuIcon /></IconButton>}
            {!isMobile && (
              <>
                <Avatar onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ cursor: 'pointer', width: 36, height: 36, fontSize: '0.85rem' }}>
                  {currentUser.avatar}
                </Avatar>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
                  PaperProps={{ sx: { mt: 1, minWidth: 200, borderRadius: 2 } }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={700}>{currentUser.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{currentUser.email}</Typography>
                  </Box>
                  <Divider />
                  {isAdmin && (
                    <MenuItem onClick={() => { setAnchorEl(null); router.push('/dashboard'); }}>
                      <DashboardIcon sx={{ mr: 1.5, fontSize: 18, color: 'primary.main' }} /> Dashboard
                    </MenuItem>
                  )}
                  {isAdmin && (
                    <MenuItem onClick={() => { setAnchorEl(null); router.push('/events/create'); }}>
                      <AddCircleIcon sx={{ mr: 1.5, fontSize: 18, color: 'primary.main' }} /> New Event
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <LogoutIcon sx={{ mr: 1.5, fontSize: 18 }} /> Log out
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        )}

        {/* Mobile Drawer */}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: 280, p: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, mt: 1 }}>
            <Box sx={{ width: 34, height: 34, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ color: '#fff', fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1rem' }}>G</Typography>
            </Box>
            <Typography sx={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '1.25rem', color: 'primary.dark' }}>Gather</Typography>
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
              <ListItemButton key={link.href} component={Link} href={link.href} onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2, mb: 0.5 }}>
                {link.icon}
                <ListItemText primary={link.label} sx={{ ml: 1.5 }} />
              </ListItemButton>
            ))}
            {isAdmin && (
              <>
                <ListItemButton component={Link} href="/dashboard" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2, mb: 0.5 }}>
                  <DashboardIcon sx={{ fontSize: 20 }} /><ListItemText primary="Dashboard" sx={{ ml: 1.5 }} />
                </ListItemButton>
                <ListItemButton component={Link} href="/events/create" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2, mb: 0.5 }}>
                  <AddCircleIcon sx={{ fontSize: 20 }} /><ListItemText primary="New Event" sx={{ ml: 1.5 }} />
                </ListItemButton>
              </>
            )}
          </List>

          <Divider sx={{ my: 2 }} />

          {!currentUser ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button
                variant="outlined" fullWidth
                onClick={() => { setDrawerOpen(false); signIn('google', { callbackUrl: '/events' }); }}
                startIcon={
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                }
                sx={{ borderColor: 'divider', color: 'text.primary', fontWeight: 500 }}
              >
                Continue with Google
              </Button>
              <Button
                variant="outlined" fullWidth
                onClick={() => { setDrawerOpen(false); signIn('github', { callbackUrl: '/events' }); }}
                startIcon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                }
                sx={{ borderColor: 'divider', color: 'text.primary', fontWeight: 500 }}
              >
                Continue with GitHub
              </Button>
              <Divider>
                <Typography fontSize="0.75rem" color="text.secondary">or</Typography>
              </Divider>
              <Button variant="outlined" fullWidth component={Link} href="/auth/login" onClick={() => setDrawerOpen(false)}>Log in with email</Button>
              <Button variant="contained" fullWidth component={Link} href="/auth/signup" onClick={() => setDrawerOpen(false)}>Sign up</Button>
            </Box>
          ) : (
            <Button variant="outlined" color="error" fullWidth startIcon={<LogoutIcon />} onClick={handleLogout}>Log out</Button>
          )}
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}
