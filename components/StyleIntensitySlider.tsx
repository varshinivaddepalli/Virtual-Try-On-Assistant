import React from 'react';

interface StyleIntensitySliderProps {
    intensity: number;
    setIntensity: (value: number) => void;
}

export const StyleIntensitySlider: React.FC<StyleIntensitySliderProps> = ({ intensity, setIntensity }) => {
    return (
        <div>
            <label htmlFor="intensity-slider" className="block text-md font-semibold mb-3 text-gray-200">
                Style Intensity: <span className="font-bold text-white">{intensity}</span>
            </label>
            <div className="relative flex items-center">
                <input
                    id="intensity-slider"
                    type="range"
                    min="0"
                    max="100"
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer slider-track"
                    aria-label="Style intensity"
                />
            </div>
             <p className="text-xs text-gray-400 mt-2">Controls the creative freedom of the AI. Lower values are more photorealistic.</p>
        </div>
    );
};
