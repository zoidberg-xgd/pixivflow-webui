/**
 * @deprecated This file is kept for backward compatibility.
 * Please use the new API structure from './api/index' instead.
 * 
 * This file now re-exports everything from './api/index' to maintain
 * backward compatibility while using the refactored API structure.
 * 
 * The API has been refactored into separate service modules:
 * - authApi: Authentication related APIs
 * - configApi: Configuration related APIs
 * - downloadApi: Download related APIs
 * - filesApi: File management APIs
 * - logsApi: Logs APIs
 * - statsApi: Statistics APIs
 * 
 * The old `api` object is still available for backward compatibility,
 * but new code should use the individual API services.
 */

// Re-export everything from the new API structure
export * from './api/index';
