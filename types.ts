
export enum Page {
  Home = 'Home',
  Ministry = 'Ministry',
  Districts = 'Districts',
  Resources = 'Resources',
  SOS = 'SOS',
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

export enum UrgencyLevel {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High'
}

export interface User {
  id: string;
  name: string;
  avatar: string;
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
  id: string;
  title: string;
  summary: string;
  description: string;
  author: User;
  category: IssueCategory;
  location: string;
  timestamp: string;
  status: IssueStatus;
  urgency: UrgencyLevel;
  media: {
    photos: string[];
    videos: string[];
    audio: string[];
  };
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
