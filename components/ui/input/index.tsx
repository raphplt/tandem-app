import React from "react";
import {
	Pressable,
	PressableProps,
	TextInput,
	TextInputProps,
	View,
	ViewProps,
} from "react-native";

import { createInput } from "@gluestack-ui/core/input/creator";

const cn = (...classes: (string | false | null | undefined)[]): string =>
	classes.filter(Boolean).join(" ");

type StyledProps = {
	className?: string;
	states?: {
		focus?: boolean;
		invalid?: boolean;
		disabled?: boolean;
		readonly?: boolean;
	};
	dataSet?: Record<string, string>;
};

type InputRootProps = ViewProps & StyledProps;

type InputSlotProps = PressableProps & StyledProps;

type InputIconProps = ViewProps & StyledProps;

type InputFieldProps = TextInputProps & StyledProps;

const StyledInputRoot = React.forwardRef<
	React.ElementRef<typeof View>,
	InputRootProps
>(function StyledInputRoot({ className, states, dataSet, ...props }, ref) {
	return (
		<View
			ref={ref}
			{...props}
			className={cn(
				"flex-row items-center rounded-2xl border border-outline-200 bg-white text-left transition-colors dark:border-zinc-700 dark:bg-zinc-900",
				states?.focus ? "border-primary-500 dark:border-primary-400" : "",
				states?.invalid ? "border-error-500 dark:border-error-400" : "",
				states?.disabled ? "opacity-60" : "",
				className
			)}
		/>
	);
});

const StyledInputSlot = React.forwardRef<
	React.ElementRef<typeof Pressable>,
	InputSlotProps
>(function StyledInputSlot({ className, states, dataSet, ...props }, ref) {
	return (
		<Pressable
			ref={ref}
			{...props}
			className={cn(
				"flex flex-row items-center justify-center px-3",
				states?.disabled ? "opacity-40" : "",
				className
			)}
		/>
	);
});

const StyledInputIcon = React.forwardRef<
	React.ElementRef<typeof View>,
	InputIconProps
>(function StyledInputIcon({ className, states, dataSet, ...props }, ref) {
	return (
		<View
			ref={ref}
			{...props}
			className={cn("flex items-center justify-center", className)}
		/>
	);
});

const StyledInputField = React.forwardRef<
	React.ElementRef<typeof TextInput>,
	InputFieldProps
>(function StyledInputField(
	{ className, states, dataSet, placeholderTextColor, editable, ...props },
	ref
) {
	return (
		<TextInput
			ref={ref}
			className={cn(
				"flex-1 px-4 py-3 font-body text-base text-typography-900 dark:text-zinc-100",
				editable === false ? "opacity-60" : "",
				className
			)}
			placeholderTextColor={placeholderTextColor ?? "#9ca3af"}
			editable={editable}
			{...props}
		/>
	);
});

const BaseInput = createInput({
	Root: StyledInputRoot,
	Icon: StyledInputIcon,
	Slot: StyledInputSlot,
	Input: StyledInputField,
});

const Input = BaseInput;
const InputField = BaseInput.Input;
const InputSlot = BaseInput.Slot;
const InputIcon = BaseInput.Icon;

export { Input, InputField, InputIcon, InputSlot };
