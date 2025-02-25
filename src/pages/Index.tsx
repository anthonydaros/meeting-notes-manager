
import { AppLayout } from "@/components/layout/app-layout";

const Index = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage your meetings and action plans
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Stats cards will go here */}
          <div className="rounded-lg border bg-card p-6 animate-slideUp">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Total Meetings
              </p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6 animate-slideUp">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Active Action Plans
              </p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6 animate-slideUp">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Completed Actions
              </p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6 animate-slideUp">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Overdue Actions
              </p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
