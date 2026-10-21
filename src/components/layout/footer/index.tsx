export function Footer() {
  return (
    <footer className="bg-primary text-white print:hidden">
      <div className="container mx-auto px-8 max-w-[1400px] py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col leading-none">
          <span className="text-[16px] font-black tracking-[-0.02em]">RECURSOS</span>
          <span className="text-[16px] font-normal">HUMANOS</span>
        </div>
        <p className="text-[13px] text-white/75">
          Trabalho de Conclusão de Curso · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
