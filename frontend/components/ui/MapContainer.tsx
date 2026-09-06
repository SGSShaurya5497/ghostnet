import { ReactNode } from 'react';

interface MapContainerProps {
  children?: ReactNode;
  className?: string;
  showGrid?: boolean;
}

export default function MapContainer({ children, className = '', showGrid = true }: MapContainerProps) {
  return (
    <div className={`relative w-full h-full bg-[#161b22] overflow-hidden ${className}`}>
      {/* Fake Map Grid & Base Styling matching reference screenshots */}
      
      {showGrid && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #ffffff 1px, transparent 1px),
              linear-gradient(to bottom, #ffffff 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        ></div>
      )}

      {/* Vignette effect */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"></div>

      {children}
    </div>
  );
}
