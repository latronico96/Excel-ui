import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth-options';

export async function getGoogleAuth() {
    const session = await getServerSession(authOptions) as any;

    if (!session || !session.accessToken) {
        throw new Error('No session or access token found');
    }

    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );

    auth.setCredentials({
        access_token: session.accessToken as string,
        refresh_token: session.refreshToken as string,
    });

    return auth;
}
