// src/worker.ts
import { parentPort } from 'node:worker_threads';
import { pipeline, type TextGenerationOutput } from '@huggingface/transformers';

let pipe: any = null;

// const GENERAL_MODEL = "onnx-community/Qwen2.5-0.5B-Instruct"
const CODER_MODEL = "onnx-community/Qwen2.5-Coder-0.5B-Instruct"
const TYPE = "text-generation"

// parentPort?.on('message', async (task) => {
//     const { history, taskId } = task;

//     if (!pipe) {
//         pipe = await pipeline(TYPE, CODER_MODEL, {
//             device: 'cpu',
//             dtype: 'q4'
//         });
//     }

//     const output = await pipe(history, {
//         max_new_tokens: 512,
//         temperature: 0.7
//     }) as TextGenerationOutput;

//     // Send the result back with the taskId so the server knows which user this belongs to
//     parentPort?.postMessage({
//         updatedHistory: output[0].generated_text,
//         taskId
//     });
// });

parentPort?.on('message', async (task) => {
    const { history, taskId, temperature } = task; // Destructure temperature

    if (!pipe) {
        pipe = await pipeline(TYPE, CODER_MODEL, {
            device: 'cpu',
            dtype: 'q4'
        });
    }

    const output = await pipe(history, {
        max_new_tokens: 512,
        temperature: temperature || 0.7, // Use passed value or fallback
        do_sample: (temperature || 0.7) > 0 // transformers require do_sample=true to use temperature
    }) as TextGenerationOutput;

    parentPort?.postMessage({
        updatedHistory: output[0].generated_text,
        taskId
    });
});