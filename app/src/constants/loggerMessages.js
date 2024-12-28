export const LOG_MESSAGES = {
    'SYSTEM': {
      'CYCLE_COMPLETE': "Daily Cycle Completed",
      'WAITING_NEXT_CYCLE': "Waiting 24 hours before next cycle...",
      'RETRY_WAIT': "Retrying in 1 hour...",
      'NO_ACCOUNTS': "No accounts found in data file",
      'NO_AI': "Failed to select initial AI"
    },
    'ACCOUNT': {
      'PROCESSING': _0x3c1f0b => "Processing Account: " + _0x3c1f0b,
      'FINISHED': _0xc9d543 => "Finished Processing Account: " + _0xc9d543,
      'LOGIN_FAILED': "Login failed",
      'AI_SELECT_FAILED': "Failed to select AI"
    },
    'CHAT': {
      'SELECTING_AI': "Selecting pre-chosen AI...",
      'CREATING_SESSION': "Creating new chat session...",
      'SESSION_CREATED': "Chat session created successfully!",
      'USING_EXISTING': "Using existing chat session."
    },
    'ERROR': {
      'MAIN_LOOP': _0x3ea339 => "Error in main loop: " + _0x3ea339,
      'ACCOUNT_PROCESSING': _0x116e5e => "Account processing error: " + _0x116e5e
    }
  };