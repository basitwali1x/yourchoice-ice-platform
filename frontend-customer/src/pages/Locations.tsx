import { motion } from "framer-motion";
import { ChevronLeft, MapPin, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { YCICard, YCIButton } from "../components/yci/ui";

export default function Locations() {
    const navigate = useNavigate();

    const regions = [
        { name: "Louisiana Central", addr: "Lafayette, LA", status: "Active" },
        { name: "Texas East", addr: "Beaumont, TX", status: "Active" },
        { name: "South Corridor", addr: "Lake Charles, LA", status: "Active" },
    ];

    return (
        <div className="min-h-screen yci-frost-bg p-6 lg:p-12">
            <div className="max-w-4xl mx-auto pt-20">
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-yci-textMuted hover:text-yci-accent transition mb-12 group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
                    Back to Selection
                </button>

                <h1 className="text-5xl font-black tracking-tighter text-white mb-2 uppercase">Our Locations</h1>
                <p className="text-yci-textMuted font-medium mb-12">Authorized distribution centers and retail lockers across the network.</p>

                <div className="grid md:grid-cols-2 gap-6">
                    {regions.map((r, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <YCICard className="hover:border-yci-accent/30 transition-all cursor-pointer group">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-yci-accent/10 flex items-center justify-center">
                                            <MapPin className="text-yci-accent w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-white uppercase tracking-tight">{r.name}</h3>
                                            <p className="text-sm text-yci-textMuted font-bold">{r.addr}</p>
                                        </div>
                                    </div>
                                    <div className="px-2 py-1 rounded-md bg-green-500/10 text-[10px] font-black text-green-400 uppercase tracking-widest">
                                        {r.status}
                                    </div>
                                </div>
                                <YCIButton variant="ghost" className="w-full mt-6 flex items-center gap-2 uppercase text-[10px] tracking-widest hover:bg-yci-accent/5">
                                    <Navigation className="w-4 h-4" /> Get Directions
                                </YCIButton>
                            </YCICard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
