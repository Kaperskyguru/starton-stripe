const axios = require("axios");
const FormData = require("form-data");
const User = require("./User");

const SMART_CONTRACT_NETWORK = "polygon-mumbai";
const SMART_CONTRACT_ADDRESS = "";
const WALLET_IMPORTED_ON_STARTON = "";
const METADATA_CID = "";

const starton = axios.create({
  baseURL: "https://api.starton.io/v2",
  headers: {
    "x-api-key": "YOUR_STARTON_API_KEY",
  },
});

export const mint = async (contract) => {
  const nft = await starton.post(
    `/smart-contract/${SMART_CONTRACT_NETWORK}/${SMART_CONTRACT_ADDRESS}/call`,
    {
      functionName: "safeMint",
      signerWallet: WALLET_IMPORTED_ON_STARTON,
      speed: "low",
      params: [contract, METADATA_CID],
    }
  );
  return nft.data;
};

export const deployImageIPFS = async (image, name) => {
  let data = new FormData();
  data.append("file", image, name);
  data.append("isSync", "true");

  const ipfsImg = await starton.post("/pinning/content/file", data, {
    maxBodyLength: "Infinity",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
    },
  });
  return ipfsImg.data;
};

export const deployToIPFS = async (metadata) => {
  const metadataJson = {
    name: `A Wonderful NFT`,
    description: `Probably the most awesome NFT ever created !`,
    image: `ipfs://ipfs/${imgCid}`,
    ...metadata,
  };
  const ipfsMetadata = await starton.post("/pinning/content/json", {
    name: "My NFT metadata Json",
    content: metadataJson,
    isSync: true,
  });
  return ipfsMetadata.data;
};

export const mintAndSend = async (data) => {
  // Get user wallet address from user email
  if (!data.customer && !data.customer.email) return;
  const user = User.find(data.customer.email);
  // Call mint
  const nft = mint(user.contract_address);
  return nft;
};

// export const deploy = async () => {};
// export const send = async () => {};
