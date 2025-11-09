import { useState } from "react";
import { notarizeAndSignAnnouncement } from "../utils/aquaClient";

export default function CreateAnnouncement() {
  const [message, setMessage] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  interface Signature {
    id?: string;
    [key: string]: unknown;
  }
  const [signature, setSignature] = useState<Signature | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSign = async () => {
    setLoading(true);
    try {
      const result = await notarizeAndSignAnnouncement(message);
      setLogs(result.logs);
      setSignature(result.tree);
    } catch (e) {
      console.error(e);
      setLogs(["❌ Error during notarization"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>🧾 Create Verifiable Announcement</h2>
      <textarea
        placeholder="Type your announcement here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSign} disabled={loading}>
        {loading ? "Processing..." : "Sign & Notarize"}
      </button>

      {signature && (
        <div className="result-box">
          <h3>✅ Announcement notarized & signed!</h3>
          <p>
            <strong>Proof ID:</strong>{" "}
            {signature.id || JSON.stringify(signature).slice(0, 50)}...
          </p>
        </div>
      )}

      {logs.length > 0 && (
        <div className="logs-box">
          <h4>Process Logs:</h4>
          <ul>
            {logs.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
