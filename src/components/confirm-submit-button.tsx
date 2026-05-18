"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ConfirmSubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  message: string;
  children: ReactNode;
};

export function ConfirmSubmitButton({ message, children, onClick, type, ...props }: ConfirmSubmitButtonProps) {
  return (
    <button
      {...props}
      type={type ?? "submit"}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    >
      {children}
    </button>
  );
}
