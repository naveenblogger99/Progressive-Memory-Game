import { PiSdkBase } from '@pinetwork/pi-sdk-js';

const piSdkBase = new PiSdkBase();

piSdkBase.connect();  // establish the connection

/**
 * PiService handles all communication with the Pi Network.
 * This abstraction allows for easier testing and future feature expansion.
 */
class PiService {
  constructor() {
    this.client = new PiClient();
    this.user = null;
  }

  /**
   * Authenticates the user and requests specific data scopes.
   * @param {string[]} scopes - Defaults to ['username']
   */
  async login(scopes = ['username']) {
    try {
      // The helper handles window.Pi.authenticate internally
      const auth = await this.client.authenticate(scopes, this.onIncompletePaymentFound);

      this.user = auth.user;
      console.log(`Authenticated as ${this.user.username}`);

      return {
        success: true,
        accessToken: auth.accessToken,
        user: auth.user
      };
    } catch (error) {
      console.error("Authentication Error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Required callback for Pi SDK.
   * Handles payments that were interrupted before completion.
   */
  onIncompletePaymentFound(payment) {
    console.warn("Incomplete payment found:", payment.identifier);
    // Logic to resolve this on the backend should be added here.
  }


  async function handleLogin() {
  const result = await piService.login(['username', 'payments']);

  if (result.success) {
    document.getElementById('user-profile').innerText = `Hello, ${result.user.username}`;
  } else {
    alert("Could not sign in: " + result.error);
  }
}
}

export const piService = new PiService();
