import { NextResponse } from "next/server";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";


export async function GET() {

  const embeddings = new HuggingFaceTransformersEmbeddings({
    modelName: "Xenova/all-MiniLM-L6-v2", // Default lightweight local model
  });

  // Embed a single document
  const res = await embeddings.embedQuery("Hello world");
  console.log(res);
  return NextResponse.json({
    status: "ok",
    service: "medical-rag-chatbot",
  });
}
