
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { password } = await req.json();
        const appPassword = process.env.APP_PASSWORD || 'admin';

        if (password === appPassword) {
            // Set cookie valid for 7 days
            const isProduction = process.env.NODE_ENV === 'production';
            const isHttps = process.env.NEXT_PUBLIC_APP_URL?.startsWith('https');

            (await cookies()).set('auth', 'true', {
                httpOnly: true,
                // Only use secure cookie if explicitly on HTTPS or in production with HTTPS
                secure: isProduction && isHttps,
                maxAge: 60 * 60 * 24 * 7,
                path: '/',
            });
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
        }
    } catch (error) {
        const err = error as { message?: string };
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
