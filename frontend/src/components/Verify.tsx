import { useState } from "react";
import { enhancedVerify } from "../utils/aquaClient";

interface VerificationResult {
  isValid: boolean;
  message: string;
  details?: any;
}

export default function VerifyAnnouncement() {
  const [proofData, setProofData] = useState("");
  const [content, setContent] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!proofData.trim() || !content.trim()) {
      setResult({
        isValid: false,
        message: "❌ Please provide both the proof data and announcement content"
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let proof;
      try {
        proof = JSON.parse(proofData);
        console.log("📋 Parsed proof data:", proof);
      } catch (e) {
        setResult({
          isValid: false,
          message: "❌ Invalid proof data format. Please paste valid JSON."
        });
        setLoading(false);
        return;
      }

      console.log("🔍 Starting verification...", { content, proof });

      // Use enhanced verification
      const isValid = await enhancedVerify(content, proof);
      
      setResult({
        isValid,
        message: isValid ? 
          "✅ Verified and authentic! The content matches the original notarization." : 
          "❌ Verification failed - Content has been modified or proof is invalid",
        details: proof
      });
    } catch (error: any) {
      console.error("Verification error:", error);
      setResult({
        isValid: false,
        message: `❌ Verification error: ${error.message || "Unknown error"}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestValid = () => {
    setContent("0987");
    setProofData(`{
  "revisions": {
    "genesis": {
      "cid": "bafyreibwsjfw24tqxs5a5hllbjt5k4j4bkwrgm5dfg5p5vfd2p7sm3u5u",
      "timestamp": 1733050247823
    }
  },
  "file_index": {
    "/announcement.txt": {
      "revision": "genesis"
    }
  },
  "tree": {
    "id": "0x9d5c9f6d8c4e4a1b7e5f8c2a3d9e4f7b2a1c8e3d6f9a4b7e2c5d8f1a9e3b4c7",
    "root": "0x8f3a7e6d4c2b9a1e5f8d3c6b9a2e7f4d1c8b5a9e2f7d4c1b8a5e9f3c6d2a7b4",
    "signatures": [
      {
        "type": "metamask",
        "address": "0x09d8E928a1DAB21b6b11B04B6750BdDb09d70F8C",
        "signature": "0x1234567890abcdef"
      }
    ],
    "witnesses": [
      {
        "type": "eth",
        "network": "sepolia", 
        "transaction": "0x9876543210fedcba"
      }
    ]
  },
  "originalContent": "0987",
  "verificationType": "enhanced",
  "timestamp": "2024-01-01T00:00:00.000Z"
}`);
  };

  const handleTestModifiedContent = () => {
    setContent("MODIFIED CONTENT");
    setProofData(`{
  "revisions": {
    "genesis": {
      "cid": "bafyreibwsjfw24tqxs5a5hllbjt5k4j4bkwrgm5dfg5p5vfd2p7sm3u5u",
      "timestamp": 1733050247823
    }
  },
  "file_index": {
    "/announcement.txt": {
      "revision": "genesis"
    }
  },
  "tree": {
    "id": "0x9d5c9f6d8c4e4a1b7e5f8c2a3d9e4f7b2a1c8e3d6f9a4b7e2c5d8f1a9e3b4c7",
    "root": "0x8f3a7e6d4c2b9a1e5f8d3c6b9a2e7f4d1c8b5a9e2f7d4c1b8a5e9f3c6d2a7b4",
    "signatures": [
      {
        "type": "metamask",
        "address": "0x09d8E928a1DAB21b6b11B04B6750BdDb09d70F8C",
        "signature": "0x1234567890abcdef"
      }
    ],
    "witnesses": [
      {
        "type": "eth",
        "network": "sepolia",
        "transaction": "0x9876543210fedcba"
      }
    ]
  },
  "originalContent": "0987",
  "verificationType": "enhanced",
  "timestamp": "2024-01-01T00:00:00.000Z"
}`);
  };

  const handleClear = () => {
    setContent("");
    setProofData("");
    setResult(null);
  };

  return (
    <div className="container" style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h2>🔍 Verify Announcement</h2>
      
      <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f0f9ff", borderRadius: "8px" }}>
        <h4 style={{ margin: "0 0 10px 0", color: "#0369a1" }}>How to Verify:</h4>
        <ol style={{ margin: 0, paddingLeft: "20px" }}>
          <li>Paste the original announcement content</li>
          <li>Paste the proof JSON from the notarization</li>
          <li>Click verify to check authenticity</li>
        </ol>
        <div style={{ marginTop: "10px" }}>
          <button 
            onClick={handleTestValid}
            style={{
              marginRight: "10px",
              padding: "5px 10px",
              backgroundColor: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            Test Valid
          </button>
          <button 
            onClick={handleTestModifiedContent}
            style={{
              marginRight: "10px",
              padding: "5px 10px",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            Test Modified
          </button>
          <button 
            onClick={handleClear}
            style={{
              padding: "5px 10px",
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Content Input */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
          Announcement Content:
        </label>
        <textarea
          placeholder="Paste the original announcement text here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{
            width: "100%",
            height: "100px",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      {/* Proof Data Input */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
          Proof Data (JSON):
        </label>
        <textarea
          placeholder='Paste the proof JSON from notarization here...'
          value={proofData}
          onChange={(e) => setProofData(e.target.value)}
          style={{
            width: "100%",
            height: "150px",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontFamily: "monospace",
            fontSize: "12px"
          }}
        />
      </div>

      <button 
        onClick={handleVerify}
        disabled={loading}
        style={{
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: loading ? "#888" : "#007bff",
          color: "#fff",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Verifying..." : "Verify Authenticity"}
      </button>

      {/* Results */}
      {result && (
        <div className="result-box" style={{ 
          marginTop: "20px", 
          padding: "15px", 
          backgroundColor: result.isValid ? "#f0fdf4" : "#fef2f2", 
          borderRadius: "8px",
          border: `1px solid ${result.isValid ? "#bbf7d0" : "#fecaca"}`
        }}>
          <h4 style={{ 
            margin: "0 0 10px 0", 
            color: result.isValid ? "#15803d" : "#dc2626" 
          }}>
            {result.isValid ? "✅ Verification Successful" : "❌ Verification Failed"}
          </h4>
          <p style={{ margin: "5px 0", fontWeight: "bold" }}>
            {result.message}
          </p>
          
          {result.details && (
            <details style={{ marginTop: "10px" }}>
              <summary style={{ cursor: "pointer", color: "#6b7280" }}>
                View Proof Details
              </summary>
              <pre style={{ 
                backgroundColor: "#f8fafc", 
                padding: "10px", 
                borderRadius: "4px", 
                overflow: "auto",
                fontSize: "12px",
                marginTop: "10px"
              }}>
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}