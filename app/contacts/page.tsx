'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Search, RefreshCw, User, Users, Building2,
    Download, UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Contact {
    id: string;
    jid: string;
    name?: string;
    pushName?: string;
    description?: string;
    email?: string;
    website?: string;
    isBusiness?: boolean;
    profilePictureUrl?: string;
    groups: { id: string; name: string }[];
}

interface Group {
    id: string;
    name: string;
}

function getInitials(name: string) {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function getAvatarColor(name: string) {
    const colors = [
        'bg-[#1e3a5f] text-white',
        'bg-[#0d9488] text-white',
        'bg-[#0ea5e9] text-white',
        'bg-[#f59e0b] text-white',
        'bg-[#6366f1] text-white',
        'bg-[#ec4899] text-white',
        'bg-[#8b5cf6] text-white',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalContacts, setTotalContacts] = useState(0);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [showBusinessOnly, setShowBusinessOnly] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<Contact>>({});

    const fetchGroups = async () => {
        try {
            const res = await fetch('/api/groups');
            const data = await res.json();
            setGroups(Array.isArray(data) ? data : []);
        } catch {
            setGroups([]);
        }
    };

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: '30', search });
            if (selectedGroup) params.append('groupId', selectedGroup);
            if (showBusinessOnly) params.append('business', 'true');
            const res = await fetch(`/api/contacts?${params}`);
            const data = await res.json();
            setContacts(Array.isArray(data?.data) ? data.data : []);
            setTotalPages(data?.pagination?.pages || 1);
            setTotalContacts(data?.pagination?.total || 0);
        } catch {
            toast.error("Erro ao carregar contatos.");
            setContacts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchGroups(); }, []);
    useEffect(() => { fetchContacts(); }, [page, search, selectedGroup, showBusinessOnly]);

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await fetch('/api/contacts/sync', { method: 'POST' });
            const data = await res.json();
            if (data.status === 'SUCCESS') {
                toast.success(`Sincronização concluída! ${data.stats?.contactsFound} encontrados.`);
                fetchContacts();
            } else {
                toast.error("Erro na sincronização.");
            }
        } catch {
            toast.error("Erro ao conectar com servidor.");
        } finally {
            setSyncing(false);
        }
    };

    const handleEnrich = async () => {
        setLoading(true);
        toast.info("Buscando fotos de perfil...");
        try {
            const res = await fetch('/api/contacts/enrich?limit=20', { method: 'POST' });
            const data = await res.json();
            if (data.status === 'SUCCESS') {
                toast.success(`Atualizado: ${data.stats.updated} fotos novas.`);
                fetchContacts();
            }
        } catch {
            toast.error("Erro ao atualizar fotos.");
        } finally {
            setLoading(false);
        }
    };

    const openEdit = (contact: Contact) => {
        setSelectedContact(contact);
        setFormData({
            name: contact.name || "",
            email: contact.email || "",
            description: contact.description || "",
            website: contact.website || "",
            isBusiness: contact.isBusiness || false
        });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!selectedContact) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/contacts/${selectedContact.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                toast.success("Contato atualizado!");
                setIsDialogOpen(false);
                fetchContacts();
            } else {
                toast.error("Erro ao salvar.");
            }
        } catch {
            toast.error("Erro de conexão.");
        } finally {
            setSaving(false);
        }
    };

    const formatPhoneNumber = (jid: string) => {
        const number = jid.replace('@s.whatsapp.net', '');
        if (number.startsWith('55') && number.length >= 12) {
            return `+${number.slice(0, 2)} (${number.slice(2, 4)}) ${number.slice(4, 9)}-${number.slice(9)}`;
        }
        return number;
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar Filters */}
            <aside className="w-[240px] border-r bg-muted/20 p-4 flex flex-col gap-5 shrink-0">
                <Button onClick={handleSync} disabled={syncing} className="w-full gap-2 bg-primary hover:bg-primary/90">
                    <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Sincronizando...' : 'Sincronizar'}
                </Button>

                <div className="space-y-1">
                    <span className="px-2 mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Filtros
                    </span>
                    <button
                        onClick={() => { setSelectedGroup(null); setPage(1); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${!selectedGroup ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                            }`}
                    >
                        <User className="w-4 h-4" />
                        Todos
                        <span className="ml-auto text-xs text-muted-foreground">{totalContacts}</span>
                    </button>

                    <button
                        onClick={() => { setShowBusinessOnly(!showBusinessOnly); setPage(1); }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${showBusinessOnly ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                            }`}
                    >
                        <Building2 className="w-4 h-4" />
                        Empresas
                    </button>
                </div>

                {/* Groups */}
                <div className="space-y-1 flex-1 min-h-0">
                    <span className="px-2 mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Grupos
                    </span>
                    <div className="space-y-0.5 overflow-y-auto max-h-[280px] pr-1">
                        {groups.map((group) => (
                            <button
                                key={group.id}
                                onClick={() => { setSelectedGroup(selectedGroup === group.id ? null : group.id); setPage(1); }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${selectedGroup === group.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                                    }`}
                            >
                                <Users className="w-4 h-4 shrink-0 opacity-60" />
                                <span className="truncate text-left">{group.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="border-t pt-3 space-y-1">
                    <span className="px-2 mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Ações
                    </span>
                    <button
                        onClick={handleEnrich}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors cursor-pointer text-foreground"
                    >
                        <UserPlus className="w-4 h-4 opacity-60" />
                        Atualizar Fotos
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm opacity-40 cursor-not-allowed text-foreground" disabled>
                        <Download className="w-4 h-4 opacity-60" />
                        Exportar (em breve)
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="border-b px-6 py-4 flex items-center gap-4 bg-background">
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold">
                            Contatos
                            <span className="text-muted-foreground font-normal ml-2 text-sm">({totalContacts})</span>
                        </h1>
                    </div>
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Pesquisar contatos..."
                            className="pl-9 bg-muted/40 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                </header>

                <div className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                            <TableRow className="hover:bg-transparent border-b">
                                <TableHead className="w-[280px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</TableHead>
                                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">E-mail</TableHead>
                                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Telefone</TableHead>
                                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Grupos</TableHead>
                                <TableHead className="w-[90px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
                                                <div className="h-3.5 w-28 bg-muted rounded animate-pulse" />
                                            </div>
                                        </TableCell>
                                        <TableCell><div className="h-3.5 w-36 bg-muted rounded animate-pulse" /></TableCell>
                                        <TableCell><div className="h-3.5 w-24 bg-muted rounded animate-pulse" /></TableCell>
                                        <TableCell><div className="h-3.5 w-16 bg-muted rounded animate-pulse" /></TableCell>
                                        <TableCell><div className="h-3.5 w-14 bg-muted rounded animate-pulse" /></TableCell>
                                    </TableRow>
                                ))
                            ) : (contacts?.length || 0) === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <User className="w-10 h-10 opacity-20" />
                                            <p className="text-sm">Nenhum contato encontrado</p>
                                            <Button variant="outline" size="sm" onClick={handleSync}>
                                                Sincronizar Agora
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                (contacts || []).map((contact) => {
                                    const displayName = contact.name || contact.pushName || 'Sem nome';
                                    return (
                                        <TableRow
                                            key={contact.id}
                                            className="cursor-pointer hover:bg-muted/40 transition-colors"
                                            onClick={() => openEdit(contact)}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center overflow-hidden shrink-0 text-xs font-semibold ${contact.profilePictureUrl ? '' : getAvatarColor(displayName)
                                                        }`}>
                                                        {contact.profilePictureUrl ? (
                                                            <img src={contact.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            getInitials(displayName)
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-medium">{displayName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{contact.email || '—'}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{formatPhoneNumber(contact.jid)}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1 flex-wrap">
                                                    {(contact.groups || []).slice(0, 2).map((g, i) => (
                                                        <Badge key={i} variant="secondary" className="text-[11px] font-normal">{g.name}</Badge>
                                                    ))}
                                                    {(contact.groups?.length || 0) > 2 && (
                                                        <Badge variant="outline" className="text-[11px] font-normal">+{(contact.groups?.length || 0) - 2}</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {contact.isBusiness && (
                                                    <Badge className="bg-[#0d9488]/10 text-[#0d9488] hover:bg-[#0d9488]/15 border-0 text-[11px]">
                                                        <Building2 className="w-3 h-3 mr-1" />
                                                        Business
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {totalPages > 1 && (
                    <footer className="border-t px-6 py-3 flex items-center justify-between bg-background">
                        <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
                            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Próxima</Button>
                        </div>
                    </footer>
                )}
            </main>

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar Contato</DialogTitle>
                        <DialogDescription>{selectedContact?.jid && formatPhoneNumber(selectedContact.jid)}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex justify-center mb-4">
                            <div className={`h-20 w-20 rounded-full flex items-center justify-center overflow-hidden border-2 border-border text-lg font-semibold ${selectedContact?.profilePictureUrl ? '' : getAvatarColor(selectedContact?.name || selectedContact?.pushName || 'U')
                                }`}>
                                {selectedContact?.profilePictureUrl ? (
                                    <img src={selectedContact.profilePictureUrl} className="h-full w-full object-cover" alt="" />
                                ) : (
                                    getInitials(selectedContact?.name || selectedContact?.pushName || 'U')
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Nome de Exibição</Label>
                            <Input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Nome do Contato" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>E-mail</Label>
                                <Input value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="email@exemplo.com" />
                            </div>
                            <div className="space-y-2">
                                <Label>Site</Label>
                                <Input value={formData.website || ''} onChange={e => setFormData({ ...formData, website: e.target.value })} placeholder="www.site.com" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Notas / Descrição</Label>
                            <Textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Observações sobre este contato..." className="resize-none h-24" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch checked={formData.isBusiness || false} onCheckedChange={c => setFormData({ ...formData, isBusiness: c })} />
                            <Label>Conta Comercial / Business</Label>
                        </div>
                        {selectedContact && (selectedContact.groups?.length || 0) > 0 && (
                            <div className="space-y-2 pt-2 border-t">
                                <Label className="text-muted-foreground">Grupos</Label>
                                <div className="flex gap-1 flex-wrap">
                                    {(selectedContact.groups || []).map((g, i) => (
                                        <Badge key={i} variant="secondary">{g.name}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar Alterações'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
