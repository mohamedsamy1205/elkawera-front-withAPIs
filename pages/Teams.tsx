
import React, { useState, useEffect } from 'react';
import { Team, Player } from '../types';
import { getAllTeams, saveTeam, deleteTeam, getPlayersByTeamId } from '../utils/db';
import { PlusCircle, Trash2, Users, Shield, Upload, Edit3, ArrowLeft, Save, X, UserPlus, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Link } from 'react-router-dom';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { InvitePlayerModal } from '../components/InvitePlayerModal';
import { useAuth } from '../context/AuthContext';

export const Teams: React.FC = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [squad, setSquad] = useState<Player[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Team>>({
    name: '',
    shortName: '',
    color: '#00ff9d',
    logoUrl: undefined,
  });

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      loadSquad(selectedTeam.id);
      setFormData(selectedTeam); // Pre-fill form for editing
    }
  }, [selectedTeam]);

  const loadTeams = () => {
    getAllTeams().then(setTeams);
  };

  const loadSquad = (teamId: string) => {
    getPlayersByTeamId(teamId).then(setSquad);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.shortName) return;

    const teamToSave: Team = {
      id: selectedTeam ? selectedTeam.id : uuidv4(),
      name: formData.name!,
      shortName: formData.shortName!.substring(0, 3).toUpperCase(),
      color: formData.color || '#00ff9d',
      logoUrl: formData.logoUrl || undefined,
      captainId: selectedTeam ? selectedTeam.captainId : (user?.id || ''),
      captainName: selectedTeam ? selectedTeam.captainName : (user?.name || ''),
      experiencePoints: selectedTeam ? selectedTeam.experiencePoints : 0,
      ranking: selectedTeam ? selectedTeam.ranking : 0,
      wins: selectedTeam ? selectedTeam.wins : 0,
      draws: selectedTeam ? selectedTeam.draws : 0,
      losses: selectedTeam ? selectedTeam.losses : 0,
      totalMatches: selectedTeam ? selectedTeam.totalMatches : 0,
      createdAt: selectedTeam ? selectedTeam.createdAt : Date.now(),
    };

    await saveTeam(teamToSave);

    // Reset states
    setFormData({ name: '', shortName: '', color: '#00ff9d', logoUrl: undefined });
    setIsCreating(false);
    setIsEditing(false);

    if (selectedTeam) {
      setSelectedTeam(teamToSave); // Update current view
    }

    loadTeams();
  };

  const confirmDelete = async () => {
    if (deleteTeamId) {
      await deleteTeam(deleteTeamId);
      if (selectedTeam?.id === deleteTeamId) setSelectedTeam(null);
      setDeleteTeamId(null);
      loadTeams();
    }
  };

  const startCreating = () => {
    setSelectedTeam(null);
    setFormData({ name: '', shortName: '', color: '#00ff9d', logoUrl: undefined });
    setIsCreating(true);
  };

  const handleInviteSent = () => {
    // Reload squad to reflect any changes
    if (selectedTeam) {
      loadSquad(selectedTeam.id);
    }
  };

  // Separate teams for captain AND player view
  // Both captains and players can own teams (captainId = user.id)
  const yourTeams = (user?.role === 'captain' || user?.role === 'player')
    ? teams.filter(t => t.captainId === user.id)
    : [];
  const otherTeams = (user?.role === 'captain' || user?.role === 'player')
    ? teams.filter(t => t.captainId !== user.id)
    : teams;

  // Check if player already has a team (limit to 1 for players)
  const playerHasTeam = user?.role === 'player' && yourTeams.length > 0;
  const canCreateTeam = user?.role === 'captain' || (user?.role === 'player' && !playerHasTeam);

  // --- DETAIL VIEW ---
  if (selectedTeam && !isEditing) {
    const avgRating = squad.length > 0 ? Math.round(squad.reduce((acc, p) => acc + p.overallScore, 0) / squad.length) : 0;
    // Allow both captains and players to manage their own teams
    const isOwnTeam = (user?.role === 'captain' || user?.role === 'player') && selectedTeam.captainId === user.id;
    const canScheduleMatch = squad.length >= 3 && squad.length <= 7;

    return (
      <div className="max-w-6xl mx-auto animate-fade-in-up">
        <ConfirmationDialog
          isOpen={!!deleteTeamId}
          onClose={() => setDeleteTeamId(null)}
          onConfirm={confirmDelete}
          title="Delete Team?"
          message={`Are you sure you want to delete "${selectedTeam.name}"? This action cannot be undone.`}
        />

        <InvitePlayerModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          teamId={selectedTeam.id}
          teamName={selectedTeam.name}
          captainId={selectedTeam.captainId}
          captainName={selectedTeam.captainName}
          currentPlayerCount={squad.length}
          onInviteSent={handleInviteSent}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setSelectedTeam(null)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} /> Back to Teams
          </button>
          <div className="flex gap-2">
            {isOwnTeam && (
              <>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-elkawera-accent/20 text-elkawera-accent rounded hover:bg-elkawera-accent/30 transition-colors"
                >
                  <UserPlus size={16} /> Invite Player
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded hover:bg-white/20 transition-colors"
                >
                  <Edit3 size={16} /> Edit Team
                </button>
                <button
                  onClick={() => setDeleteTeamId(selectedTeam.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Player Count Warning */}
        {isOwnTeam && !canScheduleMatch && (
          <div className={`mb-6 p-4 rounded-xl border-2 flex items-start gap-3 ${squad.length < 3
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
            }`}>
            <AlertTriangle size={24} className="flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold mb-1">
                {squad.length < 3 ? 'Minimum Players Required' : 'Maximum Players Exceeded'}
              </div>
              <div className="text-sm opacity-90">
                {squad.length < 3
                  ? `You need at least 3 players to schedule matches. Currently: ${squad.length}/3`
                  : `Maximum 7 players allowed per team. Currently: ${squad.length}/7`}
              </div>
            </div>
          </div>
        )}

        {/* Team Banner */}
        <div className="relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden p-8 mb-8">
          <div className="absolute inset-0 opacity-30 bg-mesh mix-blend-overlay"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div
              className="w-32 h-32 rounded-full bg-white shadow-2xl flex items-center justify-center border-4 border-white/20"
              style={{ borderColor: selectedTeam.color }}
            >
              {selectedTeam.logoUrl ? (
                <img src={selectedTeam.logoUrl} className="w-full h-full object-cover rounded-full" alt={selectedTeam.name} />
              ) : (
                <span className="text-3xl font-bold" style={{ color: selectedTeam.color }}>{selectedTeam.shortName}</span>
              )}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-5xl font-display font-bold uppercase drop-shadow-lg">{selectedTeam.name}</h1>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-gray-300">
                <span className="px-3 py-1 bg-black/40 rounded text-sm font-bold tracking-widest">{selectedTeam.shortName}</span>
                <span className="flex items-center gap-1 text-sm"><Users size={14} /> {squad.length} Players</span>
                <span className="text-sm text-gray-400">Captain: {selectedTeam.captainName}</span>
              </div>
            </div>
            <div className="md:ml-auto flex gap-6 text-center">
              <div>
                <div className="text-4xl font-display font-bold text-elkawera-accent">{avgRating}</div>
                <div className="text-xs uppercase tracking-widest opacity-60">Avg Rating</div>
              </div>
              <div className="w-px bg-white/10"></div>
              <div>
                <div className={`text-4xl font-display font-bold ${squad.length < 3 ? 'text-red-400' : squad.length > 7 ? 'text-yellow-400' : 'text-white'
                  }`}>{squad.length}</div>
                <div className="text-xs uppercase tracking-widest opacity-60">Squad Size</div>
              </div>
            </div>
          </div>
        </div>

        {/* Squad List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-2xl font-display font-bold uppercase">Squad List</h2>
            {isOwnTeam && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="text-sm text-elkawera-accent hover:underline flex items-center gap-1"
              >
                <UserPlus size={16} /> Invite Player
              </button>
            )}
          </div>

          {squad.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
              <p className="text-gray-500">No players assigned to this team yet.</p>
              {isOwnTeam && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="text-elkawera-accent hover:underline mt-2 inline-block"
                >
                  Invite players to join
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-3">
              {/* Table Header */}
              <div className="grid grid-cols-12 px-6 py-3 bg-white/5 rounded-lg text-xs font-bold uppercase text-gray-400 tracking-wider">
                <div className="col-span-1">OVR</div>
                <div className="col-span-5 md:col-span-4">Player</div>
                <div className="col-span-2">Pos</div>
                <div className="col-span-2 hidden md:block">Tier</div>
                <div className="col-span-2 hidden md:block">Age</div>
                <div className="col-span-4 md:col-span-1 text-right">Action</div>
              </div>

              {squad.map(player => (
                <div key={player.id} className="grid grid-cols-12 items-center px-6 py-4 bg-black/40 border border-white/5 rounded-lg hover:border-elkawera-accent/50 transition-colors group">
                  <div className="col-span-1 font-display font-bold text-xl text-elkawera-accent">{player.overallScore}</div>
                  <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
                      {player.imageUrl ? <img src={player.imageUrl} className="w-full h-full object-cover" alt={player.name} /> : <Users size={16} className="m-2 text-gray-500" />}
                    </div>
                    <div>
                      <div className="font-bold text-white">{player.name}</div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 md:hidden">
                        {player.country} • {player.position}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 font-mono text-sm text-gray-300">{player.position}</div>
                  <div className="col-span-2 hidden md:block">
                    <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${player.cardType === 'Platinum' ? 'bg-cyan-900/50 text-cyan-200' :
                      player.cardType === 'Gold' ? 'bg-yellow-900/50 text-yellow-200' :
                        'bg-gray-700/50 text-gray-300'
                      }`}>
                      {player.cardType}
                    </span>
                  </div>
                  <div className="col-span-2 hidden md:block text-sm text-gray-400">{player.age}</div>
                  <div className="col-span-4 md:col-span-1 text-right">
                    <Link to={`/create?id=${player.id}`} className="text-gray-500 hover:text-white transition-colors">
                      <Edit3 size={16} className="ml-auto" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- MAIN VIEW (Create / Edit Form or Grid) ---
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {!isCreating && !isEditing && (
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold uppercase">Team Management</h1>
            <p className="text-gray-400">Create and manage your squads with custom logos.</p>
          </div>
          {canCreateTeam && (
            <button
              onClick={startCreating}
              className="flex items-center gap-2 px-6 py-3 bg-elkawera-accent text-black font-bold rounded-full hover:bg-white transition-colors shadow-lg shadow-elkawera-accent/20"
            >
              <PlusCircle size={20} /> Create Team
            </button>
          )}
          {playerHasTeam && (
            <div className="text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
              <span className="text-yellow-400">⚠️</span> Players can only create one team
            </div>
          )}
        </div>
      )}

      {(isCreating || isEditing) && (
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl animate-fade-in-down shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold uppercase">{isEditing ? 'Edit Team Details' : 'Create New Team'}</h2>
            <button
              onClick={() => { setIsCreating(false); setIsEditing(false); }}
              className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid md:grid-cols-4 gap-8 items-start">
            <div className="md:col-span-3 space-y-6">
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-2">Team Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/50 border border-white/20 rounded-lg p-4 focus:border-elkawera-accent focus:outline-none text-lg text-white placeholder-gray-600"
                  placeholder="e.g. Manchester City"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-2">Abbreviation (3 chars)</label>
                  <input
                    required
                    maxLength={3}
                    type="text"
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    className="w-full bg-black/50 border border-white/20 rounded-lg p-4 focus:border-elkawera-accent focus:outline-none uppercase font-mono tracking-widest text-white"
                    placeholder="MCI"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-400 mb-2">Primary Color</label>
                  <div className="flex items-center gap-2 h-[58px]">
                    <div className="relative w-full h-full">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div
                        className="w-full h-full rounded-lg border border-white/20 flex items-center justify-center font-mono text-sm font-bold text-shadow"
                        style={{ backgroundColor: formData.color }}
                      >
                        {formData.color}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs uppercase text-gray-400 mb-2">Team Logo</label>
              <label className="cursor-pointer flex flex-col items-center justify-center bg-black/50 border border-white/20 hover:border-elkawera-accent border-dashed rounded-xl h-[200px] w-full transition-all group overflow-hidden">
                {formData.logoUrl ? (
                  <div className="relative w-full h-full p-4">
                    <img src={formData.logoUrl} alt="Logo Preview" className="h-full w-full object-contain" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-bold uppercase">Change</div>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <Upload size={32} className="mx-auto mb-3 text-gray-500 group-hover:text-elkawera-accent transition-colors" />
                    <span className="text-xs text-gray-300">Upload PNG/JPG</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>

            <div className="md:col-span-4 border-t border-white/10 pt-6 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => { setIsCreating(false); setIsEditing(false); }}
                className="px-6 py-3 rounded-lg hover:bg-white/5 text-gray-300 transition-colors font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-elkawera-accent text-black font-bold rounded-lg hover:bg-white transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,157,0.2)]"
              >
                <Save size={18} /> {isEditing ? 'Update Team' : 'Save Team'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Your Teams Section - For Captains AND Players */}
      {(user?.role === 'captain' || user?.role === 'player') && yourTeams.length > 0 && !isCreating && !isEditing && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="text-elkawera-accent" size={24} />
            <h2 className="text-2xl font-display font-bold uppercase">Your Teams</h2>
            {user?.role === 'player' && (
              <span className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
                Player Team (Max: 1)
              </span>
            )}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {yourTeams.map(team => (
              <TeamCard key={team.id} team={team} onClick={() => setSelectedTeam(team)} isOwn={true} />
            ))}
          </div>
        </div>
      )}

      {/* Other Teams Section */}
      {!isCreating && !isEditing && (
        <div className="space-y-4">
          {(user?.role === 'captain' || user?.role === 'player') && (
            <div className="flex items-center gap-3">
              <Users className="text-gray-400" size={24} />
              <h2 className="text-2xl font-display font-bold uppercase">Other Teams</h2>
            </div>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherTeams.length === 0 && yourTeams.length === 0 && (
              <div className="col-span-full text-center py-24 text-gray-500 border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
                <Shield size={64} className="mx-auto mb-6 opacity-30" />
                <h3 className="text-xl font-bold text-white mb-2">No Teams Found</h3>
                <p className="mb-6">
                  {user?.role === 'player'
                    ? 'Create your team to start playing matches.'
                    : 'Create your first team to start managing your dynasty.'}
                </p>
                {canCreateTeam && (
                  <button onClick={startCreating} className="text-elkawera-accent hover:underline font-bold">Create Team Now</button>
                )}
              </div>
            )}

            {otherTeams.map(team => (
              <TeamCard key={team.id} team={team} onClick={() => setSelectedTeam(team)} isOwn={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Team Card Component
const TeamCard: React.FC<{ team: Team; onClick: () => void; isOwn: boolean }> = ({ team, onClick, isOwn }) => {
  return (
    <div
      onClick={onClick}
      className={`relative group bg-white/5 border rounded-2xl overflow-hidden hover:-translate-y-1 transition-all cursor-pointer shadow-lg ${isOwn ? 'border-elkawera-accent/50 hover:border-elkawera-accent' : 'border-white/10 hover:border-white/30'
        }`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-black shadow-lg overflow-hidden bg-white border-4 border-white/10"
            style={{ borderColor: team.color }}
          >
            {team.logoUrl ? (
              <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover" />
            ) : (
              <span style={{ color: team.color }}>{team.shortName}</span>
            )}
          </div>
          <div className="px-3 py-1 bg-black/50 rounded text-xs font-mono text-gray-400 group-hover:text-white transition-colors">
            DETAILS &rarr;
          </div>
        </div>

        <h3 className={`text-2xl font-display font-bold uppercase mb-1 truncate transition-colors ${isOwn ? 'text-elkawera-accent' : 'text-white group-hover:text-elkawera-accent'
          }`}>{team.name}</h3>
        <div className="text-gray-400 text-sm flex items-center gap-2">
          <span style={{ color: team.color }}>●</span> {team.shortName}
        </div>
      </div>

      {/* Decoration */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60 pointer-events-none" />
      <div
        className={`absolute bottom-0 left-0 w-full transition-all ${isOwn ? 'h-2' : 'h-1.5 group-hover:h-2'
          }`}
        style={{ backgroundColor: team.color }}
      />
    </div>
  );
};
