import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { Chroma } from "@langchain/community/vectorstores/chroma";

export async function POST() {

    const filePath = path.join(process.cwd(), "public", "medical.pdf");
    // 1. Load PDF

    const loader = new PDFLoader(filePath);

//   let tempFilePath: string | null = null;

//   try {
//     const formData = await request.formData();
//     const file = formData.get("file");

//     if (!file || typeof file === "string") {
//       return NextResponse.json(
//         { success: false, error: "No file uploaded" },
//         { status: 400 },
//       );
//     }

//     const fileName = path.basename(file.name || `upload-${Date.now()}.pdf`);
//     const uploadDir = path.join(process.cwd(), "tmp");
//     await fs.mkdir(uploadDir, { recursive: true });

//     tempFilePath = path.join(uploadDir, `${Date.now()}-${fileName}`);
//     const buffer = Buffer.from(await file.arrayBuffer());
//     await fs.writeFile(tempFilePath, buffer);

//     // 1. Load PDF
//     const loader = new PDFLoader(tempFilePath);
    const docs = await loader.load();

    console.log(`PDF Pages: ${docs.length}`);

    // 2. Split PDF
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });

    const chunks = await splitter.splitDocuments(docs);
    console.log(`Chunks Created: ${chunks.length}`);

    // 3. HuggingFace Embedding Model
    const embeddings = new HuggingFaceTransformersEmbeddings({
      modelName: "sentence-transformers/all-MiniLM-L6-v2",
    });

    // 4. Store in ChromaDB
    await Chroma.fromDocuments(chunks, embeddings, {
      collectionName: "medical-book",
      url: "http://localhost:8000",
    });

    console.log("Stored in ChromaDB");

    return NextResponse.json({
      success: true,
      message: "PDF indexed successfully",
      chunks: chunks.length,
    });
}
//   } catch (error) {
//     console.error(error);

//     return NextResponse.json(
//       {
//         success: false,
//         error: "Upload failed",
//       },
//       {
//         status: 500,
//       },
//     );
// }
//   } finally {
//     if (tempFilePath) {
//       await fs.unlink(tempFilePath).catch(() => {
//         // ignore cleanup errors
//       });
//     }
 