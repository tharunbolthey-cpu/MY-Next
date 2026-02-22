"use client";

import { useState, useEffect } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", price: "", category: "", stock: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const bgWhite = "#FFFFFF";
  const textBlack = "#000000";

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `{ products { id name price category stock } }` }),
      });
      const data = await res.json();
      setProducts(data.data.products);
    } catch {
      setMessage("❌ Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const showMsg = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, price, category, stock } = form;
    const query = editId
      ? `mutation { updateProduct(id: "${editId}", name: "${name}", price: ${price}, category: "${category}", stock: ${stock}) { id name } }`
      : `mutation { addProduct(name: "${name}", price: ${price}, category: "${category}", stock: ${stock}) { id name } }`;

    try {
      await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      showMsg(editId ? "✅ Updated" : "✅ Added");
      setForm({ name: "", price: "", category: "", stock: "" });
      setEditId(null);
      fetchProducts();
    } catch {
      showMsg("❌ Error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `mutation { deleteProduct(id: "${id}") { id } }` }),
      });
      showMsg("🗑️ Deleted");
      fetchProducts();
    } catch {
      showMsg("❌ Error");
    }
  };

  // Sell product: reduce stock by 1
  const handleSell = async (product: Product) => {
    if (product.stock <= 0) {
      showMsg("❌ Out of stock");
      return;
    }

    try {
      const query = `mutation { updateProduct(id: "${product.id}", stock: ${product.stock - 1}) { id stock } }`;
      await fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      showMsg(`✅ Sold 1 unit of ${product.name}`);
      fetchProducts();
    } catch {
      showMsg("❌ Error selling product");
    }
  };

  return (
    <div
      style={{
        backgroundColor: bgWhite,
        color: textBlack,
        minHeight: "100vh",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        overflowX: "auto",
      }}
    >
      {/* Header */}
      <h1 style={{ textAlign: "center", fontWeight: 900, marginBottom: "20px" }}>
        Bakery Inventory
      </h1>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={{ padding: "5px", border: "2px solid black" }}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          style={{ padding: "5px", border: "2px solid black" }}
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          style={{ padding: "5px", border: "2px solid black" }}
          required
        />
        <input
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          style={{ padding: "5px", border: "2px solid black" }}
          required
        />
        <button type="submit" style={{ padding: "5px 15px", backgroundColor: "#000", color: "#fff", border: "none" }}>
          {editId ? "Update" : "Add"}
        </button>
      </form>

      {message && <p style={{ textAlign: "center", fontWeight: "bold" }}>{message}</p>}

      {/* Horizontal Products Grid */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          overflowX: "auto",
          paddingBottom: "10px",
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              border: "2px solid black",
              padding: "10px",
              minWidth: "200px",
              flexShrink: 0,
              textAlign: "center",
            }}
          >
            <p style={{ fontWeight: "bold" }}>{product.name}</p>
            <p>${product.price}</p>
            <p>{product.category}</p>
            <p>Stock: {product.stock}</p>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
              <button
                style={{ padding: "3px 6px", border: "1px solid black", background: "white", cursor: "pointer" }}
                onClick={() => setEditId(product.id) || setForm({
                  name: product.name,
                  price: String(product.price),
                  category: product.category,
                  stock: String(product.stock),
                })}
              >
                Edit
              </button>
              <button
                style={{ padding: "3px 6px", border: "1px solid black", background: "white", cursor: "pointer" }}
                onClick={() => handleDelete(product.id)}
              >
                Delete
              </button>
              <button
                style={{ padding: "3px 6px", border: "1px solid black", background: "#000", color: "#fff", cursor: "pointer" }}
                onClick={() => handleSell(product)}
              >
                Sell
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}




