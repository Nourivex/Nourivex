// Elegant, minimalist vector badge for Nouri (the polar bear companion)
// Designed to look crisp, professional, and subtle like a modern dev tool icon.

export function nouriMark({ size = 48, bg = '#F8FAFC', border = '#E2E8F0' } = {}) {
  const s = size;
  const r = size * 0.28;
  return `
  <g>
    <!-- Background Circle / Squircle -->
    <rect width="${s}" height="${s}" rx="${r}" fill="${bg}" stroke="${border}" stroke-width="1.2"/>
    
    <!-- Nouri minimalist icon (scaled to fit nicely inside) -->
    <g transform="translate(${s * 0.22} ${s * 0.22}) scale(${s * 0.56 / 32})">
      <!-- Bear Ears -->
      <circle cx="8" cy="8" r="4.5" fill="#E2E8F0"/>
      <circle cx="8" cy="8" r="2.5" fill="#CBD5E1"/>
      <circle cx="24" cy="8" r="4.5" fill="#E2E8F0"/>
      <circle cx="24" cy="8" r="2.5" fill="#CBD5E1"/>
      
      <!-- Bear Head -->
      <path d="M6 14 C6 9, 26 9, 26 14 C27 20, 25 24, 16 24 C7 24, 5 20, 6 14 Z" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.2"/>
      
      <!-- Sleek Cyber Visor -->
      <rect x="7" y="12" width="18" height="6.5" rx="3.2" fill="#0F172A"/>
      <!-- Visor neon HUD eyes -->
      <rect x="10" y="14" width="3" height="2.2" rx="0.8" fill="#38BDF8"/>
      <rect x="19" y="14" width="3" height="2.2" rx="0.8" fill="#38BDF8"/>
      <circle cx="24.2" cy="15" r="0.8" fill="#10B981"/>
      
      <!-- Snout & Nose -->
      <circle cx="16" cy="20.5" r="1.4" fill="#0F172A"/>
      
      <!-- Violet Signature Dev Scarf -->
      <path d="M8 23 C11 22, 21 22, 24 23 C25 25, 23 27, 16 27 C9 27, 7 25, 8 23 Z" fill="#7C3AED"/>
      <path d="M20 25 L22 30 L25 30 L23 25 Z" fill="#6D28D9"/>
    </g>
  </g>
  `;
}
