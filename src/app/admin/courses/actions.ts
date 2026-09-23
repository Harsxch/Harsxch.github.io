"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { createCourse, setCourseInfluencerAccess } from "@/lib/data/courses";
import type { AgreementModelType, CourseStatus } from "@/generated/prisma/enums";

export async function createCourseAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const session = await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  const courseUrl = String(formData.get("courseUrl") ?? "").trim();
  const originalPrice = Number(formData.get("originalPrice") ?? 0);
  const sellingPrice = Number(formData.get("sellingPrice") ?? 0);

  if (!name || !slug || !courseUrl || !originalPrice) {
    return { error: "Name, slug, URL and price are required" };
  }

  let courseId: string;
  try {
    const course = await createCourse(
      {
        name,
        slug,
        courseUrl,
        originalPrice,
        sellingPrice: sellingPrice || originalPrice,
        description: str(formData.get("description")),
        category: str(formData.get("category")),
        thumbnailUrl: str(formData.get("thumbnailUrl")),
        status: (formData.get("status") as CourseStatus) || "ACTIVE",
        defaultModelType: (formData.get("defaultModelType") as AgreementModelType) || undefined,
        marketingDescription: str(formData.get("marketingDescription")),
      },
      { id: session.user.id, email: session.user.email }
    );
    courseId = course.id;
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return { error: "A course with this slug already exists" };
    }
    throw err;
  }

  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${courseId}`);
}

export async function setCourseAccessAction(courseId: string, influencerIds: string[]) {
  const session = await requireSession();
  await setCourseInfluencerAccess(courseId, influencerIds, { id: session.user.id, email: session.user.email });
  revalidatePath(`/admin/courses/${courseId}`);
}

function str(v: FormDataEntryValue | null): string | undefined {
  const s = v ? String(v).trim() : "";
  return s.length > 0 ? s : undefined;
}
