import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { ReactNode } from "react";

interface AlertProps {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function Alert({ title, description, variant = "default" }: AlertProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md p-4",
        variant === "destructive" ? "bg-red-100 text-red-900" : "bg-gray-100 text-gray-900"
      )}
    >
      <AlertTriangle className="h-5 w-5" />
      <div>
        <AlertTitle>{title}</AlertTitle>
        {description && <AlertDescription>{description}</AlertDescription>}
      </div>
    </div>
  );
}

export function AlertTitle({ children }: { children: ReactNode }) {
  return <strong className="font-bold">{children}</strong>;
}

export function AlertDescription({ children }: { children: ReactNode }) {
  return <p className="text-sm">{children}</p>;
}
