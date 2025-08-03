import React from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { useRouter } from "next/router";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { getOrCreateConversation } from "@/lib/conversation";
import MainLayout from "@/components/layouts/main-layout";
import ServerLayout from "@/components/layouts/server-layout";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { MediaRoom } from "@/components/media-room";

interface MemberIdPageProps {
  serverId: string;
  currentMember: any;
  conversation: any;
  otherMember: any;
}

export default function MemberIdPage({
  serverId,
  currentMember,
  conversation,
  otherMember
}: MemberIdPageProps) {
  const router = useRouter();
  const { video } = router.query;

  return (
    <MainLayout>
      <ServerLayout serverId={serverId}>
        <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
          <ChatHeader
            imageUrl={otherMember.profile.imageUrl}
            name={otherMember.profile.name}
            serverId={serverId}
            type="conversation"
          />
          {video && <MediaRoom chatId={conversation.id} video audio />}
          {!video && (
            <>
              <ChatMessages
                member={currentMember}
                name={otherMember.profile.name}
                chatId={conversation.id}
                type="conversation"
                apiUrl="/api/direct-messages"
                paramKey="conversationId"
                paramValue={conversation.id}
                socketUrl="/api/socket/direct-messages"
                socketQuery={{
                  conversationId: conversation.id
                }}
              />
              <ChatInput
                name={otherMember.profile.name}
                type="conversation"
                apiUrl="/api/socket/direct-messages"
                query={{
                  conversationId: conversation.id
                }}
              />
            </>
          )}
        </div>
      </ServerLayout>
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { serverId, memberId } = context.params!;
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user?.id) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }

  const currentMember = await prisma.member.findFirst({
    where: {
      serverId: serverId as string,
      profileId: session.user.id
    },
    include: {
      profile: true
    }
  });

  if (!currentMember) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const conversation = await getOrCreateConversation(
    currentMember.id,
    memberId as string
  );

  if (!conversation) {
    return {
      redirect: {
        destination: `/servers/${serverId}`,
        permanent: false,
      },
    };
  }

  const { memberOne, memberTwo } = conversation;
  const otherMember = memberOne.profileId === session.user.id ? memberTwo : memberOne;

  return {
    props: {
      serverId,
      currentMember,
      conversation,
      otherMember,
    },
  };
};