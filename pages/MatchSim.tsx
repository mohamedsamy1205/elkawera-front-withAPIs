
import React, { useState, useEffect } from 'react';
import { getAllTeams, getPlayersByTeamId } from '../utils/db';
import { Team, Player } from '../types';
import { simulateMatch, MatchResult } from '../utils/simulation';
import { Trophy, Clock, PlayCircle, RefreshCw } from 'lucide-react';

export const MatchSim: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [homeId, setHomeId] = useState('');
  const [awayId, setAwayId] = useState('');
  
  const [result, setResult] = useState<MatchResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    getAllTeams().then(setTeams);
  }, []);

  const handleSimulate = async () => {
    if (!homeId || !awayId || homeId === awayId) return;
    
    setIsSimulating(true);
    setResult(null);

    const homeTeam = teams.find(t => t.id === homeId)!;
    const awayTeam = teams.find(t => t.id === awayId)!;
    
    const [homeSquad, awaySquad] = await Promise.all([
        getPlayersByTeamId(homeId),
        getPlayersByTeamId(awayId)
    ]);

    // Fake delay for tension
    setTimeout(() => {
        const simResult = simulateMatch(homeTeam, homeSquad, awayTeam, awaySquad);
        setResult(simResult);
        setIsSimulating(false);
    }, 1500);
  };

  const homeTeam = teams.find(t => t.id === homeId);
  const awayTeam = teams.find(t => t.id === awayId);

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in-up">
      <div className="text-center">
         <h1 className="text-4xl font-display font-bold uppercase tracking-tight flex items-center justify-center gap-3">
            <Trophy className="text-yellow-400" /> Match Simulator
         </h1>
         <p className="text-gray-400 mt-2">Test your squad's power in a simulated showdown.</p>
      </div>

      {/* Match Setup */}
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl relative overflow-hidden">
         {/* Pitch Texture */}
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Home Selection */}
            <div className="flex-1 w-full">
                <label className="block text-center text-xs font-bold uppercase text-gray-400 mb-2">Home Team</label>
                <select 
                    value={homeId} 
                    onChange={(e) => setHomeId(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 p-4 rounded-xl text-xl font-bold text-center focus:border-elkawera-accent focus:outline-none appearance-none cursor-pointer hover:bg-white/5 transition-colors"
                >
                    <option value="">Select Team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                {homeTeam && (
                    <div className="mt-4 flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-white border-4 border-white/10 flex items-center justify-center shadow-lg" style={{borderColor: homeTeam.color}}>
                            {homeTeam.logoUrl ? <img src={homeTeam.logoUrl} className="w-full h-full object-cover rounded-full"/> : <span className="text-2xl font-bold text-black">{homeTeam.shortName}</span>}
                        </div>
                    </div>
                )}
            </div>

            {/* VS Badge */}
            <div className="flex flex-col items-center justify-center shrink-0">
                <div className="text-4xl font-display font-bold italic text-white/20">VS</div>
                <button 
                    onClick={handleSimulate}
                    disabled={isSimulating || !homeId || !awayId || homeId === awayId}
                    className={`mt-4 px-8 py-3 rounded-full font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                        isSimulating ? 'bg-gray-600 cursor-not-allowed' : 'bg-elkawera-accent text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,157,0.4)]'
                    }`}
                >
                    {isSimulating ? <RefreshCw className="animate-spin"/> : <PlayCircle />}
                    {isSimulating ? 'Simulating...' : 'Kick Off'}
                </button>
            </div>

            {/* Away Selection */}
            <div className="flex-1 w-full">
                <label className="block text-center text-xs font-bold uppercase text-gray-400 mb-2">Away Team</label>
                <select 
                    value={awayId} 
                    onChange={(e) => setAwayId(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 p-4 rounded-xl text-xl font-bold text-center focus:border-elkawera-accent focus:outline-none appearance-none cursor-pointer hover:bg-white/5 transition-colors"
                >
                    <option value="">Select Team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                {awayTeam && (
                    <div className="mt-4 flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-white border-4 border-white/10 flex items-center justify-center shadow-lg" style={{borderColor: awayTeam.color}}>
                            {awayTeam.logoUrl ? <img src={awayTeam.logoUrl} className="w-full h-full object-cover rounded-full"/> : <span className="text-2xl font-bold text-black">{awayTeam.shortName}</span>}
                        </div>
                    </div>
                )}
            </div>
         </div>
      </div>

      {/* Results Board */}
      {result && homeTeam && awayTeam && (
          <div className="animate-fade-in-up">
              <div className="bg-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                  {/* Scoreboard Header */}
                  <div className="bg-white/5 p-4 flex justify-between items-center border-b border-white/5">
                      <span className="text-xs font-bold uppercase text-gray-500">Full Time</span>
                      <span className="text-xs font-bold uppercase text-elkawera-accent flex items-center gap-1"><Clock size={12}/> 90:00</span>
                  </div>

                  {/* Main Score */}
                  <div className="p-8 md:p-12 flex items-center justify-center gap-8 md:gap-24 bg-gradient-to-b from-transparent to-white/5">
                      <div className="text-center w-1/3">
                          <h2 className={`text-2xl md:text-4xl font-bold uppercase mb-2 ${result.homeScore > result.awayScore ? 'text-elkawera-accent' : 'text-white'}`}>{homeTeam.name}</h2>
                          <div className="text-xs font-mono text-gray-500">HOME</div>
                      </div>
                      <div className="flex items-center gap-4 bg-black/40 px-8 py-4 rounded-2xl border border-white/10 backdrop-blur-md">
                          <span className="text-6xl font-display font-bold text-white">{result.homeScore}</span>
                          <span className="text-2xl text-gray-600 font-light">-</span>
                          <span className="text-6xl font-display font-bold text-white">{result.awayScore}</span>
                      </div>
                      <div className="text-center w-1/3">
                          <h2 className={`text-2xl md:text-4xl font-bold uppercase mb-2 ${result.awayScore > result.homeScore ? 'text-elkawera-accent' : 'text-white'}`}>{awayTeam.name}</h2>
                          <div className="text-xs font-mono text-gray-500">AWAY</div>
                      </div>
                  </div>

                  {/* Match Stats */}
                  <div className="grid md:grid-cols-2">
                      {/* Timeline */}
                      <div className="p-6 border-r border-white/10">
                          <h3 className="text-sm font-bold uppercase text-gray-400 mb-4">Match Events</h3>
                          <div className="space-y-3">
                              {result.events.length === 0 ? (
                                  <p className="text-sm text-gray-600 italic text-center">No major events.</p>
                              ) : (
                                  result.events.map((ev, i) => (
                                      <div key={i} className={`flex items-center gap-3 text-sm ${ev.teamId === homeTeam.id ? 'justify-start' : 'justify-end'}`}>
                                          <span className="font-mono text-elkawera-accent font-bold">{ev.minute}'</span>
                                          <span className="text-white">{ev.player}</span>
                                          <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] uppercase font-bold text-gray-400">GOAL</span>
                                      </div>
                                  ))
                              )}
                          </div>
                      </div>

                      {/* Possession Bar */}
                      <div className="p-6 flex flex-col justify-center">
                          <h3 className="text-sm font-bold uppercase text-gray-400 mb-4 text-center">Possession</h3>
                          <div className="flex items-center justify-between text-2xl font-bold mb-2">
                              <span className="text-elkawera-accent">{result.homePossession}%</span>
                              <span className="text-gray-500">{result.awayPossession}%</span>
                          </div>
                          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden flex">
                              <div className="h-full bg-elkawera-accent transition-all duration-1000" style={{width: `${result.homePossession}%`}}></div>
                              <div className="h-full bg-gray-600 transition-all duration-1000" style={{width: `${result.awayPossession}%`}}></div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
