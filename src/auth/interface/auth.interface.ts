import { UserRole } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    username: string;
    fullName: string;
    role: UserRole;
  };
}
