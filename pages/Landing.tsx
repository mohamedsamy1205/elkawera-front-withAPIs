
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, Shield, TrendingUp, Users } from 'lucide-react';
import { StatProgression } from '../components/StatProgression';

export const Landing: React.FC = () => {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative pt-10 pb-20 lg:pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <h1 className="text-5xl lg:text-7xl font-display font-bold uppercase leading-tight text-white">
              Manage Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-elkawera-accent to-emerald-500">Dynasty</span>
            </h1>
            <p className="text-gray-400 text-lg lg:text-xl max-w-xl">
              The professional platform for tracking player evolution. Create teams, assign positions, and visualize stats progression after every match.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/create" 
                className="inline-flex items-center px-8 py-4 bg-elkawera-accent text-elkawera-black rounded-full font-bold text-lg hover:bg-white transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(0,255,157,0.3)]"
              >
                Create Player <ChevronRight className="ml-2" />
              </Link>
              <Link 
                to="/teams" 
                className="inline-flex items-center px-8 py-4 border border-gray-600 text-white rounded-full font-bold text-lg hover:border-elkawera-accent hover:text-elkawera-accent transition-colors"
              >
                Manage Teams
              </Link>
            </div>
            <div className="pt-4">
                 <Link 
                  to="/dashboard" 
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white/10 text-white rounded-lg font-bold hover:bg-white/20 transition-all border border-white/10 hover:border-white/30"
                >
                  <Users size={20} /> View Database Cards
                </Link>
            </div>
          </div>
          
          <div className="flex justify-center lg:justify-end relative">
             <div className="absolute -inset-4 bg-elkawera-accent/10 blur-3xl rounded-full z-0"></div>
             <div className="w-full z-10 animate-fade-in-up delay-100">
                <StatProgression />
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-4 gap-8 text-center">
         <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-elkawera-accent rounded-full flex items-center justify-center mx-auto mb-4 text-black">
               <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Dynamic Stats</h3>
            <p className="text-gray-400 text-sm">Update attributes after every match to recalculate Overall Ratings.</p>
         </div>
         <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
               <Users size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Team Management</h3>
            <p className="text-gray-400 text-sm">Create squads, assign players, and manage multiple teams easily.</p>
         </div>
         <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
               <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Tier System</h3>
            <p className="text-gray-400 text-sm">Evolve cards from Silver to Gold to Platinum based on performance.</p>
         </div>
         <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-colors">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
               <TrendingUp size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Analytics</h3>
            <p className="text-gray-400 text-sm">Visualize growth over time and track your squad's progression.</p>
         </div>
      </section>
    </div>
  );
};