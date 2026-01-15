import React, { useState, useEffect } from 'react';
import { User, Team, Position } from '@/types';
import { getAllUsers, saveTeamInvitation, getTeamById, getPlayersByTeamId, getAllPlayers } from '@/utils/db';
import { PlayerSearchDropdown } from './PlayerSearchDropdown';
import { X, Send, Users as UsersIcon, Shield, User as UserIcon, Filter, Search } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { showToast } from './Toast';

interface InvitePlayerModalProps {
    isOpen: boolean;
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
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    // Filters
    const [positionFilter, setPositionFilter] = useState<'ALL' | Position>('ALL');

    useEffect(() => {
        if (isOpen) {
            setUsers([]);
            setFilteredUsers([]);
            setSearchTerm('');
            setPositionFilter('ALL');
            setSelectedUserIds([]);
            loadUsers();
        }
    }, [isOpen]);

    const loadUsers = async () => {
        try {
            const [allUsers, allPlayers] = await Promise.all([
                getAllUsers(),
                getAllPlayers()
            ]);

            console.log('🔍 InvitePlayerModal Debug:');
            console.log('Total users:', allUsers.length);
            console.log('Total players:', allPlayers.length);

            // Create a map of player card positions for quick lookup
            const playerCardMap = new Map(allPlayers.map(p => [p.id, p]));

            // Filter users - Show ALL users with role='player'
            const availableUsers = allUsers
                .filter(u => {
                    // Rule 1: Must be a regular 'player' role
                    if (u.role !== 'player') {
                        return false;
                    }

                    // Rule 2: Must NOT be the current captain (safety check)
                    if (u.id === captainId) {
                        return false;
                    }

                    // Rule 3: Must NOT be already in a team
                    // We check their player card for a teamId
                    if (u.playerCardId && playerCardMap.has(u.playerCardId)) {
                        const card = playerCardMap.get(u.playerCardId);
                        if (card?.teamId) {
                            return false;
                        }
                    }

                    return true;
                })
                .map(u => {
                    // Override position logic:
                    // 1. If user has a player card, get position from the card (Source of Truth)
                    // 2. If not, use user.position
                    // 3. Fallback: If position is ever 'ST', force it to 'CF'

                    let effectivePosition = u.position;

                    if (u.playerCardId && playerCardMap.has(u.playerCardId)) {
                        effectivePosition = playerCardMap.get(u.playerCardId)?.position;
                    }

                    // Fix ST -> CF issue
                    if (effectivePosition === 'ST' as any) {
                        effectivePosition = 'CF';
                    }

                    return {
                        ...u,
                        position: effectivePosition
                    };
                });

            console.log('Available users:', availableUsers.length);

            setUsers(availableUsers);
            setFilteredUsers(availableUsers);
        } catch (err) {
            console.error("Error loading users for invitation:", err);
            setError("Failed to load list of players.");
        }
    };

    // Apply filters when users, positionFilter, or searchTerm change
    useEffect(() => {
        let result = users;

        // Position Filter
        if (positionFilter !== 'ALL') {
            result = result.filter(u => u.position === positionFilter);
        }

        // Search Filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(u => u.name.toLowerCase().includes(lowerTerm));
        }

        setFilteredUsers(result);
    }, [users, positionFilter, searchTerm]);

    const handleTogglePlayer = (userId: string) => {
        setSelectedUserIds(prev => {
            if (prev.includes(userId)) {
                // Remove from selection
                return prev.filter(id => id !== userId);
            } else {
                // Check if adding would exceed max capacity
                if (currentPlayerCount + prev.length + 1 > 7) {
                    setError('Cannot invite more players. Team would exceed maximum capacity of 7 players.');
                    return prev;
                }
                // Add to selection
                setError('');
                return [...prev, userId];
            }
        });
    };

    const handleSendInvitations = async () => {
        if (selectedUserIds.length === 0) {
            setError('Please select at least one player to invite');
            return;
        }

        // Check if team would exceed max capacity
        if (currentPlayerCount + selectedUserIds.length > 7) {
            setError(`Cannot invite ${selectedUserIds.length} player(s). Team would exceed maximum capacity of 7 players.`);
            return;
        }

        setSending(true);
        setError('');

        try {
            // Send invitation to each selected player
            for (const userId of selectedUserIds) {
                const selectedUser = users.find(u => u.id === userId);
                if (!selectedUser) continue;

                const invitation = {
                    id: uuidv4(),
                    teamId,
                    playerId: userId,
                    playerName: selectedUser.name,
                    invitedBy: captainId,
                    captainName,
                    teamName,
                    status: 'pending' as const,
                    createdAt: Date.now()
                };

                await saveTeamInvitation(invitation);
            }

            showToast(`${selectedUserIds.length} invitation(s) sent successfully!`, 'success');
            onInviteSent();
            onClose();
            setSelectedUserIds([]);
        } catch (err) {
            setError('Failed to send invitations. Please try again.');
            console.error('Error sending invitations:', err);
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-gradient-to-br from-gray-900 via-gray-900 to-black border-2 border-white/20 rounded-3xl max-w-lg w-full shadow-2xl animate-scale-in flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-8 pb-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-elkawera-accent/20 flex items-center justify-center">
                            <UsersIcon className="text-elkawera-accent" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-display font-bold uppercase">Invite Players</h2>
                            <p className="text-sm text-gray-400">Add players to {teamName}</p>
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
                <div className="px-8 pb-4 shrink-0">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <UsersIcon size={16} />
                                <span>Current Squad:</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xl font-bold ${currentPlayerCount < 5 ? 'text-red-400' :
                                    currentPlayerCount >= 7 ? 'text-yellow-400' :
                                        'text-elkawera-accent'
                                    }`}>
                                    {currentPlayerCount}
                                </span>
                                <span className="text-gray-500">/</span>
                                <span className="text-gray-400">7</span>
                            </div>
                        </div>
                        {selectedUserIds.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-white/10">
                                <p className="text-xs text-elkawera-accent">
                                    {selectedUserIds.length} player(s) selected • Will be: {currentPlayerCount + selectedUserIds.length}/7
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="px-8 pb-4 shrink-0 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search player by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-elkawera-accent focus:outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase text-gray-400 mb-2 font-bold flex items-center gap-2">
                            <Filter size={12} /> Filter by Position
                        </label>
                        <div className="flex gap-2">
                            {(['ALL', 'GK', 'CB', 'CF'] as const).map(pos => (
                                <button
                                    key={pos}
                                    onClick={() => setPositionFilter(pos)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all border ${positionFilter === pos
                                        ? 'bg-elkawera-accent text-black border-elkawera-accent'
                                        : 'bg-black/40 text-gray-400 border-white/10 hover:bg-white/5'
                                        }`}
                                >
                                    {pos === 'ALL' ? 'All Roles' : pos}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Player List */}
                <div className="flex-1 min-h-0 px-8 pb-4 overflow-hidden flex flex-col">
                    <label className="block text-xs uppercase text-gray-400 mb-3 font-bold">Select Players to Invite</label>
                    <div className="overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent flex-1">
                        {filteredUsers.length === 0 ? (
                            <div className="text-center py-12 text-gray-500 bg-white/5 rounded-xl border border-dashed border-white/10">
                                <UserIcon size={48} className="mx-auto mb-3 opacity-30" />
                                <p>No players found.</p>
                                {positionFilter !== 'ALL' && <p className="text-xs mt-1">Try changing the position filter.</p>}
                            </div>
                        ) : (
                            filteredUsers.map((user) => {
                                const isSelected = selectedUserIds.includes(user.id);

                                return (
                                    <button
                                        key={user.id}
                                        onClick={() => handleTogglePlayer(user.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 ${isSelected
                                            ? 'bg-elkawera-accent/20 border-elkawera-accent shadow-[0_0_20px_rgba(0,255,157,0.2)]'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        {/* Checkbox */}
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${isSelected
                                            ? 'bg-elkawera-accent border-elkawera-accent'
                                            : 'border-white/30'
                                            }`}>
                                            {isSelected && (
                                                <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>

                                        <div className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0 ${isSelected ? 'bg-elkawera-accent/30 ring-2 ring-elkawera-accent' : 'bg-white/10'
                                            }`}>
                                            {user.profileImageUrl ? (
                                                <img src={user.profileImageUrl} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon size={20} className={isSelected ? 'text-elkawera-accent' : 'text-gray-400'} />
                                            )}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                                                {user.name}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                                                    Player
                                                </span>
                                                {user.position && (
                                                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{user.position}</span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="px-8 pb-4 shrink-0">
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 p-8 pt-4 shrink-0 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors font-bold text-gray-300"
                        disabled={sending}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSendInvitations}
                        disabled={selectedUserIds.length === 0 || sending}
                        className="flex-1 px-6 py-3.5 rounded-xl bg-elkawera-accent text-black font-bold hover:bg-white transition-all shadow-[0_0_20px_rgba(0,255,157,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {sending ? (
                            <>
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                Send {selectedUserIds.length > 0 ? `(${selectedUserIds.length})` : 'Invitations'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

