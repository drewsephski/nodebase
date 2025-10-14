import { requireAuth } from "@/lib/auth-utils";
import prisma from "@/lib/db";
const Page = async () => {
  await requireAuth();
  const workflows = await prisma.workflow.findMany();
  return <p>Workflows</p>;
};
export default Page;
