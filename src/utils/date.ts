export function formatBirthdateInput(
	raw: string,
	previousValue: string = ""
): string {
	const digitsOnly = raw.replace(/[^0-9]/g, "");
	const previousDigitsOnly = previousValue.replace(/[^0-9]/g, "");

	const isDeleting =
		raw.length < previousValue.length ||
		digitsOnly.length < previousDigitsOnly.length;

	if (isDeleting) {
		const onlyDigitsAndSlashes = /^[\d\/]*$/.test(raw);
		const maxLength = raw.length <= 10;

		if (onlyDigitsAndSlashes && maxLength) {
			return raw;
		}

		let result = "";
		for (let i = 0; i < digitsOnly.length && i < 8; i += 1) {
			result += digitsOnly[i];
			if (i === 1 || i === 3) {
				result += "/";
			}
		}
		return result;
	}

	let result = "";

	for (let i = 0; i < digitsOnly.length && i < 8; i += 1) {
		result += digitsOnly[i];
		if (i === 1 || i === 3) {
			result += "/";
		}
	}

	return result;
}

export function formatTimeUntilExpiry(hoursLeft?: number | null) {
	if (typeof hoursLeft !== "number") return null;
	const hours = Math.floor(hoursLeft);
	const minutes = Math.max(0, Math.round((hoursLeft - hours) * 60));
	if (hours <= 0 && minutes <= 0) {
		return "quelques minutes";
	}
	if (hours === 0) {
		return `${minutes} min`;
	}
	return `${hours} h ${minutes} min`;
}
