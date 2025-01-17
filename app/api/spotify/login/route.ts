import { NextRequest, NextResponse } from "next/server";

const client_id = process.env.SPOTIFY_CLIENT_ID;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

export async function GET(request: NextRequest) {
    const scope = [
        "playlist-read-private", 
        "playlist-read-collaborative", 
        "user-library-read",
        "user-library-modify"
    ].join(" ");

    const authUrl = new URL("https://accounts.spotify.com/authorize");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", client_id || "");
    authUrl.searchParams.set("scope", scope);
    authUrl.searchParams.set("redirect_uri", redirect_uri || "");

    return NextResponse.redirect(authUrl.toString());
}
