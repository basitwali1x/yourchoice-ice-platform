import React from "react";
import { cn } from "../../lib/utils";

export function YCICard({
    title,
    subtitle,
    children,
    className = "",
}: {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "rounded-yci border border-white/5 bg-yci-card/40 backdrop-blur-md",
                "shadow-[0_14px_40px_rgba(0,0,0,.2)]",
                className
            )}
        >
            {(title || subtitle) && (
                <div className="p-5 border-b border-white/5">
                    {title && <h3 className="text-lg font-black tracking-tight text-white">{title}</h3>}
                    {subtitle && <p className="text-sm text-yci-textMuted mt-1">{subtitle}</p>}
                </div>
            )}
            <div className="p-5">{children}</div>
        </div>
    );
}

export function YCIButton({
    variant = "primary",
    className = "",
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "outline";
}) {
    const base = cn(
        "inline-flex items-center justify-center rounded-[12px] px-5 py-3 font-black text-sm uppercase tracking-wider",
        "transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    );

    const variants = {
        primary: "bg-yci-accent text-yci-bg0 shadow-yciGlow hover:shadow-yciGlowStrong hover:brightness-110",
        secondary: "bg-yci-surface text-white border border-white/10 hover:bg-yci-surface/80",
        outline: "bg-transparent text-yci-accent border border-yci-accent/30 hover:border-yci-accent hover:bg-yci-accent/5",
        ghost: "bg-transparent text-yci-text hover:bg-white/5",
    };

    return (
        <button className={cn(base, variants[variant], className)} {...props}>
            {children}
        </button>
    );
}

export function YCIInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={cn(
                "w-full rounded-[12px] bg-yci-bg1/40 border border-white/5 px-4 py-3",
                "text-yci-text placeholder:text-yci-textMuted/50 font-bold",
                "outline-none focus:border-yci-accent/40 focus:bg-yci-bg1/60 focus:shadow-yciGlow transition-all",
                props.className
            )}
        />
    );
}
