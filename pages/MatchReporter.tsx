
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    getAllTeams,
    getAllPlayers,
    saveTeam, // Restored this
    savePlayer,
    getPlayersByTeamId,
    saveMatch,
    saveMatchRequest // Changed from updateMatchRequest
} from '../utils/db';
import {
    Team,
    Player,
    Match,
    MatchRequest // Added
} from '../types';
import { v4 as uuidv4 } from 'uuid'; // Added this
import {
    computeOverall,
    computeOverallWithPerformance,
    getCardType
} from '../utils/calculation';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, Shield, Trophy, CheckCircle, AlertCircle, X } from 'lucide-react';

interface MatchPlayerStats {
    id: string;
    name: string;
    position: string;
    teamId: string; // 'home' or 'away'
    played: boolean;
    goals: number;
    assists: number;
    defensiveContributions: number;
    cleanSheets: boolean; // boolean for input, converted to number
    saves: number;
    penaltySaves: number;
    ownGoals: number;
    goalsConceded: number;
    penaltyMissed: number;
}

export const MatchReporter: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const location = useLocation();
    const [teams, setTeams] = useState<Team[]>([]);
    const [homeTeamId, setHomeTeamId] = useState('');
    const [awayTeamId, setAwayTeamId] = useState('');
    const [homeScore, setHomeScore] = useState(0);
    const [awayScore, setAwayScore] = useState(0);
    const [activeMatchRequest, setActiveMatchRequest] = useState<MatchRequest | null>(null); // Added

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Map of playerId -> stats
    const [statsMap, setStatsMap] = useState<Record<string, MatchPlayerStats>>({});
    const [playersMap, setPlayersMap] = useState<Record<string, Player>>({});

    useEffect(() => {
        // Only admins
        if (user && user.role !== 'admin') {
            navigate('/dashboard');
            return;
        }

        setLoading(true);
        getAllTeams().then(t => {
            setTeams(t);
            setLoading(false);

            // Check for passed state from Dashboard
            if (location.state && location.state.matchRequest) {
                const req = location.state.matchRequest as MatchRequest;
                setActiveMatchRequest(req);
                setHomeTeamId(req.homeTeamId);
                setAwayTeamId(req.awayTeamId);
            }
        });
    }, [user, navigate, location]);

    // Fetch players when teams change
    useEffect(() => {
        const fetchSquads = async () => {
            if (!homeTeamId && !awayTeamId) return;

            const newStatsMap: Record<string, MatchPlayerStats> = {};
            const newPlayersMap: Record<string, Player> = {};

            if (homeTeamId) {
                const homeSquad = await getPlayersByTeamId(homeTeamId);
                homeSquad.forEach(p => {
                    newPlayersMap[p.id] = p;
                    // Determine if played based on match request lineup
                    const isPlayed = activeMatchRequest?.homeTeamLineup
                        ? activeMatchRequest.homeTeamLineup.includes(p.id)
                        : true;

                    if (!statsMap[p.id]) {
                        newStatsMap[p.id] = initializeStats(p, 'home', isPlayed);
                    } else {
                        // Preserve existing stats but update team/played if needed (activeRequest overrides ?)
                        // Actually better to just reset if team changed or respect current state
                        // If we are initializing from request, force played status
                        if (activeMatchRequest) {
                            newStatsMap[p.id] = { ...statsMap[p.id], teamId: 'home', played: isPlayed };
                        } else {
                            newStatsMap[p.id] = { ...statsMap[p.id], teamId: 'home' };
                        }
                    }
                });
            }

            if (awayTeamId) {
                const awaySquad = await getPlayersByTeamId(awayTeamId);
                awaySquad.forEach(p => {
                    newPlayersMap[p.id] = p;
                    const isPlayed = activeMatchRequest?.awayTeamLineup
                        ? activeMatchRequest.awayTeamLineup.includes(p.id)
                        : true;

                    if (!statsMap[p.id]) {
                        newStatsMap[p.id] = initializeStats(p, 'away', isPlayed);
                    } else {
                        if (activeMatchRequest) {
                            newStatsMap[p.id] = { ...statsMap[p.id], teamId: 'away', played: isPlayed };
                        } else {
                            newStatsMap[p.id] = { ...statsMap[p.id], teamId: 'away' };
                        }
                    }
                });
            }

            setPlayersMap(prev => ({ ...prev, ...newPlayersMap }));
            setStatsMap(prev => ({ ...prev, ...newStatsMap }));
        };

        fetchSquads();
    }, [homeTeamId, awayTeamId, activeMatchRequest]); // Added activeMatchRequest dependence

    // Auto-apply logic when scores change
    useEffect(() => {
        setStatsMap(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(pid => {
                const pStats = next[pid];
                const isHome = pStats.teamId === 'home';
                const opponentScore = isHome ? awayScore : homeScore;
                const myConceded = opponentScore;

                // Auto-set Goals Conceded for GK
                if (pStats.position === 'GK') {
                    next[pid] = { ...pStats, goalsConceded: myConceded };
                }

                // Auto-set Clean Sheet for DEF/GK if opponent score is 0
                if ((pStats.position === 'GK' || pStats.position === 'CB') && opponentScore === 0) {
                    next[pid] = { ...next[pid], cleanSheets: true };
                } else if ((pStats.position === 'GK' || pStats.position === 'CB') && opponentScore > 0) {
                    next[pid] = { ...next[pid], cleanSheets: false };
                }
            });
            return next;
        });
    }, [homeScore, awayScore]);

    const initializeStats = (player: Player, side: 'home' | 'away', defaultPlayed = true): MatchPlayerStats => ({
        id: player.id,
        name: player.name,
        position: player.position,
        teamId: side,
        played: defaultPlayed,
        goals: 0,
        assists: 0,
        defensiveContributions: 0,
        cleanSheets: false,
        saves: 0,
        penaltySaves: 0,
        ownGoals: 0,
        goalsConceded: 0,
        penaltyMissed: 0
    });

    const handleStatChange = (playerId: string, field: keyof MatchPlayerStats, value: any) => {
        setStatsMap(prev => ({
            ...prev,
            [playerId]: { ...prev[playerId], [field]: value }
        }));
    };

    const getFilteredStats = (side: 'home' | 'away'): MatchPlayerStats[] => {
        return (Object.values(statsMap) as MatchPlayerStats[]).filter(s => s.teamId === side);
    };

    const handleSubmit = async () => {
        if (!homeTeamId || !awayTeamId) return;
        setSubmitting(true);

        try {
            // 1. Update Teams
            const homeTeam = teams.find(t => t.id === homeTeamId);
            const awayTeam = teams.find(t => t.id === awayTeamId);

            if (homeTeam && awayTeam) {
                // Update Home
                homeTeam.totalMatches++;
                if (homeScore > awayScore) { homeTeam.wins++; homeTeam.experiencePoints += 3; }
                else if (homeScore === awayScore) { homeTeam.draws++; homeTeam.experiencePoints += 1; }
                else { homeTeam.losses++; }

                // Update Away
                awayTeam.totalMatches++;
                if (awayScore > homeScore) { awayTeam.wins++; awayTeam.experiencePoints += 3; }
                else if (awayScore === homeScore) { awayTeam.draws++; awayTeam.experiencePoints += 1; }
                else { awayTeam.losses++; }

                await Promise.all([saveTeam(homeTeam), saveTeam(awayTeam)]);
            }

            // 2. Create Match Record
            // Get players who actually played
            const homeStats = getFilteredStats('home').filter(s => s.played);
            const awayStats = getFilteredStats('away').filter(s => s.played);

            const matchId = uuidv4();
            const newMatch: Match = {
                id: matchId,
                homeTeamId,
                awayTeamId,
                homeScore,
                awayScore,
                status: 'finished',
                homePlayerIds: homeStats.map(s => s.id),
                awayPlayerIds: awayStats.map(s => s.id),
                events: [], // Events would ideally be populated from a timeline, but here we just have totals
                createdAt: Date.now(),
                finishedAt: Date.now(),
                isExternal: false,
                createdBy: user?.id || 'admin'
            };

            await saveMatch(newMatch);

            // 3. Update Players
            const updatePromises = (Object.values(statsMap) as MatchPlayerStats[]).map(async (mStats) => {
                if (!mStats.played) return;

                const originalPlayer = playersMap[mStats.id];
                if (!originalPlayer) return;

                // Accumulate Stats
                const updatedStats = {
                    goals: (originalPlayer.goals || 0) + mStats.goals,
                    assists: (originalPlayer.assists || 0) + mStats.assists,
                    matchesPlayed: (originalPlayer.matchesPlayed || 0) + 1,
                    defensiveContributions: (originalPlayer.defensiveContributions || 0) + mStats.defensiveContributions,
                    cleanSheets: (originalPlayer.cleanSheets || 0) + (mStats.cleanSheets ? 1 : 0),
                    saves: (originalPlayer.saves || 0) + mStats.saves,
                    penaltySaves: (originalPlayer.penaltySaves || 0) + mStats.penaltySaves,
                    ownGoals: (originalPlayer.ownGoals || 0) + mStats.ownGoals,
                    goalsConceded: (originalPlayer.goalsConceded || 0) + mStats.goalsConceded,
                    penaltyMissed: (originalPlayer.penaltyMissed || 0) + mStats.penaltyMissed,
                };

                // Recalculate OVR (using updated totals)
                const baseScore = computeOverall(originalPlayer.stats, originalPlayer.position);
                const newScore = computeOverallWithPerformance(
                    baseScore,
                    originalPlayer.position,
                    updatedStats
                );
                const newCardType = getCardType(newScore);

                const updatedPlayer: Player = {
                    ...originalPlayer,
                    ...updatedStats,
                    overallScore: newScore,
                    cardType: newCardType,
                    updatedAt: Date.now()
                };

                return savePlayer(updatedPlayer);
            });

            await Promise.all(updatePromises);

            // 4. If this came from a MatchRequest, mark it as approved/completed
            if (activeMatchRequest) {
                const updatedReq: MatchRequest = {
                    ...activeMatchRequest,
                    status: 'approved'
                };
                await saveMatchRequest(updatedReq);
            }

            navigate('/dashboard');

        } catch (err) {
            console.error(err);
            alert('Failed to submit match report');
        } finally {
            setSubmitting(false);
        }
    };

    const StatInput = ({ pid, field, val, max = 99 }: any) => (
        <input
            type="number"
            min="0"
            max={max}
            value={val}
            onChange={(e) => handleStatChange(pid, field, parseInt(e.target.value) || 0)}
            className="w-12 bg-black/50 border border-white/10 rounded px-1 global-text-center focus:border-elkawera-accent text-white text-sm"
        />
    );

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate('/dashboard')} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-display font-bold uppercase">Match Reporter</h1>
            </div>

            {/* --- MATCH HEADER --- */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Home Team */}
                    <div className="flex-1 w-full">
                        <label className="text-xs uppercase font-bold text-gray-400 mb-2 block">Home Team</label>
                        <select
                            value={homeTeamId}
                            onChange={(e) => setHomeTeamId(e.target.value)}
                            className="w-full bg-black/50 border border-white/20 rounded-xl p-3 text-white focus:border-elkawera-accent"
                        >
                            <option value="">Select Team</option>
                            {teams.filter(t => t.id !== awayTeamId).map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-4">
                        <input
                            type="number"
                            value={homeScore}
                            onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                            className="w-20 h-20 bg-black border-2 border-white/20 rounded-2xl text-4xl font-bold text-center text-white focus:border-elkawera-accent"
                        />
                        <span className="text-2xl font-bold text-gray-500">-</span>
                        <input
                            type="number"
                            value={awayScore}
                            onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                            className="w-20 h-20 bg-black border-2 border-white/20 rounded-2xl text-4xl font-bold text-center text-white focus:border-elkawera-accent"
                        />
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 w-full text-right">
                        <label className="text-xs uppercase font-bold text-gray-400 mb-2 block">Away Team</label>
                        <select
                            value={awayTeamId}
                            onChange={(e) => setAwayTeamId(e.target.value)}
                            className="w-full bg-black/50 border border-white/20 rounded-xl p-3 text-white focus:border-elkawera-accent text-right"
                        >
                            <option value="">Select Team</option>
                            {teams.filter(t => t.id !== homeTeamId).map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* --- STATS GRID --- */}
            {(homeTeamId && awayTeamId) && (
                <div className="grid lg:grid-cols-2 gap-8">
                    {['home', 'away'].map((side) => (
                        <div key={side} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                            <div className={`p-4 font-bold uppercase text-center ${side === 'home' ? 'bg-elkawera-accent/10 text-elkawera-accent' : 'bg-blue-500/10 text-blue-400'}`}>
                                {side === 'home' ? 'Home Squad Stats' : 'Away Squad Stats'}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 text-[10px] uppercase text-gray-400">
                                            <th className="p-3">Player</th>
                                            <th className="p-1 text-center" title="Goals">G</th>
                                            <th className="p-1 text-center" title="Assists">A</th>
                                            <th className="p-1 text-center" title="Defensive Contributions">Def</th>
                                            <th className="p-1 text-center" title="Saves">Sav</th>
                                            <th className="p-1 text-center" title="Clean Sheet">CS</th>
                                            <th className="p-1 text-center" title="Conceded">Conc</th>
                                            <th className="p-1 text-center" title="Own Goals">OG</th>
                                            <th className="p-1 text-center" title="Penalty Missed">PM</th>
                                            <th className="p-1 text-center">Play</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getFilteredStats(side as 'home' | 'away').map(stats => (
                                            <tr key={stats.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${!stats.played ? 'opacity-50' : ''}`}>
                                                <td className="p-3">
                                                    <div className="font-bold text-sm truncate max-w-[120px]">{stats.name}</div>
                                                    <div className="text-[10px] text-gray-400">{stats.position}</div>
                                                </td>
                                                <td className="p-1 text-center"><StatInput pid={stats.id} field="goals" val={stats.goals} /></td>
                                                <td className="p-1 text-center"><StatInput pid={stats.id} field="assists" val={stats.assists} /></td>
                                                <td className="p-1 text-center"><StatInput pid={stats.id} field="defensiveContributions" val={stats.defensiveContributions} /></td>
                                                <td className="p-1 text-center"><StatInput pid={stats.id} field="saves" val={stats.saves} /></td>
                                                <td className="p-1 text-center">
                                                    <input type="checkbox" checked={stats.cleanSheets} onChange={(e) => handleStatChange(stats.id, 'cleanSheets', e.target.checked)} className="accent-elkawera-accent" />
                                                </td>
                                                <td className="p-1 text-center"><StatInput pid={stats.id} field="goalsConceded" val={stats.goalsConceded} /></td>
                                                <td className="p-1 text-center"><StatInput pid={stats.id} field="ownGoals" val={stats.ownGoals} /></td>
                                                <td className="p-1 text-center"><StatInput pid={stats.id} field="penaltyMissed" val={stats.penaltyMissed} /></td>
                                                <td className="p-1 text-center">
                                                    <input type="checkbox" checked={stats.played} onChange={(e) => handleStatChange(stats.id, 'played', e.target.checked)} className="accent-green-500 w-4 h-4" />
                                                </td>
                                            </tr>
                                        ))}
                                        {getFilteredStats(side as 'home' | 'away').length === 0 && (
                                            <tr><td colSpan={10} className="p-8 text-center text-gray-500">No players found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- FOOTER ACTIONS --- */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur border-t border-white/10 flex justify-end gap-4 z-50">
                <button onClick={() => navigate('/dashboard')} className="px-6 py-3 font-bold text-gray-400 hover:text-white transition-colors">
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={submitting || !homeTeamId || !awayTeamId}
                    className="px-8 py-3 bg-elkawera-accent text-black font-bold uppercase rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {submitting ? 'Updating...' : <><CheckCircle size={20} /> Submit Match Result</>}
                </button>
            </div>
        </div>
    );
};
