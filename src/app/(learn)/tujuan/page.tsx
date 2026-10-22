import { redirect } from "next/navigation";
import { pageUser } from "@/lib/auth";
import { LearningGateway } from "@/components/learning-gateway";
export default async function Destinations() {
  const user = await pageUser();
  if (!user.profile?.onboardingDone) redirect("/identitas");
  return <LearningGateway user={user} />;
}
