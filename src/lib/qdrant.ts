import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "./embeddings";

export async function getVectorStore() {
  return await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: process.env.QDRANT_URL!,
    apiKey: process.env.QDRANT_API_KEY!,
    collectionName: "medibot-ai",
  });
}
