import { describe, expect, it } from "vitest";

import { SimpleTokenCounter } from "../../../src/ai/memory/token-counter.js";

describe("SimpleTokenCounter", () => {

  it("should return a positive token count", async () => {

    const counter = new SimpleTokenCounter();

    const tokens = await counter.count("Hello");

    expect(tokens).toBeGreaterThan(0);

  });

  it("should estimate more tokens for longer text", async () => {

    const counter = new SimpleTokenCounter();

    const shortText = await counter.count("Hello");

    const longText = await counter.count(
      "Hello ".repeat(100)
    );

    expect(longText).toBeGreaterThan(shortText);

  });

});