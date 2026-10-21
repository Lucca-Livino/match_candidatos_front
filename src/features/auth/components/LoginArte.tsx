import { useEffect, useRef } from 'react';

// Coordenadas no espaço do viewBox (1200 x 1600).
const LARGURA = 1200;
const ALTURA = 1600;
const RAIO_INFLUENCIA = 260;

const NOS = [
  { x: 240, y: 420, r: 5 },
  { x: 520, y: 300, r: 7 },
  { x: 820, y: 470, r: 9 },
  { x: 1010, y: 330, r: 5 },
  { x: 610, y: 640, r: 6 },
  { x: 380, y: 760, r: 4 },
  { x: 900, y: 820, r: 5 },
  { x: 1060, y: 700, r: 4 },
];

const ARESTAS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [1, 4], [4, 2], [4, 6], [6, 7], [0, 5], [5, 4],
];

// O nó principal ganha os anéis de pulso.
const NO_DESTAQUE = 2;

export function LoginArte() {
  const svgRef = useRef<SVGSVGElement>(null);
  const gradeRef = useRef<SVGGElement>(null);
  const planosRef = useRef<SVGGElement>(null);
  const luzRef = useRef<SVGCircleElement>(null);
  const aneisRef = useRef<SVGGElement>(null);
  const nosRef = useRef<(SVGCircleElement | null)[]>([]);
  const halosRef = useRef<(SVGCircleElement | null)[]>([]);
  const arestasRef = useRef<(SVGLineElement | null)[]>([]);
  const ligacoesRef = useRef<(SVGLineElement | null)[]>([]);

  useEffect(() => {
    const svg = svgRef.current;
    const area = svg?.parentElement;
    if (!svg || !area) return;

    const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const alvo = { x: LARGURA / 2, y: ALTURA / 2, ativo: 0 };
    const atual = { ...alvo };
    const posicoes = NOS.map(n => ({ x: n.x, y: n.y }));
    const proximidade = NOS.map(() => 0);

    const mover = (e: PointerEvent) => {
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
      alvo.x = p.x;
      alvo.y = p.y;
      alvo.ativo = 1;
    };
    const sair = () => {
      alvo.x = LARGURA / 2;
      alvo.y = ALTURA / 2;
      alvo.ativo = 0;
    };

    area.addEventListener('pointermove', mover);
    area.addEventListener('pointerleave', sair);

    let raf = 0;
    const inicio = performance.now();

    const quadro = (agora: number) => {
      const suavizar = reduzir ? 1 : 0.08;
      atual.x += (alvo.x - atual.x) * suavizar;
      atual.y += (alvo.y - atual.y) * suavizar;
      atual.ativo += (alvo.ativo - atual.ativo) * suavizar;

      if (!reduzir) {
        const dx = atual.x / LARGURA - 0.5;
        const dy = atual.y / ALTURA - 0.5;
        gradeRef.current?.setAttribute('transform', `translate(${-dx * 16} ${-dy * 16})`);
        planosRef.current?.setAttribute('transform', `translate(${-dx * 48} ${-dy * 48})`);
      }

      luzRef.current?.setAttribute('cx', String(atual.x));
      luzRef.current?.setAttribute('cy', String(atual.y));
      luzRef.current?.setAttribute('opacity', String(atual.ativo));

      const t = (agora - inicio) / 1000;

      NOS.forEach((no, i) => {
        const flutuaX = reduzir ? 0 : Math.sin(t * 0.6 + i * 1.7) * 6;
        const flutuaY = reduzir ? 0 : Math.cos(t * 0.5 + i * 2.3) * 6;
        let x = no.x + flutuaX;
        let y = no.y + flutuaY;

        const d = Math.hypot(atual.x - x, atual.y - y);
        const p = Math.max(0, 1 - d / RAIO_INFLUENCIA) * atual.ativo;
        // Atração leve: o nó "procura" o cursor sem colar nele.
        x += (atual.x - x) * p * p * 0.3;
        y += (atual.y - y) * p * p * 0.3;

        posicoes[i].x = x;
        posicoes[i].y = y;
        proximidade[i] = p;

        const circulo = nosRef.current[i];
        circulo?.setAttribute('cx', String(x));
        circulo?.setAttribute('cy', String(y));
        circulo?.setAttribute('r', String(no.r * (1 + p * 0.9)));

        const halo = halosRef.current[i];
        halo?.setAttribute('cx', String(x));
        halo?.setAttribute('cy', String(y));
        halo?.setAttribute('opacity', String(p));

        const ligacao = ligacoesRef.current[i];
        ligacao?.setAttribute('x1', String(atual.x));
        ligacao?.setAttribute('y1', String(atual.y));
        ligacao?.setAttribute('x2', String(x));
        ligacao?.setAttribute('y2', String(y));
        ligacao?.setAttribute('stroke-opacity', String(p * 0.55));
      });

      ARESTAS.forEach(([a, b], i) => {
        const linha = arestasRef.current[i];
        linha?.setAttribute('x1', String(posicoes[a].x));
        linha?.setAttribute('y1', String(posicoes[a].y));
        linha?.setAttribute('x2', String(posicoes[b].x));
        linha?.setAttribute('y2', String(posicoes[b].y));
        linha?.setAttribute('stroke-opacity', String(0.35 + Math.max(proximidade[a], proximidade[b]) * 0.45));
      });

      const destaque = posicoes[NO_DESTAQUE];
      aneisRef.current?.setAttribute('transform', `translate(${destaque.x} ${destaque.y})`);

      raf = requestAnimationFrame(quadro);
    };

    raf = requestAnimationFrame(quadro);

    return () => {
      cancelAnimationFrame(raf);
      area.removeEventListener('pointermove', mover);
      area.removeEventListener('pointerleave', sair);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${LARGURA} ${ALTURA}`}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="la-fundo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0d2645" />
          <stop offset="0.55" stopColor="#091A31" />
          <stop offset="1" stopColor="#001227" />
        </linearGradient>
        <linearGradient id="la-plano" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2b638a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#2b638a" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="la-plano-claro" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fb2d6" stopOpacity="0.35" />
          <stop offset="1" stopColor="#7fb2d6" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="la-brilho" cx="0.78" cy="0.22" r="0.6">
          <stop offset="0" stopColor="#3f86b8" stopOpacity="0.45" />
          <stop offset="1" stopColor="#3f86b8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="la-luz">
          <stop offset="0" stopColor="#5fa3d4" stopOpacity="0.28" />
          <stop offset="1" stopColor="#5fa3d4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="la-halo">
          <stop offset="0" stopColor="#cfe4f3" stopOpacity="0.55" />
          <stop offset="1" stopColor="#cfe4f3" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="la-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.45" stopColor="#001227" stopOpacity="0" />
          <stop offset="1" stopColor="#001227" stopOpacity="0.9" />
        </linearGradient>
        <pattern id="la-grade" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M80 0H0V80" fill="none" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width={LARGURA} height={ALTURA} fill="url(#la-fundo)" />
      <rect width={LARGURA} height={ALTURA} fill="url(#la-brilho)" />

      {/* Sobra nas bordas para a paralaxe não revelar o fundo. */}
      <g ref={gradeRef}>
        <rect x={-80} y={-80} width={LARGURA + 160} height={ALTURA + 160} fill="url(#la-grade)" />
      </g>

      <g ref={planosRef}>
        <g transform="rotate(-14 600 800)">
          <rect x="520" y="-200" width="380" height="1300" fill="url(#la-plano)" />
          <rect x="940" y="-100" width="220" height="1100" fill="url(#la-plano-claro)" />
          <rect x="300" y="300" width="180" height="1400" fill="url(#la-plano)" opacity="0.5" />
          <rect x="520" y="-200" width="380" height="1300" fill="none" stroke="#9cc7e6" strokeOpacity="0.25" />
          <line x1="710" y1="-200" x2="710" y2="1100" stroke="#9cc7e6" strokeOpacity="0.12" />
          <line x1="520" y1="250" x2="900" y2="250" stroke="#9cc7e6" strokeOpacity="0.12" />
          <line x1="520" y1="650" x2="900" y2="650" stroke="#9cc7e6" strokeOpacity="0.12" />
        </g>
      </g>

      <circle ref={luzRef} cx={LARGURA / 2} cy={ALTURA / 2} r="320" fill="url(#la-luz)" opacity="0" />

      <g stroke="#cfe4f3" strokeWidth="1">
        {NOS.map((no, i) => (
          <line key={i} ref={el => { ligacoesRef.current[i] = el; }} x1={no.x} y1={no.y} x2={no.x} y2={no.y} strokeOpacity="0" />
        ))}
      </g>

      <g stroke="#9cc7e6" strokeWidth="1.5">
        {ARESTAS.map(([a, b], i) => (
          <line
            key={i}
            ref={el => { arestasRef.current[i] = el; }}
            x1={NOS[a].x} y1={NOS[a].y} x2={NOS[b].x} y2={NOS[b].y}
            strokeOpacity="0.35"
          />
        ))}
      </g>

      {NOS.map((no, i) => (
        <circle key={i} ref={el => { halosRef.current[i] = el; }} cx={no.x} cy={no.y} r="34" fill="url(#la-halo)" opacity="0" />
      ))}

      <g ref={aneisRef} transform={`translate(${NOS[NO_DESTAQUE].x} ${NOS[NO_DESTAQUE].y})`} fill="none" stroke="#cfe4f3">
        <circle r="26" strokeOpacity="0.35" />
        <circle r="52" strokeOpacity="0.12" />
      </g>

      <g fill="#cfe4f3">
        {NOS.map((no, i) => (
          <circle key={i} ref={el => { nosRef.current[i] = el; }} cx={no.x} cy={no.y} r={no.r} />
        ))}
      </g>

      {/* Escurece a base para o texto. */}
      <rect width={LARGURA} height={ALTURA} fill="url(#la-base)" pointerEvents="none" />
    </svg>
  );
}

export default LoginArte;
