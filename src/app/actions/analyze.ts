"use server";

import { z } from "zod";
import {
  analyzeServiceCenterPerformance,
  AnalyzeServiceCenterPerformanceInput,
  AnalyzeServiceCenterPerformanceOutput,
} from "@/ai/flows/analyze-service-center-performance";

const schema = z.object({
  month: z.string().min(1, "Month is required."),
  serviceCenter: z.string().min(1, "Service Center is required."),
  callsData: z.string().min(1, "Calls data is required."),
  inventoryData: z.string().min(1, "Inventory data is required."),
});

export type FormState = {
  success: boolean;
  message: string;
  data?: AnalyzeServiceCenterPerformanceOutput;
};

export async function analyze(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = schema.safeParse({
    month: formData.get("month"),
    serviceCenter: formData.get("serviceCenter"),
    callsData: formData.get("callsData"),
    inventoryData: formData.get("inventoryData"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid form data. Please check your inputs.",
    };
  }

  try {
    const result = await analyzeServiceCenterPerformance(
      validatedFields.data as AnalyzeServiceCenterPerformanceInput
    );
    return {
      success: true,
      message: "Analysis complete.",
      data: result,
    };
  } catch (error) {
    console.error("AI analysis failed:", error);
    return {
      success: false,
      message: "An error occurred during analysis. Please try again.",
    };
  }
}
