/**
 * Pi Network Authentication Service
 * Handles Pi SDK initialization and authentication
 */
class PiAuthService {
  constructor() {
    this.pi = null;
    this.user = null;
    this.accessToken = null;
    this.isInitialized = false;
    this.isAuthenticated = false;
  }

  /**
   * Initialize Pi SDK
   */
  async init() {
    if (this.isInitialized) return this;

    try {
      // Check if Pi SDK is available
      if (typeof window.Pi === 'undefined') {
        throw new Error('Pi SDK not loaded. Please ensure pi-sdk.js is included.');
      }

      // Initialize Pi SDK - treat as Promise
      await window.Pi.init({ version: "2.0", sandbox: true }); // Set sandbox: false for production
      
      this.pi = window.Pi;
      this.isInitialized = true;
      console.log('Pi SDK initialized successfully');
      
      return this;
    } catch (error) {
      console.error('Pi SDK initialization failed:', error);
      throw error;
    }
  }

  /**
   * Authenticate user with Pi Network
   */
  async authenticate() {
    if (!this.isInitialized) {
      await this.init();
    }

    try {
      // Request authentication with username scope
      const authResult = await this.pi.authenticate(['username'], (error) => {
        if (error) {
          console.error('Pi authentication error:', error);
          throw error;
        }
      });

      if (authResult && authResult.accessToken) {
        this.accessToken = authResult.accessToken;
        this.user = {
          uid: authResult.user.uid,
          username: authResult.user.username,
          accessToken: authResult.accessToken
        };
        this.isAuthenticated = true;

        // Send token to backend for validation
        const validated = await this.validateWithBackend(this.accessToken);
        
        if (validated) {
          console.log('User authenticated:', this.user.username);
          return this.user;
        } else {
          throw new Error('Backend validation failed');
        }
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      this.isAuthenticated = false;
      this.user = null;
      this.accessToken = null;
      throw error;
    }
  }

  /**
   * Send access token to backend for validation
   */
  async validateWithBackend(accessToken) {
    try {
      const response = await fetch('/api/validate-pi-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken })
      });

      const data = await response.json();
      
      if (response.ok && data.valid) {
        // Update user info with backend-validated data
        this.user = {
          ...this.user,
          backendValidated: true,
          sessionId: data.sessionId
        };
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Backend validation error:', error);
      return false;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      // Call backend logout endpoint
      await fetch('/api/logout', { method: 'POST' });
      
      this.user = null;
      this.accessToken = null;
      this.isAuthenticated = false;
      console.log('User logged out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.user;
  }

  /**
   * Get authentication status
   */
  getAuthStatus() {
    return {
      isAuthenticated: this.isAuthenticated,
      user: this.user
    };
  }
}

// Create singleton instance
const piAuthService = new PiAuthService();
export default piAuthService;
