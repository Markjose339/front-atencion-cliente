import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { customerServiceTimelinesQuerySchema } from "@/lib/schemas/customer-service.schema";
import { CustomerServiceTimelinesResponse } from "@/types/customer-service";
import { UseQuery } from "@/types/use-query";

type CustomerServiceTimelinesQueryParams = UseQuery & {
  branchId?: string;
};

export function useCustomerServiceTimelinesQuery({
  page,
  limit,
  search,
  branchId,
}: CustomerServiceTimelinesQueryParams) {
  const findCustomerServiceTimelines = useQuery({
    queryKey: ["customer-service", "timelines", page, limit, search, branchId],
    queryFn: async () => {
      const payload = customerServiceTimelinesQuerySchema.parse({
        page,
        limit,
        search: search || undefined,
        branchId: branchId || undefined,
      });

      const params = new URLSearchParams({
        page: payload.page.toString(),
        limit: payload.limit.toString(),
      });

      if (payload.search) {
        params.set("search", payload.search);
      }

      if (payload.branchId) {
        params.set("branchId", payload.branchId);
      }

      return api.get<CustomerServiceTimelinesResponse>(
        `/customer-service/timelines?${params.toString()}`,
      );
    },
    staleTime: 30_000,
  });

  return { findCustomerServiceTimelines };
}
