import axios from 'axios';

interface Message {
    key: {
        remoteJid: string;
        id: string;
        participant?: string; // Important for groups
    };
    pushName?: string;
    message: {
        conversation?: string;
        imageMessage?: { caption?: string };
        videoMessage?: { caption?: string };
        extendedTextMessage?: { text?: string };
        locationMessage?: {
            degreesLatitude: number;
            degreesLongitude: number;
            name?: string;
            address?: string;
        };
        reactionMessage?: {
            key: { id: string };
            text: string;
            senderKeyId?: string;
        };
    };
    messageTimestamp: number | string;
}

export class EvolutionService {
    private baseUrl: string;
    private token: string;
    private instanceName: string;

    constructor(baseUrl: string, instanceName: string, token: string) {
        let url = baseUrl.replace(/\/$/, ''); // Remove trailing slash
        if (!url.startsWith('http')) {
            url = `https://${url}`; // Default to https
        }
        this.baseUrl = url;
        this.instanceName = instanceName;
        this.token = token;
    }

    async fetchMessages(groupJid: string, limitPages: number = 100): Promise<Message[]> {
        let allMessages: Message[] = [];
        let page = 1;

        try {
            while (page <= limitPages) {
                const requestUrl = `${this.baseUrl}/chat/findMessages/${encodeURIComponent(this.instanceName)}`;
                console.log(`[DEBUG] Fetching page ${page} from: ${requestUrl}`);
                console.log(`[DEBUG] BaseURL: '${this.baseUrl}', Instance: '${this.instanceName}'`);

                console.log(`Fetching page ${page} from Evolution API...`);
                const response = await axios.post(
                    requestUrl,
                    {
                        where: {
                            key: {
                                remoteJid: groupJid,
                            },
                        },
                        page: page,
                        limit: 50,
                        sort: "desc" // Prioritize newest messages
                    },
                    {
                        headers: {
                            apikey: this.token,
                        },
                        timeout: 10000
                    }
                );

                const messages = response.data?.messages?.records || [];
                if (messages.length === 0) break;

                allMessages = [...allMessages, ...messages];

                // Check if we reached the end or should continue
                // The API response logic from n8n suggests checking currentPage
                // But we just increment page here.

                page++;
            }
        } catch (error) {
            const err = error as { message?: string, response?: { status?: number, data?: unknown } };
            console.error('Error fetching messages from Evolution API:', err.message);
            if (err.response) {
                console.error('Response Status:', err.response.status);
                console.error('Response Data:', JSON.stringify(err.response.data, null, 2));
            }
            throw new Error('Failed to fetch messages from Evolution API');
        }

        return allMessages;
    }

    async sendMessage(groupJid: string, text: string): Promise<void> {
        const url = `${this.baseUrl}/message/sendText/${encodeURIComponent(this.instanceName)}`;
        try {
            console.log(`[EvolutionService] Sending message to ${groupJid} via ${url}`);
            await axios.post(
                url,
                {
                    number: groupJid,
                    text: text,
                    delay: 1200,
                    linkPreview: false,
                },
                {
                    headers: {
                        apikey: this.token,
                    },
                }
            );
        } catch (error) {
            const err = error as { message?: string, response?: { status?: number, data?: unknown } };
            console.error(`[EvolutionService] Error sending to ${groupJid}:`);
            console.error(`Status: ${err.response?.status}`);
            console.error(`Response: ${JSON.stringify(err.response?.data, null, 2)}`);
            throw new Error(`Failed to send message: ${JSON.stringify(err.response?.data || err.message)}`);
        }
    }

    async fetchAllGroups(): Promise<{ id: string, subject: string }[]> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/group/fetchAllGroups/${encodeURIComponent(this.instanceName)}?getParticipants=false`,
                {
                    headers: {
                        apikey: this.token,
                    },
                }
            );

            // Map to simplified structure
            const data = (response.data || []) as { id: string, subject: string }[];
            return data.map((g) => ({
                id: g.id,
                subject: g.subject
            }));
        } catch (error) {
            console.error('Error fetching groups from Evolution API:', error);
            // Return empty instead of throwing to avoid breaking UI? Or throw?
            // Throwing allows UI to show error.
            throw new Error('Failed to fetch groups from Evolution API');
        }
    }



    async fetchGroupsWithParticipants(): Promise<unknown[]> {
        try {
            console.log(`[DEBUG] Fetching all groups with participants...`);
            const response = await axios.get(
                `${this.baseUrl}/group/fetchAllGroups/${encodeURIComponent(this.instanceName)}?getParticipants=true`,
                {
                    headers: {
                        apikey: this.token,
                    },
                }
            );

            return (response.data as unknown[]) || [];
        } catch (error) {
            const err = error as { message?: string };
            console.error('Error fetching groups with participants:', err.message);
            return [];
        }
    }

    async fetchProfilePictureUrl(jid: string): Promise<string | null> {
        try {
            // Attempt to fetch profile picture
            const response = await axios.post(
                `${this.baseUrl}/chat/findProfilePicture/${encodeURIComponent(this.instanceName)}`,
                { number: jid },
                {
                    headers: { apikey: this.token }
                }
            );
            return (response.data as { profilePictureUrl?: string })?.profilePictureUrl || null;
        } catch (error) {
            // It's common to fail if privacy settings hide the pic, so we just log warning or ignore
            // console.warn(`Could not fetch profile pic for ${jid}: ${error.message}`);
            return null;
        }
    }

    async fetchBusinessProfile(jid: string): Promise<unknown | null> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/chat/fetchBusinessProfile/${encodeURIComponent(this.instanceName)}`,
                { number: jid },
                {
                    headers: { apikey: this.token }
                }
            );
            return (response.data as unknown) || null;
        } catch (error) {
            // Not a business or error
            return null;
        }
    }
}

