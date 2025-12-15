/**
 * Workspace interface based on Clockify API response
 */
export interface Workspace {
  id: string;
  name: string;
  cakeOrganizationId?: string;
  imageUrl?: string;
  featureSubscriptionType?: string;
  features?: string[];
  workspaceSettings?: Record<string, unknown>;
  subdomain?: Record<string, unknown>;
  costRate?: {
    amount?: number;
    currency?: string;
  };
  hourlyRate?: {
    amount?: number;
    currency?: string;
  };
  currencies?: unknown[];
  memberships?: unknown[];
}

