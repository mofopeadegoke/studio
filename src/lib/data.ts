import type { User, Post, Event, Conversation, LeaderboardEntry } from './types';
import { subDays, subHours, formatISO } from 'date-fns';

export const users: User[] = [
  {
    id: '1',
    name: 'Alex Morgan',
    type: 'Player',
    avatarId: 'user-alex-morgan',
    bio: 'USWNT Forward | Two-time World Cup Champion 🏆 | Olympian | Mom',
    connections: ['2', '3', '6'],
    followers: ['2', '3', '4', '5', '6', '7'],
    following: ['2', '3', '5'],
    stats: {
      'Goals': 121,
      'Appearances': 216,
      'Assists': 49,
    },
    profileCoverId: 'event-soccer-tournament',
  },
  {
    id: '2',
    name: 'LeBron James',
    type: 'Player',
    avatarId: 'user-lebron-james',
    bio: '4x NBA Champion | 4x MVP | Strive for Greatness 🚀',
    connections: ['1', '4'],
    followers: ['1', '3', '4', '5', '6', '7'],
    following: ['1', '4', '5'],
    stats: {
      'Points': '38,652',
      'Rebounds': '10,667',
      'Assists': '10,354',
    },
    profileCoverId: 'event-basketball-camp',
  },
  {
    id: '3',
    name: 'Serena Williams',
    type: 'Player',
    avatarId: 'user-serena-williams',
    bio: '23x Grand Slam Champion | Entrepreneur | Investor',
    connections: ['1'],
    followers: ['1', '2', '4', '5', '6'],
    following: ['1', '2', '5'],
    stats: {
      'Grand Slams': 23,
      'Career Titles': 73,
      'Win-Loss': '858-156',
    },
  },
  {
    id: '4',
    name: 'Tom Brady',
    type: 'Player',
    avatarId: 'user-tom-brady',
    bio: '7x Super Bowl Champion | Husband, Father, Brother, Son',
    connections: ['2'],
    followers: ['1', '2', '3', '5', '6'],
    following: ['2', '5'],
  },
  {
    id: '5',
    name: 'LA Lakers',
    type: 'Team',
    avatarId: 'team-lakers',
    bio: 'Official account of the 17-time NBA Champion Los Angeles Lakers.',
    connections: [],
    followers: ['1', '2', '3', '4', '6', '7'],
    following: ['1', '2', '3', '4'],
    stats: {
      'Championships': 17,
      'Conference Titles': 32,
      'Division Titles': 24,
    },
    profileCoverId: 'post-basketball-dunk',
  },
  {
    id: '6',
    name: 'John Doe',
    type: 'Fan',
    avatarId: 'fan-john-doe',
    bio: 'Die-hard sports fan. Love the Lakers and USWNT. Following the greats!',
    connections: ['1'], // Connected with Alex Morgan
    followers: ['1', '5'],
    following: ['1', '2', '5'],
  },
  {
    id: '7',
    name: 'Jane Smith',
    type: 'Scout',
    avatarId: 'scout-jane-smith',
    bio: 'Talent scout for youth soccer. Always looking for the next generation of stars.',
    connections: [],
    followers: ['1', '5'],
    following: ['1', '5'],
  },
];

const now = new Date();

export const posts: Post[] = [
  {
    id: 'p1',
    authorId: '1',
    content: 'Great win with the team today! Felt good to be back on the pitch and get on the scoresheet. On to the next one! 💪⚽',
    imageId: 'post-soccer-goal',
    createdAt: formatISO(subHours(now, 2)),
    likes: 1200,
    comments: [
      { id: 'c1', commenterId: '6', text: 'Amazing goal Alex!', createdAt: formatISO(subHours(now, 1))},
      { id: 'c2', commenterId: '5', text: '🔥', createdAt: formatISO(subHours(now, 1)) },
    ],
  },
  {
    id: 'p2',
    authorId: '2',
    content: 'Taco Tuesday! 🌮 Nothing better after a hard practice.',
    createdAt: formatISO(subHours(now, 22)),
    likes: 5400,
    comments: [],
  },
  {
    id: 'p3',
    authorId: '5',
    content: 'Game day in LA! Ready to defend our home court tonight against a tough opponent. Let\'s get it, Laker Nation! 💜💛',
    imageId: 'post-team-celebration',
    createdAt: formatISO(subDays(now, 1)),
    likes: 23000,
    comments: [
      { id: 'c3', commenterId: '6', text: 'Let\'s go Lakers!', createdAt: formatISO(subDays(now, 1)) },
    ],
  },
  {
    id: 'p4',
    authorId: '7',
    content: 'Attending the Youth National Championship this weekend. Excited to see the talent on display. If you know any standout U-17 players, tag them below!',
    createdAt: formatISO(subDays(now, 3)),
    likes: 150,
    comments: [],
  },
];

export const events: Event[] = [
  {
    id: 'e1',
    title: 'City Marathon 2024',
    description: 'Join thousands of runners for the annual city marathon. All skill levels welcome.',
    date: formatISO(new Date(now.getFullYear(), now.getMonth() + 1, 15, 8, 0, 0)),
    location: 'Downtown Central Park',
    bannerId: 'event-marathon',
    registeredUsers: ['2', '3'],
  },
  {
    id: 'e2',
    title: 'Summer Soccer Tournament',
    description: 'A competitive 5v5 soccer tournament for local amateur teams. Prizes for the winning team!',
    date: formatISO(new Date(now.getFullYear(), now.getMonth() + 2, 5, 10, 0, 0)),
    location: 'Westside Sports Complex',
    bannerId: 'event-soccer-tournament',
    registeredUsers: ['1', '7'],
  },
  {
    id: 'e3',
    title: 'Youth Basketball Camp',
    description: 'A week-long basketball camp for ages 12-16, featuring guest coaches and skill development drills.',
    date: formatISO(new Date(now.getFullYear(), now.getMonth() + 2, 20, 9, 0, 0)),
    location: 'Community Rec Center',
    bannerId: 'event-basketball-camp',
    registeredUsers: ['2', '5', '6'],
  },
];


export const conversations: Conversation[] = [
  {
    id: 'conv1',
    participantIds: ['1', '6'], // Alex Morgan and John Doe (Fan)
    messages: [
      { id: 'm1', senderId: '1', receiverId: '6', text: 'Thanks for the support at the game!', timestamp: formatISO(subDays(now, 2)) },
      { id: 'm2', senderId: '6', receiverId: '1', text: 'Of course! That was an incredible match. You played amazing!', timestamp: formatISO(subDays(now, 1)) },
    ],
  },
  {
    id: 'conv2',
    participantIds: ['1', '2'], // Alex Morgan and LeBron James
    messages: [
      { id: 'm3', senderId: '2', receiverId: '1', text: 'Great goal the other day.', timestamp: formatISO(subHours(now, 5)) },
      { id: 'm4', senderId: '1', receiverId: '2', text: 'Thanks, LeBron! Appreciate it.', timestamp: formatISO(subHours(now, 4)) },
      { id: 'm5', senderId: '1', receiverId: '2', text: 'Good luck with the rest of your season!', timestamp: formatISO(subHours(now, 4)) },
    ],
  },
  {
    id: 'conv3',
    participantIds: ['1', '5'], // Alex Morgan and LA Lakers
    messages: [
      { id: 'm6', senderId: '5', receiverId: '1', text: 'The organization is proud of your recent accomplishments.', timestamp: formatISO(subDays(now, 5)) },
    ],
  },
];


export const leaderboardData: { [key: string]: LeaderboardEntry[] } = {
  'Fitness Challenge': [
    { rank: 1, userId: '2', score: 9850, category: 'Fitness Challenge' },
    { rank: 2, userId: '3', score: 9540, category: 'Fitness Challenge' },
    { rank: 3, userId: '1', score: 9210, category: 'Fitness Challenge' },
    { rank: 4, userId: '4', score: 8900, category: 'Fitness Challenge' },
    { rank: 5, userId: '7', score: 7500, category: 'Fitness Challenge' },
  ],
  'Skill Competition': [
    { rank: 1, userId: '1', score: 120, category: 'Skill Competition' },
    { rank: 2, userId: '2', score: 115, category: 'Skill Competition' },
    { rank: 3, userId: '4', score: 105, category: 'Skill Competition' },
    { rank: 4, userId: '3', score: 98, category: 'Skill Competition' },
    { rank: 5, userId: '6', score: 80, category: 'Skill Competition' },
  ],
};
