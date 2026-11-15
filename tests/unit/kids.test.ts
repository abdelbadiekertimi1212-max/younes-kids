import { describe, expect, it } from "vitest";
import { CLOTHING_SIZES, compareSizes, isNewProduct, sizeAge, sizeInAgeGroup, sizeLabel, sortSizes, variantLabelFor } from "@/lib/kids";

describe("kids sizes", () => {
  it("reads ages from size labels", () => {
    expect(sizeAge("3-6M")).toEqual({ min: 3, max: 5 });
    expect(sizeAge("18m")).toEqual({ min: 18, max: 18 });
    expect(sizeAge("4Y")).toEqual({ min: 48, max: 59 });
    expect(sizeAge("4 a")).toEqual({ min: 48, max: 59 });
    expect(sizeAge("2-3Y")).toEqual({ min: 24, max: 47 });
    expect(sizeAge("NB")).toEqual({ min: 0, max: 1 });
    expect(sizeAge("28")).toBeNull();
    expect(sizeAge("M")).toBeNull();
  });

  it("sorts by age, never alphabetically", () => {
    expect(sortSizes(["10Y", "2Y", "12-18M", "3-6M", "4Y", "18-24M"])).toEqual(["3-6M", "12-18M", "18-24M", "2Y", "4Y", "10Y"]);
    expect([...CLOTHING_SIZES].sort(() => -1).sort(compareSizes)).toEqual([...CLOTHING_SIZES]);
    expect(sortSizes(["30", "28", "9Y", "L", "S", "2Y"])).toEqual(["2Y", "9Y", "28", "30", "S", "L"]);
    expect(sortSizes(["4Y", "4Y", "3Y"])).toEqual(["3Y", "4Y"]);
  });

  it("matches sizes to age groups", () => {
    expect(sizeInAgeGroup("6-9M", "baby")).toBe(true);
    expect(sizeInAgeGroup("2Y", "baby")).toBe(false);
    expect(sizeInAgeGroup("2Y", "toddler")).toBe(true);
    expect(sizeInAgeGroup("5Y", "kids")).toBe(true);
    expect(sizeInAgeGroup("14Y", "juniors")).toBe(true);
    expect(sizeInAgeGroup("28", "kids")).toBe(false);
  });

  it("labels sizes in each language", () => {
    expect(sizeLabel("3-6M", "ar")).toBe("3-6 أشهر");
    expect(sizeLabel("12-18M", "ar")).toBe("12-18 شهرًا");
    expect(sizeLabel("2Y", "ar")).toBe("سنتان");
    expect(sizeLabel("4Y", "ar")).toBe("4 سنوات");
    expect(sizeLabel("12Y", "ar")).toBe("12 سنة");
    expect(sizeLabel("4Y", "fr")).toBe("4 ans");
    expect(sizeLabel("3-6M", "en")).toBe("3-6 m");
    expect(sizeLabel("28", "fr")).toBe("28");
  });

  it("localizes the size part of variant labels only", () => {
    expect(variantLabelFor("4Y / وردي", "ar")).toBe("4 سنوات / وردي");
    expect(variantLabelFor("28 / Noir", "fr")).toBe("28 / Noir");
    expect(variantLabelFor("3-6M", "en")).toBe("3-6 m");
  });

  it("flags new products for 21 days", () => {
    const now = Date.parse("2026-11-15T12:00:00Z");
    expect(isNewProduct("2026-11-01T12:00:00Z", now)).toBe(true);
    expect(isNewProduct("2026-10-01T12:00:00Z", now)).toBe(false);
    expect(isNewProduct("not a date", now)).toBe(false);
  });
});
