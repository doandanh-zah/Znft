import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { name, symbol, description, image } = payload || {};

    if (!name || !image) {
      return NextResponse.json({ error: "Missing name/image" }, { status: 400 });
    }

    const metadata = {
      name,
      symbol: symbol || "ZNFT",
      description: description || "Znft devnet NFT",
      image,
      attributes: [],
      properties: { files: [{ type: "image/*", uri: image }], category: "image" },
    };

    const upstream = await fetch("https://jsonblob.com/api/jsonBlob", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(metadata),
      cache: "no-store",
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return NextResponse.json({ error: `jsonblob failed: ${text}` }, { status: 502 });
    }

    const location = upstream.headers.get("location");
    if (!location) {
      return NextResponse.json({ error: "No metadata location returned" }, { status: 502 });
    }

    const uri = location.startsWith("http") ? location : `https://jsonblob.com${location}`;
    return NextResponse.json({ uri });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
