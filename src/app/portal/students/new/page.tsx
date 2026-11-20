import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { listSchools } from "@/lib/portal";
import { createStudent } from "@/app/portal/actions";
import { Flash, PageTitle } from "@/components/portal/ui";
import { StudentForm } from "@/components/portal/StudentForm";

export const runtime = "edge";
export const metadata: Metadata = { title: "Add student — Empower" };

export default async function NewStudentPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireUser(["admin", "teacher"]);
  const { error } = await searchParams;
  return (
    <>
      <Flash error={error} />
      <PageTitle title="Add a student" subtitle="You'll be assigned as their teacher automatically." />
      <StudentForm action={createStudent} schools={await listSchools()} />
    </>
  );
}
