// Simple i18n placeholder for compatibility
export default {
  __: (key: string) => {
    const messages: Record<string, string> = {
      'auth.unauthorized': 'Unauthorized access',
      'customer.notFound': 'Customer not found',
      'common.serverError': 'Internal server error',
      'customer.noFileUploaded': 'No file uploaded',
      'pet.notFound': 'Pet not found',
      'pet.deleted': 'Pet deleted successfully',
      'notifications.missingTokenInfo': 'Missing token information',
      'notifications.missingDeviceId': 'Missing device ID',
      'customer.missingVendorId': 'Missing vendor ID',
    };
    return messages[key] || key;
  }
};