import React, { useState, useEffect } from 'react';
import { User, Team } from '../types';
import { getAllUsers, saveTeamInvitation, getTeamById, getPlayersByTeamId } from '../utils/db';
import { PlayerSearchDropdown } from './PlayerSearchDropdown';
import { X, Send, Users as UsersIcon, Shield, User as UserIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface InvitePlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: string;
    teamName: string;
    captainId: string;
    captainName: string;
    currentPlayerCount: number;
    onInviteSent: () => void;
}

export const InvitePlayerModal: React.FC<InvitePlayerModalProps> = ({
    isOpen,
    onClose,
    teamId,
    teamName,
    captainId,
    captainName,
    currentPlayerCount,
    onInviteSent
}) => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            loadUsers();
        }
    }, [isOpen]);

    const loadUsers = async () => {
        const [allUsers, teamPlayers] = await Promise.all([
            getAllUsers(),
            getPlayersByTeamId(teamId)
        ]);

        // Get IDs of players currently in the team
        // We match them to Users via playerCardId
        const teamPlayerCardIds = teamPlayers.map(p => p.id);

        const filteredUsers = allUsers.filter(u => {
            // Filter out captain
            if (u.id === captainId) return false;

            // Filter out users who are already in this team
            if (u.playerCardId && teamPlayerCardIds.includes(u.playerCardId)) return false;

            return true;
        });

        setUsers(filteredUsers);
    };

    const handleSendInvitation = async () => {
        if (!selectedUserId) {
            setError('Please select a player to invite');
            return;
        }

        // Check if team is already at max capacity
        if (currentPlayerCount >= 7) {
            setError('Team is at maximum capacity (7 players)');
            return;
        }

        setSending(true);
        setError('');

        try {
            const selectedUser = users.find(u => u.id === selectedUserId);
            if (!selectedUser) {
                setError('Selected user not found');
                return;
            }

            const invitation = {
                id: uuidv4(),
                teamId,
                playerId: selectedUserId,
                playerName: selectedUser.name,
                invitedBy: captainId,
                captainName,
                teamName,
                status: 'pending' as const,
                createdAt: Date.now()
            };

            await saveTeamInvitation(invitation);

            onInviteSent();
            onClose();
            setSelectedUserId('');
        } catch (err) {
            setError('Failed to send invitation. Please try again.');
            console.error('Error sending invitation:', err);
        } finally {
            setSending(false);
        }
    };

    const getUserDisplayInfo = (user: User): { label: string; badge: string; badgeColor: string } => {
        if (user.role === 'admin') {
            return {
                label: user.name,
                badge: 'Admin',
                badgeColor: 'bg-red-500/20 text-red-400'
            };
        }

        if (user.role === 'captain') {
            return {
                label: user.name,
                badge: 'Captain',
                badgeColor: 'bg-yellow-500/20 text-yellow-400'
            };
        }

        // For regular players, check if they have a team
        // This would require additional logic to check player cards and team associations
        // For now, we'll just show them as "Player"
        return {
            label: user.name,
            badge: 'Player',
            badgeColor: 'bg-blue-500/20 text-blue-400'
        };
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-white/20 rounded-3xl max-w-lg w-full p-8 shadow-2xl animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-elkawera-accent/20 flex items-center justify-center">
                            <UsersIcon className="text-elkawera-accent" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-display font-bold uppercase">Invite Player</h2>
                            <p className="text-sm text-gray-400">Add a player to {teamName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Team Info */}
                <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <UsersIcon size={16} />
                            <span>Current Squad Size:</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-xl font-bold ${currentPlayerCount < 3 ? 'text-red-400' :
                                currentPlayerCount >= 7 ? 'text-yellow-400' :
                                    'text-elkawera-accent'
                                }`}>
                                {currentPlayerCount}
                            </span>
                            <span className="text-gray-500">/</span>
                            <span className="text-gray-400">7</span>
                        </div>
                    </div>
                    {currentPlayerCount < 3 && (
                        <p className="text-xs text-red-400 mt-2">⚠️ Minimum 3 players required to schedule matches</p>
                    )}
                    {currentPlayerCount >= 7 && (
                        <p className="text-xs text-yellow-400 mt-2">⚠️ Team is at maximum capacity</p>
                    )}
                </div>

                {/* Player Selection */}
                <div className="mb-6">
                    <label className="block text-xs uppercase text-gray-400 mb-3 font-bold">Select Player</label>
                    <div className="space-y-3">
                        {users.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <UserIcon size={48} className="mx-auto mb-3 opacity-30" />
                                <p>No players available to invite</p>
                            </div>
                        ) : (
                            <div className="max-h-64 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                                {users.map((user) => {
                                    const { label, badge, badgeColor } = getUserDisplayInfo(user);
                                    const isSelected = selectedUserId === user.id;

                                    return (
                                        <button
                                            key={user.id}
                                            onClick={() => setSelectedUserId(user.id)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 ${isSelected
                                                ? 'bg-elkawera-accent/20 border-elkawera-accent shadow-[0_0_20px_rgba(0,255,157,0.2)]'
                                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center ${isSelected ? 'bg-elkawera-accent/30 ring-2 ring-elkawera-accent' : 'bg-white/10'
                                                }`}>
                                                {user.profileImageUrl ? (
                                                    <img src={user.profileImageUrl} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon size={20} className={isSelected ? 'text-elkawera-accent' : 'text-gray-400'} />
                                                )}
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <div className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                                                    {label}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${badgeColor}`}>
                                                        {badge}
                                                    </span>
                                                    {user.position && (
                                                        <span className="text-xs text-gray-500">{user.position}</span>
                                                    )}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="w-6 h-6 rounded-full bg-elkawera-accent flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors font-bold text-gray-300"
                        disabled={sending}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSendInvitation}
                        disabled={!selectedUserId || sending || currentPlayerCount >= 7}
                        className="flex-1 px-6 py-3 rounded-xl bg-elkawera-accent text-black font-bold hover:bg-white transition-all shadow-[0_0_20px_rgba(0,255,157,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {sending ? (
                            <>
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                Send Invitation
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
