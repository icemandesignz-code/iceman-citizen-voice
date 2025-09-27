import { ReactNode } from "react";

export enum Page {
  Home = 'Home',
  Ministry = 'Ministry',
  Districts = 'Districts',
  Resources = 'Resources',
  SOS = 'SOS',
  Profile = 'Profile',
  Map = 'Map',
  Communities = 'Communities',
  Settings = 'Settings',
}

export enum IssueCategory {
  Infrastructure = 'Infrastructure',
  Health = 'Health',
  Education = 'Education',
  Environment = 'Environment',
  Security = 'Security',
}

export enum IssueStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Resolved = 'Resolved',
}

export enum IssuePriority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Critical = 'Critical'
}

export interface User {
  id: string;
  name: string;
  avatar: string; // The initial
  avatarUrl?: string; // Optional URL for the profile picture
  location: string;
  isVerified: boolean;
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  timestamp: string;
}

export interface Issue {
  id:string;
  title: string;
  summary: string;
  description: string;
  author: User;
  category: IssueCategory;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  timestamp: string;
  status: IssueStatus;
  priority: IssuePriority;
  media: {
    photos: string[];
    videos: string[];
    audio: string[];
  };
  isAnonymous?: boolean;
  comments: Comment[];
}

export interface Ministry {
  id: string;
  name: string;
  description: string;
  contact: string;
  issuesManaged: number;
  issuesResolved: number;
}

export interface District {
    id: string;
    name: string;
    region: string;
    population: number;
    issuesReported: number;
    issuesResolved: number;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  type: 'gradient' | 'image' | 'video';
  url: string | null;
}

export enum ResourceCategory {
    OilAndGas = 'Oil & Gas',
    Mining = 'Mining',
    Agriculture = 'Agriculture',
    Logging = 'Logging',
    Fisheries = 'Fisheries',
}

export interface ResourceDataPoint {
    label: string;
    value: string;
}

export interface Resource {
    id: string;
    title: string;
    category: ResourceCategory;
    location: string;
    description: string;
    isLive: boolean;
    timestamp: string;
    dataPoints: ResourceDataPoint[];
}
