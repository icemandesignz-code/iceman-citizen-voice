import { Issue, Ministry, District, IssueCategory, IssueStatus, IssuePriority, User } from './types';
import React from 'react';

// Mock Users
const user1: User = { id: 'u1', name: 'Maria Rodriguez', avatar: 'M', location: 'Georgetown, Region 4', isVerified: true };
const user2: User = { id: 'u2', name: 'John Doe', avatar: 'J', location: 'Linden, Region 10', isVerified: false };
const user3: User = { id: 'u3', name: 'Admin', avatar: 'A', location: 'Gov', isVerified: true };
export const MOCK_CURRENT_USER: User = { id: 'u5', name: 'Ravi Kumar', avatar: 'R', location: 'Georgetown, Region 4', isVerified: true };


// Mock Issues
export const MOCK_ISSUES: Issue[] = [
  {
    id: '1',
    title: 'Poor Road Conditions Affecting Georgetown West',
    summary: 'Multiple potholes and damaged road surfaces are causing traffic congestion and vehicle damage...',
    description: 'The main road in Georgetown West has been deteriorating for months. There are numerous large potholes that pose a significant risk to drivers and pedestrians. This has led to increased traffic congestion during peak hours and several reports of vehicle damage. We urge the responsible ministry to address this issue promptly.',
    author: user1,
    category: IssueCategory.Infrastructure,
    location: 'Georgetown, Region 4',
    timestamp: '2 hours ago',
    status: IssueStatus.Pending,
    priority: IssuePriority.High,
    media: {
      photos: ['https://picsum.photos/seed/road1/400/300', 'https://picsum.photos/seed/road2/400/300'],
      videos: [],
      audio: ['audio_report.mp3'],
    },
    comments: [
        {id: 'c1', user: user2, text: 'I agree, my car got a flat tire here last week!', timestamp: '1 hour ago'},
        {id: 'c2', user: user3, text: 'Thank you for your report. We have forwarded this to the Ministry of Public Works.', timestamp: '30 mins ago'}
    ],
  },
  {
    id: '2',
    title: 'Lack of Medical Supplies at Local Clinic',
    summary: 'The community health clinic is running low on essential medical supplies, including bandages and antiseptics.',
    description: 'For the past few weeks, the health clinic in our area has been facing a severe shortage of basic medical supplies. This is affecting their ability to provide adequate care to residents. Patients are being asked to purchase their own supplies, which is not feasible for everyone.',
    author: user2,
    category: IssueCategory.Health,
    location: 'Linden, Region 10',
    timestamp: '1 day ago',
    status: IssueStatus.Approved,
    priority: IssuePriority.Medium,
    media: {
      photos: ['https://picsum.photos/seed/clinic1/400/300'],
      videos: ['https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'],
      audio: [],
    },
    comments: [],
  },
    {
    id: 'issue-by-user5',
    title: 'Request for Community Center Wifi',
    summary: 'The community center lacks public wifi, which would be a great resource for students and residents.',
    description: 'Our local community center is a hub for many activities, but it lacks a reliable internet connection for public use. Installing wifi would be immensely beneficial for students who need to do research, remote workers, and residents who need to access online services. This would be a great step towards digital inclusion.',
    author: MOCK_CURRENT_USER,
    category: IssueCategory.Education,
    location: 'Georgetown, Region 4',
    timestamp: '2 days ago',
    status: IssueStatus.Pending,
    priority: IssuePriority.Low,
    media: { photos: [], videos: [], audio: [] },
    comments: [
       {id: 'c4', user: user1, text: "This is a fantastic idea! I'd use it all the time.", timestamp: '1 day ago'}
    ],
  },
  {
    id: '3',
    title: 'Request for more teachers at Primary School',
    summary: 'The primary school has overcrowded classrooms and needs more teachers to ensure quality education.',
    description: 'With the recent increase in population in our area, the local primary school is struggling with overcrowded classrooms. The student-to-teacher ratio is too high, which is impacting the quality of education our children receive. We request the Ministry of Education to assign more teachers to our school.',
    author: { id: 'u4', name: 'Concerned Parent', avatar: 'C', location: 'New Amsterdam, Region 6', isVerified: false },
    category: IssueCategory.Education,
    location: 'New Amsterdam, Region 6',
    timestamp: '3 days ago',
    status: IssueStatus.Pending,
    priority: IssuePriority.Medium,
    media: { photos: [], videos: [], audio: [] },
    comments: [],
  },
  {
    id: '4',
    title: 'Streetlight Outage on Main Street Causing Accidents',
    summary: 'Multiple streetlights on the main commercial street have been out for over a week, raising security concerns and causing accidents.',
    description: 'The lack of functioning streetlights on Main Street has made the area unsafe at night. Local businesses are concerned about security, and residents feel unsafe walking in the dark. There have been two minor accidents reported in the last 48 hours. This is an urgent issue that needs immediate attention from the infrastructure ministry.',
    author: user1,
    category: IssueCategory.Infrastructure,
    location: 'Georgetown, Region 4',
    timestamp: '5 days ago',
    status: IssueStatus.Resolved,
    priority: IssuePriority.Critical,
    media: { photos: ['https://picsum.photos/seed/street/400/300'], videos: [], audio: [] },
    comments: [
        {id: 'c3', user: user3, text: 'Our maintenance crew has fixed the streetlights. Thank you for bringing this to our attention.', timestamp: '1 day ago'},
        {id: 'comment-by-user5', user: MOCK_CURRENT_USER, text: 'Great work! The street feels much safer now.', timestamp: '20 hours ago'}
    ],
  },
   {
    id: '5',
    title: 'Illegal Dumping Near Community Park',
    summary: 'There has been an increase in illegal dumping of waste near the community park, creating a health hazard.',
    description: 'Piles of garbage are accumulating near the entrance of the community park. This is not only an eyesore but also a serious health hazard for children and families who use the park. We need better waste management and enforcement to stop this.',
    author: user2,
    category: IssueCategory.Environment,
    location: 'Linden, Region 10',
    timestamp: '6 days ago',
    status: IssueStatus.Pending,
    priority: IssuePriority.Medium,
    media: { photos: ['https://picsum.photos/seed/dumping/400/300'], videos: [], audio: [] },
    comments: [],
  },
];

export const MOCK_MINISTRIES: Ministry[] = [
    { id: 'm1', name: 'Ministry of Public Works', description: 'Responsible for infrastructure development and maintenance.', contact: '592-226-7865', issuesManaged: 250, issuesResolved: 180 },
    { id: 'm2', name: 'Ministry of Health', description: 'Oversees public health services and medical facilities.', contact: '592-226-7338', issuesManaged: 180, issuesResolved: 150 },
    { id: 'm3', name: 'Ministry of Education', description: 'Manages the education system and public schools.', contact: '592-225-6822', issuesManaged: 120, issuesResolved: 95 },
    { id: 'm4', name: 'Ministry of Home Affairs', description: 'Ensures public security and safety.', contact: '592-225-7270', issuesManaged: 90, issuesResolved: 70 },
];

export const MOCK_DISTRICTS: District[] = [
    { id: 'd1', name: 'Georgetown', region: 'Region 4 (Demerara-Mahaica)', population: 118363, issuesReported: 320, issuesResolved: 250 },
    { id: 'd2', name: 'Linden', region: 'Region 10 (Upper Demerara-Berbice)', population: 27277, issuesReported: 150, issuesResolved: 110 },
    { id: 'd3', name: 'New Amsterdam', region: 'Region 6 (East Berbice-Corentyne)', population: 17329, issuesReported: 95, issuesResolved: 80 },
    { id: 'd4', name: 'Bartica', region: 'Region 7 (Cuyuni-Mazaruni)', population: 15342, issuesReported: 60, issuesResolved: 45 },
];

// Icons
export const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
export const MinistryIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22V6M5 12H2a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h3m14-5h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3M3 6l9-4 9 4M4 6v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V6"/></svg>
);
export const DistrictsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/><line x1="2" y1="12.25" x2="12" y2="18.75"/><line x1="22" y1="12.25" x2="12" y2="18.75"/></svg>
);
export const ResourcesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
);
export const SOSIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
);
export const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);
export const BellIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
);
export const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
export const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
);
export const AlertTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
);
export const SoundIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
);
export const PhotoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
);
export const VideoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
);
export const AudioIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
);
export const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
export const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
export const MessageSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);
export const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);
export const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);
export const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
);
export const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
);
export const FilterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
);
export const CrosshairIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>
);
export const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="15 18 9 12 15 6"></polyline></svg>
);
export const EditIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);
export const MicIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
);
export const ZapIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
);