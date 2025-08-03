import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head />
      <body className="bg-white dark:bg-[#313338]">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}