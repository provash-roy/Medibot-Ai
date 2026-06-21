import { llm } from "@/lib/llm";
import { getVectorStore } from "@/lib/qdrant";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    const vectorStore = await getVectorStore();

    const retriever = vectorStore.asRetriever({
      k: 5,
    });

    const docs = await retriever.invoke(question);

    const context = docs.map((doc) => doc.pageContent).join("\n\n");

    const prompt = `
          You are a helpful assistant.
          Answer from the provided context.

          Context: ${context}

          Question: ${question}
        `;

    const response = await llm.invoke(prompt);

    return NextResponse.json({
      answer: response.content,
      sources: docs,
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
