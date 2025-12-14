
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getPlayerById, savePlayer } from '../utils/db';
import { computeOverall, getCardType, computeOverallWithPerformance } from '../utils/calculation';
import { Player, PhysicalStats } from '../types';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Extracted components to prevent re-render focus loss
const StatInput = ({ label, value, onChange }: { label: string, value: number, onChange: (val: string) => void }) => (
  <div>
    <label className="block text-xs uppercase font-bold text-gray-400 mb-2">{label}</label>
    <input
      type="text"
      inputMode="numeric"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-xl font-bold text-white focus:border-elkawera-accent focus:outline-none text-center"
    />
  </div>
);

const StatSlider = ({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) => (
  <div className="mb-4">
    <div className="flex justify-between mb-1">
      <label className="text-sm uppercase font-bold text-gray-300">{label}</label>
      <span className="text-elkawera-accent font-mono font-bold">{value}</span>
    </div>
    <input
      type="range"
      min="1"
      max="99"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-elkawera-accent"
    />
  </div>
);

export const PostMatchStats: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [player, setPlayer] = useState<Player | null>(null);
  const [stats, setStats] = useState<PhysicalStats | null>(null);
  const [matchPerformance, setMatchPerformance] = useState({
    goals: 0,
    assists: 0,
    matches: 0,
    defensiveContributions: 0,
    cleanSheets: 0,
    saves: 0,
    penaltySaves: 0,
    ownGoals: 0,
    goalsConceded: 0,
    penaltyMissed: 0
  });

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    if (id) {
      getPlayerById(id).then(p => {
        if (p) {
          setPlayer(p);
          setStats(p.stats);
          setMatchPerformance({
            goals: p.goals || 0,
            assists: p.assists || 0,
            matches: p.matchesPlayed || 0,
            defensiveContributions: p.defensiveContributions || 0,
            cleanSheets: p.cleanSheets || 0,
            saves: p.saves || 0,
            penaltySaves: p.penaltySaves || 0,
            ownGoals: p.ownGoals || 0,
            goalsConceded: p.goalsConceded || 0,
            penaltyMissed: p.penaltyMissed || 0,
          });
        }
      });
    }
  }, [id, user, navigate]);

  const handleStatChange = (key: keyof PhysicalStats, value: number) => {
    if (stats) {
      setStats({ ...stats, [key]: Number(value) });
    }
  };

  const handlePerformanceChange = (key: keyof typeof matchPerformance, val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, '')) || 0;
    setMatchPerformance(prev => ({ ...prev, [key]: num }));
  };

  const saveStats = async () => {
    if (player && stats) {
      const baseScore = computeOverall(stats, player.position);

      const newScore = computeOverallWithPerformance(
        baseScore,
        player.position,
        {
          goals: matchPerformance.goals,
          assists: matchPerformance.assists,
          matchesPlayed: matchPerformance.matches,
          defensiveContributions: matchPerformance.defensiveContributions,
          cleanSheets: matchPerformance.cleanSheets,
          saves: matchPerformance.saves,
          penaltySaves: matchPerformance.penaltySaves,
          ownGoals: matchPerformance.ownGoals,
          goalsConceded: matchPerformance.goalsConceded,
          penaltyMissed: matchPerformance.penaltyMissed
        }
      );

      const newType = getCardType(newScore);

      const updatedPlayer: Player = {
        ...player,
        stats,
        goals: matchPerformance.goals,
        assists: matchPerformance.assists,
        matchesPlayed: matchPerformance.matches,
        defensiveContributions: matchPerformance.defensiveContributions,
        cleanSheets: matchPerformance.cleanSheets,
        saves: matchPerformance.saves,
        penaltySaves: matchPerformance.penaltySaves,
        ownGoals: matchPerformance.ownGoals,
        goalsConceded: matchPerformance.goalsConceded,
        penaltyMissed: matchPerformance.penaltyMissed,
        overallScore: newScore,
        cardType: newType,
        updatedAt: Date.now()
      };

      await savePlayer(updatedPlayer);
      navigate('/dashboard');
    }
  };

  if (!player || !stats) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/dashboard')} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-display font-bold uppercase">Post-Match Analysis</h1>
          <p className="text-gray-400">Update stats for <span className="text-white font-bold">{player.name} ({player.position})</span></p>
        </div>
      </div>

      <div className="bg-white/5 p-8 rounded-2xl border border-white/10 mb-8">
        <h3 className="text-xl font-bold mb-6 text-elkawera-accent border-b border-white/10 pb-2">Season Stats</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <StatInput label="Matches Played" value={matchPerformance.matches} onChange={(v) => handlePerformanceChange('matches', v)} />
          <StatInput label="Goals" value={matchPerformance.goals} onChange={(v) => handlePerformanceChange('goals', v)} />
          <StatInput label="Assists" value={matchPerformance.assists} onChange={(v) => handlePerformanceChange('assists', v)} />
          <StatInput label="Def. Contributions" value={matchPerformance.defensiveContributions} onChange={(v) => handlePerformanceChange('defensiveContributions', v)} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <StatInput label="Clean Sheets" value={matchPerformance.cleanSheets} onChange={(v) => handlePerformanceChange('cleanSheets', v)} />
          <StatInput label="Saves" value={matchPerformance.saves} onChange={(v) => handlePerformanceChange('saves', v)} />
          <StatInput label="Penalty Saves" value={matchPerformance.penaltySaves} onChange={(v) => handlePerformanceChange('penaltySaves', v)} />
          <StatInput label="Goals Conceded" value={matchPerformance.goalsConceded} onChange={(v) => handlePerformanceChange('goalsConceded', v)} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatInput label="Own Goals" value={matchPerformance.ownGoals} onChange={(v) => handlePerformanceChange('ownGoals', v)} />
          <StatInput label="Penalty Missed" value={matchPerformance.penaltyMissed} onChange={(v) => handlePerformanceChange('penaltyMissed', v)} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 bg-white/5 p-8 rounded-2xl border border-white/10">
        <div>
          <h3 className="text-xl font-bold mb-6 text-elkawera-accent border-b border-white/10 pb-2">Offensive & Skill</h3>
          <StatSlider label="Pace / Sprint Speed" value={stats.pace} onChange={(v) => handleStatChange('pace', v)} />
          <StatSlider label="Shooting" value={stats.shooting} onChange={(v) => handleStatChange('shooting', v)} />
          <StatSlider label="Passing" value={stats.passing} onChange={(v) => handleStatChange('passing', v)} />
          <StatSlider label="Dribbling" value={stats.dribbling} onChange={(v) => handleStatChange('dribbling', v)} />
          <StatSlider label="Agility" value={stats.agility} onChange={(v) => handleStatChange('agility', v)} />
        </div>
        <div>
          <h3 className="text-xl font-bold mb-6 text-elkawera-accent border-b border-white/10 pb-2">Physical & Defensive</h3>
          <StatSlider label="Defending" value={stats.defending} onChange={(v) => handleStatChange('defending', v)} />
          <StatSlider label="Physical / Strength" value={stats.physical} onChange={(v) => handleStatChange('physical', v)} />
          <StatSlider label="Stamina" value={stats.stamina} onChange={(v) => handleStatChange('stamina', v)} />
          <StatSlider label="Acceleration" value={stats.acceleration} onChange={(v) => handleStatChange('acceleration', v)} />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <div className="bg-black/30 p-4 rounded-lg mr-4 border border-white/10">
          <span className="text-gray-400 text-sm uppercase block">Projected Overall</span>
          <span className="text-3xl font-display font-bold text-white">
            {computeOverallWithPerformance(
              computeOverall(stats, player.position),
              player.position,
              {
                goals: matchPerformance.goals,
                assists: matchPerformance.assists,
                matchesPlayed: matchPerformance.matches,
                defensiveContributions: matchPerformance.defensiveContributions,
                cleanSheets: matchPerformance.cleanSheets,
                saves: matchPerformance.saves,
                penaltySaves: matchPerformance.penaltySaves,
                ownGoals: matchPerformance.ownGoals,
                goalsConceded: matchPerformance.goalsConceded,
                penaltyMissed: matchPerformance.penaltyMissed
              }
            )}
          </span>
        </div>
        <button
          onClick={saveStats}
          className="px-8 py-4 bg-elkawera-accent text-black font-bold uppercase rounded hover:bg-white transition-colors flex items-center gap-2"
        >
          <CheckCircle size={20} /> Confirm Updates
        </button>
      </div>
    </div>
  );
};
