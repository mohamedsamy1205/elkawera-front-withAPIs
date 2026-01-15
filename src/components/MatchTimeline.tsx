import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Shield, Calendar } from 'lucide-react';

interface MatchTimelineItem {
    id: string;
    date: number;
    opponent: string;
    opponentLogo?: string;
    result: 'W' | 'D' | 'L';
    score: string;
    playerStats: {
        goals?: number;
        assists?: number;
        cleanSheet?: boolean;
        saves?: number;
        rating?: number;
    };
}

interface MatchTimelineProps {
    matches: MatchTimelineItem[];
    maxItems?: number;
}

export const MatchTimeline: React.FC<MatchTimelineProps> = ({ matches, maxItems = 10 }) => {
    const displayMatches = matches.slice(-maxItems).reverse();

    const getResultColor = (result: 'W' | 'D' | 'L') => {
        switch (result) {
            case 'W': return 'bg-green-500 border-green-400 text-black';
            case 'D': return 'bg-gray-500 border-gray-400 text-white';
            case 'L': return 'bg-red-500 border-red-400 text-white';
        }
    };

    const getResultBg = (result: 'W' | 'D' | 'L') => {
        switch (result) {
            case 'W': return 'bg-green-500/10 border-green-500/30';
            case 'D': return 'bg-gray-500/10 border-gray-500/30';
            case 'L': return 'bg-red-500/10 border-red-500/30';
        }
    };

    if (displayMatches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Calendar size={48} className="mb-4 opacity-50" />
                <p className="text-sm">No match history available</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {displayMatches.map((match, index) => (
                <motion.div
                    key={match.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border rounded-xl p-4 ${getResultBg(match.result)} hover:bg-white/5 transition-all duration-300 group`}
                >
                    <div className="flex items-center justify-between gap-4">
                        {/* Date & Result Badge */}
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${getResultColor(match.result)}`}>
                                {match.result}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white">{match.opponent}</div>
                                <div className="text-xs text-gray-500">
                                    {new Date(match.date).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Score */}
                        <div className="text-xl font-display font-bold text-white">
                            {match.score}
                        </div>
                    </div>

                    {/* Player Stats */}
                    {(match.playerStats.goals || match.playerStats.assists || match.playerStats.cleanSheet || match.playerStats.saves) && (
                        <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-3">
                            {match.playerStats.goals !== undefined && match.playerStats.goals > 0 && (
                                <div className="flex items-center gap-1.5 text-xs">
                                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <Trophy size={12} className="text-green-400" />
                                    </div>
                                    <span className="text-gray-400">{match.playerStats.goals} {match.playerStats.goals === 1 ? 'Goal' : 'Goals'}</span>
                                </div>
                            )}
                            {match.playerStats.assists !== undefined && match.playerStats.assists > 0 && (
                                <div className="flex items-center gap-1.5 text-xs">
                                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <Target size={12} className="text-blue-400" />
                                    </div>
                                    <span className="text-gray-400">{match.playerStats.assists} {match.playerStats.assists === 1 ? 'Assist' : 'Assists'}</span>
                                </div>
                            )}
                            {match.playerStats.cleanSheet && (
                                <div className="flex items-center gap-1.5 text-xs">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <Shield size={12} className="text-emerald-400" />
                                    </div>
                                    <span className="text-gray-400">Clean Sheet</span>
                                </div>
                            )}
                            {match.playerStats.rating && (
                                <div className="ml-auto flex items-center gap-1.5 text-xs">
                                    <span className="text-gray-500">Rating:</span>
                                    <span className="font-bold text-elkawera-accent">{match.playerStats.rating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
};
