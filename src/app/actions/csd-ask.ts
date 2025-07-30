"use server";

import { z } from "zod";
import {
    askAboutCsd,
    AskAboutCsdInput,
    AskAboutCsdOutput,
} from "@/ai/flows/ask-about-csd";

const schema = z.object({
  question: z.string().min(1, "Question is required."),
  callsData: z.string().min(1, "Calls data is required."),
  inventoryData: z.string().min(1, "Inventory data is required."),
});

export type FormState = {
  success: boolean;
  message: string;
  question?: string;
  data?: AskAboutCsdOutput;
};

export async function csdAsk(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = schema.safeParse({
    question: formData.get("question"),
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
    const result = await askAboutCsd(
      validatedFields.data as AskAboutCsdInput
    );
    return {
      success: true,
      message: "Analysis complete.",
      question: validatedFields.data.question,
      data: result,
    };
  } catch (error) {
    console.error("AI analysis failed:", error);
    return {
      success: false,
      message: "An error occurred during AI analysis. Please try again.",
    };
  }
}
