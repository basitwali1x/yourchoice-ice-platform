import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Truck,
    ShieldCheck,
    BarChart3,
    Phone,
    MapPin,
    ChevronRight,
    Play,
    X
} from "lucide-react";
import { YCIButton, YCICard, YCIInput } from "../components/yci/ui";
import { getProducts, submitOrder, getCustomers } from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [orderLoading, setOrderLoading] = useState(false);
    const [showDemoModal, setShowDemoModal] = useState(false);

    const scrollToOrder = () => {
        document.getElementById("quick-order")?.scrollIntoView({ behavior: "smooth" });
    };

    // Quick Order State
    const [qty20, setQty20] = useState(10);
    const [qty8, setQty8] = useState(0);
    const [deliveryDate, setDeliveryDate] = useState("2026-01-25");
    const [selectedCustId, setSelectedCustId] = useState("");

    useEffect(() => {
        getProducts().then(setProducts).catch(console.error);
        getCustomers().then(d => {
            setCustomers(d);
            if (d.length > 0) setSelectedCustId(d[0].id);
        }).catch(console.error);
    }, []);

    const handleOrder = async () => {
        if (!selectedCustId) return alert("Select a customer (simulating login)");
        setOrderLoading(true);

        const items = [];
        const p20 = products.find(p => p.sku === 'YCI-20LB');
        const p8 = products.find(p => p.sku === 'YCI-8LB');

        if (qty20 > 0 && p20) items.push({ product_id: p20.id, quantity: qty20 });
        if (qty8 > 0 && p8) items.push({ product_id: p8.id, quantity: qty8 });

        if (items.length === 0) {
            setOrderLoading(false);
            return alert("Select at least one item.");
        }

        try {
            await submitOrder({
                customer_id: selectedCustId,
                requested_delivery_date: deliveryDate,
                items
            });
            alert("Order Submitted Successfully!");
        } catch (e) {
            alert("Failed to submit order.");
        } finally {
            setOrderLoading(false);
        }
    };

    return (
        <div className="min-h-screen yci-frost-bg overflow-x-hidden selection:bg-yci-accent selection:text-yci-bg0">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-yci-bg0/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-yci-accent/10 border border-yci-accent/20 flex items-center justify-center">
                            <div className="w-5 h-5 bg-yci-accent rounded shadow-[0_0_15px_rgba(155,212,228,0.5)]" />
                        </div>
                        <div className="leading-tight">
                            <div className="font-black text-xl tracking-tighter text-white">YOUR CHOICE ICE</div>
                            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-yci-accent/80">Premium Quality Est. 2025</div>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-widest">
                        <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-yci-accent transition">Service</button>
                        <button onClick={() => document.getElementById("regions")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-yci-accent transition">Regions</button>
                        <button onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-yci-accent transition">Contact</button>
                    </div>

                    <div className="flex items-center gap-4">
                        <YCIButton variant="ghost" className="text-xs" onClick={() => navigate("/login")}>Log In</YCIButton>
                        <YCIButton variant="primary" className="text-xs h-10 px-6" onClick={scrollToOrder}>Order Now</YCIButton>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr,420px] gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yci-accent/10 border border-yci-accent/20 text-[10px] font-black uppercase tracking-widest text-yci-accent mb-8">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yci-accent opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-yci-accent"></span>
                            </span>
                            Now Serving Louisiana & Texas Operatons
                        </div>

                        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter mb-8 text-white">
                            PREMIUM ICE.<br />
                            RELIABLE SERVICE.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yci-accent to-white drop-shadow-[0_0_20px_rgba(155,212,228,0.3)]">
                                THE CLEAR CHOICE.
                            </span>
                        </h1>

                        <p className="text-lg text-yci-textMuted max-w-xl mb-10 leading-relaxed font-medium">
                            The industry standard in high-volume ice distribution. Pure, crystal clear ice for commercial needs with real-time tracking and clean proof-of-delivery.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <YCIButton variant="primary" className="h-14 px-8 text-base" onClick={() => navigate("/login")}>
                                Create New Account <ChevronRight className="ml-2 w-5 h-5" />
                            </YCIButton>
                            <YCIButton variant="outline" className="h-14 px-8 text-base group" onClick={() => setShowDemoModal(true)}>
                                <Play className="mr-2 w-4 h-4 fill-yci-accent" /> Watch Demo
                            </YCIButton>
                            <YCIButton variant="ghost" className="h-14 px-8 text-base" onClick={() => navigate("/locations")}>
                                <MapPin className="mr-2 w-4 h-4" /> Find a Location
                            </YCIButton>
                        </div>
                    </motion.div>

                    <motion.div
                        id="quick-order"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <YCICard
                            title="QUICK ORDER PORTAL"
                            subtitle="Restock your business in seconds"
                            className="relative overflow-hidden group border-yci-accent/20 shadow-yciGlow"
                        >
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-yci-textMuted ml-1">Location / Account</label>
                                    <select className="w-full bg-yci-bg1/40 border border-white/5 rounded-[12px] px-4 py-3 text-white font-bold outline-none focus:border-yci-accent/40 transition-all appearance-none"
                                        value={selectedCustId} onChange={e => setSelectedCustId(e.target.value)}>
                                        {customers.map(c => <option key={c.id} value={c.id} className="bg-yci-bg1 text-white">{c.business_name}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-yci-textMuted ml-1">20lb Bags</label>
                                        <YCIInput type="number" value={qty20} onChange={e => setQty20(Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-yci-textMuted ml-1">8lb Bags</label>
                                        <YCIInput type="number" value={qty8} onChange={e => setQty8(Number(e.target.value))} />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-yci-textMuted ml-1">Requested Delivery Date</label>
                                    <YCIInput type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
                                </div>

                                <YCIButton
                                    onClick={handleOrder}
                                    className="w-full h-14 mt-2"
                                    disabled={orderLoading}
                                >
                                    {orderLoading ? "Processing..." : "Confirm & Place Order"}
                                </YCIButton>

                                <p className="text-center text-[10px] font-bold text-yci-textMuted uppercase tracking-tight">
                                    Secured by Your Choice Ice Network
                                </p>
                            </div>

                            {/* Decorative background glow inside card */}
                            <div className="absolute -top-12 -right-12 w-24 h-24 bg-yci-accent/5 rounded-full blur-3xl transition-all group-hover:bg-yci-accent/10" />
                        </YCICard>
                    </motion.div>
                </div>

                {/* Background decorative elements */}
                <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-yci-accent/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-500/[0.03] rounded-full blur-[150px] pointer-events-none" />
            </section>

            {/* Features section */}
            <section id="features" className="py-24 border-t border-white/5 bg-yci-bg1/20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl font-black tracking-tighter text-white sm:text-4xl mb-4">
                            RELIABILITY AT SCALE
                        </h2>
                        <div className="h-1 w-20 bg-yci-accent mx-auto rounded-full" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Truck,
                                title: "Smart Fleet",
                                desc: "Refrigerated vehicles with real-time GPS tracking and AI route optimization."
                            },
                            {
                                icon: ShieldCheck,
                                title: "Accurate Counts",
                                desc: "Clean proof-of-delivery (POD) with photo verification for every single drop."
                            },
                            {
                                icon: BarChart3,
                                title: "Production Monitoring",
                                desc: "State-of-the-art facilities producing 80-160 pallets daily across regions."
                            }
                        ].map((f, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ translateY: -5 }}
                                className="group p-8 rounded-yci border border-white/5 bg-yci-bg1/40 hover:border-yci-accent/20 transition-all"
                            >
                                <div className="w-12 h-12 rounded-xl bg-yci-accent/10 border border-yci-accent/20 flex items-center justify-center mb-6 group-hover:shadow-yciGlow transition-all">
                                    <f.icon className="w-6 h-6 text-yci-accent" />
                                </div>
                                <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight">{f.title}</h3>
                                <p className="text-yci-textMuted text-sm font-medium leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Regions / Action */}
            <section id="regions" className="py-24 bg-yci-bg0">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="rounded-[32px] bg-gradient-to-br from-yci-bg1 to-yci-bg0 border border-white/5 p-12 lg:p-20 relative overflow-hidden text-center">
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-white mb-6 uppercase">
                                Ready to Upgrade Your Ice Supply?
                            </h2>
                            <p className="text-lg text-yci-textMuted mb-10 font-medium">
                                Join the network of 500+ businesses across Louisiana and Texas who trust Your Choice Ice for their daily operations.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <YCIButton variant="primary" className="h-14 px-10 w-full sm:w-auto" onClick={() => navigate("/login")}>
                                    Get Started Today
                                </YCIButton>
                                <a href="tel:3373002072" className="flex items-center gap-3 px-6 py-4 rounded-xl border border-white/5 bg-white/5 text-sm font-black text-white hover:bg-white/10 transition">
                                    <Phone className="w-4 h-4 text-yci-accent" /> (337) 300-2072
                                </a>
                            </div>
                        </div>

                        {/* Background Map Effect Placeholder */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <MapPin className="absolute top-1/4 left-1/4 w-12 h-12 text-yci-accent" />
                            <MapPin className="absolute bottom-1/3 right-1/4 w-8 h-8 text-yci-accent" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="py-12 border-t border-white/5 bg-yci-bg0">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-yci-bg1 border border-white/10 flex items-center justify-center">
                            <div className="w-4 h-4 bg-yci-accent rounded-sm shadow-yciGlow" />
                        </div>
                        <div className="font-black text-sm tracking-tighter text-white">YOUR CHOICE ICE</div>
                    </div>

                    <div className="text-[10px] font-black uppercase tracking-widest text-yci-textMuted">
                        © 2025 YOUR CHOICE ICE. ALL RIGHTS RESERVED.
                    </div>

                    <div className="flex gap-6">
                        <YCIButton variant="ghost" className="text-[10px] font-black tracking-widest uppercase h-8 px-0 hover:text-yci-accent" onClick={() => window.location.href = "/admin/"}>Admin Portal</YCIButton>
                        <YCIButton variant="ghost" className="text-[10px] font-black tracking-widest uppercase h-8 px-0 hover:text-yci-accent" onClick={() => window.location.href = "/staff/"}>Staff Login</YCIButton>
                    </div>
                </div>
            </footer>
            {/* Demo Modal */}
            <AnimatePresence>
                {showDemoModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-yci-bg0/90 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-4xl bg-yci-card border border-white/10 rounded-[32px] overflow-hidden relative shadow-yciGlowStrong"
                        >
                            <button
                                onClick={() => setShowDemoModal(false)}
                                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition z-10"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>

                            <div className="p-12 text-center">
                                <div className="w-20 h-20 rounded-2xl bg-yci-accent/10 border border-yci-accent/20 flex items-center justify-center mx-auto mb-8 shadow-yciGlow">
                                    <Play className="w-10 h-10 text-yci-accent fill-yci-accent" />
                                </div>
                                <h2 className="text-4xl font-black tracking-tighter text-white mb-4 uppercase">Demo Video Coming Soon</h2>
                                <p className="text-yci-textMuted max-w-xl mx-auto mb-10 font-medium">
                                    We are preparing a high-fidelity showcase of our AI-powered fleet management and production monitoring systems.
                                </p>
                                <YCIButton variant="primary" className="h-14 px-10" onClick={() => setShowDemoModal(false)}>
                                    Got it, thanks!
                                </YCIButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
