import { NextResponse, type NextRequest } from "next/server";
import { getRecommendations } from "@/lib/data";
import { focusSchema } from "@/lib/validation";

// GET /api/recommendations?focus=matcha|coffee|both&limit=5
export async function GET(request: NextRequest) {
  const focus = focusSchema.parse(request.nextUrl.searchParams.get("focus") ?? undefined);
  const limit = Math.min(20, Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 5));
  const result = await getRecommendations(focus, limit);
  return NextResponse.json(result);
}
