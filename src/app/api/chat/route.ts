import { NextResponse } from "next/server";

import { buildChain } from "@/rag/chain";

export async function POST(req: Request) {
  const body = await req.json();

  const chain = await buildChain();

  const result = await chain.invoke({
    input: body.question,
  });

  return NextResponse.json({
    answer: result.answer,
  });
}
