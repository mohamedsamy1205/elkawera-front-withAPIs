import React from 'react';
import { Trophy, Target, Flame, Zap, Award, Star, Shield, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: 'trophy' | 'target' | 'flame' | 'zap' | 'award' | 'star' | 'shield' | 'crown';
    unlocked: boolean;
    unlockedAt?: number;
    progress?: number; // 0-100
    requirement?: string;
}

interface AchievementBadgeProps {
    achievement: Achievement;
    size?: 'sm' | 'md' | 'lg';
}

const iconMap = {
    trophy: Trophy,
    target: Target,
    flame: Flame,
    zap: Zap,
    award: Award,
    star: Star,
    shield: Shield,
    crown: Crown
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement, size = 'md' }) => {
    const Icon = iconMap[achievement.icon];
    
    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-20 h-20',
        lg: 'w-24 h-24'
    };

    const iconSizes = {
        sm: 24,
        md: 32,
        lg: 40
    };

    return (
        <motion.div
            whileHover={achievement.unlocked ? { scale: 1.05, rotate: 5 } : {}}
            className="relative group cursor-pointer"
        >
            {/* Badge Circle */}
            <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center relative ${
                achievement.unlocked
                    ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/30'
                    : 'bg-gray-800 border-2 border-gray-700'
            }`}>
                {achievement.unlocked ? (
                    <>
                        <Icon size={iconSizes[size]} className="text-black" />
                        {/* Shine effect */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 to-transparent opacity-50" />
                    </>
                ) : (
                    <Icon size={iconSizes[size]} className="text-gray-600" />
                )}

                {/* Progress ring for locked achievements */}
                {!achievement.unlocked && achievement.progress !== undefined && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            fill="none"
                            stroke="#374151"
                            strokeWidth="2"
                        />
                        <circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            fill="none"
                            stroke="#00ff9d"
                            strokeWidth="2"
                            strokeDasharray={`${achievement.progress * 2.83} 283`}
                            strokeLinecap="round"
                        />
                    </svg>
                )}
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-black border border-white/20 rounded-xl p-3 min-w-[200px] shadow-2xl">
                    <div className="flex items-center gap-2 mb-1">
                        <Icon size={16} className={achievement.unlocked ? 'text-yellow-400' : 'text-gray-400'} />
                        <h4 className="font-bold text-sm text-white">{achievement.title}</h4>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{achievement.description}</p>
                    
                    {achievement.unlocked && achievement.unlockedAt && (
                        <p className="text-[10px] text-green-400 font-bold">
                            ✓ Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                    )}
                    
                    {!achievement.unlocked && achievement.requirement && (
                        <p className="text-[10px] text-gray-500">
                            {achievement.requirement}
                        </p>
                    )}

                    {!achievement.unlocked && achievement.progress !== undefined && (
                        <div className="mt-2">
                            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>{achievement.progress}%</span>
                            </div>
                            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-elkawera-accent rounded-full transition-all"
                                    style={{ width: `${achievement.progress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
                {/* Arrow */}
                <div className="w-2 h-2 bg-black border-r border-b border-white/20 transform rotate-45 absolute top-full left-1/2 -translate-x-1/2 -mt-1" />
            </div>
        </motion.div>
    );
};
