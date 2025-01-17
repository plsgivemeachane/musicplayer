import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.json({ error: "No authorization code received" }, { status: 400 });
    }

    try {
        const tokenResponse = await fetch(
            "https://accounts.spotify.com/api/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    grant_type: "authorization_code",
                    code,
                    redirect_uri: redirect_uri || "",
                    client_id: client_id || "",
                    client_secret: client_secret || "",
                }),
            }
        );

        const tokenData = await tokenResponse.json();
        const { access_token, refresh_token, expires_in } = tokenData;

        // Set cookies for tokens
        const cookieStore = await cookies();
        cookieStore.set("sp_access_token", access_token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production",
            maxAge: expires_in
        });
        cookieStore.set("sp_refresh_token", refresh_token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production"
        });

        // Redirect to Spotify page
        return NextResponse.redirect(new URL("/spotify", request.url));

    } catch (error) {
        console.error("Error retrieving access token", error);
        return NextResponse.json({ error: "Error retrieving access token" }, { status: 500 });
    }
}
