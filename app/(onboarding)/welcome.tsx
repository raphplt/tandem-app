import { Motion } from "@legendapp/motion";
import { Trans } from "@lingui/react/macro";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
	Dimensions,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const { width } = Dimensions.get("window");

const slides = [
	{
		id: 1,
		title: "onboarding.welcome.slide1.title",
		titleFallback: "Une seule conversation par jour.",
		subtitle: "onboarding.welcome.slide1.subtitle",
		subtitleFallback: "Prenez le temps de vous connecter vraiment.",
	},
	{
		id: 2,
		title: "onboarding.welcome.slide2.title",
		titleFallback: "Pas de swipe, pas de pub.",
		subtitle: "onboarding.welcome.slide2.subtitle",
		subtitleFallback: "Une approche plus authentique et respectueuse.",
	},
	{
		id: 3,
		title: "onboarding.welcome.slide3.title",
		titleFallback: "Juste des gens réels, comme toi.",
		subtitle: "onboarding.welcome.slide3.subtitle",
		subtitleFallback: "Des rencontres authentiques, sans artifice.",
	},
];

export default function WelcomeScreen() {
	const router = useRouter();
	const [currentIndex, setCurrentIndex] = useState(0);
	const scrollViewRef = useRef<ScrollView>(null);

	const handleScroll = (event: any) => {
		const contentOffsetX = event.nativeEvent.contentOffset.x;
		const index = Math.round(contentOffsetX / width);
		setCurrentIndex(index);
	};

	const handleNext = () => {
		if (currentIndex < slides.length - 1) {
			const nextIndex = currentIndex + 1;
			scrollViewRef.current?.scrollTo({ x: nextIndex * width, animated: true });
			setCurrentIndex(nextIndex);
		} else {
			router.push("/(onboarding)/profile-step-1");
		}
	};

	return (
		<View className="flex-1 bg-white dark:bg-black">
			<ScrollView
				ref={scrollViewRef}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				onMomentumScrollEnd={handleScroll}
				scrollEventThrottle={16}
			>
				{slides.map((slide) => (
					<View
						key={slide.id}
						style={{ width }}
						className="flex-1 items-center justify-center px-8"
					>
						<Motion.View
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="items-center"
						>
							<Text className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 text-center">
								<Trans id={slide.title}>{slide.titleFallback}</Trans>
							</Text>
							<Text className="text-lg text-zinc-600 dark:text-zinc-400 text-center">
								<Trans id={slide.subtitle}>{slide.subtitleFallback}</Trans>
							</Text>
						</Motion.View>
					</View>
				))}
			</ScrollView>

			<View className="absolute bottom-8 left-0 right-0 px-8">
				<View className="flex-row justify-center mb-6 space-x-2">
					{slides.map((_, index) => (
						<View
							key={index}
							className={`h-2 rounded-full ${
								index === currentIndex
									? "bg-blue-600 w-8"
									: "bg-zinc-300 dark:bg-zinc-700 w-2"
							}`}
						/>
					))}
				</View>

				<TouchableOpacity
					onPress={handleNext}
					className="bg-blue-600 rounded-xl py-4"
				>
					<Text className="text-center text-base font-semibold text-white">
						{currentIndex === slides.length - 1 ? (
							<Trans id="onboarding.welcome.start">Commencer</Trans>
						) : (
							<Trans id="onboarding.welcome.next">Suivant</Trans>
						)}
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}
