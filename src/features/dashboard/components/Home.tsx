import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  UserPlus,
  Briefcase,
  Activity,
  MapPin,
  Calendar,
  ArrowRight,
  RefreshCw,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVagas } from "@/features/vagas/hooks/useVagas";
import { useCandidatos } from "@/features/candidatos/hooks/useCandidatos";
import type { Vaga } from "@/features/vagas/types";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { NAV_ITEMS } from "@/lib/nav";

export function Home() {
  const { vagas, loading: vagasLoading, error: vagasError, refetch: refetchVagas } = useVagas();
  const { candidatos, loading: candidatosLoading } = useCandidatos();

  const vagasAbertas = vagas.filter(
    (v) => !v.status || v.status.toLowerCase() === 'aberta' || v.status.toLowerCase() === 'ativa'
  );

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <Header navItems={NAV_ITEMS} />

      <main className="flex-grow">
        <section className="container mx-auto px-8 max-w-[1400px] mt-12 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-primary border-none p-10 flex gap-6 items-start shadow-standard rounded-md text-white">
              <div className="mt-1"><UserPlus className="h-6 w-6 opacity-70" /></div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold uppercase tracking-[0.3em] opacity-60 mb-4">CANDIDATOS</span>
                {candidatosLoading ? (
                  <Skeleton className="h-12 w-20 bg-white/20" />
                ) : (
                  <div className="flex items-baseline gap-4">
                    <span className="text-[48px] font-extrabold leading-none tracking-[-0.02em]">
                      {candidatos.length}
                    </span>
                    <span className="text-[14px] opacity-70">cadastrados</span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="bg-primary border-none p-10 flex gap-6 items-start shadow-standard rounded-md text-white">
              <div className="mt-1"><Briefcase className="h-6 w-6 opacity-70" /></div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold uppercase tracking-[0.3em] opacity-60 mb-4">VAGAS EM ABERTO</span>
                {vagasLoading ? (
                  <Skeleton className="h-12 w-20 bg-white/20" />
                ) : (
                  <div className="flex items-baseline gap-4">
                    <span className="text-[48px] font-extrabold leading-none tracking-[-0.02em]">
                      {vagasAbertas.length}
                    </span>
                    <span className="text-[14px] opacity-70">de {vagas.length} total</span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="bg-primary border-none p-10 flex gap-6 items-start shadow-standard rounded-md text-white">
              <div className="mt-1"><Activity className="h-6 w-6 opacity-70" /></div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold uppercase tracking-[0.3em] opacity-60 mb-4">TAXA DE COBERTURA</span>
                {vagasLoading || candidatosLoading ? (
                  <Skeleton className="h-12 w-20 bg-white/20" />
                ) : (
                  <div className="flex items-baseline gap-4">
                    <span className="text-[48px] font-extrabold leading-none tracking-[-0.02em]">
                      {vagas.length > 0 ? Math.round((candidatos.length / Math.max(vagas.length, 1)) * 10) : 0}x
                    </span>
                    <span className="text-[14px] opacity-70">candidatos/vaga</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </section>

        <section id="vagas" className="container mx-auto px-8 max-w-[1400px] py-16">
          <div className="flex items-end justify-between mb-10">
            <div className="space-y-2">
              <span className="text-[12px] font-bold uppercase tracking-[0.3em] text-secondary">LISTAGEM</span>
              <h2 className="text-[36px] font-black uppercase tracking-[-0.04em] text-primary">VAGAS</h2>
            </div>
            <div className="flex items-center gap-4">
              {vagasError && (
                <span className="text-[12px] text-error">Erro ao carregar</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={refetchVagas}
                className="gap-2 text-[11px] uppercase tracking-wider border-outline-variant"
              >
                <RefreshCw className="h-3 w-3" />
                Atualizar
              </Button>
            </div>
          </div>

          {vagasLoading ? (
            <VagasSkeleton />
          ) : vagas.length === 0 ? (
            <EmptyState icon={<Briefcase className="h-10 w-10 opacity-30" />} message="Nenhuma vaga cadastrada ainda." />
          ) : (
            <div className="rounded-md border border-outline-variant overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-container hover:bg-surface-container">
                    <TableHead className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Título</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface-variant hidden md:table-cell">Localização</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface-variant hidden lg:table-cell">Data</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vagas.map((vaga) => (
                    <VagaRow key={vaga.id} vaga={vaga} />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>

        <Separator className="opacity-10" />

        <section id="navegacao-rapida" className="container mx-auto px-8 max-w-[1400px] py-16">
          <div className="flex items-end justify-between mb-10">
            <div className="space-y-2">
              <span className="text-[12px] font-bold uppercase tracking-[0.3em] text-secondary">ATALHOS</span>
              <h2 className="text-[36px] font-black uppercase tracking-[-0.04em] text-primary">ACESSO RÁPIDO</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <a href="#candidatos-recentes" className="group block p-8 bg-surface-container-low border border-outline-variant rounded-md hover:bg-surface-container hover:shadow-standard transition-all duration-300">
              <div className="flex flex-col h-full">
                <div className="mb-8 p-3 w-fit bg-primary/5 rounded-sm text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Users className="h-6 w-6" />
                </div>
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">LISTAGEM</span>
                  <h3 className="text-[20px] font-black uppercase tracking-tight text-primary">Candidatos Recentes</h3>
                  <p className="text-[13px] text-on-surface-variant leading-relaxed">
                    Acompanhe os últimos perfis cadastrados e analise novas compatibilidades no sistema.
                  </p>
                </div>
                <div className="mt-12 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-primary">
                  Acessar candidatos <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </a>

            <a href="#entrevistas" className="group block p-8 bg-surface-container-low border border-outline-variant rounded-md hover:bg-surface-container hover:shadow-standard transition-all duration-300">
              <div className="flex flex-col h-full">
                <div className="mb-8 p-3 w-fit bg-primary/5 rounded-sm text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">AGENDA</span>
                  <h3 className="text-[20px] font-black uppercase tracking-tight text-primary">Entrevistas Agendadas</h3>
                  <p className="text-[13px] text-on-surface-variant leading-relaxed">
                    Gerencie seu cronograma de entrevistas e compromissos agendados para a semana.
                  </p>
                </div>
                <div className="mt-12 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-primary">
                  Ver calendário <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </a>

            <a href="#relatorios" className="group block p-8 bg-surface-container-low border border-outline-variant rounded-md hover:bg-surface-container hover:shadow-standard transition-all duration-300">
              <div className="flex flex-col h-full">
                <div className="mb-8 p-3 w-fit bg-primary/5 rounded-sm text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Activity className="h-6 w-6" />
                </div>
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">ANÁLISE</span>
                  <h3 className="text-[20px] font-black uppercase tracking-tight text-primary">Relatório Trimestral</h3>
                  <p className="text-[13px] text-on-surface-variant leading-relaxed">
                    Analise as métricas de desempenho e cobertura de vagas do último trimestre fiscal.
                  </p>
                </div>
                <div className="mt-12 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-primary">
                  Gerar relatório <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;

const VagaRow = ({ vaga }: { vaga: Vaga }) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    aberta:  { label: 'Aberta',  color: 'bg-emerald-500/10 text-emerald-700 border-none' },
    ativa:   { label: 'Ativa',   color: 'bg-emerald-500/10 text-emerald-700 border-none' },
    fechada: { label: 'Fechada', color: 'bg-error/10 text-error border-none' },
    pausada: { label: 'Pausada', color: 'bg-yellow-500/10 text-yellow-700 border-none' },
  };

  const statusKey = vaga.status?.toLowerCase() ?? '';
  const statusInfo = statusMap[statusKey] ?? { label: vaga.status ?? 'Ativa', color: 'bg-secondary/10 text-secondary border-none' };

  const date = vaga.criadoEm
    ? new Date(vaga.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

  return (
    <TableRow className="hover:bg-surface-container/50 transition-colors">
      <TableCell className="py-4">
        <div>
          <p className="font-semibold text-[14px] text-primary">{vaga.titulo}</p>
          {vaga.descricao && (
            <p className="text-[12px] text-on-surface-variant mt-0.5 line-clamp-1">{vaga.descricao}</p>
          )}
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {vaga.localizacao ? (
          <div className="flex items-center gap-1.5 text-[13px] text-on-surface-variant">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            {vaga.localizacao}
          </div>
        ) : (
          <span className="text-[12px] text-on-surface-variant opacity-40">—</span>
        )}
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        {date ? (
          <div className="flex items-center gap-1.5 text-[13px] text-on-surface-variant">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            {date}
          </div>
        ) : (
          <span className="text-[12px] text-on-surface-variant opacity-40">—</span>
        )}
      </TableCell>
      <TableCell>
        <Badge className={cn('text-[10px] uppercase tracking-wider font-semibold', statusInfo.color)}>
          {statusInfo.label}
        </Badge>
      </TableCell>
    </TableRow>
  );
};

const VagasSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex gap-4 p-4 border border-outline-variant rounded-md">
        <Skeleton className="h-5 flex-1" />
        <Skeleton className="h-5 w-32 hidden md:block" />
        <Skeleton className="h-5 w-24 hidden lg:block" />
        <Skeleton className="h-5 w-16" />
      </div>
    ))}
  </div>
);

const EmptyState = ({ icon, message }: { icon: React.ReactNode; message: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center text-on-surface-variant">
    <div className="mb-4">{icon}</div>
    <p className="text-[14px]">{message}</p>
  </div>
);
