"use client"

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, FileText, Users, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Broadcast {
    id: string;
    message: string;
    recipients: string;
    successCount: number;
    failCount: number;
    createdAt: string;
}

export default function MessageDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const [message, setMessage] = useState<Broadcast | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchMessage = async () => {
            try {
                const res = await fetch(`/api/messages/${id}`);
                if (!res.ok) throw new Error("Falha ao carregar");
                const data = await res.json();
                setMessage(data);
            } catch {
                toast.error("Erro ao carregar detalhes da mensagem.");
            } finally {
                setLoading(false);
            }
        };

        fetchMessage();
    }, [id]);

    if (loading) {
        return <div className="container p-8 text-center text-muted-foreground animate-pulse">Carregando detalhes...</div>;
    }

    if (!message) {
        return (
            <div className="container p-8 text-center">
                <h1 className="text-xl font-bold mb-4">Mensagem não encontrada</h1>
                <Link href="/messages">
                    <Button>Voltar</Button>
                </Link>
            </div>
        );
    }

    let recipientsList: string[] = [];
    try {
        recipientsList = JSON.parse(message.recipients);
    } catch {
        recipientsList = [message.recipients];
    }

    return (
        <div className="container mx-auto p-8 max-w-4xl space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/messages">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Detalhes do Comunicado</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="h-4 w-4 text-primary" />
                                Conteúdo da Mensagem
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-50 p-4 rounded-md border text-sm whitespace-pre-wrap font-sans">
                                {message.message}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Users className="h-4 w-4 text-primary" />
                                Destinatários ({recipientsList.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {recipientsList.map((name, i) => (
                                    <div key={i} className="text-sm p-2 bg-muted/50 rounded flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-400"></div>
                                        {name}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Status do Envio</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Data
                                </span>
                                <span className="text-sm font-medium">
                                    {new Date(message.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    Hora
                                </span>
                                <span className="text-sm font-medium">
                                    {new Date(message.createdAt).toLocaleTimeString()}
                                </span>
                            </div>

                            <div className="pt-4 border-t space-y-2">
                                <div className="flex items-center justify-between text-green-600">
                                    <span className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4" /> Sucesso</span>
                                    <span className="font-bold">{message.successCount}</span>
                                </div>
                                <div className="flex items-center justify-between text-red-600">
                                    <span className="flex items-center gap-2 text-sm"><XCircle className="h-4 w-4" /> Falhas</span>
                                    <span className="font-bold">{message.failCount}</span>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Badge className="w-full justify-center" variant={message.failCount === 0 ? "default" : "secondary"}>
                                    {message.failCount === 0 ? "Envio Totalmente Bem-sucedido" : "Envio com Falhas"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
