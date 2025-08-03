import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ModalProvider } from '@/components/providers/modal-provider';
import { SocketProvider } from '@/components/providers/socket-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import '@/app/globals.css';

export default function App({
  Component,
  pageProps: { session, ...pageProps }
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        storageKey="discord-clone-theme"
      >
        <SocketProvider>
          <ModalProvider />
          <QueryProvider>
            <Component {...pageProps} />
          </QueryProvider>
        </SocketProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}