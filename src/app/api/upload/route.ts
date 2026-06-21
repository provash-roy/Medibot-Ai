import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TaskType } from "@google/generative-ai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const pdfPath = path.join(process.cwd(), "public", "medical.pdf");

    const loader = new PDFLoader(pdfPath);

    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 5,
    });

    const chunks = await splitter.splitDocuments(docs);

    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "gemini-embedding-001", // 768 dimensions
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      title: "Document title",
    });

    await QdrantVectorStore.fromDocuments(chunks, embeddings, {
      url: process.env.QDRANT_URL!,
      apiKey: process.env.QDRANT_API_KEY!,
      collectionName: "medibot-ai",
    });

    return NextResponse.json({
      success: true,
      pages: docs.length,
      chunks: chunks.length,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      },
    );
  }
}
