import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-primary-500/30 font-sans overflow-hidden">
      {/* Background Ambient Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[30%] left-[20%] w-[50%] h-[50%] rounded-full bg-primary-600/10 blur-[150px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-emerald-600/10 blur-[120px]" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-32 pb-24 min-h-screen flex flex-col justify-center">
        
        {/* Hero Header */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16 animate-fade-in-up">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 backdrop-blur-md transition-all hover:bg-white/10 cursor-default">
            <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
            <span className="text-xs sm:text-sm font-medium text-zinc-300 tracking-wide uppercase">SDSAS Enterprise Platform Live</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[1.05]">
            Transit logic, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-primary-200 to-zinc-400">
              perfectly synced.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl font-light leading-relaxed">
            Elevate your fleet monitoring and commute experience with our next-generation geo-spatial tracking and smart allocation engine.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
             <Link to="/register?role=Passenger" className="group relative inline-flex items-center justify-center px-8 py-4 text-sm font-semibold text-zinc-900 bg-primary-400 rounded-xl overflow-hidden transition-all hover:bg-primary-300 hover:scale-[1.02] hover:shadow-[0_0_30px_-5px_rgba(74,222,128,0.4)]">
               Find a Ride
               <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
             </Link>
             <Link to="/register?role=Driver" className="inline-flex items-center justify-center px-8 py-4 text-sm font-semibold text-zinc-300 bg-zinc-900/50 border border-zinc-800 rounded-xl transition-all hover:bg-zinc-800 hover:text-white hover:scale-[1.02] backdrop-blur-md">
               Offer a Ride
             </Link>
          </div>
        </div>
        
        {/* Sleek Search Interface */}
        <div className="w-full max-w-5xl mx-auto p-[1px] rounded-2xl bg-gradient-to-b from-zinc-700/50 to-zinc-800/10 shadow-2xl backdrop-blur-xl mb-12 transform hover:scale-[1.01] transition-transform duration-500">
          <div className="bg-[#121214]/90 rounded-2xl p-3 md:p-4 flex flex-col md:flex-row gap-3">
            
            <div className="flex-1 relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 h-5 w-5 transition-colors group-focus-within:text-primary-400" />
              <input type="text" placeholder="Origin point" className="w-full bg-[#1A1A1D] pl-12 pr-4 py-4 rounded-xl text-zinc-100 placeholder-zinc-500 border border-transparent focus:border-primary-500/30 focus:bg-[#222226] focus:outline-none transition-all text-sm md:text-base" />
            </div>
            
            <div className="flex-1 relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 h-5 w-5 transition-colors group-focus-within:text-primary-400" />
              <input type="text" placeholder="Destination point" className="w-full bg-[#1A1A1D] pl-12 pr-4 py-4 rounded-xl text-zinc-100 placeholder-zinc-500 border border-transparent focus:border-primary-500/30 focus:bg-[#222226] focus:outline-none transition-all text-sm md:text-base" />
            </div>
            
            <div className="flex-[0.7] relative group">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 h-5 w-5 transition-colors group-focus-within:text-primary-400" />
              <input type="date" className="w-full bg-[#1A1A1D] pl-12 pr-4 py-4 rounded-xl text-zinc-400 border border-transparent focus:border-primary-500/30 focus:bg-[#222226] focus:outline-none transition-all text-sm md:text-base [color-scheme:dark]" />
            </div>

            <div className="relative group md:max-w-[110px]">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 h-5 w-5 transition-colors group-focus-within:text-primary-400" />
              <input type="number" min="1" defaultValue="1" className="w-full bg-[#1A1A1D] pl-12 pr-4 py-4 rounded-xl text-zinc-100 border border-transparent focus:border-primary-500/30 focus:bg-[#222226] focus:outline-none transition-all text-sm md:text-base" />
            </div>

            <button className="bg-zinc-100 text-zinc-900 font-bold py-4 px-8 rounded-xl hover:bg-white transition-all flex items-center justify-center hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)] whitespace-nowrap">
              <Search className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Search Route</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;
