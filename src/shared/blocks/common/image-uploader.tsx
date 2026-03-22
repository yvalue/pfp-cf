'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { IconRefresh, IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { RiImageAddLine } from 'react-icons/ri';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export type UploadStatus = 'idle' | 'uploading' | 'uploaded' | 'error';

export interface ImageUploaderValue {
  id: string;
  preview: string;
  url?: string;
  status: UploadStatus;
  size?: number;
}

type ImageUploaderVariant = 'default' | 'panel';

interface ImageUploaderProps {
  allowMultiple?: boolean;
  maxImages?: number;
  maxSizeMB?: number;
  variant?: ImageUploaderVariant;
  value?: ImageUploaderValue[];
  title?: string;
  titleHint?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyFooter?: string;
  emptyHint?: string;
  className?: string;
  emptyTileClassName?: string;
  itemTileClassName?: string;
  emptyMetaClassName?: string;
  defaultPreviews?: string[];
  onChange?: (items: ImageUploaderValue[]) => void;
}

interface UploadItem extends ImageUploaderValue {
  file?: File;
  uploadKey?: string;
}

const formatBytes = (bytes?: number) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(2)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
};

const mapDefaultPreviewsToItems = (defaultPreviews?: string[]): UploadItem[] =>
  (defaultPreviews || []).map((url, index) => ({
    id: `preset-${url}-${index}`,
    preview: url,
    url,
    status: 'uploaded' as UploadStatus,
  }));

const mapValueToItems = (value: ImageUploaderValue[]): UploadItem[] =>
  value.map((item) => ({
    ...item,
  }));

const areItemsEqual = (left: UploadItem[], right: UploadItem[]) =>
  left.length === right.length &&
  left.every((item, index) => {
    const nextItem = right[index];
    return (
      nextItem &&
      item.id === nextItem.id &&
      item.preview === nextItem.preview &&
      item.url === nextItem.url &&
      item.status === nextItem.status &&
      item.size === nextItem.size
    );
  });

const uploadImageFile = async (file: File) => {
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
};

export function ImageUploader({
  allowMultiple = false,
  maxImages = 1,
  maxSizeMB = 10,
  variant = 'default',
  value,
  title,
  titleHint,
  emptyTitle,
  emptyDescription,
  emptyFooter,
  emptyHint,
  className,
  emptyTileClassName,
  itemTileClassName,
  emptyMetaClassName,
  defaultPreviews,
  onChange,
}: ImageUploaderProps) {
  const t = useTranslations('common.uploader');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isInitializedRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const isInternalChangeRef = useRef(false);
  const isSyncingFromValueRef = useRef(false);
  const replaceTargetIdRef = useRef<string | null>(null);
  const dragCounterRef = useRef(0);
  const [isDragActive, setIsDragActive] = useState(false);
  const isControlled = value !== undefined;

  const [items, setItems] = useState<UploadItem[]>(() => {
    if (isControlled) {
      return mapValueToItems(value ?? []);
    }
    return mapDefaultPreviewsToItems(defaultPreviews);
  });

  const maxCount = allowMultiple ? maxImages : 1;
  const maxBytes = maxSizeMB * 1024 * 1024;

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (isControlled) {
      return;
    }

    if (!isInitializedRef.current) {
      return;
    }

    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }

    const defaultUrls = defaultPreviews || [];

    setItems((currentItems) => {
      const currentUrls = currentItems
        .filter((item) => item.status === 'uploaded' && item.url)
        .map((item) => item.url as string);

      const isSame =
        defaultUrls.length === currentUrls.length &&
        defaultUrls.every((url, index) => url === currentUrls[index]);

      if (!isSame) {
        return mapDefaultPreviewsToItems(defaultUrls);
      }

      return currentItems;
    });
  }, [defaultPreviews, isControlled]);

  useEffect(() => {
    if (!isControlled) {
      return;
    }

    const nextItems = mapValueToItems(value ?? []);
    setItems((currentItems) => {
      if (areItemsEqual(currentItems, nextItems)) {
        return currentItems;
      }

      isSyncingFromValueRef.current = true;
      return nextItems;
    });
  }, [isControlled, value]);

  useEffect(() => {
    return () => {
      items.forEach((item) => {
        if (item.preview.startsWith('blob:')) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, [items]);

  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      return;
    }

    if (isSyncingFromValueRef.current) {
      isSyncingFromValueRef.current = false;
      return;
    }

    isInternalChangeRef.current = true;

    onChangeRef.current?.(
      items.map(({ id, preview, url, status, size }) => ({
        id,
        preview,
        url,
        status,
        size,
      }))
    );
  }, [items]);

  const replaceItems = (pairs: Array<{ id: string; file: File }>) => {
    pairs.forEach(({ id, file }) => {
      const uploadKey = `${Date.now()}-${Math.random()}`;
      const nextPreview = URL.createObjectURL(file);

      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          if (item.preview.startsWith('blob:')) {
            URL.revokeObjectURL(item.preview);
          }
          return {
            ...item,
            preview: nextPreview,
            file,
            size: file.size,
            url: undefined,
            status: 'uploading' as UploadStatus,
            uploadKey,
          };
        })
      );

      uploadImageFile(file)
        .then((url) => {
          setItems((prev) =>
            prev.map((item) => {
              if (item.id !== id) return item;
              if (item.uploadKey !== uploadKey) return item; // stale upload
              if (item.preview.startsWith('blob:')) {
                URL.revokeObjectURL(item.preview);
              }
              return {
                ...item,
                preview: url,
                url,
                status: 'uploaded' as UploadStatus,
                file: undefined,
              };
            })
          );
        })
        .catch((error: any) => {
          console.error('Upload failed:', error);
          const message = error?.message as string | undefined;
          toast.error(
            message && !message.startsWith('Upload failed')
              ? t('upload_failed_with_message', { message })
              : t('upload_failed')
          );
          setItems((prev) =>
            prev.map((item) => {
              if (item.id !== id) return item;
              if (item.uploadKey !== uploadKey) return item; // stale upload
              return { ...item, status: 'error' as UploadStatus };
            })
          );
        })
        .finally(() => {
          if (inputRef.current) inputRef.current.value = '';
        });
    });
  };

  const handleFiles = (selectedFiles: File[]) => {
    const replaceTargetId = replaceTargetIdRef.current;
    if (replaceTargetId) {
      // reset immediately to avoid sticky replace mode
      replaceTargetIdRef.current = null;

      const file = selectedFiles[0];
      if (!file) return;
      if (!file.type?.startsWith('image/')) {
        toast.error(t('only_images_supported'));
        if (inputRef.current) inputRef.current.value = '';
        return;
      }
      if (file.size > maxBytes) {
        toast.error(t('size_exceeded', { name: file.name, maxSizeMB }));
        if (inputRef.current) inputRef.current.value = '';
        return;
      }
      replaceItems([{ id: replaceTargetId, file }]);
      return;
    }

    const availableSlots = maxCount - items.length;
    const filesToAdd = selectedFiles
      .filter((file) => {
        if (!file.type?.startsWith('image/')) {
          toast.error(t('not_image', { name: file.name }));
          return false;
        }
        if (file.size > maxBytes) {
          toast.error(t('size_exceeded', { name: file.name, maxSizeMB }));
          return false;
        }
        return true;
      })
      .slice(0, Math.max(availableSlots, 0));

    if (!filesToAdd.length) {
      // when full: replace from the end backwards
      if (items.length) {
        const normalized = selectedFiles.filter((file) =>
          file.type?.startsWith('image/')
        );
        if (!normalized.length) return;

        const k = Math.min(normalized.length, items.length);
        const tail = items.slice(-k);
        const pairs: Array<{ id: string; file: File }> = [];

        for (let i = 0; i < k; i += 1) {
          const targetId = tail[tail.length - 1 - i]?.id;
          const file = normalized[i];
          if (targetId && file) pairs.push({ id: targetId, file });
        }

        if (pairs.length) {
          replaceItems(pairs);
        }
      }

      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    if (availableSlots < selectedFiles.length) {
      toast.message(t('only_first_added', { count: filesToAdd.length }));
    }

    const newItems = filesToAdd.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      preview: URL.createObjectURL(file),
      file,
      size: file.size,
      status: 'uploading' as UploadStatus,
      uploadKey: `${Date.now()}-${Math.random()}`,
    }));

    setItems((prev) => [...prev, ...newItems]);

    // Upload in parallel
    Promise.all(
      newItems.map(async (item) => {
        try {
          const url = await uploadImageFile(item.file as File);
          setItems((prev) => {
            const next = prev.map((current) => {
              if (current.id === item.id) {
                if (current.uploadKey && item.uploadKey) {
                  if (current.uploadKey !== item.uploadKey) return current; // stale upload
                }
                // Revoke the blob URL since we have the uploaded URL now
                if (current.preview.startsWith('blob:')) {
                  URL.revokeObjectURL(current.preview);
                }
                return {
                  ...current,
                  preview: url, // Replace preview with uploaded URL
                  url,
                  status: 'uploaded' as UploadStatus,
                  file: undefined,
                };
              }
              return current;
            });
            return next;
          });
        } catch (error: any) {
          console.error('Upload failed:', error);
          const message = error?.message as string | undefined;
          toast.error(
            message && !message.startsWith('Upload failed')
              ? t('upload_failed_with_message', { message })
              : t('upload_failed')
          );
          setItems((prev) => {
            const next = prev.map((current) => {
              if (current.id !== item.id) return current;
              if (current.uploadKey && current.uploadKey !== item.uploadKey) {
                return current; // stale upload
              }
              return { ...current, status: 'error' as UploadStatus };
            });
            return next;
          });
        }
      })
    );

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;
    handleFiles(selectedFiles);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const clipboardItems = Array.from(event.clipboardData?.items || []);
    const files = clipboardItems
      .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
      .map((item) => item.getAsFile())
      .filter(Boolean) as File[];

    if (!files.length) return;
    event.preventDefault();
    handleFiles(files);
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current += 1;
    setIsDragActive(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
    if (!isDragActive) setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragActive(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragActive(false);

    const files = Array.from(event.dataTransfer?.files || []).filter((file) =>
      file.type?.startsWith('image/')
    );
    if (!files.length) return;
    handleFiles(files);
  };

  const handleRemove = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      const removed = prev.find((item) => item.id === id);
      if (removed?.preview.startsWith('blob:')) {
        URL.revokeObjectURL(removed.preview);
      }
      return next;
    });
  };

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const openReplacePicker = (id: string) => {
    replaceTargetIdRef.current = id;
    openFilePicker();
  };

  const countLabel = useMemo(
    () => `${items.length}/${maxCount}`,
    [items.length, maxCount]
  );
  const isPanelVariant = variant === 'panel';
  const showLargeEmptyState = isPanelVariant && items.length === 0;
  const panelThumbSizeClass = isPanelVariant ? 'h-18 w-18' : 'h-28 w-28';
  const panelOverlayButtonClass = isPanelVariant ? 'h-7 w-7' : 'h-10 w-10';
  const panelOverlayIconClass = isPanelVariant ? 'h-4 w-4' : 'h-5 w-5';
  const panelRemoveButtonClass = isPanelVariant
    ? 'top-1 right-1 h-5 w-5'
    : 'top-2 right-2 h-7 w-7';
  const panelRemoveIconClass = isPanelVariant ? 'h-3 w-3' : 'h-4 w-4';
  const panelTileRadiusClass = isPanelVariant ? 'rounded-lg' : 'rounded-xl';
  const panelInnerRadiusClass = isPanelVariant ? 'rounded-md' : 'rounded-lg';

  return (
    <div
      className={cn('focus:outline-none', className)}
      tabIndex={0}
      onPaste={handlePaste}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={allowMultiple}
        onChange={handleSelect}
        className="hidden"
      />

      {title && (
        <div className="text-foreground flex items-center justify-between text-sm font-medium">
          <div className="flex flex-wrap items-center gap-2">
            <span>{title}</span>
            <span className="text-primary text-xs">({countLabel})</span>
            {titleHint ? (
              <span
                className={cn(
                  'text-xs font-normal',
                  isPanelVariant
                    ? 'bg-primary/10 text-primary inline-flex items-center rounded-xl px-2 leading-5 font-medium'
                    : 'text-muted-foreground'
                )}
              >
                {titleHint}
              </span>
            ) : null}
          </div>
        </div>
      )}

      <div
        className={cn(
          'relative',
          isDragActive &&
            'ring-primary ring-offset-background ring-2 ring-offset-2',
          isPanelVariant &&
            'border-primary rounded-3xl border-2 border-dashed p-3',
          title && 'mt-3'
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragActive && (
          <div className="bg-background pointer-events-none absolute inset-0 z-30 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-background text-foreground rounded-full px-4 py-2 text-sm font-medium shadow-sm">
              {t('drop_overlay')}
            </div>
          </div>
        )}
        <div
          className={cn(
            'gap-2',
            showLargeEmptyState ? 'block' : 'flex',
            !showLargeEmptyState &&
              (allowMultiple
                ? 'flex-wrap content-start items-start'
                : 'flex-nowrap items-start'),
            isPanelVariant && 'min-h-[160px]'
          )}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                'group border-border bg-muted hover:border-border hover:bg-muted relative overflow-hidden border shadow-sm transition',
                itemTileClassName,
                panelTileRadiusClass
              )}
            >
              <div
                className={cn(
                  'relative overflow-hidden',
                  panelInnerRadiusClass
                )}
              >
                <img
                  src={item.preview}
                  alt={t('reference_alt')}
                  className={cn(
                    panelThumbSizeClass,
                    panelInnerRadiusClass,
                    'object-cover'
                  )}
                />
                {item.size && (
                  <span className="bg-background text-muted-foreground absolute bottom-2 left-2 rounded-md px-2 py-1 text-xs font-medium">
                    {formatBytes(item.size)}
                  </span>
                )}
                {item.status !== 'uploading' && (
                  <div className="bg-foreground absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className={cn(
                        'bg-background text-foreground hover:bg-background focus-visible:ring-ring rounded-full shadow-sm backdrop-blur focus-visible:ring-2',
                        panelOverlayButtonClass
                      )}
                      onClick={() => openReplacePicker(item.id)}
                      aria-label={t('replace_image')}
                    >
                      <IconRefresh className={panelOverlayIconClass} />
                    </Button>
                  </div>
                )}
                {item.status === 'uploading' && (
                  <div className="bg-foreground/60 text-background absolute inset-0 z-10 flex items-center justify-center text-xs font-medium">
                    {t('uploading')}
                  </div>
                )}
                {item.status === 'error' && (
                  <div className="bg-destructive text-destructive-foreground absolute inset-0 z-10 flex items-center justify-center text-xs font-medium">
                    {t('failed')}
                  </div>
                )}
                <Button
                  size="icon"
                  variant="destructive"
                  className={cn('absolute z-20', panelRemoveButtonClass)}
                  onClick={() => handleRemove(item.id)}
                  aria-label={t('remove_image')}
                >
                  <IconX className={panelRemoveIconClass} />
                </Button>
              </div>
            </div>
          ))}

          {items.length < maxCount &&
            (showLargeEmptyState ? (
              <div className={cn('h-full', emptyTileClassName)}>
                <button
                  type="button"
                  onClick={openFilePicker}
                  className="flex min-h-[160px] w-full flex-col items-center justify-center gap-3 text-center"
                >
                  <RiImageAddLine className="text-foreground/28 text-primary size-12" />
                  <div className="text-foreground text-xl leading-5 font-medium">
                    {emptyTitle || t('empty_title')}
                  </div>
                  {emptyDescription ? (
                    <div
                      className={cn(
                        'text-muted-foreground max-w-xl text-sm leading-5',
                        emptyMetaClassName
                      )}
                    >
                      {emptyDescription}
                    </div>
                  ) : null}
                  {emptyFooter ? (
                    <div
                      className={cn(
                        'text-muted-foreground max-w-xl text-sm leading-5',
                        emptyMetaClassName
                      )}
                    >
                      {emptyFooter}
                    </div>
                  ) : null}
                  {!emptyDescription && !emptyFooter ? (
                    <div
                      className={cn(
                        'text-muted-foreground max-w-2xl text-sm leading-7 sm:text-base',
                        emptyMetaClassName
                      )}
                    >
                      {emptyHint || t('max_size', { maxSizeMB })}
                    </div>
                  ) : null}
                </button>
              </div>
            ) : (
              <div
                className={cn(
                  'group border-border bg-muted hover:border-border hover:bg-muted relative overflow-hidden rounded-xl border border-dashed shadow-sm transition',
                  emptyTileClassName,
                  isPanelVariant && 'rounded-lg'
                )}
              >
                <div className="relative overflow-hidden rounded-lg">
                  <button
                    type="button"
                    className={cn(
                      'flex flex-col items-center justify-center gap-2',
                      panelThumbSizeClass
                    )}
                    onClick={openFilePicker}
                  >
                    <RiImageAddLine className="h-8 w-8 text-gray-400" />
                    <span
                      className={cn('text-primary text-xs', emptyMetaClassName)}
                    >
                      {t('max_size', { maxSizeMB })}
                    </span>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {!title && (
        <div className="text-muted-foreground text-xs">{emptyHint}</div>
      )}
    </div>
  );
}
