import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import React from 'react';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => {
        // Criamos um estilo "blindado" para garantir o verde escuro
        const isSuccess = props.variant === "success" || !props.variant;
        const customStyle = isSuccess ? {
          backgroundColor: "#15803d", // VERDE ESCURO (Green-700)
          background: "#15803d",
          color: "#ffffff",
          border: "1px solid #14532d",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
        } : {};

        return (
          <Toast
            key={id}
            {...props}
            style={customStyle}
            className="!bg-[#15803d] !text-white" // Reforço com Tailwind
          >
            <div className="grid gap-1">
              {title && <ToastTitle className="text-white font-bold">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-white/90">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="text-white/80 hover:text-white" />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}