import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { appName, gitConfig } from "./shared";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const baseOptions = (): BaseLayoutProps => ({
  nav: {
    title: (
      <span className="flex items-center gap-2 font-semibold text-base select-none">
        <img
          src={`${basePath}/styled-cva.svg`}
          width="24"
          height="24"
          className="w-6 h-6 object-contain translate-y-px"
          alt="styled-cva logo"
        />
        <span className="leading-none">{appName}</span>
      </span>
    ),
  },
  githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
});
