import React, { useState, useEffect, useCallback } from 'react';
import { BREATHING_TECHNIQUES } from './constants';
import BreathingAnimator from './components/BreathingAnimator';
import StatsTracker from './components/StatsTracker';
import { Play, Settings } from 'lucide-react';

const App: React.FC = () => {
    const selectedTechnique = BREATHING_TECHNIQUES[0];
    const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
    const [sessionTime, setSessionTime] = useState<number>(180); // 3 minutes
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
    
    const [streak, setStreak] = useState<number>(0);
    const [practiceDates, setPracticeDates] = useState<string[]>([]);

    useEffect(() => {
        try {
            const storedDates = localStorage.getItem('breathflow_practiceDates');
            if (storedDates) {
                setPracticeDates(JSON.parse(storedDates));
            }
        } catch (error) {
            console.error("Failed to parse practice dates from localStorage", error);
            setPracticeDates([]);
        }
    }, []);

    useEffect(() => {
        const calculateStreak = (dates: string[]): number => {
            if (dates.length === 0) return 0;
            
            const practiceDateSet = new Set(dates);
            
            let currentStreak = 0;
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (!practiceDateSet.has(todayStr) && !practiceDateSet.has(yesterdayStr)) {
                return 0;
            }

            let dateToCheck = new Date();
            if (!practiceDateSet.has(todayStr)) {
                dateToCheck.setDate(dateToCheck.getDate() - 1);
            }

            while (true) {
                const dateStr = dateToCheck.toISOString().split('T')[0];
                if (practiceDateSet.has(dateStr)) {
                    currentStreak++;
                    dateToCheck.setDate(dateToCheck.getDate() - 1);
                } else {
                    break;
                }
            }
            
            return currentStreak;
        };

        const newStreak = calculateStreak(practiceDates);
        setStreak(newStreak);
    }, [practiceDates]);

    const logPracticeSession = useCallback(() => {
        const today = new Date().toISOString().split('T')[0];
        if (!practiceDates.includes(today)) {
            const newDates = [...practiceDates, today];
            setPracticeDates(newDates);
            localStorage.setItem('breathflow_practiceDates', JSON.stringify(newDates));
        }
    }, [practiceDates]);


    const handleSessionEnd = useCallback(() => {
        setIsSessionActive(false);
        logPracticeSession();
    }, [logPracticeSession]);
    
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-slate-800 flex flex-col items-center justify-center p-4 transition-colors duration-500">
            <div className="w-full max-w-md mx-auto">
                <header className="text-center mb-8 relative">
                    <h1 className="text-4xl font-bold text-slate-700">BreathFlow</h1>
                    <p className="text-slate-500 mt-2">Find your calm, one breath at a time.</p>
                     <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        disabled={isSessionActive}
                        className="absolute top-0 right-0 p-3 bg-white/80 backdrop-blur-lg rounded-full shadow-md text-slate-500 hover:text-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Settings"
                    >
                        <Settings size={20} />
                    </button>
                </header>

                <main className="bg-white/60 backdrop-blur-lg rounded-3xl shadow-lg p-6 md:p-8 w-full relative">
                    {!isSessionActive && !isSettingsOpen && (
                        <>
                            <StatsTracker streak={streak} practiceDates={practiceDates} />
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-center mb-4 text-slate-600">Current Technique</h3>
                                <div 
                                    className="w-full text-left p-4 rounded-xl border-2 bg-blue-100 border-blue-400 shadow-inner cursor-pointer hover:shadow-lg hover:border-blue-500 transition-all"
                                    onClick={() => setIsSessionActive(true)}
                                    role="button"
                                    aria-label={`Start ${selectedTechnique.name} session`}
                                >
                                    <p className="font-semibold text-slate-800">{selectedTechnique.name}</p>
                                    <p className="text-sm text-slate-500">{selectedTechnique.description}</p>
                                    <div className="flex items-center justify-end text-blue-600 mt-2">
                                        <span className="font-semibold text-sm mr-2">Start Session</span>
                                        <Play size={16}/>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {(isSessionActive || isSettingsOpen) && (
                         <BreathingAnimator
                            isActive={isSessionActive}
                            technique={selectedTechnique}
                            onSessionEnd={handleSessionEnd}
                            sessionTime={sessionTime}
                            onToggleSettings={() => setIsSettingsOpen(true)}
                        />
                    )}

                    {isSettingsOpen && (
                         <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 flex flex-col justify-center items-center">
                            <h3 className="text-xl font-semibold mb-4 text-slate-600">Session Duration</h3>
                            <div className="flex space-x-2 mb-6">
                                {[1, 3, 5, 10].map((min) => (
                                    <button 
                                        key={min}
                                        onClick={() => setSessionTime(min * 60)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${sessionTime === min * 60 ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                                    >
                                        {min} min
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setIsSettingsOpen(false)} className="bg-slate-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-slate-600 transition-colors">Done</button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;