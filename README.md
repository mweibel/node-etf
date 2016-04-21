# Erlang External Term Format
[![npm version](https://badge.fury.io/js/erlang-term-format.svg)](https://badge.fury.io/js/erlang-term-format)
[![Build Status](https://travis-ci.org/mweibel/node-etf.svg?branch=master)](https://travis-ci.org/mweibel/node-etf)
[![Coverage Status](https://coveralls.io/repos/github/mweibel/node-etf/badge.svg?branch=master)](https://coveralls.io/github/mweibel/node-etf?branch=master)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

This module implements a parser for the [External Term Format](http://erlang.org/doc/apps/erts/erl_ext_dist.html) of Erlang.

## Installation

```bash
$ npm install erlang-term-format
```

## Usage

See [test.js](https://github.com/mweibel/node-etf/blob/master/test.js) for some examples.


```javascript
const Parser = require('erlang-term-format')
const parser = new Parser()

parser.on('readable', () => {
	console.log(parser.read())
})

const pid = [
	103,                               // 103 = PID type
	100, 0x00, 0x03, 0x66, 0x6f, 0x6f, // atom 'foo'
	0x00, 0x00, 0x00, 0x01,            // id 1
	0x00, 0x00, 0x00, 0x01,            // serial 1
	0x01                               // creation 1
]

parser.write(new Buffer(pid))
```

## Contributing
See [CONTRIBUTING.md](https://github.com/mweibel/node-etf/blob/master/CONTRIBUTING.md).