import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Trash2 } from "lucide-react";

type User = {
  id: string;
  username: string;
  email: string;
  full_name: string;
};

type Circuit = {
  id: string;
  name: string;
  description: string;
  created_at: string;
};

export default function Profile() {

  //use for fetching
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const currentId = searchParams.get("id");

  const handleGoBack = () => {
    if (currentId) {
      navigate(`/home?id=${currentId}`);
    } else {
      navigate("/home");
    }
  };

  const [user, setUser] = useState<User>({
    id: "",
    username: "",
    email: "",
    full_name: "",
  });

  const [circuitList, setCircuitList] = useState<Circuit[]>([]);
  const [activeTab, setActiveTab] = useState("account");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/auth/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to fetch profile. Please login again.");
        navigate("/login");
      }
    };

    const fetchCircuits = async () => {
      try {
        const response2 = await fetch("http://127.0.0.1:8000/simulate/list", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response2.ok) {
          throw new Error(`HTTP error! status: ${response2.status}`);
        }

        const data2 = await response2.json();
        setCircuitList(data2.circuits || []);
      } catch (error) {
        console.error("Error fetching circuits:", error);
        toast.error("Failed to fetch circuits.");
      }
    };

    fetchProfile();
    fetchCircuits();
  }, [navigate]);

  //end of fetching
  return (
    <div className="w-screen h-screen flex items-center justify-center ">
      <div className="w-7/10 min-w-5xl h-[500px] flex overflow-hidden rounded-xl shadow-lg dark:bg-[#3a3a37] ">
        <div className="w-64 shadow-md p-4 flex flex-col">
          <h2 className="text-2xl font-bold text-[#d97757] dark:text-orange-400 mb-6 text-center">
            My Profile
          </h2>

          <nav className="flex flex-col space-y-2 flex-1">
            <button
              onClick={() => setActiveTab("account")}
              className={`text-left px-4 py-2 rounded-md font-medium transition ${
                activeTab === "account"
                  ? " bg-[#d97757] text-white"
                  : "text-gray-800 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-gray-700"
              }`}
            >
              Account
            </button>

            <button
              onClick={() => setActiveTab("creations")}
              className={`text-left px-4 py-2 rounded-md font-medium transition ${
                activeTab === "creations"
                  ? "bg-[#d97757] text-white"
                  : "text-gray-800 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-gray-700"
              }`}
            >
              My Creations
            </button>

          </nav>

          <div className="pt-4 border-t border-gray-300 dark:border-gray-700 mt-4">
            <button
              onClick={handleGoBack}
              className="w-full text-left px-4 py-2 rounded-md font-medium transition"
            >
              ⬅ Go Back
            </button>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          {activeTab === "account" && <AccountTab user={user} />}
          {activeTab === "creations" && (
            <CreationsTab circuitList={circuitList} navigate={navigate} />
          )}
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

function AccountTab({ user }: { user: User }) {
  if (!user) return null;

  return (
    <div className=" dark:bg-[#4a4a47] rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Account Info
      </h2>
      <img
        src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${user.username}`}
        alt="Profile"
        className="w-24 h-24 rounded-full shadow-md mb-3"
      />
      <p className="text-gray-700 dark:text-gray-300 mb-2">
        <strong>Username:</strong> {user.username}
      </p>
      <p className="text-gray-700 dark:text-gray-300 mb-2">
        <strong>Full Name:</strong> {user.full_name}
      </p>
      <p className="text-gray-700 dark:text-gray-300 mb-2">
        <strong>Email:</strong> {user.email}
      </p>
    </div>
  );
}

function CreationsTab({
  circuitList,
  navigate,

}: {
  circuitList: Circuit[];
  navigate: (path: string) => void;
}) {
  const [circuits, setCircuits] = useState(circuitList);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    

    try {
      const token = localStorage.getItem("token"); 
      if (!token) {
        toast.error("You are not logged in");
        return;
      }
      const res = await fetch(`http://127.0.0.1:8000/simulate/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Delete failed");

      setCircuits((prev) => prev.filter((c) => c.id !== id));
      toast.success("Circuit deleted successfully!");
    } catch (error) {
      console.error("Error deleting circuit:", error);
      toast.error("Failed to delete circuit.");
    }
  };

  return (
    <div className="bg-white dark:bg-[#4a4a47] rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        My Creations
      </h2>

      {circuits.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No circuits yet.</p>
      ) : (
        <ul className="space-y-3">
          {circuits.map((circuit) => (
            <li
              key={circuit.id}
              onClick={() => navigate(`/home?id=${circuit.id}`)}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-md cursor-pointer hover:bg-orange-50 dark:hover:bg-gray-500 transition flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold text-[#d97757] dark:text-orange-400">
                  {circuit.name}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {circuit.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Created at: {new Date(circuit.created_at).toLocaleString()}
                </p>
              </div>

              <button
                onClick={(e) => handleDelete(circuit.id, e)}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition"
                title="Delete circuit"
              >
                <Trash2 size={20} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

