

import React from 'react';
import { createPortal } from 'react-dom';
import { XCircle } from 'lucide-react';
import { MatchRequest, Team, Player } from '@/types';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { confirmMatchRequestByOpponent, getPlayersByTeamId } from '@/utils/db';
import { showToast } from './Toast';

// import { showToast } from '@/utils/toast';


export const AcceptMatchModal: React.FC<{
    request: MatchRequest;
    myTeam: Team;
    onClose: () => void;
    onAccepted: () => void;
}> = ({ request, myTeam, onClose, onAccepted }) => {
    const [squad, setSquad] = useState<Player[]>([]);
    const [selectedLineup, setSelectedLineup] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const loadSquad = async () => {
            const players = await getPlayersByTeamId(myTeam.id);
            setSquad(players);
        };
        loadSquad();
    }, [myTeam]);

    const togglePlayer = (playerId: string) => {
        setSelectedLineup(prev => {
            if (prev.includes(playerId)) {
                return prev.filter(id => id !== playerId);
            } else {
                if (prev.length >= 7) {
                    showToast('You can only select up to 7 players', 'error');
                    return prev;
                }
                return [...prev, playerId];
            }
        });
    };

    const handleConfirm = async () => {
        if (selectedLineup.length < 5) return;
        if (!user) return;
        setSubmitting(true);

        try {
            await confirmMatchRequestByOpponent(request.id, user.id, selectedLineup);
            showToast('Challenge accepted! Waiting for admin approval.', 'success');
            onAccepted();
        } catch (error) {
            console.error('Error accepting match:', error);
            showToast('Failed to accept match', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-elkawera-dark border border-white/20 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-display font-bold uppercase">Accept Challenge</h2>
                        <p className="text-gray-400">Select your lineup to play against {request.homeTeamName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                        <XCircle size={24} />
                    </button>
                </div>

                <div className="mb-6">
                    <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between mb-4">
                        <span className="font-bold text-gray-400">Match Opponent</span>
                        <span className="text-xl font-bold">{request.homeTeamName}</span>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold">Select Lineup ({selectedLineup.length}/7)</h3>
                        <span className="text-xs text-red-400 font-bold">Min 5 Players</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scrollbar">
                        {squad.map(player => {
                            const isSelected = selectedLineup.includes(player.id);
                            return (
                                <div
                                    key={player.id}
                                    onClick={() => togglePlayer(player.id)}
                                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3 ${isSelected
                                        ? 'bg-elkawera-accent/20 border-elkawera-accent'
                                        : 'bg-white/5 border-transparent hover:bg-white/10'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-elkawera-accent text-black' : 'bg-white/10'}`}>
                                        <span className="text-xs font-bold">{player.overallScore}</span>
                                    </div>
                                    <div>
                                        <p className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-300'}`}>{player.name}</p>
                                        <p className="text-xs text-gray-500">{player.position}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors font-bold"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={submitting || selectedLineup.length < 5}
                        className="flex-1 py-3 bg-elkawera-accent text-black rounded-lg hover:bg-white transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {submitting ? 'Processing...' : 'Confirm & Send to Admin'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

