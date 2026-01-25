import React from "react";

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
            className={[
                "rounded-yci border border-white/10 bg-yci-card/80 backdrop-blur-sm",
                "shadow-[0_14px_40px_rgba(0,0,0,.35)]",
                className,
            ].join(" ")}
        >
            {(title || subtitle) && (
                <div className="p-5 border-b border-white/10">
                    {title && <h3 className="text-lg font-extrabold tracking-tight">{title}</h3>}
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
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost";
}) {
    const base =
        "inline-flex items-center justify-center rounded-[14px] px-4 py-3 font-extrabold " +
        "transition active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed";

    const primary =
        "bg-yci-accent text-[#0d1418] shadow-yciGlow hover:shadow-yciGlowStrong";
    const secondary =
        "bg-transparent text-yci-accent border border-yci-accent/60 shadow-yciGlow hover:shadow-yciGlowStrong";
    const ghost = "bg-transparent text-yci-text hover:bg-white/5";

    const v = variant === "primary" ? primary : variant === "secondary" ? secondary : ghost;

    return <button className={[base, v, className].join(" ")} {...props} />;
}

export function YCIInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={[
                "w-full rounded-[14px] bg-yci-bg1/60 border border-white/10 px-4 py-3",
                "text-yci-text placeholder:text-yci-textMuted",
                "outline-none focus:border-yci-accent/70 focus:shadow-yciGlow",
                props.className || "",
            ].join(" ")}
        />
    );
}
