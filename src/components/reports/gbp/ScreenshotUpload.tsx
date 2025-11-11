import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface ScreenshotUploadProps {
  label: string;
  icon: string;
  value: string | null;
  onChange: (file: File | null, previewUrl: string | null) => void;
  required?: boolean;
}

export function ScreenshotUpload({
  label,
  icon,
  value,
  onChange,
  required = false,
}: ScreenshotUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    return await imageCompression(file, options);
  };

  const handleFile = async (file: File) => {
    setIsCompressing(true);
    try {
      // Compresser l'image
      const compressedFile = await compressImage(file);

      // Créer une URL de prévisualisation
      const previewUrl = URL.createObjectURL(compressedFile);

      // Convertir en base64 pour le stockage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onChange(compressedFile, base64String);
        setIsCompressing(false);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Error processing image:', error);
      setIsCompressing(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleFile(file);
      }
    },
    [onChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    if (value) {
      URL.revokeObjectURL(value);
    }
    onChange(null, null);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Label className="flex items-center gap-2 mb-4">
          <span className="text-xl">{icon}</span>
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>

        {value ? (
          <div className="relative">
            <img
              src={value}
              alt={label}
              className="w-full h-48 object-contain border rounded-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors
              ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'}
              ${isCompressing ? 'opacity-50' : ''}
            `}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              id={`screenshot-${label}`}
              disabled={isCompressing}
            />
            <label
              htmlFor={`screenshot-${label}`}
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              {isCompressing ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Cliquez pour uploader ou glissez-déposez
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG (max 1MB)
                    </p>
                  </div>
                </>
              )}
            </label>
          </div>
        )}
      </CardContent>
    </Card>
  );
}



