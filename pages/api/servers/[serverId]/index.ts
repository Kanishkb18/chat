import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { serverId } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const server = await prisma.server.findUnique({
        where: {
          id: serverId as string
        },
        include: {
          channels: {
            orderBy: {
              createdAt: "asc"
            }
          },
          members: {
            include: {
              profile: true
            },
            orderBy: {
              role: "asc"
            }
          }
        }
      });

      if (!server) {
        return res.status(404).json({ error: "Server not found" });
      }

      return res.status(200).json(server);
    } catch (error) {
      console.error("[SERVER_GET]", error);
      return res.status(500).json({ error: "Internal Error" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const { name, imageUrl } = req.body;

      const server = await prisma.server.update({
        where: { id: serverId as string, profileId: session.user.id },
        data: { name, imageUrl }
      });

      return res.status(200).json(server);
    } catch (error) {
      console.error("[SERVER_PATCH]", error);
      return res.status(500).json({ error: "Internal Error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const server = await prisma.server.delete({
        where: { id: serverId as string, profileId: session.user.id }
      });

      return res.status(200).json(server);
    } catch (error) {
      console.error("[SERVER_DELETE]", error);
      return res.status(500).json({ error: "Internal Error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}