import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { playersWithoutTeam, profileByIdEndpoint } from '@/types/APIs';
import {
    getAllTeams,
    saveTeam,
    getAllPlayers,
    getAllUsers,
    saveTeamInvitation,
    getPendingInvitationsForTeam,
    getTeamInvitations,
    updateInvitationStatus,
    deleteTeamInvitation, // Added
    getCaptainStats,
    subscribeToChanges,
    getPlayerById,
    savePlayer,
    getAllMatchRequests, // Added
    saveMatchRequest, // Added just in case
    rejectMatchRequest, // Added
    getPlayersByTeamId, // Added
    getMatchesByTeam, // Added
    createNotification, // Added
    confirmMatchRequestByOpponent // Added
} from '@/utils/db';
import { Team, Player, TeamInvitation, CaptainStats, User, MatchRequest, Match, TeamDTO, CaptainProfile } from '@/types'; // Added MatchRequest, Match
import { Users, PlusCircle, Send, Trophy, TrendingUp, Calendar, UserPlus, CheckCircle, XCircle, Upload, Shield, Award, Star, Edit3, Trash2, HelpCircle, BarChart3 } from 'lucide-react';
import { PlayerCard } from '@/components/PlayerCard';
import { showToast } from '@/components/Toast';
import { X, Check } from 'lucide-react';
import { on } from 'process';
import axios from 'axios';
import { AcceptMatchModal } from '@/components/AcceptMatchModal';
import { EditTeamModal } from '@/components/EditTeamModal';
import { CreateTeamModal } from '@/components/CreateTeamModal';
import { i } from 'framer-motion/client';

export const CaptainDashboard: React.FC = () => {
    // const { user } = useAuth();
    const user = JSON.parse(localStorage.getItem('profile'))
    console.log(user)
    const navigate = useNavigate();
;
    const [teams, setTeams] = useState<Team[]>([]);
    const [team, setTeam] = useState(user?.teamDTO);
    const [teamPlayers, setTeamPlayers] = useState(team?.teamPlayers);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [pendingInvitations, setPendingInvitations] = useState<TeamInvitation[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<MatchRequest[]>([]); // Added
    const [pastMatches, setPastMatches] = useState<Match[]>([]); // Added for Match History
    const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
    const [showEditTeamModal, setShowEditTeamModal] = useState(false);
    const [showAcceptMatchModal, setShowAcceptMatchModal] = useState(false); // Added
    const [selectedRequest, setSelectedRequest] = useState<MatchRequest | null>(null); // Added
    const [captainStats, setCaptainStats] = useState<any>(user.status);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [confirmingDeleteInvId, setConfirmingDeleteInvId] = useState<string | null>(null);
    const [confirmingRejectRequestId, setConfirmingRejectRequestId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    // const team = user?.teamDTO;
    // console.log(user , team , teamPlayers)
    // console.log('User TeamDTO:', teamm);
    // const teamPlayers = team?.teamPlayers || [];
    // Only captains can access
    useEffect(() => {
        
        if (user && user.role !== 'CAPTAIN' && user.role !== 'ADMIN') {
            navigate('/dashboard');
        }
        setLoading(false);
        

    }, [user, navigate]);
    document.title = `Captain ${user?.name} Dashboard - ELKAWERA`;
    const loadData = async () => { }

    if (loading) {
        return <div className="text-center py-20">Loading captain dashboard...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-4xl font-display font-bold uppercase tracking-tight">Captain Dashboard</h1>
                    <p className="text-gray-400 mt-1 text-sm sm:text-base">Manage your team and schedule matches</p>
                </div>
                {!team && (
                    <button
                        onClick={() => setShowCreateTeamModal(true)}
                        className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-elkawera-accent text-black font-bold rounded-full hover:bg-white transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(0,255,157,0.3)] text-sm sm:text-base w-full sm:w-auto"
                    >
                        <PlusCircle size={20} />
                        Create Team
                    </button>
                )}
            </div>

            {team ? (
                <>
                    {captainStats && (
                        <>
                            {/* Captain Rank Badge */}
                            <div className="bg-gradient-to-r from-yellow-500/20 via-elkawera-accent/20 to-blue-500/20 border border-elkawera-accent/30 rounded-2xl p-4 sm:p-6 mb-8">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-elkawera-accent/20 border-2 border-elkawera-accent flex items-center justify-center">
                                            <Shield size={24} className="text-elkawera-accent sm:size-32" />
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase text-gray-400 font-bold tracking-wider">Captain Rank</p>
                                            <h3 className="text-lg sm:text-2xl font-display font-bold text-elkawera-accent">{captainStats.overAll}</h3>
                                            <p className="text-xs sm:text-sm text-gray-400">{captainStats.overAllPoints} Rank Points</p>
                                        </div>
                                    </div>
                                    <div className="text-center sm:text-right">
                                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                                            <Trophy size={16} className="text-yellow-400" />
                                            <span className="text-sm text-gray-400">Record:</span>
                                            <span className="font-bold text-green-400">{captainStats.wins}W</span>
                                            <span className="font-bold text-gray-400">{captainStats.draws}D</span>
                                            <span className="font-bold text-red-400">{captainStats.losses}L</span>
                                        </div>

                                    </div>
                                </div>

                                {/* Rank Progress Bar */}
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                                        <span>Progress to Next Rank</span>
                                        <span>
                                            {captainStats.overAll === 'Bronze Captain' && '100 points for Silver'}
                                            {captainStats.overAll === 'Silver Captain' && '300 points for Gold'}
                                            {captainStats.overAll === 'Gold Captain' && '600 points for Elite'}
                                            {captainStats.overAll === 'Elite Captain' && '1000 points for Master'}
                                            {captainStats.overAll === 'Master Captain' && 'Max Rank Achieved!'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-black/30 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-elkawera-accent to-yellow-400 transition-all duration-500"
                                            style={{
                                                width: `${captainStats.overAll === 'Master Captain' ? 100 :
                                                    captainStats.overAll === 'Elite Captain' ? ((captainStats.overAllPoints - 600) / 400 * 100) :
                                                        captainStats.overAll === 'Gold Captain' ? ((captainStats.overAllPoints - 300) / 300 * 100) :
                                                            captainStats.overAll === 'Silver Captain' ? ((captainStats.overAllPoints - 100) / 200 * 100) :
                                                                (captainStats.overAllPoints / 100 * 100)}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Team Overview */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3 sm:gap-4">
                                {team.teamLogo && (
                                    <img src={team.teamLogo} alt={team.teamName} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-elkawera-accent" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-xl sm:text-3xl font-display font-bold truncate">{team.teamName}</h2>
                                    <p className="text-gray-400 text-sm sm:text-base">{team.teamAbbreviation}</p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => navigate('/captain/performance-hub')}
                                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-elkawera-accent text-black border border-elkawera-accent rounded-lg hover:bg-white hover:border-white transition-colors font-bold text-sm sm:text-base"
                                >
                                    <BarChart3 size={16} />
                                    <span className="hidden xs:inline">Performance Hub</span>
                                    <span className="xs:hidden">Hub</span>
                                </button>
                                <button
                                    onClick={() => setShowEditTeamModal(true)}
                                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-colors font-bold text-sm sm:text-base"
                                >
                                    <Edit3 size={16} />
                                    <span className="hidden xs:inline">Edit Team</span>
                                    <span className="xs:hidden">Edit</span>
                                </button>
                            </div>
                        </div>

                        {/* Team Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-black/30 rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-2 text-gray-400 mb-2">
                                    <Users size={16} />
                                    <span className="text-xs uppercase font-bold">Players</span>
                                </div>
                                <p className="text-3xl font-display font-bold">{teamPlayers.length}</p>
                            </div>
                            <div className="bg-black/30 rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-2 text-gray-400 mb-2">
                                    <TrendingUp size={16} />
                                    <span className="text-xs uppercase font-bold">XP</span>
                                </div>
                                <p className="text-3xl font-display font-bold text-elkawera-accent">{team?.experiencePoints || 0}</p>
                            </div>
                            <div className="bg-black/30 rounded-xl p-4 border border-white/10 relative group">
                                <div className="flex items-center gap-2 text-gray-400 mb-2">
                                    <Trophy size={16} />
                                    <span className="text-xs uppercase font-bold">Ranking</span>
                                    <HelpCircle size={12} className="cursor-help text-gray-500 hover:text-white transition-colors" />
                                </div>
                                <p className="text-3xl font-display font-bold text-yellow-400">#{captainStats.overAll || 'Unranked'}</p>

                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-black/90 border border-white/20 p-3 rounded text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                                    <div className="font-bold text-white mb-1">Global Team Ranking</div>
                                    Calculated based on total Team XP earned from matches, tournament wins, and clean sheets.
                                </div>
                            </div>
                            <div className="bg-black/30 rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-2 text-gray-400 mb-2">
                                    <Send size={16} />
                                    <span className="text-xs uppercase font-bold">Pending Invites</span>
                                </div>
                                <p className="text-3xl font-display font-bold">{pendingInvitations.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Pending Invitations */}
                    {pendingInvitations.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-2xl font-display font-bold uppercase">Pending Invitations</h3>
                            <div className="grid gap-4">
                                {pendingInvitations.map(invitation => (
                                    <div key={invitation.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between group hover:border-white/20 transition-all">
                                        <div>
                                            <p className="font-bold">{invitation.playerName}</p>
                                            <p className="text-sm text-gray-400">Invited {new Date(invitation.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {confirmingDeleteInvId === invitation.id ? (
                                                <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                                                    <span className="text-[10px] font-bold text-red-500 uppercase">Cancel?</span>
                                                    <button
                                                        onClick={async () => {
                                                            await deleteTeamInvitation(invitation.id);
                                                            showToast('Invitation cancelled', 'info');
                                                            setConfirmingDeleteInvId(null);
                                                            loadData();
                                                        }}
                                                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmingDeleteInvId(null)}
                                                        className="p-2 bg-white/10 text-gray-400 rounded-lg hover:bg-white/20 transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold uppercase">Pending</span>
                                                    <button
                                                        onClick={() => setConfirmingDeleteInvId(invitation.id)}
                                                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Cancel Invitation"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pending Match Requests (Challenges) */}
                    {incomingRequests.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-2xl font-display font-bold uppercase text-elkawera-accent flex items-center gap-2">
                                <Trophy size={24} />
                                Match Challenges Received
                            </h3>
                            <div className="grid gap-4">
                                {incomingRequests.map(req => (
                                    <div key={req.id} className="bg-gradient-to-r from-elkawera-accent/10 to-transparent border border-elkawera-accent/30 rounded-xl p-6 relative overflow-hidden">
                                        <div className="flex items-center justify-between z-10 relative">
                                            <div>
                                                <p className="text-xs font-bold text-elkawera-accent uppercase mb-1">Incoming Challenge</p>
                                                <h4 className="text-xl font-bold">{req.homeTeamName}</h4>
                                                <p className="text-sm text-gray-400">Challenged by Captain {req.requestedByName}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {confirmingRejectRequestId === req.id ? (
                                                    <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                                                        <span className="text-xs font-bold text-red-500 uppercase">Reject Match?</span>
                                                        <button
                                                            onClick={async () => {
                                                                await rejectMatchRequest(req.id, user!.id, 'Declined by captain');
                                                                showToast('Match challenge rejected', 'info');
                                                                setConfirmingRejectRequestId(null);
                                                                loadData();
                                                            }}
                                                            className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors text-xs"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmingRejectRequestId(null)}
                                                            className="px-4 py-2 bg-white/10 text-white rounded-lg font-bold hover:bg-white/20 transition-colors text-xs"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => setConfirmingRejectRequestId(req.id)}
                                                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-bold hover:bg-red-500/30 transition-colors"
                                                        >
                                                            Decline
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRequest(req);
                                                                setShowAcceptMatchModal(true);
                                                            }}
                                                            className="px-4 py-2 bg-elkawera-accent text-black rounded-lg font-bold hover:bg-white transition-colors flex items-center gap-2"
                                                        >
                                                            <CheckCircle size={16} />
                                                            Accept & Lineup
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}



                    {/* Match History */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-display font-bold uppercase">Match History</h3>
                        {pastMatches.length === 0 ? (
                            <div className="text-center py-8 bg-white/5 rounded-xl border border-dashed border-white/10 text-gray-500">
                                No matches played yet
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {pastMatches.map(match => {
                                    const isHome = match.homeTeamId === team.id;
                                    const opponentId = isHome ? match.awayTeamId : match.homeTeamId;
                                    const opponent = teams.find(t => t.id === opponentId);
                                    const myScore = isHome ? match.homeScore : match.awayScore;
                                    const opScore = isHome ? match.awayScore : match.homeScore;
                                    const result = myScore > opScore ? 'W' : myScore < opScore ? 'L' : 'D';
                                    const resultColor = result === 'W' ? 'text-green-400' : result === 'L' ? 'text-red-400' : 'text-yellow-400';

                                    return (
                                        <div key={match.id} className="bg-white/5 border border-white/10 rounded-xl p-6 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`text-2xl font-display font-bold ${resultColor}`}>{result}</div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase">vs {opponent?.name || 'Unknown'}</p>
                                                    <h4 className="text-xl font-bold">{myScore} - {opScore}</h4>
                                                    <p className="text-xs text-gray-500">{new Date(match.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            {match.isExternal && (
                                                <span className="px-2 py-1 bg-elkawera-accent/10 text-elkawera-accent rounded text-[10px] font-bold uppercase">Ranked Match</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>


                    {/* Team Roster */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-display font-bold uppercase">Team Roster</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {teamPlayers.map(player => (
                                <div
                                    key={player.playerId}
                                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 cursor-pointer transition-all group"
                                    onClick={async () => {
                                        const profile = await profileByIdEndpoint(player.playerId);
                                        console.log( profile)
                                        setSelectedPlayer(profile)
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-elkawera-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <span className="text-xl font-display font-bold">{player.status.TotalRank}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold group-hover:text-elkawera-accent transition-colors">{player.playerName}</p>
                                            <p className="text-sm text-gray-400">{player.playerPosition}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {teamPlayers.length === 0 && (
                                <div className="col-span-full text-center py-12 bg-white/5 rounded-xl border border-dashed border-white/10">
                                    <Users size={48} className="mx-auto text-gray-600 mb-4" />
                                    <p className="text-gray-400">No players in your team yet</p>
                                    <p className="text-sm text-gray-500 mt-2">Go to Team Management to invite players</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate('/teams')}
                            className="flex items-center justify-center gap-3 p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group col-span-full"
                        >
                            <Trophy size={24} className="text-yellow-400" />
                            <div className="text-left">
                                <p className="font-bold text-lg">View All Teams</p>
                                <p className="text-sm text-gray-400">See rankings and stats</p>
                            </div>
                        </button>
                    </div>
                </>
            ) : (
                <div className="text-center py-32 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <Users size={64} className="mx-auto text-gray-600 mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">No Team Yet</h3>
                    <p className="text-gray-400 mb-6">Create your team to start managing players and scheduling matches</p>
                    <button
                        onClick={() => setShowCreateTeamModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-elkawera-accent text-black font-bold rounded-full hover:bg-white transition-all"
                    >
                        <PlusCircle size={20} />
                        Create Team
                    </button>
                </div>
            )
            }

            {/* Create Team Modal */}
            {
                showCreateTeamModal && (
                    <CreateTeamModal
                        onClose={() => setShowCreateTeamModal(false)}
                        onCreated={() => {
                            setShowCreateTeamModal(false);
                            loadData();
                        }}
                    />
                )
            }


            {
                showEditTeamModal && team && (
                    <EditTeamModal
                        team={team}
                        players={teamPlayers}
                        allUsers={allUsers}
                        teams={teams}
                        onClose={() => setShowEditTeamModal(false)}
                        onUpdated={() => {
                            setShowEditTeamModal(false);
                            loadData();
                        }}
                    />
                )
            }

            {/* Accept Match Modal */}
            {
                showAcceptMatchModal && selectedRequest && team && (
                    <AcceptMatchModal
                        request={selectedRequest}
                        myTeam={team}
                        onClose={() => setShowAcceptMatchModal(false)}
                        onAccepted={() => {
                            setShowAcceptMatchModal(false);
                            loadData();
                        }}
                    />
                )
            }

            {/* Player Preview Modal */}
            {selectedPlayer && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedPlayer(null)}>
                    <div className="transform scale-100 transition-transform" onClick={e => e.stopPropagation()}>
                        <PlayerCard
                            player={selectedPlayer}
                            uniqueId={`preview-${selectedPlayer.playerId}`}
                            allowFlipClick={true}
                        />
                        <button
                            onClick={() => setSelectedPlayer(null)}
                            className="absolute -top-12 right-0 text-white hover:text-elkawera-accent transition-colors"
                        >
                            <XCircle size={32} />
                        </button>
                    </div>
                </div>
            )}
        </div >
    );
};

// =========================================================================================
// ============================== Create Team Modal Component ==============================
// =========================================================================================


// ===========================================================================================
// ============================== Invite Player Modal Component ==============================
// ===========================================================================================

// Invite Player Modal Component
// const InvitePlayerModal: React.FC<{
//     team: Team;
//     players: Player[];
//     allUsers: User[];
//     teams: Team[];
//     currentUserId: string;
//     onClose: () => void;
//     onInvited: () => void;
// }> = ({ team, players, allUsers, teams, currentUserId, onClose, onInvited }) => {
//     const { user } = useAuth();
//     const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
//     const [sending, setSending] = useState(false);

//     // Filter out current user (captain) and all other captains
//     // Also filter out users who are already in THIS team (as captain or player)
//     // But we want to show users from OTHER teams with their club name
//     const availableUsers = allUsers.filter(u => {
//         if (u.id === currentUserId) return false; // Don't show self
//         if (u.role === 'CAPTAIN') return false; // Don't show any captains

//         // Check if user is already in this team
//         // 1. Is he the captain? (Already filtered by role check above)
//         if (team.captainId === u.id) return false;

//         // 2. Is he a player in this team?
//         const playerCard = players.find(p => p.id === u.playerCardId);
//         if (playerCard && playerCard.teamId === team.id) return false;

//         return true;
//     });

//     const getUserStatus = (u: User) => {
//         if (u.role === 'ADMIN') return { label: 'Admin', color: 'text-red-400', bg: 'bg-red-500/20' };

//         // Check if captain of another team
//         const captainOfTeam = teams.find(t => t.captainId === u.id);
//         if (captainOfTeam) return { label: captainOfTeam.name, color: 'text-elkawera-accent', bg: 'bg-elkawera-accent/20' };

//         // Check if player in another team
//         const playerCard = players.find(p => p.id === u.playerCardId);
//         if (playerCard && playerCard.teamId) {
//             const teamName = teams.find(t => t.id === playerCard.teamId)?.name;
//             if (teamName) return { label: teamName, color: 'text-blue-400', bg: 'bg-blue-500/20' };
//         }

//         return null; // Free agent
//     };

//     const handleSend = async () => {
//         if (selectedUsers.length === 0) {
//             showToast('Please select at least one player', 'error');
//             return;
//         }

//         setSending(true);

//         try {
//             for (const userId of selectedUsers) {
//                 const targetUser = allUsers.find(u => u.id === userId);
//                 if (!targetUser) continue;

//                 const invitation: TeamInvitation = {
//                     id: uuidv4(),
//                     teamId: team.id,
//                     playerId: userId, // Send to User ID
//                     playerName: targetUser.name,
//                     invitedBy: user?.id || '',
//                     captainName: user?.name || '',
//                     teamName: team.name,
//                     status: 'pending',
//                     createdAt: Date.now(),
//                 };

//                 await saveTeamInvitation(invitation);
//             }

//             onInvited();
//             showToast('Invitations sent successfully', 'success');
//         } catch (error) {
//             console.error('Error sending invitations:', error);
//             showToast('Failed to send invitations', 'error');
//         } finally {
//             setSending(false);
//         }
//     };

//     return createPortal(
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//             <div className="bg-elkawera-dark border border-white/20 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8">
//                 <div className="flex justify-between items-center mb-6">
//                     <h2 className="text-3xl font-display font-bold uppercase">Invite Players</h2>
//                     <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
//                         <XCircle size={24} />
//                     </button>
//                 </div>

//                 <p className="text-gray-400 mb-4">Select players to invite to {team.name}</p>

//                 <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
//                     {availableUsers.map(u => {
//                         const status = getUserStatus(u);
//                         const playerCard = players.find(p => p.id === u.playerCardId);
//                         const overall = playerCard ? playerCard.overallScore : '-';

//                         return (
//                             <label
//                                 key={u.id}
//                                 className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
//                             >
//                                 <input
//                                     type="checkbox"
//                                     checked={selectedUsers.includes(u.id)}
//                                     onChange={(e) => {
//                                         if (e.target.checked) {
//                                             setSelectedUsers([...selectedUsers, u.id]);
//                                         } else {
//                                             setSelectedUsers(selectedUsers.filter(id => id !== u.id));
//                                         }
//                                     }}
//                                     className="w-5 h-5 accent-elkawera-accent"
//                                 />
//                                 <div className="w-10 h-10 rounded-full bg-elkawera-accent/20 flex items-center justify-center flex-shrink-0">
//                                     <span className="text-sm font-display font-bold">{overall}</span>
//                                 </div>
//                                 <div className="flex-1 min-w-0">
//                                     <div className="flex items-center gap-2">
//                                         <p className="font-bold truncate">{u.name}</p>
//                                         {status && (
//                                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${status.bg} ${status.color}`}>
//                                                 {status.label}
//                                             </span>
//                                         )}
//                                     </div>
//                                     <p className="text-sm text-gray-400 truncate">{u.email}</p>
//                                 </div>
//                             </label>
//                         );
//                     })}
//                     {availableUsers.length === 0 && (
//                         <p className="text-center text-gray-500 py-8">No available players to invite</p>
//                     )}
//                 </div>

//                 <div className="flex gap-4">
//                     <button
//                         onClick={onClose}
//                         className="flex-1 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors font-bold"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         onClick={handleSend}
//                         disabled={sending || selectedUsers.length === 0}
//                         className="flex-1 py-3 bg-elkawera-accent text-black rounded-lg hover:bg-white transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                     >
//                         {sending ? (
//                             <>
//                                 <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
//                                 Sending...
//                             </>
//                         ) : (
//                             <>
//                                 <Send size={20} />
//                                 Send {selectedUsers.length} Invitation{selectedUsers.length !== 1 ? 's' : ''}
//                             </>
//                         )}
//                     </button>
//                 </div>
//             </div>
//         </div>,
//         document.body
//     );
// };

// =======================================================================================
// ============================== Edit Team Modal Component ==============================
// =======================================================================================



// ==========================================================================================
// ============================== Accept Match Modal Component ==============================
// ==========================================================================================
