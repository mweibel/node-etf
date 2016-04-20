'use strict'

const Dissolve = require('dissolve')

class ParserError extends Error {
  constructor (message) {
    super(message)
    this.name = 'ParserError'
  }
}

class Parser extends Dissolve {
  constructor () {
    super()

    this.tagMap = this.setupTagMap()

    this.start()
  }

  /**
   * Returns a list of supported tags with their name and the appropriate parsing method to call.
   *
   * @returns {Object}
   */
  setupTagMap () {
    return {
      70: {
        impl: this.doublebe,
        name: 'newFloat'
      },
      // FIXME: doesn't work yet as the bits field isn't necessary a multiple of 8
      /*77: {
        impl: this.complexTag,
        name: 'bitBinary',
        defs: [
          {
            impl: this.uint32be,
            name: 'len'
          },
          {
            impl: this.uint8be,
            name: 'bits'
          },
          {
            impl: this.???,
            name: 'data'
          }
        ]
      },*/
      82: {
        impl: this.uint8,
        name: 'atomCacheRef'
      },
      97: {
        impl: this.uint8,
        name: 'smallInteger'
      },
      98: {
        impl: this.uint32be,
        name: 'integer'
      },
      99: {
        impl: this.float31,
        name: 'float'
      },
      100: {
        impl: this.complexTag,
        name: 'atom',
        def: [
          {
            impl: this.uint16be,
            name: 'len'
          },
          {
            impl: this.string,
            name: 'atom',
            varsArgs: ['len']
          }
        ]
      },
      101: {
        impl: this.complexTag,
        name: 'reference',
        def: [
          {
            impl: this.tag,
            name: 'node'
          },
          {
            impl: this.uint32be,
            name: 'id'
          },
          {
            impl: this.uint8,
            name: 'creation'
          }
        ]
      },
      102: {
        impl: this.complexTag,
        name: 'port',
        def: [
          {
            impl: this.tag,
            name: 'node'
          },
          {
            impl: this.uint32be,
            name: 'id'
          },
          {
            impl: this.uint8,
            name: 'creation'
          }
        ]
      },
      103: {
        impl: this.complexTag,
        name: 'pid',
        def: [
          {
            impl: this.tag,
            name: 'node'
          },
          {
            impl: this.uint32be,
            name: 'id'
          },
          {
            impl: this.uint32be,
            name: 'serial'
          },
          {
            impl: this.uint8,
            name: 'creation'
          }
        ]
      },
      104: {
        impl: this.complexTag,
        name: 'smallTuple',
        def: [
          {
            impl: this.uint8,
            name: 'arity'
          },
          {
            impl: this.tagList,
            name: 'elements',
            varsArgs: ['arity']
          }
        ]
      },
      105: {
        impl: this.complexTag,
        name: 'largeTuple',
        def: [
          {
            impl: this.uint32be,
            name: 'arity'
          },
          {
            impl: this.tagList,
            name: 'elements',
            varsArgs: ['arity']
          }
        ]
      },
      106: {
        impl: this.nil,
        name: 'nil'
      },
      107: {
        impl: this.complexTag,
        name: 'string',
        def: [
          {
            impl: this.uint16be,
            name: 'length'
          },
          {
            impl: this.string,
            name: 'characters',
            varsArgs: ['length']
          }
        ]
      },
      108: {
        impl: this.complexTag,
        name: 'list',
        def: [
          {
            impl: this.uint32be,
            name: 'length'
          },
          {
            impl: this.tagList,
            name: 'elements',
            varsArgs: ['length']
          },
          {
            impl: this.tag,
            name: 'tail'
          }
        ]
      },
      109: {
        impl: this.complexTag,
        name: 'binary',
        def: [
          {
            impl: this.uint32be,
            name: 'len'
          },
          {
            impl: this.buffer,
            name: 'data',
            varsArgs: ['len']
          }
        ]
      },
      110: {
        impl: this.complexTag,
        name: 'smallBigNum', // how ironic
        def: [
          {
            impl: this.uint8,
            name: 'n'
          },
          {
            impl: this.bool,
            name: 'sign'
          },
          {
            impl: this.bigNum,
            name: 'number',
            varsArgs: ['n', 'sign']
          }
        ]
      },
      111: {
        impl: this.complexTag,
        name: 'largeBigNum',
        def: [
          {
            impl: this.uint32be,
            name: 'n'
          },
          {
            impl: this.bool,
            name: 'sign'
          },
          {
            impl: this.bigNum,
            name: 'number',
            varsArgs: ['n', 'sign']
          }
        ]
      },
      112: {
        impl: this.complexTag,
        name: 'newFun',
        def: [
          {
            impl: this.uint32be,
            name: 'size'
          },
          {
            impl: this.uint8,
            name: 'arity'
          },
          {
            impl: this.string,
            name: 'uniq',
            args: [16]
          },
          {
            impl: this.uint32be,
            name: 'index'
          },
          {
            impl: this.uint32be,
            name: 'numFree'
          },
          {
            impl: this.tag,
            name: 'module'
          },
          {
            impl: this.tag,
            name: 'oldIndex'
          },
          {
            impl: this.tag,
            name: 'oldUniq'
          },
          {
            impl: this.tag,
            name: 'pid'
          },
          {
            impl: this.tagList,
            name: 'freeVars',
            varsArgs: ['numFree']
          }
        ]
      },
      113: {
        impl: this.complexTag,
        name: 'export',
        def: [
          {
            impl: this.tag,
            name: 'module'
          },
          {
            impl: this.tag,
            name: 'function'
          },
          {
            impl: this.tag,
            name: 'arity'
          }
        ]
      },
      114: {
        impl: this.complexTag,
        name: 'newReference',
        def: [
          {
            impl: this.uint16be,
            name: 'len'
          },
          {
            impl: this.tag,
            name: 'node'
          },
          {
            impl: this.uint8,
            name: 'creation'
          },
          {
            impl: this.uint32beLoop,
            name: 'id',
            varsArgs: ['len']
          }
        ]
      },
      115: {
        impl: this.complexTag,
        name: 'smallAtom',
        def: [
          {
            impl: this.uint8,
            name: 'len'
          },
          {
            impl: this.string,
            name: 'atom',
            varsArgs: ['len']
          }
        ]
      },
      116: {
        impl: this.complexTag,
        name: 'map',
        def: [
          {
            impl: this.uint32be,
            name: 'arity'
          },
          {
            impl: this.map,
            name: 'pairs',
            varsArgs: ['arity']
          }
        ]
      },
      117: {
        impl: this.complexTag,
        name: 'fun',
        def: [
          {
            impl: this.uint32be,
            name: 'numFree'
          },
          {
            impl: this.tag,
            name: 'pid'
          },
          {
            impl: this.tag,
            name: 'module'
          },
          {
            impl: this.tag,
            name: 'index'
          },
          {
            impl: this.tag,
            name: 'uniq'
          },
          {
            impl: this.tagList,
            name: 'freeVars',
            varsArgs: ['numFree']
          }
        ]
      },
      118: {
        impl: this.complexTag,
        name: 'utf8Atom',
        def: [
          {
            impl: this.uint16be,
            name: 'len'
          },
          {
            impl: this.string,
            name: 'atom',
            varsArgs: ['len']
          }
        ]
      },
      119: {
        impl: this.complexTag,
        name: 'smallUtf8Atom',
        def: [
          {
            impl: this.uint8,
            name: 'len'
          },
          {
            impl: this.string,
            name: 'atom',
            varsArgs: ['len']
          }
        ]
      }
    }
  }

  /**
   * Starts the parsing
   *
   * @returns {this}
   */
  start () {
    return this.tagLoop(() => {
      Object.keys(this.vars).map((key) => {
        this.push(this.vars[key])
      })
    })
  }

  /**
   * Loops through the buffer and finds Erlang ext format tags
   *
   * @param {Function} cb      Callback to call after each tag found.
   * @param {number}   [limit] Limit number of tags to be found. If not passed, there's no limit and it loops until
   *                           the end of the buffer.
   *
   * @returns {this}
   */
  tagLoop (cb, limit) {
    return this.tag().tap(() => {

      cb()
      this.vars = {}

      if (limit === undefined || --limit > 0) {
        return this.tagLoop(cb, limit)
      }
    })
  }

  /**
   * List of tags
   *
   * Converts a list of tags followed after each other into an array.
   *
   * @param {string} name    Target name of the array in the list of vars. Unused.
   * @param {number} [limit] How many tags are followed after each other.
   *
   * @returns {this}
   */
  tagList (name, limit) {
    let vars = []

    return this.tagLoop(() => {
      Object.keys(this.vars).forEach((key) => {
        vars.push(this.vars[key])
      })
    }, limit).tap(() => {
      this.vars = vars
    })
  }

  /**
   * Parses a specific erlang type tag
   *
   * @returns {this}
   */
  tag () {
    return this.uint8('tag').tap(() => {
      const tag = this.tagMap[this.vars.tag]
      if (!tag) {
        throw new ParserError(`Unable to read tag ${this.vars.tag}`)
      }
      tag.impl.call(this, tag.name, tag.def)
    }).tap(() => {
      delete this.vars.tag

      let vars = this.vars
      this.vars = {}

      Object.keys(vars).forEach((key) => {
        this.vars[key] = {
          name: key,
          value: vars[key]
        }
      })
    })
  }

  /**
   * Complex tag is a tag which holds several tags each of which has
   * a different implementation specified.
   *
   * @param {string} name Name of complex tag
   * @param {Array}  def  Definition of the tag
   *
   * @returns {this}
   */
  complexTag (name, def) {
    let vars = {}
    let collection = def.slice(0) // clone array

    return this.parseDef(name, vars, collection)
  }

  /**
   * Parses the definition of a complex tag
   *
   * @param {string} name Complex tag name
   * @param {Object} vars List of variables
   * @param {Array}  defs List of definitions
   *
   * @returns {this}
   */
  parseDef (name, vars, defs) {
    const val = defs.splice(0, 1)[0]

    let args = [val.name]
    if (val.varsArgs) {
      val.varsArgs.forEach((key) => {
        args.push(vars[key])
      })
    }
    if (val.args) {
      args = args.concat(val.args)
    }

    return val.impl.apply(this, args).tap(() => {
      if (Array.isArray(this.vars)) {
        vars[val.name] = this.vars
      } else {
        Object.keys(this.vars).forEach((key) => {
          vars[val.name] = this.vars[key]
        })
      }

      this.vars = {}

      if (defs.length > 0) {
        return this.parseDef(name, vars, defs)
      }
      this.vars[name] = vars
    })
  }

  /**
   * Parses a map by using the tagList but then fiddles with the created array
   * to return a map-like structure where each item in the array is an object with key and value.
   *
   * @param {string} name  Map name
   * @param {number} arity Arity - number of pairs
   *
   * @returns {this}
   */
  map (name, arity) {
    let vars = []
    const numPairs = arity * 2

    return this.tagList(name, numPairs).tap(() => {
      let currentKey = null
      for (let i = 0, l = this.vars.length; i < l; i++) {
        if (i % 2 === 0) {
          currentKey = this.vars[i]
        } else {
          vars.push({
            key: currentKey,
            value: this.vars[i]
          })
        }
      }

      this.vars = {}
      this.vars[name] = vars
    })
  }

  /**
   * Float encoded as a string of length 31.
   *
   * @param {string} name Name of the tag
   *
   * @returns {this}
   */
  float31 (name) {
    return this.string(name, 31).tap(() => {
      this.vars[name] = parseFloat(this.vars[name])
    })
  }

  /**
   * Boolean uint8
   *
   * @param {string} name Tag name
   *
   * @returns {this}
   */
  bool (name) {
    return this.uint8(name).tap(() => {
      this.vars[name] = this.vars[name] === 1
    })
  }

  /**
   * Bignum
   *
   * @param {string} name Tag name
   * @param {number} n    Number of characters
   * @param {bool}   sign False = negative, true = positive
   *
   * @returns {this}
   */
  bigNum (name, n, sign) {
    const B = 256 // per protocol documentation

    return this.string(name, n).tap(() => {
      let i = 0
      let val = 0
      for (var char of this.vars[name]) {
        val += parseInt(char, 10) * Math.pow(B, i)
        i++
      }

      if (sign) {
        val = val * -1
      }
      this.vars[name] = val
    })
  }

  /**
   * Puts in a null value
   *
   * @param {string} name
   *
   * @returns {this}
   */
  nil (name) {
    this.vars[name] = null

    return this
  }

  /**
   * Loop of unsigned 4 byte big-endian integers.
   *
   * @param {string} name Name of the key in vars object
   * @param {number} len  Number of iterations
   * @param {Array}  vars Temporary storage for found integers
   *
   * @returns {this}
   */
  uint32beLoop (name, len, vars) {
    vars = vars || []
    return this.uint32be(name).tap(() => {
      vars.push(this.vars[name])
      this.vars = {}

      if (--len > 0) {
        return this.uint32beLoop(name, len, vars)
      }

      this.vars[name] = vars
    })
  }
}

module.exports = Parser