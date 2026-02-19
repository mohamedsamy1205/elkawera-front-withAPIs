import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { EnhancedRegistrationForm } from '@/components/EnhancedRegistrationForm';
import { saveTeam, saveCaptainStats } from '@/utils/db';
import { Team, CaptainStats } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { Upload } from 'lucide-react';
import axios from 'axios';
import { profileEndpoint } from '@/types/APIs';

export const CaptainSignUp: React.FC = () => {
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const [teamName, setTeamName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [teamLogoFile, setTeamLogoFile] = useState<string | null>(null);
    const [teamLogoPreview, setTeamLogoPreview] = useState<string | null>(null);
    const [abbbreviation, setAbbreviation] = useState('');
    const [color, setColor] = useState('#00ff9d"');

    const handleSubmit = async (formData: any) => {
        setIsSubmitting(true);
        setError('');
        
        try {
            const newUser = {
                    name: formData.name,
                    email: formData.email,
                    phoneNumber: formData.phone,
                    password: formData.password,
                    role: "CAPTAIN",
                    data:{
                            abbreviation : abbbreviation,
                            teamName: teamName,
                            logo: teamLogoFile,
                            teamColor:color
                    }
            };
            console.log(newUser);
            const response = await axios.post('http://localhost:8080/api/v1/auth/register', newUser);
            localStorage.setItem('token', response.data);
            const profile = await profileEndpoint()
            localStorage.setItem('profile',JSON.stringify(profile))
            navigate('/captain/dashboard');
            window.location.reload()
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(typeof err === 'string' ? err : 'Registration failed');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const additionalFields = (
        <>
            <div>
                <label className="block text-xs uppercase text-gray-400 mb-2 font-bold tracking-wider">Age</label>
                <input
                    type="number"
                    name="age"
                    min="18"
                    max="70"
                    required
                    defaultValue={18}
                    className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-white focus:border-elkawera-accent focus:outline-none transition-colors"
                />
            </div>

            {/* Team Information */}
            <div className="space-y-4 pt-6 border-t border-white/10">
                <h2 className="text-xl font-bold text-elkawera-accent uppercase tracking-wide">Team Information</h2>

                <div>
                    <label className="block text-xs uppercase text-gray-400 mb-2 font-bold tracking-wider">Team Name</label>
                    <input
                        onChange={(e) => setTeamName(e.target.value)}
                        type="text"
                        name="teamName"
                        required
                        className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-white focus:border-elkawera-accent focus:outline-none transition-colors"
                        placeholder="e.g. Thunder FC"
                    />
                </div>
                <div>
                    <label className="block text-xs uppercase text-gray-400 mb-2 font-bold tracking-wider">
                        Abbreviation (2-4 chars)
                    </label>
                    <input
                        onChange={(e) => setAbbreviation(e.target.value)}
                        type="text"
                        name="teamAbbreviation"
                        required
                        minLength={2}
                        maxLength={4}
                        className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-white focus:border-elkawera-accent focus:outline-none transition-colors uppercase"
                        placeholder="e.g. TFC"
                    />
                </div>

                <div>
                    <label className="block text-xs uppercase text-gray-400 mb-2 font-bold tracking-wider">Team Color</label>
                    <div className="flex items-center gap-4">
                        <input
                            type="color"
                            name="teamColor"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-20 h-12 rounded-lg cursor-pointer bg-black/50 border border-white/20"
                        />
                        <span className="text-gray-300">#00ff9d</span>
                    </div>
                </div>

                <div>
                    <label className="block text-xs uppercase text-gray-400 mb-2 font-bold tracking-wider">
                        Team Logo (Optional, max 2MB)
                    </label>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 px-4 py-3 bg-black/50 border border-white/20 rounded-xl cursor-pointer hover:border-elkawera-accent transition-colors">
                            <Upload size={18} className="text-gray-400" />
                            <span className="text-sm text-gray-300">Upload Logo</span>
                            <input
                                type="file"
                                accept="image/*"
                                  onChange={(e) => {
                                    if (!e.target.files || !e.target.files[0]) return;

                                    const file = e.target.files[0];

                                    setTeamLogoFile(file); // ده اللي هنبعته
                                    setTeamLogoPreview(URL.createObjectURL(file)); // ده للعرض
                                }}
                                className="hidden"
                            />
                        </label>
                        {teamLogoPreview && (
                            <img src={teamLogoPreview} alt="Team Logo" className="w-12 h-12 rounded-lg object-cover border border-white/20" />
                        )}
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <EnhancedRegistrationForm
            role="captain"
            onSubmit={handleSubmit}
            title="Captain Sign-Up"
            subtitle="Create your team and start your journey as a captain"
            additionalFields={additionalFields}
        />
    );
};

