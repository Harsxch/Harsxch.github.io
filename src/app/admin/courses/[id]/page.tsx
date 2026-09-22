import { notFound } from "next/navigation";
import { getCourse } from "@/lib/data/courses";
import { listInfluencers } from "@/lib/data/influencers";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { AccessForm } from "./access-form";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [course, influencersResult] = await Promise.all([getCourse(id), listInfluencers({ pageSize: 100 })]);
  if (!course) notFound();

  const grantedIds = new Set(course.influencerAccess.map((a) => a.influencerId));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{course.name}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{course.category}</p>
        </div>
        <Badge>{course.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader title="Details" />
          <CardBody className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Original price</span>
              <span className="font-medium">{formatCurrency(course.originalPrice.toString())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Selling price</span>
              <span className="font-medium">{formatCurrency(course.sellingPrice.toString())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Default model</span>
              <span className="font-medium">{course.defaultModelType?.replaceAll("_", " ") ?? "—"}</span>
            </div>
            {course.description && <p className="text-slate-600 pt-2 border-t border-slate-100">{course.description}</p>}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Influencer access" subtitle="Which influencers can promote this course" />
          <CardBody>
            <AccessForm
              courseId={course.id}
              influencers={influencersResult.rows.map((i) => ({ id: i.id, name: i.name }))}
              grantedIds={[...grantedIds]}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
