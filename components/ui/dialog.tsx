import * as React from "react";
import { Dialog as DialogPrimitive, DialogContent as DialogContentPrimitive } from "@radix-ui/react-dialog";

export const Dialog = DialogPrimitive;
export const DialogContent = DialogContentPrimitive;

export function DialogHeader({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={"flex flex-col space-y-1.5 p-6 " + (className ?? "")}>{children}</div>
	);
}

export function DialogTitle({ children, className }: React.HTMLAttributes<HTMLHeadingElement>) {
	return (
		<h2 className={"text-lg font-semibold leading-none tracking-tight " + (className ?? "")}>{children}</h2>
	);
}
