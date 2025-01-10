import { pipeline } from '@huggingface/transformers';

export async function setupPipelines() {
  // Create feature extraction pipeline
  const extractor = await pipeline(
    "feature-extraction",
    "jinaai/jina-embeddings-v2-base-zh",
    { device: "webgpu" }
  );

  return { extractor };
}
