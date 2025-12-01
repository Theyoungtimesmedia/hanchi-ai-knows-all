export const BreathingSphere = () => {
  return (
    <div className="relative flex items-center justify-center w-64 h-64 mb-8">
      {/* Outer Glow */}
      <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
      
      {/* Main Sphere */}
      <div className="relative w-40 h-40 rounded-full bg-gradient-sphere shadow-sphere animate-breathe flex items-center justify-center overflow-hidden">
        {/* Highlight */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 blur-xl rounded-full transform translate-x-4 -translate-y-4" />
        
        {/* Bottom shadow */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-black/10 blur-lg rounded-b-full" />
        
        {/* Inner glow */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
      </div>
    </div>
  );
};
