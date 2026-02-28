"use client"

import { useEffect, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface Group {
    id: string
    name: string
    isActive: boolean
}

interface GroupSelectorProps {
    selectedGroupIds: string[]
    onSelectionChange: (ids: string[]) => void
}

export function GroupSelector({ selectedGroupIds, onSelectionChange }: GroupSelectorProps) {
    const [groups, setGroups] = useState<Group[]>([])
    const [loading, setLoading] = useState(false)

    const fetchGroups = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/groups")
            const data = await res.json()
            if (Array.isArray(data)) {
                const active = data.filter((g: Group) => g.isActive)
                setGroups(active)
            }
        } catch {
            toast.error("Erro ao carregar grupos.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGroups()
    }, [])

    const toggleGroup = (id: string, checked: boolean) => {
        if (checked) {
            onSelectionChange([...selectedGroupIds, id])
        } else {
            onSelectionChange(selectedGroupIds.filter((g) => g !== id))
        }
    }

    const toggleAllGroups = (checked: boolean) => {
        if (checked) onSelectionChange(groups.map((g) => g.id))
        else onSelectionChange([])
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label>Grupos Alvo</Label>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="all-groups"
                        checked={groups.length > 0 && selectedGroupIds.length === groups.length}
                        onCheckedChange={(c) => toggleAllGroups(!!c)}
                    />
                    <Label htmlFor="all-groups" className="text-xs text-muted-foreground font-normal cursor-pointer">
                        Selecionar Todos
                    </Label>
                </div>
            </div>

            <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto space-y-2 bg-slate-50">
                {loading ? (
                    <div className="text-xs text-center p-2 text-muted-foreground">Carregando grupos...</div>
                ) : groups.length === 0 ? (
                    <div className="text-xs text-center p-2 text-muted-foreground">Nenhum grupo ativo.</div>
                ) : (
                    groups.map((g) => (
                        <div key={g.id} className="flex items-center space-x-2 hover:bg-slate-100 p-1 rounded">
                            <Checkbox
                                id={`group-${g.id}`}
                                checked={selectedGroupIds.includes(g.id)}
                                onCheckedChange={(c) => toggleGroup(g.id, !!c)}
                            />
                            <Label htmlFor={`group-${g.id}`} className="text-sm cursor-pointer flex-1">
                                {g.name}
                            </Label>
                        </div>
                    ))
                )}
            </div>
            <p className="text-[10px] text-muted-foreground">
                {selectedGroupIds.length} grupo(s) selecionado(s).
            </p>
        </div>
    )
}
