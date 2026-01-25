import { useState, useEffect } from "react";
import { YCICard, YCIButton, YCIInput } from "./components/yci/ui";
import { login, getRoutes, submitDelivery, getDistributionCenters } from "./lib/api";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [view, setView] = useState("login"); // login, routes, stop
  const [routes, setRoutes] = useState<any[]>([]);
  const [activeStop, setActiveStop] = useState<any>(null);

  const [dcs, setDcs] = useState<any[]>([]);
  const [activeDC, setActiveDC] = useState<any>(null);

  // Login State
  const [email, setEmail] = useState("driver1@yci.local");
  const [password, setPassword] = useState("password");

  // Delivery Form State
  const [dForm, setDForm] = useState({
    delivered_20lb_qty: 0,
    delivered_8lb_qty: 0,
    payment: "cash",
    amount_cents: 0,
  });

  useEffect(() => {
    if (token) {
      loadDCs();
    }
  }, [token]);

  useEffect(() => {
    if (activeDC && token) {
      setView("routes");
      refreshRoutes();
    }
  }, [activeDC]);

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
              <YCIButton key={dc.id} variant="secondary" onClick={() => setActiveDC(dc)}>
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
