import { listCourses } from "@/lib/data/courses";
import { NewOrderForm } from "./form";

export default async function NewOrderPage() {
  const courses = await listCourses();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Record Sale</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manually record a completed sale. Attribution (influencer, coupon, tracking link) and earnings are
          calculated automatically.
        </p>
      </div>
      <NewOrderForm courses={courses.map((c) => ({ id: c.id, name: c.name, sellingPrice: c.sellingPrice.toString() }))} />
    </div>
  );
}
