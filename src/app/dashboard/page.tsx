'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useApp } from '@/context/AppContext';

const formatDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const formatTime = (t: string | null) => {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};
const isUpcoming = (d: string) => new Date(d + 'T23:59:59') >= new Date();

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, isAdmin, events, users, deleteEvent } = useApp();
  const [tab, setTab] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser && !isAdmin) router.push('/events');
    if (!currentUser) router.push('/auth/login');
  }, [currentUser, isAdmin, router]);

  const stats = useMemo(() => {
    const upcomingEvents = events.filter(e => isUpcoming(e.date));
    const totalRsvps = events.reduce((s, e) => s + (e.attendees || []).filter(a => a.status === 'going').length, 0);
    const members = users.filter(u => u.role === 'member');
    return { total: events.length, upcoming: upcomingEvents.length, members: members.length, rsvps: totalRsvps };
  }, [events, users]);

  const sortedEvents = useMemo(() =>
    [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [events]
  );

  const members = useMemo(() =>
    users.filter(u => u.role === 'member').sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()),
    [users]
  );

  const handleDeleteConfirm = () => {
    if (deleteTarget) { deleteEvent(deleteTarget); setDeleteTarget(null); }
  };

  if (!currentUser || !isAdmin) return null;

  const STAT_CARDS = [
    { label: 'Total Events', value: stats.total, icon: <EventIcon />, color: '#4F46E5', bg: '#EEF2FF' },
    { label: 'Upcoming Events', value: stats.upcoming, icon: <CalendarTodayIcon />, color: '#10B981', bg: '#D1FAE5' },
    { label: 'Members', value: stats.members, icon: <PeopleIcon />, color: '#F59E0B', bg: '#FEF3C7' },
    { label: 'Total RSVPs', value: stats.rsvps, icon: <CheckCircleIcon />, color: '#EC4899', bg: '#FCE7F3' },
  ];

  return (
    <Box sx={{ background: '#F8F7FF', minHeight: 'calc(100vh - 64px)', pb: 8 }}>
      <Box sx={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 60%, #4338CA 100%)', py: 5 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>Admin Dashboard</Typography>
              <Typography variant="h4" color="#fff" fontWeight={800}>Welcome back, {currentUser.name.split(' ')[0]} 👋</Typography>
            </Box>
            <Button component={Link} href="/events/create" variant="contained" startIcon={<AddCircleIcon />}
              sx={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', fontWeight: 700, px: 3, boxShadow: '0 4px 14px rgba(245,158,11,0.4)' }}>
              New Event
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {STAT_CARDS.map(s => (
            <Grid item xs={6} md={3} key={s.label}>
              <Paper sx={{ p: 2.5 }} elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', '& svg': { fontSize: 20, color: s.color } }}>
                    {s.icon}
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main', opacity: 0.7 }} />
                </Box>
                <Typography variant="h4" fontWeight={800} sx={{ fontFamily: '"Syne", sans-serif', lineHeight: 1 }}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{s.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab label={`Events (${events.length})`} sx={{ fontWeight: 700, fontFamily: '"Syne", sans-serif' }} />
              <Tab label={`Members (${members.length})`} sx={{ fontWeight: 700, fontFamily: '"Syne", sans-serif' }} />
            </Tabs>
          </Box>

          {tab === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Event</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Attendance</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedEvents.map(event => {
                    const going = (event.attendees || []).filter(a => a.status === 'going').length;
                    const fill = Math.min(100, (going / event.capacity) * 100);
                    const upcoming = isUpcoming(event.date);
                    return (
                      <TableRow key={event.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ maxWidth: 280 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 8, height: 40, borderRadius: 1, background: event.colorTag || '#4F46E5', flexShrink: 0 }} />
                            <Typography fontWeight={700} fontSize="0.875rem" noWrap>{event.title}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography fontSize="0.8rem" fontWeight={600}>{formatDate(event.date)}</Typography>
                          <Typography fontSize="0.75rem" color="text.secondary">{formatTime(event.time)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={event.category} size="small" sx={{ background: `${event.colorTag || '#4F46E5'}15`, color: event.colorTag || '#4F46E5', fontWeight: 700, fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell sx={{ minWidth: 140 }}>
                          <Typography fontSize="0.8rem" fontWeight={600} mb={0.5}>{going} / {event.capacity}</Typography>
                          <LinearProgress variant="determinate" value={fill} sx={{ height: 4, borderRadius: 2, background: '#E5E7EB', '& .MuiLinearProgress-bar': { borderRadius: 2, background: fill >= 90 ? '#EF4444' : event.colorTag || '#4F46E5' } }} />
                        </TableCell>
                        <TableCell>
                          <Chip label={upcoming ? 'Upcoming' : 'Past'} size="small" sx={{ background: upcoming ? '#D1FAE5' : '#F3F4F6', color: upcoming ? '#047857' : '#6B7280', fontWeight: 700, fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                            <Tooltip title="View"><IconButton size="small" component={Link} href={`/events/${event.id}`}><VisibilityIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                            <Tooltip title="Edit"><IconButton size="small" component={Link} href={`/events/create?edit=${event.id}`}><EditIcon sx={{ fontSize: 18, color: 'primary.main' }} /></IconButton></Tooltip>
                            <Tooltip title="Delete"><IconButton size="small" onClick={() => setDeleteTarget(event.id)}><DeleteIcon sx={{ fontSize: 18, color: 'error.main' }} /></IconButton></Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {events.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                        No events yet.{' '}<Box component={Link} href="/events/create" sx={{ color: 'primary.main', fontWeight: 700 }}>Create your first event</Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tab === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Member</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell>Events Going</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...users].sort((a, b) => a.role === 'admin' ? -1 : 1).map(user => {
                    const eventsGoing = events.filter(e => (e.attendees || []).some(a => a.userId === user.id && a.status === 'going')).length;
                    return (
                      <TableRow key={user.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 36, height: 36, fontSize: '0.8rem' }}>{user.avatar}</Avatar>
                            <Typography fontWeight={700} fontSize="0.875rem">{user.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell><Typography fontSize="0.875rem" color="text.secondary">{user.email}</Typography></TableCell>
                        <TableCell>
                          <Chip label={user.role === 'admin' ? 'Admin' : 'Member'} size="small"
                            sx={{ background: user.role === 'admin' ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : '#F3F4F6', color: user.role === 'admin' ? '#fff' : '#374151', fontWeight: 700, fontSize: '0.7rem' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography fontSize="0.8rem" color="text.secondary">
                            {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <CheckCircleIcon sx={{ fontSize: 16, color: eventsGoing > 0 ? 'success.main' : 'text.disabled' }} />
                            <Typography fontSize="0.875rem" fontWeight={600}>{eventsGoing}</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {users.length === 0 && (
                    <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>No members yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle fontWeight={700}>Delete this event?</DialogTitle>
        <DialogContent><Typography color="text.secondary">This action is permanent and all RSVPs will be lost.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined">Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
