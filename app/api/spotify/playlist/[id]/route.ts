import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
    request: NextRequest, 
    { params }: { params: { id: string } }
) {
    const cookieStore = await cookies();
    const access_token = cookieStore.get("sp_access_token")?.value;
    const playlistId = params.id;

    if (!access_token) {
        return NextResponse.json({ error: "Access token is required" }, { status: 400 });
    }

    try {
        const response = await fetch(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Error retrieving playlist tracks for ${playlistId}`);
        }

        return NextResponse.json(await response.json());
    } catch (error) {
        console.error(`Error retrieving playlist tracks for ${playlistId}`, error);
        return NextResponse.json({ error: "Error retrieving playlist tracks" }, { status: 500 });
    }
}
