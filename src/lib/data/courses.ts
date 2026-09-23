import "server-only";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { assertCan } from "@/lib/auth/rbac";
import type { AgreementModelType, CourseStatus } from "@/generated/prisma/enums";

export async function listCourses(params: { status?: CourseStatus; search?: string } = {}) {
  const session = await requireSession();
  assertCan(session.user.role, "courses", "read");

  const where = {
    ...(params.status ? { status: params.status } : {}),
    ...(params.search ? { name: { contains: params.search, mode: "insensitive" as const } } : {}),
  };

  // INFLUENCER role only sees courses they've been granted access to.
  if (session.user.role === "INFLUENCER" && session.user.influencerId) {
    return prisma.course.findMany({
      where: { ...where, influencerAccess: { some: { influencerId: session.user.influencerId } } },
      orderBy: { createdAt: "desc" },
    });
  }

  return prisma.course.findMany({ where, orderBy: { createdAt: "desc" } });
}

export async function getCourse(courseId: string) {
  const session = await requireSession();
  assertCan(session.user.role, "courses", "read");
  return prisma.course.findUnique({
    where: { id: courseId },
    include: { influencerAccess: { include: { influencer: true } } },
  });
}

export async function createCourse(
  input: {
    name: string;
    slug: string;
    description?: string;
    courseUrl: string;
    originalPrice: number;
    sellingPrice: number;
    thumbnailUrl?: string;
    category?: string;
    status?: CourseStatus;
    defaultModelType?: AgreementModelType;
    marketingDescription?: string;
    sellingPoints?: string[];
    faqs?: { q: string; a: string }[];
  },
  actor: { id: string; email: string }
) {
  const session = await requireSession();
  assertCan(session.user.role, "courses", "write");

  const course = await prisma.course.create({ data: input });

  await prisma.auditLog.create({
    data: {
      userId: actor.id,
      userEmail: actor.email,
      action: "COURSE_CREATED",
      entityType: "Course",
      entityId: course.id,
      newValue: { name: input.name, slug: input.slug },
    },
  });

  return course;
}

export async function setCourseInfluencerAccess(
  courseId: string,
  influencerIds: string[],
  actor: { id: string; email: string }
) {
  const session = await requireSession();
  assertCan(session.user.role, "courses", "write");

  await prisma.$transaction(async (tx) => {
    await tx.courseInfluencer.deleteMany({ where: { courseId } });
    if (influencerIds.length > 0) {
      await tx.courseInfluencer.createMany({
        data: influencerIds.map((influencerId) => ({ courseId, influencerId })),
      });
    }
    await tx.auditLog.create({
      data: {
        userId: actor.id,
        userEmail: actor.email,
        action: "COURSE_ACCESS_UPDATED",
        entityType: "Course",
        entityId: courseId,
        newValue: { influencerIds },
      },
    });
  });
}
