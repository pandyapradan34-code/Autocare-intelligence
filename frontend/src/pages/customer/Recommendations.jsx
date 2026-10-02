import PageHeader from "../../components/common/PageHeader";
import RecommendationCard from "../../components/recommendations/RecommendationCard";
import WarningCard from "../../components/recommendations/WarningCard";
import { recommendations } from "../../data/recommendationData";
import { earlyWarnings } from "../../data/warningData";

export default function Recommendations() {
  return (
    <div>
      <PageHeader
        title="Recommendations"
        description="Suggested actions based on current component health. Generated dynamically in a future phase."
      />

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {recommendations.map((r) => (
          <RecommendationCard key={r.id} recommendation={r} />
        ))}
      </div>

      <h2 className="mb-3 text-sm font-semibold text-slate-800">Early Warning Signals</h2>
      <div className="space-y-3">
        {earlyWarnings.map((w) => (
          <WarningCard key={w.id} warning={w} />
        ))}
      </div>
    </div>
  );
}
