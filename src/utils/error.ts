export function extractErrorMessage(
	error: unknown,
	fallback = "Something went wrong"
) {
	if (!error) {
		return fallback;
	}

	if (typeof error === "string") {
		return error;
	}

	if (error instanceof Error) {
		return error.message || fallback;
	}

	if (typeof error === "object") {
		const maybeMessage =
			(error as { message?: string }).message ??
			(error as { data?: { message?: string } }).data?.message ??
			(error as { body?: { message?: string } }).body?.message;
		if (maybeMessage) {
			return maybeMessage;
		}
	}

	try {
		return JSON.stringify(error);
	} catch {
		return fallback;
	}
}
