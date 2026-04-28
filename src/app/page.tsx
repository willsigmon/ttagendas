import { redirect } from "next/navigation";

export const dynamic = "force-static";

export default function Home() {
  // No reason to land on a generic builder — every chair belongs to a team.
  // ERA is the in-flight rollout, so default there.
  redirect("/era");
}
