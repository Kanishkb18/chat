import { getServerSession } from "next-auth";
import { NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

import { prisma } from "@/lib/prisma";

export const currentProfilePages = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) return null;

  const profile = await prisma.profile.findUnique({
    where: { id: session.user.id }
  });

  return profile;
};
