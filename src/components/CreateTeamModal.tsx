import React, { useState, useEffect } from 'react';
import { Team, Player, User, TeamInvitation } from '@/types';
import { useAuth } from "@/context/AuthContext";
import { XCircle, Upload, CheckCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { getAllUsers, getAllPlayers, getAllTeams, saveTeam, saveTeamInvitation } from '@/utils/db';
import { showToast } from './Toast';  


export const CreateTeamModal: React.FC<{
    onClose: () => void;
    onCreated: () => void;
}> = ({ onClose, onCreated }) => {
    const { user } = useAuth();
    const [teamName, setTeamName] = useState('');
    const [shortName, setShortName] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const [creating, setCreating] = useState(false);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const users = await getAllUsers();
            setAllUsers(users);
            const allPlayers = await getAllPlayers();
            setPlayers(allPlayers);
            const allTeams = await getAllTeams();
            setTeams(allTeams);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    // Filter out captains and current user
    const availableUsers = allUsers.filter(u => {
        if (u.id === user?.id) return false; // Don't show self
        if (u.role === 'CAPTAIN') return false; // Don't show any captains
        return true;
    });

    const getUserStatus = (u: User) => {
        if (u.role === 'ADMIN') return { label: 'Admin', color: 'text-red-400', bg: 'bg-red-500/20' };

        // Check if player in another team
        const playerCard = players.find(p => p.id === u.playerCardId);
        if (playerCard && playerCard.teamId) {
            const teamName = teams.find(t => t.id === playerCard.teamId)?.name;
            if (teamName) return { label: teamName, color: 'text-blue-400', bg: 'bg-blue-500/20' };
        }

        return null; // Free agent
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreate = async () => {
        if (!teamName || !shortName) {
            showToast('Please fill in team name and short name', 'error');
            return;
        }

        setCreating(true);

        try {
            const newTeam: Team = {
                id: uuidv4(),
                name: teamName,
                shortName: shortName.toUpperCase(),
                color: '#00FF9D',
                logoUrl: logoUrl || undefined,
                captainId: user?.id || '',
                captainName: user?.name || '',
                experiencePoints: 0,
                ranking: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                totalMatches: 0,
                createdAt: Date.now(),
            };

            await saveTeam(newTeam);

            // Send invitations to selected players
            for (const userId of selectedPlayers) {
                const targetUser = allUsers.find(u => u.id === userId);
                if (!targetUser) continue;

                const invitation: TeamInvitation = {
                    id: uuidv4(),
                    teamId: newTeam.id,
                    playerId: userId,
                    playerName: targetUser.name,
                    invitedBy: user?.id || '',
                    captainName: user?.name || '',
                    teamName: newTeam.name,
                    status: 'pending',
                    createdAt: Date.now(),
                };

                await saveTeamInvitation(invitation);
            }

            onCreated();
        } catch (error) {
            console.error('Error creating team:', error);
            showToast('Failed to create team', 'error');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-elkawera-dark border border-white/20 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-display font-bold uppercase">Create Team</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                        <XCircle size={24} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Team Details */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Team Name</label>
                            <input
                                type="text"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder="e.g., Thunder FC"
                                className="w-full bg-black/50 border border-white/20 rounded-lg p-3 focus:border-elkawera-accent focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2">Short Name (3-4 letters)</label>
                            <input
                                type="text"
                                value={shortName}
                                onChange={(e) => setShortName(e.target.value.slice(0, 4))}
                                placeholder="e.g., THU"
                                className="w-full bg-black/50 border border-white/20 rounded-lg p-3 focus:border-elkawera-accent focus:outline-none uppercase"
                                maxLength={4}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">Team Logo (Optional)</label>
                        <div className="flex items-center gap-4">
                            {logoUrl && (
                                <img src={logoUrl} alt="Logo preview" className="w-16 h-16 rounded-full object-cover border-2 border-elkawera-accent" />
                            )}
                            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors">
                                <Upload size={16} />
                                <span className="text-sm font-bold">Upload Logo</span>
                                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                            </label>
                        </div>
                    </div>

                    {/* Player Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">
                            Add Players (Optional) - {selectedPlayers.length} selected
                        </label>
                        <div className="space-y-2 max-h-64 overflow-y-auto bg-black/30 rounded-lg p-3 border border-white/10">
                            {availableUsers.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">No players available</p>
                            ) : (
                                availableUsers.map(u => {
                                    const status = getUserStatus(u);
                                    const playerCard = players.find(p => p.id === u.playerCardId);
                                    const overall = playerCard ? playerCard.overallScore : '-';

                                    return (
                                        <label
                                            key={u.id}
                                            className="flex items-center gap-3 p-2 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedPlayers.includes(u.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        if (selectedPlayers.length >= 7) {
                                                            showToast('Maximum 7 players can be added to a team', 'error');
                                                            return;
                                                        }
                                                        setSelectedPlayers([...selectedPlayers, u.id]);
                                                    } else {
                                                        setSelectedPlayers(selectedPlayers.filter(id => id !== u.id));
                                                    }
                                                }}
                                                className="w-4 h-4 accent-elkawera-accent"
                                            />
                                            <div className="w-8 h-8 rounded-full bg-elkawera-accent/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-display font-bold">{overall}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-sm truncate">{u.name}</p>
                                                    {status && (
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${status.bg} ${status.color}`}>
                                                            {status.label}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                            </div>
                                        </label>
                                    );
                                })
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            You can invite players now or add them later from your dashboard
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors font-bold"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={creating || !teamName || !shortName}
                        className="flex-1 py-3 bg-elkawera-accent text-black rounded-lg hover:bg-white transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {creating ? (
                            <>
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                Creating...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={20} />
                                Create Team
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
