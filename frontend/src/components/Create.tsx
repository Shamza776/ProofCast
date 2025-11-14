import { useState } from "react";
import { uploadToIPFS } from "../utils/ipfsClient";
import { notarizeAndSignAnnouncement, connectMetaMask } from "../utils/aquaClient";

interface SignatureData {
  id?: string;
  [key: string]: string | undefined;
}

export default function CreateAnnouncement() {
  const [message, setMessage] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [ipfsCid, setIpfsCid] = useState<string | null>(null);
  const [signature, setSignature] = useState<SignatureData | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // 🪙 Connect Wallet
  const handleConnectWallet = async () => {
    try {
      setStatus("🔄 Connecting to MetaMask...");
      const account = await connectMetaMask();
      setWalletAddress(account);
      setStatus(`✅ Connected: ${account.slice(0, 6)}...${account.slice(-4)}`);
      setLogs(prev => [...prev, `✅ Wallet connected: ${account}`]);
    } catch (err: any) {
      console.error(err);
      const errorMsg = err?.message || "Failed to connect wallet";
      setStatus("❌ Failed to connect wallet.");
      setLogs(prev => [...prev, `❌ ${errorMsg}`]);
    }
  };

  // 📋 Copy Proof to Clipboard
  const handleExportProof = () => {
    if (signature?.json) {
      navigator.clipboard.writeText(signature.json);
      setLogs(prev => [...prev, "📋 Proof data copied to clipboard!"]);
      alert("Proof data copied to clipboard! Use this for verification.");
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
    setStatus("🚀 Starting notarization process...");
    setLogs(["🚀 Starting notarization process..."]);
    setSignature(null);
    setIpfsCid(null);

    try {
      // Step 1: Upload to IPFS
      console.log("📤 Uploading to Pinata...");
      setStatus("📤 Uploading to IPFS...");
      setLogs(prev => [...prev, "📤 Uploading to IPFS..."]);
      
      const cid = await uploadToIPFS(message);
      console.log("✅ CID returned:", cid);
      setIpfsCid(cid);
      setStatus("✅ Uploaded to IPFS, starting notarization...");
      setLogs(prev => [...prev, `✅ IPFS CID: ${cid}`]);

      // Step 2: Notarize with Aqua
      console.log("🧾 Starting notarization...");
      setStatus("🧾 Notarizing with Aqua...");
      setLogs(prev => [...prev, "🧾 Starting Aqua notarization..."]);
      
      const result = await notarizeAndSignAnnouncement(message);
      console.log("✅ Aqua notarization result:", result);
      
      // Create enhanced proof with content storage
      const enhancedProof = {
        // Keep all original Aqua proof data
        ...result.tree,
        // Add our verification fields
        originalContent: message, // Store the original content for verification
        verificationType: "enhanced",
        timestamp: new Date().toISOString()
      };

      // Process signature data
      const signatureData: SignatureData = {
        id: (result.tree && "id" in result.tree) ? (result.tree as { id?: string }).id || "unknown" : "unknown",
        json: JSON.stringify(enhancedProof, null, 2),
        status: result.status || "completed"
      };
      setSignature(signatureData);

      // Show success messages
      setLogs(prev => [
        ...prev,
        "✅ Notarization completed!",
        "✅ Digital signature created!",
        "✅ Blockchain witness recorded!",
        "🎉 Announcement successfully notarized and secured!"
      ]);

      setStatus("✅ Announcement notarized, signed, and witnessed on blockchain!");

    } catch (e: any) {
      console.error("❌ Process error:", e);
      
      let errorMessage = "Unknown error occurred";
      if (e?.message) {
        errorMessage = e.message;
      } else if (typeof e === 'string') {
        errorMessage = e;
      }
      
      setLogs(prev => [...prev, `❌ Error: ${errorMessage}`]);
      setStatus("❌ Failed to process announcement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h2  style={{margin: "0 auto", maxWidth: "200px", color : "#06376cff "}}>PROOF CAST</h2>
      <h2>🧾 Create Verifiable Announcement</h2>

      {/* Connection Status */}
      <div style={{ marginBottom: "20px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
        <p><strong>Network:</strong> Sepolia Testnet</p>
        <p><strong>Wallet:</strong> {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Not connected"}</p>
        <p><strong>Alchemy Key:</strong> {import.meta.env.VITE_ALCHEMY_KEY ? "✅ Configured" : "❌ Missing"}</p>
      </div>

      {/* Wallet Connection */}
      <button
        onClick={handleConnectWallet}
        disabled={loading}
        style={{
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: walletAddress ? "#16a34a" : "#9333ea",
          color: "#fff",
          marginBottom: "20px",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {walletAddress ? "Wallet Connected ✅" : "🔗 Connect Wallet"}
      </button>

      <textarea
        placeholder="Type your announcement here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={loading}
        style={{
          width: "100%",
          height: "150px",
          marginBottom: "10px",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          opacity: loading ? 0.6 : 1,
        }}
      />

      <button
        onClick={handleSign}
        disabled={loading || !walletAddress}
        style={{
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: loading ? "#888" : "#007bff",
          color: "#fff",
          cursor: (loading || !walletAddress) ? "not-allowed" : "pointer",
          opacity: (loading || !walletAddress) ? 0.6 : 1,
        }}
      >
        {loading ? "Processing..." : "Sign & Notarize"}
      </button>

      <p style={{ 
        marginTop: "15px", 
        color: status.includes("❌") ? "#dc2626" : status.includes("✅") ? "#16a34a" : "#555",
        fontWeight: "bold" 
      }}>
        {status}
      </p>

      {/* Results */}
      {ipfsCid && (
        <div className="ipfs-box" style={{ 
          marginTop: "15px", 
          padding: "15px", 
          backgroundColor: "#f0f9ff", 
          borderRadius: "8px",
          border: "1px solid #bae6fd"
        }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#0369a1" }}>📦 Stored on IPFS</h4>
          <p style={{ margin: 0 }}>
            <strong>CID:</strong>{" "}
            <a
              href={`https://ipfs.io/ipfs/${ipfsCid}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#0369a1", textDecoration: "none" }}
            >
              {ipfsCid}
            </a>
          </p>
        </div>
      )}

      {signature && (
        <div className="result-box" style={{ 
          marginTop: "15px", 
          padding: "15px", 
          backgroundColor: "#f0fdf4", 
          borderRadius: "8px",
          border: "1px solid #bbf7d0"
        }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#15803d" }}>✅ Announcement Secured!</h4>
          <p style={{ margin: "5px 0" }}>
            <strong>Status:</strong> {signature.status || "Notarized, Signed & Witnessed"}
          </p>
          <p style={{ margin: "5px 0" }}>
            <strong>Proof ID:</strong> {signature.id || "unknown"}
          </p>
          
          {/* Export Proof Button */}
          <button
            onClick={handleExportProof}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              backgroundColor: "#9333ea",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            📋 Copy Proof for Verification
          </button>
          
          <details style={{ marginTop: "10px" }}>
            <summary style={{ cursor: "pointer", color: "#15803d" }}>
              View full proof data
            </summary>
            <pre style={{ 
              backgroundColor: "#f8fafc", 
              padding: "10px", 
              borderRadius: "4px", 
              overflow: "auto",
              fontSize: "12px",
              marginTop: "10px"
            }}>
              {signature.json}
            </pre>
          </details>
        </div>
      )}

      {logs.length > 0 && (
        <div className="logs-box" style={{ 
          marginTop: "15px", 
          padding: "15px", 
          backgroundColor: "#fffbeb", 
          borderRadius: "8px",
          border: "1px solid #fde68a"
        }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#d97706" }}>🧩 Process Logs</h4>
          <ul style={{ 
            margin: 0, 
            paddingLeft: "20px", 
            maxHeight: "200px", 
            overflow: "auto",
            fontSize: "14px"
          }}>
            {logs.map((log, i) => (
              <li 
                key={i} 
                style={{ 
                  color: log.includes("❌") ? "#dc2626" : 
                         log.includes("✅") ? "#16a34a" : 
                         log.includes("🎉") ? "#7c3aed" : "#d97706",
                  marginBottom: "5px"
                }}
              >
                {log}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}