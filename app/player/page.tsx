import MusicPlayer from "@/components/music-player";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default async function PlayerPage() {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  return <MusicPlayer />;
}