'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CreditCard,
  Download,
  ImageIcon,
  Loader2,
  Sparkles,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Link } from '@/core/i18n/navigation';
import { AIMediaType, AITaskStatus } from '@/extensions/ai/types';
import {
  ImageUploader,
  ImageUploaderValue,
  LazyImage,
} from '@/shared/blocks/common';
import { AspectRatioOption } from '@/shared/components/ui/aspect-ratio-option';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Progress } from '@/shared/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Textarea } from '@/shared/components/ui/textarea';
import { useAppContext } from '@/shared/contexts/app';
import {
  extractImageUrls,
  getNanoBananaModelFamily,
  getNanoBananaMaxBatchCount,
  getNanoBananaMaxReferenceImages,
  getNanoBananaMaxReferenceImageSizeMB,
  getNanoBananaResolution,
  getNanoBananaReferenceImageFormatsLabel,
  NANO_BANANA_MODEL_FAMILIES,
  resolveNanoBananaGeneration,
  type NanoBananaResolution,
} from '@/shared/lib/ai-image';
import { cn } from '@/shared/lib/utils';

interface ImageGeneratorProps {
  allowMultipleImages?: boolean;
  maxImages?: number;
  maxSizeMB?: number;
  srOnlyTitle?: string;
  className?: string;
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

type ImageGeneratorTab = 'text-to-image' | 'image-to-image';

const POLL_INTERVAL = 5000;
const GENERATION_TIMEOUT = 180000;
const MAX_PROMPT_LENGTH = 2000;

function parseTaskResult(taskResult: string | null): any {
  if (!taskResult) {
    return null;
  }

  try {
    return JSON.parse(taskResult);
  } catch (error) {
    console.warn('Failed to parse taskResult:', error);
    return null;
  }
}

export function ImageGenerator({
  allowMultipleImages = true,
  maxImages = 9,
  maxSizeMB,
  srOnlyTitle,
  className,
}: ImageGeneratorProps) {
  const t = useTranslations('ai.image.generator');

  const [activeTab, setActiveTab] =
    useState<ImageGeneratorTab>('text-to-image');

  const [modelFamilyId, setModelFamilyId] = useState(
    NANO_BANANA_MODEL_FAMILIES[0]?.id ?? ''
  );
  const [resolution, setResolution] = useState(
    NANO_BANANA_MODEL_FAMILIES[0]?.defaultResolution ?? '1K'
  );
  const [count, setCount] = useState(1);
  const [prompt, setPrompt] = useState('');
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

  const { user, isCheckSign, setIsShowSignModal, fetchUserCredits } =
    useAppContext();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const promptLength = prompt.trim().length;
  const remainingCredits = user?.credits?.remainingCredits ?? 0;
  const isPromptTooLong = promptLength > MAX_PROMPT_LENGTH;
  const isTextToImageMode = activeTab === 'text-to-image';
  const selectedModelFamily = useMemo(
    () =>
      getNanoBananaModelFamily(modelFamilyId) ?? NANO_BANANA_MODEL_FAMILIES[0],
    [modelFamilyId]
  );
  const maxReferenceImages = useMemo(
    () =>
      allowMultipleImages
        ? Math.min(
            maxImages,
            getNanoBananaMaxReferenceImages(selectedModelFamily?.id ?? '')
          )
        : 1,
    [allowMultipleImages, maxImages, selectedModelFamily]
  );
  const maxReferenceImageSizeMB = useMemo(
    () =>
      getNanoBananaMaxReferenceImageSizeMB(selectedModelFamily?.id ?? ''),
    [selectedModelFamily]
  );
  const effectiveMaxReferenceImageSizeMB = useMemo(
    () =>
      typeof maxSizeMB === 'number'
        ? Math.min(maxSizeMB, maxReferenceImageSizeMB)
        : maxReferenceImageSizeMB,
    [maxReferenceImageSizeMB, maxSizeMB]
  );
  const supportedResolutions = selectedModelFamily?.supportedResolutions ?? [
    '1K',
  ];
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
  const aspectRatios = selectedModelFamily?.aspectRatios ?? ['1:1'];
  const defaultAspectRatio = aspectRatios.includes('auto')
    ? 'auto'
    : (selectedModelFamily?.defaultAspectRatio ?? aspectRatios[0] ?? '1:1');
  const [aspectRatio, setAspectRatio] = useState(defaultAspectRatio);
  const resolvedGeneration = useMemo(() => {
    if (!selectedModelFamily) {
      return null;
    }

    return resolveNanoBananaGeneration({
      familyId: selectedModelFamily.id,
      mode: activeTab,
      resolution,
    });
  }, [activeTab, resolution, selectedModelFamily]);
  const resolvedModel = resolvedGeneration?.model ?? null;
  const costCredits = (resolvedGeneration?.costCredits ?? 0) * count;

  const handleTabChange = (value: string) => {
    setActiveTab(value as ImageGeneratorTab);
  };

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

  useEffect(() => {
    const normalizedResolution = selectedModelFamily
      ? getNanoBananaResolution(selectedModelFamily.id, resolution)
      : '1K';

    if (normalizedResolution !== resolution) {
      setResolution(normalizedResolution);
    }
  }, [resolution, selectedModelFamily]);

  useEffect(() => {
    if (count > maxBatchCount) {
      setCount(maxBatchCount);
    }
  }, [count, maxBatchCount]);

  const taskStatusLabel = useMemo(() => {
    if (!taskStatus) {
      return '';
    }

    switch (taskStatus) {
      case AITaskStatus.PENDING:
        return 'Waiting for the model to start';
      case AITaskStatus.PROCESSING:
        return 'Generating your image...';
      case AITaskStatus.SUCCESS:
        return 'Image generation completed';
      case AITaskStatus.FAILED:
        return 'Generation failed';
      default:
        return '';
    }
  }, [taskStatus]);

  const handleReferenceImagesChange = useCallback(
    (items: ImageUploaderValue[]) => {
      setReferenceImageItems(items);
      const uploadedUrls = items
        .filter((item) => item.status === 'uploaded' && item.url)
        .map((item) => item.url as string);
      setReferenceImageUrls(uploadedUrls);
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

  const resetTaskState = useCallback(() => {
    setIsGenerating(false);
    setProgress(0);
    setTaskStatus(null);
    setCurrentTaskNumber(0);
  }, []);

  const pollTaskStatus = useCallback(
    async ({
      id,
      index,
      total,
      promptText,
      provider,
      model,
    }: {
      id: string;
      index: number;
      total: number;
      promptText: string;
      provider: string;
      model: string;
    }) => {
      const generationStartTime = Date.now();
      try {
        while (Date.now() - generationStartTime <= GENERATION_TIMEOUT) {
          const resp = await fetch('/api/ai/query', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ taskId: id }),
          });

          if (!resp.ok) {
            throw new Error(`request failed with status: ${resp.status}`);
          }

          const { code, message, data } = await resp.json();
          if (code !== 0) {
            throw new Error(message || 'Query task failed');
          }

          const task = data as BackendTask;
          const currentStatus = task.status as AITaskStatus;
          setTaskStatus(currentStatus);
          setCurrentTaskNumber(index);

          const parsedInfo = parseTaskResult(task.taskInfo);
          const parsedResult = parseTaskResult(task.taskResult);
          const imageUrls = Array.from(
            new Set([
              ...extractImageUrls(parsedInfo),
              ...extractImageUrls(parsedResult),
            ])
          );
          const completedProgress = Math.round(((index - 1) / total) * 100);

          if (currentStatus === AITaskStatus.PENDING) {
            setProgress((prev) => Math.max(prev, completedProgress + 10));
            await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
            continue;
          }

          if (currentStatus === AITaskStatus.PROCESSING) {
            setProgress((prev) => Math.max(prev, completedProgress + 70));
            await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
            continue;
          }

          if (currentStatus === AITaskStatus.SUCCESS) {
            if (imageUrls.length === 0) {
              throw new Error('The provider returned no images. Please retry.');
            }

            setProgress(Math.round((index / total) * 100));

            return imageUrls.map((url, imageIndex) => ({
              id: `${task.id}-${imageIndex}`,
              url,
              provider,
              model,
              prompt: promptText,
            }));
          }

          if (currentStatus === AITaskStatus.FAILED) {
            const errorMessage =
              parsedInfo?.errorMessage ||
              parsedResult?.errorMessage ||
              'Generate image failed';
            throw new Error(errorMessage);
          }

          setProgress((prev) => Math.min(prev + 5, 95));
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
        }

        throw new Error('Image generation timed out. Please try again.');
      } catch (error: any) {
        console.error('Error polling image task:', error);
        throw error;
      }
    },
    []
  );

  const handleGenerate = async () => {
    if (!user) {
      setIsShowSignModal(true);
      return;
    }

    if (remainingCredits < costCredits) {
      toast.error('Insufficient credits. Please top up to keep creating.');
      return;
    }

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      toast.error('Please enter a prompt before generating.');
      return;
    }

    if (!selectedModelFamily || !resolvedModel) {
      toast.error('Provider or model is not configured correctly.');
      return;
    }

    if (!isTextToImageMode && referenceImageUrls.length === 0) {
      toast.error('Please upload reference images before generating.');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setTaskStatus(AITaskStatus.PENDING);
    setGeneratedImages([]);

    try {
      const images: GeneratedImage[] = [];

      for (let index = 1; index <= count; index += 1) {
        setCurrentTaskNumber(index);
        setProgress(Math.round(((index - 1) / count) * 100));

        const options: Record<string, any> = {
          aspect_ratio: aspectRatio,
        };

        if (resolvedGeneration?.shouldSendResolution) {
          options.resolution = resolvedGeneration.resolution;
        }

        if (!isTextToImageMode) {
          options.image_input = referenceImageUrls;
        }

        const resp = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mediaType: AIMediaType.IMAGE,
            scene: isTextToImageMode ? 'text-to-image' : 'image-to-image',
            provider: selectedModelFamily.provider,
            model: resolvedModel,
            prompt: trimmedPrompt,
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

        const newTaskId = data?.id;
        if (!newTaskId) {
          throw new Error('Task id missing in response');
        }

        let batchImages: GeneratedImage[] = [];

        if (data.status === AITaskStatus.SUCCESS && data.taskInfo) {
          const parsedTaskInfo = parseTaskResult(data.taskInfo);
          const parsedTaskResult = parseTaskResult(data.taskResult);
          const imageUrls = Array.from(
            new Set([
              ...extractImageUrls(parsedTaskInfo),
              ...extractImageUrls(parsedTaskResult),
            ])
          );

          if (imageUrls.length === 0) {
            throw new Error('The provider returned no images. Please retry.');
          }

          batchImages = imageUrls.map((url, imageIndex) => ({
            id: `${newTaskId}-${imageIndex}`,
            url,
            provider: selectedModelFamily.provider,
            model: resolvedModel,
            prompt: trimmedPrompt,
          }));
          setProgress(Math.round((index / count) * 100));
        } else {
          batchImages = await pollTaskStatus({
            id: newTaskId,
            index,
            total: count,
            promptText: trimmedPrompt,
            provider: selectedModelFamily.provider,
            model: resolvedModel,
          });
        }

        images.push(...batchImages);
        setGeneratedImages([...images]);
      }

      toast.success('Image generated successfully');
      await fetchUserCredits();
    } catch (error: any) {
      console.error('Failed to generate image:', error);
      toast.error(`Failed to generate image: ${error.message}`);
      resetTaskState();
      await fetchUserCredits();
      return;
    }

    setProgress(100);
    resetTaskState();
  };

  const handleDownloadImage = async (image: GeneratedImage) => {
    if (!image.url) {
      return;
    }

    try {
      setDownloadingImageId(image.id);
      // fetch image via proxy
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
    } catch (error) {
      console.error('Failed to download image:', error);
      toast.error('Failed to download image');
    } finally {
      setDownloadingImageId(null);
    }
  };

  return (
    <section className={cn('py-16 md:py-24', className)}>
      <div className="container">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                {srOnlyTitle && <h2 className="sr-only">{srOnlyTitle}</h2>}
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  {t('title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pb-8">
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                  <TabsList className="bg-primary/10 grid w-full grid-cols-2">
                    <TabsTrigger value="text-to-image">
                      {t('tabs.text-to-image')}
                    </TabsTrigger>
                    <TabsTrigger value="image-to-image">
                      {t('tabs.image-to-image')}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <div className="space-y-2">
                    <Label>{t('form.model')}</Label>
                    <Select
                      value={modelFamilyId}
                      onValueChange={setModelFamilyId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('form.select_model')} />
                      </SelectTrigger>
                      <SelectContent>
                        {NANO_BANANA_MODEL_FAMILIES.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('form.aspect_ratio')}</Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger className="w-full">
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
                    <Label>{t('form.quality')}</Label>
                    <Select
                      value={resolution}
                      onValueChange={(value) =>
                        setResolution(value as NanoBananaResolution)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('form.select_quality')} />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedResolutions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('form.count')}</Label>
                    <Select
                      value={String(count)}
                      onValueChange={(value) => setCount(Number(value))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('form.select_count')} />
                      </SelectTrigger>
                      <SelectContent>
                        {countOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {!isTextToImageMode && (
                  <div className="space-y-4">
                    <ImageUploader
                      title={t('form.reference_image')}
                      allowMultiple={maxReferenceImages > 1}
                      maxImages={maxReferenceImages}
                      maxSizeMB={effectiveMaxReferenceImageSizeMB}
                      onChange={handleReferenceImagesChange}
                      emptyHint={`${getNanoBananaReferenceImageFormatsLabel()}, up to ${effectiveMaxReferenceImageSizeMB}MB each, ${maxReferenceImages} image${maxReferenceImages > 1 ? 's' : ''} max`}
                    />

                    {hasReferenceUploadError && (
                      <p className="text-destructive text-xs">
                        {t('form.some_images_failed_to_upload')}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="image-prompt">{t('form.prompt')}</Label>
                  <Textarea
                    id="image-prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t('form.prompt_placeholder')}
                    className="min-h-32"
                  />
                  <div className="text-muted-foreground flex items-center justify-between text-xs">
                    <span>
                      {promptLength} / {MAX_PROMPT_LENGTH}
                    </span>
                    {isPromptTooLong && (
                      <span className="text-destructive">
                        {t('form.prompt_too_long')}
                      </span>
                    )}
                  </div>
                </div>

                {!isMounted ? (
                  <Button className="w-full" disabled size="lg">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('loading')}
                  </Button>
                ) : isCheckSign ? (
                  <Button className="w-full" disabled size="lg">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('checking_account')}
                  </Button>
                ) : user ? (
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleGenerate}
                    disabled={
                      isGenerating ||
                      !prompt.trim() ||
                      isPromptTooLong ||
                      isReferenceUploading ||
                      hasReferenceUploadError
                    }
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('generating')}
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {t('generate')}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => setIsShowSignModal(true)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    {t('sign_in_to_generate')}
                  </Button>
                )}

                {!isMounted ? (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary">
                      {t('credits_cost', { credits: costCredits })}
                    </span>
                    <span>{t('credits_remaining', { credits: 0 })}</span>
                  </div>
                ) : user && remainingCredits > 0 ? (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary">
                      {t('credits_cost', { credits: costCredits })}
                    </span>
                    <span>
                      {t('credits_remaining', { credits: remainingCredits })}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-primary">
                        {t('credits_cost', { credits: costCredits })}
                      </span>
                      <span>
                        {t('credits_remaining', { credits: remainingCredits })}
                      </span>
                    </div>
                    <Link href="/pricing">
                      <Button variant="outline" className="w-full" size="lg">
                        <CreditCard className="mr-2 h-4 w-4" />
                        {t('buy_credits')}
                      </Button>
                    </Link>
                  </div>
                )}

                {isGenerating && (
                  <div className="space-y-2 rounded-lg border p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>{t('progress')}</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                    {taskStatusLabel && (
                      <p className="text-muted-foreground text-center text-xs">
                        {taskStatusLabel}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <ImageIcon className="h-5 w-5" />
                  {t('generated_images')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                {generatedImages.length > 0 ? (
                  <div
                    className={
                      generatedImages.length === 1
                        ? 'grid grid-cols-1 gap-6'
                        : 'grid gap-6 sm:grid-cols-2'
                    }
                  >
                    {generatedImages.map((image) => (
                      <div key={image.id} className="space-y-3">
                        <div
                          className={
                            generatedImages.length === 1
                              ? 'relative overflow-hidden rounded-lg border'
                              : 'relative aspect-square overflow-hidden rounded-lg border'
                          }
                        >
                          <LazyImage
                            src={image.url}
                            alt={image.prompt || 'Generated image'}
                            className={
                              generatedImages.length === 1
                                ? 'h-auto w-full'
                                : 'h-full w-full object-cover'
                            }
                          />

                          <div className="absolute right-2 bottom-2 flex justify-end text-sm">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="ml-auto"
                              onClick={() => handleDownloadImage(image)}
                              disabled={downloadingImageId === image.id}
                            >
                              {downloadingImageId === image.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4" />
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                      <ImageIcon className="text-muted-foreground h-10 w-10" />
                    </div>
                    <p className="text-muted-foreground">
                      {isGenerating
                        ? t('ready_to_generate')
                        : t('no_images_generated')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
