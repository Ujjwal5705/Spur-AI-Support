import { prisma } from "../db/prisma.js";
import { Prisma } from '@prisma/client';
import { generateReply } from "../services/llm.service.js";
import { chatSchema } from "../validators/chat.validator.js";
export const sendMessage = async (req, res) => {
    try {
        const validation = chatSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: validation.error.issues[0]?.message || "Invalid input",
            });
        }
        const { message, sessionId } = validation.data;
        let conversation = null;
        if (sessionId) {
            conversation = await prisma.conversation.findUnique({
                where: {
                    id: sessionId,
                },
                include: {
                    messages: {
                        orderBy: {
                            createdAt: "asc",
                        },
                    },
                },
            });
        }
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {},
                include: {
                    messages: true,
                },
            });
        }
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                sender: "user",
                content: message,
            },
        });
        const history = conversation.messages.map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.content,
        }));
        const aiReply = await generateReply(history, message);
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                sender: "ai",
                content: aiReply,
            },
        });
        return res.json({
            reply: aiReply,
            sessionId: conversation.id,
        });
    }
    catch (error) {
        console.error("Error in sendMessage controller:", error);
        console.error("Error constructor name:", error?.constructor?.name);
        if (error instanceof Prisma.PrismaClientInitializationError) {
            return res.status(503).json({ error: "Database temporarily unavailable. Please try again." });
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P1001' || error.code === 'P2021' || error.message.includes('readonly')) {
                return res.status(503).json({ error: "Database temporarily unavailable. Please try again." });
            }
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
export const getHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;
        if (!sessionId || typeof sessionId !== "string") {
            return res.status(400).json({
                error: "A valid session ID is required",
            });
        }
        const messages = await prisma.message.findMany({
            where: {
                conversationId: sessionId,
            },
            orderBy: {
                createdAt: "asc",
            },
        });
        return res.json(messages);
    }
    catch (error) {
        console.error("Error in getHistory controller:", error);
        console.error("Error constructor name:", error?.constructor?.name);
        if (error instanceof Prisma.PrismaClientInitializationError) {
            return res.status(503).json({ error: "Database temporarily unavailable. Please try again." });
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P1001' || error.code === 'P2021') {
                return res.status(503).json({ error: "Database temporarily unavailable. Please try again." });
            }
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
//# sourceMappingURL=chat.controller.js.map