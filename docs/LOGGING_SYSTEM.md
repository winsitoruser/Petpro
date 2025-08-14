# PetPro Logging System Documentation

## Overview

This document describes the centralized logging system implemented for the PetPro application. The system is built on the ELK stack (Elasticsearch, Logstash, and Kibana) and provides comprehensive logging capabilities including structured logging, log rotation, filtering, searching, and alerting.

## Architecture

The logging system consists of the following components:

1. **Backend Application Logging**:
   - Structured logging using Winston
   - Request tracking with unique IDs
   - Contextual metadata for each log entry

2. **ELK Stack**:
   - **Elasticsearch**: Database for storing and indexing logs
   - **Logstash**: Log processing pipeline
   - **Kibana**: Visualization and search interface

3. **Log Collection**:
   - Direct transport from application to Logstash/Elasticsearch
   - TCP and UDP inputs for application logs
   - Beats protocol for container logs

## Configuration

### Docker Services

The ELK stack is configured in `docker-compose.yml` with the following services:

- **Elasticsearch**: Stores all log data with proper indexing
- **Logstash**: Processes logs through configured pipelines
- **Kibana**: Provides a web interface for log analysis and visualization

### Backend Logger

The Node.js backend uses a structured logger (`src/config/logger.ts`) with the following features:

- Multiple transport options (console, file, Logstash, Elasticsearch)
- Log rotation for file-based logs
- Log levels (error, warn, info, http, debug)
- Structured JSON format with metadata

## Log Rotation

Log rotation is implemented at multiple levels:

1. **Application Level**:
   - Daily rotation of application logs using winston-daily-rotate-file
   - Configurable retention period (14 days for normal logs, 30 days for error logs)
   - Compressed archives of old logs

2. **Container Level**:
   - Docker's built-in log rotation (configured in docker-compose.yml)
   - Size-based rotation to prevent disk space issues

## Log Filtering and Search

### Logstash Filtering

Logs are processed by Logstash with the following filters:

- **Service Identification**: Logs are tagged with the originating service
- **Level Extraction**: Log levels are extracted for easier filtering
- **Context Enhancement**: Additional context like host IP and container ID is added
- **Alert Flagging**: Critical errors are flagged for alerting

### Kibana Search

Kibana provides powerful search capabilities:

- **Full-text Search**: Search across all log fields
- **Field-specific Filters**: Filter by service, log level, timestamp, etc.
- **Saved Searches**: Common search patterns can be saved for reuse
- **Dashboards**: Preconfigured dashboards for monitoring application health

## Alerting System

The alerting system is configured to detect and notify about critical issues:

1. **Critical Error Alerts**:
   - Triggered on any error or fatal level log entries
   - Email notifications to the operations team
   - Configurable thresholds and time windows

2. **High Error Rate Alerts**:
   - Monitors API endpoints for error response codes (5xx)
   - Alerts on abnormal error rates
   - Includes details about affected endpoints

## Usage Guidelines

### Viewing Logs

1. **Kibana Interface**:
   - Access at http://localhost:5601 in development
   - Navigate to "Discover" to search and filter logs
   - Use saved searches and dashboards for common scenarios

2. **Direct Log Files**:
   - Application logs are available in the backend container at `/app/logs/`
   - Log files follow the naming pattern `application-YYYY-MM-DD.log`
   - Error logs are in separate files named `error-YYYY-MM-DD.log`

### Adding Logs in Code

For backend developers, use the logger as follows:

```typescript
import logger from '../config/logger';

// Different log levels
logger.debug('Detailed debug information', { additionalContext: 'value' });
logger.info('Something notable happened', { userId: 123 });
logger.warn('Warning condition', { source: 'functionName' });
logger.error('Error condition', { error: err, requestData: data });

// Logs are automatically enriched with request ID and user context
// when using the requestTracker middleware
```

### Creating Custom Dashboards

1. Navigate to Kibana and select the "Dashboard" section
2. Click "Create dashboard"
3. Add visualizations for specific metrics or log patterns
4. Save and share with your team

## Troubleshooting

### Common Issues

1. **Missing Logs**:
   - Verify log levels are appropriate for your environment
   - Check Logstash is receiving logs (via Logstash status API)
   - Ensure Elasticsearch indices are created correctly

2. **Performance Issues**:
   - Adjust Elasticsearch JVM heap size in docker-compose.yml
   - Consider scaling Elasticsearch for larger deployments
   - Review log volume and adjust retention policies

3. **Alert Configuration**:
   - Alerts are defined in `kibana-alerts.ndjson`
   - Can be imported into Kibana via the Saved Objects UI
   - Email configuration requires proper SMTP settings

## Maintenance

### Index Management

Elasticsearch indices should be managed to prevent disk space issues:

- Use Index Lifecycle Management (ILM) for automatic rollover
- Configure index retention based on compliance requirements
- Set up snapshot backups for long-term storage

### Monitoring ELK Stack

Monitor the health of the ELK stack itself:

- Use the built-in monitoring in Kibana
- Check Elasticsearch cluster health via API
- Monitor disk usage and JVM heap usage

## Security Considerations

The current implementation includes basic security measures:

- No public exposure of Elasticsearch or Logstash ports in production
- Resource limits to prevent DoS situations
- Separate indices for different log types

For production, consider:

- Enabling X-Pack security features
- Configuring TLS for all communications
- Setting up role-based access control in Kibana
