import { orpc } from "@web/utils/orpc";
import { useStableQuery } from "@web/utils/use-stable-query";
export function useDashboard() {
    return useStableQuery(orpc.web.dashboard.queryOptions());
}
