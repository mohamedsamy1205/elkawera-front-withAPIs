
import React, { useState, useEffect } from 'react';
import { getAllPlayers } from '../utils/db';
import { Player } from '../types';
import { PlayerCard } from '../components/PlayerCard';
import { StatRadar } from '../components/StatRadar';
import { ArrowLeftRight, Search } from 'lucide-react';
import { PlayerSearchDropdown } from '../components/PlayerSearchDropdown';

export const Compare: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [p1Id, setP1Id] = useState<string>('');
  const [p2Id, setP2Id] = useState<string>('');

  useEffect(() => {
    getAllPlayers().then(setPlayers);
  }, []);

  const player1 = players.find(p => p.id === p1Id);
  const player2 = players.find(p => p.id === p2Id);

  const StatRow = ({ label, v1, v2 }: { label: string, v1: number, v2: number }) => {
    const diff = v1 - v2;
    return (
        <div className="grid grid-cols-5 items-center py-2 border-b border-white/5 text-sm font-bold">
            <div className={`col-span-1 text-right ${v1 > v2 ? 'text-elkawera-accent' : 'text-gray-400'}`}>{v1}</div>
            <div className="col-span-3 text-center uppercase tracking-wider text-xs text-gray-500">{label}</div>
            <div className={`col-span-1 text-left ${v2 > v1 ? 'text-yellow-400' : 'text-gray-400'}`}>{v2}</div>
        </div>
    )
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center">
        <h1 className="text-3xl font-display font-bold uppercase tracking-tight flex items-center justify-center gap-3">
            <ArrowLeftRight className="text-elkawera-accent" /> Comparison Lab
        </h1>
        <p className="text-gray-400 mt-2">Analyze players head-to-head to find the perfect fit for your squad.</p>
      </div>

      {/* Selectors */}
      <div className="grid md:grid-cols-2 gap-8 bg-white/5 p-6 rounded-2xl border border-white/10">
         <div>
            {/* Old label and select replaced with search dropdown */}
            <PlayerSearchDropdown
              label="Player A"
              players={players}
              value={p1Id}
              onChange={setP1Id}
              disabledIds={[p2Id].filter(Boolean)}
            />
         </div>
         <div>
            <PlayerSearchDropdown
              label="Player B"
              players={players}
              value={p2Id}
              onChange={setP2Id}
              disabledIds={[p1Id].filter(Boolean)}
            />
         </div>
      </div>

      {player1 && player2 ? (
        <div className="grid xl:grid-cols-3 gap-8 items-start">
            {/* Player 1 Card */}
            <div className="flex justify-center scale-90 origin-top">
                <PlayerCard player={player1} allowFlipClick={true} />
            </div>

            {/* Comparison Data */}
            <div className="space-y-6">
                <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden p-4 shadow-xl">
                    <StatRadar player1={player1} player2={player2} />
                </div>

                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                    <h3 className="text-center font-display font-bold uppercase text-lg mb-4 text-white">Stat Breakdown</h3>
                    <StatRow label="Overall" v1={player1.overallScore} v2={player2.overallScore} />
                    <StatRow label="Pace" v1={player1.stats.pace} v2={player2.stats.pace} />
                    <StatRow label="Shooting" v1={player1.stats.shooting} v2={player2.stats.shooting} />
                    <StatRow label="Passing" v1={player1.stats.passing} v2={player2.stats.passing} />
                    <StatRow label="Dribbling" v1={player1.stats.dribbling} v2={player2.stats.dribbling} />
                    <StatRow label="Defending" v1={player1.stats.defending} v2={player2.stats.defending} />
                    <StatRow label="Physical" v1={player1.stats.physical} v2={player2.stats.physical} />
                    <div className="h-px bg-white/10 my-2"></div>
                    <StatRow label="Goals" v1={player1.goals} v2={player2.goals} />
                    <StatRow label="Assists" v1={player1.assists} v2={player2.assists} />
                </div>
            </div>

            {/* Player 2 Card */}
            <div className="flex justify-center scale-90 origin-top">
                <PlayerCard player={player2} allowFlipClick={true} />
            </div>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500 border-2 border-dashed border-white/10 rounded-3xl">
            Select two players above to view detailed comparison.
        </div>
      )}
    </div>
  );
};
