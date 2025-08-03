import React from "react";
import { ServerSidebar } from "@/components/server/server-sidebar";

interface ServerLayoutProps {
  children: React.ReactNode;
  serverId: string;
}

export default function ServerLayout({ children, serverId }: ServerLayoutProps) {
  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
        <ServerSidebar serverId={serverId} />
      </div>
      <main className="h-full md:pl-60">{children}</main>
    </div>
  );
}