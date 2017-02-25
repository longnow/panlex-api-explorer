var endpoint = 'https://api.panlex.org/v2';

var urlParams = {
  id: {
    desc: 'ID number.'
  },
  'id|label': {
    desc: 'Source ID number or label.'
  },
  'id|uid': {
    desc: 'Language variety ID number or uniform identifier.'
  },
  text: {
    desc: 'Expression text.'
  }
};

var objectTypes = {
  cldr_char: {
    name: 'CLDR character',
    desc: 'Object representing an <a href="http://cldr.unicode.org/translation/characters#TOC-Exemplar-Characters">exemplar character</a> for a language variety, as defined by the Unicode Common Locale Data Repository.',
    fields: {
      category: {
        type: 'string',
        desc: 'Character category, typically “pri” (primary/standard), “aux” (auxiliary), or “pun” (punctuation).'
      },
      locale: {
        type: 'string',
        desc: 'Unicode script locale abbreviation.'
      },
      range: {
        type: 'codepoint_range',
        desc: 'A code-point range (see below).'
      }
    }
  },
  codepoint_range: {
    name: 'Code-point range',
    desc: 'Two-element array representing a range of permissible Unicode characters for a language variety. The array takes the form <code>[first, last]</code>, where <code>first</code> is the numeric value of the first code-point in the range and <code>last</code> is the value of the last code-point in the range.',
    example: 'For English (language variety <em>eng-000</em>), the first code point object is <code>[32, 33]</code>. This includes the range from U+0020 (SPACE) to U+0021 (EXCLAMATION MARK). Note that JSON numeric values are always decimal.'
  }
}

var queryDefaults = {
  default: {
    reqParams: {
      cache: {
        type: 'boolean',
        desc: 'Whether to return cached responses. Default <code>true</code>. Set to <code>false</code> if you want to ensure that your response contains the latest data from the database. Cached responses will be no more than 24 hours old.',
        global: true
      },
      echo: {
        type: 'boolean',
        desc: 'Whether to pass the query back in the response as <code>request</code>, which is an object with the keys <code>url</code> and <code>query</code>. Default <code>false</code>.',
        global: true
      },
      indent: {
        type: 'boolean',
        desc: 'Whether to pretty-print the JSON response. Default <code>false</code>.',
        global: true
      },
    },
    resFields: {
      request: {
        type: 'object',
        desc: 'The request query, if <code>echo</code> was enabled.',
        root: true
      }
    }
  },

  result: {
    reqParams: {
      after: {
        type: 'scalar[]',
        desc: 'Integers or strings containing values of <code>sort</code> fields. Records will be returned that occur immediately after the indicated value(s) in the sort order. Can be used as an alternative to <code>offset</code>.',
        global: true
      },
      include: {
        type: 'string[]',
        desc: 'Additional fields to include in the response.'
      },
      limit: {
        type: 'integer',
        desc: 'Maximum number of records to return. Default: <code>resultMax</code>, i.e., the maximum.',
        global: true
      },
      offset: {
        type: 'integer',
        desc: 'How many records to omit from the beginning of the returned records. Default: 0. Cannot be greater than 250000.',
        global: true
      },
      sort: {
        type: 'string[]',
        desc: 'Fields to sort the result by. Sort strings take the format <em>&lt;field&gt;</em> or <em>&lt;field&gt; asc</em> for ascending order, <em>&lt;field&gt; desc</em> for descending order. You may also sort by <code>include</code> fields if they are present and do not return an array. If you sort by the special field <code>random</code>, the result will be returned in random order. Default: <code>id asc</code>.',
        global: true
      }
    },
    resFields: {
      result: {
        type: 'object[]',
        desc: 'Results. Limited to <code>resultMax</code> per query. Use <code>after</code> or <code>offset</code> to get more.',
        root: true
      },
      resultMax: {
        type: 'integer',
        desc: 'Maximum number of <code>result</code> objects that will be returned in a single query (currently 2000).',
        root: true
      },
      resultNum: {
        type: 'integer',
        desc: 'Number of objects returned in <code>result</code>.',
        root: true
      },
      resultType: {
        type: 'string',
        desc: 'Type of objects in <code>result</code>.',
        root: true
      }
    }
  },

  count: {
    reqParams: {
      after: {
        inherit: 'result'
      },
      limit: {
        inherit: 'result'
      },
      offset: {
        inherit: 'result'
      }
    },
    resFields: {
      count: {
        type: 'integer',
        desc: 'Number of results found.',
        root: true
      },
      countType: {
        type: 'string',
        desc: 'Type of objects counted in <code>count</code>.',
        root: true
      }
    }
  },

  single: {
    reqParams: {
      include: {
        type: 'string[]',
        desc: 'Additional fields to include in the response.'
      }
    }
  }
};

var queries = {
  '/definition': {
    type: 'result',
    desc: 'definition query',
    reqParams: {
      expr: {
        type: 'integer[]',
        desc: 'Expression IDs. Restricts results to definitions of meanings of the specified expressions.'
      },
      expr_langvar: {
        type: 'integer[]',
        desc: 'Language variety IDs. Restricts results to definitions of meanings of expressions in the specified language varieties.'
      },
      expr_txt: {
        type: 'string[]',
        desc: 'Expression texts. Restricts results to definitions of meanings of expressions with matching texts.'
      },
      expr_txt_degr: {
        type: 'string[]',
        desc: 'Expression texts. Restricts results to definitions of meanings of expressions with matching texts in degraded form.'
      },
      expr_uid: {
        type: 'string[]',
        desc: 'Language variety uniform identifiers. Restricts results to definitions of meanings of expressions in the specified language varieties.'
      },
      id: {
        type: 'integer[]',
        desc: 'Definition IDs.'
      },
      include: {
        options: ['expr_langvar', 'expr_txt', 'expr_txt_degr', 'expr_uid', 'uid']
      },
      langvar: {
        type: 'integer[]',
        desc: 'Language variety IDs. Restricts results to definitions in the specified language varieties.'
      },
      meaning: {
        type: 'integer[]',
        desc: 'Meaning IDs. Restricts results to definitions of the specified meanings.'
      },
      txt: {
        type: 'string[]',
        desc: 'Definition texts.'
      },
      txt_degr: {
        type: 'string[]',
        desc: 'Definition texts to be matched in degraded form.'
      },
      uid: {
        type: 'string[]',
        desc: 'Language variety uniform identifiers. Restricts results to definitions in the specified language varieties.'
      }
    },
    resFields: {

    }
  },

  '/definition/<id>': {
    type: 'single',
    desc: 'single definition query',
    reqParams: {
      include: {
        inherit: '/definition'
      }
    }
  },

  '/definition/count': {
    type: 'count',
    desc: 'definition count query',
    reqParams: {
      inherit: '/definition',
      filterNot: { values: ['include'] }
    }
  },

  '/denotation': {
    type: 'result',
    desc: 'denotation query',
    reqParams: {},
    resFields: {}
  },

  '/denotation/<id>': {
    type: 'single',
    desc: 'single denotation query',
    reqParams: {
      include: {
        inherit: '/denotation'
      }
    }
  },

  '/denotation/count': {
    type: 'count',
    desc: 'denotation count query',
    reqParams: {
      inherit: '/definition',
      filterNot: { values: ['include'] }
    }
  },

  '/expr': {
    type: 'result',
    desc: 'expression or translation query',
    reqParams: {},
    resFields: {}
  },

  '/expr/<id>': {
    type: 'single',
    desc: 'single expression query, with ID',
    reqParams: {
      include: {
        inherit: '/expr',
        filter: { key: 'options', values: ['uid'] }
      }
    }
  },

  '/expr/<id|uid>/<text>': {
    type: 'single',
    desc: 'single expression query, with language variety and text',
    reqParams: {
      include: {
        inherit: '/denotation',
        filter: { key: 'options', values: ['uid'] }
      }
    }
  },

  '/expr/count': {
    type: 'count',
    desc: 'expression count query',
    reqParams: {
      inherit: '/expr',
      filterNot: { values: ['include'] }
    }
  },

  '/expr/index': {
    desc: 'expression index query',
    reqParams: {},
    resFields: {}
  },

  '/langvar': {
    type: 'result',
    desc: 'language variety query',
    reqParams: {
      expr_txt: {
        type: 'string[]',
        desc: 'Expression texts. Restricts results to language varieties containing a matching expression.'
      },
      expr_txt_degr: {
        type: 'string[]',
        desc: 'Expression texts. Restricts results to language varieties containing a matching expression in degraded form.'
      },
      id: {
        type: 'integer[]',
        desc: 'Language variety IDs.'
      },
      include: {
        options: ['denotation_count', 'expr_count', 'langvar_char', 'langvar_cldr_char', 'script_expr_txt']
      },
      lang_code: {
        type: 'string[]',
        desc: 'Three-letter ISO 639 language codes.'
      },
      mutable: {
        type: 'boolean',
        desc: 'Restricts results to language varieties that are mutable (if <code>true</code>) or immutable (if <code>false</code>).'
      },
      name_expr: {
        type: 'integer[]',
        desc: 'Language variety default name expression IDs.'
      },
      name_expr_txt: {
        type: 'string[]',
        desc: 'Language variety default name expression texts.'
      },
      name_expr_txt_degr: {
        type: 'string[]',
        desc: 'Language variety default name expression texts to be matched in degraded form.'
      },
      script_expr: {
        type: 'integer[]',
        desc: 'Language variety <code>art-262</code> (ISO 15924) expression IDs. Restricts results to language varieties written in the specified scripts.'
      },
      script_expr_txt: {
        type: 'string[]',
        desc: 'Language variety <code>art-262</code> (ISO 15924) expression texts. Restricts results to language varieties written in the specified scripts.'
      },
      trans_expr: {
        type: 'integer[]',
        desc: 'Expression IDs. Restricts results to those language varieties containing a one-hop translation of one of the expressions.'
      },
      uid: {
        type: 'string[]',
        desc: 'Language variety uniform identifiers.'
      }
    },
    resFields: {
      denotation_count: {
        type: 'integer',
        desc: 'Number of denotations in the language variety.',
        include: 'denotation_count'
      },
      expr_count: {
        type: 'integer',
        desc: 'Number of expressions in the language variety.',
        include: 'expr_count'
      },
      id: {
        type: 'integer',
        desc: 'Language variety ID number.'
      },
      lang_code: {
        type: 'string',
        desc: 'Three-letter ISO 639 language code.'
      },
      langvar_char: {
        type: 'codepoint_range[]',
        desc: 'Code-point ranges.',
        include: 'langvar_char'
      },
      langvar_cldr_char: {
        type: 'cldr_char[]',
        desc: 'CLDR character objects.',
        include: 'langvar_cldr_char'
      },
      mutable: {
        type: 'boolean',
        desc: 'Whether the language variety is mutable.'
      },
      name_expr: {
        type: 'integer',
        desc: 'Language variety default name’s expression ID.'
      },
      name_expr_txt: {
        type: 'string',
        desc: 'Language variety default name’s expression text.'
      },
      name_expr_txt_degr: {
        type: 'string',
        desc: 'Language variety default name’s degraded expression text.'
      },
      script_expr: {
        type: 'integer',
        desc: 'Language variety’s script, coded as the language variety <code>art-262</code> (ISO 15924) expression ID.'
      },
      script_expr_txt: {
        type: 'string',
        desc: 'Text of the <code>script_expr</code> expression.',
        include: 'script_expr_txt'
      },
      uid: {
        type: 'string',
        desc: 'Language variety’s uniform identifier.'
      },
      var_code: {
        type: 'integer',
        desc: 'Numeric variety code.'
      }
    }
  },

  '/langvar/<id|uid>': {
    type: 'single',
    desc: 'single language variety query',
    reqParams: {
      include: {
        inherit: '/langvar'
      }
    }
  },

  '/langvar/count': {
    type: 'count',
    desc: 'language variety count query',
    reqParams: {
      inherit: '/langvar',
      filterNot: { values: ['include'] }
    }
  },

  '/meaning': {
    type: 'result',
    desc: 'meaning query',
    reqParams: {},
    resFields: {}
  },

  '/meaning/<id>': {
    type: 'single',
    desc: 'single meaning variety query',
    reqParams: {
      include: {
        inherit: '/meaning'
      }
    }
  },

  '/meaning/count': {
    type: 'count',
    desc: 'meaning count query',
    reqParams: {
      inherit: '/meaning',
      filterNot: { values: ['include'] }
    }
  },

  '/norm/definition/<id|uid>': {
    desc: 'definition normalization query',
    reqParams: {},
    resFields: {}
  },

  '/norm/expr/<id|uid>': {
    desc: 'expression normalization query',
    reqParams: {},
    resFields: {}
  },

  '/source': {
    type: 'result',
    desc: 'source query',
    reqParams: {},
    resFields: {}
  },

  '/source/<id|label>': {
    type: 'single',
    desc: 'single source query',
    reqParams: {
      include: {
        inherit: '/source'
      }
    }
  },

  '/source/count': {
    type: 'count',
    desc: 'source count query',
    reqParams: {
      inherit: '/source',
      filterNot: { values: ['include'] }
    }
  },

  '/txt_degr': {
    desc: 'text degradation query',
    reqParams: {},
    resFields: {}
  }
};
