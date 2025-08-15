export class BookingCreatedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly customerId: string,
    public readonly vendorId: string,
    public readonly petId: string,
    public readonly petName: string,
    public readonly petType: string,
    public readonly serviceType: string,
    public readonly date: string,
    public readonly time: string,
    public readonly notes?: string,
  ) {}
}
