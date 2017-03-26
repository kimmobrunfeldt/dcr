const Transform = require('stream').Transform;
const _ = require('lodash');

function createCharRingBuffer(opts) {
  let charBuffer = '';

  function pushChar(chr) {
    if (chr.length > 1) {
      throw new Error('Only 1 character can be pushed at a time');
    }

    charBuffer += chr;
    if (charBuffer.length > opts.maxLength) {
      charBuffer = charBuffer.substr(1);
    }
  }

  function clear() {
    charBuffer = '';
  }

  function getWindow() {
    return charBuffer;
  }

  return {
    pushChar,
    clear,
    getWindow,
  };
}

const PARSE_STATES = {
  OUTSIDE_TAG: 0,
  INSIDE_TAG: 1,
};

class TransformStream extends Transform {
  constructor(opts) {
    super();

    this.opts = _.merge({
      maxCharsBetweenTags: 1024 * 1024,
    }, opts);
    this.parserState = PARSE_STATES.OUTSIDE_TAG;
    this.betweenTags = '';
    this.startTagCharWindow = createCharRingBuffer({ maxLength: opts.startTag.length });
    this.endTagCharWindow = createCharRingBuffer({ maxLength: opts.endTag.length });
  }

  _flush(cb) {
    // If the stream ends before end tag is found, we have to flush
    // the partially parsed data
    if (this.parserState === PARSE_STATES.INSIDE_TAG) {
      this.push(this.opts.startTag + this.betweenTags);
    }

    cb(null);
  }

  _transform(chunk, enc, cb) {
    const str = chunk.toString('utf-8');

    for (let i = 0; i < str.length; i += 1) {
      const char = str[i];

      if (this.parserState === PARSE_STATES.OUTSIDE_TAG) {
        this._handleOutsideStateChar(char);
      } else {
        this._handleInsideStateChar(char);
      }
    }

    cb(null);
  }

  _handleOutsideStateChar(char) {
    this.startTagCharWindow.pushChar(char);
    const startWindow = this.startTagCharWindow.getWindow();

    // When the parser is reading "in" the start tag,
    // we should not emit the start tag characters.
    const areWeInStartTag = _.startsWith(this.opts.startTag, startWindow);
    if (!areWeInStartTag) {
      this.push(startWindow);
      this.startTagCharWindow.clear();
    }

    const startTagFound = startWindow === this.opts.startTag;
    if (startTagFound) {
      this._onStartTagFound();
    }
  }

  _onStartTagFound() {
    this.startTagCharWindow.clear();
    this.parserState = PARSE_STATES.INSIDE_TAG;
  }

  _handleInsideStateChar(char) {
    this.endTagCharWindow.pushChar(char);
    this.betweenTags += char;

    const endTagFound = this.endTagCharWindow.getWindow() === this.opts.endTag;
    if (endTagFound) {
      this._onEndTagFound();
    }

    if (this.betweenTags.length > this.opts.maxCharsBetweenTags) {
      // We reached the maximum limit the tags can have characters between
      // them. Emit the already read characters and continue without
      // doing any transform.
      this.push(this.opts.startTag + this.betweenTags);
      this._resetInsideState();
    }
  }

  _onEndTagFound() {
    // Remove end tag from the saved data
    const data = this.betweenTags.substr(0, this.betweenTags.length - this.opts.endTag.length);
    this.push(this.opts.transform(data));

    this._resetInsideState();
  }

  _resetInsideState() {
    this.endTagCharWindow.clear();
    this.parserState = PARSE_STATES.OUTSIDE_TAG;

    // Reset between tags data
    this.betweenTags = '';
  }
}

module.exports = (...args) => new TransformStream(...args);
