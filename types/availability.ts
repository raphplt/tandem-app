export type AvailabilityStatus =
	| "idle"
	| "queued"
	| "matched"
	| "offline"
	| "paused"
	| (string & {});

export interface SearchStateEventPayload {
	status: AvailabilityStatus;
	queuedAt?: string | null;
	timeInQueue?: number | null;
	isOnline?: boolean;
}

export interface HeartbeatEventPayload {
	timestamp: string;
}
