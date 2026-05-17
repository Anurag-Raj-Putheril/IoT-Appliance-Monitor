import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ArrowLeft, Trash2, AlertTriangle } from "lucide-react"; 
import { getDatabase, ref, query, limitToLast, onValue, remove } from "firebase/database";

interface LogEntry {
  id: string;
  timestamp: string;
  status: "online" | "offline";
}

export function LogHistory() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false); // Controls the custom modal

  useEffect(() => {
    const db = getDatabase();
    const logsRef = query(ref(db, 'appliance_logs'), limitToLast(50));

    const unsubscribe = onValue(logsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const fetchedLogs = Object.keys(data).map((key) => {
            const entry = data[key];
            const isOnline = entry.status === 1 || entry.status === "ON" || entry.status === "online";

            return {
              id: key,
              timestamp: entry.time || entry.timestamp || "--:--:--",
              status: (isOnline ? "online" : "offline") as "online" | "offline"
            };
          });
          setLogs(fetchedLogs.reverse());
        } else {
          setLogs([]);
        }
        setError(null); 
      } catch (err) {
        setError("Failed to process the live log data.");
      } finally {
        setIsLoading(false);
      }
    }, (err) => {
      setError("Failed to connect to the live log stream.");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Function to actually perform the deletion
  const confirmClearLogs = async () => {
    try {
      const db = getDatabase();
      await remove(ref(db, 'appliance_logs'));
      setShowConfirm(false); // Hide modal after success
    } catch (err) {
      alert("Failed to clear logs.");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#121212]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-6 bg-[#121212] border-b border-[#1A1A1A]">
        <div className="flex items-center">
          <Link 
            to="/" 
            className="text-zinc-400 hover:text-white transition-colors flex items-center justify-center p-2 -ml-2 rounded-full"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-medium tracking-wide text-zinc-100 ml-2">Log History</h1>
        </div>

        {!isLoading && logs.length > 0 && (
          <button
            onClick={() => setShowConfirm(true)} // Open custom modal
            className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-red-400 transition-colors tracking-widest uppercase"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </header>

      {/* Scrollable Timeline List */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-[calc(5rem+env(safe-area-inset-bottom))]">
        {isLoading ? (
          <div className="text-zinc-500 text-sm mt-4 text-center">Loading live logs...</div>
        ) : error ? (
          <div className="text-[#ef4444] text-sm mt-4 text-center px-4 py-3 bg-[#ef4444]/10 rounded-md border border-[#ef4444]/20">
            {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-sm font-mono text-zinc-600 tracking-widest uppercase">No activity logs found</p>
          </div>
        ) : (
          <div className="flex flex-col relative">
            {logs.map((log, index) => (
              <div key={log.id} className="flex items-start gap-4 relative pb-8">
                {index !== logs.length - 1 && (
                  <div className="absolute left-[3px] top-[14px] bottom-0 w-[1px] bg-[#2A2A2A]"></div>
                )}
                <div className="mt-1.5 z-10 relative">
                  <div className={`w-2 h-2 rounded-none ${
                    log.status === "online" ? "bg-[#22c55e]" : "bg-[#ef4444]"
                  }`}></div>
                </div>
                <div className="flex-1 flex flex-col -mt-0.5">
                  <div className="font-mono text-[15px] tracking-wide flex items-center">
                    <span className="text-white">{log.timestamp}</span>
                    <span className="mx-3 text-zinc-600">|</span>
                    <span className={`font-medium ${log.status === "online" ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                      {log.status === "online" ? "ON" : "OFF"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CUSTOM MODAL OVERLAY */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-[#1A1A1A] w-full max-w-sm rounded-xl border border-[#2A2A2A] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <h2 className="text-white text-lg font-medium mb-2">Clear Activity Logs?</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                This action will permanently delete all device history from the database. This cannot be undone.
              </p>
            </div>
            
            <div className="flex border-t border-[#2A2A2A]">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-4 text-sm font-medium text-zinc-400 hover:bg-[#222] transition-colors border-r border-[#2A2A2A]"
              >
                Cancel
              </button>
              <button 
                onClick={confirmClearLogs}
                className="flex-1 px-4 py-4 text-sm font-medium text-red-500 hover:bg-red-500/5 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
