import { prisma } from "@/lib/prisma";
import { EvolutionService } from "./evolution.service";

export class ContactsService {
    private evolutionService: EvolutionService;

    constructor() {
        // We initialize with empty values, assuming initialize() will be called or values aren't needed for DB ops
        // But for sync we need the real service.
        this.evolutionService = new EvolutionService("", "", "");
    }

    private async getEvolutionService() {
        const settings = await prisma.settings.findFirst();
        if (!settings) throw new Error("Settings not configured");
        return new EvolutionService(settings.evolutionApiUrl, settings.evolutionInstanceName, settings.evolutionToken);
    }

    async syncContacts() {
        const service = await this.getEvolutionService();
        const activeGroups = await prisma.group.findMany({ where: { isActive: true } });
        const activeGroupJids = new Set(activeGroups.map(g => g.jid));

        // Fetch All Groups with Participants (Bulk)
        const allGroupsData = await service.fetchGroupsWithParticipants() as { id: string, participants: { id: string, phoneNumber?: string, user?: string }[] }[];

        const stats = {
            totalGroups: activeGroups.length,
            contactsFound: 0,
            contactsCreated: 0,
            contactsUpdated: 0
        };

        for (const data of allGroupsData) {
            // Verify if this group is one we track
            if (!activeGroupJids.has(data.id)) continue;

            // Find our local group ID
            const localGroup = activeGroups.find(g => g.jid === data.id);
            if (!localGroup) continue;

            // STRATEGY: Fetch recent messages to get PushNames (since participant list lacks them)
            const jidToName: Record<string, string> = {};
            try {
                const recentMessages = await service.fetchMessages(data.id, 1); // 1 page (50 msgs)
                recentMessages.forEach(msg => {
                    const sender = msg.key.participant || msg.key.remoteJid; // In groups, sender is participant
                    if (sender && msg.pushName) {
                        jidToName[sender] = msg.pushName;
                    }
                });
            } catch (e) {
                console.warn(`Could not fetch messages for group ${data.id} to enrich names.`);
            }

            const participants = data.participants || [];

            for (const p of participants) {
                // PREFER Phone JID (phoneNumber field) over LID (id field)
                // This ensures Profile Picture fetch works (usually fails with LID)
                const contactJid = p.phoneNumber || p.id;
                // We keep track of the 'raw' ID (often LID) to look up names from messages
                const rawId = p.id;

                if (!contactJid) continue;

                stats.contactsFound++;

                // Determine Name: 
                // Messages might be indexed by LID (rawId) OR Phone JID
                const detectedName = jidToName[rawId] || jidToName[contactJid] || null;

                // Upsert Contact
                await prisma.contact.upsert({
                    where: { jid: contactJid },
                    update: {
                        groups: {
                            connect: { id: localGroup.id }
                        },
                        // Only update name if we found a better one and current is null or we want to overwrite?
                        // Let's only update if we found a name
                        ...(detectedName ? { pushName: detectedName, name: detectedName } : {})
                    },
                    create: {
                        jid: contactJid,
                        name: p.user || detectedName || "", // Use p.user (notify) or detected name
                        pushName: detectedName,
                        groups: {
                            connect: { id: localGroup.id }
                        }
                    }
                });
            }
        }

        return stats;
    }

    async listContacts(page = 1, limit = 50, search?: string, groupId?: string, businessOnly?: boolean) {
        const offset = (page - 1) * limit;
        const where: Record<string, unknown> = {};

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { pushName: { contains: search } },
                { jid: { contains: search } }
            ];
        }

        if (groupId) {
            where.groups = {
                some: { id: groupId }
            };
        }

        if (businessOnly) {
            where.isBusiness = true;
        }

        const contacts = await prisma.contact.findMany({
            where: where as never,
            take: limit,
            skip: offset,
            include: {
                groups: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        const total = await prisma.contact.count({ where: where as never });

        return {
            data: contacts,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                current: page
            }
        };
    }

    async enrichContacts(limit = 10) {
        const service = await this.getEvolutionService();

        // Find contacts that we haven't checked fully?
        // Or just those without picture OR description?
        // For simplicity, cycle through all, but maybe prioritize missing info.
        // Let's stick to simple logic: priority to missing picture, then missing description.
        const contactsToUpdate = await prisma.contact.findMany({
            where: {
                OR: [
                    { profilePictureUrl: null },
                    { description: null } // Most won't have it, but good to check
                ],
                jid: { not: { contains: '@g.us' } }
            },
            take: limit
        });

        let updated = 0;

        for (const contact of contactsToUpdate) {
            const dataToUpdate: Record<string, unknown> = {};

            // 1. Profile Picture
            if (!contact.profilePictureUrl) {
                const picUrl = await service.fetchProfilePictureUrl(contact.jid);
                if (picUrl) dataToUpdate.profilePictureUrl = picUrl;
            }

            // 2. Business Profile / Extended Info
            const biz = await service.fetchBusinessProfile(contact.jid) as { description?: string, email?: string, website?: string[] } | null;
            if (biz) {
                if (biz.description) dataToUpdate.description = biz.description;
                if (biz.email) dataToUpdate.email = biz.email;
                if (biz.website) dataToUpdate.website = biz.website.join(', '); // Often an array
                dataToUpdate.isBusiness = true;
            }

            if (Object.keys(dataToUpdate).length > 0) {
                await prisma.contact.update({
                    where: { id: contact.id },
                    data: dataToUpdate as never
                });
                updated++;
            }

            // Add a small delay to avoid rate limits?
            await new Promise(r => setTimeout(r, 200));
        }

        return { processed: contactsToUpdate.length, updated };
    }
}
