"use server";

import { z } from "zod";
import * as xlsx from "xlsx";
import { revalidatePath } from "next/cache";
import { collection, getDocs, writeBatch, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls",
  ".xlsx",
];

const schema = z.object({
  file: z
    .any()
    .refine((file) => file?.size > 0, "File is required.")
    .refine(
      (file) => file?.size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`
    )
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file?.type),
      "Only .xls and .xlsx files are accepted."
    ),
    sheetName: z.string().optional(),
});

export type FormState = {
  success: boolean;
  message: string;
};

async function clearCollection(collectionName: string): Promise<void> {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    if (snapshot.empty) {
        return;
    }
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}

function excelSerialDateToJSDate(serial: number) {
    if (typeof serial !== 'number' || isNaN(serial)) {
        return serial; // Return original value if not a valid number
    }
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);

    const fractional_day = serial - Math.floor(serial) + 0.0000001;

    let total_seconds = Math.floor(86400 * fractional_day);

    const seconds = total_seconds % 60;
    total_seconds -= seconds;

    const hours = Math.floor(total_seconds / (60 * 60));
    const minutes = Math.floor(total_seconds / 60) % 60;
    
    const date = new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = String(date.getFullYear()).slice(-2);

    return `${month}-${year}`;
}


export async function upload(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = schema.safeParse({
    file: formData.get("file"),
    sheetName: formData.get("sheetName")
  });

  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.flatten().fieldErrors.file;
    return {
      success: false,
      message: errorMessages?.join(", ") || "Invalid file.",
    };
  }

  const file = validatedFields.data.file as File;
  const sheetName = validatedFields.data.sheetName;

  try {
    const bytes = await file.arrayBuffer();
    const workbook = xlsx.read(bytes, { type: "buffer" });
    
    if (sheetName === 'Bids') {
        await clearCollection("bids");
        const bidsSheet = workbook.Sheets["Bids"];
        if (!bidsSheet) {
            return { success: false, message: "Sheet 'Bids' not found in the Excel file." };
        }
        const bidsData: any[] = xlsx.utils.sheet_to_json(bidsSheet, {
            header: ["month", "noOfBid", "goNoGo", "go", "noGo", "pqtqStage", "commercialFinalization", "bidSubmission", "pqtqEvaluation", "financialEvaluation", "won", "lost", "cancelled", "dropped", "techQualifiedPercent", "techQualifiedBids", "finQualifiedPercent", "finQualifiedBids", "quotedPrice", "openProspects", "wonValue", "lostValue", "poValue", "rr", "ms"],
            range: 1, // Skip header row
            raw: false, // This will format dates
        });
        
        const processedBidsData = bidsData.map(row => {
            if (row.month && typeof row.month === 'number' && row.month > 40000) {
                 row.month = excelSerialDateToJSDate(row.month);
            }
            return row;
        });

        const bidsDataWithId = processedBidsData.map((row, index) => ({ id: String(index + 1), ...row }));
        const batch = writeBatch(db);
        bidsDataWithId.forEach((item: any) => {
            const docRef = doc(db, "bids", item.id);
            batch.set(docRef, item);
        });
        await batch.commit();
        revalidatePath("/dashboard/presales", "layout");
        return { success: true, message: "Pre-Sales data successfully uploaded." };
    }


    // Clear existing data for CSD
    await clearCollection("calls");
    await clearCollection("inventory");

    const callsSheet = workbook.Sheets["Calls"];
    const inventorySheet = workbook.Sheets["Inventory"];

    if (!callsSheet) {
      return { success: false, message: "Sheet 'Calls' not found in the Excel file." };
    }
    if (!inventorySheet) {
        return { success: false, message: "Sheet 'Inventory' not found in the Excel file." };
    }

    const callsData = xlsx.utils.sheet_to_json(callsSheet, {
        header: ["month", "center", "scCode", "risk", "status", "totalCalls", "cancelledCalls"],
        range: 1, // Skip header row
      });
    const inventoryData = xlsx.utils.sheet_to_json(inventorySheet, {
        header: ["month", "center", "consumption", "available", "occupied", "inTransit"],
        range: 1, // Skip header row
      });

    // Add unique IDs
    const callsDataWithId = callsData.map((row, index) => ({ id: String(index + 1), ...row }));
    const inventoryDataWithId = inventoryData.map((row, index) => ({ id: String(index + 1), ...row }));
    
    const batch = writeBatch(db);

    callsDataWithId.forEach((item: any) => {
        const docRef = doc(db, "calls", item.id);
        batch.set(docRef, item);
    });

    inventoryDataWithId.forEach((item: any) => {
        const docRef = doc(db, "inventory", item.id);
        batch.set(docRef, item);
    });

    await batch.commit();
    
    revalidatePath("/dashboard", "layout");

    return {
      success: true,
      message: "Data successfully uploaded and stored in the database.",
    };
  } catch (error) {
    console.error("File processing failed:", error);
    return {
      success: false,
      message: "An error occurred during file processing. Please try again.",
    };
  }
}

export async function getCallsData() {
    try {
        const callsCollectionRef = collection(db, "calls");
        const snapshot = await getDocs(callsCollectionRef);
        if (snapshot.empty) {
            return null;
        }
        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error("Error fetching calls data:", error);
        return null;
    }
}

export async function getInventoryData() {
    try {
        const inventoryCollectionRef = collection(db, "inventory");
        const snapshot = await getDocs(inventoryCollectionRef);
        if (snapshot.empty) {
            return null;
        }
        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error("Error fetching inventory data:", error);
        return null;
    }
}

export async function getBidsData() {
    try {
        const bidsCollectionRef = collection(db, "bids");
        const snapshot = await getDocs(bidsCollectionRef);
        if (snapshot.empty) {
            return null;
        }
        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error("Error fetching bids data:", error);
        return null;
    }
}

    