export interface UserType {
  id: string;
  email: string;
  name?: string;
  image?: string | null;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Session {
  user: UserType;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
  };
}

export type SocialProvider =
  | "google"
  | "github"
  | "facebook"
  | "twitter"
  | "linkedin";

export interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
  token: string;
}

export interface TwoFactorFormData {
  code: string;
}

export interface TwoFactorSetupData {
  totpURI: string;
  secret: string;
  backupCodes: string[];
}
