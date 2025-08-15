import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check service health' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        service: { type: 'string', example: 'vendor-service' },
        timestamp: { type: 'string', example: '2023-08-15T12:34:56.789Z' },
      }
    }
  })
  checkHealth() {
    return {
      status: 'ok',
      service: 'vendor-service',
      timestamp: new Date().toISOString(),
    };
  }
}
