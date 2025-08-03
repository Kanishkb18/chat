import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

import { prisma } from "@/lib/prisma";

export const initialProfile = async (req?: any, res?: any) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return null;
  }

  const profile = await prisma.profile.findUnique({
    where: {
      id: session.user.id
    }
  });

  if (profile) return profile;

  return null;
};
