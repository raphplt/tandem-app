import { useAuthContext } from "@/src/providers/auth-provider";

export function useAuthSession() {
	return useAuthContext();
}
