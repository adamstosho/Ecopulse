import React from "react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    title: "Track Your Impact",
    desc: "Log daily activities and visualize your carbon footprint with beautiful charts.",
    icon: "🌍",
  },
  {
    title: "Set Goals & Achieve",
    desc: "Set weekly CO₂ goals, track progress, and celebrate your eco milestones.",
    icon: "🎯",
  },
  {
    title: "Earn Badges",
    desc: "Unlock achievements for sustainable actions and share your progress.",
    icon: "🏅",
  },
  {
    title: "Personalized Tips",
    desc: "Get actionable, local tips to reduce your environmental impact.",
    icon: "💡",
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-blue-100 via-sand-light-100 to-earth-green-50 overflow-x-hidden">
      {/* Animated Hero Section */}
      <div className="relative flex-1 flex flex-col items-center justify-center text-center py-20 px-4">
        {/* Animated SVG background */}
        <svg className="absolute inset-0 w-full h-full animate-pulse-slow pointer-events-none" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill="#bae6fd" fillOpacity="0.5" d="M0,320L60,293.3C120,267,240,213,360,197.3C480,181,600,203,720,229.3C840,256,960,288,1080,288C1200,288,1320,256,1380,240L1440,224L1440,600L1380,600C1320,600,1200,600,1080,600C960,600,840,600,720,600C600,600,480,600,360,600C240,600,120,600,60,600L0,600Z" />
          <path fill="#4a9f4a" fillOpacity="0.2" d="M0,480L80,469.3C160,459,320,437,480,432C640,427,800,437,960,432C1120,427,1280,405,1360,394.7L1440,384L1440,600L1360,600C1280,600,1120,600,960,600C800,600,640,600,480,600C320,600,160,600,80,600L0,600Z" />
        </svg>
        {/* Logo and Title */}
        <img src="/ecopulse-logo.svg" alt="EcoPulse Logo" className="w-20 h-20 mx-auto mb-4 animate-fade-in" />
        <h1 className="text-5xl md:text-6xl font-extrabold text-earth-green-700 drop-shadow-lg animate-slide-up mb-4">EcoPulse</h1>
        <p className="text-xl md:text-2xl text-charcoal-700 mb-8 animate-fade-in delay-200 max-w-2xl mx-auto">
          Take charge of your carbon footprint. Track, reduce, and celebrate your eco journey with the most beautiful sustainability app.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-8 py-4 bg-earth-green-600 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-earth-green-700 focus:ring-4 focus:ring-sky-blue-300 transition-all animate-bounce"
        >
          Get Started
        </button>
        {/* Motion illustration (animated SVG) */}
        <div className="mt-12 flex justify-center">
          <svg className="w-64 h-64 animate-float" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="128" cy="200" rx="90" ry="18" fill="#bae6fd" fillOpacity="0.5" />
            <circle cx="128" cy="110" r="70" fill="#4a9f4a" fillOpacity="0.7" />
            <path d="M88 120c10-20 18-30 28-30s18 10 28 30" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
            <circle cx="128" cy="110" r="20" fill="#bae6fd" />
            <path d="M128 90v40" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      {/* Features Section */}
      <div className="relative z-10 py-16 px-4 bg-white/80 backdrop-blur-md">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-earth-green-700 mb-10 animate-fade-in">Why EcoPulse?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <div key={f.title} className="glass-card p-8 flex flex-col items-center text-center shadow-xl hover:scale-105 transition-transform duration-300 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="text-5xl mb-4 animate-bounce-slow">{f.icon}</div>
              <h3 className="text-xl font-semibold text-charcoal-800 mb-2">{f.title}</h3>
              <p className="text-charcoal-600 text-base">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Footer */}
      <footer className="py-8 text-center text-charcoal-500 text-sm bg-sand-light-100 border-t border-sand-light-200 animate-fade-in">

        <p>&copy; {new Date().getFullYear()} EcoPulse. Made with <span className="text-red-500">♥</span> by ART_Redox for a greener future.</p>
        <p>Powered by DLT_Africa</p>
      </footer>
      {/* Animations */}
      <style>{`
        .animate-fade-in { animation: fadeIn 1s both; }
        .animate-fade-in.delay-200 { animation-delay: 0.2s; }
        .animate-slide-up { animation: slideUp 1s both; }
        .animate-bounce-slow { animation: bounce 2s infinite alternate; }
        .animate-float { animation: float 4s ease-in-out infinite alternate; }
        .animate-pulse-slow { animation: pulse 8s infinite alternate; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0% { transform: translateY(0); } 100% { transform: translateY(-10px); } }
        @keyframes float { 0% { transform: translateY(0); } 100% { transform: translateY(-20px); } }
        @keyframes pulse { 0% { opacity: 1; } 100% { opacity: 0.7; } }
      `}</style>
    </div>
  );
};

export default Landing; 