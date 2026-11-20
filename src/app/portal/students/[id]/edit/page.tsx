import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { canEdit, getStudent, listSchools, studentAccess, studentName } from "@/lib/portal";
import { setStudentArchived, updateStudent } from "@/app/portal/actions";
import { Card, Flash, PageTitle, secondaryButtonClass } from "@/components/portal/ui";
import { StudentForm } from "@/components/portal/StudentForm";
import { SubmitButton } from "@/components/portal/SubmitButton";

export const runtime = "edge";
export const metadata: Metadata = { title: "Edit student — Empower" };

export default async function EditStudentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser(["admin", "teacher"]);
  const id = Number((await params).id);
  const { error } = await searchParams;
  if (!Number.isInteger(id) || !canEdit(await studentAccess(user, id))) notFound();
  const student = await getStudent(id);
  if (!student) notFound();

  return (
    <>
      <Flash error={error} />
      <PageTitle title={`Edit ${studentName(student)}`} />
      <StudentForm action={updateStudent} schools={await listSchools()} student={student} />
      <Card className="max-w-[640px] mt-6">
        <h2 className="font-bold text-ink">{student.archived ? "Restore profile" : "Archive profile"}</h2>
        <p className="text-slate text-[0.85rem] mt-1 mb-4">
          {student.archived
            ? "Restoring makes the profile visible to staff and family again."
            : "Archiving hides the profile from families and the student list. Updates are kept and it can be restored."}
        </p>
        <form action={setStudentArchived}>
          <input type="hidden" name="student_id" value={student.id} />
          <input type="hidden" name="archived" value={student.archived ? "0" : "1"} />
          <SubmitButton
            className={secondaryButtonClass}
            confirm={student.archived ? undefined : `Archive ${studentName(student)}'s profile?`}
          >
            {student.archived ? "Restore" : "Archive"}
          </SubmitButton>
        </form>
      </Card>
    </>
  );
}
