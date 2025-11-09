import React from 'react';
import { RandomEvent, RandomEventChoice, Team } from '../types';

interface RandomEventModalProps {
    eventData: { event: RandomEvent, context: any };
    team: Team;
    onResolve: (choice: RandomEventChoice) => void;
}

export const RandomEventModal: React.FC<RandomEventModalProps> = ({ eventData, team, onResolve }) => {
    const { event, context } = eventData;
    const { opponentName, mvpPlayer } = context;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-yellow-500/30 rounded-xl shadow-2xl w-full max-w-lg">
                <header className="p-4 border-b border-gray-700 text-center">
                    <h2 className="text-2xl font-bold text-yellow-300 tracking-wider">{event.title}</h2>
                </header>
                <main className="p-6 space-y-4">
                    {event.imageUrl && (
                        <div className="flex justify-center">
                            <img src={event.imageUrl} alt={event.title} className="w-24 h-24 p-3 bg-gray-900/50 rounded-full" />
                        </div>
                    )}
                    <p className="text-lg text-gray-300 italic text-center">"{event.description(team.name, opponentName, mvpPlayer?.ign)}"</p>
                    <div className="space-y-3 pt-4">
                        {event.choices.map((choice, index) => (
                            <button
                                key={index}
                                onClick={() => onResolve(choice)}
                                className="w-full text-left bg-gray-700/50 p-3 rounded-md hover:bg-cyan-600/50 transition-colors"
                            >
                                {choice.text}
                            </button>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};