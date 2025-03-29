export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Serve static files
    if (url.pathname === "/" || url.pathname.startsWith("/static/")) {
      return env.ASSETS.fetch(request); // Cloudflare serves files from `public/`
    }

    // API: Status Check
    if (request.method === "GET" && url.pathname === "/status") {
      return new Response(JSON.stringify({ message: "Worker is running!" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // API: Get Current Time
    if (request.method === "GET" && url.pathname === "/time") {
      return new Response(JSON.stringify({ time: new Date().toISOString() }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // API: Echo JSON
    if (request.method === "POST" && url.pathname === "/echo") {
      const data = await request.json();
      return new Response(JSON.stringify({ received: data }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Default 404 Response
    return new Response(
      JSON.stringify({ error: "Not found, are you sure you are using allowed end points??" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  },
};
