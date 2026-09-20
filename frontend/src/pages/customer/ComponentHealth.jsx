import PageHeader from "../../components/common/PageHeader";
import ComponentHealthCard from "../../components/health/ComponentHealthCard";
import { componentHealth } from "../../data/componentHealthData";

export default function ComponentHealth() {
  return (
    <div>
      <PageHeader
        title="Component Health"
        description="Individual health status for every major component of your vehicle."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {componentHealth.map((c) => (
          <ComponentHealthCard key={c.id} component={c} />
        ))}
      </div>
    </div>
  );
}
