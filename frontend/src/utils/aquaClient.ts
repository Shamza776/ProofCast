// src/utils/aquaClient.ts
import { AquafierChainable } from "aqua-js-sdk/web";
import type { FileObject } from "aqua-js-sdk/web";

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Connect to MetaMask (optional helper)
export const connectMetaMask = async () => {
  if (!window.ethereum) throw new Error("MetaMask not found");
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  return accounts[0];
};

// Notarize, sign, witness, verify
export const notarizeAndSignAnnouncement = async (content: string) => {
  const fileObject: FileObject = {
    fileName: "announcement.txt",
    fileContent: content,
    path: "/announcement.txt",
  };

  const credentials = {
    witness_eth_network: "sepolia",
    witness_method: "metamask",
    alchemy_key: import.meta.env.VITE_ALCHEMY_KEY, // optional
  };

  const aqua = new AquafierChainable(null);

  const result = await aqua
    .notarize(fileObject)
    .sign("metamask", credentials)
    .witness("eth", "sepolia", "metamask", credentials)
    .verify([fileObject]);

  return {
    tree: result.getValue(),
    logs: result.getLogs(),
  };
};

// Verification only (for re-check)
export const verifyAnnouncement = async (fileObject: FileObject) => {
  const aqua = new AquafierChainable(null);
  const verified = await aqua.verify([fileObject]);
  return verified.getVerificationValue();
};
