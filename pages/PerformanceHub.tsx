import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { getPlayerById, getAllMatches, getAllTeams, getUserById } from '../utils/db';
import { Player, Match, Team } from '../types';
import { motion } from 'framer-motion';
import {
    TrendingUp, Activity, Trophy, Target, Shield, Zap, Calendar,
    BarChart3, Award, Flame, Star, User, ArrowLeft, Bell
} from 'lucide-react';
import { RadarChart } from '../components/RadarChart';
import { StatComparison } from '../components/StatComparison';
import { AchievementBadge, Achievement } from '../components/AchievementBadge';
import { MatchTimeline } from '../components/MatchTimeline';
import { LineChart, Line, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

export const PerformanceHub: React.FC = () => {
    const { user } = useAuth();
    const { t, dir } = useSettings();
    const navigate = useNavigate();

    const [player, setPlayer] = useState<Player | null>(null);
    const [previousPlayer, setPreviousPlayer] = useState<Player | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!user?.playerCardId) {
                setLoading(false);
                return;
            }

            try {
                const [playerData, matchesData, teamsData] = await Promise.all([
                    getPlayerById(user.playerCardId),
                    getAllMatches(),
                    getAllTeams()
                ]);

                if (playerData) {
                    // Store previous state for comparison (in real app, this would come from history)
                    setPreviousPlayer({
                        ...playerData,
                        goals: Math.max(0, playerData.goals - 2),
                        assists: Math.max(0, playerData.assists - 1),
                        overallScore: Math.max(50, playerData.overallScore - 3)
                    });
                    setPlayer(playerData);
                }
                setMatches(matchesData);
                setTeams(teamsData);
            } catch (error) {
                console.error('Error loading performance data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    // Calculate player matches and stats
    const playerMatches = useMemo(() => {
        if (!player) return [];
        return matches.filter(m =>
            m.status === 'finished' &&
            (m.homePlayerIds.includes(player.id) || m.awayPlayerIds.includes(player.id))
        ).sort((a, b) => (a.finishedAt || 0) - (b.finishedAt || 0));
    }, [matches, player]);

    const stats = useMemo(() => {
        if (!player) return null;

        let wins = 0;
        let draws = 0;
        let losses = 0;

        const matchHistory = playerMatches.map(match => {
            const isHome = match.homePlayerIds.includes(player.id);
            const teamScore = isHome ? match.homeScore : match.awayScore;
            const opponentScore = isHome ? match.awayScore : match.homeScore;
            const opponentId = isHome ? match.awayTeamId : match.homeTeamId;

            let result: 'W' | 'D' | 'L' = 'D';
            if (teamScore > opponentScore) { wins++; result = 'W'; }
            else if (teamScore < opponentScore) { losses++; result = 'L'; }
            else { draws++; }

            const playerEvents = match.events.filter(e => e.playerId === player.id);
            const goals = playerEvents.filter(e => e.type === 'goal').length;
            const assists = playerEvents.filter(e => e.type === 'assist').length;
            const cleanSheet = playerEvents.some(e => e.type === 'clean_sheet');
            const saves = playerEvents.filter(e => e.type === 'save').length;

            const rating = 6 + (goals * 1) + (assists * 0.5) + (cleanSheet ? 1 : 0);

            return {
                date: match.finishedAt || 0,
                goals,
                assists,
                rating,
                result,
                opponent: teams.find(t => t.id === opponentId)?.shortName || 'OPP',
                score: `${teamScore}-${opponentScore}`
            };
        });

        const totalMatches = playerMatches.length;
        const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;
        const formGuide = matchHistory.slice(-5).map(m => m.result);

        return {
            wins,
            draws,
            losses,
            totalMatches,
            winRate,
            formGuide,
            matchHistory
        };
    }, [player, playerMatches, teams]);

    // Radar chart data
    const radarData = useMemo(() => {
        if (!player || !stats) return [];

        const goalsPerMatch = stats.totalMatches > 0 ? (player.goals / stats.totalMatches) * 20 : 0;
        const assistsPerMatch = stats.totalMatches > 0 ? (player.assists / stats.totalMatches) * 20 : 0;
        const defenseScore = stats.totalMatches > 0 ? (player.defensiveContributions / stats.totalMatches) * 15 : 0;

        return [
            { category: 'Attacking', value: Math.min(100, goalsPerMatch * 5 + 30), fullMark: 100 },
            { category: 'Playmaking', value: Math.min(100, assistsPerMatch * 5 + 30), fullMark: 100 },
            { category: 'Defending', value: Math.min(100, defenseScore * 3 + 40), fullMark: 100 },
            { category: 'Physical', value: Math.min(100, (player.overallScore * 0.8)), fullMark: 100 },
            { category: 'Mental', value: Math.min(100, stats.winRate), fullMark: 100 },
            { category: 'Consistency', value: Math.min(100, (stats.totalMatches * 2) + 20), fullMark: 100 }
        ];
    }, [player, stats]);

    // Achievements
    const achievements: Achievement[] = useMemo(() => {
        if (!player || !stats) return [];

        return [
            {
                id: 'first_goal',
                title: 'First Blood',
                description: 'Score your first goal',
                icon: 'trophy',
                unlocked: player.goals > 0,
                unlockedAt: player.goals > 0 ? Date.now() - 1000000 : undefined,
                requirement: 'Score 1 goal'
            },
            {
                id: 'hat_trick',
                title: 'Hat Trick Hero',
                description: 'Score 3+ goals in a single match',
                icon: 'flame',
                unlocked: false,
                progress: 33,
                requirement: 'Score 3 goals in one match'
            },
            {
                id: 'ten_matches',
                title: 'Veteran',
                description: 'Play 10 matches',
                icon: 'shield',
                unlocked: stats.totalMatches >= 10,
                unlockedAt: stats.totalMatches >= 10 ? Date.now() - 500000 : undefined,
                progress: Math.min(100, (stats.totalMatches / 10) * 100),
                requirement: `Play ${10 - stats.totalMatches} more matches`
            },
            {
                id: 'win_streak',
                title: 'Unstoppable',
                description: 'Win 5 matches in a row',
                icon: 'zap',
                unlocked: false,
                progress: 40,
                requirement: 'Win 5 consecutive matches'
            },
            {
                id: 'assist_master',
                title: 'Playmaker',
                description: 'Provide 10 assists',
                icon: 'target',
                unlocked: player.assists >= 10,
                unlockedAt: player.assists >= 10 ? Date.now() - 300000 : undefined,
                progress: Math.min(100, (player.assists / 10) * 100),
                requirement: `Provide ${10 - player.assists} more assists`
            },
            {
                id: 'clean_sheet',
                title: 'Defensive Wall',
                description: 'Keep 5 clean sheets',
                icon: 'shield',
                unlocked: player.cleanSheets >= 5,
                unlockedAt: player.cleanSheets >= 5 ? Date.now() - 200000 : undefined,
                progress: Math.min(100, (player.cleanSheets / 5) * 100),
                requirement: `Keep ${5 - player.cleanSheets} more clean sheets`
            },
            {
                id: 'elite_card',
                title: 'Elite Status',
                description: 'Reach Elite card tier',
                icon: 'crown',
                unlocked: player.cardType === 'Elite' || player.cardType === 'Platinum',
                unlockedAt: player.cardType === 'Elite' || player.cardType === 'Platinum' ? Date.now() - 100000 : undefined,
                requirement: 'Reach Elite card tier'
            },
            {
                id: 'mvp',
                title: 'Man of the Match',
                description: 'Be awarded MVP in a match',
                icon: 'star',
                unlocked: false,
                progress: 0,
                requirement: 'Be selected as Man of the Match'
            }
        ];
    }, [player, stats]);

    // Match timeline data
    const timelineMatches = useMemo(() => {
        if (!stats) return [];
        return stats.matchHistory.map((m, idx) => ({
            id: `match-${idx}`,
            date: m.date,
            opponent: m.opponent,
            result: m.result,
            score: m.score,
            playerStats: {
                goals: m.goals,
                assists: m.assists,
                rating: m.rating
            }
        }));
    }, [stats]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-elkawera-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading your performance data...</p>
                </div>
            </div>
        );
    }

    if (!player) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <User size={64} className="text-gray-600 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">No Player Card Found</h2>
                <p className="text-gray-400 mb-6">You need a player card to view your performance statistics.</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 bg-elkawera-accent text-black font-bold rounded-full hover:bg-white transition-all"
                >
                    Go to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20" dir={dir}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm">Back to Dashboard</span>
                    </button>
                    <h1 className="text-4xl font-display font-bold uppercase tracking-tight text-white">
                        Performance Hub
                    </h1>
                    <p className="text-gray-400 mt-2">Your complete performance analytics and statistics</p>
                </div>
                <Bell className="text-gray-500" size={24} />
            </motion.div>

            {/* Hero Section - Player Summary */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-8 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-elkawera-accent/10 rounded-full blur-3xl" />
                <div className="relative flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-black border-4 border-elkawera-accent/30 flex items-center justify-center overflow-hidden">
                        {player.imageUrl ? (
                            <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover" />
                        ) : (
                            <User size={40} className="text-white" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-3xl font-display font-bold text-white mb-1">{player.name}</h2>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                                <Shield size={16} />
                                {player.position}
                            </span>
                            <span>•</span>
                            <span className="capitalize">{player.cardType} Card</span>
                            {player.teamId && (
                                <>
                                    <span>•</span>
                                    <span>{teams.find(t => t.id === player.teamId)?.name || 'Free Agent'}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">Overall Rating</div>
                        <div className="text-5xl font-display font-black text-elkawera-accent">
                            {player.overallScore}
                        </div>
                        {previousPlayer && player.overallScore > previousPlayer.overallScore && (
                            <div className="text-sm text-green-400 font-bold flex items-center justify-end gap-1 mt-1">
                                <TrendingUp size={16} />
                                +{player.overallScore - previousPlayer.overallScore}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                >
                    <div className="flex items-center justify-between mb-3">
                        <Activity className="text-blue-400" size={24} />
                    </div>
                    <div className="text-3xl font-display font-bold text-white mb-1">{stats?.totalMatches || 0}</div>
                    <div className="text-xs uppercase text-gray-400 font-bold tracking-wider">Matches Played</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                >
                    <div className="flex items-center justify-between mb-3">
                        <Trophy className="text-yellow-400" size={24} />
                    </div>
                    <div className="text-3xl font-display font-bold text-white mb-1">
                        {stats?.winRate.toFixed(0) || 0}%
                    </div>
                    <div className="text-xs uppercase text-gray-400 font-bold tracking-wider">Win Rate</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                >
                    <div className="flex items-center justify-between mb-3">
                        <Target className="text-green-400" size={24} />
                    </div>
                    <div className="text-3xl font-display font-bold text-white mb-1">{player.goals}</div>
                    <div className="text-xs uppercase text-gray-400 font-bold tracking-wider">Career Goals</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                >
                    <div className="flex items-center justify-between mb-3">
                        <TrendingUp className="text-purple-400" size={24} />
                    </div>
                    <div className="flex gap-1">
                        {stats?.formGuide && stats.formGuide.length > 0 ? (
                            stats.formGuide.map((result, i) => (
                                <span
                                    key={i}
                                    className={`text-xs font-bold px-2 py-1 rounded ${
                                        result === 'W' ? 'bg-green-500 text-black' :
                                        result === 'D' ? 'bg-gray-500 text-white' :
                                        'bg-red-500 text-white'
                                    }`}
                                >
                                    {result}
                                </span>
                            ))
                        ) : (
                            <span className="text-gray-600">-</span>
                        )}
                    </div>
                    <div className="text-xs uppercase text-gray-400 font-bold tracking-wider mt-2">Recent Form</div>
                </motion.div>
            </div>

            {/* Last Match Impact - Comparison Cards */}
            {previousPlayer && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Zap className="text-elkawera-accent" size={24} />
                        Performance Changes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatComparison
                            label="Goals"
                            icon={<Trophy size={16} />}
                            oldValue={previousPlayer.goals}
                            newValue={player.goals}
                        />
                        <StatComparison
                            label="Assists"
                            icon={<Target size={16} />}
                            oldValue={previousPlayer.assists}
                            newValue={player.assists}
                        />
                        <StatComparison
                            label="Overall Rating"
                            icon={<Star size={16} />}
                            oldValue={previousPlayer.overallScore}
                            newValue={player.overallScore}
                        />
                    </div>
                </motion.div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rating Over Time */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-6"
                >
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="text-blue-400" size={20} />
                        Rating Progression
                    </h3>
                    <div className="h-[250px]">
                        {stats && stats.matchHistory.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.matchHistory}>
                                    <defs>
                                        <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis
                                        dataKey="opponent"
                                        tick={{ fill: '#6b7280', fontSize: 10 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        domain={[0, 10]}
                                        tick={{ fill: '#6b7280', fontSize: 10 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#09090b',
                                            border: '1px solid #27272a',
                                            borderRadius: '12px',
                                            color: '#fff'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="rating"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRating)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                Not enough data
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Career Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-6"
                >
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Award className="text-yellow-400" size={20} />
                        Career Totals
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Goals</div>
                            <div className="text-4xl font-display font-black text-white">{player.goals}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Assists</div>
                            <div className="text-4xl font-display font-black text-white">{player.assists}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Clean Sheets</div>
                            <div className="text-4xl font-display font-black text-emerald-400">{player.cleanSheets}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Def. Actions</div>
                            <div className="text-4xl font-display font-black text-blue-400">{player.defensiveContributions}</div>
                        </div>
                        {player.position === 'GK' && (
                            <>
                                <div>
                                    <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Saves</div>
                                    <div className="text-4xl font-display font-black text-amber-400">{player.saves}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Penalty Saves</div>
                                    <div className="text-4xl font-display font-black text-red-400">{player.penaltySaves}</div>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Match History Timeline */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6"
            >
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Calendar className="text-blue-400" size={24} />
                    Match History
                </h3>
                <MatchTimeline matches={timelineMatches} maxItems={10} />
            </motion.div>

            {/* Achievements */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-8"
            >
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Award className="text-yellow-400" size={24} />
                    Achievements & Milestones
                </h3>
                <div className="flex flex-wrap gap-6 justify-center">
                    {achievements.map((achievement) => (
                        <AchievementBadge key={achievement.id} achievement={achievement} size="lg" />
                    ))}
                </div>
            </motion.div>
        </div>
    );
};
