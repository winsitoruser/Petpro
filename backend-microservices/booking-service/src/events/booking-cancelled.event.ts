export class BookingCancelledEvent {
  constructor(
    public readonly bookingId: string,
    public readonly customerId: string,
    public readonly vendorId: string,
    public readonly serviceType: string,
    public readonly date: string,
    public readonly time: string,
    public readonly cancelledBy: 'customer' | 'vendor' | 'system',
    public readonly cancellationReason?: string,
  ) {}
}
