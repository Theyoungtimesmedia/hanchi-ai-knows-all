export const NoseSphere = () => {
  return (
    <div className="relative flex items-center justify-center w-40 h-40 mb-8">
      {/* Outer Glow */}
      <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      
      {/* Main Circle */}
      <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-xl animate-breathe flex items-center justify-center">
        {/* Nose Emoji */}
        <span className="text-6xl animate-bounce" style={{ animationDuration: '2s' }}>
          👃🏿
        </span>
        
        {/* Inner glow */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
      </div>
      
      {/* Floating particles */}
      <div className="absolute top-4 right-6 w-2 h-2 bg-primary/40 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
      <div className="absolute bottom-6 left-4 w-1.5 h-1.5 bg-primary/30 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
    </div>
  );
};
