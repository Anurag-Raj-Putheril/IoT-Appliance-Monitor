import { useState, useEffect } from "react";
import { Link } from "react-router"; // Use "react-router-dom" if on v6+
import { Power, ArrowRight } from "lucide-react";
// 1. Import Firebase Realtime Database functions
import { getDatabase, ref, onValue } from "firebase/database";

interface DeviceData {
  deviceID: string;
  location: string;
  timestamp: string;
  status: number | string; // Updated to allow string just in case
}

export function Dashboard() {
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 2. Initialize database
    const db = getDatabase();
    // 3. Point to your specific device node
    const deviceRef = ref(db, 'appliance');

    // 4. Listen for real-time updates
    const unsubscribe = onValue(deviceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDeviceData(data);
        setError(null); // Clear errors on success
      } else {
        setError("No device data found in the database.");
      }
    }, (err) => {
      console.error("Firebase read error:", err);
      setError("Lost connection to the live device status.");
    });

    // 5. Clean up the listener when leaving the dashboard
    return () => unsubscribe();
  }, []);

  // Loading / Error States
  if (error) {
    return (
      <div className="flex-1 flex flex-col h-full bg-[#121212] items-center justify-center text-[#ef4444] px-6 text-center">
        <p className="tracking-wide bg-[#ef4444]/10 p-4 rounded-md border border-[#ef4444]/20">{error}</p>
      </div>
    );
  }

  if (!deviceData) {
    return (
      <div className="flex-1 flex flex-col h-full bg-[#121212] items-center justify-center text-zinc-400">
        <Power className="w-10 h-10 mb-4 animate-pulse text-[#22c55e]" />
        <p className="tracking-wide">Connecting to device...</p>
      </div>
    );
  }

  // Defensive status check (same as your LogHistory logic)
  const isOnline = deviceData.status === 1 || deviceData.status === "ON" || deviceData.status === "online";
  
  const ringColorClass = isOnline ? "border-[#22c55e]" : "border-red-500";
  const textColorClass = isOnline ? "text-[#22c55e]" : "text-red-500";

  return (
    <div className="flex-1 flex flex-col h-full bg-[#121212]">
      {/* Header */}
      <div className="pt-[calc(2rem+env(safe-area-inset-top))]   pb-8 px-6 text-center">
        <h1 className="text-3xl font-medium tracking-wide font-mono text-zinc-100">Status Monitor</h1>
      </div>

      {/* Center Status Ring */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-8">
        <div className={`relative flex flex-col items-center justify-center w-48 h-48 rounded-full border-4 ${ringColorClass} transition-colors duration-300`}>
          <Power className={`w-10 h-10 mb-2 ${textColorClass} transition-colors duration-300`} strokeWidth={1.8} />
          <span className={`text-lg font-medium tracking-wider font-sans ${textColorClass} transition-colors duration-300`}>
            {isOnline ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
      </div>

      {/* Informational Cards */}
      <div className="px-6 pb-12 space-y-3">
        <div className="bg-[#1A1A1A] p-4 rounded-md flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-400">Device ID</span>
          <span className="text-sm font-medium text-white font-mono">{deviceData.deviceID || "--"}</span>
        </div>
        <div className="bg-[#1A1A1A] p-4 rounded-md flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-400">Location</span>
          <span className="text-sm font-medium text-white font-mono">{deviceData.location || "--"}</span>
        </div>
        <div className="bg-[#1A1A1A] p-4 rounded-md flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-400">Last Ping</span>
          <span className="text-sm font-medium text-white font-mono">{deviceData.timestamp || "--"}</span>
        </div>
      </div>

      {/* Bottom UI Action Bar */}
      <div className="mt-auto w-full">
        <Link 
          to="/logs" 
          className="flex items-center justify-between w-full px-6 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] bg-[#1A1A1A] hover:bg-[#1E1E1E] active:bg-[#252525] border-t border-[#2A2A2A] transition-colors shadow-[0_-4px_20px_rgba(0,0,0,0.2)]"
        >
          <span className="text-sm font-medium text-white tracking-widest uppercase">View Activity Log</span>
          <ArrowRight size={18} className="text-zinc-400" />
        </Link>
      </div>
    </div>
  );
}
