import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Admin = () => {
  const [sweets, setSweets] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
  });

  const navigate = useNavigate();
  const { logout } = useAuth();

  const fetchSweets = async () => {
    const res = await api.get("/api/sweets");
    setSweets(res.data);
  };

  useEffect(() => {
    fetchSweets();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAdd = async () => {
    await api.post("/api/sweets", {
      ...form,
      price: Number(form.price),
      quantity: Number(form.quantity),
    });
    setForm({ name: "", category: "", price: "", quantity: "" });
    fetchSweets();
  };

  const handleDelete = async (id) => {
    await api.delete(`/api/sweets/${id}`);
    fetchSweets();
  };

  const handleRestock = async (id) => {
    await api.post(`/api/sweets/${id}/restock`, { quantity: 5 });
    fetchSweets();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-50 via-amber-50 to-yellow-100 px-4 py-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-yellow-700">
            Admin Panel
          </h1>
          <p className="text-gray-600 mt-1">
            Manage sweets inventory
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-yellow-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition"
          >
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow p-5 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Add New Sweet
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            placeholder="Name"
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />
          <input
            placeholder="Category"
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400"
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
          />
          <input
            placeholder="Price"
            type="number"
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value })
            }
          />
          <input
            placeholder="Quantity"
            type="number"
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400"
            value={form.quantity}
            onChange={(e) =>
              setForm({ ...form, quantity: e.target.value })
            }
          />
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleAdd}
            className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition"
          >
            Add Sweet
          </button>
        </div>
      </div>

      {/* Sweet Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sweets.map((sweet) => (
          <div
            key={sweet._id}
            className="bg-white rounded-xl shadow p-5 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {sweet.name}
              </h3>
              <p className="text-sm text-gray-500">
                Category: {sweet.category}
              </p>
              <p className="mt-2 text-gray-700">
                <span className="font-medium">Stock:</span>{" "}
                {sweet.quantity}
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleRestock(sweet._id)}
                className="flex-1 bg-amber-500 text-white py-2 rounded-lg font-semibold hover:bg-amber-600 transition"
              >
                Restock
              </button>
              <button
                onClick={() => handleDelete(sweet._id)}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;
