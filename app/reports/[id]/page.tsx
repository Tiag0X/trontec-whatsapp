'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, FileText, Share2, RefreshCw, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Report {
  id: string;
  dateRef: string;
  summary: string;
  fullText: string;
  status: string;
  createdAt: string;
  processedData: string;
  group?: {
    name: string;
  };
}

export default function ReportPage() {
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/reports/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setReport(data);
          } else {
            toast.error("Relatório não encontrado.");
          }
        })
        .catch(() => toast.error("Erro ao carregar relatório."))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const copyToClipboard = () => {
    if (report?.fullText) {
      navigator.clipboard.writeText(report.fullText);
      toast.success("Copiado para a área de transferência!");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4 animate-in fade-in duration-500">
      <RefreshCw className="w-8 h-8 text-primary animate-spin" />
      <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Carregando Inteligência...</p>
    </div>
  );

  if (!report) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <XCircle className="w-12 h-12 text-rose-300" />
      <p className="text-lg font-bold text-slate-800">Relatório não encontrado</p>
      <Link href="/reports">
        <Button variant="outline" className="rounded-full">Voltar para a lista</Button>
      </Link>
    </div>
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'GENERATED': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'EMPTY': return 'bg-slate-50 text-slate-500 border-slate-100';
      default: return 'bg-rose-50 text-rose-600 border-rose-100';
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Navigation */}
      <Link href="/reports" className="group inline-flex items-center text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Voltar para os Relatórios
      </Link>

      {/* Header Section */}
      <div className="relative p-8 rounded-[2rem] bg-white border border-slate-200/60 shadow-sm overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
          <FileText className="w-32 h-32 -rotate-12" />
        </div>

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <Badge variant="outline" className={`px-3 py-1 font-bold ${getStatusBadge(report.status)} border rounded-lg`}>
              {report.status === 'SENT' ? 'Enviado para WhatsApp' :
                report.status === 'GENERATED' ? 'Gerado com Sucesso' :
                  report.status === 'EMPTY' ? 'Sem Mensagens' : 'Erro no Processamento'}
            </Badge>

            <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-tight">
              {report.group?.name || 'Relatório de Grupo'}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 leading-none mb-1">Período</span>
                  <span className="text-slate-700">{report.dateRef}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 leading-none mb-1">Processado em</span>
                  <span className="text-slate-700">{new Date(report.createdAt).toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={copyToClipboard}
            className="w-full md:w-auto bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-primary/20 gap-2 h-12 px-8 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            Copiar Texto Final
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="border-slate-200/60 shadow-sm rounded-[2rem] overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
          <CardTitle className="text-xl font-bold flex items-center gap-3 text-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
              <RefreshCw className="w-4 h-4" />
            </div>
            Resumo Executivo (IA)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <p className="text-lg text-slate-600 leading-relaxed font-medium italic">
            &quot;{report.summary}&quot;
          </p>
        </CardContent>
      </Card>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Full Report Text */}
        <Card className="border-slate-200/60 shadow-sm rounded-[2rem] overflow-hidden bg-slate-900 text-slate-300">
          <CardHeader className="border-b border-slate-800 p-8">
            <CardTitle className="text-xl font-bold flex items-center gap-3 text-white">
              <FileText className="w-5 h-5 text-primary" />
              Conteúdo do Relatório
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap selection:bg-primary/30">
              {report.fullText}
            </div>
          </CardContent>
        </Card>

        {/* Processed Messages */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 px-2 flex items-center justify-between">
            Base de Dados Analisada
            {report.processedData && (
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-mono">
                {JSON.parse(report.processedData).length} Msgs
              </Badge>
            )}
          </h2>

          <div className="grid gap-4 max-h-[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
            {report.processedData && (JSON.parse(report.processedData) as { user?: string; time?: string; text?: string }[]).map((msg, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:border-primary/20 transition-colors group">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors uppercase">
                      {(msg.user || "U").substring(0, 2)}
                    </div>
                    <span className="font-bold text-slate-700">{msg.user || "Usuário"}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                    {(() => {
                      const t = msg.time;
                      if (!t) return "";
                      const d = new Date(t);
                      if (!isNaN(d.getTime())) {
                        return d.toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                      }
                      // Fallback para o formato "DD/MM/YYYY, HH:MM:SS"
                      if (typeof t === 'string' && t.includes(',')) {
                        return t.substring(0, 16); // "DD/MM/YYYY, HH:MM"
                      }
                      return t;
                    })()}
                  </span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {msg.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
