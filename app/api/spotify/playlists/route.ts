import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const access_token = cookieStore.get("sp_access_token")?.value;

    if (!access_token) {
        return NextResponse.json({ error: "Access token is required" }, { status: 400 });
    }

    try {
        // const response = await fetch("https://api.spotify.com/v1/me/playlists", {
        const response = await fetch("https://api.spotify.com/v1/browse/categories/0JQ5DAt0tbjZptfcdMSKl3", {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Error retrieving playlists");
        }

        return NextResponse.json(await response.json());
    } catch (error) {
        console.error("Error retrieving playlists", error);
        return NextResponse.json({ error: "Error retrieving playlists" }, { status: 500 });
    }
}
