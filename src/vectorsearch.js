import { setupPipelines } from './pipelines';

let extractor;
let isInitialized = false;

/**
 * Initialize the vector search module
 */
export async function initializeVectorSearch() {
  const pipelines = await setupPipelines();
  extractor = pipelines.extractor;
  isInitialized = true;
}
/**
 * 
 * @param {*} itemsVectorZh the items vector data
 * @param {*} query text to search
 * @returns the search results
 */
export async function vectorSearch(itemsVectorZh, query) {
  if (!isInitialized) {
    throw new Error("Vector search not initialized. Call initializeVectorSearch() first.");
  }

  const questionEmbeddingProxy = await extractor([query], { pooling: "mean", normalize: true });
  const queryVectorArray = Array.from(questionEmbeddingProxy[0].data);
  console.log('Question Embedding:', queryVectorArray);

  const results = [];
  console.log("Calculating similarities...");
  for (const [key, itemData] of Object.entries(itemsVectorZh)) {
    const itemVector = itemData.embedding[0];
    if (!Array.isArray(itemVector)) {
      throw new TypeError("Item vector must be an array");
    }
    const similarity = cosineSimilarity(queryVectorArray, itemVector);
    if (similarity >= 0.5) {
      results.push({ key, similarity });
    }
  }

  results.sort((a, b) => b.similarity - a.similarity);
  console.log("Search results:", results);
  return results;
}
/**
 * 
 * @param {*} vecA 
 * @param {*} vecB 
 * @returns the cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB)) {
    throw new TypeError("Input vectors must be arrays");
  }
  const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

