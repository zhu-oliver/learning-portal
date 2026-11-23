import { serveArcadeGame } from "@/lib/arcade-game";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return serveArcadeGame("ecosystem-island");
}
