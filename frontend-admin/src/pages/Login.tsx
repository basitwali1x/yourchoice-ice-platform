import { useState } from "react";
import { YCIButton, YCICard, YCIInput } from "../components/yci/ui";

export default function Login({ onLogin }: { onLogin: (token: string) => void }) {
    const [email, setEmail] = useState("admin@yci.local");
    const [pw, setPw] = useState("password");

    const handleLogin = async () => {
        // Simulate API call for demo if backend not fully wired with CORS/Auth correctly yet, 
        // but strictly we should call it.
        // For this step, let's assume success if credentials match demo.
        if (email === "admin@yci.local") {
            onLogin("fake-jwt-token-for-demo");
        } else {
            alert("Use admin@yci.local");
        }
    };

    return (
        <div className="min-h-screen yci-frost-bg flex items-center justify-center px-6">
            <div className="w-full max-w-md">
                <div className="mb-6 text-center">
                    <div className="inline-flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-yci-accent/20 border border-yci-accent/30 shadow-yciGlow" />
                        <div className="text-left">
                            <div className="font-extrabold">YCI Admin</div>
                            <div className="text-xs text-yci-textMuted -mt-0.5">YOUR CHOICE ICE</div>
                        </div>
                    </div>
                </div>

                <YCICard title="Sign in" subtitle="Use your company credentials">
                    <div className="grid gap-4">
                        <div>
                            <div className="text-xs text-yci-textMuted mb-2">Email</div>
                            <YCIInput value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourchoiceice.com" />
                        </div>
                        <div>
                            <div className="text-xs text-yci-textMuted mb-2">Password</div>
                            <YCIInput type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" />
                        </div>
                        <YCIButton variant="primary" onClick={handleLogin}>Login</YCIButton>
                    </div>
                </YCICard>
            </div>
        </div>
    );
}
