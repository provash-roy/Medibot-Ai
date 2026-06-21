import path from "path";
import { NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { QdrantVectorStore } from "@langchain/qdrant";

export async function POST() {
  const filePath = path.join(process.cwd(), "public", "medical.pdf");
  const loader = new PDFLoader(filePath);
  const docs = await loader.load();

  console.log(`PDF Pages: ${docs.length}`);

  // 2. Split PDF
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const chunks = await splitter.splitDocuments(docs);
  console.log(`Chunks Created: ${chunks.length}`);

  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001", // 768 dimensions
    taskType: TaskType.RETRIEVAL_DOCUMENT,
    title: "Document title",
  });

  console.log("QDRANT URL:", process.env.QDRANT_URL);

  const vectorStore = await QdrantVectorStore.fromDocuments(
    chunks,
    embeddings,
    {
      url: process.env.QDRANT_URL!,
      apiKey: process.env.QDRANT_API_KEY!,
      collectionName: "medibot-ai",
    },
  );

  console.log("Stored in QDrant", vectorStore);

  return NextResponse.json({
    success: true,
    message: "PDF indexed successfully",
    chunks: chunks.length,
  });
}
