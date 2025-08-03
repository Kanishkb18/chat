import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import MainLayout from "@/components/layouts/main-layout";
import ServerLayout from "@/components/layouts/server-layout";

interface ServerIdPageProps {
  serverId: string;
  initialChannelId: string;
}

export default function ServerIdPage({ serverId, initialChannelId }: ServerIdPageProps) {
  return (
    <MainLayout>
      <ServerLayout serverId={serverId}>
        <div>Redirecting...</div>
      </ServerLayout>
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { serverId } = context.params!;
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user?.id) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }

  const server = await prisma.server.findUnique({
    where: {
      id: serverId as string,
      members: {
        some: {
          profileId: session.user.id
        }
      }
    },
    include: {
      channels: {
        where: {
          name: "general"
        },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!server) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const initialChannel = server.channels[0];

  if (initialChannel?.name !== "general") {
    return {
      notFound: true,
    };
  }

  return {
    redirect: {
      destination: `/servers/${serverId}/channels/${initialChannel.id}`,
      permanent: false,
    },
  };
};