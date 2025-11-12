import React, { useState, useEffect } from 'react';
import type { BreathingTechnique, AnimationStep } from '../types';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { Play, Pause, Settings, ArrowLeft } from 'lucide-react';

interface BreathingAnimatorProps {
    isActive: boolean;
    technique: BreathingTechnique;
    onSessionEnd: () => void;
    sessionTime: number;
    onToggleSettings: () => void;
}

const STEP_LABELS: Record<AnimationStep, string> = {
    inhale: 'Inhale...',
    hold1: 'Hold',
    exhale: 'Exhale...',
    hold2: 'Hold',
};

const BreathingAnimator: React.FC<BreathingAnimatorProps> = ({ isActive, technique, onSessionEnd, sessionTime, onToggleSettings }) => {
    const { inhale, hold1, exhale } = technique.timings;

    const [currentStep, setCurrentStep] = useState<AnimationStep>('inhale');
    const [timeLeft, setTimeLeft] = useState(sessionTime);
    const [isPlaying, setIsPlaying] = useState(false);
    const [stepTimeLeft, setStepTimeLeft] = useState(inhale);
    const animationControls = useAnimationControls();

    // Effect to reset the state when a new session starts
    useEffect(() => {
        if (isActive) {
            setTimeLeft(sessionTime);
            setCurrentStep('inhale');
            setIsPlaying(false); // Start in paused state
            animationControls.set({ scale: 1 });
            setStepTimeLeft(inhale);
        }
    }, [isActive, sessionTime, animationControls, inhale]);

    // Effect for the session timer countdown
    useEffect(() => {
        if (!isActive || !isPlaying) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onSessionEnd(); // End session when time is up
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isActive, isPlaying, onSessionEnd]);
    
    // Effect for the step countdown timer
    useEffect(() => {
        if (!isActive) return;

        let duration = 0;
        switch (currentStep) {
            case 'inhale': duration = inhale; break;
            case 'hold1': duration = hold1; break;
            case 'exhale': duration = exhale; break;
        }
        setStepTimeLeft(duration);

        if (!isPlaying) {
            return;
        }

        const timer = setInterval(() => {
            setStepTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [isActive, isPlaying, currentStep, inhale, hold1, exhale]);


    // Effect for handling the circular animation sequence
    useEffect(() => {
        if (!isActive || !isPlaying) {
            animationControls.stop();
            return;
        }

        let nextStep: AnimationStep;
        let duration: number;

        const transitions = {
            inhale: { scale: 1.5, transition: { duration: inhale, ease: 'easeInOut' } },
            hold1: { scale: 1.5, transition: { duration: 0 } },
            exhale: { scale: 1, transition: { duration: exhale, ease: 'easeInOut' } },
        };

        switch (currentStep) {
            case 'inhale':
                animationControls.start(transitions.inhale);
                duration = inhale * 1000;
                nextStep = 'hold1';
                break;
            case 'hold1':
                animationControls.start(transitions.hold1);
                duration = hold1 * 1000;
                nextStep = 'exhale';
                break;
            case 'exhale':
                animationControls.start(transitions.exhale);
                duration = exhale * 1000;
                nextStep = 'inhale';
                break;
            default: return;
        }

        const timer = setTimeout(() => {
            setCurrentStep(nextStep);
        }, duration);

        return () => clearTimeout(timer);
    }, [isActive, isPlaying, currentStep, animationControls, inhale, hold1, exhale]);


    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleSettingsClick = () => {
        if (isPlaying) {
            setIsPlaying(false);
        }
        onToggleSettings();
    };

    return (
        <div className="relative flex flex-col items-center justify-between h-[400px]">
            <button
                onClick={onSessionEnd}
                className="absolute top-0 left-0 p-2 text-slate-500 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-100/80"
                aria-label="Stop Session and go back"
            >
                <ArrowLeft size={24} />
            </button>
            
            <div className="w-full flex-grow flex items-center justify-center">
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <motion.div
                        className="absolute w-full h-full bg-gradient-to-br from-cyan-300 to-blue-500 rounded-full shadow-xl"
                        animate={animationControls}
                        initial={{ scale: 1 }}
                    />
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="relative z-10 text-center text-white"
                        >
                            <p className="text-2xl font-semibold">
                                {isPlaying ? STEP_LABELS[currentStep] : 'Ready?'}
                            </p>
                            {isPlaying && (
                                <p className="text-5xl font-bold mt-1 tabular-nums tracking-tighter">
                                    {stepTimeLeft}
                                </p>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div className="flex flex-col items-center space-y-2 w-full">
                <p className="text-lg text-slate-500">{formatTime(timeLeft)}</p>
                <div className="flex justify-center items-center w-full relative px-4">
                    <button
                        onClick={handlePlayPause}
                        className="w-20 h-20 bg-white/80 backdrop-blur-lg rounded-full shadow-lg flex items-center justify-center text-blue-600 hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? <Pause size={40} /> : <Play size={40} className="ml-1" />}
                    </button>
                    <div className="absolute right-0">
                        <button
                            onClick={handleSettingsClick}
                            className="w-14 h-14 bg-white/60 backdrop-blur-lg rounded-full shadow-md flex items-center justify-center text-slate-500 hover:bg-white/80 hover:text-blue-500 transition-all"
                            aria-label="Settings"
                        >
                            <Settings size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BreathingAnimator;