"use client";

import Link from "next/link";
import React from "react";
import { useLocale } from "@/i18n/locale-context";
import { localePath } from "@/i18n/navigation";

type LocaleLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & {
  readonly href: string;
};

/** Locale-safe internal link. External and hash-only hrefs pass through unchanged. */
export function LocaleLink({ href, ...props }: LocaleLinkProps): React.JSX.Element {
  const locale = useLocale();
  return <Link href={localePath(locale, href)} {...props} />;
}
