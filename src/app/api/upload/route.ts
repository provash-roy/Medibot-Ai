import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const filePath = path.join(process.cwd(), "public", "medical.pdf");
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    console.log(`PDF Pages: ${docs.length}`);

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

    const retriever = vectorStore.asRetriever({
      k: 3,
    });
    const response = await retriever.invoke("What is dengu? give me in bangla");

    return NextResponse.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
