"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"

export function SidebarLayout({
    sidebar,
    children
}: {
    sidebar: React.ReactNode
    children: React.ReactNode
}) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    // Fechar menu automaticamente ao navegar
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    // Prevenir scroll do body quando menu mobile aberto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "auto"
        }
        return () => {
            document.body.style.overflow = "auto"
        }
    }, [isOpen])

    return (
        <div className="flex min-h-screen bg-[#FAF5FF]">
            {/* Mobile Header (Hambúrguer) */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b z-40 flex items-center px-4 justify-between shadow-sm">
                <div className="flex items-center gap-2 font-semibold tracking-tight text-[#2D3748]">
                    Trontec AI
                </div>
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 -mr-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                    aria-label="Menu"
                >
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            {/* Sidebar Overlay Escuro para Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Embutida (Desliza no mobile, Fixa no desktop) */}
            <div
                className={`fixed top-0 left-0 bottom-0 z-50 w-[260px] bg-white transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                {/* Mobile close button inside the sidebar (optional but nice UX) */}
                <div className="md:hidden absolute top-4 right-4 z-[60]">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {sidebar}
            </div>

            {/* Main Content Area */}
            <main className="flex-1 min-h-screen pt-14 md:pt-0 md:ml-[260px] w-full max-w-[100vw]">
                {children}
            </main>
        </div>
    )
}
