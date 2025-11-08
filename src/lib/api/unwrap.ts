import type { ApiError } from "@/src/lib/api/client";

function normalizeErrorMessage(error: ApiError | null): string {
	if (!error) {
		return "Unknown error";
	}
	if (typeof error.message === "string") {
		return error.message;
	}
	if (Array.isArray(error.message) && error.message.length > 0) {
		return error.message.join(" • ");
	}
	return error.error ?? "Unknown error";
}

export async function unwrapApiResponse<T>(
	promise: Promise<{ data: T | null; error: ApiError | null }>,
	options?: { fallbackMessage?: string }
): Promise<T> {
	const result = await promise;
	if (result.error) {
		throw new Error(normalizeErrorMessage(result.error));
	}
	if (result.data === null || typeof result.data === "undefined") {
		throw new Error(options?.fallbackMessage ?? "Empty response");
	}
	return result.data;
}

