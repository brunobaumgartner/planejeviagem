interface LogoProps {
  size?: number;
  variant?: "full" | "icon" | "text";
  className?: string;
}

export function Logo({ size = 40, variant = "full", className = "" }: LogoProps) {
  if (variant === "icon") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Letra P estilizada como caminho */}
        <path
          d="M 25 85 L 25 15 C 25 15, 45 10, 60 20 C 75 30, 75 45, 60 55 C 50 62, 35 60, 25 55"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Pontos de etapas ao longo do caminho */}
        {/* Ponto inicial (início da viagem) */}
        <circle cx="25" cy="15" r="5" fill="currentColor" />
        
        {/* Ponto 1 (primeira etapa) */}
        <circle cx="45" cy="18" r="4" fill="currentColor" opacity="0.8" />
        
        {/* Ponto 2 (segunda etapa) */}
        <circle cx="65" cy="30" r="4" fill="currentColor" opacity="0.8" />
        
        {/* Ponto 3 (terceira etapa) */}
        <circle cx="70" cy="45" r="4" fill="currentColor" opacity="0.8" />
        
        {/* Ponto 4 (quarta etapa) */}
        <circle cx="60" cy="55" r="4" fill="currentColor" opacity="0.8" />
        
        {/* Ponto final (destino) - destacado */}
        <circle cx="25" cy="55" r="5" fill="currentColor">
          <animate
            attributeName="r"
            values="5;6.5;5"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    );
  }

  if (variant === "text") {
    return (
      <span className={`text-lg font-medium ${className}`}>
        Planeje Viagem
      </span>
    );
  }

  // variant === "full"
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Letra P como caminho */}
        <path
          d="M 25 85 L 25 15 C 25 15, 45 10, 60 20 C 75 30, 75 45, 60 55 C 50 62, 35 60, 25 55"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Pontos de etapas */}
        <circle cx="25" cy="15" r="5" fill="currentColor" />
        <circle cx="45" cy="18" r="4" fill="currentColor" opacity="0.8" />
        <circle cx="65" cy="30" r="4" fill="currentColor" opacity="0.8" />
        <circle cx="70" cy="45" r="4" fill="currentColor" opacity="0.8" />
        <circle cx="60" cy="55" r="4" fill="currentColor" opacity="0.8" />
        <circle cx="25" cy="55" r="5" fill="currentColor" />
      </svg>
      <span className="text-lg">Planeje Viagem</span>
    </div>
  );
}

// Logo alternativo - versão com gradiente e sombra
export function LogoGradient({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Gradiente azul céu */}
        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
        
        {/* Sombra suave */}
        <filter id="softShadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.2"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* P com gradiente */}
      <path
        d="M 25 85 L 25 15 C 25 15, 45 10, 60 20 C 75 30, 75 45, 60 55 C 50 62, 35 60, 25 55"
        stroke="url(#pathGradient)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter="url(#softShadow)"
      />
      
      {/* Pontos com gradiente */}
      <circle cx="25" cy="15" r="5" fill="url(#pathGradient)" />
      <circle cx="45" cy="18" r="4" fill="url(#pathGradient)" opacity="0.8" />
      <circle cx="65" cy="30" r="4" fill="url(#pathGradient)" opacity="0.8" />
      <circle cx="70" cy="45" r="4" fill="url(#pathGradient)" opacity="0.8" />
      <circle cx="60" cy="55" r="4" fill="url(#pathGradient)" opacity="0.8" />
      <circle cx="25" cy="55" r="5" fill="url(#pathGradient)" />
    </svg>
  );
}

// Logo versão circular - perfeito para app icon
export function LogoCircular({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Círculo de fundo */}
      <circle cx="50" cy="50" r="48" fill="currentColor" />
      
      {/* P em branco */}
      <path
        d="M 35 75 L 35 25 C 35 25, 50 22, 62 30 C 72 37, 72 48, 62 55 C 54 60, 43 58, 35 53"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Pontos em branco */}
      <circle cx="35" cy="25" r="4" fill="white" />
      <circle cx="50" cy="27" r="3" fill="white" opacity="0.9" />
      <circle cx="65" cy="35" r="3" fill="white" opacity="0.9" />
      <circle cx="68" cy="48" r="3" fill="white" opacity="0.9" />
      <circle cx="62" cy="55" r="3" fill="white" opacity="0.9" />
      <circle cx="35" cy="53" r="4" fill="white" />
    </svg>
  );
}

// Logo para splash screen - versão grande e animada
export function LogoSplash({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      <div className="relative">
        {/* Círculo de fundo com blur */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-100 to-sky-200 rounded-full blur-3xl opacity-60" 
             style={{ width: '160px', height: '160px', left: '-20px', top: '-20px' }} />
        
        {/* Logo principal animado */}
        <svg
          width={120}
          height={120}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative text-sky-500"
        >
          {/* Caminho P - desenha da esquerda para direita */}
          <path
            d="M 25 85 L 25 15 C 25 15, 45 10, 60 20 C 75 30, 75 45, 60 55 C 50 62, 35 60, 25 55"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="animate-fade-in"
            style={{ 
              strokeDasharray: '300',
              strokeDashoffset: '300',
              animation: 'drawPath 1.5s ease-out forwards, fade-in 0.3s ease-out forwards'
            }}
          />
          
          {/* Pontos aparecem em sequência */}
          <circle 
            cx="25" cy="15" r="5" 
            fill="currentColor"
            className="animate-fade-in"
            style={{ animationDelay: '0.3s' }}
          />
          <circle 
            cx="45" cy="18" r="4" 
            fill="currentColor" 
            opacity="0.8"
            className="animate-fade-in"
            style={{ animationDelay: '0.5s' }}
          />
          <circle 
            cx="65" cy="30" r="4" 
            fill="currentColor" 
            opacity="0.8"
            className="animate-fade-in"
            style={{ animationDelay: '0.7s' }}
          />
          <circle 
            cx="70" cy="45" r="4" 
            fill="currentColor" 
            opacity="0.8"
            className="animate-fade-in"
            style={{ animationDelay: '0.9s' }}
          />
          <circle 
            cx="60" cy="55" r="4" 
            fill="currentColor" 
            opacity="0.8"
            className="animate-fade-in"
            style={{ animationDelay: '1.1s' }}
          />
          <circle 
            cx="25" cy="55" r="5" 
            fill="currentColor"
            className="animate-fade-in"
            style={{ animationDelay: '1.3s' }}
          />
        </svg>
      </div>
      
      <div className="text-center animate-fade-in" style={{ animationDelay: '1.5s' }}>
        <h1 className="text-3xl text-gray-800 mb-1">Planeje Viagem</h1>
        <p className="text-sm text-gray-600">Viajar pode ser leve</p>
      </div>
    </div>
  );
}