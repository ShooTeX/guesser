import { cn } from "../../lib/utils";
import { take } from "remeda";
import Link from "next/link";
import { Fragment } from "react";

export type BreadcrumbsProperties = {
  className?: string;
  path: string;
};

export const Breadcrumbs = ({ className, path }: BreadcrumbsProperties) => {
  const paths = path.slice(1).split("/");
  return (
    <div
      className={cn(
        "flex items-center text-sm text-slate-500 dark:text-slate-400",
        className
      )}
    >
      {paths.map((path, index) => (
        <Fragment key={`${path}-${index}`}>
          <Link
            href={`/${take(paths, index + 1).join("/")}`}
            className={cn(
              "cursor-pointer text-sm hover:underline",
              index === paths.length - 1 &&
                "text-white hover:no-underline cursor-auto pointer-events-none",
              path === "dashboard" && "pointer-events-none"
            )}
          >
            {path}
          </Link>
          {index !== paths.length - 1 && <span className="mx-4"> / </span>}
        </Fragment>
      ))}
    </div>
  );
};
