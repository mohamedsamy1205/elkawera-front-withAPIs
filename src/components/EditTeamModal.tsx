import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Team, Player, User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { XCircle, Upload, Trash2, Check, CheckCircle, X } from 'lucide-react';
import { saveTeam, getPlayerById, savePlayer } from '@/utils/db';
import { showToast } from './Toast';
import { deletePlayerFromTeam, profileEndpoint, updateTeam } from '@/types/APIs';

export const EditTeamModal: React.FC<{
    team: any;
    players: any;
    allUsers: User[];
    teams: Team[];
    onClose: () => void;
    onUpdated: () => void;
}> = ({ team, players, allUsers, teams, onClose, onUpdated }) => {
    const { user , updateProfile } = useAuth();
    const [teamName, setTeamName] = useState(team.teamName);
    const [shortName, setShortName] = useState(team.teamAbbreviation);
    const [logoUrl, setLogoUrl] = useState(team?.teamLogo || '');
    const [saving, setSaving] = useState(false);
    const [confirmingRemovePlayerId, setConfirmingRemovePlayerId] = useState<string | null>(null);
    const [teamPlayers , setTeamPlayers] = useState(players)

    // Get current team players
    // const teamPlayers =players

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

    const handleRemovePlayer = async (playerId: number) => {
    try {
        await deletePlayerFromTeam(playerId);
        localStorage.removeItem('profile');
        const profile = await profileEndpoint();
        localStorage.setItem('profile', JSON.stringify(profile))
        window.location.reload()
        onClose()
        // updateProfile();
        showToast('Player removed successfully', 'success');
    } catch (error) {
        console.error('Error removing player:', error);
        showToast('Failed to remove player', 'error');
    }
};

    const handleSave = async () => {
        if (!teamName || !shortName) {
            showToast('Please fill in team name and short name', 'error');
            return;
        }

        setSaving(true);

        try {
            const updatedTeam = {
                id : team.teamId,
                name: teamName,
                abbreviation: shortName.toUpperCase(),
                logo: logoUrl,
            };

            console.log(updatedTeam)

            await updateTeam(updatedTeam);
            localStorage.removeItem('profile');
            const profile = await profileEndpoint();
            localStorage.setItem('profile', JSON.stringify(profile))
            window.location.reload()
            showToast('Team updated successfully', 'success');
            onUpdated();
        } catch (error) {
            console.error('Error updating team:', error);
            showToast('Failed to update team', 'error');
        } finally { 
            setSaving(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-elkawera-dark border border-white/20 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-display font-bold uppercase">Edit Team</h2>
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
                        <label className="block text-sm font-bold text-gray-400 mb-2">Team Logo</label>
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

                    {/* Current Players */}
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-2">
                            Current Players ({teamPlayers.length}/7)
                        </label>
                        <div className="space-y-2 max-h-64 overflow-y-auto bg-black/30 rounded-lg p-3 border border-white/10">
                            {teamPlayers.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">No players in team yet</p>
                            ) : (
                                teamPlayers.map(player => (
                                    <div
                                        key={player.playerId}
                                        className="flex items-center justify-between p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-elkawera-accent/20 flex items-center justify-center">
                                                <span className="text-sm font-display font-bold">{player.status.TotalRank}</span>
                                            </div>
                                            <div>
                                                <p className="font-bold">{player.playerName}</p>
                                                <p className="text-xs text-gray-400">{player.playerPosition}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {confirmingRemovePlayerId === player.playerId ? (
                                                <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                                                    <span className="text-[10px] font-bold text-red-500 uppercase">Remove?</span>
                                                    <button
                                                        onClick={() => handleRemovePlayer(player.playerId)}
                                                        className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmingRemovePlayerId(null)}
                                                        className="p-1.5 bg-white/10 text-gray-400 rounded-lg hover:bg-white/20 transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmingRemovePlayerId(player.playerId)}
                                                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                                    title="Remove player"
                                                >
                                                    <Trash2 size={16} className="text-red-400" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Use the "Invite Players" button on the dashboard to add more players
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
                        onClick={handleSave}
                        disabled={saving || !teamName || !shortName}
                        className="flex-1 py-3 bg-elkawera-accent text-black rounded-lg hover:bg-white transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={20} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};