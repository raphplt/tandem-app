export function formatBirthdateInput(raw: string) {
	const digitsOnly = raw.replace(/[^0-9]/g, "");
	let result = "";

	for (let i = 0; i < digitsOnly.length && i < 8; i += 1) {
		result += digitsOnly[i];
		if (i === 1 || i === 3) {
			result += "/";
		}
	}

	return result;
}
