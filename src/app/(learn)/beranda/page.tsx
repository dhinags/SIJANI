import { currentUser } from "@/lib/auth";
import { LearningGateway } from "@/components/learning-gateway";
export default async function Dashboard() { return <LearningGateway user={await currentUser()} />; }
