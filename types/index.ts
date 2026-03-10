export interface User {
  id: string;
  email: string;
  username?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Content {
  id: string;
  title: string;
  type: string;
  link?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ShareResponse {
  shareLink: string;
  shareId: string;
  expiresAt?: string;
}

export interface SharedBrain {
  id: string;
  content: Content[];
  owner?: User;
  createdAt: string;
}

export interface FormErrors {
  email?: string;
  password?: string;
  username?: string;
  title?: string;
}
