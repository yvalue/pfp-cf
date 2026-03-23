'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronsUpDown,
  Download,
  Loader2,
  Sparkles,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from 'react-compare-slider';
import { RiVipDiamondFill } from 'react-icons/ri';
import { toast } from 'sonner';

import { AIMediaType, AITaskStatus } from '@/extensions/ai/types';
import {
  aiPfpSegmentedTabsListClassName,
  aiPfpSegmentedTabsTriggerClassName,
  ImageUploader,
  LazyImage,
  type ImageUploaderValue,
} from '@/shared/blocks/common';
import { AspectRatioOption } from '@/shared/components/ui/aspect-ratio-option';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Progress } from '@/shared/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import { Textarea } from '@/shared/components/ui/textarea';
import { useAppContext } from '@/shared/contexts/app';
import {
  extractImageUrls,
  getNanoBananaMaxBatchCount,
  getNanoBananaMaxReferenceImages,
  getNanoBananaMaxReferenceImageSizeMB,
  getNanoBananaModelFamily,
  getNanoBananaResolution,
  NANO_BANANA_MODEL_FAMILIES,
  resolveNanoBananaGeneration,
  type NanoBananaResolution,
} from '@/shared/lib/ai-image';
import { cn } from '@/shared/lib/utils';

type ToolPanelEffectOption = {
  id: string;
  label: string;
  accentClassName: string;
  cardClassName: string;
  silhouetteClassName: string;
};

type ToolPanelImage = {
  src: string;
  alt: string;
};

export type ToolPanelSection = {
  id?: string;
  name?: string;
  title: string;
  description: string;
  effect_style_label: string;
  effects: ToolPanelEffectOption[];
  result: {
    example_title: string;
    before_label: string;
    after_label: string;
    how_to_use_title: string;
    usage_steps: string[];
    tip_prefix: string;
    tip_text: string;
  };
  credits: {
    submit_cost: number;
  };
  images: {
    before: ToolPanelImage;
    after: ToolPanelImage;
  };
};

interface ToolPanelProps {
  section: ToolPanelSection;
}

interface GeneratedImage {
  id: string;
  url: string;
  provider?: string;
  model?: string;
  prompt?: string;
}

interface BackendTask {
  id: string;
  status: string;
  provider: string;
  model: string;
  prompt: string | null;
  taskInfo: string | null;
  taskResult: string | null;
}

const POLL_INTERVAL = 5000;
const GENERATION_TIMEOUT = 180000;
const MAX_PROMPT_LENGTH = 2000;
const panelClassName = 'rounded-3xl border border-border';
const selectTriggerClassName = 'h-10 w-full rounded-xl text-sm leading-6';
const toolPanelPaneClassName =
  'border-border bg-background min-w-0 rounded-3xl border p-5 shadow-sm';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseTaskPayload(payload: string | null) {
  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(payload);
  } catch (error) {
    console.warn('Failed to parse task payload:', error);
    return null;
  }
}

function extractTaskImageUrls(task: BackendTask) {
  const taskInfoUrls = extractImageUrls(parseTaskPayload(task.taskInfo));
  const taskResultUrls = extractImageUrls(parseTaskPayload(task.taskResult));

  return Array.from(new Set([...taskInfoUrls, ...taskResultUrls]));
}

function calculateProgress(
  completedTasks: number,
  totalTasks: number,
  currentTaskRatio = 0
) {
  if (totalTasks <= 0) {
    return 0;
  }

  const rawProgress =
    ((completedTasks + Math.max(0, Math.min(currentTaskRatio, 1))) /
      totalTasks) *
    100;

  return Math.max(0, Math.min(100, Math.round(rawProgress)));
}

function EffectThumbnail({
  accentClassName,
  cardClassName,
  silhouetteClassName,
  size = 'lg',
}: Pick<
  ToolPanelEffectOption,
  'accentClassName' | 'cardClassName' | 'silhouetteClassName'
> & { size?: 'sm' | 'lg' }) {
  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden',
        size === 'sm' ? 'h-8 w-8 rounded-sm' : 'h-24 w-24 rounded-md',
        cardClassName
      )}
    >
      <div className="absolute inset-x-2.5 top-1.5 h-2.5 rounded-xl bg-white" />
      <div
        className={cn(
          'absolute inset-x-2.5 top-5 bottom-1.5 rounded-2xl',
          silhouetteClassName
        )}
      />
      <div
        className={cn(
          'absolute top-1.5 left-1.5 h-2 w-2 rounded-xl',
          accentClassName
        )}
      />
    </div>
  );
}

function ComparisonHandle() {
  return (
    <div className="pointer-events-none relative flex h-full items-center justify-center text-white">
      <div className="absolute inset-x-0 inset-y-0 mx-auto w-0.5 bg-white" />
      <div className="relative z-10 inline-flex items-center gap-4 px-0 text-xs leading-5 font-semibold tracking-widest">
        <span aria-hidden className="text-sm text-white">
          &#x25C0;
        </span>
        <span aria-hidden className="text-sm text-white">
          &#x25B6;
        </span>
      </div>
    </div>
  );
}

export function ToolPanel({ section }: ToolPanelProps) {
  const t = useTranslations('common.generator');
  const uploaderT = useTranslations('common.uploader');
  const [selectedEffectId, setSelectedEffectId] = useState(
    section.effects[0]?.id ?? ''
  );
  const [prompt, setPrompt] = useState('');
  const [modelFamilyId, setModelFamilyId] = useState(
    NANO_BANANA_MODEL_FAMILIES[0]?.id ?? ''
  );
  const selectedModelFamily = useMemo(
    () =>
      getNanoBananaModelFamily(modelFamilyId) ?? NANO_BANANA_MODEL_FAMILIES[0],
    [modelFamilyId]
  );
  const supportedResolutions = selectedModelFamily?.supportedResolutions ?? [
    '1K',
  ];
  const aspectRatios = selectedModelFamily?.aspectRatios ?? ['1:1'];
  const defaultAspectRatio = aspectRatios.includes('auto')
    ? 'auto'
    : (selectedModelFamily?.defaultAspectRatio ?? aspectRatios[0] ?? '1:1');
  const [resolution, setResolution] = useState<NanoBananaResolution>(
    NANO_BANANA_MODEL_FAMILIES[0]?.defaultResolution ?? '1K'
  );
  const [aspectRatio, setAspectRatio] = useState(defaultAspectRatio);
  const [count, setCount] = useState(1);
  const [referenceImageItems, setReferenceImageItems] = useState<
    ImageUploaderValue[]
  >([]);
  const [referenceImageUrls, setReferenceImageUrls] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [taskStatus, setTaskStatus] = useState<AITaskStatus | null>(null);
  const [currentTaskNumber, setCurrentTaskNumber] = useState(0);
  const [downloadingImageId, setDownloadingImageId] = useState<string | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);
  const [isEffectDialogOpen, setIsEffectDialogOpen] = useState(false);

  const { user, isCheckSign, setIsShowSignModal, fetchUserCredits } =
    useAppContext();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isPromptTooLong = prompt.trim().length > MAX_PROMPT_LENGTH;
  const remainingCredits = user?.credits?.remainingCredits ?? 0;

  const selectedEffect =
    section.effects.find((item) => item.id === selectedEffectId) ??
    section.effects[0];

  const resolvedGeneration = useMemo(() => {
    if (!selectedModelFamily) {
      return null;
    }

    return resolveNanoBananaGeneration({
      familyId: selectedModelFamily.id,
      mode: 'image-to-image',
      resolution,
    });
  }, [resolution, selectedModelFamily]);

  const resolvedModel = resolvedGeneration?.model ?? null;
  const costPerImage =
    resolvedGeneration?.costCredits ?? section.credits.submit_cost ?? 0;
  const totalCost = costPerImage * count;
  const maxReferenceImages = getNanoBananaMaxReferenceImages(
    selectedModelFamily?.id ?? ''
  );
  const maxReferenceImageSizeMB = getNanoBananaMaxReferenceImageSizeMB(
    selectedModelFamily?.id ?? ''
  );
  const maxBatchCount = getNanoBananaMaxBatchCount(
    selectedModelFamily?.id ?? ''
  );
  const countOptions = useMemo(
    () =>
      Array.from({ length: maxBatchCount }, (_, index) => index + 1).map(
        (value) => ({
          value: String(value),
          label: String(value),
        })
      ),
    [maxBatchCount]
  );
  const uploadPanelDescription = uploaderT('reference_image_hint', {
    formats: uploaderT('reference_formats'),
    maxSizeMB: maxReferenceImageSizeMB,
  });
  const uploadPanelFooter = uploaderT('multiple_images');
  const uploadMessages = useMemo(
    () => ({
      imagesStillUploading: uploaderT('images_still_uploading'),
      someImagesFailed: uploaderT('some_images_failed'),
    }),
    [uploaderT]
  );

  const handleReferenceImagesChange = useCallback(
    (items: ImageUploaderValue[]) => {
      setReferenceImageItems(items);
      setReferenceImageUrls(
        items
          .filter((item) => item.status === 'uploaded' && item.url)
          .map((item) => item.url as string)
      );
    },
    []
  );

  const isReferenceUploading = useMemo(
    () => referenceImageItems.some((item) => item.status === 'uploading'),
    [referenceImageItems]
  );

  const hasReferenceUploadError = useMemo(
    () => referenceImageItems.some((item) => item.status === 'error'),
    [referenceImageItems]
  );

  const taskStatusLabel = useMemo(() => {
    if (!taskStatus) {
      return '';
    }

    switch (taskStatus) {
      case AITaskStatus.PENDING:
        return t('task_status.pending');
      case AITaskStatus.PROCESSING:
        return t('task_status.processing');
      case AITaskStatus.SUCCESS:
        return t('task_status.success');
      case AITaskStatus.FAILED:
        return t('task_status.failed');
      default:
        return '';
    }
  }, [t, taskStatus]);

  useEffect(() => {
    if (!selectedModelFamily) {
      const fallbackFamilyId = NANO_BANANA_MODEL_FAMILIES[0]?.id ?? '';
      if (fallbackFamilyId && fallbackFamilyId !== modelFamilyId) {
        setModelFamilyId(fallbackFamilyId);
      }
    }
  }, [modelFamilyId, selectedModelFamily]);

  useEffect(() => {
    if (!selectedModelFamily) {
      return;
    }

    const normalizedResolution = getNanoBananaResolution(
      selectedModelFamily.id,
      resolution
    );

    if (normalizedResolution !== resolution) {
      setResolution(normalizedResolution);
    }
  }, [resolution, selectedModelFamily]);

  useEffect(() => {
    if (!aspectRatios.includes(aspectRatio)) {
      setAspectRatio(defaultAspectRatio);
    }
  }, [aspectRatio, aspectRatios, defaultAspectRatio]);

  useEffect(() => {
    if (count > maxBatchCount) {
      setCount(maxBatchCount);
    }
  }, [count, maxBatchCount]);

  const resetGenerationState = useCallback(() => {
    setIsGenerating(false);
    setTaskStatus(null);
    setCurrentTaskNumber(0);
  }, []);

  const createImageTask = useCallback(
    async (trimmedPrompt: string) => {
      if (!selectedModelFamily) {
        throw new Error(t('messages.provider_or_model_not_configured'));
      }

      if (!resolvedModel) {
        throw new Error(t('messages.selected_model_unavailable'));
      }

      const options: Record<string, unknown> = {
        aspect_ratio: aspectRatio,
        image_input: referenceImageUrls,
      };

      if (resolvedGeneration?.shouldSendResolution) {
        options.resolution = resolvedGeneration.resolution;
      }

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaType: AIMediaType.IMAGE,
          scene: 'image-to-image',
          provider: selectedModelFamily?.provider,
          model: resolvedModel,
          prompt: trimmedPrompt,
          options,
        }),
      });

      if (!response.ok) {
        throw new Error(
          t('messages.request_failed_with_status', { status: response.status })
        );
      }

      const { code, message, data } = await response.json();
      if (code !== 0) {
        throw new Error(message || t('messages.create_task_failed'));
      }

      if (!data?.id) {
        throw new Error(t('messages.task_id_missing'));
      }

      return data as BackendTask;
    },
    [
      aspectRatio,
      referenceImageUrls,
      resolvedGeneration,
      resolvedModel,
      selectedModelFamily,
      t,
    ]
  );

  const pollTaskUntilComplete = useCallback(
    async ({
      taskId,
      completedTasks,
      totalTasks,
    }: {
      taskId: string;
      completedTasks: number;
      totalTasks: number;
    }) => {
      const startedAt = Date.now();

      while (Date.now() - startedAt <= GENERATION_TIMEOUT) {
        const response = await fetch('/api/ai/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ taskId }),
        });

        if (!response.ok) {
          throw new Error(
            t('messages.request_failed_with_status', {
              status: response.status,
            })
          );
        }

        const { code, message, data } = await response.json();
        if (code !== 0) {
          throw new Error(message || t('messages.query_task_failed'));
        }

        const task = data as BackendTask;
        const currentStatus = task.status as AITaskStatus;

        setTaskStatus(currentStatus);

        if (currentStatus === AITaskStatus.PENDING) {
          setProgress(calculateProgress(completedTasks, totalTasks, 0.35));
          await sleep(POLL_INTERVAL);
          continue;
        }

        if (currentStatus === AITaskStatus.PROCESSING) {
          const currentTaskImageUrls = extractTaskImageUrls(task);
          setProgress(
            calculateProgress(
              completedTasks,
              totalTasks,
              currentTaskImageUrls.length > 0 ? 0.85 : 0.65
            )
          );
          await sleep(POLL_INTERVAL);
          continue;
        }

        if (currentStatus === AITaskStatus.SUCCESS) {
          return {
            task,
            imageUrls: extractTaskImageUrls(task),
          };
        }

        if (currentStatus === AITaskStatus.FAILED) {
          const parsedTaskInfo = parseTaskPayload(task.taskInfo);
          const parsedTaskResult = parseTaskPayload(task.taskResult);
          const errorMessage =
            parsedTaskInfo?.errorMessage ||
            parsedTaskResult?.errorMessage ||
            t('messages.generation_failed');

          toast.error(errorMessage);
          return {
            task,
            imageUrls: [],
          };
        }

        setProgress(calculateProgress(completedTasks, totalTasks, 0.5));
        await sleep(POLL_INTERVAL);
      }

      throw new Error(t('messages.generation_timeout'));
    },
    [t]
  );

  const handleGenerate = useCallback(async () => {
    if (!user) {
      setIsShowSignModal(true);
      return;
    }

    if (!selectedModelFamily) {
      toast.error(t('messages.provider_or_model_not_configured'));
      return;
    }

    if (!resolvedModel) {
      toast.error(t('messages.selected_model_unavailable'));
      return;
    }

    if (referenceImageUrls.length === 0) {
      toast.error(t('messages.reference_image_required'));
      return;
    }

    if (isReferenceUploading) {
      toast.error(uploadMessages.imagesStillUploading);
      return;
    }

    if (hasReferenceUploadError) {
      toast.error(uploadMessages.someImagesFailed);
      return;
    }

    if (isPromptTooLong) {
      toast.error(t('messages.prompt_too_long'));
      return;
    }

    if (remainingCredits < totalCost) {
      toast.error(t('messages.insufficient_credits'));
      return;
    }

    const trimmedPrompt = prompt.trim();

    setGeneratedImages([]);
    setIsGenerating(true);
    setProgress(0);
    setTaskStatus(AITaskStatus.PENDING);

    let successCount = 0;

    try {
      for (let index = 0; index < count; index += 1) {
        setCurrentTaskNumber(index + 1);
        setTaskStatus(AITaskStatus.PENDING);
        setProgress(calculateProgress(index, count, 0.1));

        const createdTask = await createImageTask(trimmedPrompt);
        const immediateImageUrls = extractTaskImageUrls(createdTask);

        let finalImageUrls = immediateImageUrls;

        if (createdTask.status === AITaskStatus.SUCCESS) {
          setTaskStatus(AITaskStatus.SUCCESS);
        } else {
          const polledResult = await pollTaskUntilComplete({
            taskId: createdTask.id,
            completedTasks: index,
            totalTasks: count,
          });
          finalImageUrls = polledResult.imageUrls;
        }

        const primaryImageUrl = finalImageUrls[0];

        if (primaryImageUrl) {
          successCount += 1;
          setGeneratedImages((prev) => [
            ...prev,
            {
              id: `${createdTask.id}-0`,
              url: primaryImageUrl,
              provider: createdTask.provider,
              model: createdTask.model,
              prompt: trimmedPrompt || selectedEffect?.label || section.title,
            },
          ]);
        }

        setTaskStatus(AITaskStatus.SUCCESS);
        setProgress(calculateProgress(index + 1, count, 0));
      }

      if (successCount > 0) {
        toast.success(
          t('messages.generated_count', { current: successCount, total: count })
        );
      } else {
        toast.error(t('messages.no_images_generated'));
      }
    } catch (error: any) {
      console.error('Failed to generate image:', error);
      toast.error(error?.message || t('messages.generation_failed'));
    } finally {
      setProgress((current) => (successCount > 0 ? 100 : current));
      resetGenerationState();
      await fetchUserCredits();
    }
  }, [
    count,
    createImageTask,
    fetchUserCredits,
    hasReferenceUploadError,
    isReferenceUploading,
    isPromptTooLong,
    pollTaskUntilComplete,
    prompt,
    referenceImageUrls.length,
    remainingCredits,
    resetGenerationState,
    resolvedModel,
    section.title,
    selectedEffect,
    selectedModelFamily,
    setIsShowSignModal,
    t,
    totalCost,
    uploadMessages.imagesStillUploading,
    uploadMessages.someImagesFailed,
    user,
  ]);

  const handleDownloadImage = useCallback(
    async (image: GeneratedImage) => {
      if (!image.url) {
        return;
      }

      try {
        setDownloadingImageId(image.id);

        const response = await fetch(
          `/api/proxy/file?url=${encodeURIComponent(image.url)}`
        );

        if (!response.ok) {
          throw new Error(t('messages.download_failed'));
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${image.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 200);
        toast.success(t('messages.image_downloaded'));
      } catch (error) {
        console.error('Failed to download image:', error);
        toast.error(t('messages.download_failed'));
      } finally {
        setDownloadingImageId(null);
      }
    },
    [t]
  );

  return (
    <section id={section.id || section.name} data-slot="generator-tool-panel">
      <div className="grid gap-3 py-3 lg:grid-cols-12 xl:grid-cols-12">
        <div className={cn(toolPanelPaneClassName, 'lg:col-span-4')}>
          <div className="flex flex-col gap-3">
            <Tabs defaultValue="upload" className="flex flex-col gap-6">
              <TabsList
                className={cn(aiPfpSegmentedTabsListClassName, 'grid-cols-2')}
              >
                <TabsTrigger
                  value="upload"
                  className={aiPfpSegmentedTabsTriggerClassName}
                >
                  {t('tabs.upload_image')}
                </TabsTrigger>
                <TabsTrigger
                  value="parameter"
                  className={aiPfpSegmentedTabsTriggerClassName}
                >
                  {t('tabs.parameters')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-0">
                <div className="grid gap-6">
                  <section className="space-y-2">
                  <ImageUploader
                      variant="panel"
                      value={referenceImageItems}
                      title={t('labels.upload_image')}
                      titleHint={t('badges.required')}
                      emptyDescription={uploadPanelDescription}
                      emptyFooter={uploadPanelFooter}
                      allowMultiple={maxReferenceImages > 1}
                      maxImages={maxReferenceImages}
                      maxSizeMB={maxReferenceImageSizeMB}
                      onChange={handleReferenceImagesChange}
                      tone="brand"
                    />
                  </section>

                  <section>
                    <div className="flex flex-wrap items-center gap-2">
                      <Label htmlFor="tool-panel-prompt">
                        {t('labels.description')}
                      </Label>
                      <span className="bg-muted text-muted-foreground inline-flex items-center rounded-xl px-2 text-xs leading-5 font-medium">
                        {t('badges.optional')}
                      </span>
                    </div>
                    <div className="border-border bg-background focus-within:border-primary focus-within:ring-primary/15 mt-3 overflow-hidden rounded-2xl border focus-within:ring-1">
                      <Textarea
                        id="tool-panel-prompt"
                        value={prompt}
                        onChange={(event) => setPrompt(event.target.value)}
                        placeholder={t('placeholders.description')}
                        className="min-h-32 resize-none border-0 rounded-none text-sm leading-5 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                    {isPromptTooLong ? (
                      <div className="text-xs leading-5">
                        <span className="text-destructive">
                          {t('messages.prompt_too_long')}
                        </span>
                      </div>
                    ) : null}
                  </section>

                  <section>
                    <div className="flex flex-wrap items-center gap-2">
                      <Label>{section.effect_style_label}</Label>
                      <span className="bg-muted text-muted-foreground inline-flex items-center rounded-xl px-2 text-xs leading-5 font-medium">
                        {t('badges.optional')}
                      </span>
                    </div>

                    <Dialog
                      open={isEffectDialogOpen}
                      onOpenChange={setIsEffectDialogOpen}
                    >
                      <button
                        type="button"
                        onClick={() => setIsEffectDialogOpen(true)}
                        className="border-border bg-background hover:border-border mt-3 flex h-10 w-full min-w-0 items-center gap-3 rounded-xl border px-3 text-left text-sm leading-6 transition-colors outline-none"
                      >
                        {selectedEffect ? (
                          <EffectThumbnail
                            size="sm"
                            accentClassName={selectedEffect.accentClassName}
                            cardClassName={selectedEffect.cardClassName}
                            silhouetteClassName={
                              selectedEffect.silhouetteClassName
                            }
                          />
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <div className="text-foreground truncate text-sm leading-6 font-semibold">
                            {selectedEffect?.label ??
                              section.effect_style_label}
                          </div>
                        </div>
                        <ChevronsUpDown className="text-muted-foreground size-4 shrink-0" />
                      </button>

                      <DialogContent className="rounded-md p-4 sm:max-w-3xl">
                        <DialogTitle className="text-base font-semibold">
                          {section.effect_style_label}
                        </DialogTitle>
                        <div className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-3">
                          {section.effects.map((effect) => {
                            const isSelected = effect.id === selectedEffectId;

                            return (
                              <button
                                key={effect.id}
                                type="button"
                                className={cn(
                                  'flex flex-col items-center gap-2 rounded-2xl px-1 py-3 transition-colors',
                                  isSelected ? 'bg-accent' : 'hover:bg-accent'
                                )}
                                onClick={() => {
                                  setSelectedEffectId(effect.id);
                                  setIsEffectDialogOpen(false);
                                }}
                              >
                                <EffectThumbnail
                                  accentClassName={effect.accentClassName}
                                  cardClassName={effect.cardClassName}
                                  silhouetteClassName={
                                    effect.silhouetteClassName
                                  }
                                />
                                <div className="text-foreground w-full truncate text-center text-xs leading-4 font-medium">
                                  {effect.label}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </section>
                </div>
              </TabsContent>

              <TabsContent value="parameter" className="mt-0">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Label>{t('labels.model')}</Label>
                      <span className="bg-muted text-muted-foreground inline-flex items-center rounded-xl px-2 text-xs leading-5 font-medium">
                        {t('badges.default')}
                      </span>
                    </div>
                    <Select
                      value={modelFamilyId}
                      onValueChange={setModelFamilyId}
                    >
                      <SelectTrigger className={selectTriggerClassName}>
                        <SelectValue placeholder={t('labels.model')} />
                      </SelectTrigger>
                      <SelectContent>
                        {NANO_BANANA_MODEL_FAMILIES.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Label>{t('labels.aspect_ratio')}</Label>
                        <span className="bg-muted text-muted-foreground inline-flex items-center rounded-xl px-2 text-xs leading-5 font-medium">
                          {t('badges.default')}
                        </span>
                      </div>
                      <Select
                        value={aspectRatio}
                        onValueChange={setAspectRatio}
                      >
                        <SelectTrigger className={selectTriggerClassName}>
                          <SelectValue aria-label={aspectRatio}>
                            <AspectRatioOption ratio={aspectRatio} selected />
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {aspectRatios.map((option) => (
                            <SelectItem key={option} value={option}>
                              <AspectRatioOption
                                ratio={option}
                                selected={aspectRatio === option}
                              />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Label>{t('labels.quality')}</Label>
                        <span className="bg-muted text-muted-foreground inline-flex items-center rounded-xl px-2 text-xs leading-5 font-medium">
                          {t('badges.default')}
                        </span>
                      </div>
                      <Select
                        value={resolution}
                        onValueChange={(value) =>
                          setResolution(value as NanoBananaResolution)
                        }
                      >
                        <SelectTrigger className={selectTriggerClassName}>
                          <SelectValue placeholder={t('labels.quality')} />
                        </SelectTrigger>
                        <SelectContent>
                          {supportedResolutions.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Label>{t('labels.count')}</Label>
                        <span className="bg-muted text-muted-foreground inline-flex items-center rounded-xl px-2 text-xs leading-5 font-medium">
                          {t('badges.default')}
                        </span>
                      </div>
                      <Select
                        value={String(count)}
                        onValueChange={(value) => setCount(Number(value))}
                      >
                        <SelectTrigger className={selectTriggerClassName}>
                          <SelectValue placeholder={t('labels.count')} />
                        </SelectTrigger>
                        <SelectContent>
                          {countOptions.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="pt-4">
              {!isMounted ? (
                <Button className="w-full text-sm leading-6" disabled size="lg">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('states.loading')}
                </Button>
              ) : isCheckSign ? (
                <Button className="w-full text-sm leading-6" disabled size="lg">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('states.checking_account')}
                </Button>
              ) : user ? (
                <Button
                  size="lg"
                  className="w-full rounded-xl text-sm leading-6"
                  onClick={handleGenerate}
                  disabled={
                    isGenerating ||
                    isPromptTooLong ||
                    isReferenceUploading ||
                    hasReferenceUploadError ||
                    referenceImageUrls.length === 0
                  }
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('states.generating')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {t('buttons.generate_images')}
                    </>
                  )}
                  <span className="ml-2 inline-flex items-center gap-2 text-sm leading-6">
                    {totalCost}
                    <RiVipDiamondFill className="size-4 text-amber-400" />
                  </span>
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="w-full text-sm leading-6"
                  onClick={() => setIsShowSignModal(true)}
                >
                  <User className="mr-2 h-4 w-4" />
                  {t('auth.sign_in_to_generate')}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className={cn(toolPanelPaneClassName, 'grid gap-3 lg:col-span-8')}>
          <div className="grid gap-3">
            <div className="grid gap-0">
              <h1 className="text-foreground text-lg leading-tight font-semibold tracking-normal md:text-2xl">
                {section.title}
              </h1>
              <p className="text-muted-foreground -mt-1 text-sm leading-6 md:text-base">
                {section.description}
              </p>
            </div>

            {isGenerating || generatedImages.length > 0 ? (
              <section className={`${panelClassName} bg-background p-5`}>
                <header className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-foreground text-lg font-semibold tracking-normal md:text-xl">
                      {t('states.generated_images')}
                    </h3>
                    <div className="text-muted-foreground text-xs leading-5">
                      {generatedImages.length}/{count}
                    </div>
                  </div>
                  {isGenerating ? (
                    <span className="text-muted-foreground text-xs leading-5">
                      {taskStatusLabel}
                    </span>
                  ) : null}
                </header>

                {(isGenerating || progress > 0) && (
                  <div className="border-border bg-muted mb-3 grid gap-2 rounded-3xl border p-5">
                    <div className="flex items-center justify-between text-sm leading-6">
                      <span>{t('states.progress')}</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                {generatedImages.length > 0 ? (
                  <div
                    className={
                      generatedImages.length === 1
                        ? 'grid grid-cols-1 gap-3'
                        : 'grid gap-3 sm:grid-cols-2'
                    }
                  >
                    {generatedImages.map((image) => (
                      <div key={image.id} className="grid gap-3">
                        <div
                          className={
                            generatedImages.length === 1
                              ? 'border-border bg-muted relative overflow-hidden rounded-3xl border'
                              : 'border-border bg-muted relative aspect-square overflow-hidden rounded-3xl border'
                          }
                        >
                          <LazyImage
                            src={image.url}
                            alt={image.prompt || section.title}
                            className={
                              generatedImages.length === 1
                                ? 'h-auto w-full'
                                : 'h-full w-full object-cover'
                            }
                          />
                          <div className="absolute right-3 bottom-3 flex justify-end">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="text-foreground rounded-xl text-sm leading-6"
                              onClick={() => handleDownloadImage(image)}
                              disabled={downloadingImageId === image.id}
                            >
                              {downloadingImageId === image.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <>
                                  <Download className="size-4" />
                                  {t('buttons.download')}
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-border bg-muted flex min-h-52 items-center justify-center rounded-3xl border border-dashed p-6 text-center">
                    <p className="text-muted-foreground text-sm leading-7 md:text-base">
                      {t('states.ready')}
                    </p>
                  </div>
                )}
              </section>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                <section
                  className={`${panelClassName} bg-background grid gap-1 p-5`}
                >
                  <header className="grid gap-2 text-center">
                    <h3 className="text-foreground text-lg font-semibold tracking-normal md:text-xl">
                      {section.result.example_title}
                    </h3>
                  </header>

                  <div className="relative aspect-square w-full overflow-hidden rounded-3xl">
                    <ReactCompareSlider
                      position={50}
                      handle={<ComparisonHandle />}
                      itemOne={
                        <div className="relative size-full">
                          <ReactCompareSliderImage
                            alt={section.images.before.alt}
                            src={section.images.before.src}
                            className="object-cover"
                          />
                          <div className="bg-foreground text-primary-foreground absolute top-4 left-4 rounded-xl px-3 py-1 text-xs leading-5 font-semibold tracking-widest uppercase">
                            {section.result.before_label}
                          </div>
                        </div>
                      }
                      itemTwo={
                        <div className="relative size-full">
                          <ReactCompareSliderImage
                            alt={section.images.after.alt}
                            src={section.images.after.src}
                            className="object-cover"
                          />
                          <div className="bg-background text-foreground absolute top-4 right-4 rounded-xl px-3 py-1 text-xs leading-5 font-semibold tracking-widest uppercase">
                            {section.result.after_label}
                          </div>
                        </div>
                      }
                      className="size-full"
                    />
                  </div>
                </section>

                <section
                  className={`${panelClassName} bg-background grid gap-0 p-5`}
                >
                  <header className="text-center">
                    <h3 className="text-foreground text-lg font-semibold tracking-normal md:text-xl">
                      {section.result.how_to_use_title}
                    </h3>
                  </header>
                  <div className="-mt-8 grid gap-4">
                    {section.result.usage_steps.map((step, index) => (
                      <div
                        key={step}
                        className="border-border bg-background flex items-center rounded-xl border px-3 py-1"
                      >
                        <p className="text-muted-foreground text-sm leading-7 md:text-base">
                          <span className="text-primary font-semibold">
                            {index + 1}:
                          </span>{' '}
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-muted-foreground text-xs leading-5">
                    <span className="text-primary">
                      {section.result.tip_prefix}
                    </span>{' '}
                    {section.result.tip_text}
                  </p>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
