import { listCourses } from "@/lib/data/courses";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

export default async function MyCoursesPage() {
  const courses = await listCourses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">My Courses</h1>
        <p className="text-sm text-slate-500 mt-0.5">Courses you can promote</p>
      </div>

      {courses.length === 0 ? (
        <Card>
          <EmptyState title="No courses assigned yet" subtitle="Your manager will grant you access to courses" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <Card key={c.id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-slate-900">{c.name}</h3>
                  <Badge>{c.status}</Badge>
                </div>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{c.marketingDescription ?? c.description}</p>
                <div className="mt-3 text-sm font-medium text-slate-900">{formatCurrency(c.sellingPrice.toString())}</div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
