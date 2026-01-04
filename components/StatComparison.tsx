import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatComparisonProps {
    label: string;
    icon: React.ReactNode;
    oldValue: number;
    newValue: number;
    suffix?: string;
    decimals?: number;
}

export const StatComparison: React.FC<StatComparisonProps> = ({
    label,
    icon,
    oldValue,
    newValue,
    suffix = '',
    decimals = 0
}) => {
    const difference = newValue - oldValue;
    const isPositive = difference > 0;
    const isNeutral = difference === 0;

    const formatValue = (val: number) => {
        return decimals > 0 ? val.toFixed(decimals) : Math.round(val);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="text-gray-400">{icon}</div>
                    <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">{label}</span>
                </div>
                {!isNeutral && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${
                        isPositive ? 'text-green-400' : 'text-red-400'
                    }`}>
                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {isPositive ? '+' : ''}{formatValue(difference)}{suffix}
                    </div>
                )}
                {isNeutral && (
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                        <Minus size={14} />
                        No change
                    </div>
                )}
            </div>
            
            <div className="flex items-baseline gap-3">
                <div className="text-2xl font-display font-bold text-white">
                    {formatValue(newValue)}{suffix}
                </div>
                <div className="text-sm text-gray-500">
                    from {formatValue(oldValue)}{suffix}
                </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((newValue / (oldValue || 1)) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                        isPositive ? 'bg-green-400' : isNeutral ? 'bg-gray-500' : 'bg-red-400'
                    }`}
                />
            </div>
        </motion.div>
    );
};
