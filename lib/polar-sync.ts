import prisma from "./db";
import { polarClient } from "./polar";
import { Logger } from "./logger";

/**
 * Polar customer synchronization utilities
 * Handles integration between Better Auth users and Polar customers
 */
export const polarSync = {
  /**
   * Link existing Polar customer to user account
   * @param userId - The user ID to link the customer to
   * @param polarCustomerId - The Polar customer ID
   * @returns Promise<boolean> - Success status
   */
  async linkCustomerToUser(userId: string, polarCustomerId: string): Promise<boolean> {
    try {
      // Update user with Polar customer ID
      await prisma.user.update({
        where: { id: userId },
        data: { polarCustomerId }
      });

      Logger.info("Successfully linked Polar customer to user", {
        userId,
        polarCustomerId
      });

      return true;
    } catch (error) {
      Logger.error("Failed to link Polar customer to user", {
        userId,
        polarCustomerId,
        error
      });
      return false;
    }
  },

  /**
   * Handle signup with existing Polar customer
   * Links an existing Polar customer to a newly created user account
   * @param email - The email address to look up the Polar customer
   * @param userId - The user ID to link the customer to
   * @returns Promise<{success: boolean, customerId?: string}> - Operation result
   */
  async handleExistingCustomer(email: string, userId: string): Promise<{
    success: boolean;
    customerId?: string;
  }> {
    try {
      Logger.info("Handling existing Polar customer for signup", { email, userId });

      // Get the existing Polar customer by email
      const customer = await this.getCustomerByEmail(email);

      if (!customer) {
        Logger.warn("No Polar customer found for email", { email });
        return { success: false };
      }

      // Link the customer to the user
      const linked = await this.linkCustomerToUser(userId, customer.id);

      if (linked) {
        return {
          success: true,
          customerId: customer.id
        };
      }

      return { success: false };
    } catch (error) {
      Logger.error("Error handling existing Polar customer", {
        email,
        userId,
        error
      });
      return { success: false };
    }
  },

  /**
   * Check if a Polar customer exists for the given email
   * @param email - The email address to check
   * @returns Promise<boolean> - Whether a customer exists
   */
  async customerExists(email: string): Promise<boolean> {
    try {
      const customer = await this.getCustomerByEmail(email);
      return !!customer;
    } catch (error) {
      Logger.error("Error checking Polar customer existence", { email, error });
      return false;
    }
  },

  /**
   * Get existing Polar customer by email
   * Uses the Polar SDK to fetch customer information
   * @param email - The email address to look up
   * @returns Promise<any | null> - Customer data or null if not found
   */
  async getCustomerByEmail(email: string): Promise<any | null> {
    try {
      Logger.info("Looking up Polar customer by email", { email });

      // Use Polar SDK to search for customers by email
      // Note: Polar SDK returns a PageIterator, we need to convert to array
      const customersResponse = await polarClient.customers.list({
        email: email,
        limit: 1
      });

      // Convert PageIterator to array to access items
      const customersArray = [];
      for await (const customer of customersResponse) {
        customersArray.push(customer);
      }

      if (customersArray.length > 0) {
        const customer = customersArray[0] as any; // Use any to avoid type issues for now
        Logger.info("Found Polar customer", {
          email,
          customerId: customer.id,
          externalId: customer.external_id || customer.externalId
        });
        return customer;
      }

      Logger.info("No Polar customer found for email", { email });
      return null;
    } catch (error) {
      Logger.error("Error getting Polar customer by email", { email, error });
      return null;
    }
  },

  /**
   * Create a new Polar customer for a user
   * @param user - User data for creating the customer
   * @returns Promise<{success: boolean, customerId?: string}> - Operation result
   */
  async createCustomerForUser(user: {
    id: string;
    email: string;
    name?: string;
  }): Promise<{success: boolean, customerId?: string}> {
    try {
      Logger.info("Creating new Polar customer for user", {
        userId: user.id,
        email: user.email
      });

      // Create customer in Polar
      const customer = await polarClient.customers.create({
        email: user.email,
        name: user.name || user.email,
        externalId: user.id // Use user ID as external ID for easy lookup
      });

      Logger.info("Successfully created Polar customer", {
        userId: user.id,
        customerId: customer.id
      });

      // Link the customer to the user
      await this.linkCustomerToUser(user.id, customer.id);

      return {
        success: true,
        customerId: customer.id
      };
    } catch (error) {
      Logger.error("Error creating Polar customer for user", {
        userId: user.id,
        email: user.email,
        error
      });
      return { success: false };
    }
  },

  /**
   * Get customer by external ID (user ID)
   * @param externalId - The external ID (user ID) to look up
   * @returns Promise<any | null> - Customer data or null if not found
   */
  async getCustomerByExternalId(externalId: string): Promise<any | null> {
    try {
      Logger.info("Looking up Polar customer by external ID", { externalId });

      const customer = await polarClient.customers.getExternal({
        externalId: externalId
      });

      Logger.info("Found Polar customer by external ID", {
        externalId,
        customerId: customer.id
      });

      return customer;
    } catch (error) {
      Logger.error("Error getting Polar customer by external ID", {
        externalId,
        error
      });
      return null;
    }
  }
};
