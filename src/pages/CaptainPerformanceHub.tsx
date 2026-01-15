import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import {
    getAllTeams,
    getAllMatches,
    getAllPlayers,
    getTeamById,
    getMatchesByTeam
} from '@/utils/db';
import { Team, Player, Match } from '@/types';
import { motion } from 'framer-motion';
import {
    Activity, Trophy, Target, Shield, Zap, Calendar,
    BarChart3, Award, Flame, Star, User, ArrowLeft, TrendingUp, Users, Goal
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine, LabelList } from 'recharts';

export const CaptainPerformanceHub: React.FC = () => {
    const { user } = useAuth();
    const { t, dir } = useSettings();
    const navigate = useNavigate();

    const [myTeam, setMyTeam] = useState<Team | null>(null);
    const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
    const [teamMatches, setTeamMatches] = useState<Match[]>([]);
    const [allTeams, setAllTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const teams = await getAllTeams();
                setAllTeams(teams);

                const captainTeam = teams.find(t => t.captainId === user.id);
                if (captainTeam) {
                    setMyTeam(captainTeam);

                    const [playersData, matchesData] = await Promise.all([
                        getAllPlayers(),
                        getMatchesByTeam(captainTeam.id)
                    ]);

                    setTeamPlayers(playersData.filter(p => p.teamId === captainTeam.id));
                    setTeamMatches(matchesData.filter(m => m.status === 'finished').sort((a, b) => (a.finishedAt || 0) - (b.finishedAt || 0)));
                }
            } catch (error) {
                console.error('Error loading captain performance data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    // Calculate detailed stats
    const stats = useMemo(() => {
        if (!myTeam || !teamMatches.length) return null;

        let wins = 0;
        let draws = 0;
        let losses = 0;
        let totalGoals = 0;
        let totalConceded = 0;

        const matchHistory = teamMatches.map(match => {
            const isHome = match.homeTeamId === myTeam.id;
            const myScore = isHome ? match.homeScore : match.awayScore;
            const opScore = isHome ? match.awayScore : match.homeScore;
            const opponentId = isHome ? match.awayTeamId : match.homeTeamId;
            const opponentTeam = allTeams.find(t => t.id === opponentId);

            totalGoals += myScore;
            totalConceded += opScore;

            let result: 'W' | 'D' | 'L' = 'D';
            if (myScore > opScore) { wins++; result = 'W'; }
            else if (myScore < opScore) { losses++; result = 'L'; }
            else { draws++; }

            return {
                date: match.finishedAt || 0,
                myScore,
                opScore,
                result,
                opponent: opponentTeam?.shortName || 'OPP',
                goalDiff: myScore - opScore
            };
        });

        const totalMatches = teamMatches.length;
        const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;
        const avgGoals = totalGoals / totalMatches;
        const avgConceded = totalConceded / totalMatches;

        return {
            wins,
            draws,
            losses,
            totalMatches,
            winRate,
            totalGoals,
            totalConceded,
            avgGoals,
            avgConceded,
            matchHistory
        };
    }, [myTeam, teamMatches, allTeams]);

    // Top Scorers data
    const topScorers = useMemo(() => {
        return [...teamPlayers]
            .sort((a, b) => b.goals - a.goals)
            .slice(0, 5)
            .map(p => ({ name: p.name, goals: p.goals }));
    }, [teamPlayers]);

    // Performance Trajectory (last 10 matches)
    const trajectoryData = useMemo(() => {
        if (!stats) return [];
        let cumulativeGD = 0;
        return stats.matchHistory.slice(-10).map((m, idx) => {
            cumulativeGD += m.goalDiff;
            return {
                match: idx + 1,
                goalDiff: m.goalDiff,
                cumulativeGD,
                opponent: m.opponent,
                result: m.result,
                score: `${m.myScore}-${m.opScore}`
            };
        });
    }, [stats]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-elkawera-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading Team Performance Hub...</p>
                </div>
            </div>
        );
    }

    if (!myTeam) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <Shield size={64} className="text-gray-600 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">No Team Found</h2>
                <p className="text-gray-400 mb-6">You need to lead a team to access the Captain's Performance Hub.</p>
                <button
                    onClick={() => navigate('/captain/dashboard')}
                    className="px-6 py-3 bg-elkawera-accent text-black font-bold rounded-full hover:bg-white transition-all"
                >
                    Go to Captain Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 md:px-0" dir={dir}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <button
                        onClick={() => navigate('/captain/dashboard')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm">Back to Dashboard</span>
                    </button>
                    <div className="flex items-center gap-4">
                        {myTeam.logoUrl && (
                            <img src={myTeam.logoUrl} alt={myTeam.name} className="w-16 h-16 rounded-full object-cover border-2 border-elkawera-accent" />
                        )}
                        <div>
                            <h1 className="text-4xl font-display font-bold uppercase tracking-tight text-white leading-none">
                                {myTeam.name} <span className="text-elkawera-accent text-2xl">| Hub</span>
                            </h1>
                            <p className="text-gray-400 mt-2 flex items-center gap-2">
                                <Award size={16} className="text-yellow-400" />
                                {user?.name}'s Captain Performance Analytics
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-6 items-center">
                    <div className="text-center">
                        <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">XP</p>
                        <p className="text-xl font-display font-bold text-elkawera-accent">{myTeam.experiencePoints}</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                        <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Rank</p>
                        <p className="text-xl font-display font-bold text-yellow-500">#{myTeam.ranking}</p>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats Bento */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group"
                >
                    <Activity className="text-blue-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
                    <div className="text-4xl font-display font-bold text-white mb-1">{stats?.totalMatches || 0}</div>
                    <div className="text-xs uppercase text-gray-400 font-bold tracking-wider">Matches</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group"
                >
                    <Trophy className="text-green-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
                    <div className="text-4xl font-display font-bold text-white mb-1">{stats?.wins || 0}</div>
                    <div className="text-xs uppercase text-gray-400 font-bold tracking-wider">Wins</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group"
                >
                    <Zap className="text-yellow-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
                    <div className="text-4xl font-display font-bold text-white mb-1">{stats?.winRate.toFixed(1) || 0}%</div>
                    <div className="text-xs uppercase text-gray-400 font-bold tracking-wider">Win Rate</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group"
                >
                    <Goal className="text-purple-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
                    <div className="text-4xl font-display font-bold text-white mb-1">{stats?.totalGoals || 0}</div>
                    <div className="text-xs uppercase text-gray-400 font-bold tracking-wider">Total Goals</div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Trends */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-6"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <TrendingUp className="text-elkawera-accent" size={24} />
                                Season Performance Trend
                            </h3>
                            <p className="text-sm text-gray-400">Cumulative goal difference over time</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-elkawera-accent" />
                                <span className="text-[10px] text-gray-400 uppercase font-bold">Progress</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        {trajectoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trajectoryData}>
                                    <defs>
                                        <linearGradient id="colorGD" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00FF9D" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#00FF9D" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <ReferenceLine y={0} stroke="#ffffff40" strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="match"
                                        stroke="#6b7280"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        label={{ value: 'Matches', position: 'insideBottom', offset: -5, fill: '#6b7280', fontSize: 10 }}
                                    />
                                    <YAxis
                                        stroke="#6b7280"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-black/90 border border-white/20 p-3 rounded-xl shadow-xl backdrop-blur-md">
                                                        <p className="text-elkawera-accent font-bold text-[10px] mb-2 uppercase tracking-tighter">Match {data.match}: vs {data.opponent}</p>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${data.result === 'W' ? 'bg-green-500 text-black' :
                                                                data.result === 'L' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'
                                                                }`}>{data.result}</span>
                                                            <span className="text-white font-display font-bold text-sm">{data.score}</span>
                                                            <div className="w-px h-4 bg-white/20" />
                                                            <span className={`text-[10px] font-bold ${data.cumulativeGD >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                Net GD: {data.cumulativeGD > 0 ? '+' : ''}{data.cumulativeGD}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="cumulativeGD"
                                        stroke="#00FF9D"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorGD)"
                                        animationDuration={2000}
                                        dot={{ fill: '#00FF9D', strokeWidth: 2, r: 4, stroke: '#000' }}
                                        activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 italic">
                                Not enough match data to show trends
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Top Scorers Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-6"
                >
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Target className="text-purple-400" size={24} />
                        Team Top Scorers
                    </h3>
                    <div className="h-[300px] w-full">
                        {topScorers.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topScorers} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        stroke="#6b7280"
                                        fontSize={10}
                                        width={80}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 8 }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-black/90 border border-white/20 p-2 rounded-lg shadow-xl">
                                                        <p className="text-white font-bold text-xs">{payload[0].payload.name}</p>
                                                        <p className="text-elkawera-accent font-black text-lg">{payload[0].value} Goals</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="goals" radius={[0, 6, 6, 0]} barSize={20}>
                                        <LabelList dataKey="goals" position="right" fill="#ffffff60" fontSize={10} offset={10} />
                                        {topScorers.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={index === 0 ? '#00FF9D' : '#8b5cf6'}
                                                fillOpacity={1 - (index * 0.15)}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 italic">
                                No goals recorded yet
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Averages & Defense */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <p className="text-xs uppercase text-gray-400 font-bold mb-1">Avg Goals / Match</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-display font-bold text-white">
                            {stats?.avgGoals.toFixed(1) || '0.0'}
                        </span>
                        <span className="text-xs text-green-400 font-bold mb-1 flex items-center gap-1">
                            <TrendingUp size={12} /> Positive
                        </span>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <p className="text-xs uppercase text-gray-400 font-bold mb-1">Avg Conceded / Match</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-display font-bold text-white">
                            {stats?.avgConceded.toFixed(1) || '0.0'}
                        </span>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <p className="text-xs uppercase text-gray-400 font-bold mb-1">Clean Sheets</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-display font-bold text-blue-400">
                            {teamPlayers.reduce((acc, p) => acc + (p.cleanSheets || 0), 0)}
                        </span>
                        <span className="text-xs text-gray-500 font-bold mb-1 truncate">Total squad total</span>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <p className="text-xs uppercase text-gray-400 font-bold mb-1">Team Efficiency</p>
                    <div className="relative pt-4">
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats?.winRate || 0}%` }}
                                className="h-full bg-elkawera-accent"
                            />
                        </div>
                        <p className="text-[10px] text-right mt-1 text-gray-400 font-bold">{stats?.winRate.toFixed(0)}% WIN PERCENTAGE</p>
                    </div>
                </div>
            </div>

            {/* Players Statistics Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden"
            >
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <BarChart3 className="text-blue-400" size={24} />
                        Squad Performance Deep-Dive
                    </h3>
                    <div className="text-xs text-gray-400 font-bold uppercase">{teamPlayers.length} Active Players</div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Player</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Pos</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Rating</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">MP</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">G</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">A</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">CS</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center flex items-center gap-1">
                                    Def <InfoIcon />
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {teamPlayers.sort((a, b) => b.overallScore - a.overallScore).map(p => (
                                <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-black overflow-hidden border border-white/10">
                                                {p.imageUrl ? (
                                                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                                ) : <User size={16} className="m-auto mt-2 text-gray-500" />}
                                            </div>
                                            <span className="font-bold text-sm text-white group-hover:text-elkawera-accent transition-colors">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-bold text-gray-400 uppercase">{p.position}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            <div className={`w-2 h-2 rounded-full ${p.overallScore >= 80 ? 'bg-elkawera-accent' : p.overallScore >= 70 ? 'bg-yellow-400' : 'bg-gray-400'}`} />
                                            <span className="font-display font-black text-white">{p.overallScore}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-sm text-gray-300">{p.matchesPlayed}</td>
                                    <td className="px-6 py-4 text-center font-bold text-sm text-white">{p.goals}</td>
                                    <td className="px-6 py-4 text-center font-bold text-sm text-white">{p.assists}</td>
                                    <td className="px-6 py-4 text-center font-bold text-sm text-blue-400">{p.cleanSheets}</td>
                                    <td className="px-6 py-4 text-center font-bold text-sm text-purple-400">{p.defensiveContributions}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>


        </div>
    );
};

const InfoIcon = () => (
    <div className="w-3 h-3 rounded-full border border-gray-500 text-[8px] flex items-center justify-center cursor-help" title="Defensive Contributions include tackles, interceptions, and blocks.">?</div>
);

