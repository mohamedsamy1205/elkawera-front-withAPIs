import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getPlayerById, savePlayer, getAllTeams, getPlayerRegistrationRequestById, updatePlayerRegistrationRequest, getUserById, getUserByPlayerCardId } from '@/utils/db';
import { getCardTypeFromScore } from '@/utils/matchCalculations';
import { Player, Position, CardType, Team } from '@/types';
import { PlayerCard } from '@/components/PlayerCard';
import { computeOverallWithPerformance, getCardType } from '@/utils/calculation';
import { Upload, Save, ArrowLeft, Download, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { COUNTRIES } from '@/utils/countries';
import { downloadElementAsPNG } from '@/utils/download';
import { useAuth } from '@/context/AuthContext';
import { DatabaseReset } from '@/components/DatabaseReset';
import { profileByIdEndpoint, teamsList, updateUser } from '@/types/APIs';
import { position } from 'html2canvas/dist/types/css/property-descriptors/position';


export const CreatePlayer: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const requestId = searchParams.get('requestId');
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [baseManualScore, setBaseManualScore] = useState(60);
  const [playerData, setPlayerData] = useState<any>({})
  const [player, setPlayer] = useState<any>({
    id: 0,
    name: '',
    age: 18,
    height: 180,
    weight: 75,
    position: 'CF',
    country: 'EG',
    teamId: 0,
    imageUrl: null,
    totalRank: 60,
    goals: 0,
    assist: 0,

    defianceContribution: 0,
    cleanSheets: 0,
    penaltySave: 0,
    saves: 0,
    ownGoals: 0,
    goalsConceded: 0,
    penaltyMissed: 0,
    matches: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })
  
  // const data = new FormData()
  // console.log(data)
  // useEffect(() => {
    // const calculatedOverall = computeOverallWithPerformance(
  //     baseManualScore,
  //     formData.position,
  //     {
  //       goals: formData.goals,
  //       assists: formData.assists,
  //       defensiveContributions: formData.defensiveContributions,
  //       cleanSheets: formData.cleanSheets,
  //       saves: formData.saves,
  //       penaltySaves: formData.penaltySaves,
  //       ownGoals: formData.ownGoals,
  //       goalsConceded: formData.goalsConceded,
  //       penaltyMissed: formData.penaltyMissed,
  //       matchesPlayed: formData.matchesPlayed
  //     }
  //   );

  //   setFormData(prev => ({
  //     ...prev,
  //     overallScore: calculatedOverall,
  //     cardType: getCardType(calculatedOverall)
  //   }));
  // }, [
  //   baseManualScore,
  //   formData.position,
  //   formData.goals,
  //   formData.assists,
  //   formData.defensiveContributions,
  //   formData.cleanSheets,
  //   formData.saves,
  //   formData.penaltySaves,
  //   formData.ownGoals,
  //   formData.goalsConceded,
  //   formData.penaltyMissed,
  //   formData.matchesPlayed
  // ]);
// console.log(player)

  useEffect(() => {
    // Only admins can create/edit players
    if (user && user.role !== 'ADMIN') {
      navigate('/dashboard');
    }
    if (requestId || editId) {
      loadData();
    }
    
    // load();
  }, [user]);
  const loadData = async () => {
    

    const profile = await profileByIdEndpoint(requestId? Number.parseInt(requestId):Number.parseInt(editId));
    const allTeams = await teamsList()
    setTeams(allTeams)
    console.log(profile)
    setPlayerData(profile);
    setPlayer(prev => ({
      ...prev,
      id: profile.id,
    name: profile.name,
    age: profile.profileReference.age,
    height: profile.profileReference.height,
    weight: profile.profileReference.weight,
    position: profile.profileReference.position,
    country: 'EG',
    teamId: profile.team?.id,
    imageUrl: profile.profile,
    totalRank: profile.status.totalRank,
    goals: profile.status.goals,
    assist: profile.status.assist,

    defianceContribution: profile.status.defianceContribution,
    cleanSheets: profile.status.cleanSheets,
    penaltySave: profile.status.penaltySave,
    saves: profile.status.saves,
    ownGoals: profile.status.ownGoals,
    goalsConceded: profile.status.goalsConceded,
    penaltyMissed: profile.status.penaltyMissed,
    matches: profile.status.matches,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    }))
    
  }
// console.log( Number.parseInt(editId))
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPlayer(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'height' || name === 'weight' ? Number(value) : value
    }));
    console.log(player)
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPlayer(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
      console.log(player)
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Validate required fields
      if (!player.name || !player.name.trim()) {
        setSaveError('Player name is required');
        setSaving(false);
        return;
      }

      if (requestId || editId) {
        console.log(player)
        await updateUser(player);
        setSaveSuccess(true);

        // Show success message and navigate after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        // Regular create (not from request)
        setSaveSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error saving player card:', error);
      const errorMessage = error?.message || 'Failed to save player card. Please try again.';
      setSaveError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Live preview update
  const previewPlayer = {
    ...playerData,
  };

  // Simplified Download Handler
  // The updated downloadElementAsPNG utility handles the transform stripping,
  // so we don't need to physically flip the card in the UI to get a correct download.
  const handleDownload = (side: 'front' | 'back') => {
    const id = side === 'front' ? 'card-front-preview' : 'card-back-preview';
    downloadElementAsPNG(id, `${player.name}_${side}`);
  };

  if (loading) return <div className="text-center py-20">Loading Player Data...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Show database reset option if there's a connection error */}
      {saveError && saveError.includes('Database connection failed') && (
        <div className="mb-8">
          <DatabaseReset />
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 px-2">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 shrink-0">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold uppercase truncate max-w-[200px] sm:max-w-none">{editId ? 'Edit Card' : requestId ? 'Card Builder' : 'Create Player'}</h1>
            {requestId && (
              <p className="text-gray-400 text-xs sm:text-sm mt-1">Design the card before confirmation</p>
            )}
          </div>
        </div>
        {requestId && (
          <div className="w-full sm:w-auto bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-yellow-400 block">Pending Approval</span>
            <span className="text-xs text-yellow-300">Sent to player after confirmation</span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Form Section */}
        <div className="space-y-8 bg-white/5 p-8 rounded-2xl border border-white/10">

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-elkawera-accent border-b border-white/10 pb-2 flex-1">Basic Info</h3>
              {requestId && (
                <div className="text-xs text-gray-400 uppercase font-bold">
                  Card Builder Mode
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={player.name}
                  onChange={
                    handleInputChange
                  }
                  className="w-full bg-black/50 border border-white/20 rounded p-3 focus:border-elkawera-accent focus:outline-none text-white text-sm"
                  placeholder="e.g. Lionel Messi"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Country</label>
                <select
                  name="country"
                  value={player.country}
                  onChange={handleInputChange}
                  className="w-full bg-black/50 border border-white/20 rounded p-3 bg-black focus:border-elkawera-accent focus:outline-none text-white text-sm"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Age</label>
                <input type="number" name="age" value={player?.age} onChange={handleInputChange} className="w-full bg-black/50 border border-white/20 rounded p-3 text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Hgt (cm)</label>
                <input type="number" name="height" value={player?.height} onChange={handleInputChange} className="w-full bg-black/50 border border-white/20 rounded p-3 text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Wgt (kg)</label>
                <input type="number" name="weight" value={player?.weight} onChange={handleInputChange} className="w-full bg-black/50 border border-white/20 rounded p-3 text-white text-sm" />
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-400 mb-1">Pos</label>
                <select name="position" value={player?.position} onChange={handleInputChange} className="w-full bg-black/50 border border-white/20 rounded p-3 bg-black text-white text-sm">
                  <option value="CF">CF</option>
                  <option value="CB">CB</option>
                  <option value="GK">GK</option>
                </select>
              </div>
            </div>

            <div className="bg-gradient-to-r from-elkawera-accent/10 to-transparent border border-elkawera-accent/30 rounded-xl p-4 mb-4">
              <label className="block text-xs uppercase text-elkawera-accent mb-3 font-bold">Card Tier (Automatic)</label>
              <div className="grid grid-cols-2 xs:grid-cols-4 gap-3">
                <div
                  className={`p-3 sm:p-4 rounded-lg border-2 transition-all opacity-50 ${player.cardType === 'Silver'
                    ? 'border-gray-400 bg-gray-900/50 shadow-lg scale-105 opacity-100'
                    : 'border-white/5 bg-black/10'
                    }`}
                >
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl mb-1">🥈</div>
                    <div className={`text-[10px] sm:text-sm font-bold ${player.cardType === 'Silver' ? 'text-white' : 'text-gray-500'}`}>Silver</div>
                  </div>
                </div>
                <div
                  className={`p-3 sm:p-4 rounded-lg border-2 transition-all opacity-50 ${player.cardType === 'Gold'
                    ? 'border-yellow-400 bg-yellow-900/50 shadow-lg scale-105 opacity-100'
                    : 'border-white/5 bg-black/10'
                    }`}
                >
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl mb-1">🥇</div>
                    <div className={`text-[10px] sm:text-sm font-bold ${player.cardType === 'Gold' ? 'text-yellow-300' : 'text-gray-500'}`}>Gold</div>
                  </div>
                </div>
                <div
                  className={`p-3 sm:p-4 rounded-lg border-2 transition-all opacity-50 ${player.cardType === 'Elite'
                    ? 'border-red-500 bg-red-900/50 shadow-lg scale-105 opacity-100'
                    : 'border-white/5 bg-black/10'
                    }`}
                >
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl mb-1">🔴</div>
                    <div className={`text-[10px] sm:text-sm font-bold ${player.cardType === 'Elite' ? 'text-red-400' : 'text-gray-500'}`}>Elite</div>
                  </div>
                </div>
                <div
                  className={`p-3 sm:p-4 rounded-lg border-2 transition-all opacity-50 ${player.cardType === 'Platinum'
                    ? 'border-cyan-400 bg-cyan-900/50 shadow-lg scale-105 opacity-100'
                    : 'border-white/5 bg-black/10'
                    }`}
                >
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl mb-1">💎</div>
                    <div className={`text-[10px] sm:text-sm font-bold ${player.cardType === 'Platinum' ? 'text-cyan-300' : 'text-gray-500'}`}>Platinum</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase text-gray-400 mb-1">Assign Team</label>
              <select
                name="teamId"
                value={player.teamId || ''}
                onChange={handleInputChange}
                className="w-full bg-black/50 border border-white/20 rounded p-3 bg-black focus:border-elkawera-accent focus:outline-none text-white"
              >
                <option value="">-- No Team --</option>?
                {teams.map(team => (
                  <option key={team.teamId} value={team.teamId}>{team.teamName} ({team.teamAbbreviation})</option>
                ))}
              </select>
              <div className="mt-1 text-right">
                <Link to="/teams" className="text-xs text-elkawera-accent hover:underline">+ Create New Team</Link>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase text-gray-400 mb-1">Player Image</label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer flex items-center justify-center bg-black/50 border border-white/20 hover:border-elkawera-accent border-dashed rounded h-12 px-4 w-full transition-colors">
                  <Upload size={16} className="mr-2 text-gray-400" />
                  <span className="text-sm text-gray-300">Choose File...</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {saveError && (
            <div className="p-4 bg-red-500/10 rounded border border-red-500/30 text-sm text-red-300 flex items-center gap-2">
              <AlertCircle size={16} />
              {saveError}
            </div>
          )}

          {saveSuccess && (
            <div className="p-4 bg-green-500/10 rounded border border-green-500/30 text-sm text-green-300 flex items-center gap-2">
              <CheckCircle size={16} />
              <strong>Success!</strong> Player card has been created and sent to the player's account.
            </div>
          )}

          {requestId && !saveSuccess && (
            <div className="p-4 bg-blue-500/10 rounded border border-blue-500/30 text-sm text-blue-300">
              ✨ <strong>Card Builder Mode:</strong> Customize all aspects of this player card. The card will be sent to the player once you confirm.
            </div>
          )}

          {!editId && !requestId && (
            <div className="p-4 bg-elkawera-green/20 rounded border border-elkawera-green/50 text-sm text-gray-300">
              ⚠️ Performance records and match stats can be added after the first match in the "Post-Match Stats" section.
            </div>
          )}

          {/* Season Stats Section - Show for Card Builder and Edit modes */}
          {/* Season Stats Section - Show for Card Builder and Edit modes */}
          {requestId && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="text-xl font-bold text-elkawera-accent">Performance Records</h3>
                <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Manual Calculating OVR</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-gray-400 mb-1 font-bold">Goals</label>
                  <input
                    type="number"
                    value={player.goals || 0}
                    onChange={(e) => setPlayer(prev => ({ ...prev, goals: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white font-mono focus:border-[#00ff9d] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-gray-400 mb-1 font-bold">Assists</label>
                  <input
                    type="number"
                    value={player.assist || 0}
                    onChange={(e) => setPlayer(prev => ({ ...prev, assist: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white font-mono focus:border-[#00ff9d] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-gray-400 mb-1 font-bold">Def. Contrib</label>
                  <input
                    type="number"
                    value={player.defianceContribution || 0}
                    onChange={(e) => setPlayer(prev => ({ ...prev, defianceContribution: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white font-mono focus:border-[#00ff9d] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-gray-400 mb-1 font-bold">Matches</label>
                  <input
                    type="number"
                    value={player.matches || 0}
                    onChange={(e) => setPlayer(prev => ({ ...prev, matches: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white font-mono focus:border-[#00ff9d] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase text-gray-400 mb-1 font-bold">Clean Sheets</label>
                  <input
                    type="number"
                    value={player.cleanSheets || 0}
                    onChange={(e) => setPlayer(prev => ({ ...prev, cleanSheets: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-gray-400 mb-1 font-bold">Saves</label>
                  <input
                    type="number"
                    value={player.saves || 0}
                    onChange={(e) => setPlayer(prev => ({ ...prev, saves: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-gray-400 mb-1 font-bold">Penalty Saves</label>
                  <input
                    type="number"
                    value={player.penaltySaves || 0}
                    onChange={(e) => setPlayer(prev => ({ ...prev, penaltySaves: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-black/50 border border-white/10 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-red-400/70 mb-1 font-bold">Own Goals</label>
                  <input
                    type="number"
                    value={player.ownGoals || 0}
                    onChange={(e) => setPlayer(prev => ({ ...prev, ownGoals: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-black/50 border border-red-500/10 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-red-400/70 mb-1 font-bold">Goals Conceded</label>
                  <input
                    type="number"
                    value={player.goalsConceded || 0}
                    onChange={(e) => setPlayer(prev => ({ ...prev, goalsConceded: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-black/50 border border-red-500/10 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-red-400/70 mb-1 font-bold">Penalty Missed</label>
                  <input
                    type="number"
                    value={player.penaltyMissed || 0}
                    onChange={(e) => setPlayer(prev => ({ ...prev, penaltyMissed: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-black/50 border border-red-500/10 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#00ff9d]/10 to-transparent p-6 rounded-xl border border-[#00ff9d]/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="text-xs font-bold text-[#00ff9d] uppercase tracking-tighter">Final Card Rating</label>
                    <p className="text-[10px] text-gray-500">performance bonuses</p>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-display font-black text-white">{player.totalRank}</span>
                    <div className="text-[10px] text-[#00ff9d] font-bold uppercase tracking-widest">{player.cardType}</div>
                  </div>
                </div>
                <input
                  type="range"
                  min="30"
                  max="95"
                  value={baseManualScore}
                  onChange={(e) => setBaseManualScore(parseInt(e.target.value))}
                  className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer accent-[#00ff9d]"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving || saveSuccess}
            className={`w-full py-4 font-bold uppercase rounded transition-all flex items-center justify-center gap-2 ${requestId
              ? 'bg-green-500 hover:bg-green-400 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
              : 'bg-elkawera-accent text-black hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle size={20} /> Card Sent Successfully!
              </>
            ) : (
              <>
                <Save size={20} /> {requestId ? 'Confirm & Send to Player' : editId ? 'Update Player Card' : 'Save Player Card'}
              </>
            )}
          </button>

          {requestId && !saveSuccess && (
            <p className="text-xs text-center text-gray-400 mt-2">
              This will finalize the card and send it to the player's account immediately
            </p>
          )}

        </div>

        {/* Preview Section */}
        <div className="flex flex-col items-center justify-start space-y-6">
          <h3 className="text-lg font-bold uppercase text-gray-500">Live Preview</h3>

          <div className="relative">
            <PlayerCard
              player={previewPlayer}
              uniqueId="preview"
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped(!isFlipped)}
              allowFlipClick={false}
            />

            {/* Flip Control */}
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="absolute top-4 right-4 p-2 bg-black/60 rounded-full hover:bg-black/80 text-white z-50 border border-white/20"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleDownload('front')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded hover:bg-white/20 transition-colors text-sm"
            >
              <Download size={16} /> Front
            </button>
            <button
              onClick={() => handleDownload('back')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded hover:bg-white/20 transition-colors text-sm"
            >
              <Download size={16} /> Back
            </button>
          </div>

          {/* Hidden Capture Targets for Download */}
          <div className="fixed -left-[9999px] top-0 pointer-events-none" aria-hidden="true">
            <div id="card-front-preview">
              <PlayerCard player={previewPlayer} uniqueId="dl-front" isFlipped={false} />
            </div>
            <div id="card-back-preview">
              <PlayerCard player={previewPlayer} uniqueId="dl-back" isFlipped={true} />
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 max-w-xs mt-4">
            Click buttons to download specific card faces.
          </div>
        </div>
      </div>
    </div>
  );
};

