// src/utils/ipfsClient.ts
// const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY!;
// const PINATA_SECRET_API_KEY = import.meta.env.VITE_PINATA_SECRET_API_KEY!;

// src/utils/ipfsClient.ts
export async function uploadToIPFS(content: string) {
  try {
    const token = import.meta.env.VITE_PINATA_JWT;
    if (!token) throw new Error("Missing Pinata JWT in .env file");

    const blob = new Blob([content], { type: "text/plain" });
    const file = new File([blob], "announcement.txt", { type: "text/plain" });

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Pinata upload failed: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    console.log("📦 Pinata upload success:", data);
    return data.IpfsHash;
  } catch (err) {
    console.error("❌ Error uploading to IPFS:", err);
    throw err;
  }
}

