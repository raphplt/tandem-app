export enum MessageType {
	TEXT = "text",
	IMAGE = "image",
	EMOJI = "emoji",
	SYSTEM = "system",
}

export enum MessageStatus {
	SENT = "sent",
	DELIVERED = "delivered",
	READ = "read",
	FAILED = "failed",
}

export interface MessageMetadata {
	fileUrl?: string;
	fileSize?: number;
	fileType?: string;
	thumbnailUrl?: string;
	emoji?: string;
	systemMessage?: string;
	deliveryAttempts?: number;
	lastDeliveryAttempt?: string;
}

export interface MessageResponse {
	id: string;
	authorId: string;
	conversationId: string;
	content: string;
	type: MessageType;
	status: MessageStatus;
	replyToId?: string;
	editedAt?: string;
	deletedAt?: string;
	isDeleted: boolean;
	isEdited: boolean;
	metadata?: MessageMetadata;
	createdAt: string;
	updatedAt: string;
	isSystemMessage: boolean;
	isMediaMessage: boolean;
	isEmojiMessage: boolean;
	ageInMinutes: number;
	ageInHours: number;
	ageInDays: number;
	formattedAge: string;
}

export interface CreateMessageDto {
	conversationId: string;
	content: string;
	type?: MessageType;
	metadata?: MessageMetadata;
	replyToId?: string;
}

export type UpdateMessageDto = Partial<
	Pick<CreateMessageDto, "content" | "type" | "metadata" | "replyToId">
>;

