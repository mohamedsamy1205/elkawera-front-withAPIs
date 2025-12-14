import React, { useEffect, useState } from 'react';
import { getAllMatches, getAllTeams, getPlayerById } from '../utils/db';
import { Match, Team } from '../types';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, Users, Award, TrendingUp, ArrowLeft } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const MatchResults: React.FC = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [teams, setTeams] = useState<Record<string, Team>>({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { t, dir } = useSettings();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [allMatches, allTeams] = await Promise.all([
                getAllMatches(),
                getAllTeams()
            ]);

            // Filter only completed matches (those with scores)
            const completedMatches = allMatches.filter(m =>
                m.homeScore !== undefined &&
                m.awayScore !== undefined &&
                m.status === 'finished'
            );

            // Sort by date (most recent first)
            completedMatches.sort((a, b) => b.createdAt - a.createdAt);

            setMatches(completedMatches);

            // Create teams lookup
            const teamsMap: Record<string, Team> = {};
            allTeams.forEach(team => teamsMap[team.id] = team);
            setTeams(teamsMap);

            setLoading(false);
        } catch (error) {
            console.error('Error loading match results:', error);
            setLoading(false);
        }
    };

    const getMatchResult = (match: Match, teamId: string) => {
        const isHome = match.homeTeamId === teamId;
        const myScore = isHome ? match.homeScore : match.awayScore;
        const opponentScore = isHome ? match.awayScore : match.homeScore;

        if (myScore === undefined || opponentScore === undefined) return 'N/A';
        if (myScore > opponentScore) return 'W';
        if (myScore < opponentScore) return 'L';
        return 'D';
    };

    if (loading) {
        return (
            <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-elkawera-accent"></div>
                <p className="mt-4 text-[var(--text-secondary)]">Loading match results...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8" dir={dir}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-4xl font-display font-bold uppercase tracking-tight text-[var(--text-primary)]">
                            Match Results
                        </h1>
                        <p className="text-[var(--text-secondary)] mt-1">
                            View all completed matches and their results
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-elkawera-accent/10 border border-elkawera-accent/30 rounded-full">
                    <Trophy className="text-elkawera-accent" size={20} />
                    <span className="text-elkawera-accent font-bold">{matches.length} Matches</span>
                </div>
            </div>

            {/* Matches List */}
            {matches.length === 0 ? (
                <div className="text-center py-32 bg-[var(--bg-secondary)] rounded-3xl border border-dashed border-[var(--border-color)]">
                    <Trophy size={64} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">No Matches Yet</h3>
                    <p className="text-[var(--text-secondary)]">Completed matches will appear here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {matches.map(match => {
                        const homeTeam = teams[match.homeTeamId];
                        const awayTeam = teams[match.awayTeamId];
                        const homeWon = (match.homeScore || 0) > (match.awayScore || 0);
                        const awayWon = (match.awayScore || 0) > (match.homeScore || 0);
                        const isDraw = match.homeScore === match.awayScore;

                        return (
                            <div
                                key={match.id}
                                className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 hover:border-elkawera-accent/50 transition-all group"
                            >
                                {/* Match Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                        <Calendar size={16} />
                                        <span>{new Date(match.createdAt).toLocaleDateString()}</span>
                                        {match.isExternal && (
                                            <span className="px-2 py-0.5 bg-elkawera-accent/10 text-elkawera-accent rounded text-xs font-bold uppercase">
                                                Ranked
                                            </span>
                                        )}
                                    </div>
                                    {match.mvpId && (
                                        <div className="flex items-center gap-2 text-sm text-yellow-400">
                                            <Award size={16} />
                                            <span className="font-bold">MVP</span>
                                        </div>
                                    )}
                                </div>

                                {/* Teams and Score */}
                                <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
                                    {/* Home Team */}
                                    <div className={`text-right ${homeWon ? 'opacity-100' : 'opacity-60'}`}>
                                        <div className="flex items-center justify-end gap-3 mb-2">
                                            {homeTeam?.logoUrl && (
                                                <img
                                                    src={homeTeam.logoUrl}
                                                    alt={homeTeam.name}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-elkawera-accent"
                                                />
                                            )}
                                            <div>
                                                <h3 className="text-xl font-display font-bold text-[var(--text-primary)]">
                                                    {homeTeam?.name || 'Unknown Team'}
                                                </h3>
                                                <p className="text-sm text-[var(--text-secondary)]">
                                                    {homeTeam?.shortName || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Score */}
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-4">
                                            <div className={`text-5xl font-display font-bold ${homeWon ? 'text-elkawera-accent' : isDraw ? 'text-yellow-400' : 'text-[var(--text-secondary)]'}`}>
                                                {match.homeScore ?? 0}
                                            </div>
                                            <div className="text-2xl font-bold text-[var(--text-secondary)]">-</div>
                                            <div className={`text-5xl font-display font-bold ${awayWon ? 'text-elkawera-accent' : isDraw ? 'text-yellow-400' : 'text-[var(--text-secondary)]'}`}>
                                                {match.awayScore ?? 0}
                                            </div>
                                        </div>
                                        {isDraw && (
                                            <span className="mt-2 px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-xs font-bold uppercase">
                                                Draw
                                            </span>
                                        )}
                                    </div>

                                    {/* Away Team */}
                                    <div className={`text-left ${awayWon ? 'opacity-100' : 'opacity-60'}`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div>
                                                <h3 className="text-xl font-display font-bold text-[var(--text-primary)]">
                                                    {awayTeam?.name || 'Unknown Team'}
                                                </h3>
                                                <p className="text-sm text-[var(--text-secondary)]">
                                                    {awayTeam?.shortName || 'N/A'}
                                                </p>
                                            </div>
                                            {awayTeam?.logoUrl && (
                                                <img
                                                    src={awayTeam.logoUrl}
                                                    alt={awayTeam.name}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-elkawera-accent"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Match Stats */}
                                {(match.homeTeamLineup || match.awayTeamLineup) && (
                                    <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-center gap-8 text-sm text-[var(--text-secondary)]">
                                        <div className="flex items-center gap-2">
                                            <Users size={16} />
                                            <span>
                                                {match.homeTeamLineup?.length || 0} vs {match.awayTeamLineup?.length || 0} players
                                            </span>
                                        </div>
                                        {match.mvpId && (
                                            <div className="flex items-center gap-2 text-yellow-400">
                                                <Award size={16} />
                                                <span className="font-bold">Man of the Match</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Statistics Summary */}
            {matches.length > 0 && (
                <div className="bg-gradient-to-r from-elkawera-accent/10 to-transparent border border-elkawera-accent/30 rounded-2xl p-6">
                    <h3 className="text-xl font-display font-bold uppercase mb-4 flex items-center gap-2">
                        <TrendingUp className="text-elkawera-accent" size={24} />
                        Season Statistics
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-3xl font-display font-bold text-elkawera-accent">
                                {matches.length}
                            </div>
                            <div className="text-sm text-[var(--text-secondary)] uppercase">Total Matches</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-display font-bold text-[var(--text-primary)]">
                                {matches.reduce((sum, m) => sum + (m.homeScore || 0) + (m.awayScore || 0), 0)}
                            </div>
                            <div className="text-sm text-[var(--text-secondary)] uppercase">Total Goals</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-display font-bold text-[var(--text-primary)]">
                                {(matches.reduce((sum, m) => sum + (m.homeScore || 0) + (m.awayScore || 0), 0) / matches.length).toFixed(1)}
                            </div>
                            <div className="text-sm text-[var(--text-secondary)] uppercase">Avg Goals/Match</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-display font-bold text-yellow-400">
                                {matches.filter(m => m.homeScore === m.awayScore).length}
                            </div>
                            <div className="text-sm text-[var(--text-secondary)] uppercase">Draws</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
