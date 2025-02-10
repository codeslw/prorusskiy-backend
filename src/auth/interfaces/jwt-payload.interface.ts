export interface JwtPayload {
    sub: string;        // subject (user id)
    username: string;   // username
    role: string;      // user role
} 