
import React from 'react';

interface ImageViewerProps {
    imageUrl: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ imageUrl }) => {
    return (
        <div className="w-full max-w-lg aspect-square bg-gray-900 rounded-lg overflow-hidden shadow-lg">
            <img
                src={imageUrl}
                alt="Generated result"
                className="w-full h-full object-contain"
            />
        </div>
    );
};

export default ImageViewer;
