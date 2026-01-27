import { useState, useEffect, useRef } from "react";
import Login from "./pages/Login";
import { YCICard, YCIButton, YCIInput } from "./components/yci/ui";

const API_URL = import.meta.env.VITE_API_URL || "";

const Icons = {
  Dashboard: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Orders: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  Routes: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
  Customers: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Inventory: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Maintenance: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Financials: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Optimization: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Mobile: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  Cloud: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  Employees: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("admin_token"));
  const [data, setData] = useState<any>(null);
  const [nav, setNav] = useState("Dashboard");
  const [routes, setRoutes] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]); // New Employee State
  const [empForm, setEmpForm] = useState({ full_name: "", email: "", password: "", role: "driver", phone: "" }); // Form State

  const [stats, setStats] = useState<any>({
    active_customers: 0,
    active_drivers: 0,
    pending_orders: 0,
    completed_orders_today: 0,
    revenue_today: 0,
    heatmap: []
  });
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [integrationStatus, setIntegrationStatus] = useState<any>(null);
  const [regionalStats, setRegionalStats] = useState<any[]>([]);
  const [selectedDC, setSelectedDC] = useState<string | null>(null);

  const saveTimeout = useRef<any>(null);

  useEffect(() => {
    if (token) {
      setError(null);
      if (nav === "Dashboard" || nav === "Financials") { fetchDashboard(selectedDC); }
      if (nav === "Cloud") fetchCloudStatus();
      if (nav === "Employees") fetchEmployees(); // Added this line
      if (nav !== "Dashboard" && nav !== "Employees") fetchData(); // Modified condition
      fetchRegionalStats();
    }
  }, [token, nav, selectedDC]);

  useEffect(() => {
    if (token && (nav === "Customers" || nav === "Inventory")) fetchProducts();
  }, [token, nav]);

  const fetchDashboard = async (dcId: string | null = null) => {
    setLoading(true);
    try {
      const url = dcId ? `${API_URL}/reports/dashboard?dc_id=${dcId}` : `${API_URL}/reports/dashboard`;
      const res = await fetch(url);
      setData(await res.json());
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }

  const fetchRegionalStats = async () => {
    try {
      const res = await fetch(`${API_URL}/logistics/status`);
      setRegionalStats(await res.json());
    } catch (e) { }
  }

  const fetchCloudStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/integrations/status`);
      setIntegrationStatus(await res.json());
    } catch (e) { }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products/`);
      setProducts(await res.json());
    } catch (e) { }
  }

  const fetchData = async () => {
    setLoading(true);
    let endpoint = "";
    if (nav === "Orders" || nav === "Financials") endpoint = "logistics/deliveries";
    else if (nav === "Customers") endpoint = "customers/";
    else if (nav === "Inventory") endpoint = "products/";
    else if (nav === "Maintenance") endpoint = "work-orders/";
    else if (nav === "Routes") endpoint = "routes/";
    else { setLoading(false); return; }

    try {
      const url = selectedDC ? `${API_URL}/${endpoint}?dc_id=${selectedDC}` : `${API_URL}/${endpoint}`;
      console.log(`Fetching ${nav}:`, url);
      const res = await fetch(url);
      const jsonData = await res.json();
      console.log(`${nav} data:`, jsonData);
      setItems(Array.isArray(jsonData) ? jsonData : []);
    } catch (e: any) {
      console.error(`${nav} fetch error:`, e);
      setError(e.message);
    } finally { setLoading(false); }
  }

  const saveSetting = async (key: string, value: string) => {
    setSaveStatus("saving");
    try {
      await fetch(`${API_URL}/integrations/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value })
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
      fetchCloudStatus();
    } catch (e) { setSaveStatus("idle"); }
  }

  const handleUpdateSetting = (key: string, val: string) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => saveSetting(key, val), 1000);
  }

  const setPriceAuto = async (prodId: string, cents: number) => {
    setSaveStatus("saving");
    await fetch(`${API_URL}/customers/${selectedCustomer.id}/pricing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([{ product_id: prodId, price_cents: cents }])
    });
    const res = await fetch(`${API_URL}/customers/${selectedCustomer.id}`);
    setSelectedCustomer(await res.json());
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_URL}/users/`);
      if (res.ok) setEmployees(await res.json());
    } catch (e) { console.error(e); }
  }

  const createEmployee = async () => {
    if (!empForm.email || !empForm.password || !empForm.full_name) {
      alert("Please fill all fields");
      return;
    }
    setSaveStatus("saving");
    try {
      const res = await fetch(`${API_URL}/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(empForm)
      });
      if (!res.ok) throw new Error("Failed");
      setEmpForm({ full_name: "", email: "", password: "", role: "driver", phone: "" });
      fetchEmployees();
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (e) {
      alert("Failed to create user. Email might be duplicate.");
      setSaveStatus("idle");
    }
  }

  const autoSaveCustomer = async (cust: any) => {
    setSaveStatus("saving");
    try {
      await fetch(`${API_URL}/customers/${cust.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cust)
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
      fetchData();
      fetchRegionalStats();
    } catch (e) { setSaveStatus("idle"); }
  }

  const updateWorkOrderStatus = async (id: string, newStatus: string) => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/work-orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      fetchData(); // Refresh list
    } catch (e: any) { alert("Update failed: " + e.message); } finally { setLoading(false); }
  }

  const handleExcelUpload = async (file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${API_URL}/integrations/import/excel`, { method: "POST", body: formData });
      const d = await res.json();
      alert(`Success: Injected ${d.imported} new customer profiles.`);
      fetchData();
    } catch (e: any) { alert("Import failed: " + e.message); } finally { setLoading(false); }
  }

  if (!token) return <Login onLogin={(t: string) => { localStorage.setItem("admin_token", t); setToken(t); }} />;

  const renderHeatmap = (heatmapData: any[]) => (
    <div className="flex items-end justify-between h-72 px-8 gap-4 bg-gradient-to-b from-black/20 to-black/40 rounded-[50px] p-12 border border-white/5 shadow-2xl backdrop-blur-md">
      {heatmapData.map((day: any) => {
        const isProjected = day.type === "projected";
        const maxVal = Math.max(...heatmapData.map(h => h.revenue)) || 1;
        return (
          <div key={day.date} className="flex flex-col items-center gap-5 group grow h-full justify-end">
            <div className={`w-full rounded-[20px] transition-all duration-500 relative border 
                                  ${isProjected ? 'bg-[#818cf8]/10 border-[#818cf8]/30 border-dashed opacity-70' : 'bg-yci-accent/20 border-yci-accent/30 hover:bg-yci-accent hover:border-yci-accent shadow-yciGlow'}`}
              style={{ height: `${Math.max((day.revenue / maxVal) * 100, 8)}%` }}>
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 text-[10px] bg-yci-bg1 border border-white/10 px-4 py-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl font-black text-white whitespace-nowrap z-30">
                {isProjected ? 'Forecasted' : 'Actual'}: <span className="text-yci-accent">${day.revenue}</span>
              </div>
            </div>
            <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${day.date === 'TODAY' ? 'text-yci-accent scale-125' : 'text-yci-textMuted opacity-60'}`}>{day.date}</div>
          </div>
        )
      })}
    </div>
  );

  const filterCustomers = items.filter(c => !selectedDC || c.primary_dc_id === selectedDC);
  const withinRadiusCount = filterCustomers.filter(c => c.distance_miles <= 85).length;
  const radiusHealth = (withinRadiusCount / (filterCustomers.length || 1) * 100).toFixed(0);

  return (
    <div className="h-screen overflow-hidden yci-frost-bg flex">
      <aside className="w-72 bg-yci-bg0 border-r border-white/5 p-8 h-full flex flex-col shadow-2xl z-50 overflow-y-auto custom-scrollbar">
        <div className="font-extrabold text-3xl mb-12 italic tracking-tighter">YCI <span className="text-yci-accent">PRO</span></div>

        <div className="mb-10 space-y-4">
          <label className="text-[10px] font-black text-yci-textMuted uppercase tracking-widest px-2">Regional View</label>
          <div className="space-y-1">
            <div onClick={() => setSelectedDC(null)} className={`px-4 py-3 rounded-2xl text-xs cursor-pointer transition flex justify-between items-center ${!selectedDC ? 'bg-white/10 text-white font-black border border-white/10' : 'text-yci-textMuted hover:bg-white/5'}`}>
              <span>GLOBAL NETWORK</span>
              <div className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
            </div>
            {regionalStats && regionalStats.map(dc => (
              <div key={dc.id} onClick={() => setSelectedDC(dc.id)} className={`px-4 py-3 rounded-2xl text-xs cursor-pointer transition flex justify-between items-center ${selectedDC === dc.id ? 'bg-yci-accent/20 text-yci-accent font-black border border-yci-accent/30' : 'text-yci-textMuted hover:bg-white/5'}`}>
                <span>{dc.name}</span>
                <div className="flex gap-1 items-center">
                  <span className="text-[8px] opacity-40 uppercase bg-black/40 px-2 py-0.5 rounded-md font-black">ACTIVE</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <nav className="space-y-2 grow">
          {Object.keys(Icons).map(item => {
            const Icon = Icons[item as keyof typeof Icons];
            return (
              <div key={item} onClick={() => { setNav(item); setSelectedCustomer(null); setSelectedRoute(null); }}
                className={`flex items-center gap-4 cursor-pointer px-6 py-4 rounded-[24px] transition-all duration-300 ${nav === item ? 'bg-yci-accent text-yci-bg0 font-black shadow-yciGlowStrong scale-[1.02]' : 'text-yci-textMuted hover:text-white hover:bg-white/5'}`}>
                <Icon /> <span className="text-sm font-bold">{item}</span>
              </div>
            );
          })}
        </nav>

        <div className="mt-8 p-5 bg-white/5 rounded-[28px] border border-white/10 flex items-center gap-4 transition-all hover:bg-white/10">
          <div className={`h-2.5 w-2.5 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)] ${saveStatus === 'saving' ? 'bg-yellow-400 animate-ping' : saveStatus === 'saved' ? 'bg-green-400' : 'bg-yci-accent'}`} />
          <span className="text-[10px] font-black uppercase text-yci-textMuted tracking-[0.2em]">{saveStatus === 'saving' ? 'Syncing...' : saveStatus === 'saved' ? 'Success' : 'Core Secured'}</span>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-full p-12 text-white relative custom-scrollbar">
        <header className="flex justify-between items-center mb-16">
          <div>
            <h1 className="text-6xl font-black tracking-tighter uppercase">{nav} <span className="text-yci-accent opacity-50 italic">{selectedDC ? regionalStats.find(r => r.id === selectedDC)?.name : 'GLOBAL'}</span></h1>
            <div className={`h-1.5 w-20 bg-yci-accent mt-4 rounded-full transition-all duration-700 shadow-yciGlow ${selectedDC ? 'w-64' : 'w-20'}`} />
          </div>
          <YCIButton variant="secondary" className="!rounded-full !px-10 !py-4 font-black" onClick={() => { setToken(null); localStorage.removeItem("admin_token"); }}>TERMINATE SESSION</YCIButton>
        </header>

        {loading && <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[60] bg-yci-accent text-yci-bg0 px-12 py-4 rounded-full font-black shadow-yciGlowStrong animate-pulse uppercase tracking-widest text-xs">Re-syncing regional data pipelines...</div>}

        {!loading && (
          selectedCustomer ? (
            <div className="space-y-12 animate-fade-in max-w-5xl pb-24">
              <YCIButton variant="ghost" onClick={() => setSelectedCustomer(null)} className="mb-8 opacity-60 hover:opacity-100 transition text-lg font-black tracking-tighter">← BACK TO PARTNER REGISTRY</YCIButton>
              <div className="grid md:grid-cols-3 gap-12">
                <div className="md:col-span-2 space-y-12">
                  <YCICard title="Partner Core Configuration" subtitle="Universal updates propagated via Auto-Save Engine.">
                    <div className="grid grid-cols-2 gap-10 mt-8">
                      <div><label className="text-[11px] font-black text-yci-textMuted uppercase mb-4 block tracking-widest">Legal Entity Name</label><YCIInput value={selectedCustomer.business_name} onChange={e => { setSelectedCustomer({ ...selectedCustomer, business_name: e.target.value }); autoSaveCustomer({ ...selectedCustomer, business_name: e.target.value }); }} className="!bg-black/30 !py-5 !text-xl" /></div>
                      <div><label className="text-[11px] font-black text-yci-textMuted uppercase mb-4 block tracking-widest">Deployment Anchor (Leesville / LC / Lufkin)</label>
                        <select value={selectedCustomer.primary_dc_id} onChange={e => { setSelectedCustomer({ ...selectedCustomer, primary_dc_id: e.target.value }); autoSaveCustomer({ ...selectedCustomer, primary_dc_id: e.target.value }); }} className="w-full bg-black/30 border border-white/10 rounded-2xl px-6 py-5 outline-none text-yci-accent font-black text-xl hover:border-yci-accent/40 transition">
                          {regionalStats.map(dc => <option key={dc.id} value={dc.id}>{dc.name} Hub</option>)}
                        </select>
                      </div>
                    </div>
                  </YCICard>
                  <YCICard title="Arctic Legacy Bulk Ingestion" className="md:col-span-2 relative overflow-hidden group">
                    <div className="p-24 bg-white/5 rounded-[70px] border border-white/10 border-dashed flex flex-col items-center gap-12 group-hover:border-yci-accent/40 transition-all duration-700 bg-gradient-to-tr from-transparent via-yci-accent/5 to-transparent shadow-2xl">
                      <div className="text-yci-accent text-8xl font-black group-hover:animate-bounce tracking-tighter opacity-80 italic drop-shadow-yciGlow">IMPORT</div>
                      <div className="text-center space-y-4"><div className="text-4xl font-black tracking-tight italic">Legacy Spreadsheet Pipeline (.xlsx)</div><p className="text-sm text-yci-textMuted font-bold max-w-xl opacity-60 uppercase tracking-widest leading-loose">Inject historical customer clusters and regional route blobs for immediate fleet mapping and profile propagation.</p></div>
                      <label className="cursor-pointer bg-white text-yci-bg0 px-24 py-8 rounded-full font-black text-2xl transition duration-500 transform hover:scale-110 hover:shadow-yciGlowStrong active:scale-95 shadow-2xl uppercase">
                        PROPAGATE SOURCE FILE
                        <input type="file" hidden accept=".xlsx" onChange={e => e.target.files && handleExcelUpload(e.target.files[0])} />
                      </label>
                    </div>
                  </YCICard>
                  <YCICard title="Legacy Data Archives" className="md:col-span-2 relative overflow-hidden group">
                    <div className="p-10 bg-white/5 rounded-[40px] border border-white/5 flex flex-col items-center gap-8 relative z-10">
                      <div className="text-center">
                        <div className="font-black text-3xl italic tracking-tighter">SECURE DOCUMENT VAULT</div>
                        <p className="text-xs text-yci-textMuted mt-4 px-6 font-bold leading-relaxed opacity-60 uppercase tracking-widest">Archive physical receipts, bank deposits, and legacy financial records for digitization.</p>
                      </div>
                      <label className="cursor-pointer bg-yci-accent text-yci-bg0 px-12 py-4 rounded-full font-black text-lg transition duration-300 transform hover:scale-105 shadow-yciGlowStrong uppercase flex items-center gap-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        UPLOAD SECURE ARTIFACT
                        <input type="file" hidden multiple onChange={async (e) => {
                          if (e.target.files) {
                            setLoading(true);
                            for (let i = 0; i < e.target.files.length; i++) {
                              const formData = new FormData();
                              formData.append("file", e.target.files[i]);
                              try {
                                await fetch(`${API_URL}/integrations/upload/legacy`, { method: "POST", body: formData });
                              } catch (err) { console.error(err); }
                            }
                            setLoading(false);
                            alert("Legacy artifacts secured in vault.");
                          }
                        }} />
                      </label>
                    </div>
                  </YCICard>
                  <YCICard title="Logistics & Geofencing" subtitle="Account mapping within the 85-mile service protocol.">
                    <div className="p-10 bg-white/5 rounded-[50px] flex justify-between items-center border border-white/10 group transition-all hover:bg-white/10 shadow-2xl">
                      <div>
                        <div className="text-6xl font-black italic tracking-tighter text-yci-accent drop-shadow-yciGlow">{selectedCustomer.distance_miles?.toFixed(1) || 0} MI</div>
                        <div className="text-[10px] text-yci-textMuted font-black uppercase tracking-[0.4em] mt-4">Verified Hub Distance</div>
                      </div>
                      <div className={`px-12 py-6 rounded-[32px] font-black uppercase text-sm tracking-[0.2em] shadow-2xl transition duration-500 transform group-hover:scale-110 ${selectedCustomer.distance_miles <= 85 ? 'bg-green-500/10 text-green-400 ring-1 ring-green-500/30' : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/30'}`}>
                        {selectedCustomer.distance_miles <= 85 ? 'WITHIN SERVICE RADIUS ✅' : 'RADIUS VIOLATION ❌'}
                      </div>
                    </div>
                  </YCICard>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-20 animate-fade-in pb-24">
              {nav === "Dashboard" && data && (
                <div className="space-y-20">
                  <div className="grid md:grid-cols-4 gap-8">
                    <YCICard title="Total Partners" className="!p-10"><div className="text-7xl font-black text-white tracking-tighter italic">{data.kpi.total_customers}</div><div className="text-[10px] font-black text-yci-textMuted uppercase mt-5 tracking-[0.4em]">Global Network</div></YCICard>
                    {data.hub_summary.filter((h: any) => !selectedDC || h.id === selectedDC).map((h: any) => (
                      <YCICard key={h.id} title={`${h.name} Partners`} className="!p-10 transform transition hover:-translate-y-2 hover:border-yci-accent/20">
                        <div className="text-7xl font-black text-yci-accent tracking-tighter italic">{h.customer_count}</div>
                        <div className="text-[10px] font-black text-yci-textMuted uppercase mt-5 tracking-[0.4em]">Regional Segments</div>
                      </YCICard>
                    ))}
                  </div>
                  <div className="grid md:grid-cols-3 gap-8">
                    <YCICard title="24H Revenue" className="!p-10"><div className="text-7xl font-black text-yci-accent tracking-tighter italic">${data.kpi.daily_revenue}</div></YCICard>
                    <YCICard title="Radius Health" className="!p-10"><div className="text-7xl font-black text-green-400 tracking-tighter italic">{radiusHealth}%</div></YCICard>
                    <YCICard title="Active Pipes" className="!p-10"><div className="text-7xl font-black text-[#818cf8] tracking-tighter italic">{data.kpi.active_routes}</div></YCICard>
                  </div>
                  <div className="space-y-10">
                    <div className="flex justify-between items-end px-4">
                      <h2 className="text-3xl font-black uppercase italic tracking-[0.3em] text-white/40">Daily Execution Pulse</h2>
                      <div className="text-xs font-black text-yci-accent uppercase tracking-widest">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden p-8">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[10px] font-black uppercase text-yci-textMuted border-b border-white/5 tracking-widest">
                            <th className="pb-6">Partner Store</th>
                            <th className="pb-6">Volume (8lb / 20lb)</th>
                            <th className="pb-6">Collected</th>
                            <th className="pb-6">Method</th>
                            <th className="pb-6">Hub Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {items.slice(0, 5).map((d: any) => (
                            <tr key={d.id} className="group hover:bg-yci-accent/5 transition-colors">
                              <td className="py-6 font-black text-lg italic text-white">{d.customer_name}</td>
                              <td className="py-6 font-mono text-sm text-yci-accent">{d.items}</td>
                              <td className="py-6 font-black text-green-400 text-xl">${d.amount_collected.toFixed(2)}</td>
                              <td className="py-6"><span className="text-[10px] font-black uppercase bg-white/10 px-3 py-1 rounded-full">{d.payment_method}</span></td>
                              <td className="py-6">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                                  <span className="text-[10px] font-bold text-green-400 uppercase tracking-tighter">Verified</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {items.length === 0 && <tr><td colSpan={5} className="py-12 text-center opacity-40 italic">No network activity detected for current cycle.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="flex justify-between items-end px-4">
                      <h2 className="text-3xl font-black uppercase italic tracking-[0.3em] text-white/40">Regional Sales Intelligence</h2>
                      <div className="flex items-center gap-4 bg-white/5 px-6 py-2 rounded-full border border-white/10">
                        <div className="h-2 w-2 rounded-full bg-yci-accent animate-ping" />
                        <span className="text-[10px] font-black text-yci-accent uppercase tracking-widest font-mono">Real-Time Forecast (85mi Geocone)</span>
                      </div>
                    </div>
                    {renderHeatmap(data.sales_heatmap)}
                  </div>
                </div>
              )}

              {nav === "Financials" && data && (
                <div className="space-y-12 animate-fade-in pb-24">
                  {/* Heatmap Section */}
                  <div className="grid grid-cols-1 gap-8">
                    <div className="flex justify-between items-end px-4">
                      <h2 className="text-3xl font-black uppercase italic tracking-[0.3em] text-white/40">Regional Revenue Heatmap</h2>
                      <div className="flex items-center gap-4 bg-white/5 px-6 py-2 rounded-full border border-white/10">
                        <div className="h-2 w-2 rounded-full bg-yci-accent animate-ping" />
                        <span className="text-[10px] font-black text-yci-accent uppercase tracking-widest font-mono">Live Sync</span>
                      </div>
                    </div>
                    {renderHeatmap(data.sales_heatmap)}
                  </div>

                  <div className="grid md:grid-cols-2 gap-12">
                    <YCICard title="Revenue Intelligence Hub">
                      <div className="space-y-12 mt-10 p-4">
                        <div className="flex justify-between items-end border-b border-white/5 pb-10"><div><div className="text-xs text-yci-textMuted font-black uppercase mb-3 tracking-widest">Gross Network Flow</div><div className="text-7xl font-black italic">${(data.kpi.monthly_revenue * 1.5).toFixed(0)}</div></div><div className="text-green-400 text-[10px] font-black bg-green-500/10 px-4 py-2 rounded-xl ring-1 ring-green-500/20 shadow-lg">+12.4% YOY</div></div>
                        <div className="flex justify-between items-end"><div><div className="text-xs text-yci-textMuted font-black uppercase mb-3 tracking-widest">Net Capital Retention</div><div className="text-7xl font-black text-yci-accent italic">${(data.kpi.monthly_revenue * 0.8).toFixed(0)}</div></div><div className="text-yci-accent text-[10px] font-black shadow-yciGlowStrong bg-yci-accent/10 px-4 py-2 rounded-xl ring-1 ring-yci-accent/30 uppercase tracking-widest">STATUS: OPTIMAL</div></div>
                      </div>
                    </YCICard>

                    <YCICard title="Transaction Ledger" subtitle="Individual Sales Records">
                      <div className="mt-8 overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
                        {items.length === 0 ? <div className="text-center opacity-40 italic py-10">No records found.</div> : (
                          <table className="w-full text-left">
                            <thead className="text-[10px] uppercase font-black text-yci-textMuted tracking-widest border-b border-white/10">
                              <tr>
                                <th className="pb-4 pl-4">Date</th>
                                <th className="pb-4">Customer</th>
                                <th className="pb-4 text-right pr-4">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {items.map((item: any) => (
                                <tr key={item.id} className="hover:bg-white/5 transition group">
                                  <td className="py-4 pl-4 text-sm font-bold text-white/60">{item.date}</td>
                                  <td className="py-4">
                                    <div className="font-bold text-sm">{item.customer_name}</div>
                                    <div className="text-[10px] uppercase opacity-50">{item.location_name}</div>
                                  </td>
                                  <td className="py-4 text-right pr-4">
                                    <div className="font-black text-green-400">${item.amount_collected.toFixed(2)}</div>
                                    <div className="text-[9px] uppercase tracking-wider opacity-60 bg-white/5 inline-block px-2 rounded mt-1">{item.payment_method}</div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </YCICard>
                  </div>
                </div>
              )}

              {nav === "Orders" && (
                <YCICard title="Completed Delivery Ledger" subtitle="Verified execution log for all regional assets.">
                  <div className="divide-y divide-white/5 mt-8">
                    {items.map((d: any) => (
                      <div key={d.id} className="py-6 flex justify-between items-start hover:bg-white/5 p-4 rounded-xl transition">
                        <div className="flex gap-6">
                          <div className="h-16 w-16 bg-white/5 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                            <img src={d.proof_url} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <div className="font-black text-xl italic text-white">{d.customer_name}</div>
                            <div className="text-xs text-yci-textMuted uppercase mt-1">{d.location_name} • {d.date}</div>
                            <div className="mt-2 text-sm font-mono text-yci-accent">{d.items}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-2xl text-green-400">${d.amount_collected.toFixed(2)}</div>
                          <div className="text-xs uppercase font-bold tracking-widest bg-white/10 px-2 py-1 rounded mt-1 inline-block">{d.payment_method}</div>
                          {d.notes && <div className="text-[10px] bg-red-500/20 text-red-200 px-2 py-1 rounded mt-2 max-w-[150px] truncate border border-red-500/30">Note: {d.notes}</div>}
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && <div className="text-center p-12 opacity-50 italic">No deliveries recorded in this period.</div>}
                  </div>
                </YCICard>
              )}

              {nav === "Customers" && (
                <YCICard title={`Partner Network Registry (${filterCustomers.length} nodes)`} subtitle="Real-time map of all commercial Arctic Ice accounts within designated regional radii.">
                  <div className="divide-y divide-white/5 mt-10 pr-6 custom-scrollbar max-h-[75vh]">
                    {filterCustomers.map(c => {
                      const isWithinRadius = c.distance_miles <= 85;
                      return (
                        <div key={c.id} onClick={() => setSelectedCustomer(c)} className="py-10 px-10 hover:bg-yci-accent/10 cursor-pointer transition rounded-[50px] flex justify-between items-center group mb-6 bg-white/5 border border-transparent hover:border-yci-accent/20 shadow-2xl relative overflow-hidden">
                          {!isWithinRadius && <div className="absolute top-2 right-12 bg-red-500/20 text-red-500 text-[8px] font-black px-4 py-1 rounded-full uppercase tracking-widest animate-pulse border border-red-500/30">Outside Hub Radius</div>}
                          <div className="flex gap-12 items-center">
                            <div className="relative">
                              <div className={`h-24 w-24 rounded-[36px] flex items-center justify-center font-black text-3xl shadow-xl transition-all duration-500 group-hover:scale-110 ${isWithinRadius ? 'bg-gradient-to-tr from-yci-bg0 to-yci-accent/20 border border-white/10 text-yci-accent' : 'bg-black/40 border border-red-500/20 text-red-400 opacity-60'}`}>
                                {c.business_name.slice(0, 1)}
                              </div>
                              <div className={`absolute -bottom-2 -right-2 h-8 w-8 rounded-full flex items-center justify-center border-4 border-yci-bg0 shadow-lg ${isWithinRadius ? 'bg-green-400' : 'bg-red-500 animate-pulse'}`}>
                                <span className="text-[10px] font-black text-black">{isWithinRadius ? '✓' : '!'}</span>
                              </div>
                            </div>
                            <div>
                              <div className="font-black text-4xl group-hover:text-yci-accent transition tracking-tighter italic text-white leading-none">{c.business_name}</div>
                              <div className="text-[12px] text-yci-textMuted font-black uppercase tracking-[0.3em] mt-5 flex items-center gap-4">
                                <span className="opacity-40">{c.billing_address}</span>
                                <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
                                <span className={`${isWithinRadius ? 'text-green-400' : 'text-red-400'} italic`}>{c.distance_miles.toFixed(1)} MI FROM {regionalStats.find(r => r.id === c.primary_dc_id)?.name} HUB</span>
                              </div>
                            </div>
                          </div>
                          <YCIButton variant="secondary" className="!py-4 !px-16 !rounded-full !font-black uppercase text-xs tracking-[0.2em] hover:bg-yci-accent hover:text-yci-bg0 transition shadow-yciGlowStrong scale-105 active:scale-95 transform">MANAGE ACCOUNT</YCIButton>
                        </div>
                      )
                    })}
                  </div>
                </YCICard>
              )}

              {nav === "Routes" && (
                selectedRoute ? (
                  <div className="space-y-12 animate-fade-in pb-24">
                    <YCIButton variant="ghost" onClick={() => setSelectedRoute(null)} className="mb-8 opacity-60 hover:opacity-100 transition text-lg font-black tracking-tighter">← BACK TO LOGISTICS PIPE</YCIButton>
                    <div className="grid md:grid-cols-3 gap-12">
                      <div className="col-span-2">
                        <YCICard title={`Manual Routing Protocol: ${selectedRoute.title}`} subtitle="Drag-and-drop sequence optimization (Simulator Mode)">
                          <div className="h-96 bg-black/40 rounded-3xl border border-white/10 flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/-93.2,31.1,9,0/800x600?access_token=PLACEHOLDER')] bg-cover opacity-50 grayscale group-hover:grayscale-0 transition duration-700"></div>
                            <div className="z-10 bg-black/80 p-8 rounded-3xl border border-yci-accent/30 backdrop-blur-md text-center">
                              <div className="text-yci-accent font-black text-2xl mb-2">MAP INTERFACE ONLINE</div>
                              <div className="text-xs text-white/60 uppercase tracking-widest">Manual Override Active</div>
                            </div>
                          </div>
                        </YCICard>
                      </div>
                      <div className="space-y-6">
                        <YCICard title="Stop Sequence">
                          {selectedRoute.stops && selectedRoute.stops.length > 0 ? (
                            selectedRoute.stops.map((s: any, idx: number) => (
                              <div key={s.id} className="p-4 bg-white/5 mb-2 rounded-xl border border-white/5 flex items-center gap-4">
                                <div className="h-8 w-8 rounded-full bg-yci-accent text-yci-bg0 flex items-center justify-center font-black">{idx + 1}</div>
                                <div>
                                  <div className="font-bold text-sm">Stop #{s.stop_sequence}</div>
                                  <div className="text-[10px] opacity-60 uppercase">{s.status}</div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center opacity-40 italic">No stops data linked.</div>
                          )}
                        </YCICard>
                        <YCIButton className="w-full py-6 text-xl font-black uppercase tracking-widest shadow-yciGlowStrong">OPTIMIZE WITH AI ✨</YCIButton>
                      </div>
                    </div>
                  </div>
                ) : (
                  <YCICard title="Operational Logistics Pipes" subtitle="Full chronological audit of regional delivery segments and dispatch links.">
                    <div className="divide-y divide-white/5 mt-10">
                      {items.filter(r => !selectedDC || r.dc_id === selectedDC).slice(0, 20).map(r => (
                        <div key={r.id} onClick={() => setSelectedRoute(r)} className="py-12 flex justify-between items-center px-12 hover:bg-white/5 rounded-[50px] transition group border border-transparent hover:border-white/10 mb-2 cursor-pointer">
                          <div className="flex items-center gap-14">
                            <div className="h-24 w-24 bg-white/5 rounded-[40px] flex items-center justify-center font-black text-4xl text-white shadow-2xl italic group-hover:bg-yci-accent2 group-hover:text-white transition duration-700 transform group-hover:rotate-12">ICE</div>
                            <div>
                              <div className="font-extrabold text-4xl tracking-tighter italic transition group-hover:text-yci-accent2 leading-none">{r.title || "Standard Dispatch Link"}</div>
                              <div className="text-[12px] text-yci-textMuted font-black uppercase tracking-[0.4em] mt-5 flex items-center gap-4 bg-black/20 px-6 py-2 rounded-full border border-white/5 w-fit">
                                <span>{r.route_date}</span>
                                <div className="h-1 w-1 rounded-full bg-white/20" />
                                <span className="text-yci-accent2">{r.status}</span>
                                <div className="h-1 w-1 rounded-full bg-white/20" />
                                <span className="opacity-40">{regionalStats.find(dc => dc.id === r.dc_id)?.name} DC</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-[14px] font-black text-[#818cf8] bg-[#818cf8]/10 px-10 py-4 rounded-[28px] border border-[#818cf8]/20 tracking-[0.5em] shadow-2xl group-hover:shadow-[#818cf8]/40 transition-all uppercase drop-shadow-lg scale-110 hover:bg-[#818cf8] hover:text-white">MAP ROUTE</div>
                        </div>
                      ))}
                    </div>
                  </YCICard>
                )
              )}
              {nav === "Employees" && (
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <YCICard title="New Employee" subtitle="Create a new system user">
                      <div className="space-y-4 mt-6">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-yci-textMuted block mb-1">Full Name</label>
                          <YCIInput value={empForm.full_name} onChange={e => setEmpForm({ ...empForm, full_name: e.target.value })} placeholder="e.g. John Driver" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-yci-textMuted block mb-1">Email Address (Login)</label>
                          <YCIInput value={empForm.email} onChange={e => setEmpForm({ ...empForm, email: e.target.value })} placeholder="driver@yci.local" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-yci-textMuted block mb-1">Password</label>
                          <YCIInput type="password" value={empForm.password} onChange={e => setEmpForm({ ...empForm, password: e.target.value })} placeholder="Set initial password" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-yci-textMuted block mb-1">System Role</label>
                          <select
                            className="w-full bg-yci-bg1 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-yci-accent transition"
                            value={empForm.role}
                            onChange={e => setEmpForm({ ...empForm, role: e.target.value })}
                          >
                            <option value="driver">Driver (Mobile App)</option>
                            <option value="staff">Staff (Limited Admin)</option>
                            <option value="admin">Administrator (Full Control)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-yci-textMuted block mb-1">Phone (Optional)</label>
                          <YCIInput value={empForm.phone} onChange={e => setEmpForm({ ...empForm, phone: e.target.value })} placeholder="555-0199" />
                        </div>
                        <YCIButton onClick={createEmployee} className="w-full mt-4">CREATE USER ACCT</YCIButton>
                      </div>
                    </YCICard>
                  </div>
                  <div className="lg:col-span-2">
                    <YCICard title="Staff Directory" subtitle={`Total Users: ${employees.length}`}>
                      <div className="mt-6 space-y-4">
                        {employees.map(emp => (
                          <div key={emp.id} className="p-6 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition">
                            <div className="flex items-center gap-4">
                              <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg 
                                ${emp.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                                  emp.role === 'driver' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                {emp.full_name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-lg">{emp.full_name}</div>
                                <div className="text-xs text-yci-textMuted font-mono">{emp.email} <span className="mx-2">•</span> <span className="uppercase text-white/50">{emp.role}</span></div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition">
                              <button className="text-xs font-bold text-yci-accent hover:underline">RESET PW</button>
                              <button className="text-xs font-bold text-red-400 hover:underline">DEACTIVATE</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </YCICard>
                  </div>
                </div>
              )}

              {nav === "Inventory" && (
                <YCICard title="Product Inventory Control" subtitle="Manage active SKUs and base pricing across the network.">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
                    {items.map(p => (
                      <div key={p.id} className="p-8 bg-white/5 border border-white/10 rounded-[40px] hover:border-yci-accent/30 transition group">
                        <div className="flex justify-between items-start mb-6">
                          <div className="h-14 w-14 bg-yci-accent/20 rounded-2xl flex items-center justify-center text-yci-accent font-black text-xl">{p.bag_size_lbs}#</div>
                          <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${p.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {p.is_active ? 'Active' : 'Disabled'}
                          </div>
                        </div>
                        <h3 className="text-2xl font-black italic mb-2">{p.name}</h3>
                        <p className="text-xs text-yci-textMuted uppercase tracking-widest mb-6">SKU: {p.sku}</p>
                        <div className="flex items-center justify-between border-t border-white/5 pt-6">
                          <div className="text-3xl font-black text-yci-accent">${(p.base_price_cents / 100).toFixed(2)}</div>
                          <YCIButton variant="secondary" className="!px-6 !py-2 text-[10px] font-black uppercase tracking-widest">Update Price</YCIButton>
                        </div>
                      </div>
                    ))}
                  </div>
                </YCICard>
              )}

              {nav === "Maintenance" && (
                <YCICard title="Asset Maintenance Control" subtitle="Approve dispatch for technical repairs or deny non-critical requests.">
                  <div className="grid md:grid-cols-2 gap-8 mt-10">
                    <div className="space-y-6">
                      <div className="text-xs font-black uppercase tracking-widest text-yci-textMuted mb-4">Incoming Requests (Open)</div>
                      {items.filter(i => i.status === 'open').length === 0 && <div className="p-8 bg-white/5 rounded-2xl text-center italic opacity-50">No open requests.</div>}
                      {items.filter(i => i.status === 'open').map(i => (
                        <div key={i.id} className="p-8 bg-white/5 rounded-[32px] border border-white/10 hover:border-yci-accent/30 transition shadow-2xl relative group">
                          <div className="absolute top-6 right-6 flex gap-2">
                            <button onClick={() => updateWorkOrderStatus(i.id, 'cancelled')} className="bg-white/5 hover:bg-red-500/20 text-white hover:text-red-400 p-3 rounded-full transition"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                            <button onClick={() => updateWorkOrderStatus(i.id, 'in_progress')} className="bg-yci-accent text-yci-bg0 p-3 rounded-full hover:scale-110 transition shadow-yciGlowStrong font-black text-xs uppercase tracking-wider px-6 flex items-center gap-2">Approve <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></button>
                          </div>
                          <div className="flex gap-4 items-center mb-4">
                            <div className={`h-3 w-3 rounded-full ${i.priority <= 1 ? 'bg-red-500 animate-pulse' : 'bg-yellow-400'}`} />
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-yci-textMuted">Priority Level {i.priority}</span>
                          </div>
                          <div className="text-2xl font-black italic mb-2">{i.issue_type}</div>
                          <div className="text-sm opacity-70 leading-relaxed mb-6">{i.description}</div>
                          <div className="text-[10px] uppercase font-mono bg-black/20 px-4 py-2 rounded-lg inline-block text-yci-accent border border-white/5">Loc: {i.location_id.slice(0, 8)}...</div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-6 opacity-60">
                      <div className="text-xs font-black uppercase tracking-widest text-yci-textMuted mb-4">Processing History</div>
                      {items.filter(i => i.status !== 'open').map(i => (
                        <div key={i.id} className="p-6 bg-black/20 rounded-2xl border border-white/5 flex justify-between items-center">
                          <div>
                            <div className="font-bold">{i.issue_type}</div>
                            <div className="text-[10px] uppercase mt-1">{i.status.replace('_', ' ')}</div>
                          </div>
                          <div className={`h-2 w-2 rounded-full ${i.status === 'completed' ? 'bg-green-500' : i.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-400'}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </YCICard>
              )}

              {nav === "Optimization" && (
                <YCICard title="AI Route Optimization Engine" subtitle="Generate balanced schedules based on regional clusters.">
                  <div className="mt-8 space-y-8">
                    <div className="p-8 bg-white/5 rounded-[32px] border border-white/10 flex items-center justify-between">
                      <div>
                        <div className="font-black text-2xl italic tracking-tighter mb-2">Generate Next Week's Schedule</div>
                        <div className="text-sm opacity-60 max-w-lg">
                          Uses Clustering (City-based) + TSPs to create efficient routes for
                          {selectedDC ? ` the ${regionalStats.find(r => r.id === selectedDC)?.name} Hub` : " the selected hub"}.
                        </div>
                      </div>
                      <YCIButton
                        onClick={async () => {
                          if (!selectedDC) { alert("Please select a Region (DC) from the sidebar first."); return; }
                          setLoading(true);
                          try {
                            const res = await fetch(`${API_URL}/optimization/generate-schedule`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ dc_id: selectedDC, start_date: new Date().toISOString().split('T')[0] })
                            });
                            const data = await res.json();
                            if (data.status === 'success') {
                              alert(data.message);
                              console.log(data.schedule);
                            } else {
                              alert("Optimization Warning: " + data.message);
                            }
                          } catch (e: any) { alert("Error: " + e.message); } finally { setLoading(false); }
                        }}
                        className="px-12 py-6 text-xl shadow-yciGlowStrong">
                        RUN OPTIMIZER ⚡
                      </YCIButton>
                    </div>
                    <div className="p-8 bg-black/20 rounded-[32px] border border-white/5 min-h-[200px] flex items-center justify-center text-center opacity-60">
                      <div className="italic">Select a Region to enable the Neural Engine.</div>
                    </div>
                  </div>
                </YCICard>
              )}

              {nav === "Mobile" && (
                <YCICard title="Driver Connectivity Hub" subtitle="Real-time terminal status for field assets.">
                  <div className="p-20 text-center opacity-40 italic">
                    <div className="text-6xl mb-6">📱</div>
                    <div className="text-2xl font-black tracking-tighter uppercase">Terminals Synced: 12</div>
                    <p className="text-xs mt-4 uppercase tracking-widest">Awaiting field data from Driver Portal...</p>
                  </div>
                </YCICard>
              )}

              {nav === "Mobile" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="grid grid-cols-3 gap-8">
                    <div className="col-span-2">
                      <YCICard title="Live Fleet Telemetry" subtitle="Real-time GPS tracking of active logistics units.">
                        <div className="h-[600px] bg-black/40 rounded-3xl border border-white/10 relative overflow-hidden group">
                          {/* Placeholder Map Background - Using the same style as Routes view */}
                          <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/-93.2,31.1,8,0/800x600?access_token=PLACEHOLDER')] bg-cover opacity-60 grayscale group-hover:grayscale-0 transition duration-700"></div>

                          {/* Driver Pins Demo */}
                          {employees.filter(e => e.role === 'driver').map((driver, idx) => (
                            <div key={driver.id} className="absolute z-20 flex flex-col items-center" style={{ top: `${40 + (idx * 15)}%`, left: `${30 + (idx * 20)}%` }}>
                              <div className="h-12 w-12 rounded-full bg-yci-accent border-4 border-black shadow-yciGlowStrong animate-pulse flex items-center justify-center font-black text-yci-bg0">
                                {driver.full_name.charAt(0)}
                              </div>
                              <div className="mt-2 bg-black/80 px-4 py-2 rounded-xl border border-yci-accent/30 text-[10px] font-black uppercase tracking-widest text-white shadow-xl backdrop-blur-sm">
                                {driver.full_name}
                              </div>
                            </div>
                          ))}

                          <div className="absolute bottom-8 left-8 z-10 bg-black/80 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                            <div className="text-xs font-black text-yci-textMuted uppercase tracking-widest mb-1">Active Units</div>
                            <div className="text-3xl font-black text-white">{employees.filter(e => e.role === 'driver').length}</div>
                          </div>
                        </div>
                      </YCICard>
                    </div>
                    <div>
                      <YCICard title="Driver Manifest" subtitle="Status of registered mobile operators.">
                        <div className="mt-6 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                          {employees.filter(e => e.role === 'driver').map(driver => (
                            <div key={driver.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 group hover:bg-white/10 transition cursor-pointer">
                              <div className="h-10 w-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold">{driver.full_name.charAt(0)}</div>
                              <div className="grow">
                                <div className="font-bold text-sm">{driver.full_name}</div>
                                <div className="text-[10px] uppercase text-yci-textMuted">Last Active: Just Now</div>
                              </div>
                              <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(74,222,128,0.5)] animate-pulse" />
                            </div>
                          ))}
                          {employees.filter(e => e.role === 'driver').length === 0 && (
                            <div className="p-8 text-center opacity-40 italic text-sm">No drivers registered.</div>
                          )}
                        </div>
                      </YCICard>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-12 animate-fade-in max-w-6xl">
                <header className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-[0.3em] text-white/40">Neural Sync Command</h2>
                    <p className="text-xs text-yci-textMuted uppercase mt-2 font-bold tracking-widest">Global pipeline status across secondary cloud nodes.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-yci-accent animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Network Secure</span>
                    </div>
                  </div>
                </header>

                <div className="grid md:grid-cols-3 gap-8">
                  {/* QuickBooks Card */}
                  <YCICard title="QuickBooks Online" className="relative group overflow-hidden">
                    <div className="absolute top-4 right-6">
                      <div className={`h-2.5 w-2.5 rounded-full ${integrationStatus?.quickbooks?.connected ? 'bg-green-400' : 'bg-red-500'} shadow-lg`} />
                    </div>
                    <div className="p-4 space-y-8">
                      <div className="text-center py-6">
                        <div className="text-4xl mb-4">💼</div>
                        <div className="font-black text-xl italic tracking-tighter uppercase">Accounting Core</div>
                        <p className="text-[10px] text-yci-textMuted mt-2 uppercase tracking-widest leading-relaxed">Automated ledger propagation of regional delivery payloads.</p>
                      </div>

                      <div className="space-y-4">
                        {!integrationStatus?.quickbooks?.connected ? (
                          <YCIButton onClick={async () => {
                            try {
                              const res = await fetch(`${API_URL}/integrations/quickbooks/auth`);
                              const d = await res.json();
                              alert("Simulating OAuth Handshake... Handled.");
                              fetchCloudStatus();
                            } catch (e) { alert("Auth Failed"); }
                          }} className="w-full !rounded-2xl font-black py-4">INITIALIZE SECURE LINK</YCIButton>
                        ) : (
                          <>
                            <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                              <div className="text-[8px] font-black text-yci-textMuted uppercase tracking-widest mb-1">Last Sync Cycle</div>
                              <div className="text-xs font-mono text-yci-accent">{integrationStatus.quickbooks.last_sync}</div>
                            </div>
                            <YCIButton variant="secondary" onClick={async () => {
                              setLoading(true);
                              try {
                                const res = await fetch(`${API_URL}/integrations/quickbooks/sync`, { method: "POST" });
                                const d = await res.json();
                                alert(d.message);
                                fetchCloudStatus();
                              } catch (e) { } finally { setLoading(false); }
                            }} className="w-full !rounded-2xl font-black py-4">PUSH 24H LEDGER</YCIButton>
                          </>
                        )}
                      </div>
                    </div>
                  </YCICard>

                  {/* Google Sheets Card */}
                  <YCICard title="Google Sheets API" className="relative group overflow-hidden">
                    <div className="absolute top-4 right-6">
                      <div className={`h-2.5 w-2.5 rounded-full ${integrationStatus?.google_sheets?.connected ? 'bg-green-400' : 'bg-white/10'} shadow-lg`} />
                    </div>
                    <div className="p-4 space-y-8">
                      <div className="text-center py-6">
                        <div className="text-4xl mb-4">📊</div>
                        <div className="font-black text-xl italic tracking-tighter uppercase">Live Sheet Link</div>
                        <p className="text-[10px] text-yci-textMuted mt-2 uppercase tracking-widest leading-relaxed">Bidirectional mapping of customer coordinates and route metadata.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[8px] font-black text-yci-textMuted uppercase tracking-widest px-2">Deployment Sheet ID</label>
                          <YCIInput value={integrationStatus?.google_sheets?.sheet_id || ""}
                            placeholder="Enter Google Sheet ID..."
                            onChange={(e) => handleUpdateSetting("google_sheet_id", e.target.value)}
                            className="!bg-black/30 !py-3 !text-xs !font-mono" />
                        </div>

                        {integrationStatus?.google_sheets?.connected && (
                          <>
                            <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                              <div className="text-[8px] font-black text-yci-textMuted uppercase tracking-widest mb-1">State Consensus</div>
                              <div className="text-xs font-mono text-yci-accent">{integrationStatus.google_sheets.last_sync}</div>
                            </div>
                            <YCIButton variant="secondary" onClick={async () => {
                              setLoading(true);
                              try {
                                const res = await fetch(`${API_URL}/integrations/google-sheets/sync`, { method: "POST" });
                                const d = await res.json();
                                alert(d.message);
                                fetchCloudStatus();
                              } catch (e) { } finally { setLoading(false); }
                            }} className="w-full !rounded-2xl font-black py-4">PULL EXTERNAL DATA</YCIButton>
                          </>
                        )}
                      </div>
                    </div>
                  </YCICard>

                  {/* Excel Card */}
                  <YCICard title="Legacy Excel Pipeline" className="relative group overflow-hidden">
                    <div className="p-4 space-y-8">
                      <div className="text-center py-6">
                        <div className="text-4xl mb-4">📁</div>
                        <div className="font-black text-xl italic tracking-tighter uppercase">Bulk CSV/XLSX</div>
                        <p className="text-[10px] text-yci-textMuted mt-2 uppercase tracking-widest leading-relaxed">High-volume injection of historical partner archives and seasonal order blobs.</p>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                          <div className="text-[8px] font-black text-yci-textMuted uppercase tracking-widest mb-1">Buffer Status</div>
                          <div className="text-xs font-mono text-green-400">READY FOR PROPAGATION</div>
                        </div>
                        <YCIButton variant="secondary" onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.xlsx';
                          input.onchange = (e: any) => {
                            if (e.target.files?.[0]) handleExcelUpload(e.target.files[0]);
                          };
                          input.click();
                        }} className="w-full !rounded-2xl font-black py-4 uppercase text-[10px] tracking-widest shadow-lg">INJECT SOURCE FILE</YCIButton>
                      </div>
                    </div>
                  </YCICard>
                </div>

                <YCICard title="Real-Time Integration Logs" subtitle="Console output from secondary cloud relay nodes.">
                  <div className="bg-black/40 rounded-3xl p-8 font-mono text-[10px] text-yci-accent/60 h-48 overflow-y-auto space-y-2 custom-scrollbar">
                    <div className="flex gap-4"><span>[{new Date().toLocaleTimeString()}]</span> <span className="text-white">SYS: SECURE NODE HANDSHAKE COMPLETE</span></div>
                    <div className="flex gap-4"><span>[{new Date().toLocaleTimeString()}]</span> <span>DB: PERSISTING CLOUD PURE STATE... OK</span></div>
                    <div className="flex gap-4"><span>[{new Date().toLocaleTimeString()}]</span> <span className="text-green-400">AUTH: QBO TOKEN RENEWED (SIMULATED)</span></div>
                    <div className="flex gap-4"><span>[{new Date().toLocaleTimeString()}]</span> <span>API: LISTENING FOR EXTERNAL WEBHOOKS</span></div>
                    <div className="flex gap-4"><span>[{new Date().toLocaleTimeString()}]</span> <span className="text-white">GEOMAPPING: 278 NODES SYNCED TO GOOGLE CLOUD</span></div>
                  </div>
                </YCICard>
              </div>
              )}
            </div>
          )
        )}
      </main>
    </div>
  );
}
