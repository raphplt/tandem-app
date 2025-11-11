import { Trans } from "@lingui/react/macro";
import { Image } from "expo-image";
import { LightningIcon } from "phosphor-react-native";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useActiveConversation } from "@/src/hooks/use-conversations";
import type { MatchProfileSnapshot, MatchResponse } from "@/types/match";

type DailyMatchCardProps = {
	match: MatchResponse;
	partner: MatchProfileSnapshot | null;
	onAccept: () => void;
	onReject: () => void;
	onStartChat: () => void;
	onContinueChat: () => void;
	isAccepting: boolean;
	isRejecting: boolean;
	isStartingConversation: boolean;
	waitingForPartner: boolean;
};

export function DailyMatchCard({
	match,
	partner,
	onAccept,
	onReject,
	onStartChat,
	onContinueChat,
	isAccepting,
	isRejecting,
	isStartingConversation,
	waitingForPartner,
}: DailyMatchCardProps) {
	const name = partner?.firstName ?? "Ton match";
	const secondaryLine = [
		partner?.age ? `${partner.age} ans` : null,
		partner?.city,
		partner?.country,
	]
		.filter(Boolean)
		.join(" • ");

	const chipsSource =
		(partner?.values && partner.values.length > 0 && partner.values) ||
		(partner?.interests && partner.interests.length > 0 && partner.interests) ||
		[];
	const chips = chipsSource ? chipsSource.slice(0, 3) : [];

	const statusLabel = getMatchStatusLabel(match, waitingForPartner);
	const expiresIn = formatTimeUntilExpiry(match.timeUntilExpiry);
	const canChat = match.isAccepted || match.isMutual;

	const { data: conversation } = useActiveConversation();

	return (
		<View className="rounded-3xl border border-outline-100 bg-white/95 p-6 dark:border-white/10 dark:bg-white/5">
			<Text className="text-xs uppercase tracking-[2px] text-typography-500 dark:text-typography-400">
				<Trans id="daily-match.header">Rencontre du jour</Trans>
			</Text>
			<View className="mt-4 flex-row items-center gap-4">
				<Avatar name={name} photoUrl={partner?.photoUrl} />
				<View className="flex-1">
					<Text className="text-2xl font-heading text-typography-900 dark:text-typography-white">
						{name}
					</Text>
					{secondaryLine ? (
						<Text className="text-sm text-typography-600 dark:text-typography-300">
							{secondaryLine}
						</Text>
					) : null}
				</View>
				<View className="items-end">
					<Text className="text-xs uppercase text-typography-500 dark:text-typography-400">
						<Trans id="daily-match.score">Affinité</Trans>
					</Text>
					<Text className="text-3xl font-semibold text-accentRose-600 dark:text-accentRose-300">
						{Math.round(match.compatibilityScore)}%
					</Text>
				</View>
			</View>

			{chips.length > 0 ? (
				<View className="mt-4 flex-row flex-wrap gap-2">
					{chips.map((chip) => (
						<View
							key={chip}
							className="rounded-full border border-accentGold-200/60 bg-accentGold-50/60 px-3 py-1 dark:border-accentGold-800/60 dark:bg-accentGold-900/20"
						>
							<Text className="text-xs font-semibold uppercase tracking-[1px] text-accentGold-700 dark:text-accentGold-200">
								{chip}
							</Text>
						</View>
					))}
				</View>
			) : null}

			<View className="mt-4 rounded-2xl border border-outline-100/60 bg-background-light/80 px-4 py-3 dark:border-white/5 dark:bg-white/5">
				<Text className="text-xs uppercase tracking-[1.2px] text-typography-500 dark:text-typography-300">
					{statusLabel}
				</Text>
				<Text className="mt-1 text-sm text-typography-700 dark:text-typography-200">
					<Trans id="daily-match.expires-in">
						Expire dans {expiresIn ?? "24h"}.
					</Trans>
				</Text>
			</View>

			<View className="mt-5 flex-row gap-3">
				{!match.isAccepted && !waitingForPartner ? (
					<>
						<MatchActionButton
							label={<Trans id="daily-match.reject">Passer</Trans>}
							onPress={onReject}
							variant="ghost"
							loading={isRejecting}
						/>
						<MatchActionButton
							label={<Trans id="daily-match.accept">Accepter</Trans>}
							onPress={onAccept}
							loading={isAccepting}
						/>
					</>
				) : null}
				{waitingForPartner ? (
					<View className="flex-1 rounded-2xl border border-dashed border-outline-200 px-4 py-3">
						<Text className="text-sm text-typography-600 dark:text-typography-300">
							<Trans id="daily-match.waiting">
								En attente de la réponse de ton match.
							</Trans>
						</Text>
					</View>
				) : null}
				{canChat && !conversation ? (
					<MatchActionButton
						label={<Trans id="daily-match.start-chat">Commencer à discuter</Trans>}
						onPress={onStartChat}
						loading={isStartingConversation}
						icon={<LightningIcon size={20} color="#FFFFFF" weight="fill" />}
					/>
				) : conversation ? (
					<MatchActionButton
						label={
							<Trans id="daily-match.continue-chat">Continuer la conversation</Trans>
						}
						onPress={onContinueChat}
						icon={<LightningIcon size={20} color="#FFFFFF" weight="fill" />}
					/>
				) : null}
			</View>
		</View>
	);
}

function Avatar({
	name,
	photoUrl,
}: {
	name: string;
	photoUrl?: string | null;
}) {
	const initials = name
		.split(" ")
		.map((part) => part.charAt(0).toUpperCase())
		.slice(0, 2)
		.join("");

	return (
		<View className="h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-outline-100 bg-background-muted dark:border-white/10 dark:bg-white/10">
			{photoUrl ? (
				<Image source={{ uri: photoUrl }} style={{ width: "100%", height: "100%" }} />
			) : (
				<Text className="text-xl font-semibold text-typography-900 dark:text-typography-white">
					{initials}
				</Text>
			)}
		</View>
	);
}

function MatchActionButton({
	label,
	onPress,
	variant = "solid",
	loading,
	icon,
}: {
	label: ReactNode;
	onPress: () => void;
	variant?: "solid" | "ghost";
	loading?: boolean;
	icon?: ReactNode;
}) {
	const baseClasses =
		"flex-1 flex-row items-center justify-center rounded-2xl px-4 py-3 transition-all duration-150 active:scale-[0.98]";
	const solidClasses =
		"bg-typography-900 dark:bg-white text-white dark:text-typography-900";
	const ghostClasses =
		"border border-outline-200 bg-white/80 text-typography-900 dark:border-white/20 dark:bg-white/5 dark:text-white";
	const className =
		variant === "solid" ? `${baseClasses} ${solidClasses}` : `${baseClasses} ${ghostClasses}`;

	return (
		<Pressable
			onPress={onPress}
			disabled={loading}
			className={className}
		>
			{loading ? (
				<ActivityIndicator color={variant === "solid" ? "#FFFFFF" : undefined} />
			) : (
				<View className="flex-row items-center gap-2">
					{icon}
					<Text
						className={
							variant === "solid"
								? "font-semibold text-white"
								: "font-semibold text-typography-900 dark:text-white"
						}
					>
						{label}
					</Text>
				</View>
			)}
		</Pressable>
	);
}

function formatTimeUntilExpiry(hoursLeft?: number) {
	if (typeof hoursLeft !== "number") return null;
	const hours = Math.floor(hoursLeft);
	const minutes = Math.max(0, Math.round((hoursLeft - hours) * 60));
	if (hours <= 0 && minutes <= 0) {
		return "quelques instants";
	}
	if (hours === 0) {
		return `${minutes} min`;
	}
	if (minutes === 0) {
		return `${hours} h`;
	}
	return `${hours} h ${minutes} min`;
}

function getMatchStatusLabel(match: MatchResponse, waitingForPartner: boolean) {
	if (match.isRejected) {
		return <Trans id="daily-match.status.rejected">Match refusé</Trans>;
	}
	if (match.isAccepted) {
		return <Trans id="daily-match.status.accepted">Connexion prête</Trans>;
	}
	if (waitingForPartner) {
		return (
			<Trans id="daily-match.status.waiting-partner">
				En attente de ton match
			</Trans>
		);
	}
	return <Trans id="daily-match.status.pending">Réponse attendue</Trans>;
}
