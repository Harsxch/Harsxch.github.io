import Link from "next/link";
import { listCourses } from "@/lib/data/courses";
import { Card } from "@/components/ui/card";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { Plus } from "lucide-react";

export default async function CoursesPage() {
  const courses = await listCourses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Courses</h1>
          <p className="text-sm text-slate-500 mt-0.5">{courses.length} total</p>
        </div>
        <Link href="/admin/courses/new">
          <Button>
            <Plus className="w-4 h-4" /> Add Course
          </Button>
        </Link>
      </div>

      <Card>
        {courses.length === 0 ? (
          <EmptyState title="No courses yet" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Category</Th>
                <Th align="right">Price</Th>
                <Th>Default Model</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <tbody>
              {courses.map((c) => (
                <Tr key={c.id}>
                  <Td>
                    <Link href={`/admin/courses/${c.id}`} className="font-medium text-slate-900 hover:underline">
                      {c.name}
                    </Link>
                  </Td>
                  <Td>{c.category ?? "—"}</Td>
                  <Td align="right">{formatCurrency(c.sellingPrice.toString())}</Td>
                  <Td>{c.defaultModelType?.replaceAll("_", " ") ?? "—"}</Td>
                  <Td>
                    <Badge>{c.status}</Badge>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
