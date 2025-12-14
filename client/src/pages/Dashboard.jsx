import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Dashboard = () => {
  const [sweets, setSweets] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    category: "",
    minPrice: "",
    maxPrice: "",
  });

  const navigate = useNavigate();
  const { logout, role } = useAuth();

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

  const handleSearch = async () => {
    const params = new URLSearchParams(filters).toString();
    const res = await api.get(`/api/sweets/search?${params}`);
    setSweets(res.data);
  };

  const handlePurchase = async (id) => {
    await api.post(`/api/sweets/${id}/purchase`);
    fetchSweets();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-50 via-amber-50 to-yellow-100 px-4 py-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-yellow-700">
            Sweet Shop Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Browse and buy your favorite sweets
          </p>
        </div>

        <div className="flex gap-3">
          {role === "ADMIN" && (
            <button
              onClick={() => navigate("/admin")}
              className="bg-amber-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-amber-600 transition"
            >
              Admin Panel
            </button>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            placeholder="Sweet name"
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400"
            onChange={(e) =>
              setFilters({ ...filters, name: e.target.value })
            }
          />
          <input
            placeholder="Category"
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400"
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
          />
          <input
            placeholder="Min price"
            type="number"
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400"
            onChange={(e) =>
              setFilters({ ...filters, minPrice: e.target.value })
            }
          />
          <input
            placeholder="Max price"
            type="number"
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-400"
            onChange={(e) =>
              setFilters({ ...filters, maxPrice: e.target.value })
            }
          />
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSearch}
            className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition"
          >
            Search
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
              <h2 className="text-lg font-bold text-gray-800">
                {sweet.name}
              </h2>
              <p className="text-sm text-gray-500">
                Category: {sweet.category}
              </p>
              <div className="mt-3 text-gray-700 space-y-1">
                <p>
                  <span className="font-medium">Price:</span> ₹{sweet.price}
                </p>
                <p>
                  <span className="font-medium">Stock:</span>{" "}
                  {sweet.quantity}
                </p>
              </div>
            </div>

            <button
              disabled={sweet.quantity === 0}
              onClick={() => handlePurchase(sweet._id)}
              className="mt-4 bg-yellow-500 text-white py-2 rounded-lg font-semibold hover:bg-yellow-600 transition disabled:bg-gray-300"
            >
              {sweet.quantity === 0 ? "Out of Stock" : "Purchase"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
