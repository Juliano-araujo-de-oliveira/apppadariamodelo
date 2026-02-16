/**
 * Utility for logging errors securely and consistently.
 */
export const logError = (error, context = 'General', metadata = {}) => {
  const timestamp = new Date().toISOString();
  
  const errorLog = {
    timestamp,
    context,
    type: error?.name || 'Error',
    message: error?.message || (typeof error === 'string' ? error : 'Unknown error'),
    code: error?.code || 'UNKNOWN',
    status: error?.status || 'UNKNOWN',
    stack: error?.stack,
    metadata: {
      ...metadata,
      // Redact sensitive fields if they accidentally get passed
      password: metadata.password ? '[REDACTED]' : undefined,
      token: metadata.token ? '[REDACTED]' : undefined,
    }
  };

  console.group(`🚨 Error in ${context} at ${timestamp}`);
  console.error(errorLog.message);
  console.table({
    Type: errorLog.type,
    Code: errorLog.code,
    Status: errorLog.status,
    Context: errorLog.context
  });
  if (Object.keys(errorLog.metadata).length > 0) {
    console.log('Metadata:', errorLog.metadata);
  }
  if (errorLog.stack) {
    console.debug('Stack Trace:', errorLog.stack);
  }
  console.groupEnd();

  return errorLog;
};

export const logInfo = (message, context = 'General', data = {}) => {
  const timestamp = new Date().toISOString();
  console.group(`ℹ️ Info: ${context} at ${timestamp}`);
  console.log(message);
  if (Object.keys(data).length > 0) {
    console.log('Data:', data);
  }
  console.groupEnd();
};