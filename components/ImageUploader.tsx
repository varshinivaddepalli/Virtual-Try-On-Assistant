import React, { useCallback, useRef } from 'react';
import type { UploadedImage } from '../types';
import { UploadIcon, XIcon } from './icons';

interface ImageUploaderProps {
    onImageUpload: (image: UploadedImage) => void;
    onImageRemove?: () => void;
    image?: UploadedImage | null;
    id: string;
    labelText: string;
    isMultiple?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
    onImageUpload, 
    onImageRemove, 
    image,
    id,
    labelText,
    isMultiple = false
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        Array.from(files).forEach(file => {
             if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const previewUrl = e.target?.result as string;
                    const newImage: UploadedImage = {
                        id: `${file.name}-${Date.now()}`,
                        file,
                        previewUrl,
                    };
                    onImageUpload(newImage);
                };
                reader.readAsDataURL(file);
            }
        });

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const handleDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const files = event.dataTransfer.files;
        if (files && files.length > 0) {
            const syntheticEvent = {
                target: { files }
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            handleFileChange(syntheticEvent);
        }
    }, [handleFileChange]);

    if (!isMultiple && image) {
        return (
            <div className="relative group aspect-square shadow-neumo-convex rounded-xl">
                <img src={image.previewUrl} alt="Uploaded preview" className="w-full h-full object-cover rounded-xl" />
                <button
                    onClick={onImageRemove}
                    className="absolute -top-2 -right-2 bg-neon-pink text-white rounded-full p-1 leading-none transition-all duration-300 transform hover:scale-110 hover:shadow-pink-glow active:scale-95 active:shadow-none opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-panel focus:ring-pink-500"
                    aria-label="Remove image"
                >
                    <XIcon />
                </button>
            </div>
        );
    }

    return (
        <label
            htmlFor={id}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="group flex flex-col items-center justify-center w-full h-full aspect-square bg-dark-bg/50 rounded-xl cursor-pointer shadow-neumo-concave hover:shadow-concave-glow-edge transition-all duration-300"
        >
            <div className="flex flex-col items-center justify-center text-center p-2 text-gray-400 transition-all duration-300 group-hover:text-neon-pink group-hover:drop-shadow-[0_0_5px_rgba(255,0,255,0.7)]">
                <UploadIcon />
                <p className="mt-2 text-sm">{labelText}</p>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP</p>
            </div>
            <input
                ref={inputRef}
                id={id}
                type="file"
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                multiple={isMultiple}
            />
        </label>
    );
};