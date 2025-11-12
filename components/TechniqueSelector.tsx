
import React from 'react';
import type { BreathingTechnique } from '../types';

interface TechniqueSelectorProps {
    techniques: BreathingTechnique[];
    selectedTechnique: BreathingTechnique;
    onSelectTechnique: (technique: BreathingTechnique) => void;
}

const TechniqueSelector: React.FC<TechniqueSelectorProps> = ({ techniques, selectedTechnique, onSelectTechnique }) => {
    return (
        <div className="mb-8">
            <h3 className="text-lg font-semibold text-center mb-4 text-slate-600">Choose Your Technique</h3>
            <div className="space-y-3">
                {techniques.map((tech) => (
                    <button
                        key={tech.id}
                        onClick={() => onSelectTechnique(tech)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                            selectedTechnique.id === tech.id
                                ? 'bg-blue-100 border-blue-400 shadow-inner'
                                : 'bg-white/50 border-transparent hover:border-blue-300 hover:bg-white'
                        }`}
                    >
                        <p className="font-semibold text-slate-800">{tech.name}</p>
                        <p className="text-sm text-slate-500">{tech.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TechniqueSelector;
