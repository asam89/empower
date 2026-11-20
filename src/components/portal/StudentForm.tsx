import Link from "next/link";
import type { School, Student } from "@/lib/portal";
import { Card, inputClass, labelClass, secondaryButtonClass } from "@/components/portal/ui";
import { SubmitButton } from "@/components/portal/SubmitButton";

export function StudentForm({
  action,
  schools,
  student,
}: {
  action: (form: FormData) => Promise<void>;
  schools: School[];
  student?: Student;
}) {
  return (
    <Card className="max-w-[640px]">
      <form action={action} className="space-y-5">
        {student && <input type="hidden" name="student_id" value={student.id} />}
        <div className="grid grid-cols-[1fr_120px] gap-4">
          <div>
            <label htmlFor="first_name" className={labelClass}>
              First name <span className="text-brand-accent">*</span>
            </label>
            <input id="first_name" name="first_name" required maxLength={60} defaultValue={student?.first_name} className={inputClass} />
          </div>
          <div>
            <label htmlFor="last_initial" className={labelClass}>Last initial</label>
            <input id="last_initial" name="last_initial" maxLength={1} defaultValue={student?.last_initial ?? ""} className={inputClass} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="grade" className={labelClass}>Grade</label>
            <input id="grade" name="grade" maxLength={20} placeholder="e.g. 3 or JK" defaultValue={student?.grade ?? ""} className={inputClass} />
          </div>
          <div>
            <label htmlFor="school_id" className={labelClass}>School</label>
            <select id="school_id" name="school_id" defaultValue={student?.school_id ?? ""} className={inputClass}>
              <option value="">—</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="goals" className={labelClass}>Goals we&apos;re working on</label>
          <textarea
            id="goals"
            name="goals"
            rows={4}
            maxLength={2000}
            placeholder={"One per line, e.g.\nReads 20 sight words independently\nAsks for a break using words or a card"}
            defaultValue={student?.goals ?? ""}
            className={`${inputClass} resize-y`}
          />
          <p className="text-[0.75rem] text-slate mt-1">Families can see these goals.</p>
        </div>
        <p className="text-[0.78rem] text-slate bg-cloud border border-border rounded-xl px-4 py-3">
          🔒 Keep profiles light: first name and last initial only. Don&apos;t enter diagnoses, health details, OEN
          numbers, birthdates or addresses.
        </p>
        <div className="flex gap-3">
          <SubmitButton>{student ? "Save changes" : "Create profile"}</SubmitButton>
          <Link href={student ? `/portal/students/${student.id}` : "/portal"} className={secondaryButtonClass}>
            Cancel
          </Link>
        </div>
      </form>
    </Card>
  );
}
