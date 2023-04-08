import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter as FontSans } from "next/font/google";
import { api } from "@/lib/trpc";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/toaster";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
				:root {
					--font-sans: ${fontSans.style.fontFamily};
				}
			}`}</style>
      <ReactQueryDevtools />
      <ClerkProvider {...pageProps}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Component {...pageProps} />
          <Toaster />
        </ThemeProvider>
      </ClerkProvider>
    </>
  );
}

export default api.withTRPC(App);
