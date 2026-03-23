import type { CSSProperties } from 'react';
import { WandSparkles } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

interface AspectRatioOptionProps {
  ratio: string;
  selected?: boolean;
  className?: string;
}

const PREVIEW_WIDTH = 18;
const PREVIEW_HEIGHT = 14;
const MIN_PREVIEW_SIZE = 4;

function getRatioDimensions(ratio: string) {
  if (ratio === 'auto') {
    return null;
  }

  const [rawWidth, rawHeight] = ratio.split(':');
  const width = Number(rawWidth);
  const height = Number(rawHeight);

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return {
      width: 10,
      height: 10,
    };
  }

  const scale = Math.min(PREVIEW_WIDTH / width, PREVIEW_HEIGHT / height);

  return {
    width: Math.max(Math.round(width * scale), MIN_PREVIEW_SIZE),
    height: Math.max(Math.round(height * scale), MIN_PREVIEW_SIZE),
  };
}

function AspectRatioIcon({
  ratio,
  selected = false,
}: Pick<AspectRatioOptionProps, 'ratio' | 'selected'>) {
  const dimensions = getRatioDimensions(ratio);

  if (!dimensions) {
    return (
      <span
        aria-hidden
        className={cn(
          'flex h-6 w-7 items-center justify-center transition-colors',
          selected ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        <WandSparkles className="size-3.5" />
      </span>
    );
  }

  const style = {
    width: `${dimensions.width}px`,
    height: `${dimensions.height}px`,
  } satisfies CSSProperties;

  return (
    <span
      aria-hidden
      className="flex h-6 w-7 items-center justify-center"
    >
      <span
        className={cn(
          'border transition-colors',
          selected ? 'border-primary' : 'border-foreground/35'
        )}
        style={style}
      />
    </span>
  );
}

export function AspectRatioOption({
  ratio,
  selected = false,
  className,
}: AspectRatioOptionProps) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <AspectRatioIcon ratio={ratio} selected={selected} />
      <span
        className={cn(
          'truncate transition-colors',
          'text-foreground'
        )}
      >
        {ratio}
      </span>
    </span>
  );
}
