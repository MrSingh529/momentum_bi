"use server";

import { z } from "zod";
import {
  askAboutBids,
  AskAboutBidsInput,
  AskAboutBidsOutput,
} from "@/ai/flows/ask-about-bids";

const schema = z.object({
  question: z.string().min(1, "Question is required."),
  bidsData: z.string().min(1, "Bids data is required."),
});

export type FormState = {
  success: boolean;
  message: string;
  question?: string;
  data?: AskAboutBidsOutput;
};

export async function ask(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = schema.safeParse({
    question: formData.get("question"),
    bidsData: formData.get("bidsData"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid form data. Please check your inputs.",
    };
  }

  try {
    const result = await askAboutBids(
      validatedFields.data as AskAboutBidsInput
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
