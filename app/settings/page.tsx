"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs"
import {
    Globe, BrainCircuit, Clock, Save, Plus, Trash2,
    MoreVertical, Edit, Users, FileText, Sparkles,
    ChevronRight, Settings2, Shield, RefreshCw, Download, CheckSquare
} from "lucide-react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { GroupSelector } from "@/components/group-selector"

interface Group {
    id: string; name: string; jid?: string; promptId?: string | null;
    sendToJid?: string | null; prompt?: { id: string; name: string } | null;
    includeInAutoReport: boolean;
}
interface RemoteGroup { id: string; subject: string; }
interface Prompt { id: string; name: string; content: string; }
interface SettingsForm {
    evolutionApiUrl: string; evolutionInstanceName: string; evolutionToken: string;
    openaiApiKey: string; defaultPromptId: string;
    isAutoReportEnabled: boolean; autoReportTime: string; autoReportPeriod: string;
    langchainModel: string; langchainTemperature: number;
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general")
    const [groups, setGroups] = useState<Group[]>([])
    const [prompts, setPrompts] = useState<Prompt[]>([])
    const [loadingGroups, setLoadingGroups] = useState(false)
    const [remoteGroups, setRemoteGroups] = useState<RemoteGroup[]>([])
    const [loadingRemote, setLoadingRemote] = useState(false)
    const [isPromptOpen, setIsPromptOpen] = useState(false)
    const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
    const [promptName, setPromptName] = useState("")
    const [promptContent, setPromptContent] = useState("")
    const [selectedRemoteGroups, setSelectedRemoteGroups] = useState<Set<string>>(new Set())
    const [selectedLocalGroups, setSelectedLocalGroups] = useState<Set<string>>(new Set())

    const form = useForm<SettingsForm>({
        defaultValues: {
            evolutionApiUrl: '', evolutionInstanceName: '', evolutionToken: '',
            openaiApiKey: '', defaultPromptId: '',
            isAutoReportEnabled: false, autoReportTime: '08:00', autoReportPeriod: 'YESTERDAY',
            langchainModel: 'gpt-4o-mini', langchainTemperature: 0.7
        }
    })
    const { register, handleSubmit, watch, setValue, reset } = form
    const schedulerEnabled = watch('isAutoReportEnabled')

    const loadGroups = async () => {
        setLoadingGroups(true)
        try {
            const res = await fetch('/api/groups'); const data = await res.json()
            setGroups(Array.isArray(data) ? data : [])
        } catch { setGroups([]) } finally { setLoadingGroups(false) }
    }
    const loadPrompts = async () => {
        try { const res = await fetch('/api/prompts'); const data = await res.json(); setPrompts(Array.isArray(data) ? data : []) }
        catch { setPrompts([]) }
    }

    useEffect(() => {
        fetch('/api/settings').then(r => r.json()).then(d => { if (d && !d.error) reset(d) })
        loadGroups(); loadPrompts()
    }, [reset])

    const onSubmit = async (data: SettingsForm) => {
        try {
            const res = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
            if (res.ok) toast.success("Configurações salvas!"); else toast.error("Erro ao salvar.")
        } catch { toast.error("Erro de conexão.") }
    }

    const fetchRemoteGroups = async () => {
        setLoadingRemote(true)
        try {
            const res = await fetch('/api/groups/remote')
            const data = await res.json()
            if (Array.isArray(data)) setRemoteGroups(data)
            else toast.error(data.error || "Erro ao buscar grupos remotos.")
        } catch { toast.error("Erro de conexão com a API.") } finally { setLoadingRemote(false) }
    }

    const handleAddGroup = async (remoteGroup: RemoteGroup) => {
        try {
            const res = await fetch('/api/groups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: remoteGroup.subject, jid: remoteGroup.id }) })
            if (res.ok) { toast.success(`Grupo "${remoteGroup.subject}" adicionado!`); loadGroups() } else { const d = await res.json(); toast.error(d.error || "Erro.") }
        } catch { toast.error("Erro.") }
    }

    const toggleRemoteGroupSelection = (groupId: string) => {
        setSelectedRemoteGroups(prev => {
            const next = new Set(prev)
            if (next.has(groupId)) next.delete(groupId)
            else next.add(groupId)
            return next
        })
    }

    const toggleSelectAllRemoteGroups = () => {
        const availableGroups = remoteGroups.filter(rg => !groups.some(g => g.jid === rg.id))
        if (selectedRemoteGroups.size === availableGroups.length) {
            setSelectedRemoteGroups(new Set())
        } else {
            setSelectedRemoteGroups(new Set(availableGroups.map(rg => rg.id)))
        }
    }

    const handleBulkAddGroups = async () => {
        if (selectedRemoteGroups.size === 0) { toast.warning("Selecione ao menos um grupo."); return }
        const toAdd = remoteGroups.filter(rg => selectedRemoteGroups.has(rg.id))
        let success = 0, fail = 0
        for (const rg of toAdd) {
            try {
                const res = await fetch('/api/groups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: rg.subject, jid: rg.id }) })
                if (res.ok) success++; else fail++
            } catch { fail++ }
        }
        toast.success(`${success} grupo(s) importado(s)${fail > 0 ? `, ${fail} falha(s)` : ''}`)
        setSelectedRemoteGroups(new Set())
        loadGroups()
    }
    const handleDeleteGroup = async (id: string) => {
        if (!confirm("Excluir este grupo?")) return
        try {
            const res = await fetch(`/api/groups/${id}`, { method: 'DELETE' })
            if (res.ok) { toast.success("Grupo removido."); loadGroups() }
        } catch { toast.error("Erro.") }
    }

    const toggleLocalGroupSelection = (id: string) => {
        setSelectedLocalGroups(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }
    const toggleSelectAllLocalGroups = () => {
        if (selectedLocalGroups.size === groups.length) setSelectedLocalGroups(new Set())
        else setSelectedLocalGroups(new Set(groups.map(g => g.id)))
    }
    const handleBulkDeleteLocalGroups = async () => {
        if (!confirm(`Excluir ${selectedLocalGroups.size} grupo(s) e seus relatórios?`)) return
        try {
            const res = await fetch('/api/groups', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.from(selectedLocalGroups) })
            })
            if (res.ok) {
                toast.success("Grupos excluídos com sucesso.")
                setSelectedLocalGroups(new Set())
                loadGroups()
            } else {
                toast.error("Erro ao excluir grupos.")
            }
        } catch { toast.error("Erro de conexão.") }
    }
    const handleUpdateGroup = async (id: string, data: Record<string, unknown>) => {
        try {
            const res = await fetch(`/api/groups/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
            if (res.ok) { toast.success("Grupo atualizado!"); loadGroups() } else toast.error("Erro.")
        } catch { toast.error("Erro.") }
    }

    const openPromptDialog = (prompt?: Prompt) => {
        if (prompt) { setEditingPrompt(prompt); setPromptName(prompt.name); setPromptContent(prompt.content) }
        else { setEditingPrompt(null); setPromptName(""); setPromptContent("") }
        setIsPromptOpen(true)
    }
    const handleSavePrompt = async () => {
        if (!promptName || !promptContent) { toast.warning("Preencha todos os campos."); return }
        const url = editingPrompt ? `/api/prompts/${editingPrompt.id}` : '/api/prompts'
        const method = editingPrompt ? 'PUT' : 'POST'
        try {
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: promptName, content: promptContent }) })
            if (res.ok) { toast.success(editingPrompt ? "Prompt atualizado!" : "Prompt criado!"); setIsPromptOpen(false); loadPrompts() }
            else toast.error("Erro.")
        } catch { toast.error("Erro.") }
    }
    const handleDeletePrompt = async (id: string) => {
        if (!confirm("Excluir este prompt?")) return
        try {
            const res = await fetch(`/api/prompts/${id}`, { method: 'DELETE' })
            if (res.ok) { toast.success("Prompt excluído."); loadPrompts() }
        } catch { toast.error("Erro.") }
    }

    return (
        <div className="p-8 max-w-[1000px] mx-auto space-y-8">
            <header>
                <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Gerencie a plataforma e integrações.</p>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 gap-0">
                    <TabsTrigger value="general" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground gap-2">
                        <Settings2 className="h-4 w-4" /> Geral
                    </TabsTrigger>
                    <TabsTrigger value="groups" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground gap-2">
                        <Users className="h-4 w-4" /> Grupos
                    </TabsTrigger>
                    <TabsTrigger value="prompts" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground gap-2">
                        <Sparkles className="h-4 w-4" /> Prompts
                    </TabsTrigger>
                </TabsList>

                {/* GENERAL */}
                <TabsContent value="general" className="mt-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* API Connections */}
                        <Card className="border shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" /> Conexões de API</CardTitle>
                                <CardDescription>Configure as URLs e chaves de acesso.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">URL da API Evolution</Label>
                                    <Input {...register('evolutionApiUrl')} placeholder="https://api.evolution.com" className="font-mono text-sm" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Nome da Instância</Label>
                                    <Input {...register('evolutionInstanceName')} placeholder="Minha Instância" className="font-mono text-sm" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Token da Evolution API</Label>
                                    <Input {...register('evolutionToken')} type="password" placeholder="Token de acesso" className="font-mono text-sm" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium flex items-center gap-1.5">
                                        Chave OpenAI
                                        <Shield className="h-3 w-3 text-muted-foreground" />
                                    </Label>
                                    <Input {...register('openaiApiKey')} type="password" placeholder="sk-..." className="font-mono text-sm" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* AI Defaults */}
                        <Card className="border shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base flex items-center gap-2"><BrainCircuit className="h-4 w-4 text-muted-foreground" /> Inteligência Artificial</CardTitle>
                                <CardDescription>Prompts padrão para relatórios e reescrita.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Prompt Padrão (Relatórios)</Label>
                                    <select {...register('defaultPromptId')} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                        <option value="">Nenhum selecionado</option>
                                        {prompts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Advanced AI (LangChain) */}
                        <Card className="border shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-muted-foreground" /> Configuração Avançada (LangChain)</CardTitle>
                                <CardDescription>Ajustes finos para o Agente Avançado.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">Modelo de Inteligência</Label>
                                        <select {...register('langchainModel')} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                                            <option value="gpt-4o-mini">GPT-4o Mini (Recomendado)</option>
                                            <option value="gpt-4o">GPT-4o (Mais Inteligente)</option>
                                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Legado)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-sm font-medium">Criatividade (Temperatura)</Label>
                                            <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{watch('langchainTemperature')}</span>
                                        </div>
                                        <Input
                                            type="range"
                                            step="0.1"
                                            min="0"
                                            max="1"
                                            {...register('langchainTemperature')}
                                            className="cursor-pointer mt-2"
                                        />
                                        <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                                            <span>Preciso (0)</span>
                                            <span>Criativo (1)</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Scheduler */}
                        <Card className="border shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /> Automação</CardTitle>
                                <CardDescription>Agende a geração automática de relatórios.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium cursor-pointer">Ativar Agendamento</Label>
                                        <p className="text-xs text-muted-foreground">Execução diária automática</p>
                                    </div>
                                    <Switch checked={schedulerEnabled} onCheckedChange={v => setValue('isAutoReportEnabled', v)} />
                                </div>
                                {schedulerEnabled && (
                                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Horário de Execução</Label>
                                            <Input type="time" {...register('autoReportTime')} className="w-36" />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex justify-end">
                            <Button type="submit" className="bg-primary hover:bg-primary/90 gap-2">
                                <Save className="h-4 w-4" /> Salvar Configurações
                            </Button>
                        </div>
                    </form>
                </TabsContent>

                {/* GROUPS */}
                <TabsContent value="groups" className="mt-6 space-y-6">
                    {/* Registered Groups */}
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-4 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div>
                                    <CardTitle className="text-base">Grupos Cadastrados</CardTitle>
                                    <CardDescription>Grupos vinculados ao sistema.</CardDescription>
                                </div>
                                {selectedLocalGroups.size > 0 && (
                                    <Button onClick={handleBulkDeleteLocalGroups} size="sm" variant="destructive" className="ml-auto gap-2">
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Excluir ({selectedLocalGroups.size})
                                    </Button>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground">{groups.length} grupos</span>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {loadingGroups ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border animate-pulse">
                                        <div className="h-4 w-32 bg-muted rounded" />
                                        <div className="ml-auto h-4 w-20 bg-muted rounded" />
                                    </div>
                                ))
                            ) : groups.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="h-8 w-8 mx-auto opacity-20 mb-2" />
                                    <p className="text-sm">Nenhum grupo cadastrado.</p>
                                    <p className="text-xs mt-1">Busque os grupos do WhatsApp abaixo.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Select All Local */}
                                    {groups.length > 0 && (
                                        <div className="flex items-center gap-3 p-2 rounded-lg border-b mb-1 bg-muted/10">
                                            <Checkbox
                                                id="select-all-local"
                                                checked={selectedLocalGroups.size === groups.length && groups.length > 0}
                                                onCheckedChange={toggleSelectAllLocalGroups}
                                            />
                                            <label htmlFor="select-all-local" className="text-xs font-medium cursor-pointer text-muted-foreground">
                                                Selecionar Todos ({groups.length})
                                            </label>
                                        </div>
                                    )}

                                    {groups.map((group) => {
                                        const isSelected = selectedLocalGroups.has(group.id)
                                        return (
                                            <div
                                                key={group.id}
                                                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors group cursor-pointer ${isSelected ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/30'}`}
                                                onClick={() => toggleLocalGroupSelection(group.id)}
                                            >
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleLocalGroupSelection(group.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8 shrink-0">
                                                    <Users className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{group.name}</p>
                                                    <div className="flex gap-2 mt-0.5">
                                                        {group.prompt && (
                                                            <span className="text-[10px] text-muted-foreground">
                                                                Prompt: <span className="font-medium text-foreground/80">{group.prompt.name}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center gap-2 mr-4 bg-muted/40 px-2 py-1 rounded-md border">
                                                        <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Automático</Label>
                                                        <Switch
                                                            checked={group.includeInAutoReport}
                                                            onCheckedChange={(checked) => handleUpdateGroup(group.id, { includeInAutoReport: checked })}
                                                            className="scale-75"
                                                        />
                                                    </div>
                                                    <select
                                                        value={group.sendToJid || ''}
                                                        onChange={e => handleUpdateGroup(group.id, { sendToJid: e.target.value || null })}
                                                        className="h-7 w-40 px-2 text-xs rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary truncate"
                                                        title="Grupo de Destino do Relatório"
                                                    >
                                                        <option value="">Enviar p/ Próprio Grupo</option>
                                                        {groups.map(g => (
                                                            <option key={g.id} value={g.jid || ''}>
                                                                {g.name === group.name ? '(Este Grupo)' : `Enviar p/ ${g.name}`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <select
                                                        value={group.promptId || ''}
                                                        onChange={e => handleUpdateGroup(group.id, { promptId: e.target.value || null })}
                                                        className="h-7 px-2 text-xs rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                                                    >
                                                        <option value="">Sem prompt</option>
                                                        {prompts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                    </select>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteGroup(group.id)}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Remote Groups from WhatsApp */}
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-4 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base">Grupos do WhatsApp</CardTitle>
                                <CardDescription>Busque e adicione grupos da sua conta.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                {selectedRemoteGroups.size > 0 && (
                                    <Button onClick={handleBulkAddGroups} size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                                        <CheckSquare className="h-3.5 w-3.5" />
                                        Importar ({selectedRemoteGroups.size})
                                    </Button>
                                )}
                                <Button onClick={fetchRemoteGroups} disabled={loadingRemote} variant="outline" size="sm" className="gap-2">
                                    <RefreshCw className={`h-3.5 w-3.5 ${loadingRemote ? 'animate-spin' : ''}`} />
                                    {loadingRemote ? 'Buscando...' : 'Buscar Grupos'}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {remoteGroups.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground">
                                    <Download className="h-8 w-8 mx-auto opacity-20 mb-2" />
                                    <p className="text-sm">Clique em &quot;Buscar Grupos&quot; para carregar.</p>
                                    <p className="text-xs mt-1">Requer conexão com a Evolution API.</p>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    {/* Select All */}
                                    {remoteGroups.some(rg => !groups.some(g => g.jid === rg.id)) && (
                                        <div className="flex items-center gap-3 p-2 rounded-lg border-b mb-1">
                                            <Checkbox
                                                id="select-all-groups"
                                                checked={selectedRemoteGroups.size === remoteGroups.filter(rg => !groups.some(g => g.jid === rg.id)).length && selectedRemoteGroups.size > 0}
                                                onCheckedChange={toggleSelectAllRemoteGroups}
                                            />
                                            <label htmlFor="select-all-groups" className="text-xs font-medium cursor-pointer text-muted-foreground">
                                                Selecionar Todos ({remoteGroups.filter(rg => !groups.some(g => g.jid === rg.id)).length} disponíveis)
                                            </label>
                                        </div>
                                    )}
                                    <div className="max-h-[300px] overflow-y-auto pr-1 space-y-1.5">
                                        {remoteGroups.map((rg) => {
                                            const alreadyAdded = groups.some(g => g.jid === rg.id)
                                            const isSelected = selectedRemoteGroups.has(rg.id)
                                            return (
                                                <div
                                                    key={rg.id}
                                                    className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors cursor-pointer ${alreadyAdded ? 'opacity-50 bg-muted/20 cursor-default' : isSelected ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/30'
                                                        }`}
                                                    onClick={() => !alreadyAdded && toggleRemoteGroupSelection(rg.id)}
                                                >
                                                    {alreadyAdded ? (
                                                        <div className="flex h-5 w-5 items-center justify-center shrink-0">
                                                            <Badge variant="secondary" className="text-[8px] px-1">✓</Badge>
                                                        </div>
                                                    ) : (
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => toggleRemoteGroupSelection(rg.id)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    )}
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0d9488]/10 shrink-0">
                                                        <Users className="h-3.5 w-3.5 text-[#0d9488]" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{rg.subject}</p>
                                                        <p className="text-[10px] text-muted-foreground truncate">{rg.id}</p>
                                                    </div>
                                                    {alreadyAdded && (
                                                        <Badge variant="secondary" className="text-[10px] shrink-0">Adicionado</Badge>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PROMPTS */}
                <TabsContent value="prompts" className="mt-6 space-y-6">
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-4 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base">Biblioteca de Prompts</CardTitle>
                                <CardDescription>Gerencie as instruções de IA para relatórios e reescrita.</CardDescription>
                            </div>
                            <Button onClick={() => openPromptDialog()} className="bg-primary hover:bg-primary/90 gap-2">
                                <Plus className="h-4 w-4" /> Novo Prompt
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {prompts.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Sparkles className="h-8 w-8 mx-auto opacity-20 mb-2" />
                                        <p className="text-sm">Nenhum prompt criado.</p>
                                        <p className="text-xs mt-1">Clique em &quot;Novo Prompt&quot; para começar.</p>
                                    </div>
                                ) : (
                                    prompts.map((prompt) => (
                                        <div key={prompt.id} className="flex items-start gap-3 p-4 rounded-lg border hover:bg-muted/30 transition-colors group">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0d9488]/10 shrink-0 mt-0.5">
                                                <BrainCircuit className="h-4 w-4 text-[#0d9488]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold">{prompt.name}</p>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{prompt.content}</p>
                                            </div>
                                            <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openPromptDialog(prompt)}>
                                                    <Edit className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeletePrompt(prompt.id)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Prompt Dialog */}
            <Dialog open={isPromptOpen} onOpenChange={setIsPromptOpen}>
                <DialogContent className="sm:max-w-[800px] h-[85vh] flex flex-col p-6">
                    <DialogHeader className="flex-none">
                        <DialogTitle>{editingPrompt ? "Editar Prompt" : "Novo Prompt"}</DialogTitle>
                        <DialogDescription>
                            {editingPrompt ? "Modifique as instruções deste prompt." : "Crie instruções para a IA processar seus textos."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto py-2 pr-2">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nome do Prompt</Label>
                                <Input value={promptName} onChange={e => setPromptName(e.target.value)} placeholder="Ex: Resumo Executivo" />
                            </div>
                            <div className="space-y-2 flex flex-col h-full">
                                <Label>Conteúdo / Instruções</Label>
                                <Textarea
                                    value={promptContent}
                                    onChange={e => setPromptContent(e.target.value)}
                                    placeholder="Escreva suas instruções detalhadas aqui..."
                                    className="min-h-[400px] font-mono text-sm resize-y"
                                />
                                <p className="text-[10px] text-muted-foreground text-right">
                                    {promptContent.length} caracteres
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex-none pt-4 border-t mt-2">
                        <Button variant="outline" onClick={() => setIsPromptOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSavePrompt} disabled={!promptName || !promptContent} className="bg-primary hover:bg-primary/90">
                            {editingPrompt ? "Atualizar" : "Salvar Prompt"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
