var urlParams = {
  id: {
    desc: 'ID.'
  },
  'id|label': {
    desc: 'Source ID or label.'
  },
  'id|uid': {
    desc: 'Language variety ID or uniform identifier.'
  },
  text: {
    desc: 'Expression text.'
  }
};

var objectTypes = {
  cldr_char: {
    desc: 'Object representing an <a href="http://cldr.unicode.org/translation/characters#TOC-Exemplar-Characters">exemplar character</a> for a language variety, as defined by the Unicode Common Locale Data Repository.',
    fields: {
      category: {
        type: 'string',
        desc: 'Character category, typically <code>"pri"</code> (primary/standard), <code>"aux"</code> (auxiliary), or <code>"pun"</code> (punctuation).'
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
  class: {
    desc: 'Two-element array representing a classification. The first element is the superclass expression ID (<code>null</code> if none). The second element is the class expression ID.'
  },
  class_query: {
    desc: 'Two-element array representing a classification query. The first element is a superclass expression ID (<code>null</code> if none). The second element is a class expression ID (<code>null</code> to match all expressions).'
  },
  codepoint_range: {
    desc: 'Two-element array representing a range of permissible Unicode characters for a language variety. The first element is the numeric value of the first code-point in the range and the second element is the numeric value of the last code-point in the range.',
    example: 'For English (language variety <em>eng-000</em>), the first code point object is <code>[32, 33]</code>. This includes the range from U+0020 (SPACE) to U+0021 (EXCLAMATION MARK). Note that JSON numeric values are always decimal.'
  },
  definition: {
    inherit: '/definition'
  },
  denotation: {
    inherit: '/denotation'
  },
  expression: {
    inherit: '/expr'
  },
  langvar: {
    inherit: '/langvar'
  },
  meaning: {
    inherit: '/meaning'
  },
  norm: {
    desc: 'Normalization object mapping an expression or definition text (as a key) to a value. When <code>degrade</code> is <code>false</code>, the value is a single score object. When <code>degrade</code> is <code>true</code>, the value is an array of score objects for all items sharing the key’s degraded text, sorted from highest to lowest score. Score objects contain the following fields:',
    fields: {
      score: {
        type: 'integer',
        desc: 'The expression or definition’s normalization score. This is the sum of the quality ratings of the sources of the expression’s denotations or the definition’s meanings. (Multiple sources from the same source group are counted as a single attestation for this purpose.) Thus, the more sources attest the existence of an expression, the higher its score, but the score is weighted by source quality. If no expression or definition exists with the corresponding text, the score will be zero.'
      },
      txt: {
        type: 'string',
        desc: 'Text of the expression or definition whose degraded text matches the key. Only included when <code>degrade</code> is <code>true</code>.'
      }
    }
  },
  prop: {
    desc: 'Two-element array representing a property. The first element is the attribute expression ID. The second element is the property string.'
  },
  prop_query: {
    desc: 'Two-element array representing a property query. The first element is an attribute expression ID. The second element is a property string (<code>null</code> to match all strings).'
  },
  source: {
    inherit: '/source'
  },
  trans_path: {
    desc: 'Translation path, consisting of an array of translation hop objects. A translation hop consists of a PanLex meaning with a beginning and end denotation. Expressions tie hops together: one hop’s end denotation has the same expression as the following hop’s beginning denotation. The term “distance-<em>n</em> translation” (where <em>n</em> is typically 1 or 2) refers to a translation with <em>n</em> hops. Each translation hop object has the following fields:',
    example: 'Here is a <code>trans_path</code> array for a distance-1 translation from <code>eng-000</code> (English) “bat” into <code>spa-000</code> (Spanish) “murciélago”: <code>[ { "meaning": 28118413, "source": 5944, "denotation1": 83715137, "denotation2": 83715210 } ]</code>. Since it is a distance-1 translation, there is only one object in the array. The translation is documented in meaning 28118413, which is in source 5944 (<code>fra-mul:Sérasset</code>). The beginning denotation (of “bat”) is 83715137, and the end denotation (of “murciélago”) is 83715210.',
    fields: {
      denotation1: {
        type: 'integer',
        desc: 'Beginning denotation ID.'
      },
      denotation2: {
        type: 'integer',
        desc: 'End denotation ID.'
      },
      expr2: {
        type: 'integer',
        desc: 'ID of the expression that ties the hop to the next one. Not included for final hops.'
      },
      langvar2: {
        type: 'integer',
        desc: 'Language variety ID of <code>expr2</code>. Not included for final hops.'
      },
      meaning: {
        type: 'integer',
        desc: 'Meaning ID.'
      },
      source: {
        type: 'integer',
        desc: 'Source ID'
      }
    }
  }
}

var queryDefaults = {
  all: {
    method: 'POST',
    reqParamsGlobal: {
      cache: {
        type: 'boolean',
        desc: 'Whether to return cached responses. Default <code>true</code>. Set to <code>false</code> if you want to ensure that your response contains the latest data from the database. Cached responses will be no more than 24 hours old.'
      },
      echo: {
        type: 'boolean',
        desc: 'Whether to pass the query back in the response as <code>request</code>, which is an object with the keys <code>url</code> and <code>query</code>. Default <code>false</code>.'
      },
      indent: {
        type: 'boolean',
        desc: 'Whether to pretty-print the JSON response. Default <code>false</code>.'
      }
    },
    resFieldsRoot: {
      request: {
        type: 'object',
        desc: 'The request’s query, if <code>echo</code> was enabled.'
      }
    }
  },

  result: {
    reqParams: {
      include: {
        type: 'string[]',
        desc: 'Additional fields to include in the response.'
      }
    },
    reqParamsGlobal: {
      after: {
        type: 'scalar[]',
        desc: 'Integers or strings containing values of <code>sort</code> fields. Records will be returned that occur immediately after the indicated value(s) in the sort order. Can be used as an alternative to <code>offset</code>.'
      },
      limit: {
        type: 'integer',
        desc: 'Maximum number of records to return. Default: <code>resultMax</code>, i.e., the maximum.'
      },
      offset: {
        type: 'integer',
        desc: 'How many records to omit from the beginning of the returned records. Default: 0. Cannot be greater than 250000.'
      },
      sort: {
        type: 'string[]',
        desc: 'Fields to sort the result by. Sort strings take the format <em>&lt;field&gt;</em> or <em>&lt;field&gt; asc</em> for ascending order, <em>&lt;field&gt; desc</em> for descending order. You may also sort by <code>include</code> fields if they are present and do not return an array. If you sort by the special field <code>random</code>, the result will be returned in random order. Default: <code>id asc</code>.'
      }
    },
    resFieldsRoot: {
      result: {
        type: 'object[]',
        desc: 'Result objects. Limited to <code>resultMax</code> per query. Use <code>after</code> or <code>offset</code> to get more.'
      },
      resultMax: {
        type: 'integer',
        desc: 'Maximum number of <code>result</code> objects that will be returned in a single query (currently 2000).'
      },
      resultNum: {
        type: 'integer',
        desc: 'Number of objects returned in <code>result</code>.'
      },
      resultType: {
        type: 'string',
        desc: 'Type of objects in <code>result</code>.'
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
    resFieldsRoot: {
      count: {
        type: 'integer',
        desc: 'Number of results found.'
      },
      countType: {
        type: 'string',
        desc: 'Type of objects counted in <code>count</code>.'
      }
    }
  },

  single: {
    method: 'GET',
    reqParams: {
      include: {
        type: 'string[]',
        desc: 'Additional fields to include in the response.'
      }
    }
  },

  other: {}
};

var queries = {
  '/definition': {
    type: 'result',
    summary: 'definition query',
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
    reqParamsRestrictions: [
      { type: 'atLeastOne', not: true, value: ['include'], context: 'If you pass <code>after</code> or <code>offset</code>' }
    ],
    resFields: {
      expr: {
        type: 'integer',
        desc: 'ID of the expression with which the definition shares a meaning.',
        onlyWhen: { params: ['expr','expr_langvar','expr_txt','expr_txt_degr'] }
      },
      expr_langvar: {
        type: 'integer',
        desc: 'Language variety ID of the expression whose meaning is defined.',
        onlyWhen: { params: ['expr','expr_langvar','expr_txt','expr_txt_degr'], include: true }
      },
      expr_txt: {
        type: 'string',
        desc: 'Text of the expression whose meaning is defined.',
        onlyWhen: { params: ['expr','expr_langvar','expr_txt','expr_txt_degr'], include: true }
      },
      expr_txt_degr: {
        type: 'string',
        desc: 'Degraded ext of the expression whose meaning is defined.',
        onlyWhen: { params: ['expr','expr_langvar','expr_txt','expr_txt_degr'], include: true }
      },
      expr_uid: {
        type: 'integer',
        desc: 'Language variety uniform identifier of the expression whose meaning is defined.',
        onlyWhen: { params: ['expr','expr_langvar','expr_txt','expr_txt_degr'], include: true }
      },
      id: {
        type: 'integer',
        desc: 'Definition ID.'
      },
      langvar: {
        type: 'integer',
        desc: 'ID of the language variety in which the definition is written.'
      },
      meaning: {
        type: 'integer',
        desc: 'ID of the meaning to which the definition belongs.'
      },
      txt: {
        type: 'string',
        desc: 'Text of the definition.'
      },
      txt_degr: {
        type: 'string',
        desc: 'Degraded text of the definition.'
      },
      uid: {
        type: 'string',
        desc: 'Uniform identifier of the language variety in which the definition is written.',
        onlyWhen: { include: true }
      }
    }
  },

  '/definition/<id>': {
    type: 'single',
    summary: 'single definition query',
    reqParams: {
      include: {
        inherit: '/definition'
      }
    },
    resFieldsRoot: {
      definition: {
        type: 'definition',
        desc: 'Definition object.'
      }
    }
  },

  '/definition/count': {
    type: 'count',
    summary: 'definition count query',
    reqParams: {
      inherit: '/definition',
      filter: { not: true, value: ['include'] }
    }
  },

  '/denotation': {
    type: 'result',
    summary: 'denotation query',
    reqParams: {
      denotation_class: {
        type: 'class_query[]',
        desc: 'Denotation classification query (see below).'
      },
      denotation_prop: {
        type: 'prop_query[]',
        desc: 'Denotation property query (see below).'
      },
      expr: {
        type: 'integer[]',
        desc: 'Expression IDs.'
      },
      id: {
        type: 'integer[]',
        desc: 'Denotation IDs.'
      },
      include: {
        options: ['denotation_class', 'denotation_prop']
      },
      langvar: {
        type: 'integer[]',
        desc: 'Language variety IDs. Restricts results to denotations of expressions in the specified language varieties.'
      },
      meaning: {
        type: 'integer[]',
        desc: 'Meaning IDs.'
      },
      source: {
        type: 'integer[]',
        desc: 'Source IDs.'
      },
      uid: {
        type: 'string[]',
        desc: 'Language variety uniform identifiers. Restricts results to denotations of expressions in the specified language varieties.'
      }
    },
    reqParamsRestrictions: [
      { type: 'atLeastOne', value: ['expr','id','langvar','meaning','source','uid'], context: 'If you pass <code>after</code> or <code>offset</code>' }
    ],
    resFields: {
      denotation_class: {
        type: 'class[]',
        desc: 'Denotation classifications.',
        onlyWhen: { include: true }
      },
      denotation_prop: {
        type: 'prop[]',
        desc: 'Denotation properties.',
        onlyWhen: { include: true }
      },
      expr: {
        type: 'integer',
        desc: 'Expression ID.'
      },
      id: {
        type: 'integer',
        desc: 'Denotation ID.'
      },
      meaning: {
        type: 'integer',
        desc: 'Meaning ID.'
      },
      source: {
        type: 'integer',
        desc: 'Source ID.'
      }
    }
  },

  '/denotation/<id>': {
    type: 'single',
    summary: 'single denotation query',
    reqParams: {
      include: {
        inherit: '/denotation'
      }
    },
    resFieldsRoot: {
      denotation: {
        type: 'denotation',
        desc: 'Denotation object.'
      }
    }
  },

  '/denotation/count': {
    type: 'count',
    summary: 'denotation count query',
    reqParams: {
      inherit: '/definition',
      filter: { not: true, value: ['include'] }
    }
  },

  '/expr': {
    type: 'result',
    summary: 'expression or translation query',
    reqParams: {
      id: {
        type: 'integer[]',
        desc: 'Expression IDs.'
      },
      include: {
        options: ['trans_langvar', 'trans_path', 'trans_quality', 'trans_txt', 'trans_txt_degr', 'trans_uid','uid']
      },
      interm1_expr_langvar: {
        type: 'integer[]',
        desc: 'Language variety IDs. Restricts results to expressions whose distance-2 intermediate expression is in the specified language varieties.'
      },
      interm1_expr_uid: {
        type: 'string[]',
        desc: 'Language variety uniform identifiers. Restricts results to expressions whose distance-2 intermediate expression is in the specified language varieties. (Only relevant if <code>trans_distance</code> is 2.)'
      },
      interm1_grp: {
        type: 'integer[]',
        desc: 'Source group IDs. Restricts results to expressions whose distance-2 translation’s ending (“intermediate”) source is one of the specified sources.'
      },
      interm1_source: {
        type: 'integer[]',
        desc: 'Source IDs. Restricts results to expressions whose distance-2 translation’s ending (“intermediate”) source is one of the specified sources.'
      },
      lang_code: {
        type: 'string[]',
        desc: 'Three-letter ISO 639 language codes. Restricts results to expressions in varieties of the specified languages.'
      },
      langvar: {
        type: 'integer[]',
        desc: 'Language variety IDs. Restricts results to expressions in the specified language varieties.'
      },
      mutable: {
        type: 'boolean',
        desc: 'Restricts results to expressions from language varieties that are mutable (if <code>true</code>) or immutable (if <code>false</code>).'
      },
      range: {
        type: 'string[]',
        desc: 'Array of the form <code>[field, start, end]</code>. Restricts results to expressions whose <code>field</code> value is alphabetically between the <code>start</code> and <code>end</code> strings. <code>field</code> may be <code>"txt"</code> or <code>"txt_degr"</code>.'
      },
      trans_distance: {
        type: 'integer',
        desc: 'Number of translation hops. Pass 1 for one hop (direct or distance-1 translation), 2 for two hops (indirect or distance-2 translation). Default: 1. Only relevant if you are translating. Note that if you set this to 2, for performance reasons we recommend that you specify the translated expression(s) with <code>trans_expr</code> rather than one of the alternatives.'
      },
      trans_grp: {
        type: 'integer[]',
        desc: 'Source group IDs. Restricts results to expressions that are translations originating in the specified source groups.'
      },
      trans_expr: {
        type: 'integer[]',
        desc: 'Expression IDs. Restricts results to expressions that are translations of the specified expressions.'
      },
      trans_langvar: {
        type: 'integer[]',
        desc: 'Language variety IDs. Restricts results to expressions that are translations of the specified language varieties’ expressions.'
      },
      trans_quality_algo: {
        type: 'string',
        desc: 'Translation quality algorithm. Valid values are <code>"geometric"</code> (the default) and <code>"arithmetic"</code>. Only relevant when <code>trans_distance</code> is 2. See description of the <code>trans_quality</code> response field below for details.'
      },
      trans_quality_min: {
        type: 'integer',
        desc: 'Non-negative integer specifying a minimum translation quality. Translations with a lower quality will not be returned. Default: 0, i.e., no minumum. Only relevant if you are translating.'
      },
      trans_source: {
        type: 'integer[]',
        desc: 'Source IDs. Restricts results to expressions that are translations originating in the specified sources.'
      },
      trans_txt: {
        type: 'string[]',
        desc: 'Expression texts. Restricts results to expressions that are translations of expressions with matching texts.'
      },
      trans_txt_degr: {
        type: 'string[]',
        desc: 'Expression texts. Restricts results to expressions that are translations of expressions with matching texts in their degraded form.'
      },
      trans_uid: {
        type: 'string[]',
        desc: 'Language variety uniform identifiers. Restricts results to expressions that are translations of expressions in the specified language varieties.'
      },
      txt: {
        type: 'string[]',
        desc: 'Expression texts.'
      },
      txt_degr: {
        type: 'string[]',
        desc: 'Expression texts to be matched in degraded form.'
      },
      uid: {
        type: 'string[]',
        desc: 'Language variety uniform identifiers. Restricts results to expressions from the specified language varieties.'
      }
    },
    reqParamsRestrictions: [
      { type: 'atLeastOne', not: true, value: ['include','mutable'], context: 'If you pass <code>after</code> or <code>offset</code>' },
      { type: 'atLeastOne', value: ['trans_expr', 'trans_txt', 'trans_txt_degr'], context: 'If you are translating' },
      { type: 'comment', value: 'The <code>trans_distance</code> and <code>trans_quality_min</code> parameters are only relevant if you have specified one of the translation parameters in the previous item.' },
      { type: 'comment', value: 'The <code>interm1_*</code> and <code>trans_quality_algo</code> parameters are only relevant if <code>trans_distance</code> is 2.' }
    ],
    resFields: {
      id: {
        type: 'integer',
        desc: 'Expression ID.'
      },
      langvar: {
        type: 'integer',
        desc: 'Expression’s language variety ID.'
      },
      trans_expr: {
        type: 'integer',
        desc: 'ID of expression from which the expression was translated.',
        onlyWhen: { params: ['trans_expr', 'trans_txt', 'trans_txt_degr'] }
      },
      trans_langvar: {
        type: 'integer',
        desc: 'Language variety ID for expression from which the expression was translated.',
        onlyWhen: { params: ['trans_expr', 'trans_txt', 'trans_txt_degr'], include: true }
      },
      trans_path: {
        type: 'trans_path[]',
        desc: 'Translation paths used to produce the translation (see below).',
        onlyWhen: { params: ['trans_expr', 'trans_txt', 'trans_txt_degr'], include: true }
      },
      trans_quality: {
        type: 'integer',
        desc: 'Translation quality score. For <code>trans_distance</code> 1, it is the sum of the quality value of all sources from distinct source groups attesting the translation. The same algorithm is used for <code>trans_distance</code> 2 when <code>trans_quality_algo</code> is <code>"arithmetic"</code>, combining the sources from both hops for the purpose of the score. When <code>trans_quality_algo</code> is <code>"geometric"</code> (the default), it is the sum, rounded to the nearest integer, of the geometric mean of each distinct translation path’s two quality values. Distinctness in this context is defined by the combination of the intermediate expression linking the two hops and the source groups of the two sources. See <a href="https://dev.panlex.org/translation-evaluation/">translation evaluation</a> for more.',
        onlyWhen: { params: ['trans_expr', 'trans_txt', 'trans_txt_degr'], include: true }
      },
      trans_txt: {
        type: 'string',
        desc: 'Text of expression from which the expression was translated.',
        onlyWhen: { params: ['trans_expr', 'trans_txt', 'trans_txt_degr'], include: true }
      },
      trans_txt_degr: {
        type: 'string',
        desc: 'Degraded text of expression from which the expression was translated.',
        onlyWhen: { params: ['trans_expr', 'trans_txt', 'trans_txt_degr'], include: true }
      },
      trans_uid: {
        type: 'string',
        desc: 'Language variety uniform identifier for expression from which the expression was translated.',
        onlyWhen: { params: ['trans_expr', 'trans_txt', 'trans_txt_degr'], include: true }
      },
      txt: {
        type: 'string',
        desc: 'Expression text.'
      },
      txt_degr: {
        type: 'string',
        desc: 'Degraded expression text.'
      },
      uid: {
        type: 'string',
        desc: 'Expression’s language variety uniform identifier.',
        onlyWhen: { include: true }
      }
    }
  },

  '/expr/<id>': {
    type: 'single',
    summary: 'single expression query, with ID',
    reqParams: {
      include: {
        options: ['uid']
      }
    },
    resFieldsRoot: {
      expression: {
        type: 'expression',
        desc: 'Expression object.'
      }
    }
  },

  '/expr/<id|uid>/<text>': {
    type: 'single',
    summary: 'single expression query, with language variety and text',
    reqParams: {
      include: {
        options: ['uid']
      }
    },
    resFieldsRoot: {
      expression: {
        type: 'expression',
        desc: 'Expression object.'
      }
    }
  },

  '/expr/count': {
    type: 'count',
    summary: 'expression count query',
    reqParams: {
      inherit: '/expr',
      filter: { not: true, value: ['include'] }
    },
    reqParamsRestrictions: {
      inherit: '/expr',
      filter: { not: true, key: 'type', value: ['atLeastOne'] }
    }
  },

  '/expr/index': {
    type: 'other',
    summary: 'expression index query',
    desc: 'Produces an alphabetically sorted index summarizing chunks of expressions in the specified language varieties, or in all varieties in PanLex. Expressions are first sorted by their degraded expression text, then divided into chunks of size <code>step</code>. The result is a list of chunks with a starting and ending expression.',
    reqParams: {
      langvar: {
        type: 'integer[]',
        desc: 'Language variety IDs.'
      },
      step: {
        type: 'integer',
        desc: 'The number of expressions summarized in each index item. Minimum 250.',
      },
      uid: {
        type: 'string[]',
        desc: 'Language variety uniform identifiers.'
      }
    },
    reqParamsRestrictions: [
      { type: 'required', value: 'step' },
      { type: 'comment', value: 'Because this query can produce large responses, the <code>indent</code> parameter is ignored.' }
    ],
    resFieldsRoot: {
      index: {
        type: 'expression[][]',
        desc: 'Array of two-element arrays containing expression objects, representing the first and last expression from each index chunk.'
      }
    }
  },

  '/langvar': {
    type: 'result',
    summary: 'language variety query',
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
        onlyWhen: { include: true }
      },
      expr_count: {
        type: 'integer',
        desc: 'Number of expressions in the language variety.',
        onlyWhen: { include: true }
      },
      id: {
        type: 'integer',
        desc: 'Language variety ID.'
      },
      lang_code: {
        type: 'string',
        desc: 'Three-letter ISO 639 language code.'
      },
      langvar_char: {
        type: 'codepoint_range[]',
        desc: 'Code-point ranges (see below).',
        onlyWhen: { include: true }
      },
      langvar_cldr_char: {
        type: 'cldr_char[]',
        desc: 'CLDR character objects (see below).',
        onlyWhen: { include: true }
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
        onlyWhen: { include: true }
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
    summary: 'single language variety query',
    reqParams: {
      include: {
        inherit: '/langvar'
      }
    },
    resFieldsRoot: {
      langvar: {
        type: 'langvar',
        desc: 'Language variety object.'
      }
    }
  },

  '/langvar/count': {
    type: 'count',
    summary: 'language variety count query',
    reqParams: {
      inherit: '/langvar',
      filter: { not: true, value: ['include'] }
    }
  },

  '/meaning': {
    type: 'result',
    summary: 'meaning query',
    reqParams: {
      expr: {
        type: 'integer[]',
        desc: 'Expression IDs. Restricts results to meanings containing all of the specified expressions.'
      },
      id: {
        type: 'integer[]',
        desc: 'Meaning IDs'
      },
      include: {
        options: ['definition','meaning_class','meaning_prop']
      },
      meaning_class: {
        type: 'class_query[]',
        desc: 'Meaning classification query (see below).'
      },
      meaning_prop: {
        type: 'prop_query',
        desc: 'Meaning property query (see below).'
      },
      source: {
        type: 'integer[]',
        desc: 'Source IDs.'
      }
    },
    reqParamsRestrictions: [
      { type: 'atLeastOne', value: ['expr','meaning','source'], context: 'If you pass <code>after</code> or <code>offset</code>' }
    ],
    resFields: {
      definition: {
        type: 'definition[]',
        desc: 'The meaning’s definitions.',
        onlyWhen: { include: true }
      },
      denotation: {
        type: 'integer[]',
        desc: 'IDs of denotations of the meaning.'
      },
      expr: {
        type: 'integer[]',
        desc: 'IDs of expressions with the meaning.'
      },
      id: {
        type: 'integer',
        desc: 'Meaning ID.'
      },
      meaning_class: {
        type: 'class[]',
        desc: 'Meaning classifications.',
        onlyWhen: { include: true }
      },
      meaning_prop: {
        type: 'prop[]',
        desc: 'Meaning properties.',
        onlyWhen: { include: true }
      },
      source: {
        type: 'integer',
        desc: 'Source ID.'
      }
    }
  },

  '/meaning/<id>': {
    type: 'single',
    summary: 'single meaning variety query',
    reqParams: {
      include: {
        inherit: '/meaning'
      }
    },
    resFieldsRoot: {
      meaning: {
        type: 'meaning',
        desc: 'Meaning object.'
      }
    }
  },

  '/meaning/count': {
    type: 'count',
    summary: 'meaning count query',
    reqParams: {
      inherit: '/meaning',
      filter: { not: true, value: ['include'] }
    }
  },

  '/norm/definition/<id|uid>': {
    type: 'other',
    summary: 'definition normalization query',
    desc: 'Returns normalization scores and normalized texts for a set of definition texts in a language variety.',
    reqParams: {
      degrade: {
        type: 'boolean',
        desc: 'Whether to compare the degraded text of each value in <code>txt</code> against the degraded text of existing definitions in PanLex. Default: <code>false</code>.'
      },
      grp: {
        type: 'integer[]',
        desc: 'Source group IDs. Meanings from these source groups will be ignored when calculating scores. Default: <code>[]</code>.'
      },
      txt: {
        type: 'string[]',
        desc: 'Definition texts to normalize.'
      }
    },
    resFieldsRoot: {
      langvar: {
        type: 'langvar',
        desc: 'Language variety object.'
      },
      norm: {
        type: 'norm',
        desc: 'Normalization object (see below).'
      }
    }
  },

  '/norm/expr/<id|uid>': {
    type: 'other',
    summary: 'expression normalization query',
    desc: 'Returns normalization scores and normalized texts for a set of expression texts in a language variety.',
    reqParams: {
      degrade: {
        type: 'boolean',
        desc: 'Whether to compare the degraded text of each value in <code>txt</code> against the degraded text of existing expressions in PanLex. Default: <code>false</code>.'
      },
      grp: {
        type: 'integer[]',
        desc: 'Source group IDs. Meanings from these source groups will be ignored when calculating scores. Default: <code>[]</code>.'
      },
      txt: {
        type: 'string[]',
        desc: 'Expression texts to normalize.'
      }
    },
    resFieldsRoot: {
      langvar: {
        type: 'langvar',
        desc: 'Language variety object.'
      },
      norm: {
        type: 'norm',
        desc: 'Normalization object (see below).'
      }
    }
  },

  '/source': {
    type: 'result',
    summary: 'source query',
    reqParams: {
      expr: {
        type: 'integer[]',
        desc: 'Expression IDs. Restricts results to sources containing all of the specified expressions, whether in the same meaning or not.'
      },
      grp: {
        type: 'integer[]',
        desc: 'Source group IDs.'
      },
      id: {
        type: 'integer[]',
        desc: 'Source IDs.'
      },
      include: {
        options: ['denotation_count', 'langvar','langvar_attested','meaning_count','usr']
      },
      label: {
        type: 'string[]',
        desc: 'Source labels.'
      },
      langvar: {
        type: 'integer[]',
        desc: 'Language variety IDs. Restricts results to sources with those declared language varieties.'
      },
      meaning: {
        type: 'boolean',
        desc: 'Restricts results to sources with one or more meanings (if <code>true</code>) or no meanings (if <code>false</code>).'
      },
      trans_expr: {
        type: 'integer[]',
        desc: 'Expression IDs. Restricts results to sources with at least one meaning that contains all of the specified expressions.'
      },
      uid: {
        type: 'string[]',
        desc: 'Language variety uniform identifiers. Restricts results to sources with those declared language varieties.'
      },
      usr: {
        type: 'string[]',
        desc: 'PanLem usernames. Restricts results to sources with at least one of the PanLem users as a meaning editor.'
      }
    },
    resFields: {
      author: {
        type: 'string',
        desc: 'Author(s).'
      },
      denotation_count: {
        type: 'integer',
        desc: 'Number of denotations of the source’s meanings.',
        onlyWhen: { include: true }
      },
      directory: {
        type: 'string',
        desc: 'Name of resource directory in archive (for internal use).'
      },
      grp: {
        type: 'integer',
        desc: 'ID of source group to which the source belongs.'
      },
      id: {
        type: 'integer',
        desc: 'Source ID.'
      },
      ip_claim: {
        type: 'string',
        desc: 'Summary of intellectual property claim (if known).'
      },
      ip_claimant: {
        type: 'string',
        desc: 'Intellectual property claimant (if known).'
      },
      ip_claimant_email: {
        type: 'string',
        desc: 'Intellectual property claimant’s email address (if known).'
      },
      isbn: {
        type: 'string',
        desc: 'ISBN number.'
      },
      label: {
        type: 'string',
        desc: 'Source label.'
      },
      langvar: {
        type: 'integer[]',
        desc: 'IDs of language varieties declared as documented in the source',
        onlyWhen: { include: true }
      },
      langvar_attested: {
        type: 'integer[]',
        desc: 'IDs of language varieties attested in the source’s denotations.',
        onlyWhen: { include: true }
      },
      license: {
        type: 'string',
        desc: 'License type. Can be <code>"copyright"</code>, <code>"Creative Commons"</code>, <code>"GNU Free Documentation License"</code>, <code>"GNU General Public License"</code>, <code>"GNU Lesser General Public License"</code>, <code>"MIT License"</code>, <code>"other"</code>, <code>"PanLex Use Permission"</code>, <code>"public domain"</code>, <code>"request"</code>, or <code>"unknown"</code>.'
      },
      meaning_count: {
        type: 'integer',
        desc: 'Number of meanings in the source.',
        onlyWhen: { include: true }
      },
      note: {
        type: 'string',
        desc: 'Miscellaneous notes.'
      },
      quality: {
        type: 'integer',
        desc: 'Quality rating assigned by PanLex editor (0 = lowest, 9 = highest).'
      },
      reg_date: {
        type: 'string',
        desc: 'Date added to PanLex, in ISO 8601 format.'
      },
      title: {
        type: 'string',
        desc: 'Title.'
      },
      url: {
        type: 'string',
        desc: 'URL.'
      },
      usr: {
        type: 'integer[]',
        desc: 'Meaning editors’ PanLem usernames.',
        onlyWhen: { include: true }
      },
      year: {
        type: 'integer',
        desc: 'Year of publication.'
      }
    }
  },

  '/source/<id|label>': {
    type: 'single',
    summary: 'single source query',
    reqParams: {
      include: {
        inherit: '/source'
      }
    },
    resFieldsRoot: {
      source: {
        type: 'source',
        desc: 'Source object.'
      }
    }
  },

  '/source/count': {
    type: 'count',
    summary: 'source count query',
    reqParams: {
      inherit: '/source',
      filter: { not: true, value: ['include'] }
    }
  },

  '/txt_degr': {
    type: 'other',
    summary: 'text degradation query',
    desc: 'Returns degraded texts for arbitrary input strings.',
    reqParams: {
      txt: {
        type: 'string[]',
        desc: 'Strings to degrade.'
      }
    },
    resFieldsRoot: {
      txt_degr: {
        type: 'object',
        desc: 'Maps each input text (as a key) to its degraded text.'
      }
    }
  }
};

// populate urlParams
for (var i in urlParams) urlParams[i].name = i;

// populate queryDefaults
for (var i in queryDefaults) {
  if (i === 'all') continue;

  // apply "all" values to this query type
  queryDefaults[i] = deepCopyExtend(queryDefaults.all, queryDefaults[i]);

  // apply inherited values
  for (var j in queryDefaults[i]) {
    for (var k in queryDefaults[i][j]) {
      var inherit = queryDefaults[i][j][k].inherit;
      if (inherit) queryDefaults[i][j][k] = queryDefaults[inherit][j][k];
    }
  }
}

// populate inherited reqParams and reqParamsRestrictions
for (var i in queries) {
  var q = queries[i];

  if (q.reqParams.inherit) { // inherit all params
    var f = q.reqParams.filter;
    q.reqParams = deepCopy(queries[q.reqParams.inherit].reqParams);
    if (f) applyObjFilter(q.reqParams, f);
  }
  else {
    for (var j in q.reqParams) {
      if (q.reqParams[j].inherit) { // inherit single param
        var f = q.reqParams[j].filter;
        q.reqParams[j] = deepCopy(queries[q.reqParams[j].inherit].reqParams[j]);
        if (f) applyObjFilter(q.reqParams[j], f);
      }
    }
  }

  if (q.reqParamsRestrictions && q.reqParamsRestrictions.inherit) {
    var f = q.reqParamsRestrictions.filter;
    q.reqParamsRestrictions = queries[q.reqParamsRestrictions.inherit].reqParamsRestrictions.slice();
    if (f) applyArrayFilter(q.reqParamsRestrictions, f);
  }
}

// populate query fields:
// - from queryDefaults
// - types
// - resFields onlyWhen desc
// - reqParams include desc
// - reqParamsRestrictions desc
// - urlParams
for (var i in queries) {
  // apply default values for the query's type
  if (queryDefaults[queries[i].type])
    queries[i] = deepCopyExtend(queryDefaults[queries[i].type], queries[i]);

  var q = queries[i];

  var types = {};

  // identify request parameter and response object types that are documented
  ['reqParams', 'resFields', 'resFieldsRoot'].forEach(function (j) {
    for (var k in q[j]) {
      var type = q[j][k].type;
      if (type) {
        var baseType = type.replace(/(?:\[\])+$/, '');
        if (objectTypes[baseType]) types[type] = baseType;
      }

      // populate resFields onlyWhen desc
      if (j === 'resFields') resFieldsOnlyWhenDesc(q.resFields[k].onlyWhen, k);
    }
  });

  if (Object.keys(types).length) q.types = types;

  // populate reqParams include desc
  reqParamsIncludeDesc(q.reqParams.include);

  // populate reqParamsRestrictions and its desc
  q.reqParamsRestrictions = q.reqParamsRestrictions || [];
  q.reqParamsRestrictions.unshift({ type: 'comment', value: 'For arbitrary-length array parameters, if there is just one element, you may pass it directly (<code>"a"</code> instead of <code>["a"]</code>).' });
  reqParamsRestrictionsDesc(q.reqParamsRestrictions);

  // populate urlParams
  var matches = i.match(/<[^>]+>/g);
  if (matches) {
    q.urlParams = matches.map(function (item) {
      var param = item.slice(1, item.length - 1);
      return urlParams[param];
    });
  }
}

// populate objectTypes
for (var i in objectTypes) {
  objectTypes[i].name = i;

  if (objectTypes[i].inherit) {
    var fields = objectTypes[i].fields = {};
    var theirFields = queries[objectTypes[i].inherit].resFields;

    for (var j in theirFields) {
      if (!theirFields[j].onlyWhen) fields[j] = theirFields[j];
    }
  }
}

function deepCopy(obj) {
  return $.extend(true, {}, obj);
}

function deepCopyExtend(obj1, obj2) {
  return $.extend(true, deepCopy(obj1), obj2);
}

function applyObjFilter(obj, f) {
  var sign =  f.not ? -1 : 1;

  var set = {};
  f.value.forEach(function (i) { set[i] = 1 });

  for (var i in obj) {
    if ((set[i] || -1)*sign === -1) delete obj[i];
  }

  return obj;
}

function applyArrayFilter(array, f) {
  var sign =  f.not ? -1 : 1;

  var set = {};
  f.value.forEach(function (i) { set[i] = 1 });

  if (f.key) {
    for (var i = 0; i < array.length; i++) {
      if ((set[array[i][f.key]] || -1)*sign === -1) array.splice(i--, 1);
    }
  }
  else {
    for (var i = 0; i < array.length; i++) {
      if ((set[array[i]] || -1)*sign === -1) array.splice(i--, 1);
    }
  }
}

function resFieldsOnlyWhenDesc(onlyWhen, field) {
  if (!onlyWhen) return;

  var desc = [];

  if (onlyWhen.include) {
    if (onlyWhen.include !== true) field = onlyWhen.include;
    desc.push('<code>' + field + '</code> in the <code>include</code> parameter');
  }

  if (onlyWhen.params) {
    var params = onlyWhen.params.map(function (p) { return '<code>' + p + '</code>' });
    params[params.length - 1] = 'or ' + params[params.length - 1];
    desc.push('one of the following parameters: ' + params.join(', '));
  }

  onlyWhen.desc = 'Only returned when you pass ' + desc.join(', and when you pass ') + '.';
}

function reqParamsIncludeDesc(include) {
  if (!include || !include.options) return;

  include.desc += ' Possible values: '
    + include.options.map(function (p) { return '<code>' + p + '</code>' }).join(', ')
    + '.';
}

function reqParamsRestrictionsDesc(restrictions) {
  restrictions.forEach(function (r) {
    if (r.type === 'atLeastOne') {
      var str = r.context ? r.context + ', you ' : 'You ';
      var conj;

      if (r.not) {
        str += 'must pass at least one parameter other than ';
        conj = 'and';
      }
      else {
        str += 'must pass at least one of the following parameters: ';
        conj = 'or';
      }

      var value = r.value.map(function (p) { return '<code>' + p + '</code>' });
      if (value.length > 2) {
        value[value.length - 1] = conj + ' ' + value[value.length - 1];
        str += value.join(', ');
      }
      else str += value.join(' ' + conj + ' ');

      r.desc = str + '.';
    }
    else if (r.type === 'comment') {
      r.desc = r.value;
    }
    else if (r.type === 'required') {
      r.desc = 'The parameter <code>' + r.value + '</code> is required.';
    }
  });
}
