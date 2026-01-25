import { useState, useEffect } from "react";
import { YCIButton } from "../components/yci/ui";
import { getProducts, submitOrder, getCustomers } from "../lib/api";

export default function Home() {
    const [products, setProducts] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);

    // Simple Cart State
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

        const items = [];
        const p20 = products.find(p => p.sku === 'YCI-20LB');
        const p8 = products.find(p => p.sku === 'YCI-8LB');

        if (qty20 > 0 && p20) items.push({ product_id: p20.id, quantity: qty20 });
        if (qty8 > 0 && p8) items.push({ product_id: p8.id, quantity: qty8 });

        if (items.length === 0) return alert("Select at least one item.");

        try {
            await submitOrder({
                customer_id: selectedCustId,
                requested_delivery_date: deliveryDate,
                items
            });
            alert("Order Submitted Successfully!");
        } catch (e) {
            alert("Failed to submit order.");
        }
    };

    return (
        <div className="min-h-screen yci-frost-bg">
            <header className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-yci-accent/20 border border-yci-accent/30 shadow-yciGlow" />
                    <div>
                        <div className="font-extrabold tracking-tight">YCI</div>
                        <div className="text-xs text-yci-textMuted -mt-0.5">YOUR CHOICE ICE</div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <YCIButton variant="secondary">Login</YCIButton>
                    <YCIButton variant="primary">Order Ice</YCIButton>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 pb-16 grid lg:grid-cols-2 gap-10 items-center">
                <div>
                    <h1 className="text-5xl sm:text-6xl font-black leading-[0.95] tracking-tight">
                        PREMIUM ICE.
                        <br />
                        RELIABLE SERVICE.
                        <br />
                        <span className="text-yci-accent drop-shadow-[0_0_18px_rgba(155,212,228,.35)]">
                            YOUR CHOICE.
                        </span>
                    </h1>

                    <p className="mt-6 text-lg text-yci-textMuted max-w-xl">
                        Order 8lb or 20lb bags in seconds. Fast delivery, accurate counts, and clean proof-of-delivery.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-4">
                        <YCIButton variant="primary" onClick={handleOrder}>Order Ice</YCIButton>
                        <YCIButton variant="secondary">Find a Location</YCIButton>
                    </div>
                </div>

                <div className="relative">
                    <div className="rounded-yci border border-white/10 bg-yci-card/60 backdrop-blur-sm p-6 shadow-[0_18px_50px_rgba(0,0,0,.45)]">
                        <div className="text-sm text-yci-textMuted">Quick Order</div>
                        <div className="mt-2 text-2xl font-extrabold">Place your next ice order</div>

                        <div className="mt-6 grid gap-4">
                            <div className="rounded-[14px] border border-white/10 bg-yci-bg1/50 p-4">
                                <div className="text-xs text-yci-textMuted">Customer (Simulated)</div>
                                <select className="w-full bg-transparent text-white font-bold outline-none"
                                    value={selectedCustId} onChange={e => setSelectedCustId(e.target.value)}>
                                    {customers.map(c => <option key={c.id} value={c.id} className="text-black">{c.business_name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-[14px] border border-white/10 bg-yci-bg1/50 p-4">
                                    <div className="text-xs text-yci-textMuted">20lb Qty</div>
                                    <input type="number" className="bg-transparent w-full font-bold outline-none text-white"
                                        value={qty20} onChange={e => setQty20(Number(e.target.value))} />
                                </div>
                                <div className="rounded-[14px] border border-white/10 bg-yci-bg1/50 p-4">
                                    <div className="text-xs text-yci-textMuted">8lb Qty</div>
                                    <input type="number" className="bg-transparent w-full font-bold outline-none text-white"
                                        value={qty8} onChange={e => setQty8(Number(e.target.value))} />
                                </div>
                            </div>
                            <div className="rounded-[14px] border border-white/10 bg-yci-bg1/50 p-4">
                                <div className="text-xs text-yci-textMuted">Delivery Date</div>
                                <input type="date" className="bg-transparent w-full font-bold outline-none text-white"
                                    value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
                            </div>

                            <button onClick={handleOrder} className="rounded-[14px] px-4 py-3 font-extrabold bg-yci-accent text-[#0d1418] shadow-yciGlow hover:shadow-yciGlowStrong transition">
                                Confirm Order
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
