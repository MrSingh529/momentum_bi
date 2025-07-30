"use client";

import { useState, useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { User, updateUserRoles, UpdateUserRolesFormState } from "@/app/actions/users";
import { useToast } from "@/hooks/use-toast";
import { Loader, Edit } from "lucide-react";

const availableRoles = ["csd", "presales"];

const initialState: UpdateUserRolesFormState = {
    success: false,
    message: "",
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? (
                <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
            ) : "Save Changes" }
        </Button>
    )
}

export function EditUserDialog({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(updateUserRoles, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
        if (state.success) {
            toast({
                title: "Success",
                description: state.message,
            });
            setOpen(false); // Close dialog on success
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: state.message,
            });
        }
    }
  }, [state, toast])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={user.roles.includes('admin')}>
          <Edit className="h-4 w-4 mr-2" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User Roles</DialogTitle>
          <DialogDescription>
            Assign report access for <span className="font-semibold">{user.email}</span>.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction}>
            <input type="hidden" name="uid" value={user.uid} />
            <div className="grid gap-4 py-4">
                <p className="text-sm font-medium">Report Access</p>
                <div className="space-y-2">
                    {availableRoles.map(role => (
                        <div key={role} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`${user.uid}-${role}`} 
                                name="roles"
                                value={role}
                                defaultChecked={user.roles.includes(role)}
                            />
                            <Label htmlFor={`${user.uid}-${role}`} className="capitalize">{role} Report</Label>
                        </div>
                    ))}
                </div>
            </div>

            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <SubmitButton />
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
