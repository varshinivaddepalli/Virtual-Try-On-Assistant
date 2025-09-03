import React from 'react';
import { PhotoIcon, DownloadIcon } from './icons';

interface GeneratedImageDisplayProps {
    isLoading: boolean;
    generatedImage: string | null;
}

const loadingMessages = [
    "Warming up the AI stylist...",
    "Mixing digital paints...",
    "Tailoring your look...",
    "Applying accessories with precision...",
    "Adding the final touches...",
    "Rendering photorealistic details...",
];

const LoadingState: React.FC = () => {
    const [message, setMessage] = React.useState(loadingMessages[0]);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setMessage(prev => {
                const currentIndex = loadingMessages.indexOf(prev);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 border-4 border-neon-pink rounded-full animate-spin border-t-transparent mb-6 drop-shadow-[0_0_10px_rgba(255,0,255,1)]"></div>
            <h3 className="text-lg font-semibold text-white">Generating Your Style</h3>
            <p className="text-gray-400 mt-2 transition-opacity duration-500">{message}</p>
        </div>
    );
};

const Placeholder: React.FC = () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-center text-gray-500 p-8">
        <div className="w-24 h-24 text-gray-600">
            <PhotoIcon />
        </div>
        <h3 className="text-lg font-semibold mt-4 text-gray-300">Your Styled Image Will Appear Here</h3>
        <p className="mt-1 text-sm">Upload your photo and items, then click "Generate Style" to see the magic.</p>
    </div>
);


// FIX: Added GeneratedImageDisplayProps to React.FC to correctly type the component's props.
export const GeneratedImageDisplay: React.FC<GeneratedImageDisplayProps> = ({ isLoading, generatedImage }) => {
    return (
        <div className="flex items-center justify-center p-8 bg-dark-panel rounded-3xl shadow-neumo-convex min-h-[50vh] lg:min-h-full">
            <div className="w-full aspect-square max-w-full flex items-center justify-center">
                {isLoading ? (
                    <LoadingState />
                ) : generatedImage ? (
                    <div className="relative group w-full h-full">
                        <img 
                            src={generatedImage} 
                            alt="Generated style" 
                            className="w-full h-full object-contain rounded-lg"
                        />
                        <a
                            href={generatedImage}
                            download="styled-image.png"
                            className="absolute bottom-4 right-4 bg-neon-pink text-white p-3 rounded-full shadow-lg transition-all transform hover:scale-110 hover:shadow-pink-glow opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-panel focus:ring-pink-500"
                            aria-label="Download image"
                        >
                            <DownloadIcon />
                        </a>
                    </div>
                ) : (
                    <Placeholder />
                )}
            </div>
        </div>
    );
};
