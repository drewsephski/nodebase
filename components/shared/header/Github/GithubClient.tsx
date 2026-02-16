"use client";

import Button from "@/components/ui/shadcn/button";
import GithubIcon from "./_svg/GithubIcon";

export default function HeaderGithubClient() {
  return (
    <a
      className="contents"
      href="https://github.com/drewsephski/nodebase"
      target="_blank"
    >
      <Button variant="secondary">
        <GithubIcon />
        Star on GitHub
      </Button>
    </a>
  );
}
