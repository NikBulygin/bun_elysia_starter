/**
 * Base abstract class for all providers
 */
export abstract class Provider {
  protected credentials: Record<string, unknown>;

  constructor(credentials: Record<string, unknown>) {
    this.credentials = credentials;
  }

  /**
   * Validate connection to the provider
   * Must be implemented by each provider
   */
  abstract validateConnection(): Promise<boolean>;
}

