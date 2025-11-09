import { AquafierChainable } from "aqua-js-sdk/web";
import type { FileObject } from "aqua-js-sdk/web";

export async function notarizeAndSignAnnouncement(content: string) {
  const fileObject: FileObject = {
    fileName: "announcement.txt",
    fileContent: content,
    path: "/announcement.txt",
  };

  const credentials = {
    witness_eth_network: "sepolia",
    witness_method: "metamask",
    alchemy_key: "YOUR_ALCHEMY_KEY", // optional for witnessing
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
}

export async function verifyAnnouncement(fileObject: FileObject) {
  const aqua = new AquafierChainable(null);
  const verified = await aqua.verify([fileObject]);
  return verified.getVerificationValue();
}
