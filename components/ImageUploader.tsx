
import React, { useState, useCallback, DragEvent, ChangeEvent } from 'react';

interface ImageUploaderProps {
    onImageUpload: (file: File) => void;
    uploadedImage: File | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, uploadedImage }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileValidation = (file: File): boolean => {
        const validTypes = ['image/jpeg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            setError('Invalid file type. Please upload a JPG or PNG file.');
            return false;
        }
        setError(null);
        return true;
    };

    const handleFileChange = useCallback((file: File | null) => {
        if (file && handleFileValidation(file)) {
            onImageUpload(file);
        }
    }, [onImageUpload]);

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileChange(e.target.files[0]);
        }
    };

    return (
        <div className="flex-grow flex flex-col">
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`relative flex-grow flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg transition-colors duration-300 ${
                    isDragging ? 'border-indigo-500 bg-indigo-900/30' : 'border-gray-600'
                }`}
            >
                {uploadedImage ? (
                    <div className="w-full h-full max-h-80">
                        <img
                            src={URL.createObjectURL(uploadedImage)}
                            alt="Uploaded preview"
                            className="w-full h-full object-contain rounded-md"
                        />
                    </div>
                ) : (
                    <div className="text-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <p className="mt-2">Drag & drop an image here</p>
                        <p className="text-sm">or</p>
                    </div>
                )}
                 <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept="image/jpeg,image/png"
                    onChange={onInputChange}
                />
                <label htmlFor="file-upload" className="mt-4 cursor-pointer bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">
                    {uploadedImage ? 'Change Image' : 'Select Image'}
                </label>
            </div>
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </div>
    );
};

export default ImageUploader;
