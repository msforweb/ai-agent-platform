import { describe, it, expect } from "vitest";

import { LocalEmbeddingProvider } from "../../../src/modules/memory/providers/local-embedding.provider.js";

describe("LocalEmbeddingProvider", () => {
  it("should generate a 384-dimensional embedding", async () => {
    const provider = new LocalEmbeddingProvider();

    const embedding = await provider.embed(
      "This is a test conversation memory."
    );

    expect(Array.isArray(embedding)).toBe(true);
    expect(embedding).toHaveLength(384);
  }, 30000); // Set a timeout of 30 seconds for this test
});