import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { NAV_ITEMS } from '@/lib/nav';
import { formatarDataHora, rotuloPeriodo } from '../format';
import type { Periodo } from '../types';
import { FiltroPeriodo } from './FiltroPeriodo';

interface LayoutRelatorioProps {
  titulo: string;
  descricao: string;
  sobretitulo?: string;
  voltar?: { rotulo: string; para: string };
  periodo: Periodo;
  onPeriodo: (periodo: Periodo) => void;
  geradoEm?: string;
  /** false esconde filtro e Imprimir (ex.: vaga não encontrada). */
  controles?: boolean;
  children?: ReactNode;
}

export function LayoutRelatorio({
  titulo, descricao, sobretitulo, voltar, periodo, onPeriodo, geradoEm, controles = true, children,
}: LayoutRelatorioProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans print:bg-white">
      <Header navItems={NAV_ITEMS} />

      <main className="flex-grow">
        <div className="container mx-auto max-w-[1400px] px-8 pb-16 pt-8 print:max-w-none print:px-0 print:pb-0 print:pt-0">
          {voltar && (
            <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 gap-1.5 text-on-surface-variant hover:text-primary print:hidden">
              <Link to={voltar.para}>
                <ArrowLeft className="h-4 w-4" />
                {voltar.rotulo}
              </Link>
            </Button>
          )}

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              {sobretitulo && (
                <p className="mb-1 text-[12px] font-bold uppercase tracking-wider text-on-surface-variant">{sobretitulo}</p>
              )}
              <h1 className="text-balance text-[28px] font-black leading-tight tracking-tight text-primary">{titulo}</h1>
              <p className="mt-1 text-[14px] text-on-surface-variant">{descricao}</p>
              {geradoEm && (
                <p className="mt-1 hidden text-[12px] text-on-surface-variant print:block">
                  Período: {rotuloPeriodo(periodo)}. Gerado em {formatarDataHora(geradoEm)}.
                </p>
              )}
            </div>

            {controles && (
              <div className="flex flex-wrap items-center gap-3 print:hidden">
                <FiltroPeriodo valor={periodo} onChange={onPeriodo} />
                <Button variant="outline" className="gap-2 bg-white" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" />
                  Imprimir
                </Button>
              </div>
            )}
          </div>

          {children && <div className="mt-8">{children}</div>}
        </div>
      </main>

      <Footer />
    </div>
  );
}
