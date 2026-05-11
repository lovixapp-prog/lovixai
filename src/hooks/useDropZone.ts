import { useState, useCallback, DragEvent } from "react";

interface UseDropZoneOptions {
  onDrop: (file: File) => void;
  accept?: string[];
  maxSize?: number;
  onError?: (message: string) => void;
}

export const useDropZone = ({ onDrop, accept, maxSize, onError }: UseDropZoneOptions) => {
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = useCallback((file: File): boolean => {
    // Validate file type
    if (accept && accept.length > 0) {
      const fileType = file.type;
      const isValid = accept.some(type => {
        if (type.endsWith("/*")) {
          const category = type.replace("/*", "");
          return fileType.startsWith(category);
        }
        return fileType === type || file.name.toLowerCase().endsWith(type.replace(".", ""));
      });
      
      if (!isValid) {
        onError?.(`Invalid file type. Accepted: ${accept.join(", ")}`);
        return false;
      }
    }

    // Validate file size
    if (maxSize && file.size > maxSize) {
      const sizeMB = Math.round(maxSize / (1024 * 1024));
      onError?.(`File too large. Maximum size: ${sizeMB}MB`);
      return false;
    }

    return true;
  }, [accept, maxSize, onError]);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onDrop(file);
      }
    }
  }, [onDrop, validateFile]);

  return {
    isDragging,
    dragProps: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  };
};
