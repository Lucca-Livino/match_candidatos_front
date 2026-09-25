interface VagasStatsProps {
  total: number;
  ativas: number;
  pausadas: number;
  encerradas: number;
}

export function VagasStats({ total, ativas, pausadas, encerradas }: VagasStatsProps) {
  return (
    <section className="container mx-auto px-8 max-w-[1400px] py-5">
      <div className="flex items-center gap-6 text-[13px]">
        <span className="font-medium text-on-surface-variant">
          TOTAL: <strong className="text-on-surface">{total}</strong>
        </span>
        <span className="font-medium text-emerald-700">
          ATIVAS: <strong>{ativas}</strong>
        </span>
        <span className="font-medium text-yellow-700">
          PAUSADAS: <strong>{pausadas}</strong>
        </span>
        <span className="font-medium text-on-surface-variant">
          ENCERRADAS: <strong>{encerradas}</strong>
        </span>
      </div>
    </section>
  );
}
