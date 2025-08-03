import React, { useEffect } from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { useRouter } from "next/router";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

interface InviteCodePageProps {
  serverId?: string;
  error?: string;
}

export default function InviteCodePage({ serverId, error }: InviteCodePageProps) {
  const router = useRouter();

  useEffect(() => {
    if (serverId) {
      router.push(`/servers/${serverId}`);
    } else if (error) {
      router.push("/");
    }
  }, [serverId, error, router]);

  return <div>Processing invite...</div>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { inviteCode } = context.params!;
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user?.id) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }

  if (!inviteCode) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const existingServer = await prisma.server.findFirst({
    where: {
      inviteCode: inviteCode as string,
      members: {
        some: {
          profileId: session.user.id
        }
      }
    }
  });

  if (existingServer) {
    return {
      props: {
        serverId: existingServer.id,
      },
    };
  }

  try {
    const server = await prisma.server.update({
      where: {
        inviteCode: inviteCode as string
      },
      data: {
        members: {
          create: [{ profileId: session.user.id }]
        }
      }
    });

    return {
      props: {
        serverId: server.id,
      },
    };
  } catch (error) {
    return {
      props: {
        error: "Invalid invite code",
      },
    };
  }
};