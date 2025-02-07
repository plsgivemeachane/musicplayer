import React from 'react';

interface StarfallBackgroundProps {
  starCount?: number;
}

export const StarfallBackground: React.FC<StarfallBackgroundProps> = ({ starCount = 40 }) => {
  const generateStarAnimations = () => {
    const animations = [];
    for (let i = 1; i <= starCount; i++) {
      const startX = Math.floor(Math.random() * 100);
      const endX = startX + Math.floor(Math.random() * 20) - 10;
      const delay = Math.random() * 9;
      
      animations.push({
        animationName: `anim${i}`,
        startX,
        endX,
        delay
      });
    }
    return animations;
  };

  const starAnimations = generateStarAnimations();

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
    >
      {starAnimations.map((star, index) => (
        <div
          key={index}
          className="absolute w-2 h-2 bg-cyan-500 rounded-full opacity-50"
          style={{
            transform: `translateX(${star.startX}vw) translateY(-8px)`,
            animation: `fall${index + 1} 4s infinite`,
            animationDelay: `${star.delay}s`
          }}
        />
      ))}

      <style jsx>{`
        ${starAnimations.map((star, index) => `
          @keyframes fall${index + 1} {
            10% { opacity: 0.5; }
            12% { 
              opacity: 1; 
              box-shadow: 0 0 3px 0 #fff;
            }
            15% { opacity: 0.5; }
            50% { opacity: 0; }
            100% { 
              transform: translateX(${star.endX}vw) translateY(100vh);
              opacity: 0;
            }
          }
        `).join('\n')}
      `}</style>
    </div>
  );
};

export default StarfallBackground;
