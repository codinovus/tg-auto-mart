/**
 * All application enums in one centralized file
 */

/**
 * User roles within the system
 */
export enum Role {
    CUSTOMER = 'CUSTOMER',
    STORE_ADMIN = 'STORE_ADMIN',
    DEVELOPER = 'DEVELOPER'
  }

  /**
   * Status of a payment or transaction
   */
  export enum PaymentStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED'
  }

  /**
   * Types of transactions in the system
   */
  export enum TransactionType {
    DEPOSIT = 'DEPOSIT',
    PURCHASE = 'PURCHASE',
    REFUND = 'REFUND',
    REFERRAL_REWARD = 'REFERRAL_REWARD',
    ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT'
  }

  /**
   * Status of an order
   */
  export enum OrderStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
  }

  /**
   * Status of a dispute
   */
  export enum DisputeStatus {
    PENDING = 'PENDING',
    RESOLVED = 'RESOLVED',
    REJECTED = 'REJECTED'
  }

  /**
   * Payment methods available
   */
  export enum PaymentMethod {
    WALLET = 'WALLET',
    CRYPTO = 'CRYPTO'
  }

  /**
   * Types of cryptocurrencies supported
   */
  export enum CryptoType {
    BTC = 'BTC',
    ETH = 'ETH',
    USDT = 'USDT',
    USDC = 'USDC',
    BNB = 'BNB',
    XRP = 'XRP',
    SOL = 'SOL',
    ADA = 'ADA',
    DOGE = 'DOGE',
    DOT = 'DOT'
  }
