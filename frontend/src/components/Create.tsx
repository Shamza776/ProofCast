import { useState } from "react";
import { uploadToIPFS } from "../utils/ipfsClient";
import { notarizeAndSignAnnouncement, connectMetaMask } from "../utils/aquaClient";

export default function CreateAnnouncement() {
  const [message, setMessage] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [ipfsCid, setIpfsCid] = useState<string | null>(null);
  const [signature, setSignature] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // 🪙 Connect Wallet
  const handleConnectWallet = async () => {
    try {
      const account = await connectMetaMask();
      setWalletAddress(account);
      setStatus(`✅ Connected: ${account.slice(0, 6)}...${account.slice(-4)}`);
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to connect wallet.");
    }
  };

  const handleSign = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }
    if (!message.trim()) {
      alert("Please type your announcement before submitting.");
      return;
    }

    setLoading(true);
    setStatus("📡 Uploading to IPFS...");
    setLogs([]);
    setSignature(null);
    setIpfsCid(null);

    try {
      // Step 1: Upload to IPFS
      const cid = await uploadToIPFS(message);
      setIpfsCid(cid);

      // Step 2: Notarize + Sign + Witness + Verify with Aqua
      setStatus("🧾 Notarizing and signing...");
      const result = await notarizeAndSignAnnouncement(message);

      setSignature(result.tree);
      setLogs(result.logs);
      setStatus("✅ Announcement notarized, signed, and verified!");
    } catch (e) {
      console.error(e);
      setLogs(["❌ Error during notarization or IPFS upload"]);
      setStatus("❌ Failed to process announcement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h2>🧾 Create Verifiable Announcement</h2>

      {/* 🪙 Wallet Connection */}
      <button
        onClick={handleConnectWallet}
        style={{
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: walletAddress ? "#16a34a" : "#9333ea",
          color: "#fff",
          marginBottom: "20px",
          cursor: "pointer",
        }}
      >
        {walletAddress ? "Wallet Connected ✅" : "🔗 Connect Wallet"}
      </button>

      <textarea
        placeholder="Type your announcement here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{
          width: "100%",
          height: "150px",
          marginBottom: "10px",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={handleSign}
        disabled={loading}
        style={{
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: loading ? "#888" : "#007bff",
          color: "#fff",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Processing..." : "Sign & Notarize"}
      </button>

      <p style={{ marginTop: "15px", color: "#555" }}>{status}</p>

      {ipfsCid && (
        <div className="ipfs-box" style={{ marginTop: "15px" }}>
          <h4>📦 Stored on IPFS</h4>
          <p>
            <strong>CID:</strong>{" "}
            <a
              href={`https://ipfs.io/ipfs/${ipfsCid}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {ipfsCid}
            </a>
          </p>
        </div>
      )}

      {signature && (
        <div className="result-box" style={{ marginTop: "15px" }}>
          <h4>✅ Announcement notarized & signed!</h4>
          <p>
            <strong>Proof:</strong>{" "}
            {signature.id || JSON.stringify(signature).slice(0, 80)}...
          </p>
        </div>
      )}

      {logs.length > 0 && (
        <div className="logs-box" style={{ marginTop: "15px" }}>
          <h4>🧩 Process Logs</h4>
          <ul>
            {logs.map((log, i) => (
              <li key={i}>{log}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
