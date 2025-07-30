import { UserManagementTable } from "@/components/user-management-table";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function UserManagementSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
    )
}

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Assign report access to users in your organization.
        </p>
      </div>
      <Suspense fallback={<UserManagementSkeleton />}>
        <UserManagementTable />
      </Suspense>
    </div>
  );
}
