import { listPlatforms } from "@/lib/data/influencers";
import { NewInfluencerForm } from "./form";

export default async function NewInfluencerPage() {
  const platforms = await listPlatforms();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Add Influencer</h1>
        <p className="text-sm text-slate-500 mt-0.5">Create a new influencer profile</p>
      </div>
      <NewInfluencerForm platforms={platforms.map((p) => ({ id: p.id, name: p.name }))} />
    </div>
  );
}
