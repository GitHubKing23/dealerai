import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

async function retrieveVehicles(dealerId: string, query: string) {
  const q = (query ?? "").trim();
  if (!q) {
    return prisma.vehicle.findMany({
      where: { dealerId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  }
  return prisma.vehicle.findMany({
    where: {
      dealerId,
      OR: [
        { make: { contains: q } },
        { model: { contains: q } },
        { description: { contains: q } },
      ],
    },
    take: 5,
  });
}

async function callLLM(messages: ChatMsg[], context: string) {
  const base = process.env.LLM_BASE_URL;
  try {
    if (base) {
      const res = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [{ role: "system", content: context }, ...messages],
          temperature: 0.3,
        }),
      });
      const data = await res.json();
      return data?.choices?.[0]?.message?.content ?? "Sorry, try again.";
    }
    if (!process.env.OPENAI_API_KEY) return "LLM is not configured yet.";
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: context }, ...messages],
        temperature: 0.3,
      }),
    });
    const data = await resp.json();
    return data?.choices?.[0]?.message?.content ?? "Sorry, try again.";
  } catch (err) {
    console.error("LLM error:", err);
    return "LLM unavailable right now; here are matches from your inventory.";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, dealer } = (await req.json()) as {
      messages: ChatMsg[];
      dealer: string;
    };
    if (!dealer) {
      return NextResponse.json({ error: "Missing dealer id" }, { status: 400 });
    }

    const userMsg = messages?.[messages.length - 1]?.content || "";
    const vehicles = await retrieveVehicles(dealer, userMsg);
    const inv = vehicles
      .map(v => `${v.year} ${v.make} ${v.model} - $${v.price}${v.mileage ? `, ${v.mileage} km` : ""}`)
      .join("\n");

    const context = `You are DealerAI. Use ONLY this inventory list when suggesting vehicles. If booking is requested, ask for day/time.
Inventory:
${inv || "No matching vehicles."}`;

    const answer = await callLLM(messages, context);
    return NextResponse.json({ answer, vehicles });
  } catch (e) {
    console.error("chat route error:", e);
    return NextResponse.json({ answer: "Something went wrong.", vehicles: [] }, { status: 200 });
  }
}
