export function getDateWelcomeMessage(date: Date): string {
	const hours = date.getHours();
	if (hours < 12) {
		return "Bonjour";
	} else if (hours < 18) {
		return "Bon après-midi";
	} else {
		return "Bonsoir";
	}
}
