import React from 'react';
import { Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface RadarChartProps {
    data: {
        category: string;
        value: number;
        fullMark: number;
    }[];
    color?: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data, color = '#00ff9d' }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <RechartsRadar data={data}>
                <PolarGrid stroke="#ffffff20" strokeDasharray="3 3" />
                <PolarAngleAxis 
                    dataKey="category" 
                    tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 600 }}
                    tickLine={false}
                />
                <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                    axisLine={false}
                />
                <Radar 
                    name="Performance" 
                    dataKey="value" 
                    stroke={color} 
                    fill={color} 
                    fillOpacity={0.3}
                    strokeWidth={2}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#09090b',
                        border: '1px solid #27272a',
                        borderRadius: '12px',
                        color: '#fff',
                        padding: '12px'
                    }}
                    formatter={(value: number) => [`${value}/100`, 'Score']}
                />
            </RechartsRadar>
        </ResponsiveContainer>
    );
};
