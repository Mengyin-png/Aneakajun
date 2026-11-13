"use server";

import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { buildSubmissionSchema, parseOptions, parseValidation, type FieldDef } from "@/lib/forms/schema";
import { isLocale } from "@/lib/i18n/config";
import { localizedField } from "@/lib/i18n/localize";
import { zodErrors, type ActionResult } from "@/lib/validation/content";

const MAX_PER_HOUR = 5;

/**
 * Member submits a journey form. Requires a signed-in session; validated on the
 * server against the form's current fields; saved as PENDING for staff review.
 */
export async function submitJourneyForm(input: {
  formId: string;
  values: Record<string, unknown>;
  locale: string;
  /** Honeypot: real users never fill this hidden field. */
  website?: string;
}): Promise<ActionResult<{ id: string }>> {
  const locale = isLocale(input.locale) ? input.locale : "en";
  const km = locale === "km";
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: km ? "សូមចូលគណនីជាមុនសិន។" : "Please sign in to submit this form." };
  if (input.website) return { ok: true, data: { id: "ok" } }; // silently drop bots

  const form = await prisma.journeyForm.findFirst({
    where: { id: String(input.formId), isActive: true },
    include: { fields: { orderBy: { sortOrder: "asc" } }, journey: { select: { id: true, isEnabled: true } } },
  });
  if (!form || (form.journey && !form.journey.isEnabled))
    return { ok: false, message: km ? "ទម្រង់នេះមិនមានទៀតទេ។" : "This form is no longer available." };

  const recent = await prisma.formSubmission.count({
    where: { userId: user.id, createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) } },
  });
  if (recent >= MAX_PER_HOUR)
    return {
      ok: false,
      message: km
        ? "អ្នកបានផ្ញើសំណើច្រើនពេក។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។"
        : "You've sent several requests recently. Please try again later.",
    };

  const defs: FieldDef[] = form.fields.map((f) => ({
    key: f.key,
    type: f.type,
    required: f.required,
    label: localizedField(f.label, f.labelKm, locale) ?? f.label,
    options: parseOptions(f.options),
    validation: parseValidation(f.validation),
  }));
  const values = input.values && typeof input.values === "object" ? input.values : {};
  const parsed = buildSubmissionSchema(defs).safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      message: km ? "សូមកែតម្រូវវាលដែលបានបង្ហាញ។" : "Please fix the highlighted fields.",
      errors: zodErrors(parsed.error),
    };
  }
  const data = parsed.data as Record<string, unknown>;

  const submission = await prisma.formSubmission.create({
    data: {
      formId: form.id,
      journeyId: form.journeyId,
      userId: user.id,
      locale,
      answers: {
        create: form.fields
          .filter((f) => data[f.key] !== undefined)
          .map((f) => ({ fieldId: f.id, fieldKey: f.key, fieldLabel: f.label, value: data[f.key] as never })),
      },
      history: { create: { toStatus: "PENDING", actorId: user.id, note: "Submitted" } },
    },
    select: { id: true },
  });
  return { ok: true, data: submission };
}
