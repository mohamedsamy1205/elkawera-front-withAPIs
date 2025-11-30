
import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { Player } from '../types';

interface StatRadarProps {
  player1: Player;
  player2: Player;
}

export const StatRadar: React.FC<StatRadarProps> = ({ player1, player2 }) => {
  const data = [
    { subject: 'Pace', A: player1.stats.pace, B: player2.stats.pace, fullMark: 100 },
    { subject: 'Shooting', A: player1.stats.shooting, B: player2.stats.shooting, fullMark: 100 },
    { subject: 'Passing', A: player1.stats.passing, B: player2.stats.passing, fullMark: 100 },
    { subject: 'Dribbling', A: player1.stats.dribbling, B: player2.stats.dribbling, fullMark: 100 },
    { subject: 'Defending', A: player1.stats.defending, B: player2.stats.defending, fullMark: 100 },
    { subject: 'Physical', A: player1.stats.physical, B: player2.stats.physical, fullMark: 100 },
  ];

  return (
    <div className="w-full h-[400px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 'bold' }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          
          <Radar
            name={player1.name}
            dataKey="A"
            stroke="#00ff9d"
            strokeWidth={3}
            fill="#00ff9d"
            fillOpacity={0.3}
          />
          <Radar
            name={player2.name}
            dataKey="B"
            stroke="#facc15" // Yellow/Gold for contrast
            strokeWidth={3}
            fill="#facc15"
            fillOpacity={0.3}
          />
          
          <Legend 
            wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px' }}
          />
          
          <Tooltip 
            contentStyle={{
                backgroundColor: 'rgba(5, 5, 5, 0.95)', 
                borderColor: 'rgba(255,255,255,0.1)', 
                borderRadius: '8px',
                color: '#fff'
            }}
            itemStyle={{ fontWeight: 'bold' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
