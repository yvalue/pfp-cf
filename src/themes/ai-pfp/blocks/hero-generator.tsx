'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Download,
  ImagePlus,
  Loader2,
  Settings2,
  Sparkles,
} from 'lucide-react';
import {
  RiFlashlightFill,
  RiInformationLine,
  RiVipCrown2Fill,
  RiVipDiamondFill,
} from 'react-icons/ri';
import { toast } from 'sonner';

import { Link } from '@/core/i18n/navigation';
import { AIMediaType, AITaskStatus } from '@/extensions/ai/types';
import {
  ImageUploader,
  LazyImage,
  type ImageUploaderValue,
} from '@/shared/blocks/common';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { Textarea } from '@/shared/components/ui/textarea';
import { useAppContext } from '@/shared/contexts/app';
import {
  extractImageUrls,
  getNanoBananaModelFamily,
  getNanoBananaModelFamilyFromValue,
  NANO_BANANA_MODEL_FAMILIES,
  resolveNanoBananaModel,
} from '@/shared/lib/ai-image';
import { cn } from '@/shared/lib/utils';
import type { Section } from '@/shared/types/blocks/landing';

type ImageMode = 'text-to-image' | 'image-to-image';

interface BackendTask {
  id: string;
  status: string;
  taskInfo: string | null;
}

interface GeneratedImage {
  id: string;
  url: string;
  provider: string;
  model: string;
  prompt?: string;
}

const DEFAULT_MODES: ImageMode[] = ['text-to-image', 'image-to-image'];
const MAX_PROMPT_LENGTH = 2000;
const POLL_INTERVAL = 3500;
const TASK_TIMEOUT = 180000;
const TYPING_SPEED_MS = 70;

function parseJson(raw: string | null): any {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeModes(input: any): ImageMode[] {
  if (!Array.isArray(input)) {
    return DEFAULT_MODES;
  }

  const modes = input.filter(
    (item): item is ImageMode =>
      item === 'text-to-image' || item === 'image-to-image'
  );

  return modes.length > 0 ? modes : DEFAULT_MODES;
}

export function HeroGenerator({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const modes = useMemo(() => normalizeModes(section.modes), [section.modes]);

  const maxCount = useMemo(
    () => clamp(Number(section.max_count) || 4, 1, 8),
    [section.max_count]
  );

  const initialCount = useMemo(
    () => clamp(Number(section.default_count) || 1, 1, maxCount),
    [section.default_count, maxCount]
  );

  const initialMode = useMemo(() => {
    const mode = section.default_mode as ImageMode;
    if (mode && modes.includes(mode)) {
      return mode;
    }
    return modes[0];
  }, [section.default_mode, modes]);

  const [mode, setMode] = useState<ImageMode>(initialMode);
  const [modelFamilyId, setModelFamilyId] = useState(() => {
    return (
      getNanoBananaModelFamilyFromValue(
        section.default_model as string | undefined
      )?.id ??
      NANO_BANANA_MODEL_FAMILIES[0]?.id ??
      ''
    );
  });
  const selectedModelFamily = useMemo(
    () =>
      getNanoBananaModelFamily(modelFamilyId) ?? NANO_BANANA_MODEL_FAMILIES[0],
    [modelFamilyId]
  );
  const aspectRatios = selectedModelFamily?.aspectRatios ?? ['1:1'];
  const defaultAspectRatio = useMemo(() => {
    const configured = section.default_aspect_ratio as string | undefined;
    if (configured && aspectRatios.includes(configured)) {
      return configured;
    }

    return selectedModelFamily?.defaultAspectRatio ?? aspectRatios[0] ?? '1:1';
  }, [aspectRatios, section.default_aspect_ratio, selectedModelFamily]);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState(defaultAspectRatio);
  const [count, setCount] = useState<number>(initialCount);
  const [watermark, setWatermark] = useState(true);
  const [skipCaptcha, setSkipCaptcha] = useState(
    Boolean(section.default_skip_captcha)
  );
  const [referenceImageItems, setReferenceImageItems] = useState<
    ImageUploaderValue[]
  >([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [taskStatus, setTaskStatus] = useState<AITaskStatus | null>(null);
  const [downloadingImageId, setDownloadingImageId] = useState<string | null>(
    null
  );

  const { user, isCheckSign, setIsShowSignModal, fetchUserCredits } =
    useAppContext();

  useEffect(() => {
    if (!selectedModelFamily) {
      const fallbackFamilyId = NANO_BANANA_MODEL_FAMILIES[0]?.id ?? '';
      if (fallbackFamilyId && fallbackFamilyId !== modelFamilyId) {
        setModelFamilyId(fallbackFamilyId);
      }
    }
  }, [modelFamilyId, selectedModelFamily]);

  useEffect(() => {
    if (!aspectRatios.includes(aspectRatio)) {
      setAspectRatio(defaultAspectRatio);
    }
  }, [aspectRatio, aspectRatios, defaultAspectRatio]);

  const promptLength = prompt.trim().length;
  const isPromptTooLong = promptLength > MAX_PROMPT_LENGTH;

  const referenceImageUrls = useMemo(
    () =>
      referenceImageItems
        .filter((item) => item.status === 'uploaded' && item.url)
        .map((item) => item.url as string),
    [referenceImageItems]
  );

  const isReferenceUploading = useMemo(
    () => referenceImageItems.some((item) => item.status === 'uploading'),
    [referenceImageItems]
  );

  const hasReferenceUploadError = useMemo(
    () => referenceImageItems.some((item) => item.status === 'error'),
    [referenceImageItems]
  );

  const remainingCredits = user?.credits?.remainingCredits ?? 0;
  const costPerImage = mode === 'image-to-image' ? 4 : 2;
  const totalCost = costPerImage * count;

  const countOptions = useMemo(
    () =>
      Array.from({ length: maxCount }, (_, index) => index + 1).map(
        (value) => ({
          value,
          label: `${value} Image${value > 1 ? 's' : ''}`,
        })
      ),
    [maxCount]
  );

  const handleReferenceImagesChange = useCallback(
    (items: ImageUploaderValue[]) => {
      setReferenceImageItems(items);
    },
    []
  );

  const pollTask = useCallback(
    async ({
      taskId,
      index,
      total,
      promptText,
      provider,
      modelName,
    }: {
      taskId: string;
      index: number;
      total: number;
      promptText: string;
      provider: string;
      modelName: string;
    }): Promise<GeneratedImage[]> => {
      const startAt = Date.now();

      while (true) {
        if (Date.now() - startAt > TASK_TIMEOUT) {
          throw new Error('Image generation timed out. Please try again.');
        }

        const resp = await fetch('/api/ai/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ taskId }),
        });

        if (!resp.ok) {
          throw new Error(`request failed with status: ${resp.status}`);
        }

        const { code, message, data } = await resp.json();
        if (code !== 0) {
          throw new Error(message || 'Failed to query generation task');
        }

        const task = data as BackendTask;
        const status = task.status as AITaskStatus;
        const base = ((index - 1) / total) * 100;

        setTaskStatus(status);

        if (status === AITaskStatus.PENDING) {
          setStatusText(`Queued (${index}/${total})...`);
          setProgress((prev) => Math.max(prev, Math.round(base + 10)));
          await sleep(POLL_INTERVAL);
          continue;
        }

        if (status === AITaskStatus.PROCESSING) {
          setStatusText(`Generating (${index}/${total})...`);
          setProgress((prev) => Math.max(prev, Math.round(base + 70)));
          await sleep(POLL_INTERVAL);
          continue;
        }

        if (status === AITaskStatus.SUCCESS) {
          const taskInfo = parseJson(task.taskInfo);
          const urls = extractImageUrls(taskInfo);
          if (urls.length === 0) {
            throw new Error('The provider returned no images. Please retry.');
          }

          setProgress((prev) =>
            Math.max(prev, Math.round((index / total) * 100))
          );

          return urls.map((url, imageIndex) => ({
            id: `${task.id}-${imageIndex}`,
            url,
            provider,
            model: modelName,
            prompt: promptText,
          }));
        }

        if (status === AITaskStatus.FAILED) {
          const taskInfo = parseJson(task.taskInfo);
          throw new Error(taskInfo?.errorMessage || 'Image generation failed');
        }

        await sleep(POLL_INTERVAL);
      }
    },
    []
  );

  const createTask = useCallback(
    async ({
      promptText,
      index,
      total,
    }: {
      promptText: string;
      index: number;
      total: number;
    }) => {
      if (!selectedModelFamily) {
        throw new Error('Provider or model is not configured correctly.');
      }

      const resolvedModel = resolveNanoBananaModel({
        familyId: selectedModelFamily.id,
        mode,
      });
      if (!resolvedModel) {
        throw new Error('Selected model is not available for this mode.');
      }

      const options: Record<string, any> = {
        aspect_ratio: aspectRatio,
        watermark,
        skip_captcha: skipCaptcha,
      };

      if (mode === 'image-to-image') {
        options.image_input = referenceImageUrls;
      }

      const resp = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaType: AIMediaType.IMAGE,
          scene: mode,
          provider: selectedModelFamily.provider,
          model: resolvedModel,
          prompt: promptText,
          options,
        }),
      });

      if (!resp.ok) {
        throw new Error(`request failed with status: ${resp.status}`);
      }

      const { code, message, data } = await resp.json();
      if (code !== 0) {
        throw new Error(message || 'Failed to create an image task');
      }

      if (!data?.id) {
        throw new Error('Task id missing in response');
      }

      if (data.status === AITaskStatus.SUCCESS && data.taskInfo) {
        const urls = extractImageUrls(parseJson(data.taskInfo));
        if (urls.length === 0) {
          throw new Error('The provider returned no images. Please retry.');
        }

        setProgress((prev) =>
          Math.max(prev, Math.round((index / total) * 100))
        );

        return urls.map((url: string, imageIndex: number) => ({
          id: `${data.id}-${imageIndex}`,
          url,
          provider: selectedModelFamily.provider,
          model: resolvedModel,
          prompt: promptText,
        }));
      }

      return pollTask({
        taskId: data.id as string,
        index,
        total,
        promptText,
        provider: selectedModelFamily.provider,
        modelName: resolvedModel,
      });
    },
    [
      aspectRatio,
      mode,
      pollTask,
      referenceImageUrls,
      selectedModelFamily,
      skipCaptcha,
      watermark,
    ]
  );

  const handleGenerate = useCallback(async () => {
    if (!user) {
      setIsShowSignModal(true);
      return;
    }

    const promptText = prompt.trim();

    if (!promptText) {
      toast.error('Please enter a prompt before generating.');
      return;
    }

    if (isPromptTooLong) {
      toast.error(`Prompt is too long (max ${MAX_PROMPT_LENGTH} characters).`);
      return;
    }

    if (!selectedModelFamily) {
      toast.error('Provider or model is not configured correctly.');
      return;
    }

    if (mode === 'image-to-image' && referenceImageUrls.length === 0) {
      toast.error('Please upload a reference image first.');
      return;
    }

    if (isReferenceUploading) {
      toast.error('Reference image is still uploading. Please wait.');
      return;
    }

    if (hasReferenceUploadError) {
      toast.error('Please fix failed image uploads before submitting.');
      return;
    }

    if (remainingCredits < totalCost) {
      toast.error('Insufficient credits. Please top up to keep creating.');
      return;
    }

    setGeneratedImages([]);
    setIsGenerating(true);
    setTaskStatus(AITaskStatus.PENDING);
    setStatusText('Preparing generation...');
    setProgress(5);

    const total = Math.max(1, count);
    const images: GeneratedImage[] = [];

    try {
      for (let index = 1; index <= total; index += 1) {
        setStatusText(`Starting task ${index}/${total}...`);
        const batch = await createTask({
          promptText,
          index,
          total,
        });
        images.push(...batch);
        setGeneratedImages([...images]);
      }

      if (images.length === 0) {
        throw new Error('No images were generated. Please try another prompt.');
      }

      setTaskStatus(AITaskStatus.SUCCESS);
      setStatusText('Generation completed');
      setProgress(100);
      toast.success('Image generated successfully');
    } catch (error: any) {
      setTaskStatus(AITaskStatus.FAILED);
      setStatusText('Generation failed');
      setProgress(0);
      toast.error(error?.message || 'Failed to generate image');
    } finally {
      setIsGenerating(false);
      await fetchUserCredits();
    }
  }, [
    count,
    createTask,
    fetchUserCredits,
    hasReferenceUploadError,
    isPromptTooLong,
    isReferenceUploading,
    mode,
    prompt,
    referenceImageUrls.length,
    remainingCredits,
    selectedModelFamily,
    setIsShowSignModal,
    totalCost,
    user,
  ]);

  const handleDownloadImage = useCallback(async (image: GeneratedImage) => {
    if (!image.url) {
      return;
    }

    try {
      setDownloadingImageId(image.id);

      const resp = await fetch(
        `/api/proxy/file?url=${encodeURIComponent(image.url)}`
      );

      if (!resp.ok) {
        throw new Error('Failed to fetch image');
      }

      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${image.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 200);
      toast.success('Image downloaded');
    } catch {
      toast.error('Failed to download image');
    } finally {
      setDownloadingImageId(null);
    }
  }, []);

  const logoName = section.logo_name || section.name || 'Image Fx';
  const highlightTitle = section.highlight_title || 'AI Image Generator';
  const [typedHighlightTitle, setTypedHighlightTitle] =
    useState(highlightTitle);
  const [isTypingTitle, setIsTypingTitle] = useState(false);

  const logoSrc = section.logo?.src || '';
  const logoAlt = section.logo?.alt || `${logoName} logo`;

  const description = section.description || '';
  const announcementTitle = section.announcement?.title || '';
  const announcementUrl = section.announcement?.url || '/sign-in';
  const fastModeLabel = section.fast_mode_label || 'Fast Mode';

  useEffect(() => {
    if (!highlightTitle) {
      setTypedHighlightTitle('');
      setIsTypingTitle(false);
      return;
    }

    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      setTypedHighlightTitle(highlightTitle);
      setIsTypingTitle(false);
      return;
    }

    setTypedHighlightTitle('');
    setIsTypingTitle(true);

    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setTypedHighlightTitle(highlightTitle.slice(0, index));

      if (index >= highlightTitle.length) {
        clearInterval(timer);
        setIsTypingTitle(false);
      }
    }, TYPING_SPEED_MS);

    return () => clearInterval(timer);
  }, [highlightTitle]);

  return (
    <section
      id={section.id}
      className={cn(
        'pt-20 pb-12 md:pt-28 md:pb-16',
        section.className,
        className
      )}
    >
      <div className="mx-auto max-w-6xl px-4">
        {announcementTitle && (
          <Link
            href={announcementUrl}
            target={section.announcement?.target || '_self'}
            className="text-muted-foreground hover:text-foreground border-border bg-background/80 mx-auto flex w-fit items-center gap-2 rounded-xl border px-4 py-2 text-sm shadow-sm transition-colors"
          >
            <RiInformationLine className="size-4" />
            <span>{announcementTitle}</span>
          </Link>
        )}

        <div className="mx-auto mt-8 max-w-5xl text-center">
          <h1 className="text-foreground text-4xl leading-tight font-semibold tracking-tight md:text-6xl">
            <span className="inline-flex items-center gap-3 md:gap-4">
              {logoSrc ? (
                <span className="relative inline-block size-10 overflow-hidden rounded-xl md:size-14">
                  <Image
                    src={logoSrc}
                    alt={logoAlt}
                    fill
                    className="object-contain"
                    unoptimized={logoSrc.startsWith('http')}
                  />
                </span>
              ) : null}
              <span>{logoName}</span>
            </span>
          </h1>
          <h2 className="mt-2 bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-xl leading-tight font-semibold text-transparent md:text-2xl">
            {typedHighlightTitle}
            <span
              className={cn(
                'ml-1 inline-block animate-pulse text-violet-500',
                !isTypingTitle && 'opacity-0'
              )}
              aria-hidden
            >
              |
            </span>
          </h2>
          {description && (
            <p className="text-muted-foreground mx-auto mt-6 max-w-3xl text-lg leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="border-border bg-background/75 mt-12 overflow-hidden rounded-2xl border shadow-lg shadow-zinc-950/5">
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={
                section.placeholder ||
                'Describe the PFP you want to generate...'
              }
              className="min-h-40 resize-none border-0 bg-transparent px-6 py-6 text-base shadow-none focus-visible:ring-0"
            />
            <Sparkles className="text-primary/35 absolute top-5 right-5 size-5" />
          </div>

          {mode === 'image-to-image' && (
            <div className="border-border border-t px-4 py-4">
              <ImageUploader
                title="Reference image"
                emptyHint="Upload one image to guide the generation."
                allowMultiple={false}
                maxImages={1}
                maxSizeMB={8}
                onChange={handleReferenceImagesChange}
              />
            </div>
          )}

          <div className="border-border border-t px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Select value={modelFamilyId} onValueChange={setModelFamilyId}>
                  <SelectTrigger className="h-10 min-w-32 rounded-xl">
                    <SelectValue placeholder="Model" />
                  </SelectTrigger>
                  <SelectContent>
                    {NANO_BANANA_MODEL_FAMILIES.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {modes.length > 1 && (
                  <Button
                    type="button"
                    size="icon"
                    variant={mode === 'image-to-image' ? 'default' : 'outline'}
                    className="size-10 rounded-xl"
                    onClick={() =>
                      setMode((prev) =>
                        prev === 'text-to-image'
                          ? 'image-to-image'
                          : 'text-to-image'
                      )
                    }
                    title="Switch between text-to-image and image-to-image"
                  >
                    <ImagePlus className="size-4" />
                  </Button>
                )}

                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger className="h-10 min-w-24 rounded-xl">
                    <SelectValue placeholder="Ratio" />
                  </SelectTrigger>
                  <SelectContent>
                    {aspectRatios.map((ratio) => (
                      <SelectItem key={ratio} value={ratio}>
                        {ratio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={String(count)}
                  onValueChange={(value) =>
                    setCount(clamp(Number(value), 1, maxCount))
                  }
                >
                  <SelectTrigger className="h-10 min-w-28 rounded-xl">
                    <SelectValue placeholder="Count" />
                  </SelectTrigger>
                  <SelectContent>
                    {countOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={String(option.value)}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground size-9 rounded-xl"
                disabled
                aria-label="Settings"
              >
                <Settings2 className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="text-muted-foreground flex items-center gap-5 text-sm">
            <label className="inline-flex items-center gap-2">
              <Switch checked={skipCaptcha} onCheckedChange={setSkipCaptcha} />
              <span className="inline-flex items-center gap-1 text-base">
                {fastModeLabel}
                <RiFlashlightFill className="size-4 text-amber-400" />
              </span>
            </label>
            <label className="inline-flex items-center gap-2">
              <Switch checked={watermark} onCheckedChange={setWatermark} />
              <span className="inline-flex items-center gap-1 text-base">
                Watermark
                <RiVipCrown2Fill className="size-4 text-amber-400" />
              </span>
            </label>
          </div>

          <Button
            size="lg"
            className="min-w-44 rounded-xl text-base"
            onClick={handleGenerate}
            disabled={
              isCheckSign ||
              isGenerating ||
              !prompt.trim() ||
              isPromptTooLong ||
              isReferenceUploading ||
              hasReferenceUploadError
            }
          >
            {isCheckSign ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Checking account...
              </>
            ) : isGenerating ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Submit
                <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-black/10 px-1.5 text-base dark:bg-white/15">
                  {totalCost}
                  <RiVipDiamondFill className="size-4 text-amber-400" />
                </span>
              </>
            )}
          </Button>
        </div>

        {(isGenerating || generatedImages.length > 0) && (
          <div className="border-border bg-background/80 mt-8 rounded-2xl border p-5 md:p-6">
            {isGenerating && (
              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="text-primary size-4 animate-spin" />
                    <span>{statusText || 'Generating image...'}</span>
                  </div>
                  <span>{progress}%</span>
                </div>
                {taskStatus && (
                  <p className="text-muted-foreground text-xs uppercase">
                    Status: {taskStatus}
                  </p>
                )}
                <Progress value={progress} />
              </div>
            )}

            {generatedImages.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {generatedImages.map((image) => (
                  <div
                    key={image.id}
                    className="border-border relative overflow-hidden rounded-xl border"
                  >
                    <LazyImage
                      src={image.url}
                      alt={image.prompt || 'Generated image'}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute right-2 bottom-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="size-8 rounded-lg opacity-90"
                        onClick={() => handleDownloadImage(image)}
                        disabled={downloadingImageId === image.id}
                      >
                        {downloadingImageId === image.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Download className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
