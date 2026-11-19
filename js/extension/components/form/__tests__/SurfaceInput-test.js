import expect from "expect";
import {formatSurfaceValue} from "../SurfaceInput";

describe("formatSurfaceValue", () => {
    it("formats integers and single-decimal values with at least two decimals", () => {
        expect(formatSurfaceValue(12)).toBe("12.00");
        expect(formatSurfaceValue("12.5")).toBe("12.50");
    });

    it("preserves additional decimal places and normalizes decimal commas", () => {
        expect(formatSurfaceValue("12.3456")).toBe("12.3456");
        expect(formatSurfaceValue("12,3456")).toBe("12.3456");
        expect(formatSurfaceValue(".5")).toBe("0.50");
        expect(formatSurfaceValue(".")).toBe("");
    });

    it("keeps zero and leaves missing values empty", () => {
        expect(formatSurfaceValue(0)).toBe("0.00");
        expect(formatSurfaceValue(null)).toBe("");
        expect(formatSurfaceValue(undefined)).toBe("");
        expect(formatSurfaceValue("")).toBe("");
    });

    it("formats numbers represented in exponential notation without rounding", () => {
        expect(formatSurfaceValue(1e-7)).toBe("0.0000001");
    });
});
