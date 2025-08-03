import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { InitialModal } from "@/components/modals/initial-modal";

interface SetupPageProps {
  hasServer: boolean;
  serverId?: string;
}

export default function SetupPage({ hasServer, serverId }: SetupPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/api/auth/signin");
      return;
    }

    if (hasServer && serverId) {
      router.push(`/servers/${serverId}`);
    }
  }, [session, status, hasServer, serverId, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  if (hasServer) {
    return null;
  }

  return <InitialModal />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user?.id) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }

  const server = await prisma.server.findFirst({
    where: {
      members: {
        some: {
          profileId: session.user.id
        }
      }
    }
  });

  if (server) {
    return {
      redirect: {
        destination: `/servers/${server.id}`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      hasServer: false,
    },
  };
};