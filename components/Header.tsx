import React from 'react';
import { CameraIcon } from './icons';

export const Header: React.FC = () => {
    return (
        <header className="sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                 <div className="p-3 bg-dark-panel rounded-xl shadow-neumo-convex">
                    <div className="text-neon-pink drop-shadow-[0_0_8px_rgba(255,0,255,0.9)]">
                        <CameraIcon />
                    </div>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                    Virtual Try On Assistant
                </h1>
            </div>
        </header>
    );
};