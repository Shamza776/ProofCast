import { useState } from "react";
import { verifyAnnouncement } from "../utils/aquaClient";

export default function VerifyAnnouncement() {
  const [content, setContent] = useState("");
  const [result, setResult] = useState<string>("");

  const handleVerify = async () => {
    const fileObject = {
      fileName: "announcement.txt",
      fileContent: content,
      path: "/announcement.txt",
    };
    const verified = await verifyAnnouncement(fileObject);
    setResult(verified ? "✅ Verified and authentic!" : "❌ Verification failed.");
  };

  return (
    <div className="container">
      <h2>🔍 Verify Announcement</h2>
      <textarea
        placeholder="Paste announcement text here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={handleVerify}>Verify</button>

      {result && <p className="verify-result">{result}</p>}
    </div>
  );
}
