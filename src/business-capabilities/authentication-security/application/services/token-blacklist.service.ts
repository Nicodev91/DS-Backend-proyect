import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenBlacklistService {
  context: string = TokenBlacklistService.name;
  private blacklistedTokens: Set<string> = new Set();

  /**
   * Adds a token to the blacklist
   * @param token JWT token to invalidate
   */
  addToBlacklist(token: string): void {
    this.blacklistedTokens.add(token);
  }

  /**
   * Checks if a token is in the blacklist
   * @param token JWT token to check
   * @returns true if the token is blacklisted
   */
  isBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  /**
   * Cleans expired tokens from the blacklist
   * In a real implementation, this would be done with a cron job
   */
  cleanExpiredTokens(): void {
    console.log(`Blacklist actual: ${this.blacklistedTokens.size} tokens`);
  }
}
