import { getAuthServerSession } from "@/src/server/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthServerSession();

  if (!session || session.user.role !== "ADMIN") {
    throw redirect("/");
  }

  return <div>{children}</div>;
}