export class BookingStatusUpdatedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly customerId: string,
    public readonly vendorId: string,
    public readonly serviceType: string,
    public readonly date: string,
    public readonly time: string,
    public readonly previousStatus: string,
    public readonly newStatus: string,
    public readonly updatedBy: 'vendor' | 'customer' | 'system',
    public readonly notes?: string,
  ) {}
}
