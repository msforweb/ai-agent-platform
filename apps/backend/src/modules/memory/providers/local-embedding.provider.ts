import {
  pipeline,
  type FeatureExtractionPipeline,
} from "@huggingface/transformers";

import { EmbeddingProvider } from "../interfaces/embedding-provider.interface.js";

export class LocalEmbeddingProvider implements EmbeddingProvider {
  private pipeline?: FeatureExtractionPipeline;

  private async getPipeline(): Promise<FeatureExtractionPipeline> {
    if (!this.pipeline) {
      this.pipeline = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
      );
    }

    return this.pipeline;
  }

  async embed(text: string): Promise<number[]> {
    const extractor = await this.getPipeline();

    const output = await extractor(text, {
      pooling: "mean",
      normalize: true,
    });

    return Array.from(output.data);
  }
}