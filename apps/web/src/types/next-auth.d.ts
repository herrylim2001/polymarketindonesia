import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      username: string;
      avatar: string | null;
      balance: number;
      kycStatus: string;
      isAdmin: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    avatar: string | null;
    balance: number;
    kycStatus: string;
    isAdmin: boolean;
  }
}
