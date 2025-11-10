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
