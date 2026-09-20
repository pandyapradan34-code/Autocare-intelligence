import PageHeader from "../../components/common/PageHeader";
import RecommendationCard from "../../components/recommendations/RecommendationCard";
import WarningCard from "../../components/recommendations/WarningCard";
import { recommendations } from "../../data/recommendationData";
import { earlyWarnings } from "../../data/warningData";
import { staggerDelay } from "../../utils/motion";
import { Wrench, ShieldAlert } from "lucide-react";

export default function Recommendations() {
  return (
    <div>
      <PageHeader
        title="Recommendations & Risk Assessment"
        description="Dynamic care recommendations and pattern risk signals prioritized by component condition."
      />

      {/* Maintenance Recommendations Section */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Wrench size={16} />
          </div>
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
            Maintenance Recommendations
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {recommendations.map((r, i) => (
            <div key={r.id} className="animate-fade-in-up" style={staggerDelay(i, 70)}>
              <RecommendationCard recommendation={r} />
            </div>
          ))}
        </div>
      </div>

      {/* Early Warning Signals Section */}
      <div className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <ShieldAlert size={16} />
          </div>
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
            Early Warning Signals & Risk Patterns
          </h2>
        </div>

        <div className="space-y-4">
          {earlyWarnings.map((w, i) => (
            <div key={w.id} className="animate-fade-in-up" style={staggerDelay(i + recommendations.length, 70)}>
              <WarningCard warning={w} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
