import { source } from "@/lib/source";
import { llms } from "fumadocs-core/source";

export const revalidate = false;

export const GET = () => new Response(llms(source).index());
