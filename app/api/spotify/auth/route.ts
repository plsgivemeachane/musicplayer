import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("sp_access_token")?.value;
    const refreshToken = cookieStore.get("sp_refresh_token")?.value;

    if (!accessToken || !refreshToken) {
        return NextResponse.json({ status: 401, message: "Not authenticated" });
    }

    // Optionally, you could add a token validation check here
    return NextResponse.json({ status: 200, message: "Authenticated" });
}
