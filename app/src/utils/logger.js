import _0x21724a from 'winston';
import { colors } from '../../../config/colors.js';
const customLevels = {
  'levels': {
    'error': 0x0,
    'warn': 0x1,
    'info': 0x2,
    'success': 0x3,
    'custom': 0x4
  },
  'colors': {
    'error': "red",
    'warn': "yellow",
    'info': 'cyan',
    'success': 'green',
    'custom': "magenta"
  }
};
const customFormat = _0x21724a.format.combine(_0x21724a.format.timestamp({
  'format': "YYYY-MM-DD HH:mm:ss"
}), _0x21724a.format.printf(({
  timestamp: _0x5c0e41,
  level: _0x29e3a4,
  message: _0x1fb6e7
}) => {
  const _0x4ab4f7 = {
    'error': colors.error,
    'warn': colors.warning,
    'info': colors.info,
    'success': colors.success,
    'custom': colors.custom
  };
  return '' + colors.dim + _0x5c0e41 + colors.reset + " | " + _0x4ab4f7[_0x29e3a4] + _0x29e3a4.toUpperCase().padEnd(0x7) + colors.reset + " | " + _0x1fb6e7;
}));
export const logger = _0x21724a.createLogger({
  'levels': customLevels.levels,
  'level': "custom",
  'format': customFormat,
  'transports': [new _0x21724a.transports.Console()]
});
_0x21724a.addColors(customLevels.colors);