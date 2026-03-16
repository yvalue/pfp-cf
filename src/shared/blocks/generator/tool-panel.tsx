'use client';

import {
  type ChangeEvent,
  type DragEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Check,
  ChevronsUpDown,
  Download,
  Loader2,
  Sparkles,
  Upload,
  User,
  X,
} from 'lucide-react';
import { RiVipDiamondFill } from 'react-icons/ri';
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from 'react-compare-slider';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { AIMediaType, AITaskStatus } from '@/extensions/ai/types';
import { LazyImage, type ImageUploaderValue } from '@/shared/blocks/common';
import { ToolDashboardWorkbench } from '@/shared/blocks/tool-dashboard';
import { AspectRatioOption } from '@/shared/components/ui/aspect-ratio-option';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
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

type FieldBadgeVariant = 'required' | 'muted';
type HeadshotTab = 'upload' | 'parameter';

type SelectOption = {
  label: string;
  value: string;
};

type EffectOption = {
  id: string;
  label: string;
  accentClassName: string;
  cardClassName: string;
  silhouetteClassName: string;
};

type ToolImage = {
  src: string;
  alt: string;
};

export type ProfessionalHeadshotGeneratorSection = {
  title: string;
  description: string;
  tabs: {
    upload: string;
    parameter: string;
  };
  fields: {
    required_badge: string;
    optional_badge: string;
    default_badge: string;
    upload_label: string;
    description_label: string;
    effect_style_label: string;
    model_label: string;
    aspect_ratio_label: string;
    quality_label: string;
    count_label: string;
  };
  upload: {
    title: string;
    formats: string;
    supports: string;
  };
  description_placeholder: string;
  description_counter?: string;
  effects: EffectOption[];
  selects: {
    aspect_ratio: SelectOption[];
    resolution: SelectOption[];
    batch_size: SelectOption[];
  };
  result: {
    example_title: string;
    before_label: string;
    after_label: string;
    how_to_use_title: string;
    usage_steps: string[];
    tip_prefix: string;
    tip_text: string;
  };
  buttons: {
    submit: string;
    download: string;
  };
  credits: {
    submit_cost: number;
  };
  images: {
    before: ToolImage;
    after: ToolImage;
  };
};

interface ProfessionalHeadshotGeneratorProps {
  section: ProfessionalHeadshotGeneratorSection;
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
const MAX_PROMPT_LENGTH = 1000;
const sectionClassName = 'grid gap-6 lg:max-xl:gap-5';
const tabTriggerClassName =
  'text-foreground data-[state=active]:text-primary-foreground relative z-10 h-9 min-w-0 rounded-full bg-transparent px-4 text-sm font-medium tracking-tight transition-[transform,color] duration-300 ease-out will-change-transform active:scale-[0.98] data-[state=active]:bg-transparent data-[state=active]:shadow-none';
const selectTriggerClassName = 'h-10 w-full rounded-xl';
const panelClassName = 'rounded-3xl border border-border/60 backdrop-blur';
const comparisonLabelClassName =
  'absolute rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur';
const usageStepClassName =
  'border-border/70 bg-background/95 grid grid-cols-[auto_1fr] items-center gap-3 rounded-2xl border px-4 py-3';
const workbenchPaneClassName =
  'rounded-3xl border border-border/60 bg-background/95 backdrop-blur-xl';

async function uploadImageFile(file: File) {
  const formData = new FormData();
  formData.append('files', file);

  const response = await fetch('/api/storage/upload-image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }

  const result = await response.json();
  if (result.code !== 0 || !result.data?.urls?.length) {
    throw new Error(result.message || 'Upload failed');
  }

  return result.data.urls[0] as string;
}

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

function getTaskStatusText({
  status,
  currentTaskNumber,
  totalTasks,
}: {
  status: AITaskStatus | null;
  currentTaskNumber: number;
  totalTasks: number;
}) {
  if (!status || currentTaskNumber <= 0 || totalTasks <= 0) {
    return '';
  }

  const prefix = `${currentTaskNumber}/${totalTasks}`;

  switch (status) {
    case AITaskStatus.PENDING:
      return `${prefix} pending`;
    case AITaskStatus.PROCESSING:
      return `${prefix} processing`;
    case AITaskStatus.SUCCESS:
      return `${prefix} completed`;
    case AITaskStatus.FAILED:
      return `${prefix} failed`;
    default:
      return prefix;
  }
}

function FieldBadge({
  children,
  variant = 'muted',
}: {
  children: ReactNode;
  variant?: FieldBadgeVariant;
}) {
  return (
    <span
      className={
        variant === 'required'
          ? 'bg-primary/10 text-primary inline-flex items-center rounded-full px-2 text-xs font-medium'
          : 'bg-muted text-muted-foreground inline-flex items-center rounded-full px-2 text-xs font-medium'
      }
    >
      {children}
    </span>
  );
}

function FieldHeader({
  badge,
  badgeVariant = 'muted',
  label,
  trailing,
}: {
  badge: string;
  badgeVariant?: FieldBadgeVariant;
  label: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-medium">{label}</h3>
        <FieldBadge variant={badgeVariant}>{badge}</FieldBadge>
      </div>
      {trailing ? <div>{trailing}</div> : null}
    </div>
  );
}

function EffectThumbnail({
  accentClassName,
  cardClassName,
  silhouetteClassName,
}: Pick<
  EffectOption,
  'accentClassName' | 'cardClassName' | 'silhouetteClassName'
>) {
  return (
    <div
      className={cn(
        'relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl lg:max-xl:h-10 lg:max-xl:w-10',
        cardClassName
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_16%,rgba(255,255,255,0.22),transparent_18%)]" />
      <div className="absolute inset-x-2.5 top-1.5 h-2.5 rounded-full bg-white/70" />
      <div
        className={cn(
          'absolute inset-x-2.5 top-5 bottom-1.5 rounded-2xl',
          silhouetteClassName
        )}
      />
      <div
        className={cn(
          'absolute top-1.5 left-1.5 h-2 w-2 rounded-full',
          accentClassName
        )}
      />
    </div>
  );
}

function ComparisonHandle() {
  return (
    <div className="pointer-events-none relative flex h-full items-center justify-center text-white">
      <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white" />
      <div className="relative z-10 inline-flex items-center gap-5 bg-transparent px-0 text-xs font-semibold tracking-widest">
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

export function ProfessionalHeadshotGenerator({
  section,
}: ProfessionalHeadshotGeneratorProps) {
  const generatorT = useTranslations('ai.image.generator');
  const [activeTab, setActiveTab] = useState<HeadshotTab>('upload');
  const [selectedEffectId, setSelectedEffectId] = useState(
    section.effects[0]?.id ?? ''
  );
  const [prompt, setPrompt] = useState('');
  const [modelFamilyId, setModelFamilyId] = useState(
    NANO_BANANA_MODEL_FAMILIES[0]?.id ?? ''
  );
  const [resolution, setResolution] = useState<NanoBananaResolution>(
    NANO_BANANA_MODEL_FAMILIES[0]?.defaultResolution ?? '1K'
  );
  const [aspectRatio, setAspectRatio] = useState(
    NANO_BANANA_MODEL_FAMILIES[0]?.defaultAspectRatio ?? '1:1'
  );
  const [countValue, setCountValue] = useState(
    section.selects.batch_size[0]?.value ?? '1'
  );
  const [referenceImageItems, setReferenceImageItems] = useState<
    ImageUploaderValue[]
  >([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [taskStatus, setTaskStatus] = useState<AITaskStatus | null>(null);
  const [currentTaskNumber, setCurrentTaskNumber] = useState(0);
  const [downloadingImageId, setDownloadingImageId] = useState<string | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);
  const [isUploadDragActive, setIsUploadDragActive] = useState(false);

  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const referenceImageItemsRef = useRef<ImageUploaderValue[]>([]);

  const { user, isCheckSign, setIsShowSignModal, fetchUserCredits } =
    useAppContext();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    referenceImageItemsRef.current = referenceImageItems;
  }, [referenceImageItems]);

  const promptLength = prompt.trim().length;
  const isPromptTooLong = promptLength > MAX_PROMPT_LENGTH;
  const remainingCredits = user?.credits?.remainingCredits ?? 0;
  const count = Math.max(1, parseInt(countValue, 10) || 1);
  const activeTabIndex = activeTab === 'parameter' ? 1 : 0;

  const selectedEffect =
    section.effects.find((item) => item.id === selectedEffectId) ??
    section.effects[0];

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
  const countOptions = useMemo(
    () =>
      section.selects.batch_size.filter((item) => {
        const optionCount = parseInt(item.value, 10);
        return (
          !Number.isNaN(optionCount) &&
          optionCount <= getNanoBananaMaxBatchCount(selectedModelFamily?.id ?? '')
        );
      }),
    [section.selects.batch_size, selectedModelFamily]
  );
  const remainingUploadSlots = Math.max(
    0,
    maxReferenceImages - referenceImageItems.length
  );
  const uploadSupportsText = useMemo(() => {
    const template = section.upload.supports?.trim();

    if (!template) {
      return String(remainingUploadSlots);
    }

    if (template.includes('{count}')) {
      return template.replace('{count}', String(remainingUploadSlots));
    }

    return `${template} (${remainingUploadSlots})`;
  }, [remainingUploadSlots, section.upload.supports]);
  const uploadFormatsText = useMemo(() => {
    const formatsLabel = getNanoBananaReferenceImageFormatsLabel();
    return `${formatsLabel} (max ${maxReferenceImageSizeMB}MB each)`;
  }, [maxReferenceImageSizeMB]);

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

  const taskStatusText = useMemo(
    () =>
      getTaskStatusText({
        status: taskStatus,
        currentTaskNumber,
        totalTasks: count,
      }),
    [count, currentTaskNumber, taskStatus]
  );

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
    if (
      countOptions.length > 0 &&
      !countOptions.some((item) => item.value === countValue)
    ) {
      setCountValue(countOptions[0]?.value ?? '1');
    }
  }, [countOptions, countValue]);

  const handleRemoveReferenceImage = useCallback((id: string) => {
    setReferenceImageItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.preview.startsWith('blob:')) {
        URL.revokeObjectURL(target.preview);
      }
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const handleUploadFiles = useCallback(
    async (selectedFiles: File[]) => {
      const maxBytes = maxReferenceImageSizeMB * 1024 * 1024;
      const availableSlots = Math.max(0, maxReferenceImages - referenceImageItems.length);

      const filesToAdd = selectedFiles
        .filter((file) => {
          if (!file.type.startsWith('image/')) {
            toast.error(`"${file.name}" is not an image`);
            return false;
          }

          if (file.size > maxBytes) {
            toast.error(
              `"${file.name}" exceeds the ${maxReferenceImageSizeMB}MB limit`
            );
            return false;
          }

          return true;
        })
        .slice(0, availableSlots);

      if (filesToAdd.length === 0) {
        if (selectedFiles.length > 0 && availableSlots === 0) {
          toast.error(`You can upload up to ${maxReferenceImages} images.`);
        }
        return;
      }

      const nextItems: ImageUploaderValue[] = filesToAdd.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        preview: URL.createObjectURL(file),
        status: 'uploading',
        size: file.size,
      }));

      setReferenceImageItems((prev) => [...prev, ...nextItems]);

      await Promise.all(
        nextItems.map(async (item, index) => {
          try {
            const uploadedUrl = await uploadImageFile(filesToAdd[index]);
            setReferenceImageItems((prev) =>
              prev.map((current) => {
                if (current.id !== item.id) {
                  return current;
                }

                if (current.preview.startsWith('blob:')) {
                  URL.revokeObjectURL(current.preview);
                }

                return {
                  ...current,
                  preview: uploadedUrl,
                  url: uploadedUrl,
                  status: 'uploaded',
                };
              })
            );
          } catch (error: any) {
            console.error('Upload failed:', error);
            toast.error(error?.message || 'Upload failed');
            setReferenceImageItems((prev) =>
              prev.map((current) =>
                current.id === item.id
                  ? {
                      ...current,
                      status: 'error',
                    }
                  : current
              )
            );
          }
        })
      );
    },
    [maxReferenceImageSizeMB, maxReferenceImages, referenceImageItems.length]
  );

  const handleUploadInputChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length > 0) {
        await handleUploadFiles(files);
      }
      event.target.value = '';
    },
    [handleUploadFiles]
  );

  const openUploadPicker = useCallback(() => {
    uploadInputRef.current?.click();
  }, []);

  const handleUploadDrop = useCallback(
    async (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsUploadDragActive(false);
      const files = Array.from(event.dataTransfer.files || []);
      if (files.length > 0) {
        await handleUploadFiles(files);
      }
    },
    [handleUploadFiles]
  );

  useEffect(() => {
    if (referenceImageItems.length <= maxReferenceImages) {
      return;
    }

    setReferenceImageItems((prev) => {
      if (prev.length <= maxReferenceImages) {
        return prev;
      }

      const overflowItems = prev.slice(maxReferenceImages);
      overflowItems.forEach((item) => {
        if (item.preview.startsWith('blob:')) {
          URL.revokeObjectURL(item.preview);
        }
      });

      return prev.slice(0, maxReferenceImages);
    });
  }, [maxReferenceImages, referenceImageItems.length]);

  useEffect(() => {
    return () => {
      referenceImageItemsRef.current.forEach((item) => {
        if (item.preview.startsWith('blob:')) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, []);

  const resetGenerationState = useCallback(() => {
    setIsGenerating(false);
    setTaskStatus(null);
    setCurrentTaskNumber(0);
  }, []);

  const createImageTask = useCallback(
    async (trimmedPrompt: string) => {
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
        throw new Error(`request failed with status: ${response.status}`);
      }

      const { code, message, data } = await response.json();
      if (code !== 0) {
        throw new Error(message || 'Failed to create an image task');
      }

      return data as BackendTask;
    },
    [
      aspectRatio,
      referenceImageUrls,
      resolvedGeneration,
      resolvedModel,
      selectedModelFamily,
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
          throw new Error(`request failed with status: ${response.status}`);
        }

        const { code, message, data } = await response.json();
        if (code !== 0) {
          throw new Error(message || 'Query task failed');
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
            'Generate image failed';

          toast.error(errorMessage);
          return {
            task,
            imageUrls: [],
          };
        }

        setProgress(calculateProgress(completedTasks, totalTasks, 0.5));
        await sleep(POLL_INTERVAL);
      }

      throw new Error('Image generation timed out. Please try again.');
    },
    []
  );

  const handleGenerate = useCallback(async () => {
    if (!user) {
      setIsShowSignModal(true);
      return;
    }

    if (remainingCredits < totalCost) {
      toast.error('Insufficient credits. Please top up to keep creating.');
      return;
    }

    if (!selectedModelFamily || !resolvedModel) {
      toast.error('Provider or model is not configured correctly.');
      return;
    }

    if (referenceImageUrls.length === 0) {
      toast.error('Please upload at least one image before generating.');
      return;
    }

    if (isPromptTooLong) {
      toast.error('Prompt is too long.');
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
        toast.success(`Generated ${successCount}/${count} image(s).`);
      } else {
        toast.error('No images were generated. Please try again.');
      }
    } catch (error: any) {
      console.error('Failed to generate image:', error);
      toast.error(error?.message || 'Failed to generate image');
    } finally {
      setProgress((current) => (successCount > 0 ? 100 : current));
      resetGenerationState();
      await fetchUserCredits();
    }
  }, [
    count,
    createImageTask,
    fetchUserCredits,
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
    totalCost,
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
          throw new Error('Failed to fetch image');
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
        toast.success('Image downloaded');
      } catch (error) {
        console.error('Failed to download image:', error);
        toast.error('Failed to download image');
      } finally {
        setDownloadingImageId(null);
      }
    },
    []
  );

  return (
    <ToolDashboardWorkbench
      className="border-0 bg-transparent px-0 py-2"
      gridClassName="gap-4 lg:grid-cols-12 xl:grid-cols-12"
      leftPaneClassName={`${workbenchPaneClassName} lg:col-span-4 lg:px-5 lg:py-5 xl:px-7 xl:py-6`}
      rightPaneClassName={`${workbenchPaneClassName} lg:col-span-8 lg:px-7 lg:py-6`}
      left={
        <div className="flex h-full flex-col gap-6 lg:max-xl:gap-5">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as HeadshotTab)}
            className="flex min-h-0 flex-1 flex-col gap-6 lg:max-xl:gap-5"
          >
            <TabsList className="border-border/70 bg-background/80 relative inline-grid h-auto w-full grid-cols-2 rounded-full border p-1 shadow-none backdrop-blur-sm">
              <div
                aria-hidden
                className="bg-primary absolute inset-y-1 left-1 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  width: 'calc((100% - 0.5rem) / 2)',
                  transform: `translateX(${activeTabIndex * 100}%)`,
                }}
              />
              <TabsTrigger value="upload" className={tabTriggerClassName}>
                {section.tabs.upload}
              </TabsTrigger>
              <TabsTrigger value="parameter" className={tabTriggerClassName}>
                {section.tabs.parameter}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-0 flex-1">
              <div className={sectionClassName}>
                <section className="grid gap-2">
                  <FieldHeader
                    badge={section.fields.required_badge}
                    badgeVariant="required"
                    label={section.fields.upload_label}
                  />

                  <input
                    ref={uploadInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUploadInputChange}
                    className="hidden"
                  />

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={openUploadPicker}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openUploadPicker();
                      }
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsUploadDragActive(true);
                    }}
                    onDragLeave={() => setIsUploadDragActive(false)}
                    onDrop={handleUploadDrop}
                    className={cn(
                      'border-primary/40 bg-primary/5 flex min-h-32 flex-col overflow-hidden rounded-3xl border-2 border-dashed px-6 py-5 text-center transition-colors lg:max-xl:min-h-28 lg:max-xl:px-4 lg:max-xl:py-4',
                      isUploadDragActive && 'border-primary bg-primary/10'
                    )}
                  >
                    {referenceImageItems.length > 0 ? (
                      <>
                        <div className="max-h-44 overflow-y-auto pr-1 lg:max-xl:max-h-40">
                          <div className="grid grid-cols-2 gap-3">
                            {referenceImageItems.map((item) => (
                              <div
                                key={item.id}
                                className="border-primary/15 bg-background/80 group relative overflow-hidden rounded-2xl border border-dashed"
                              >
                                <img
                                  src={item.preview}
                                  alt="Reference"
                                  className="aspect-square w-full object-cover"
                                />
                                <div className="bg-foreground/65 text-primary-foreground absolute inset-x-0 bottom-0 px-2 py-1 text-[10px]">
                                  {item.status}
                                </div>
                                <button
                                  type="button"
                                  className="bg-foreground/70 text-primary-foreground absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleRemoveReferenceImage(item.id);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}

                            {remainingUploadSlots > 0 ? (
                              <div className="border-primary/35 bg-background/70 text-primary flex aspect-square items-center justify-center rounded-2xl border border-dashed">
                                <Upload className="size-6" />
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="text-muted-foreground mt-4 grid gap-1 text-xs leading-5 lg:max-xl:leading-4">
                          <p>{uploadFormatsText}</p>
                          <p className="font-medium">{uploadSupportsText}</p>
                        </div>
                      </>
                    ) : (
                      <div className="grid flex-1 place-items-center">
                        <div className="grid gap-2 lg:max-xl:gap-1.5">
                          <div className="bg-primary/10 text-primary mx-auto flex size-14 items-center justify-center rounded-2xl lg:max-xl:size-12">
                            <Upload className="size-6 lg:max-xl:size-5" />
                          </div>
                          <div className="grid gap-1.5 lg:max-xl:gap-1">
                            <p className="text-foreground text-base font-medium break-words lg:max-xl:text-sm">
                              {section.upload.title}
                            </p>
                            <p className="text-muted-foreground text-xs leading-5 lg:max-xl:leading-4">
                              {uploadFormatsText}
                              <br />
                              <span className="text-muted-foreground font-medium">
                                {uploadSupportsText}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {isReferenceUploading ? (
                    <p className="text-muted-foreground text-xs">
                      Uploading images...
                    </p>
                  ) : null}

                  {hasReferenceUploadError ? (
                    <p className="text-destructive text-xs">
                      {generatorT('form.some_images_failed_to_upload')}
                    </p>
                  ) : null}
                </section>

                <section className="grid gap-2">
                  <FieldHeader
                    badge={section.fields.optional_badge}
                    label={section.fields.description_label}
                    trailing={
                      <div className="text-muted-foreground flex items-center gap-2 text-xs">
                        <Sparkles className="size-3.5" />
                        <span>
                          {promptLength}/{MAX_PROMPT_LENGTH}
                        </span>
                        {isPromptTooLong ? (
                          <span className="text-destructive">
                            {generatorT('form.prompt_too_long')}
                          </span>
                        ) : null}
                      </div>
                    }
                  />

                  <div className="border-border/70 bg-background/95 h-32 overflow-hidden rounded-3xl border lg:max-xl:h-28">
                    <textarea
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      placeholder={section.description_placeholder}
                      className="text-muted-foreground placeholder:text-muted-foreground h-full w-full resize-none border-0 bg-transparent px-4 py-4 text-sm leading-5 outline-none lg:max-xl:px-3.5 lg:max-xl:py-3.5"
                    />
                  </div>
                </section>

                <section className="grid gap-3 lg:max-xl:gap-2.5">
                  <FieldHeader
                    badge={section.fields.optional_badge}
                    label={section.fields.effect_style_label}
                  />

                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="border-border/70 bg-background/95 hover:border-border flex w-full min-w-0 items-center gap-3 rounded-3xl border px-3 py-2.5 text-left shadow-sm transition-colors outline-none"
                      >
                        {selectedEffect ? (
                          <EffectThumbnail
                            accentClassName={selectedEffect.accentClassName}
                            cardClassName={selectedEffect.cardClassName}
                            silhouetteClassName={
                              selectedEffect.silhouetteClassName
                            }
                          />
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <div className="text-foreground truncate text-sm font-semibold">
                            {selectedEffect?.label ??
                              section.fields.effect_style_label}
                          </div>
                        </div>
                        <ChevronsUpDown className="text-muted-foreground size-4 shrink-0" />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="start"
                      className="border-border/70 bg-background/95 w-[var(--radix-dropdown-menu-trigger-width)] rounded-3xl border p-2 shadow-xl"
                      sideOffset={8}
                    >
                      {section.effects.map((effect) => {
                        const isSelected = effect.id === selectedEffectId;

                        return (
                          <DropdownMenuItem
                            key={effect.id}
                            className="focus:bg-primary/5 flex items-center gap-3 rounded-2xl px-3 py-3"
                            onSelect={() => setSelectedEffectId(effect.id)}
                          >
                            <EffectThumbnail
                              accentClassName={effect.accentClassName}
                              cardClassName={effect.cardClassName}
                              silhouetteClassName={effect.silhouetteClassName}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-foreground truncate text-sm font-semibold">
                                {effect.label}
                              </div>
                            </div>
                            {isSelected ? (
                              <Check className="text-primary size-4 shrink-0" />
                            ) : null}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </section>
              </div>
            </TabsContent>

            <TabsContent value="parameter" className="mt-0 flex-1">
              <div className={sectionClassName}>
                <div className="grid min-w-0 gap-2">
                  <FieldHeader
                    badge={section.fields.default_badge}
                    label={section.fields.model_label}
                  />
                  <Select value={modelFamilyId} onValueChange={setModelFamilyId}>
                    <SelectTrigger className={selectTriggerClassName}>
                      <SelectValue
                        placeholder={generatorT('form.select_model')}
                      />
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

                <div className="grid gap-4 lg:max-xl:gap-3.5">
                  <div className="grid min-w-0 gap-2">
                    <FieldHeader
                      badge={section.fields.default_badge}
                      label={section.fields.aspect_ratio_label}
                    />
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
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

                  <div className="grid min-w-0 gap-2">
                    <FieldHeader
                      badge={section.fields.default_badge}
                      label={section.fields.quality_label}
                    />
                    <Select
                      value={resolution}
                      onValueChange={(value) =>
                        setResolution(value as NanoBananaResolution)
                      }
                    >
                      <SelectTrigger className={selectTriggerClassName}>
                        <SelectValue
                          placeholder={generatorT('form.select_quality')}
                        />
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

                  <div className="grid min-w-0 gap-2">
                    <FieldHeader
                      badge={section.fields.default_badge}
                      label={section.fields.count_label}
                    />
                    <Select value={countValue} onValueChange={setCountValue}>
                      <SelectTrigger className={selectTriggerClassName}>
                        <SelectValue placeholder={section.fields.count_label} />
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

          {!isMounted ? (
            <Button className="w-full" disabled size="lg">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {generatorT('loading')}
            </Button>
          ) : isCheckSign ? (
            <Button className="w-full" disabled size="lg">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {generatorT('checking_account')}
            </Button>
          ) : user ? (
            <Button
              size="lg"
              className="mt-auto min-w-44 rounded-xl text-base lg:max-xl:min-w-0 lg:max-xl:text-sm"
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
                  {generatorT('generating')}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {section.buttons.submit}
                </>
              )}
              <span className="bg-foreground/10 ml-2 inline-flex items-center gap-1 rounded-md px-1.5 text-base lg:max-xl:text-sm">
                {totalCost}
                <RiVipDiamondFill className="size-4 text-amber-400" />
              </span>
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full"
              onClick={() => setIsShowSignModal(true)}
            >
              <User className="mr-2 h-4 w-4" />
              {generatorT('sign_in_to_generate')}
            </Button>
          )}

        </div>
      }
      right={
        <div className="grid gap-5">
          <div className="grid gap-1.5">
            <h2 className="text-foreground text-2xl font-semibold tracking-tight">
              {section.title}
            </h2>
            <p className="text-muted-foreground text-sm">
              {section.description}
            </p>
          </div>

          {isGenerating || generatedImages.length > 0 ? (
            <section className={`${panelClassName} bg-background/95 p-5`}>
              <header className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-foreground text-lg font-semibold">
                    {generatorT('generated_images')}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {generatedImages.length}/{count}
                  </p>
                </div>
                {isGenerating ? (
                  <span className="text-muted-foreground text-xs">
                    {taskStatusText || `${currentTaskNumber}/${count}`}
                  </span>
                ) : null}
              </header>

              {(isGenerating || progress > 0) && (
                <div className="mb-5 space-y-2 rounded-2xl border border-border/60 bg-muted/30 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>{generatorT('progress')}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

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
                            ? 'relative overflow-hidden rounded-3xl border border-border/60 bg-muted/20'
                            : 'relative aspect-square overflow-hidden rounded-3xl border border-border/60 bg-muted/20'
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
                            className="rounded-xl text-foreground"
                            onClick={() => handleDownloadImage(image)}
                            disabled={downloadingImageId === image.id}
                          >
                            {downloadingImageId === image.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <>
                                <Download className="size-4" />
                                {section.buttons.download}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-52 items-center justify-center rounded-3xl border border-dashed border-border/70 bg-muted/20 p-6 text-center">
                  <p className="text-muted-foreground text-sm">
                    {generatorT('ready_for_generating')}
                  </p>
                </div>
              )}
            </section>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.18fr)_minmax(280px,0.82fr)]">
              <section className={`${panelClassName} bg-background/95 p-4`}>
                <header className="mb-3 text-center">
                  <h3 className="text-foreground text-lg font-semibold">
                    {section.result.example_title}
                  </h3>
                </header>

                <div className="bg-foreground/95 relative overflow-hidden rounded-3xl shadow-inner">
                  <ReactCompareSlider
                    position={50}
                    handle={<ComparisonHandle />}
                    itemOne={
                      <div className="relative aspect-square w-full">
                        <ReactCompareSliderImage
                          alt={section.images.before.alt}
                          src={section.images.before.src}
                          style={{ objectFit: 'cover' }}
                        />
                        <div
                          className={`${comparisonLabelClassName} bg-foreground/65 text-primary-foreground top-4 left-4`}
                        >
                          {section.result.before_label}
                        </div>
                      </div>
                    }
                    itemTwo={
                      <div className="relative aspect-square w-full">
                        <ReactCompareSliderImage
                          alt={section.images.after.alt}
                          src={section.images.after.src}
                          style={{ objectFit: 'cover' }}
                        />
                        <div
                          className={`${comparisonLabelClassName} bg-background/88 text-foreground top-4 right-4`}
                        >
                          {section.result.after_label}
                        </div>
                      </div>
                    }
                    style={{
                      width: '100%',
                      aspectRatio: '1 / 1',
                    }}
                  />
                </div>
              </section>

              <section className={`${panelClassName} bg-background/95 p-5`}>
                <header>
                  <h3 className="text-foreground text-center text-lg font-semibold">
                    {section.result.how_to_use_title}
                  </h3>
                </header>
                <div className="mt-4 grid gap-3">
                  {section.result.usage_steps.map((step, index) => (
                    <div key={step} className={usageStepClassName}>
                      <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-full text-sm font-semibold shadow-sm">
                        {index + 1}
                      </div>
                      <p className="text-foreground text-sm leading-6">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground mt-4 text-xs leading-5">
                  <span className="text-primary">
                    {section.result.tip_prefix}
                  </span>{' '}
                  {section.result.tip_text}
                </p>
              </section>
            </div>
          )}

          {!isGenerating ? (
            <div className="flex justify-center">
              <Button
                variant="outline"
                className="rounded-xl text-foreground"
                onClick={() => {
                  if (generatedImages[0]) {
                    void handleDownloadImage(generatedImages[0]);
                  }
                }}
                disabled={
                  generatedImages.length === 0 ||
                  downloadingImageId === generatedImages[0]?.id
                }
              >
                {downloadingImageId === generatedImages[0]?.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <Download className="size-4" />
                    {section.buttons.download}
                  </>
                )}
              </Button>
            </div>
          ) : null}
        </div>
      }
    />
  );
}
