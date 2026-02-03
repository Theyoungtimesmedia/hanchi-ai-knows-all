export const NoseSphere = () => {
  return (
    <div className="relative flex items-center justify-center w-36 h-36 mb-6">
      {/* Outer Glow */}
      <div className="absolute inset-0 bg-primary/15 rounded-full blur-3xl animate-pulse" />
      
      {/* Glow Ring */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/20 to-transparent animate-breathe" />
      
      {/* Main Sphere */}
      <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/70 shadow-sphere flex items-center justify-center nose-sphere">
        {/* Nose Emoji */}
        <span className="text-5xl drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}>
          👃🏿
        </span>
        
        {/* Inner highlight */}
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
        
        {/* Bottom shadow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-primary/30 blur-xl rounded-full" />
      </div>
      
      {/* Floating particles */}
      <div className="absolute top-2 right-4 w-2.5 h-2.5 bg-primary/50 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
      <div className="absolute bottom-4 left-2 w-2 h-2 bg-primary/40 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
      <div className="absolute top-8 left-0 w-1.5 h-1.5 bg-primary/30 rounded-full animate-ping" style={{ animationDuration: '2.5s' }} />
    </div>
  );
};
