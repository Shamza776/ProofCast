// src/utils/ipfsClient.ts
import { Web3Storage } from "web3.storage";

const WEB3_STORAGE_TOKEN = import.meta.env.VITE_WEB3_STORAGE_TOKEN;

export const uploadToIPFS = async (content: string) => {
  const client = new Web3Storage({ token: WEB3_STORAGE_TOKEN });

  const file = new File([content], "announcement.txt", { type: "text/plain" });
  const cid = await client.put([file]);
  
  console.log("✅ Uploaded to IPFS with CID:", cid);
  return cid; // This is your decentralized file ID
};
