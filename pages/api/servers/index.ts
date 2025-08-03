import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { MemberRole } from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const servers = await prisma.server.findMany({
        where: {
          members: {
            some: {
              profileId: session.user.id
            }
          }
        }
      });

      return res.status(200).json(servers);
    } catch (error) {
      console.error("[SERVERS_GET]", error);
      return res.status(500).json({ error: "Internal Error" });
    }
  }

  if (req.method === "POST") {
    try {
      const { name, imageUrl } = req.body;

      const server = await prisma.server.create({
        data: {
          profileId: session.user.id,
          name,
          imageUrl,
          inviteCode: uuidv4(),
          channels: { create: [{ name: "general", profileId: session.user.id }] },
          members: { create: [{ profileId: session.user.id, role: MemberRole.ADMIN }] }
        }
      });

      return res.status(200).json(server);
    } catch (error) {
      console.error("[SERVERS_POST]", error);
      return res.status(500).json({ error: "Internal Error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}