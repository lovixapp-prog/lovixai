import { useState, useCallback, DragEvent, ReactNode } from "react";
import { Upload } from "lucide-react";

interface DropZoneProps {
  children: ReactNode;
  onDrop: (file: File) => void;
  accept?: string[];
  maxSize?: number;
  onError?: (message: string) => void;
  className?: string;
  activeClassName?: string;
  dropMessage?: string;
}

const DropZone = ({
  children,
  onDrop,
  accept,
  maxSize,
  onError,
  className = "",
  activeClassName = "border-primary border-2 bg-primary/5",
  dropMessage = "Drop file here",
}: DropZoneProps) => {
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
        if (type.startsWith(".")) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return fileType === type;
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

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative transition-all ${className} ${isDragging ? activeClassName : ""}`}
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary/10 backdrop-blur-sm rounded-2xl">
          <div className="text-center">
            <Upload className="w-10 h-10 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-primary">{dropMessage}</p>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default DropZone;