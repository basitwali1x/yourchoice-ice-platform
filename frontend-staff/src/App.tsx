import { useState, useEffect } from "react";
import { YCICard, YCIButton, YCIInput } from "./components/yci/ui";
import { login, getRoutes, submitDelivery, submitDriverDelivery, getDistributionCenters, getCustomers } from "./lib/api";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [view, setView] = useState("login"); // login, routes, stop, submit_delivery, payment_select, receipt
  const [routes, setRoutes] = useState<any[]>([]);
  const [activeStop, setActiveStop] = useState<any>(null);

  const [dcs, setDcs] = useState<any[]>([]);
  const [activeDC, setActiveDC] = useState<any>(null);

  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Login State
  const [email, setEmail] = useState("driver1@yci.local");
  const [password, setPassword] = useState("password");

  // Delivery Form State
  const [dForm, setDForm] = useState({
    delivered_20lb_qty: 0,
    delivered_8lb_qty: 0,
    payment: "credit",
    amount_cents: 0,
    price_20lb: 2.00, // Default based on user
    price_8lb: 1.00,
    no_tax: false,  // Tax-exempt option
    // tax_amount removed from manual input
  });

  useEffect(() => {
    if (token) {
      loadDCs();
    }
  }, [token]);

  useEffect(() => {
    if (activeDC && token) {
      // Don't auto-switch to routes, allow choice
      // setView("routes"); 
      // refreshRoutes();
      loadCustomers();
    }
  }, [activeDC]);

  const loadCustomers = async () => {
    if (!activeDC) return;
    try {
      const data = await getCustomers(token!, activeDC.id);
      setCustomers(data);
    } catch (e) { console.error(e); }
  }

  const loadDCs = async () => {
    try {
      const data = await getDistributionCenters(token!);
      setDcs(data);
      if (data.length > 0) {
        // For now, force selection unless we want to auto-select
        setView("dc_select");
      }
    } catch (e) {
      console.error("Failed to load DCs", e);
    }
  };

  const refreshRoutes = async () => {
    if (!activeDC) return;
    try {
      const data = await getRoutes(token!, activeDC.id);
      setRoutes(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = async () => {
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.access_token);
      setToken(data.access_token);
    } catch (e) {
      alert("Login failed");
    }
  };

  const handleStopClick = (stop: any) => {
    setActiveStop(stop);
    setView("stop");
  };

  const submitStop = async () => {
    if (!activeStop) return;
    try {
      await submitDelivery(token!, activeStop.id, {
        route_stop_id: activeStop.id,
        ...dForm,
        amount_cents: Number(dForm.amount_cents) * 100 // convert to cents
      });
      alert("Stop Completed!");
      setView("routes");
      setActiveStop(null);
      refreshRoutes();
    } catch (e) {
      alert("Error submitting connection (offline mode saved - logic placeholder)");
    }
  };

  const [receipt, setReceipt] = useState<any>(null);

  // Step 1: Go to payment selection
  const proceedToPayment = () => {
    if (!selectedCustomer) return;
    if (dForm.delivered_20lb_qty === 0 && dForm.delivered_8lb_qty === 0) {
      alert("Please enter at least one item quantity");
      return;
    }
    setView("payment_select");
  };

  // Step 2: Final submission with payment method
  const submitDriverForm = async () => {
    if (!selectedCustomer) return;
    try {
      const res = await submitDriverDelivery(token!, {
        customer_id: selectedCustomer.id,
        delivered_20lb_qty: dForm.delivered_20lb_qty,
        delivered_8lb_qty: dForm.delivered_8lb_qty,
        price_20lb: dForm.price_20lb,
        price_8lb: dForm.price_8lb,
        payment_method: dForm.payment,
        no_tax: dForm.no_tax
      });
      setReceipt(res.receipt);
      setView("receipt");
      setDForm({ ...dForm, delivered_20lb_qty: 0, delivered_8lb_qty: 0, no_tax: false });
      setSelectedCustomer(null);
    } catch (e) {
      console.error(e);
      alert("Submission failed. Check console for details.");
    }
  };

  /* VIEWS */
  if (view === "login") {
    return (
      <div className="min-h-screen yci-frost-bg flex items-center justify-center p-6">
        <YCICard title="Driver Login" subtitle="YCI Staff App">
          <div className="grid gap-4">
            <YCIInput placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <YCIInput type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <YCIButton onClick={handleLogin}>Log In</YCIButton>
          </div>
        </YCICard>
      </div>
    );
  }



  if (view === "dc_select") {
    return (
      <div className="min-h-screen yci-frost-bg flex items-center justify-center p-6">
        <YCICard title="Select Region" subtitle="Where are you executing today?">
          <div className="grid gap-3">
            {dcs.map(dc => (
              <YCIButton key={dc.id} variant="secondary" onClick={() => { setActiveDC(dc); setView("choice_menu"); }}>
                {dc.name} <span className="text-xs opacity-70">({dc.type})</span>
              </YCIButton>
            ))}
            <div className="mt-4 border-t border-white/10 pt-4">
              <button onClick={() => { setToken(null); localStorage.removeItem("token"); setView("login"); }} className="w-full text-center text-sm text-yci-accent">Logout</button>
            </div>
          </div>
        </YCICard>
      </div>
    );
  }

  if (view === "choice_menu") {
    return (
      <div className="min-h-screen yci-frost-bg p-6 flex items-center justify-center">
        <YCICard title="Driver Actions" subtitle={`Region: ${activeDC?.name}`}>
          <div className="grid gap-4">
            <YCIButton onClick={() => setView("submit_delivery")} className="!py-6 text-xl">🚚 New Delivery Order</YCIButton>
            <YCIButton variant="secondary" onClick={() => { setView("routes"); refreshRoutes(); }}>🗺️ View Assigned Routes</YCIButton>
            <YCIButton variant="ghost" onClick={() => setView("dc_select")}>Change Region</YCIButton>
          </div>
        </YCICard>
      </div>
    )
  }

  if (view === "receipt" && receipt) {
    return (
      <div className="min-h-screen yci-frost-bg p-6 flex flex-col items-center justify-center">
        <YCICard title="Delivery Receipt" subtitle={receipt.customer_name}>
          <div className="bg-white text-black p-6 rounded-lg font-mono text-sm space-y-2 border-2 border-dashed border-black/20">
            <div className="text-center font-bold text-lg mb-2 underline">YOUR CHOICE ICE</div>
            <div className="flex justify-between"><span>Date:</span> <span>{receipt.date}</span></div>
            <div className="border-t border-black my-2"></div>
            {receipt.items.map((item: any, i: number) => (
              <div key={i} className="flex justify-between">
                <span>{item.qty} x {item.name}</span>
                <span>${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-black my-2"></div>
            <div className="flex justify-between font-bold text-base">
              <span>{receipt.tax_exempt ? "TOTAL (TAX EXEMPT):" : "TOTAL (w/ tax):"}</span>
              <span>${receipt.total.toFixed(2)}</span>
            </div>
            {receipt.tax_exempt && (
              <div className="text-center text-xs font-bold mt-2 bg-yellow-200 p-1 rounded">
                ⚠️ TAX EXEMPT DELIVERY
              </div>
            )}
            <div className="text-center text-[10px] mt-4 italic">Payment: {receipt.payment_method.toUpperCase()}</div>
          </div>
          <div className="mt-6 grid gap-3">
            <YCIButton onClick={() => window.print()} variant="secondary">🖨️ Print Receipt</YCIButton>
            <YCIButton onClick={() => setView("choice_menu")}>Done & Back</YCIButton>
          </div>
        </YCICard>
      </div>
    );
  }

  if (view === "submit_delivery") {
    return (
      <div className="min-h-screen yci-frost-bg p-4 overflow-y-auto">
        <button onClick={() => setView("choice_menu")} className="mb-4 text-yci-accent font-bold">← Back</button>
        <YCICard title="New Delivery" subtitle="Submit order & update schedule">
          <div className="grid gap-4">
            <div>
              <label className="text-xs text-yci-textMuted uppercase mb-2 block">Select Customer</label>
              <select className="w-full p-4 rounded-xl bg-yci-bg1/60 border border-white/10 text-white outline-none"
                value={selectedCustomer?.id || ""}
                onChange={(e) => setSelectedCustomer(customers.find(c => c.id === e.target.value))}>
                <option value="">-- Choose Store --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.business_name}</option>)}
              </select>
            </div>

            {selectedCustomer && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-[10px] text-yci-textMuted uppercase">20lb Bags</label><YCIInput type="number" value={dForm.delivered_20lb_qty} onChange={e => setDForm({ ...dForm, delivered_20lb_qty: Number(e.target.value) })} /></div>
                  <div><label className="text-[10px] text-yci-textMuted uppercase">Price ($)</label><YCIInput type="number" value={dForm.price_20lb} onChange={e => setDForm({ ...dForm, price_20lb: Number(e.target.value) })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-[10px] text-yci-textMuted uppercase">8lb Bags</label><YCIInput type="number" value={dForm.delivered_8lb_qty} onChange={e => setDForm({ ...dForm, delivered_8lb_qty: Number(e.target.value) })} /></div>
                  <div><label className="text-[10px] text-yci-textMuted uppercase">Price ($)</label><YCIInput type="number" value={dForm.price_8lb} onChange={e => setDForm({ ...dForm, price_8lb: Number(e.target.value) })} /></div>
                </div>

                {/* No Tax Option */}
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                  <input
                    type="checkbox"
                    id="no-tax-checkbox"
                    checked={dForm.no_tax}
                    onChange={(e) => setDForm({ ...dForm, no_tax: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-yci-accent focus:ring-2 focus:ring-yci-accent"
                  />
                  <label htmlFor="no-tax-checkbox" className="text-sm text-white cursor-pointer select-none">
                    Tax Exempt (No Tax)
                  </label>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                  <div className="text-xs text-yci-textMuted uppercase">
                    {dForm.no_tax ? "Estimated Total (Tax Exempt)" : "Estimated Total (w/ 10.75% Tax)"}
                  </div>
                  <div className="text-2xl font-black text-green-400">
                    ${dForm.no_tax
                      ? ((dForm.delivered_20lb_qty * dForm.price_20lb) + (dForm.delivered_8lb_qty * dForm.price_8lb)).toFixed(2)
                      : (((dForm.delivered_20lb_qty * dForm.price_20lb) + (dForm.delivered_8lb_qty * dForm.price_8lb)) * 1.1075).toFixed(2)
                    }
                  </div>
                </div>
                <YCIButton onClick={proceedToPayment} className="w-full py-4 text-lg">CONTINUE TO PAYMENT</YCIButton>
              </div>
            )}
          </div>
        </YCICard>
      </div>
    );
  }

  if (view === "payment_select") {
    const subtotal = (dForm.delivered_20lb_qty * dForm.price_20lb) + (dForm.delivered_8lb_qty * dForm.price_8lb);
    const total = dForm.no_tax ? subtotal : subtotal * 1.1075;

    return (
      <div className="min-h-screen yci-frost-bg p-6 flex items-center justify-center">
        <YCICard title="Select Payment Method" subtitle={`Total: $${total.toFixed(2)}`}>
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-sm text-yci-textMuted mb-2">Order Summary:</div>
              <div className="text-white">
                <div className="flex justify-between text-sm mb-1">
                  <span>{dForm.delivered_20lb_qty} x 20lb Bags</span>
                  <span>${(dForm.delivered_20lb_qty * dForm.price_20lb).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>{dForm.delivered_8lb_qty} x 8lb Bags</span>
                  <span>${(dForm.delivered_8lb_qty * dForm.price_8lb).toFixed(2)}</span>
                </div>
                <div className="border-t border-white/10 mt-2 pt-2">
                  <div className="flex justify-between font-bold">
                    <span>{dForm.no_tax ? "Total (Tax Exempt)" : "Total (w/ Tax)"}</span>
                    <span className="text-green-400">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-yci-textMuted uppercase mb-2">Choose Payment Method:</div>

              <YCIButton
                variant={dForm.payment === "cash" ? "primary" : "secondary"}
                onClick={() => setDForm({ ...dForm, payment: "cash" })}
                className="w-full py-4 text-lg"
              >
                💵 Cash
              </YCIButton>

              <YCIButton
                variant={dForm.payment === "check" ? "primary" : "secondary"}
                onClick={() => setDForm({ ...dForm, payment: "check" })}
                className="w-full py-4 text-lg"
              >
                📝 Check
              </YCIButton>

              <YCIButton
                variant={dForm.payment === "credit" ? "primary" : "secondary"}
                onClick={() => setDForm({ ...dForm, payment: "credit" })}
                className="w-full py-4 text-lg"
              >
                💳 Charge (Credit/Debit)
              </YCIButton>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <YCIButton variant="ghost" onClick={() => setView("submit_delivery")}>
                ← Back
              </YCIButton>
              <YCIButton onClick={submitDriverForm} className="bg-green-600 hover:bg-green-700">
                ✓ Submit Order
              </YCIButton>
            </div>
          </div>
        </YCICard>
      </div>
    );
  }

  if (view === "routes") {
    return (
      <div className="min-h-screen yci-frost-bg p-4 pb-20">
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-xl font-extrabold text-yci-text">My Routes</h1>
          <button onClick={() => { setToken(null); localStorage.removeItem("token"); setView("login"); }} className="text-sm text-yci-accent">Logout</button>
        </header>

        <div className="grid gap-4">
          {routes.map(r => (
            <YCICard key={r.id} title={r.title} subtitle={r.status}>
              <div className="mt-4 grid gap-3">
                {r.stops.map((stop: any) => (
                  <div key={stop.id} onClick={() => handleStopClick(stop)}
                    className={`p-4 rounded-yci border bg-yci-bg1/40 flex justify-between items-center cursor-pointer ${stop.status === 'completed' ? 'opacity-50 border-green-500/30' : 'border-white/10'}`}>
                    <div>
                      <div className="font-bold">Stop #{stop.stop_sequence}</div>
                      <div className="text-xs text-yci-textMuted">Status: {stop.status}</div>
                    </div>
                    <YCIButton variant="ghost" className="!p-2 text-xs">View</YCIButton>
                  </div>
                ))}
              </div>
            </YCICard>
          ))}
        </div>
      </div>
    );
  }

  if (view === "stop" && activeStop) {
    return (
      <div className="min-h-screen yci-frost-bg p-4">
        <button onClick={() => setView("routes")} className="mb-4 text-yci-accent font-bold">← Back to Route</button>
        <YCICard title={`Stop #${activeStop.stop_sequence}`} subtitle="Delivery details">
          <div className="grid gap-4">
            <div>
              <label className="text-xs text-yci-textMuted">20lb Bags Delivered</label>
              <YCIInput type="number" value={dForm.delivered_20lb_qty} onChange={e => setDForm({ ...dForm, delivered_20lb_qty: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs text-yci-textMuted">8lb Bags Delivered</label>
              <YCIInput type="number" value={dForm.delivered_8lb_qty} onChange={e => setDForm({ ...dForm, delivered_8lb_qty: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs text-yci-textMuted">Payment Method</label>
              <select className="w-full p-3 rounded-[14px] bg-yci-bg1/60 border border-white/10 text-yci-text outline-none"
                value={dForm.payment} onChange={e => setDForm({ ...dForm, payment: e.target.value })}>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="credit">Credit Card</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-yci-textMuted">Amount Collected ($)</label>
              <YCIInput type="number" value={dForm.amount_cents} onChange={e => setDForm({ ...dForm, amount_cents: Number(e.target.value) })} />
            </div>
            <YCIButton onClick={submitStop}>Complete Stop</YCIButton>
          </div>
        </YCICard>
      </div>
    );
  }

  return <div>Loading...</div>;
}
