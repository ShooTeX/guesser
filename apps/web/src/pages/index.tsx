import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { buildClerkProps, getAuth } from "@clerk/nextjs/server";
import type { GetServerSideProps } from "next";
import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/require-await
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { userId } = getAuth(context.req);
  if (userId) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  return { props: { ...buildClerkProps(context.req) } };
};

export default function Home() {
  return (
    <>
      <main className="flex h-screen w-full items-center justify-center">
        <div className="flex h-14 items-center space-x-4">
          <Logo />
          <Separator orientation="vertical" />
          <Link href="/sign-in">
            <Button size="lg">Login</Button>
          </Link>
        </div>
      </main>
    </>
  );
}
