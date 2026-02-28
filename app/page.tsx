'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  FileText,
  MessageSquare,
  Users,
  BookUser,
  Activity,
  ArrowRight,
  Zap,
  Clock,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  reports?: { total: number; sent: number };
  contacts?: { total: number; business: number };
  groups?: { total: number; active: number };
  prompts?: { total: number };
  scheduler?: { enabled: boolean; time: string; lastHeartbeat?: string };
}

interface RecentReport {
  id: string;
  dateRef: string;
  summary: string;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, reportsRes] = await Promise.all([
          fetch('/api/stats/dashboard'),
          fetch('/api/reports')
        ]);
        const statsData = await statsRes.json();
        const reportsData = await reportsRes.json();
        setStats(statsData);
        if (Array.isArray(reportsData)) {
          setRecentReports(reportsData.slice(0, 5));
        }
      } catch {
        toast.error("Erro ao carregar dados do dashboard.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  const SkeletonCard = () => (
    <div className="stat-card animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-muted" />
        <div className="space-y-2 flex-1">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-6 w-12 bg-muted rounded" />
        </div>
      </div>
    </div>
  );

  const statCards = [
    {
      title: "Relatórios",
      value: stats?.reports?.total || 0,
      sub: `${stats?.reports?.sent || 0} enviados`,
      icon: FileText,
      iconBg: "bg-[#1e3a5f]/10",
      iconColor: "text-[#1e3a5f]",
    },
    {
      title: "Contatos",
      value: stats?.contacts?.total || 0,
      sub: `${stats?.contacts?.business || 0} business`,
      icon: BookUser,
      iconBg: "bg-[#0d9488]/10",
      iconColor: "text-[#0d9488]",
    },
    {
      title: "Grupos",
      value: stats?.groups?.total || 0,
      sub: `${stats?.groups?.active || 0} ativos`,
      icon: Users,
      iconBg: "bg-[#0ea5e9]/10",
      iconColor: "text-[#0ea5e9]",
    },
    {
      title: "Prompts IA",
      value: stats?.prompts?.total || 0,
      sub: "Modelos criados",
      icon: Activity,
      iconBg: "bg-[#f59e0b]/10",
      iconColor: "text-[#f59e0b]",
    },
  ];

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8">
      {/* Header */}
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {getGreeting()} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visão geral da plataforma Trontec AI
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">
            {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {loading ? (
          Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="stat-card">
                  <div className="flex items-center gap-3">
                    <div className={`stat-icon ${card.iconBg}`}>
                      <Icon className={`h-5 w-5 ${card.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground truncate">
                        {card.title}
                      </p>
                      <p className="text-2xl font-bold text-foreground leading-none mt-1">
                        {card.value}
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-3">
                    {card.sub}
                  </p>
                </div>
              );
            })}

            {/* Automation Card */}
            <div className="stat-card bg-gradient-to-br from-[#0f172a] to-[#1e3a5f] text-white border-0">
              <div className="flex items-center gap-3">
                <div className="stat-icon bg-[#38bdf8]/20">
                  <Zap className="h-5 w-5 text-[#38bdf8]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-300 truncate">
                    Automação
                  </p>
                  {(() => {
                    if (!stats?.scheduler?.enabled) return (
                      <p className="text-lg font-bold text-slate-400 mt-1">Desativado</p>
                    );
                    const [h, m] = (stats.scheduler.time || "08:00").split(':').map(Number);
                    const next = new Date();
                    next.setHours(h, m, 0, 0);
                    if (next < currentTime) next.setDate(next.getDate() + 1);
                    const diffMs = next.getTime() - currentTime.getTime();
                    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
                    return (
                      <p className="text-xl font-bold text-white leading-none mt-1">
                        {diffHrs}h {diffMins}m {diffSecs}s
                      </p>
                    );
                  })()}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {stats?.scheduler?.enabled ? `Agendado ${stats.scheduler.time}` : "Sem agendamento"}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Quick Actions */}
        <Card className="lg:col-span-2 border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/reports">
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer group">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e3a5f]/8">
                  <FileText className="h-4 w-4 text-[#1e3a5f]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Gerenciar Relatórios</p>
                  <p className="text-xs text-muted-foreground">Ver histórico e gerar novos</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>

            <Link href="/messages">
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer group">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0d9488]/8">
                  <MessageSquare className="h-4 w-4 text-[#0d9488]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Central de Comunicados</p>
                  <p className="text-xs text-muted-foreground">Disparar mensagens em massa</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>

            <Link href="/contacts">
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer group">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0ea5e9]/8">
                  <BookUser className="h-4 w-4 text-[#0ea5e9]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Gerenciar Contatos</p>
                  <p className="text-xs text-muted-foreground">Sincronizar e organizar</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-3 border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
                </div>
              ) : (
                recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    <div className={`h-2 w-2 rounded-full shrink-0 ${report.status === 'SENT' ? 'bg-emerald-500' : 'bg-slate-300'
                      }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{report.dateRef}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                        {report.summary}
                      </p>
                    </div>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {new Date(report.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
