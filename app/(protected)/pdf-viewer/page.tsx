import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PdfViewerClient from "./client";

export default async function PdfPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: recipes } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return <PdfViewerClient initialRecipes={recipes || []} />;
}
