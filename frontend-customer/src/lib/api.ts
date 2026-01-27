export const API_URL = import.meta.env.VITE_API_URL || "";

export async function getProducts() {
    const res = await fetch(`${API_URL}/products/`);
    return res.json();
}

export async function submitOrder(data: any) {
    const res = await fetch(`${API_URL}/orders/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Order failed");
    return res.json();
}

export async function getCustomers() {
    const res = await fetch(`${API_URL}/customers/`);
    return res.json();
}
