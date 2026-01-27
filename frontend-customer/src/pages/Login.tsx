import { motion } from "framer-motion";
import { ChevronLeft, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { YCIButton, YCICard, YCIInput } from "../components/yci/ui";

export default function Login() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen yci-frost-bg flex flex-col items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-yci-textMuted hover:text-yci-accent transition mb-8 group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
                    Back to Selection
                </button>

                <YCICard title="Customer Login" subtitle="Access your portal and order history" className="border-yci-accent/20">
                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-yci-textMuted ml-1">Account ID / Email</label>
                            <YCIInput type="text" placeholder="e.g. CLI-10023" />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-yci-textMuted">Password</label>
                                <button className="text-[10px] font-black uppercase tracking-widest text-yci-accent hover:brightness-110">Forgot?</button>
                            </div>
                            <YCIInput type="password" placeholder="••••••••" />
                        </div>

                        <YCIButton variant="primary" className="w-full h-14 uppercase tracking-widest">
                            <Lock className="w-4 h-4 mr-2" /> Sign In
                        </YCIButton>
                    </form>
                </YCICard>
            </motion.div>

            <div className="mt-12 text-center">
                <p className="text-xs font-bold text-yci-textMuted uppercase tracking-tight">
                    Don't have a commercial account?
                </p>
                <YCIButton variant="ghost" className="mt-2 text-xs">Register your business</YCIButton>
            </div>
        </div>
    );
}
