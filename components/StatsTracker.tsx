
import React, { useMemo } from 'react';
import { MOTIVATIONAL_QUOTES } from '../constants';
import { Flame } from 'lucide-react';

interface StatsTrackerProps {
    streak: number;
    practiceDates: string[];
}

const WeeklyCalendar: React.FC<{ practiceDates: string[] }> = ({ practiceDates }) => {
    const today = new Date();
    // Set start of the week to Sunday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); 
    startOfWeek.setHours(0, 0, 0, 0);

    const weekDays = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        return date;
    });

    const dayAbbreviations = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const practiceSet = new Set(practiceDates);

    return (
        <div className="flex justify-around items-center mt-4">
            {weekDays.map((day, index) => {
                const dayStr = day.toISOString().split('T')[0];
                const isPracticed = practiceSet.has(dayStr);
                const isToday = day.toDateString() === today.toDateString();

                return (
                    <div key={index} className="flex flex-col items-center space-y-2">
                         <span className={`text-xs font-medium ${isToday ? 'text-blue-500' : 'text-slate-400'}`}>{dayAbbreviations[index]}</span>
                        <div
                            className={`w-7 h-7 rounded-full transition-all ${
                                isPracticed ? 'bg-amber-400' : 'bg-slate-200'
                            } ${isToday ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white/50' : ''}`}
                            aria-label={`Day ${index + 1}, ${isPracticed ? 'practiced' : 'not practiced'}`}
                         />
                    </div>
                );
            })}
        </div>
    );
};


const StatsTracker: React.FC<StatsTrackerProps> = ({ streak, practiceDates }) => {
    const quote = useMemo(() => {
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
    }, []);

    return (
        <div className="mb-8 p-4 bg-white/50 rounded-xl flex flex-col">
            <div className="flex items-center justify-center text-amber-500">
                <Flame className="mr-2" size={24} />
                <p className="text-xl font-bold">{streak}</p>
                <p className="ml-1 text-slate-600 font-medium">day streak</p>
            </div>

            <WeeklyCalendar practiceDates={practiceDates} />
            
            <p className="text-slate-500 text-sm mt-4 text-center italic">"{quote}"</p>
        </div>
    );
};

export default StatsTracker;
