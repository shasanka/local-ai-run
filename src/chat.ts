import {
    pipeline,
    // type PipelineType,
    type TextGenerationPipeline,
    type TextGenerationOutput
} from "@huggingface/transformers";
import { Message } from "./Utils/types.ts";



let pipe: TextGenerationPipeline | null = null;

export async function chatStep(history: Message[]): Promise<Message[]> {
    console.log("🚀 ~ chatStep ~ history:", history)
    // 1. Lazy-load the model once
    if (!pipe) {
        const TASK = "text-generation";
        const MODEL = "onnx-community/Qwen2.5-0.5B-Instruct";

        // 2. Cast the result of the function call, not just the pipe variable
        const instance = await pipeline(TASK, MODEL, {
            device: 'cpu',
            dtype: 'q4'
        });

        // 3. Narrow the type here
        pipe = instance as TextGenerationPipeline;
    }

    // 2. Run the model
    const output = await pipe(history, {
        max_new_tokens: 128,
        temperature: 0.7
    }) as TextGenerationOutput;

    // 3. Transformers.js returns the FULL history (old messages + new message)
    // We return this updated array to be used in the next turn
    return output[0].generated_text as Message[];
}

