'use client';
import Link from 'next/link';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import VideocamIcon from '@mui/icons-material/Videocam';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { Event, Attendee } from '@/types';

interface EventCardProps {
  event: Event;
  myRsvp?: Attendee | null;
  compact?: boolean;
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (t: string | null) => {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const isPast = (dateStr: string) => new Date(dateStr + 'T23:59:59') < new Date();
const goingCount = (event: Event) => (event.attendees || []).filter(a => a.status === 'going').length;

export default function EventCard({ event, myRsvp, compact = false }: EventCardProps) {
  const past = isPast(event.date);
  const going = goingCount(event);
  const isFull = going >= event.capacity;

  return (
    <Link href={`/events/${event.id}`} className="event-card-link" style={{ display: 'block' }}>
      <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden', opacity: past ? 0.75 : 1 }}>
        <Box sx={{ height: 5, background: `linear-gradient(90deg, ${event.colorTag || '#4F46E5'}, ${event.colorTag || '#7C3AED'}99)` }} />

        {(past || isFull) && (
          <Box sx={{
            position: 'absolute', top: 20, right: 16,
            background: past ? '#6B7280' : '#EF4444',
            color: '#fff', borderRadius: 1,
            px: 1, py: 0.25, fontSize: '0.7rem', fontWeight: 700,
            letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            {past ? 'Past' : 'Full'}
          </Box>
        )}

        <CardContent sx={{ p: compact ? 2 : 2.5 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
            <Chip
              label={event.category}
              size="small"
              sx={{ background: `${event.colorTag || '#4F46E5'}18`, color: event.colorTag || '#4F46E5', fontWeight: 700, fontSize: '0.7rem' }}
            />
            {event.online && (
              <Chip icon={<VideocamIcon sx={{ fontSize: '14px !important' }} />} label="Online" size="small"
                sx={{ background: '#EEF2FF', color: '#4F46E5', fontSize: '0.7rem', fontWeight: 600 }}
              />
            )}
            {myRsvp?.status === 'going' && (
              <Chip icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />} label="Going" size="small"
                sx={{ background: '#D1FAE5', color: '#047857', fontSize: '0.7rem', fontWeight: 700 }}
              />
            )}
          </Box>

          <Typography variant={compact ? 'subtitle1' : 'h6'} fontWeight={700}
            sx={{ mb: 1.5, lineHeight: 1.3, color: 'text.primary', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {event.title}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" fontSize="0.8rem">{formatDate(event.date)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                {formatTime(event.time)}{event.endTime ? ` – ${formatTime(event.endTime)}` : ''}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" fontSize="0.8rem"
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                {event.location}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {going > 0 ? (
                <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 22, height: 22, fontSize: '0.6rem' } }}>
                  {(event.attendees || []).filter(a => a.status === 'going').map(a => (
                    <Avatar key={a.userId} sx={{ width: 22, height: 22, fontSize: '0.6rem' }}>{a.avatar}</Avatar>
                  ))}
                </AvatarGroup>
              ) : (
                <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              )}
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {going} going
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {event.capacity - going} spots left
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
}
