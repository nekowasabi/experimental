import { zodResponseFormat } from "https://deno.land/x/openai@v4.69.0/helpers/zod.ts";
import OpenAI from "https://deno.land/x/openai@v4.69.0/mod.ts";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const input = Deno.args.join(" ");

const client = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });
const completion = await client.beta.chat.completions.parse({
	model: "gpt-4o-2024-08-06",
	messages: [
		{ role: "system", content: "あなたはプロの料理人です" },
		{
			role: "user",
			content: `今日の夕飯は何がいいですか？材料は ${input} です。レシピごとに、指定された材料を全て使って下さい。`,
		},
	],
	response_format: zodResponseFormat(
		z.object({
			steps: z.array(
				z.object({
					name: z.string().describe("料理名"),
					howToCook: z.string().describe("順序立てて説明された料理の作り方"),
				}),
			),
			final_answer: z.string(),
		}),
		"answer",
	),
});
const message = completion.choices[0]?.message;
if (message?.parsed) {
	console.log(message.parsed);
	console.log(message.parsed.final_answer);
}
