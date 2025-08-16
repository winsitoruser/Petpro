export class PaymentCompletedEvent {
  constructor(
    public readonly paymentId: string,
    public readonly bookingId: string,
    public readonly customerId: string,
    public readonly vendorId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly transactionId: string,
    public readonly provider: string,
    public readonly timestamp: string = new Date().toISOString(),
  ) {}
}
