import { LogoTriIA } from '@/components/marca/LogoTriIA';

export function Footer() {
  return (
    <footer className="bg-primary text-white print:hidden">
      <div className="container mx-auto px-8 max-w-[1400px] py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <LogoTriIA tamanho={28} escuro />
        <p className="text-[13px] text-white/75">
          Trabalho de Conclusão de Curso · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
