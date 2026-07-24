'use client';

// =============================================================================
// Screenshot Uploader — Drag-and-drop image upload with preview
// =============================================================================

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ScreenshotUploaderProps {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
}

export default function ScreenshotUploader({
  label,
  value,
  onChange,
}: ScreenshotUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/screenshots', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      const { url } = await res.json();
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 1,
    disabled: uploading,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--muted-fg)] mb-1.5">
        {label}
      </label>

      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative group rounded-xl overflow-hidden border border-[var(--border)]"
          >
            <img
              src={value}
              alt={label}
              className="w-full h-32 object-cover"
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center
                         text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X size={14} />
            </button>
          </motion.div>
        ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              {...(getRootProps() as any)}
              className={`flex flex-col items-center justify-center py-8 px-4 rounded-xl border-2 border-dashed
                        transition-all duration-200 cursor-pointer
                        ${isDragActive
                          ? 'border-[var(--accent-blue)] bg-[var(--accent-blue-dim)]'
                          : 'border-[var(--border)] hover:border-[var(--accent-blue)] hover:bg-[var(--accent-blue-dim)]'
                        }`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <Loader2 size={24} className="animate-spin text-[var(--accent-blue)] mb-2" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-blue-dim)] flex items-center justify-center mb-2">
                {isDragActive ? (
                  <Upload size={18} className="text-[var(--accent-blue)]" />
                ) : (
                  <ImageIcon size={18} className="text-[var(--accent-blue)]" />
                )}
              </div>
            )}
            <p className="text-xs text-[var(--muted-fg)] text-center">
              {uploading
                ? 'Uploading...'
                : isDragActive
                  ? 'Drop image here'
                  : 'Drag & drop or click to upload'}
            </p>
            {error && (
              <p className="text-xs text-red-400 mt-2">{error}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
