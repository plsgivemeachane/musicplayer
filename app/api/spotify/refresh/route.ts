import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const refresh_token = cookieStore.get("sp_refresh_token")?.value;

    if (!refresh_token) {
        return NextResponse.json({ error: "Refresh token is required" }, { status: 400 });
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
                    grant_type: "refresh_token",
                    refresh_token,
                    client_id: client_id || "",
                    client_secret: client_secret || "",
                }),
            }
        );

        const tokenResponseJson = await tokenResponse.json();
        const { access_token, expires_in } = tokenResponseJson;

        // Update access token cookie
        cookieStore.set("sp_access_token", access_token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production",
            maxAge: expires_in
        });

        return NextResponse.json({ access_token });
    } catch (error) {
        console.error("Error refreshing access token", error);
        return NextResponse.json({ error: "Error refreshing access token" }, { status: 500 });
    }
}
