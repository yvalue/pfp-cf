export type ImageGenerationMode = 'text-to-image' | 'image-to-image';
export type NanoBananaResolution = '1K' | '2K' | '4K';

export interface NanoBananaModelFamily {
  id: string;
  label: string;
  provider: 'kie';
  textToImageModel: string;
  imageToImageModel: string;
  aspectRatios: string[];
  defaultAspectRatio: string;
  supportedResolutions: NanoBananaResolution[];
  defaultResolution: NanoBananaResolution;
  maxBatchCount: number;
  maxReferenceImages: number;
  maxReferenceImageSizeMB: number;
  creditCostByResolution: Record<NanoBananaResolution, number>;
  supportsResolutionParam: boolean;
}

const NANO_BANANA_ASPECT_RATIOS = [
  '1:1',
  '9:16',
  '16:9',
  '3:4',
  '4:3',
  '3:2',
  '2:3',
  '5:4',
  '4:5',
  '21:9',
  'auto',
] as const;

const NANO_BANANA_PRO_ASPECT_RATIOS = [
  '1:1',
  '2:3',
  '3:2',
  '3:4',
  '4:3',
  '4:5',
  '5:4',
  '9:16',
  '16:9',
  '21:9',
  'auto',
] as const;

const NANO_BANANA_2_ASPECT_RATIOS = [
  '1:1',
  '1:4',
  '1:8',
  '2:3',
  '3:2',
  '3:4',
  '4:1',
  '4:3',
  '4:5',
  '5:4',
  '8:1',
  '9:16',
  '16:9',
  '21:9',
  'auto',
] as const;

const NANO_BANANA_BASE_RESOLUTIONS = ['1K'] as const;
const NANO_BANANA_ADVANCED_RESOLUTIONS = ['1K', '2K', '4K'] as const;

export const NANO_BANANA_MODEL_FAMILIES: NanoBananaModelFamily[] = [
  {
    id: 'nano-banana',
    label: 'Nano Banana',
    provider: 'kie',
    textToImageModel: 'google/nano-banana',
    imageToImageModel: 'google/nano-banana-edit',
    aspectRatios: [...NANO_BANANA_ASPECT_RATIOS],
    defaultAspectRatio: '1:1',
    supportedResolutions: [...NANO_BANANA_BASE_RESOLUTIONS],
    defaultResolution: '1K',
    maxBatchCount: 4,
    maxReferenceImages: 10,
    maxReferenceImageSizeMB: 10,
    creditCostByResolution: {
      '1K': 4,
      '2K': 4,
      '4K': 4,
    },
    supportsResolutionParam: false,
  },
  {
    id: 'nano-banana-pro',
    label: 'Nano Banana Pro',
    provider: 'kie',
    textToImageModel: 'nano-banana-pro',
    imageToImageModel: 'nano-banana-pro',
    aspectRatios: [...NANO_BANANA_PRO_ASPECT_RATIOS],
    defaultAspectRatio: '1:1',
    supportedResolutions: [...NANO_BANANA_ADVANCED_RESOLUTIONS],
    defaultResolution: '1K',
    maxBatchCount: 4,
    maxReferenceImages: 8,
    maxReferenceImageSizeMB: 30,
    creditCostByResolution: {
      '1K': 10,
      '2K': 15,
      '4K': 20,
    },
    supportsResolutionParam: true,
  },
  {
    id: 'nano-banana-2',
    label: 'Nano Banana 2',
    provider: 'kie',
    textToImageModel: 'nano-banana-2',
    imageToImageModel: 'nano-banana-2',
    aspectRatios: [...NANO_BANANA_2_ASPECT_RATIOS],
    defaultAspectRatio: 'auto',
    supportedResolutions: [...NANO_BANANA_ADVANCED_RESOLUTIONS],
    defaultResolution: '1K',
    maxBatchCount: 4,
    maxReferenceImages: 14,
    maxReferenceImageSizeMB: 30,
    creditCostByResolution: {
      '1K': 5,
      '2K': 10,
      '4K': 15,
    },
    supportsResolutionParam: true,
  },
];

const MODEL_ID_TO_FAMILY_ID: Record<string, string> = {
  'nano-banana': 'nano-banana',
  'google/nano-banana': 'nano-banana',
  'google/nano-banana-edit': 'nano-banana',
  'nano-banana-pro': 'nano-banana-pro',
  'nano-banana-2': 'nano-banana-2',
};

export function getNanoBananaModelFamily(familyId?: string) {
  return NANO_BANANA_MODEL_FAMILIES.find((item) => item.id === familyId);
}

export function getNanoBananaModelFamilyFromValue(value?: string) {
  if (!value) {
    return undefined;
  }

  const familyId = MODEL_ID_TO_FAMILY_ID[value] ?? value;
  return getNanoBananaModelFamily(familyId);
}

export function getNanoBananaResolution(
  familyId: string,
  resolution?: string
): NanoBananaResolution {
  const family = getNanoBananaModelFamily(familyId);

  if (!family) {
    return '1K';
  }

  if (
    resolution &&
    family.supportedResolutions.includes(resolution as NanoBananaResolution)
  ) {
    return resolution as NanoBananaResolution;
  }

  return family.defaultResolution;
}

export function getNanoBananaCreditCost({
  familyId,
  resolution,
}: {
  familyId: string;
  resolution?: string;
}) {
  const family = getNanoBananaModelFamily(familyId);

  if (!family) {
    return 0;
  }

  const normalizedResolution = getNanoBananaResolution(familyId, resolution);
  return family.creditCostByResolution[normalizedResolution];
}

export function getNanoBananaMaxBatchCount(familyId: string) {
  return getNanoBananaModelFamily(familyId)?.maxBatchCount ?? 1;
}

export function getNanoBananaMaxReferenceImages(familyId: string) {
  return getNanoBananaModelFamily(familyId)?.maxReferenceImages ?? 1;
}

export function getNanoBananaMaxReferenceImageSizeMB(familyId: string) {
  return getNanoBananaModelFamily(familyId)?.maxReferenceImageSizeMB ?? 10;
}

export function getNanoBananaReferenceImageFormatsLabel() {
  return 'PNG, JPG, JPEG or WEBP';
}

export function shouldSendNanoBananaResolution(familyId: string) {
  return Boolean(getNanoBananaModelFamily(familyId)?.supportsResolutionParam);
}

export function resolveNanoBananaModel({
  familyId,
  mode,
}: {
  familyId: string;
  mode: ImageGenerationMode;
}) {
  const family = getNanoBananaModelFamily(familyId);

  if (!family) {
    return null;
  }

  return mode === 'image-to-image'
    ? family.imageToImageModel
    : family.textToImageModel;
}

export function resolveNanoBananaGeneration({
  familyId,
  mode,
  resolution,
}: {
  familyId: string;
  mode: ImageGenerationMode;
  resolution?: string;
}) {
  const family = getNanoBananaModelFamily(familyId);

  if (!family) {
    return null;
  }

  const normalizedResolution = getNanoBananaResolution(familyId, resolution);

  return {
    family,
    model: resolveNanoBananaModel({ familyId, mode }),
    resolution: normalizedResolution,
    costCredits: family.creditCostByResolution[normalizedResolution],
    shouldSendResolution: family.supportsResolutionParam,
  };
}

export function extractImageUrls(data: any): string[] {
  if (!data) {
    return [];
  }

  const output = data.output ?? data.images ?? data.data ?? data.resultUrls;

  if (!output) {
    return [];
  }

  if (typeof output === 'string') {
    return [output];
  }

  if (Array.isArray(output)) {
    return output
      .flatMap((item) => {
        if (!item) {
          return [];
        }

        if (typeof item === 'string') {
          return [item];
        }

        if (typeof item === 'object') {
          const candidate =
            item.url ?? item.uri ?? item.image ?? item.src ?? item.imageUrl;
          return typeof candidate === 'string' ? [candidate] : [];
        }

        return [];
      })
      .filter(Boolean);
  }

  if (typeof output === 'object') {
    const candidate =
      output.url ?? output.uri ?? output.image ?? output.src ?? output.imageUrl;
    if (typeof candidate === 'string') {
      return [candidate];
    }
  }

  return [];
}
