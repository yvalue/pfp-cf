import { Fragment, type ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

const TOKEN_REGEX =
  /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\b\d[\d,]*(?:\.\d+)?\b)/gi;
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

function renderToken(token: string, index: number) {
  if (EMAIL_REGEX.test(token)) {
    return (
      <a
        key={index}
        href={`mailto:${token}`}
        className="text-primary font-semibold underline-offset-2 hover:underline"
      >
        {token}
      </a>
    );
  }

  return (
    <span
      key={index}
      className="text-primary font-semibold"
    >
      {token}
    </span>
  );
}

export function TextHighlight({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) {
  if (!text) {
    return null;
  }

  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let matchIndex = 0;

  for (const match of text.matchAll(TOKEN_REGEX)) {
    const token = match[0];
    const start = match.index ?? 0;

    if (start > lastIndex) {
      parts.push(
        <Fragment key={`text-${matchIndex}`}>
          {text.slice(lastIndex, start)}
        </Fragment>
      );
    }

    parts.push(renderToken(token, matchIndex));
    lastIndex = start + token.length;
    matchIndex += 1;
  }

  if (lastIndex < text.length) {
    parts.push(
      <Fragment key={`text-tail-${matchIndex}`}>
        {text.slice(lastIndex)}
      </Fragment>
    );
  }

  return <span className={cn(className)}>{parts}</span>;
}
