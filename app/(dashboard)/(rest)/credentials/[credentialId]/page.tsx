import { getAuth } from "@/lib/auth-utils";

interface PageProps {
  params: Promise<{ credentialId: string }>;
}

// http://localhost:3000/credentials/123

const Page = async ({ params }: PageProps) => {
  const session = await getAuth();
  const { credentialId } = await params;

  // If user is not authenticated, still show the page but they won't be able to perform actions
  return <p>Credential id: {credentialId}</p>;
}

export default Page;
