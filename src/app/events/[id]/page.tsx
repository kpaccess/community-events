'use client';
import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VideocamIcon from '@mui/icons-material/Videocam';
import ShareIcon from '@mui/icons-material/Share';
import { useApp } from '@/context/AppContext';
import type { RsvpStatus } from '@/types';

const formatDate = (d: string) => {
  const date = new Date(d + 'T12:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
};

const formatTime = (t: string | null) => {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { events, currentUser, isAdmin, rsvpEvent, deleteEvent, getUserById } = useApp();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  const event = useMemo(() => events.find(e => e.id === id), [events, id]);
  const myRsvp = useMemo(() => {
    if (!currentUser || !event) return null;
    return (event.attendees || []).find(a => a.userId === currentUser.id) ?? null;
  }, [event, currentUser]);

  if (!event) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>Event not found</Typography>
        <Button component={Link} href="/events" startIcon={<ArrowBackIcon />} variant="contained">Back to Events</Button>
      </Container>
    );
  }

  const goingAttendees = (event.attendees || []).filter(a => a.status === 'going');
  const spotsLeft = event.capacity - goingAttendees.length;
  const isFull = spotsLeft <= 0;
  const isPast = new Date(event.date + 'T23:59:59') < new Date();
  const organizer = event.createdBy ? getUserById(event.createdBy) : undefined;
  const fillPercent = Math.min(100, (goingAttendees.length / event.capacity) * 100);

  const handleRsvp = (status: RsvpStatus) => {
    if (!currentUser) { router.push('/auth/login'); return; }
    rsvpEvent(event.id, myRsvp?.status === status ? null : status);
    setSnackMsg(myRsvp?.status === status ? 'RSVP removed' : status === 'going' ? "You're going!" : 'RSVP declined');
    setTimeout(() => setSnackMsg(''), 3000);
  };

  const handleDelete = () => {
    deleteEvent(event.id);
    router.push('/events');
  };

  return (
    <Box>
      <Box sx={{ height: 8, background: `linear-gradient(90deg, ${event.colorTag || '#4F46E5'}, ${event.colorTag || '#4F46E5'}80)` }} />

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Button component={Link} href="/events" startIcon={<ArrowBackIcon />} sx={{ mb: 3, color: 'text.secondary', fontWeight: 500 }}>
          All Events
        </Button>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip label={event.category} sx={{ background: `${event.colorTag || '#4F46E5'}18`, color: event.colorTag || '#4F46E5', fontWeight: 700 }} />
              {event.online && <Chip icon={<VideocamIcon sx={{ fontSize: '16px !important' }} />} label="Online Event" sx={{ background: '#EEF2FF', color: '#4F46E5', fontWeight: 600 }} />}
              {isPast && <Chip label="Past Event" sx={{ background: '#F3F4F6', color: '#6B7280', fontWeight: 600 }} />}
              {isFull && !isPast && <Chip label="Sold Out" color="error" sx={{ fontWeight: 700 }} />}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 3 }}>
              <Typography variant="h3" sx={{ fontSize: { xs: '1.6rem', md: '2.2rem' }, lineHeight: 1.2, flex: 1 }}>{event.title}</Typography>
              {isAdmin && (
                <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                  <Tooltip title="Edit event">
                    <IconButton component={Link} href={`/events/create?edit=${event.id}`} sx={{ background: 'rgba(79,70,229,0.08)', '&:hover': { background: 'rgba(79,70,229,0.16)' } }}>
                      <EditIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete event">
                    <IconButton onClick={() => setDeleteOpen(true)} sx={{ background: 'rgba(239,68,68,0.08)', '&:hover': { background: 'rgba(239,68,68,0.16)' } }}>
                      <DeleteIcon sx={{ color: 'error.main', fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>

            <Paper sx={{ p: 3, mb: 3, background: 'rgba(79,70,229,0.03)', border: '1px solid', borderColor: 'divider' }} elevation={0}>
              <Grid container spacing={2}>
                {[
                  { icon: <CalendarTodayIcon />, label: 'Date', value: formatDate(event.date) },
                  { icon: <AccessTimeIcon />, label: 'Time', value: `${formatTime(event.time)}${event.endTime ? ` – ${formatTime(event.endTime)}` : ''}` },
                  { icon: <LocationOnIcon />, label: 'Location', value: event.location ?? '' },
                  ...(event.address && event.address !== 'Online' ? [{ icon: <LocationOnIcon sx={{ opacity: 0 }} />, label: 'Address', value: event.address }] : []),
                ].map(item => (
                  <Grid item xs={12} sm={6} key={item.label}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <Box sx={{ color: event.colorTag || 'primary.main', mt: 0.2, '& svg': { fontSize: 20 } }}>{item.icon}</Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>{item.label}</Typography>
                        <Typography fontWeight={600} fontSize="0.95rem">{item.value}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            <Typography variant="h6" fontWeight={700} mb={2}>About this event</Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap', mb: 3 }}>
              {event.description}
            </Typography>

            {(event.tags?.length ?? 0) > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.secondary">Topics</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {event.tags.map(tag => <Chip key={tag} label={`#${tag}`} variant="outlined" size="small" sx={{ borderRadius: 1, fontWeight: 600 }} />)}
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" fontWeight={700} mb={2}>Attendees ({goingAttendees.length}/{event.capacity})</Typography>
            {goingAttendees.length === 0 ? (
              <Typography color="text.secondary">No RSVPs yet. Be the first!</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {goingAttendees.map(a => (
                  <Box key={a.userId} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem' }}>{a.avatar}</Avatar>
                    <Typography fontSize="0.875rem" fontWeight={500}>{a.name}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'sticky', top: 88 }}>
              <Paper sx={{ p: 3, mb: 3 }} elevation={0}>
                <Typography variant="h6" fontWeight={700} mb={2}>{isPast ? 'This event has ended' : 'Reserve your spot'}</Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" fontWeight={600} color="text.secondary">{goingAttendees.length} / {event.capacity} going</Typography>
                    </Box>
                    <Typography variant="caption" fontWeight={700} color={isFull ? 'error.main' : spotsLeft <= 5 ? 'warning.main' : 'success.main'}>
                      {isFull ? 'Full' : `${spotsLeft} spots left`}
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={fillPercent} sx={{ height: 6, borderRadius: 3, background: '#E5E7EB', '& .MuiLinearProgress-bar': { borderRadius: 3, background: isFull ? '#EF4444' : event.colorTag || '#4F46E5' } }} />
                </Box>

                {snackMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: 2, py: 0.5 }}>{snackMsg}</Alert>}

                {!currentUser ? (
                  <>
                    <Alert severity="info" sx={{ mb: 2, borderRadius: 2, fontSize: '0.85rem' }}>Sign in to RSVP for this event</Alert>
                    <Button component={Link} href="/auth/login" variant="contained" fullWidth size="large">Sign in to RSVP</Button>
                  </>
                ) : isAdmin ? (
                  <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.85rem' }}>You&apos;re the organizer of this event.</Alert>
                ) : isPast ? (
                  <Typography color="text.secondary" textAlign="center" py={1}>This event has passed.</Typography>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1.5, flexDirection: 'column' }}>
                    <Button
                      variant={myRsvp?.status === 'going' ? 'contained' : 'outlined'} color="success" fullWidth size="large"
                      disabled={isFull && myRsvp?.status !== 'going'} startIcon={<CheckCircleIcon />}
                      onClick={() => handleRsvp('going')}
                      sx={{ ...(myRsvp?.status === 'going' && { background: '#10B981', '&:hover': { background: '#059669' } }) }}
                    >
                      {myRsvp?.status === 'going' ? 'Going ✓' : isFull ? 'Event Full' : "I'm Going"}
                    </Button>
                    <Button
                      variant={myRsvp?.status === 'declined' ? 'contained' : 'outlined'} color="inherit" fullWidth startIcon={<CancelIcon />}
                      onClick={() => handleRsvp('declined')}
                      sx={{ ...(myRsvp?.status === 'declined' && { background: '#6B7280', color: '#fff', '&:hover': { background: '#4B5563' } }) }}
                    >
                      {myRsvp?.status === 'declined' ? 'Declined' : "Can't Make It"}
                    </Button>
                  </Box>
                )}
              </Paper>

              {organizer && (
                <Paper sx={{ p: 3, mb: 3 }} elevation={0}>
                  <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={2} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>Organized by</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 44, height: 44 }}>{organizer.avatar}</Avatar>
                    <Box>
                      <Typography fontWeight={700}>{organizer.name}</Typography>
                      {organizer.role === 'admin' && <Chip label="Admin" size="small" sx={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: '#fff', fontWeight: 700, fontSize: '0.7rem', height: 20 }} />}
                    </Box>
                  </Box>
                  {organizer.bio && <Typography variant="body2" color="text.secondary" mt={1.5} lineHeight={1.6}>{organizer.bio}</Typography>}
                </Paper>
              )}

              <Paper sx={{ p: 2.5 }} elevation={0}>
                <Button startIcon={<ShareIcon />} fullWidth variant="outlined" onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    setSnackMsg('Link copied to clipboard!');
                    setTimeout(() => setSnackMsg(''), 3000);
                  }
                }}>Share Event</Button>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle fontWeight={700}>Delete this event?</DialogTitle>
        <DialogContent><Typography color="text.secondary">This action cannot be undone. All RSVPs will be lost.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">Delete Event</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
