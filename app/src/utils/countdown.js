import { colors } from '../../../config/colors.js';
export class CountdownTimer {
  constructor(_0x2649a4 = {}) {
    this.options = {
      'showCursor': false,
      'colors': {
        'message': colors.timerCount,
        'timer': colors.timerWarn,
        'reset': colors.reset
      },
      'format': 'HH:mm:ss',
      'message': "Time remaining: ",
      'clearOnComplete': true,
      ..._0x2649a4
    };
  }
  ['formatTime'](_0x30bd8d, _0x467b19 = this.options.format) {
    const _0x50cf0a = Math.floor(_0x30bd8d / 0xe10);
    const _0x1013ff = Math.floor(_0x30bd8d % 0xe10 / 0x3c);
    const _0x588a63 = _0x30bd8d % 0x3c;
    switch (_0x467b19.toUpperCase()) {
      case "HH:MM:SS":
        return _0x50cf0a.toString().padStart(0x2, '0') + ':' + _0x1013ff.toString().padStart(0x2, '0') + ':' + _0x588a63.toString().padStart(0x2, '0');
      case "MM:SS":
        return _0x1013ff.toString().padStart(0x2, '0') + ':' + _0x588a63.toString().padStart(0x2, '0');
      case 'SS':
        return _0x588a63.toString().padStart(0x2, '0');
      case "FULL":
        return _0x50cf0a + "h " + _0x1013ff + "m " + _0x588a63 + 's';
      case "COMPACT":
        return _0x50cf0a > 0x0 ? _0x50cf0a + 'h' + _0x1013ff + 'm' : _0x1013ff > 0x0 ? _0x1013ff + 'm' + _0x588a63 + 's' : _0x588a63 + 's';
      default:
        return _0x50cf0a.toString().padStart(0x2, '0') + ':' + _0x1013ff.toString().padStart(0x2, '0') + ':' + _0x588a63.toString().padStart(0x2, '0');
    }
  }
  async ["start"](_0x398146, _0x481958 = {}) {
    const _0x117278 = {
      ...this.options,
      ..._0x481958
    };
    if (!_0x117278.showCursor) {
      process.stdout.write("[?25l");
    }
    const {
      colors: {
        message: _0xe812bb,
        timer: _0x2ac727,
        reset: _0x420e09
      },
      message: _0x1b730e
    } = _0x117278;
    try {
      for (let _0x1a8269 = _0x398146; _0x1a8269 > 0x0; _0x1a8269--) {
        process.stdout.clearLine(0x0);
        process.stdout.cursorTo(0x0);
        const _0x508b04 = this.formatTime(_0x1a8269, _0x117278.format);
        process.stdout.write('' + _0xe812bb + _0x1b730e + _0x2ac727 + _0x508b04 + _0x420e09);
        await new Promise(_0x3ef5c4 => setTimeout(_0x3ef5c4, 0x3e8));
      }
      if (_0x117278.clearOnComplete) {
        process.stdout.clearLine(0x0);
        process.stdout.cursorTo(0x0);
      }
    } finally {
      if (!_0x117278.showCursor) {
        process.stdout.write("[?25h");
      }
    }
  }
  static async ['countdown'](_0x5ac63a, _0x1f40db = {}) {
    const _0x3f075b = new CountdownTimer(_0x1f40db);
    await _0x3f075b.start(_0x5ac63a);
  }
}