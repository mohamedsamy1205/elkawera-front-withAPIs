
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { EnhancedRegistrationForm } from '@/components/EnhancedRegistrationForm';
import { registerScout } from '@/utils/db';
import { ScoutType } from '@/types';
import { Briefcase, Building2, MapPin } from 'lucide-react';
import axios from 'axios';
import { profileEndpoint } from '@/types/APIs';

export const ScoutSignUp: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [scoutType, setScoutType] = useState<ScoutType>('Independent');
    const [organization, setOrganization] = useState('');

    const { user, signIn } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    const handleSubmit = async (formData: any) => {
        setIsSubmitting(true);
        setError('');

        try {
            const newUser = {
                    name: formData.name,
                    email: formData.email,
                    phoneNumber: formData.phone,
                    password: formData.password,
                    role: "SCOUTER",
                    data:{
                        scoutType: scoutType,
                        organization: organization
                    }
            };
            // console.log(newUser);
            const response = await axios.post('http://localhost:8080/api/v1/auth/register', newUser);
            localStorage.setItem('token', response.data);
            const profile = await profileEndpoint()
            localStorage.setItem('profile',JSON.stringify(profile))
            navigate('/scout/dashboard');
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
        <div className="border-t border-white/10 pt-4 mt-4">
            <label className="block text-xs uppercase text-gray-400 mb-2 font-bold tracking-wider flex items-center gap-2">
                <Briefcase size={14} /> Scout Type
            </label>
            <select
                value={scoutType}
                onChange={(e) => setScoutType(e.target.value as ScoutType)}
                className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-white focus:border-elkawera-accent focus:outline-none transition-colors appearance-none"
            >
                <option value="Independent">Independent Scout</option>
                <option value="Club">Club / Academy Scout</option>
            </select>

            <div className="mt-4">
                <label className="block text-xs uppercase text-gray-400 mb-2 font-bold tracking-wider flex items-center gap-2">
                    {scoutType === 'Club' ? <Building2 size={14} /> : <MapPin size={14} />}
                    {scoutType === 'Club' ? 'Club / Academy Name' : 'City / Region'} (Optional)
                </label>
                <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-white focus:border-elkawera-accent focus:outline-none transition-colors"
                    placeholder={scoutType === 'Club' ? "e.g. Al Ahly Academy" : "e.g. Cairo"}
                />
            </div>
        </div>
    );

    return (
        <EnhancedRegistrationForm
            role="SCOUTER"
            onSubmit={handleSubmit}
            title="Scout Registration"
            subtitle="Discover talent. Track performance. Build future."
            additionalFields={additionalFields}
        />
    );
};

