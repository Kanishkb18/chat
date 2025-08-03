import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

import { prisma } from "@/lib/prisma";

export const currentProfile = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const profile = await prisma.profile.findUnique({
    where: { id: session.user.id }
  });

  return profile;
};
