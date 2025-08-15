import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaProducerService {
  private readonly logger = new Logger(KafkaProducerService.name);

  constructor(
    @Inject('BOOKING_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    // Pre-register topics
    const topics = [
      'booking.created',
      'booking.updated',
      'booking.cancelled',
      'booking.completed',
      'service.created',
      'service.updated',
      'service.deleted',
      'pet.created',
      'pet.updated',
      'pet.deleted',
    ];
    
    topics.forEach(topic => {
      this.kafkaClient.subscribeToResponseOf(topic);
    });
    
    await this.kafkaClient.connect();
    this.logger.log('Kafka producer connected successfully');
  }

  async emitBookingCreated(booking: any): Promise<void> {
    this.logger.log(`Emitting booking.created event for booking ID: ${booking.id}`);
    return this.emit('booking.created', booking);
  }

  async emitBookingUpdated(booking: any): Promise<void> {
    this.logger.log(`Emitting booking.updated event for booking ID: ${booking.id}`);
    return this.emit('booking.updated', booking);
  }

  async emitBookingCancelled(booking: any): Promise<void> {
    this.logger.log(`Emitting booking.cancelled event for booking ID: ${booking.id}`);
    return this.emit('booking.cancelled', booking);
  }

  async emitBookingCompleted(booking: any): Promise<void> {
    this.logger.log(`Emitting booking.completed event for booking ID: ${booking.id}`);
    return this.emit('booking.completed', booking);
  }

  async emitServiceCreated(service: any): Promise<void> {
    this.logger.log(`Emitting service.created event for service ID: ${service.id}`);
    return this.emit('service.created', service);
  }

  async emitServiceUpdated(service: any): Promise<void> {
    this.logger.log(`Emitting service.updated event for service ID: ${service.id}`);
    return this.emit('service.updated', service);
  }

  async emitServiceDeleted(serviceId: string): Promise<void> {
    this.logger.log(`Emitting service.deleted event for service ID: ${serviceId}`);
    return this.emit('service.deleted', { id: serviceId });
  }

  async emitPetCreated(pet: any): Promise<void> {
    this.logger.log(`Emitting pet.created event for pet ID: ${pet.id}`);
    return this.emit('pet.created', pet);
  }

  async emitPetUpdated(pet: any): Promise<void> {
    this.logger.log(`Emitting pet.updated event for pet ID: ${pet.id}`);
    return this.emit('pet.updated', pet);
  }

  async emitPetDeleted(petId: string): Promise<void> {
    this.logger.log(`Emitting pet.deleted event for pet ID: ${petId}`);
    return this.emit('pet.deleted', { id: petId });
  }

  private emit(topic: string, data: any): Promise<void> {
    try {
      // Add metadata to the event
      const event = {
        ...data,
        metadata: {
          timestamp: new Date().toISOString(),
          service: 'booking-service',
        },
      };

      return new Promise((resolve, reject) => {
        this.kafkaClient
          .emit(topic, event)
          .subscribe({
            next: () => {
              this.logger.debug(`Event emitted successfully to topic: ${topic}`);
              resolve();
            },
            error: (error) => {
              this.logger.error(`Failed to emit event to topic ${topic}: ${error}`);
              reject(error);
            },
          });
      });
    } catch (error) {
      this.logger.error(`Error emitting to Kafka topic ${topic}: ${error.message}`);
      throw error;
    }
  }
}
