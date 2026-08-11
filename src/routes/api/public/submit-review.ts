import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
  slug: z.string().min(1).max(120),
  rating: z.number().int().min(1).max(5),
  review_text: z.string().min(1).max(2000),
  customer_name: z.string().max(120).nullish(),
  customer_phone: z.string().max(20).nullish(),
  ai_generated: z.boolean().optional(),
});

export const Route = createFileRoute("/api/public/submit-review")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
        }
        const parsed = Body.safeParse(payload);
        if (!parsed.success) {
          return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });
        }
        const { slug, rating, review_text, customer_name, customer_phone, ai_generated } = parsed.data;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: biz, error: bizErr } = await supabaseAdmin
          .from("businesses")
          .select("id, name, gmb_link")
          .eq("slug", slug)
          .maybeSingle();
        if (bizErr || !biz) {
          return new Response(JSON.stringify({ error: "Business not found" }), { status: 404 });
        }

        const isPositive = rating >= 3;
        const status = isPositive ? "public" : "private";
        const sentiment = isPositive ? "positive" : "negative";

        const { error: revErr } = await supabaseAdmin.from("reviews").insert({
          business_id: biz.id,
          customer_name: customer_name || null,
          customer_phone: customer_phone || null,
          rating,
          review_text,
          ai_generated: !!ai_generated,
          status,
          source: "qr",
          sentiment,
        });
        if (revErr) {
          return new Response(JSON.stringify({ error: "Could not save review" }), { status: 500 });
        }

        if (customer_phone) {
          await supabaseAdmin.from("whatsapp_logs").insert({
            business_id: biz.id,
            phone: customer_phone,
            message_type: isPositive ? "thankyou" : "negative_private",
            message_text: isPositive
              ? `Thank you for reviewing ${biz.name}!`
              : `Owner will contact you about your feedback for ${biz.name}.`,
          });
        }

        // Best-effort scan increment
        await supabaseAdmin.rpc("increment_scan", { _slug: slug });

        return new Response(
          JSON.stringify({
            ok: true,
            gmb_link: isPositive ? biz.gmb_link : null,
          }),
          { headers: { "content-type": "application/json" } },
        );
      },
    },
  },
});
