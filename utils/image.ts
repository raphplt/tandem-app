export const getImageUrl = (path: string) => {
	return `${process.env.EXPO_PUBLIC_R2_PUBLIC_BASE_URL}/${path}`;
};
