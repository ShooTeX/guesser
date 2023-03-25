import type { WithUserProp } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { HelpCircle, Play, List } from "lucide-react";
import { Button } from "./ui/button";
import type { PropsWithChildren, ReactNode } from "react";
import { Breadcrumbs } from "./ui/breadcrumbs";
import { useRouter } from "next/router";
import Link from "next/link";

export type DashboardLayoutProperties = PropsWithChildren &
  WithUserProp & {
    headline: string;
    subline: string;
    action?: ReactNode;
  };

export const DashboardLayout = ({
  children,
  headline,
  subline,
  user,
  action,
}: DashboardLayoutProperties) => {
  const { asPath } = useRouter();
  const manageRoutes = [
    {
      title: "Playlists",
      href: "/dashboard/playlists",
      icon: List,
    },
    {
      title: "Questions",
      href: "/dashboard/questions",
      icon: HelpCircle,
    },
  ];
  return (
    <div className="grid min-h-screen grid-cols-4 xl:grid-cols-6">
      <aside className="border-r border-r-slate-200 pb-12 dark:border-r-slate-700">
        <div className="px-8 py-6">
          <div className="inline-flex flex-col items-end">
            <span className="flex items-center justify-center text-2xl font-bold leading-none tracking-tight text-slate-50">
              <HelpCircle className="mr-1" />
              GUESSER
            </span>
            <span className="text-sm text-slate-500">
              by <strong className="tracking-tight">ShooTeX</strong>
            </span>
          </div>
        </div>
        <div className="space-y-4">
          <div className="px-8 py-6">
            <Button className="w-full uppercase">
              <Play className="mr-2 h-4 w-4" />
              new game
            </Button>
          </div>
          <div className="px-8 py-6">
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
              Manage
            </h2>
            <div className="mt-1 flex flex-col space-y-1">
              {manageRoutes.map((route) => (
                <Link href={route.href} key={route.title}>
                  <Button
                    variant={asPath.includes(route.href) ? "subtle" : "ghost"}
                    className="w-full justify-start"
                  >
                    <route.icon className="mr-2 h-4 w-4" />
                    {route.title}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>
      <div className="col-span-3 m-auto h-full w-full max-w-5xl px-8 py-6 xl:col-span-5">
        <div className="flex items-center justify-between">
          <Breadcrumbs path={asPath} />
          <div className="flex items-center">
            {user && (
              <>
                <span className="mr-2 text-sm">
                  Hey <strong>{user.firstName}</strong>
                </span>
                <UserButton />
              </>
            )}
          </div>
        </div>
        <div className="mt-14 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {headline}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {subline}
            </p>
          </div>
          {action && action}
        </div>
        <div className="my-4 h-[1px] w-full bg-slate-200 dark:bg-slate-700"></div>
        {children}
      </div>
    </div>
  );
};
