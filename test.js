'use strict'

const mocha = require('mocha')
const describe = mocha.describe
const chai = require('chai')
const it = mocha.it

chai.should()

const Parser = require('./')

const testData = [
  {
    data: [70, 0x3f, 0xf1, 0xf9, 0x93, 0xd5, 0x34, 0x7a, 0x5b],
    expected: [
      {
        name: 'newFloat',
        value: 1.123432
      }
    ]
  },
  {
    data: [82, 10, 97, 33, 98, 12, 12, 12, 12, 82, 32],
    expected: [
      {name: 'atomCacheRef', value: 10},
      {name: 'smallInteger', value: 33},
      {name: 'integer', value: 202116108},
      {name: 'atomCacheRef', value: 32}
    ]
  },
  {
    data: [99, 0x31, 0x2e, 0x31, 0x32, 0x33, 0x34, 0x33, 0x32, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30,
      0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30],
    expected: [
      {name: 'float', value: 1.123432}
    ]
  },
  {
    data: [100, 0x00, 0x03, 0x66, 0x6f, 0x6f],
    expected: [
      {
        name: 'atom',
        value: {
          atom: 'foo',
          len: 3
        }
      }
    ]
  },
  {
    data: [101, 100, 0x00, 0x03, 0x66, 0x6f, 0x6f, 0x00, 0x00, 0x00, 0x01, 0x01],
    expected: [
      {
        name: 'reference',
        value: {
          node: {
            name: 'atom',
            value: {
              atom: 'foo',
              len: 3
            }
          },
          id: 1,
          creation: 1
        }
      }
    ]
  },
  {
    data: [102, 100, 0x00, 0x03, 0x66, 0x6f, 0x6f, 0x00, 0x00, 0x00, 0x01, 0x01],
    expected: [
      {
        name: 'port',
        value: {
          node: {
            name: 'atom',
            value: {
              atom: 'foo',
              len: 3
            }
          },
          id: 1,
          creation: 1
        }
      }
    ]
  },
  {
    data: [103, 100, 0x00, 0x03, 0x66, 0x6f, 0x6f, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x01],
    expected: [
      {
        name: 'pid',
        value: {
          node: {
            name: 'atom',
            value: {
              atom: 'foo',
              len: 3
            }
          },
          id: 1,
          serial: 1,
          creation: 1
        }
      }
    ]
  },
  {
    data: [104, 0x02, 100, 0x00, 0x03, 0x66, 0x6f, 0x6f, 82, 10],
    expected: [
      {
        name: 'smallTuple',
        value: {
          arity: 2,
          elements: [
            {
              name: 'atom',
              value: {
                atom: 'foo',
                len: 3
              }
            },
            {
              name: 'atomCacheRef',
              value: 10
            }
          ]
        }
      }
    ]
  },
  {
    data: [105, 0x00, 0x00, 0x00, 0x02, 100, 0x00, 0x03, 0x66, 0x6f, 0x6f, 82, 10],
    expected: [
      {
        name: 'largeTuple',
        value: {
          arity: 2,
          elements: [
            {
              name: 'atom',
              value: {
                atom: 'foo',
                len: 3
              }
            },
            {
              name: 'atomCacheRef',
              value: 10
            }
          ]
        }
      }
    ]
  },
  {
    data: [106],
    expected: [
      {
        name: 'nil',
        value: null
      }
    ]
  },
  {
    data: [107, 0x00, 0x03, 0x66, 0x6f, 0x6f],
    expected: [
      {
        name: 'string',
        value: {
          length: 3,
          characters: 'foo'
        }
      }
    ]
  },
  {
    data: [108, 0x00, 0x00, 0x00, 0x01, 100, 0x00, 0x03, 0x66, 0x6f, 0x6f, 100, 0x00, 0x03, 0x66, 0x6f, 0x6f],
    expected: [
      {
        name: 'list',
        value: {
          length: 1,
          elements: [
            {
              name: 'atom',
              value: {
                atom: 'foo',
                len: 3
              }
            }
          ],
          tail: {
            name: 'atom',
            value: {
              atom: 'foo',
              len: 3
            }
          }
        }
      }
    ]
  },
  {
    data: [109, 0x00, 0x00, 0x00, 0x01, 0x01],
    expected: [
      {
        name: 'binary',
        value: {
          len: 1,
          data: new Buffer([0x01])
        }
      }
    ]
  },
  {
    data: [110, 0x02, 0x00, 0x31, 0x31, 110, 0x02, 0x01, 0x31, 0x32],
    expected: [
      {
        name: 'smallBigNum',
        value: {
          n: 2,
          sign: false,
          number: 257
        }
      },
      {
        name: 'smallBigNum',
        value: {
          n: 2,
          sign: true,
          number: -513
        }
      }
    ]
  },
  {
    data: [111, 0x00, 0x00, 0x00, 0x02, 0x00, 0x31, 0x31, 111, 0x00, 0x00, 0x00, 0x02, 0x01, 0x31, 0x32],
    expected: [
      {
        name: 'largeBigNum',
        value: {
          n: 2,
          sign: false,
          number: 257
        }
      },
      {
        name: 'largeBigNum',
        value: {
          n: 2,
          sign: true,
          number: -513
        }
      }
    ]
  },
  {
    data: [112,
      0x00, 0x00, 0x00, 0x00, // size (incorrect!)
      0x01, // arity
      0x74, 0x65, 0x73, 0x74, 0x65, 0x73, 0x74, 0x65, 0x73, 0x74, 0x65, 0x73, 0x74, 0x74, 0x65, 0x73, // uniq
      0x00, 0x00, 0x00, 0x01, // index
      0x00, 0x00, 0x00, 0x02, // num free
      100, 0x00, 0x03, 0x66, 0x6f, 0x6f, // module
      97, 33, // oldIndex
      97, 20, // oldUniq
      103, 100, 0x00, 0x03, 0x66, 0x6f, 0x6f, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x01, // pid
      100, 0x00, 0x03, 0x66, 0x6f, 0x6f, // free vars, first one
      100, 0x00, 0x03, 0x62, 0x61, 0x72 // free vars, 2nd one
    ],
    expected: [
      {
        name: 'newFun',
        value: {
          size: 0,
          arity: 1,
          uniq: 'testestestesttes',
          index: 1,
          numFree: 2,
          pid: {
            name: 'pid',
            value: {
              node: {
                name: 'atom',
                value: {
                  atom: 'foo',
                  len: 3
                }
              },
              id: 1,
              serial: 1,
              creation: 1
            }
          },
          module: {
            name: 'atom',
            value: {
              atom: 'foo',
              len: 3
            }
          },
          oldIndex: {
            name: 'smallInteger',
            value: 33
          },
          oldUniq: {
            name: 'smallInteger',
            value: 20
          },
          freeVars: [
            {
              name: 'atom',
              value: {
                atom: 'foo',
                len: 3
              }
            },
            {
              name: 'atom',
              value: {
                atom: 'bar',
                len: 3
              }
            }
          ]
        }
      }
    ]
  },
  {
    data: [113, 115, 0x03, 0x66, 0x6f, 0x6f, 115, 0x03, 0x62, 0x61, 0x72, 97, 33],
    expected: [
      {
        name: 'export',
        value: {
          module: {
            name: 'smallAtom',
            value: {
              atom: 'foo',
              len: 3
            }
          },
          function: {
            name: 'smallAtom',
            value: {
              atom: 'bar',
              len: 3
            }
          },
          arity: {
            name: 'smallInteger',
            value: 33
          }
        }
      }
    ]
  },
  {
    data: [114, 0x00, 0x02, 100, 0x00, 0x03, 0x66, 0x6f, 0x6f, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x02],
    expected: [
      {
        name: 'newReference',
        value: {
          len: 2,
          node: {
            name: 'atom',
            value: {
              atom: 'foo',
              len: 3
            }
          },
          creation: 1,
          id: [1, 2]
        }
      }
    ]
  },
  {
    data: [115, 0x03, 0x66, 0x6f, 0x6f],
    expected: [
      {
        name: 'smallAtom',
        value: {
          atom: 'foo',
          len: 3
        }
      }
    ]
  },
  {
    data: [116, 0x00, 0x00, 0x00, 0x01, 100, 0x00, 0x03, 0x66, 0x6f, 0x6f, 100, 0x00, 0x03, 0x62, 0x61, 0x72],
    expected: [
      {
        name: 'map',
        value: {
          arity: 1,
          pairs: [
            {
              key: {
                name: 'atom',
                value: {
                  atom: 'foo',
                  len: 3
                }
              },
              value: {
                name: 'atom',
                value: {
                  atom: 'bar',
                  len: 3
                }
              }
            }
          ]
        }
      }
    ]
  },
  {
    data: [117,
      0x00, 0x00, 0x00, 0x02, // num free
      103, 100, 0x00, 0x03, 0x66, 0x6f, 0x6f, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x01, // pid
      100, 0x00, 0x03, 0x66, 0x6f, 0x6f, // module
      97, 33, // index
      97, 20, // uniq
      100, 0x00, 0x03, 0x66, 0x6f, 0x6f, // free vars, first one
      100, 0x00, 0x03, 0x62, 0x61, 0x72 // free vars, 2nd one
    ],
    expected: [
      {
        name: 'fun',
        value: {
          numFree: 2,
          pid: {
            name: 'pid',
            value: {
              node: {
                name: 'atom',
                value: {
                  atom: 'foo',
                  len: 3
                }
              },
              id: 1,
              serial: 1,
              creation: 1
            }
          },
          module: {
            name: 'atom',
            value: {
              atom: 'foo',
              len: 3
            }
          },
          index: {
            name: 'smallInteger',
            value: 33
          },
          uniq: {
            name: 'smallInteger',
            value: 20
          },
          freeVars: [
            {
              name: 'atom',
              value: {
                atom: 'foo',
                len: 3
              }
            },
            {
              name: 'atom',
              value: {
                atom: 'bar',
                len: 3
              }
            }
          ]
        }
      }
    ]
  },
  {
    data: [118, 0x00, 0x03, 0x66, 0x6f, 0x6f],
    expected: [
      {
        name: 'utf8Atom',
        value: {
          atom: 'foo',
          len: 3
        }
      }
    ]
  },
  {
    data: [119, 0x03, 0x66, 0x6f, 0x6f],
    expected: [
      {
        name: 'smallUtf8Atom',
        value: {
          atom: 'foo',
          len: 3
        }
      }
    ]
  }
]

function runTestCase (input, next) {
  var parser = new Parser()

  var entries = []
  parser.on('readable', () => {
    const data = parser.read()
    entries.push(data)
  })

  parser.write(new Buffer(input.data), () => {
    entries.should.deep.equal(input.expected)
    next()
  })
}

describe('parser', () => {
  it('should parse the testData correctly', (done) => {
    let l = testData.length
    let ran = 0
    for (let i = 0; i < l; i++) {
      runTestCase(testData[i], () => {
        ran++
        if (ran === l) {
          done()
        }
      })
    }
  })
})
