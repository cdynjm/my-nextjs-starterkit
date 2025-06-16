"use client";

import { useSession } from "next-auth/react";
import { usePageTitle } from "@/components/PageTitleContext";
import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { getGraphQLClient } from "@/lib/graphql-client";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { SkeletonLoader } from "@/components/SkeletonLoader";

export default function UsersPage() {
  const { data: session } = useSession();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Users");
    return () => setTitle("");
  }, [setTitle]);

  const graphQLClient = getGraphQLClient("/api/admin/graphql", session?.token);

  const fetchUsers = async (): Promise<User[]> => {
    const data = await graphQLClient.request<{ users: User[] }>(`
      query {
        users {
          encrypted_id
          name
          email
        }
      }
    `);
    return data.users;
  };

  const {
    data: users,
    isPending,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  return (
    <section className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h6 className="font-bold">List of Users</h6>
        <Button className="text-xs">
          <Plus /> Add
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            <>
              <TableRow>
                <TableCell colSpan={5}>
                  {" "}
                  <SkeletonLoader />
                </TableCell>
              </TableRow>
            </>
          ) : (
            <>
              {users?.map((user, index) => (
                <TableRow key={user.encrypted_id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-right"></TableCell>
                </TableRow>
              ))}
            </>
          )}
        </TableBody>
      </Table>
    </section>
  );
}
