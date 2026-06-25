import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isGitHubUserSite = repositoryName?.endsWith(".github.io");

export default defineConfig({
  base:
    process.env.GITHUB_ACTIONS && repositoryName && !isGitHubUserSite
      ? `/${repositoryName}/`
      : "/",
  plugins: [react()],
});
