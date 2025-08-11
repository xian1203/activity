export const FloatingElements = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Large floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-primary rounded-full blur-3xl opacity-20 animate-pulse" 
           style={{ animationDuration: '4s' }} />
      <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-secondary rounded-full blur-3xl opacity-15 animate-pulse"
           style={{ animationDuration: '6s', animationDelay: '2s' }} />
      <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-gradient-accent rounded-full blur-3xl opacity-10 animate-pulse"
           style={{ animationDuration: '5s', animationDelay: '1s' }} />
      
      {/* Small floating particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-primary rounded-full opacity-30 animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${2 + Math.random() * 3}s`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
};