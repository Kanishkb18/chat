import React from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { ChannelType } from "@prisma/client";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import MainLayout from "@/components/layouts/main-layout";
import ServerLayout from "@/components/layouts/server-layout";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MediaRoom } from "@/components/media-room";

interface ChannelIdPageProps {
  serverId: string;
  channel: {
    id: string;
    name: string;
    type: ChannelType;
    serverId: string;
  };
  member: {
    id: string;
    role: string;
    profileId: string;
    serverId: string;
  };
}

export default function ChannelIdPage({ serverId, channel, member }: ChannelIdPageProps) {
  return (
    <MainLayout>
      <ServerLayout serverId={serverId}>
        <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
          <ChatHeader
            name={channel.name}
            serverId={channel.serverId}
            type="channel"
          />
          {channel.type === ChannelType.TEXT && (
            <>
              <ChatMessages
                member={member}
                name={channel.name}
                chatId={channel.id}
                type="channel"
                apiUrl="/api/messages"
                socketUrl="/api/socket/messages"
                socketQuery={{
                  channelId: channel.id,
                  serverId: channel.serverId
                }}
                paramKey="channelId"
                paramValue={channel.id}
              />
              <ChatInput
                name={channel.name}
                type="channel"
                apiUrl="/api/socket/messages"
                query={{
                  channelId: channel.id,
                  serverId: channel.serverId
                }}
              />
            </>
          )}
          {channel.type === ChannelType.AUDIO && (
            <MediaRoom chatId={channel.id} video={false} audio={true} />
          )}
          {channel.type === ChannelType.VIDEO && (
            <MediaRoom chatId={channel.id} video={true} audio={true} />
          )}
        </div>
      </ServerLayout>
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { serverId, channelId } = context.params!;
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user?.id) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }

  const channel = await prisma.channel.findUnique({
    where: { id: channelId as string }
  });

  const member = await prisma.member.findFirst({
    where: { serverId: serverId as string, profileId: session.user.id }
  });

  if (!channel || !member) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      serverId,
      channel,
      member,
    },
  };
};