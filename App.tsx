import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { GeneratedImageDisplay } from './components/GeneratedImageDisplay';
import { UploadedImage } from './types';
import { editImageWithGemini } from './services/geminiService';
import { SparklesIcon, XIcon } from './components/icons';
import { StyleIntensitySlider } from './components/StyleIntensitySlider';

const App: React.FC = () => {
    const [baseImage, setBaseImage] = useState<UploadedImage | null>(null);
    const [itemImages, setItemImages] = useState<UploadedImage[]>([]);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [intensity, setIntensity] = useState<number>(25);

    const handleBaseImageUpload = (image: UploadedImage) => {
        setBaseImage(image);
    };

    const handleBaseImageRemove = () => {
        setBaseImage(null);
    };

    const handleItemImageUpload = (image: UploadedImage) => {
        setItemImages(prev => [...prev, image]);
    };

    const handleItemImageRemove = (id: string) => {
        setItemImages(prev => prev.filter(image => image.id !== id));
    };
    
    const getBase64FromDataUrl = (dataUrl: string): string => {
        return dataUrl.split(',')[1];
    };

    const handleGenerate = useCallback(async () => {
        if (!baseImage || itemImages.length === 0) {
            setError('Please upload a base image and at least one item image.');
            return;
        }

        setError(null);
        setIsLoading(true);
        setGeneratedImage(null);

        try {
            const baseImage64 = getBase64FromDataUrl(baseImage.previewUrl);
            const itemImages64 = itemImages.map(img => getBase64FromDataUrl(img.previewUrl));
            
            const getPrompt = (intensity: number): string => {
                let realismLevel = '';
                if (intensity <= 30) {
                    realismLevel = "You MUST NOT change the person's face, hair, body shape, skin tone, or expression in any way. The original person must be perfectly recognizable and unchanged. Adhere strictly to photorealism. The final output MUST look like a real, unedited photograph.";
                } else if (intensity <= 70) {
                    realismLevel = "Prioritize realism. Keep the person's core facial features, body shape, and skin tone. Minor, natural adjustments to hair or posture to accommodate the items are acceptable if they enhance realism (e.g., hair being slightly compressed by a hat). The result should be highly photorealistic.";
                } else {
                    realismLevel = "A more creative interpretation is allowed. You can make stylistic adjustments to the hair, background, or lighting to better match the new items, but the person's core identity and facial features MUST be preserved. The result should be artistic yet believable.";
                }
        
                return `**Critically important instruction: Your task is to realistically apply the provided accessory/clothing items onto the person in the base photo. ${realismLevel}**

                The overall goal is to produce a single, seamless, high-quality image where the added items look like they were part of the original photo.

                - **Analyze and Preserve:** Identify the person's unique features from the base image. These are non-negotiable and must be preserved.
                - **Composite Items:** Place each item from the subsequent images onto the person naturally and accurately.
                - **Integration:** Masterfully blend lighting, shadows, and textures of the items to match the base photo's environment.
                
                The final output must be only the generated image. Do not include any text or commentary.`;
            };

            const prompt = getPrompt(intensity);

            const resultImage = await editImageWithGemini(baseImage64, itemImages64, prompt, baseImage.file.type);
            setGeneratedImage(resultImage);

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [baseImage, itemImages, intensity]);

    const canGenerate = baseImage !== null && itemImages.length > 0 && !isLoading;

    return (
        <div className="min-h-screen bg-dark-bg text-gray-100 font-sans">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Input Section */}
                    <div className="flex flex-col gap-8 p-8 bg-dark-panel rounded-3xl shadow-neumo-convex">
                        <div>
                            <h2 className="text-xl font-bold mb-4 text-neon-pink drop-shadow-[0_0_5px_rgba(255,0,255,0.7)]">1. Upload Your Photo</h2>
                            <ImageUploader
                                onImageUpload={handleBaseImageUpload}
                                onImageRemove={handleBaseImageRemove}
                                image={baseImage}
                                id="base-uploader"
                                labelText="Upload your base photo"
                            />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold mb-4 text-neon-pink drop-shadow-[0_0_5px_rgba(255,0,255,0.7)]">2. Upload Items to Try On</h2>
                             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {itemImages.map(img => (
                                    <div key={img.id} className="relative aspect-square shadow-neumo-convex rounded-xl">
                                        <img src={img.previewUrl} alt="Item to try on" className="w-full h-full object-cover rounded-xl"/>
                                        <button 
                                            onClick={() => handleItemImageRemove(img.id)}
                                            className="absolute -top-2 -right-2 bg-neon-pink text-white rounded-full p-1 leading-none hover:shadow-pink-glow transition-all duration-300 transform hover:scale-110 active:scale-95 active:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-panel focus:ring-pink-500"
                                            aria-label="Remove item"
                                        >
                                           <XIcon />
                                        </button>
                                    </div>
                                ))}
                                <ImageUploader
                                    onImageUpload={handleItemImageUpload}
                                    id="item-uploader"
                                    isMultiple={true}
                                    labelText="Add item"
                                />
                            </div>
                        </div>

                         <div>
                            <h2 className="text-xl font-bold mb-4 text-neon-pink drop-shadow-[0_0_5px_rgba(255,0,255,0.7)]">3. Set Style Intensity</h2>
                            <StyleIntensitySlider intensity={intensity} setIntensity={setIntensity} />
                        </div>

                        <div className="mt-auto pt-6">
                            <button
                                onClick={handleGenerate}
                                disabled={!canGenerate}
                                className={`w-full text-lg font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-neon-pink/50
                                ${canGenerate 
                                    ? 'bg-neon-pink text-white shadow-lg transform hover:-translate-y-1 hover:shadow-pink-glow active:translate-y-0 active:shadow-neumo-concave' 
                                    : 'bg-gray-600/50 text-gray-400 cursor-not-allowed shadow-neumo-concave'}`}
                            >
                                <SparklesIcon />
                                {isLoading ? 'Styling Your Image...' : 'Generate Style'}
                            </button>
                            {error && <p className="text-red-400 text-center mt-4">{error}</p>}
                        </div>
                    </div>

                    {/* Output Section */}
                    <GeneratedImageDisplay 
                        isLoading={isLoading} 
                        generatedImage={generatedImage} 
                    />
                </div>
            </main>
        </div>
    );
};

export default App;