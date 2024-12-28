import _0x4af6d8 from 'axios';
import _0x3c33ca from 'fs/promises';
import _0x3048fc from 'groq-sdk';
import _0x14bee6 from 'inquirer';
import '../config/colors.js';
import { displayBanner } from './src/utils/helper.js';
import { CountdownTimer } from './src/utils/countdown.js';
import { logger } from './src/utils/logger.js';
import { LOG_MESSAGES } from './src/constants/loggerMessages.js';

const CONFIG = {
  'VCHARS': {
    'BASE_URL': "https://app.vchars.ai",
    'API_URL': 'https://vchars.onlyailabs.dev/api/v1',
    'ENDPOINTS': {
      'AUTH': "/auth/user",
      'WAIFU': "/waifu",
      'WAIFU_DETAIL': "/waifu/slug",
      'CHAT': "/chat",
      'MESSAGE': "/messages/text"
    },
    'HEADERS': {
      'Accept': "*/*",
      'Accept-Encoding': "gzip, deflate, br, zstd",
      'Accept-Language': "en-US,en;q=0.9",
      'Cache-Control': "no-cache",
      'Content-Type': "application/json",
      'Origin': "https://app.vchars.ai",
      'Pragma': "no-cache",
      'Referer': "https://app.vchars.ai/chats",
      'Sec-Ch-Ua': "\"Microsoft Edge\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
      'Sec-Ch-Ua-Mobile': '70',
      'Sec-Ch-Ua-Platform': "Windows",
      'Sec-Fetch-Dest': "empty",
      'Sec-Fetch-Mode': "cors",
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      'Sentry-Trace': '',
      'auth_date': '',
      'chat_instance': '',
      'chat_type': 'channel',
      'signature': '',
      'hash': ''
    }
  },
  'GROQ': {
    'MODEL': "llama3-8b-8192",
    'DEFAULT_PARAMS': {
      'temperature': 0.7,
      'max_tokens': 0x96
    }
  },
  'CHAT': {
    'DELAY_BETWEEN_MESSAGES': 0x7d0,
    'DEFAULT_CHARACTER': "behind-the-glas",
    'HISTORY_FILE': "chat_history.json",
    'USER_DATA_FILE': 'data.txt'
  },
  'USER': {
    'DEFAULT_LANGUAGE': 'en',
    'DEFAULT_GENDER': "non_binary",
    'DEFAULT_PREFERENCES': "all",
    'DEFAULT_START_CODE': "marine_6944804952"
  }
};

let selectedAISlug = null;
let selectedAIInfo = null;
let groqApiKey = null;

async function getGroqApiKey() {
  const { apiKey } = await _0x14bee6.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: 'Please enter your Groq API Key:',
      validate: input => input.length > 0 || 'API Key is required'
    }
  ]);
  return apiKey;
}

class AIChat {
  constructor() {
    this.userData = null;
    this.selectedAI = null;
    this.chatId = null;
    this.chatHistory = [];
    this.userDataString = null;
    this.groq = new _0x3048fc({
      apiKey: groqApiKey
    });
    this.axiosConfig = {
      headers: CONFIG.VCHARS.HEADERS
    };
  }

  async ['getGroqResponse'](_0x26e2e6, _0x272d63) {
    try {
      const _0x5bd38a = "You are having a conversation with an AI character. \n      The character's context is: " + _0x272d63 + "\n      The AI just said: \"" + _0x26e2e6 + "\"\n      Generate a natural and engaging response that continues the conversation.\n      Keep the response concise but contextual.";
      const _0x35f65e = await this.groq.chat.completions.create({
        'messages': [{
          'role': "user",
          'content': _0x5bd38a
        }],
        'model': CONFIG.GROQ.MODEL,
        ...CONFIG.GROQ.DEFAULT_PARAMS
      });
      return _0x35f65e.choices[0x0]?.["message"]?.["content"] || null;
    } catch (_0x218c0d) {
      logger.error(LOG_MESSAGES.ERROR.MAIN_LOOP("Groq API error: " + _0x218c0d.message));
      return null;
    }
  }

  async ["autoChatWithGroq"](_0x249045) {
    if (!this.selectedAI && !this.chatId) {
      throw new Error(LOG_MESSAGES.ACCOUNT.AI_SELECT_FAILED);
    }
    const _0x14ba70 = this.selectedAI ? this.selectedAI.title + ": " + this.selectedAI.description : "Continuing existing conversation";
    let _0x5bd2fb = _0x249045;
    let _0x22fe3e = 0x1;
    while (true) {
      try {
        logger.info('[' + this.userData.first_name + "]: " + _0x5bd2fb);
        const _0x3401e8 = await this.sendMessage(_0x5bd2fb);
        if (!_0x3401e8) {
          logger.warn("=== Chat ended: Out of gems ===");
          break;
        }
        logger.info('[' + this.selectedAI.title + "]: " + _0x3401e8);
        const _0x340868 = await this.getGroqResponse(_0x3401e8, _0x14ba70);
        if (!_0x340868) {
          break;
        }
        _0x5bd2fb = _0x340868;
        _0x22fe3e++;
      } catch (_0x44eaba) {
        if (_0x44eaba.response?.["data"]?.["detail"]?.['includes']("don't have enough gems")) {
          logger.warn("=== Chat ended: Out of gems ===");
          break;
        }
        break;
      }
    }
    return this.chatHistory;
  }

  async ['selectAI'](_0x5e67a3 = CONFIG.CHAT.DEFAULT_CHARACTER) {
    try {
      const _0x4fbb97 = '' + CONFIG.VCHARS.API_URL + CONFIG.VCHARS.ENDPOINTS.WAIFU_DETAIL + '/' + _0x5e67a3;
      const _0x5b8927 = await _0x4af6d8.get(_0x4fbb97, this.axiosConfig);
      if (_0x5b8927.data.message === "Data got correctly") {
        this.selectedAI = _0x5b8927.data.data;
        return true;
      }
      return false;
    } catch (_0x53fa85) {
      logger.error(LOG_MESSAGES.ERROR.ACCOUNT_PROCESSING("Select AI error: " + _0x53fa85.message));
      return false;
    }
  }

  async ["getAIList"](_0xde501 = 0x1, _0x388b98 = 0x64) {
    try {
      const _0x5d287e = '' + CONFIG.VCHARS.API_URL + CONFIG.VCHARS.ENDPOINTS.WAIFU + "?page=" + _0xde501 + "&size=" + _0x388b98;
      console.log("Fetching AI characters...");
      const _0x2d47f3 = await _0x4af6d8.get(_0x5d287e, this.axiosConfig);
      return _0x2d47f3.data.data.items || [];
    } catch (_0x2d0d59) {
      logger.error(LOG_MESSAGES.ERROR.MAIN_LOOP("Get AI list error: " + _0x2d0d59.message));
      return [];
    }
  }

  async ["login"]() {
    if (!this.userData) {
      throw new Error("User data not loaded");
    }
    try {
      const _0x54c757 = {
        'tg_id': this.userData.tg_id,
        'tg_username': this.userData.first_name,
        'name': this.userData.first_name,
        'language': this.userData.language_code,
        'gender': CONFIG.USER.DEFAULT_GENDER,
        'gender_preferences': CONFIG.USER.DEFAULT_PREFERENCES,
        'start_code': this.userData.start_param || CONFIG.USER.DEFAULT_START_CODE
      };
      const _0x20e3d1 = await _0x4af6d8.post('' + CONFIG.VCHARS.API_URL + CONFIG.VCHARS.ENDPOINTS.AUTH, _0x54c757, this.axiosConfig);
      return _0x20e3d1.data.message === "Data created correctly";
    } catch (_0x265cc1) {
      logger.error(LOG_MESSAGES.ERROR.ACCOUNT_PROCESSING("Login error: " + _0x265cc1.message));
      return false;
    }
  }

  async ["createNewChat"]() {
    try {
      const _0x4b4a72 = '' + CONFIG.VCHARS.API_URL + CONFIG.VCHARS.ENDPOINTS.CHAT;
      const _0xcc7e66 = {
        'waifu_id': this.selectedAI.id
      };
      const _0x32b715 = await _0x4af6d8.post(_0x4b4a72, _0xcc7e66, this.axiosConfig);
      if (_0x32b715.data.message === "Data created correctly") {
        this.chatId = _0x32b715.data.data.id;
        return true;
      }
      return false;
    } catch (_0x23afbb) {
      logger.error(LOG_MESSAGES.ERROR.ACCOUNT_PROCESSING("Create chat error: " + _0x23afbb.message));
      return false;
    }
  }

  async ["getActiveChats"]() {
    try {
      const _0x3850c7 = await _0x4af6d8.get('' + CONFIG.VCHARS.API_URL + CONFIG.VCHARS.ENDPOINTS.CHAT, this.axiosConfig);
      return _0x3850c7.data.data || [];
    } catch (_0x2af2c0) {
      logger.error(LOG_MESSAGES.ERROR.ACCOUNT_PROCESSING("Get active chats error: " + _0x2af2c0.message));
      return [];
    }
  }

  async ['sendMessage'](_0x1b9473) {
    if (!this.chatId) {
      throw new Error("Please start a chat first");
    }
    try {
      const _0xd96459 = '' + CONFIG.VCHARS.API_URL + CONFIG.VCHARS.ENDPOINTS.MESSAGE;
      const _0x2fc1c7 = {
        'chat_id': this.chatId,
        'message': _0x1b9473
      };
      const _0x59b83a = await _0x4af6d8.post(_0xd96459, _0x2fc1c7, this.axiosConfig);
      if (_0x59b83a.data.message === "Data created correctly") {
        return await this.waitForResponse(_0x59b83a.data.data.id);
      }
      return null;
    } catch (_0x40caf0) {
      if (_0x40caf0.response?.["data"]?.["detail"]) {
        logger.error(_0x40caf0.response.data.detail);
      }
      return null;
    }
  }

  async ["waitForResponse"](_0xd960bb, _0x7e028c = 0x64) {
    for (let _0x4ae3e1 = 0x0; _0x4ae3e1 < _0x7e028c; _0x4ae3e1++) {
      try {
        const _0xc6ed9 = await _0x4af6d8.get('' + CONFIG.VCHARS.API_URL + CONFIG.VCHARS.ENDPOINTS.MESSAGE + '/' + _0xd960bb, this.axiosConfig);
        if (_0xc6ed9.data.data.status === "completed") {
          return _0xc6ed9.data.data.message;
        }
        await new Promise(_0x499c8d => setTimeout(_0x499c8d, 0x3e8));
      } catch (_0x43ae22) {
        continue;
      }
    }
    return null;
  }

  ['parseUserData'](_0xa7b5c9) {
    try {
      const _0x5514d = new URLSearchParams(_0xa7b5c9);
      const _0x5717f3 = _0x5514d.get("user");
      if (!_0x5717f3) {
        throw new Error("No user data found in string");
      }
      const _0xf98d1c = JSON.parse(decodeURIComponent(_0x5717f3));
      const _0x3765a0 = {
        'tg_id': _0xf98d1c.id?.["toString"](),
        'first_name': _0xf98d1c.first_name,
        'language_code': _0xf98d1c.language_code || CONFIG.USER.DEFAULT_LANGUAGE,
        'chat_instance': _0x5514d.get('chat_instance'),
        'start_param': _0x5514d.get("start_param")
      };
      return _0x3765a0;
    } catch (_0x41c4d3) {
      logger.error(LOG_MESSAGES.ERROR.ACCOUNT_PROCESSING("Error parsing user data: " + _0x41c4d3.message));
      return null;
    }
  }
}

async function readAccounts(_0x3ce383) {
  try {
    const _0x49ee7f = await _0x3c33ca.readFile(_0x3ce383, 'utf8');
    return _0x49ee7f.split("\n").filter(_0x4f243d => _0x4f243d.trim());
  } catch (_0x315647) {
    logger.error(LOG_MESSAGES.ERROR.MAIN_LOOP("Error reading accounts: " + _0x315647.message));
    return [];
  }
}

function delay(_0x2716af) {
  return new Promise(_0x36b1d7 => setTimeout(_0x36b1d7, _0x2716af));
}

async function selectInitialAI() {
  try {
    const _0x4f7a91 = new AIChat();
    const _0x4c0d01 = await readAccounts(CONFIG.CHAT.USER_DATA_FILE);
    if (_0x4c0d01.length === 0x0) {
      throw new Error(LOG_MESSAGES.SYSTEM.NO_ACCOUNTS);
    }
    const _0x2ebafd = _0x4c0d01[0x0];
    _0x4f7a91.userDataString = _0x2ebafd;
    _0x4f7a91.userData = _0x4f7a91.parseUserData(_0x2ebafd);
    _0x4f7a91.axiosConfig.headers["User-Data"] = _0x2ebafd;
    const _0x467933 = new URLSearchParams(_0x2ebafd);
    _0x4f7a91.axiosConfig.headers.auth_date = _0x467933.get("auth_date") || '';
    _0x4f7a91.axiosConfig.headers.chat_instance = _0x467933.get('chat_instance') || '';
    _0x4f7a91.axiosConfig.headers.signature = _0x467933.get("signature") || '';
    _0x4f7a91.axiosConfig.headers.hash = _0x467933.get("hash") || '';
    const _0x24bf15 = await _0x4f7a91.login();
    if (!_0x24bf15) {
      throw new Error(LOG_MESSAGES.ACCOUNT.LOGIN_FAILED);
    }
    const _0x425e0b = await _0x4f7a91.getAIList();
    if (!_0x425e0b || _0x425e0b.length === 0x0) {
      throw new Error(LOG_MESSAGES.SYSTEM.NO_AI);
    }
    const _0x377de0 = [..._0x425e0b.map(_0x59da0d => ({
      'name': "  " + _0x59da0d.title,
      'value': _0x59da0d.slug
    })), new _0x14bee6.Separator("\n")];
    const {
      selected: _0x1b763c
    } = await _0x14bee6.prompt([{
      'type': "list",
      'name': "selected",
      'message': "Select an AI character that will be used for all accounts:",
      'choices': _0x377de0,
      'pageSize': 0x5
    }]);
    selectedAISlug = _0x1b763c;
    const _0x54760b = await _0x4f7a91.selectAI(_0x1b763c);
    if (_0x54760b) {
      selectedAIInfo = _0x4f7a91.selectedAI;
      logger.info("Selected AI: " + selectedAIInfo.title);
      logger.info("This AI will be used for all accounts.");
      return true;
    }
    return false;
  } catch (_0x17c57e) {
    logger.error(LOG_MESSAGES.ERROR.MAIN_LOOP("Error selecting initial AI: " + _0x17c57e.message));
    return false;
  }
}

async function handleAccount(_0x230ddb) {
  try {
    const _0x4bdce4 = new AIChat();
    _0x4bdce4.userDataString = _0x230ddb;
    _0x4bdce4.userData = _0x4bdce4.parseUserData(_0x230ddb);
    _0x4bdce4.axiosConfig.headers["User-Data"] = _0x230ddb;
    const _0x5201ab = new URLSearchParams(_0x230ddb);
    _0x4bdce4.axiosConfig.headers.auth_date = _0x5201ab.get("auth_date") || '';
    _0x4bdce4.axiosConfig.headers.chat_instance = _0x5201ab.get("chat_instance") || '';
    _0x4bdce4.axiosConfig.headers.signature = _0x5201ab.get('signature') || '';
    _0x4bdce4.axiosConfig.headers.hash = _0x5201ab.get("hash") || '';
    logger.info(LOG_MESSAGES.ACCOUNT.PROCESSING(_0x4bdce4.userData.first_name));
    const _0xc53400 = await _0x4bdce4.login();
    if (!_0xc53400) {
      throw new Error(LOG_MESSAGES.ACCOUNT.LOGIN_FAILED);
    }
    logger.info(LOG_MESSAGES.CHAT.SELECTING_AI);
    const _0x539a2d = await _0x4bdce4.selectAI(selectedAISlug);
    if (!_0x539a2d) {
      throw new Error(LOG_MESSAGES.ACCOUNT.AI_SELECT_FAILED);
    }
    const _0x130885 = await _0x4bdce4.getActiveChats();
    let _0x3e93a8 = _0x130885.find(_0x4ebffc => _0x4ebffc.waifu.id === _0x4bdce4.selectedAI.id);
    if (!_0x3e93a8) {
      logger.info(LOG_MESSAGES.CHAT.CREATING_SESSION);
      const _0x5c1ec0 = await _0x4bdce4.createNewChat();
      if (!_0x5c1ec0) {
        throw new Error("Failed to create new chat");
      }
      logger.success(LOG_MESSAGES.CHAT.SESSION_CREATED);
    } else {
      _0x4bdce4.chatId = _0x3e93a8.id;
      logger.info(LOG_MESSAGES.CHAT.USING_EXISTING);
    }
    await _0x4bdce4.autoChatWithGroq("Hi!");
    logger.success(LOG_MESSAGES.ACCOUNT.FINISHED(_0x4bdce4.userData.first_name));
  } catch (_0xbe53ad) {
    logger.error(LOG_MESSAGES.ERROR.ACCOUNT_PROCESSING(_0xbe53ad.message));
  }
}

async function main() {
  displayBanner();
  
  // Get Groq API key at startup
  try {
    groqApiKey = await getGroqApiKey();
    logger.success("Groq API Key successfully set!");
  } catch (error) {
    logger.error("Failed to get Groq API Key: " + error.message);
    process.exit(1);
  }

  while (true) {
    try {
      if (!selectedAISlug) {
        const _0x1d11eb = await selectInitialAI();
        if (!_0x1d11eb) {
          throw new Error(LOG_MESSAGES.SYSTEM.NO_AI);
        }
      }
      const _0x840b19 = await readAccounts(CONFIG.CHAT.USER_DATA_FILE);
      if (_0x840b19.length === 0x0) {
        throw new Error(LOG_MESSAGES.SYSTEM.NO_ACCOUNTS);
      }
      for (const _0x4c7d4f of _0x840b19) {
        await handleAccount(_0x4c7d4f);
        await delay(0x1388);
      }
      logger.success(LOG_MESSAGES.SYSTEM.CYCLE_COMPLETE);
      logger.info(LOG_MESSAGES.SYSTEM.WAITING_NEXT_CYCLE);
      const _0x1ca2ca = new CountdownTimer({
        'message': "Next cycle in: ",
        'format': "HH:mm:ss"
      });
      await _0x1ca2ca.start(86400);
    } catch (_0x476092) {
      logger.error(LOG_MESSAGES.ERROR.MAIN_LOOP(_0x476092.message));
      logger.warn(LOG_MESSAGES.SYSTEM.RETRY_WAIT);
      const _0x290a45 = new CountdownTimer({
        'message': "Retrying in: ",
        'format': "mm:ss"
      });
      await _0x290a45.start(3600);
    }
  }
}

main().catch(_0x5a5a01 => logger.error(LOG_MESSAGES.ERROR.MAIN_LOOP(_0x5a5a01.message)));