import React, { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import ImageViewer from './components/ImageViewer';
import Spinner from './components/Spinner';
import { generateImageFromImage, removeImageBackground } from './services/geminiService';
import { StyleOption, styleOptions } from './constants';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error('Failed to convert file to base64'));
            }
        };
        reader.onerror = (error) => reject(error);
    });
};

const base64ToFile = async (base64: string, filename: string): Promise<File> => {
    const res = await fetch(`data:image/png;base64,${base64}`);
    const blob = await res.blob();
    return new File([blob], filename, { type: 'image/png' });
};


const App: React.FC = () => {
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRemovingBackground, setIsRemovingBackground] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedStyle, setSelectedStyle] = useState<string>('');
    const [referenceInfluence, setReferenceInfluence] = useState<number>(75);
    const [characterDescription, setCharacterDescription] = useState<string>('');
    const [sceneDescription, setSceneDescription] = useState<string>('');
    const [outputQuality, setOutputQuality] = useState<string>('standard');


    const handleImageUpload = useCallback((file: File) => {
        setUploadedImage(file);
        setGeneratedImage(null);
        setError(null);
    }, []);

    const handleRemoveBackgroundClick = async () => {
        if (!uploadedImage) {
            setError('Please upload an image first.');
            return;
        }

        setIsRemovingBackground(true);
        setError(null);
        
        try {
            const base64ImageData = await fileToBase64(uploadedImage);
            const mimeType = uploadedImage.type;

            const processedData = await removeImageBackground(base64ImageData, mimeType);
            const newImageFile = await base64ToFile(processedData, `bg_removed_${uploadedImage.name}`);
            setUploadedImage(newImageFile);

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred during background removal.');
        } finally {
            setIsRemovingBackground(false);
        }
    };

    const handleGenerateClick = async () => {
        if (!uploadedImage || !selectedStyle) {
            setError('Please upload an image and select a style.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const base64ImageData = await fileToBase64(uploadedImage);
            const mimeType = uploadedImage.type;
            const style = styleOptions.find(opt => opt.id === selectedStyle);

            if (!style) {
              throw new Error('Invalid style selected.');
            }

            const generatedData = await generateImageFromImage(base64ImageData, mimeType, style.prompt, referenceInfluence, characterDescription, sceneDescription, outputQuality);
            setGeneratedImage(`data:image/png;base64,${generatedData}`);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred during image generation.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
            <header className="py-6 text-center shadow-lg bg-gray-800/50 backdrop-blur-sm">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
                    AI Image Style Transformer
                </h1>
                <p className="text-gray-400 mt-1">Powered by Gemini</p>
            </header>

            <main className="flex-grow container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                    {/* Left Column: Input */}
                    <div className="bg-gray-800/60 rounded-xl p-6 flex flex-col shadow-2xl backdrop-blur-lg border border-gray-700">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-200">1. Upload Your Image</h2>
                        <ImageUploader onImageUpload={handleImageUpload} uploadedImage={uploadedImage} />
                        
                        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-200">2. Choose a Style</h2>
                        <div className="relative">
                            <select
                                value={selectedStyle}
                                onChange={(e) => setSelectedStyle(e.target.value)}
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                                aria-label="Select image generation style"
                            >
                                <option value="" disabled>Select a style...</option>
                                {styleOptions.map((option: StyleOption) => (
                                    <option key={option.id} value={option.id}>{option.name}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>

                        <div className="mt-8 mb-4">
                            <label htmlFor="influence-slider" className="block text-lg font-semibold text-gray-200 mb-2">
                                Reference Influence: <span className="font-bold text-indigo-400">{referenceInfluence}%</span>
                            </label>
                            <input
                                id="influence-slider"
                                type="range"
                                min="0"
                                max="100"
                                value={referenceInfluence}
                                onChange={(e) => setReferenceInfluence(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                aria-label="Reference influence slider"
                            />
                        </div>

                        <div className="mt-6">
                            <label htmlFor="character-description" className="block text-lg font-semibold text-gray-200 mb-2">
                                Description for Character
                            </label>
                            <textarea
                                id="character-description"
                                value={characterDescription}
                                onChange={(e) => setCharacterDescription(e.target.value)}
                                rows={2}
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white resize-y"
                                placeholder="e.g., a young red-haired warrior..."
                                aria-label="Character description"
                            />
                        </div>

                        <div className="mt-6">
                            <label htmlFor="scene-description" className="block text-lg font-semibold text-gray-200 mb-2">
                                Scene & Action
                            </label>
                            <textarea
                                id="scene-description"
                                value={sceneDescription}
                                onChange={(e) => setSceneDescription(e.target.value)}
                                rows={2}
                                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white resize-y"
                                placeholder="e.g., standing in a forest, fighting a dragon..."
                                aria-label="Scene and action description"
                            />
                        </div>
                        
                        <div className="mt-6">
                            <label htmlFor="output-quality" className="block text-lg font-semibold text-gray-200 mb-2">
                                Output Quality
                            </label>
                            <div className="relative">
                                <select
                                    id="output-quality"
                                    value={outputQuality}
                                    onChange={(e) => setOutputQuality(e.target.value)}
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                                    aria-label="Select output quality"
                                >
                                    <option value="standard">Standard (720p)</option>
                                    <option value="high">High (2K–4K)</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                        </div>


                        <div className="mt-auto pt-8 space-y-4">
                             <button
                                onClick={handleRemoveBackgroundClick}
                                disabled={!uploadedImage || isLoading || isRemovingBackground}
                                className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-all duration-300 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isRemovingBackground ? (
                                    <>
                                        <Spinner />
                                        <span className="ml-2">Removing Background...</span>
                                    </>
                                ) : (
                                    'Background Removal'
                                )}
                            </button>
                            <button
                                onClick={handleGenerateClick}
                                disabled={!uploadedImage || !selectedStyle || isLoading || isRemovingBackground}
                                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner />
                                        <span className="ml-2">Generating...</span>
                                    </>
                                ) : (
                                    'Generate Image'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Output */}
                    <div className="bg-gray-800/60 rounded-xl p-6 flex flex-col items-center justify-center shadow-2xl backdrop-blur-lg border border-gray-700 min-h-[300px] md:min-h-0">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-200 self-start">Result</h2>
                        <div className="w-full h-full flex items-center justify-center">
                          {isLoading || isRemovingBackground ? (
                              <div className="flex flex-col items-center text-gray-400">
                                  <Spinner size="large" />
                                  <p className="mt-4 text-lg">{isLoading ? 'Generating your masterpiece...' : 'Removing background...'}</p>
                              </div>
                          ) : error ? (
                              <div className="text-center text-red-400 bg-red-900/30 p-4 rounded-lg">
                                  <p className="font-bold">Error</p>
                                  <p>{error}</p>
                              </div>
                          ) : generatedImage ? (
                              <ImageViewer imageUrl={generatedImage} />
                          ) : (
                              <div className="text-center text-gray-500">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                  <p className="mt-2">Generated image will appear here</p>
                              </div>
                          )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;