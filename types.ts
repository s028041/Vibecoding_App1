
export interface BreathingTimings {
    inhale: number;
    hold1: number;
    exhale: number;
    hold2: number;
}

export interface BreathingTechnique {
    id: string;
    name: string;
    description: string;
    timings: BreathingTimings;
}

export type AnimationStep = 'inhale' | 'hold1' | 'exhale' | 'hold2';
