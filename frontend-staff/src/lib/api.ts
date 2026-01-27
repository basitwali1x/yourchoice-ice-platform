export const API_URL = import.meta.env.VITE_API_URL || "";

export async function login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    });
    if (!res.ok) throw new Error("Login failed");
    return res.json();
}

export async function getDistributionCenters(token: string) {
    const res = await fetch(`${API_URL}/distribution-centers/`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
}

export async function getRoutes(token: string, dc_id?: string) {
    let url = `${API_URL}/routes/`;
    if (dc_id) {
        url += `?dc_id=${dc_id}`;
    }
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
}

export async function submitDelivery(token: string, stopId: string, data: any) {
    const res = await fetch(`${API_URL}/routes/${stopId}/delivery`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to submit delivery");
    return res.json();
}

export async function submitDriverDelivery(token: string, data: any) {
    const res = await fetch(`${API_URL}/driver/delivery`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to submit delivery");
    return res.json();
}

export async function getCustomers(token: string, dc_id?: string) {
    let url = `${API_URL}/customers/`;
    if (dc_id) {
        url += `?dc_id=${dc_id}`;
    }
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
}
