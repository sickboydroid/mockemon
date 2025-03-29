export default {
  async fetch(request) {
    const url = new URL(request.url);

    // 1️⃣ Status Check
    if (request.method === "GET" && url.pathname === "/status") {
      return new Response(JSON.stringify({ message: "Worker is running!" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2️⃣ Get Current Time
    if (request.method === "GET" && url.pathname === "/time") {
      return new Response(JSON.stringify({ time: new Date().toISOString() }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3️⃣ Echo Back JSON Data
    if (request.method === "POST" && url.pathname === "/echo") {
      const data = await request.json();
      return new Response(JSON.stringify({ received: data }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Default 404 Response
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  },
};
