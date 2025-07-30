"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";

// Define the structure of a user object
export type User = {
    uid: string;
    email: string | null;
    roles: string[];
};

// Function to get all users from Firestore
export async function getUsers(): Promise<User[]> {
    const usersCollectionRef = collection(db, "users");
    const snapshot = await getDocs(usersCollectionRef);
    if (snapshot.empty) {
        return [];
    }
    // Manually map fields to avoid passing complex objects like Timestamps
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            uid: doc.id,
            email: data.email || null,
            roles: data.roles || [],
        };
    }) as User[];
}

const updateUserRolesSchema = z.object({
    uid: z.string().min(1, "User ID is required."),
    roles: z.array(z.string()),
});

export type UpdateUserRolesFormState = {
    success: boolean;
    message: string;
};

// Server action to update user roles
export async function updateUserRoles(
    prevState: UpdateUserRolesFormState,
    formData: FormData
): Promise<UpdateUserRolesFormState> {
    
    const uid = formData.get("uid") as string;
    const roles = formData.getAll("roles") as string[];

    const validatedFields = updateUserRolesSchema.safeParse({ uid, roles });

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Invalid form data.",
        };
    }

    try {
        const userRef = doc(db, "users", validatedFields.data.uid);
        await updateDoc(userRef, {
            roles: validatedFields.data.roles,
        });

        revalidatePath("/dashboard/users");
        return {
            success: true,
            message: "User roles updated successfully.",
        };
    } catch (error) {
        console.error("Error updating user roles:", error);
        return {
            success: false,
            message: "An error occurred while updating roles. Please try again.",
        };
    }
}
