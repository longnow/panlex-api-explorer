var endpoint = 'https://api.panlex.org/v2';

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
    desc: 'Object representing a definition.',
    inherit: '/definition'
  },
  expression: {
    desc: 'Object representing an expression.',
    inherit: '/expr'
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
  trans_path: {
    desc: 'Translation path, consisting of an array of translation hop objects. A translation hop consists of a PanLex meaning with a beginning and end denotation. Expressions tie hops together: one hop’s end denotation has the same expression as the following hop’s beginning denotation. The term “distance-<em>n</em> translation” (where <em>n</em> is typically 1 or 2) refers to a translation with <em>n</em> hops. Each translation hop object has the following fields:',
    example: 'Here is a <code>trans_path</code> object for a distance-1 translation from <code>eng-000</code> (English) “bat” into <code>spa-000</code> (Spanish) “murciélago”: <code>[ { "meaning": 28118413, "source": 5944, "denotation1": 83715137, "denotation2": 83715210 } ]</code>. Since it is a distance-1 translation, there is only one object in the array. The translation is documented in meaning 28118413, which is in source 5944 (<code>fra-mul:Sérasset</code>). The beginning denotation (of “bat”) is 83715137, and the end denotation (of “murciélago”) is 83715210.',
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
        restriction: { params: ['expr','expr_langvar','expt_txt','expr_txt_degr'] }
      },
      expr_langvar: {
        type: 'integer',
        desc: 'Language variety ID of the expression whose meaning is defined.',
        restriction: { params: ['expr','expr_langvar','expt_txt','expr_txt_degr'], include: 'expr_langvar' }
      },
      expr_txt: {
        type: 'string',
        desc: 'Text of the expression whose meaning is defined.',
        restriction: { params: ['expr','expr_langvar','expt_txt','expr_txt_degr'], include: 'expr_txt' }
      },
      expr_txt_degr: {
        type: 'string',
        desc: 'Degraded ext of the expression whose meaning is defined.',
        restriction: { params: ['expr','expr_langvar','expt_txt','expr_txt_degr'], include: 'expr_txt_degr' }
      },
      expr_uid: {
        type: 'integer',
        desc: 'Language variety uniform identifier of the expression whose meaning is defined.',
        restriction: { params: ['expr','expr_langvar','expt_txt','expr_txt_degr'], include: 'expr_uid' }
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
        restriction: { include: 'uid' }
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
        restriction: { include: 'denotation_class' }
      },
      denotation_prop: {
        type: 'prop[]',
        desc: 'Denotation properties.',
        restriction: { include: 'denotation_prop' }
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
        desc: 'Array of the form <code>[field, start, end]</code>. Restricts results to expressions whose <code>field</code> value is alphabetically between the <code>start</code> and <code>end</code> strings. <code>field</code> may be “txt” or “txt_degr”.'
      },
      trans_distance: {
        type: 'integer',
        desc: 'Number of translation hops. Pass 1 for one hop (direct or distance-1 translation), 2 for two hops (indirect or distance-2 translation). Default: 1. Note that if you set this to 2, for performance reasons we recommend that you specify the translated expression(s) with <code>trans_expr</code> rather than one of the alternatives.'
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
        desc: 'Translation quality algorithm. Valid values are “geometric” (the default) and “arithmetic”. See description of the <code>trans_quality</code> response field for details.'
      },
      trans_quality_min: {
        type: 'integer',
        desc: 'Non-negative integer specifying a minimum translation quality. Translations with a lower quality will not be returned. Default: 0, i.e., no minumum.'
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
      { type: 'comment', value: 'The <code>interm1_*</code> and <code>tran_quality_algo</code> parameters are only relevant if <code>trans_distance</code> is 2.' }
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
        restriction: { params: ['trans_expr', 'trans_txt', 'trans_txt_degr'] }
      },
      trans_langvar: {
        type: 'integer',
        desc: 'Language variety ID for expression from which the expression was translated.',
        restriction: { params: ['trans_expr', 'trans_txt', 'trans_txt_degr'], include: 'trans_langvar' }
      },
      trans_path: {
        type: 'trans_path[]',
        desc: 'Translation paths used to produce the translation (see below).',
        restriction: { params: ['trans_expr', 'trans_txt', 'trans_txt_degr'], include: 'trans_path' }
      },
      trans_quality: {
        type: 'integer',
        desc: 'Translation quality score. For <code>trans_distance</code> 1, it is the sum of the quality value of all sources from distinct source groups attesting the translation. The same algorithm is used for <code>trans_distance</code> 2 when <code>trans_quality_algo</code> is “arithmetic”, combining the sources from both hops for the purpose of the score. When <code>trans_quality_algo</code> is “geometric” (the default), it is the sum, rounded to the nearest integer, of the geometric mean of each distinct translation path’s two quality values. Distinctness in this context is defined by the combination of the intermediate expression linking the two hops and the source groups of the two sources. See <a href="https://dev.panlex.org/translation-evaluation/">translation evaluation</a> for more.',
        restriction: { params: ['trans_expr', 'trans_txt', 'trans_txt_degr'], include: 'trans_quality' }
      },
      trans_txt: {
        type: 'string',
        desc: 'Text of expression from which the expression was translated.',
        restriction: { params: ['trans_expr', 'trans_txt', 'trans_txt_degr'], include: 'trans_txt' }
      },
      trans_txt_degr: {
        type: 'string',
        desc: 'Degraded text of expression from which the expression was translated.',
        restriction: { params: ['trans_expr', 'trans_txt', 'trans_txt_degr'], include: 'trans_txt_degr' }
      },
      trans_uid: {
        type: 'string',
        desc: 'Language variety uniform identifier for expression from which the expression was translated.',
        restriction: { params: ['trans_expr', 'trans_txt', 'trans_txt_degr'], include: 'trans_uid' }
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
        restriction: { include: 'uid' }
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
    }
  },

  '/expr/<id|uid>/<text>': {
    type: 'single',
    summary: 'single expression query, with language variety and text',
    reqParams: {
      include: {
        options: ['uid']
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
        restriction: { include: 'denotation_count' }
      },
      expr_count: {
        type: 'integer',
        desc: 'Number of expressions in the language variety.',
        restriction: { include: 'expr_count' }
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
        restriction: { include: 'langvar_char' }
      },
      langvar_cldr_char: {
        type: 'cldr_char[]',
        desc: 'CLDR character objects (see below).',
        restriction: { include: 'langvar_cldr_char' }
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
        restriction: { include: 'script_expr_txt' }
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
        restriction: { include: 'definition' }
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
        restriction: { include: 'meaning_class' }
      },
      meaning_prop: {
        type: 'prop[]',
        desc: 'Meaning properties.',
        restriction: { include: 'meaning_class' }
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
        options: ['langvar','langvar_attested','meaning_count','usr']
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
      directory: {
        type: 'string',
        desc: 'Name of directory in source archive (for internal use).'
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
        restriction: { include: 'langvar' }
      },
      langvar_attested: {
        type: 'integer[]',
        desc: 'IDs of language varieties attested in the source’s denotations.',
        restriction: { include: 'langvar' }
      },
      license: {
        type: 'string',
        desc: 'License type. Can be “copyright”, “Creative Commons”, “GNU Free Documentation License”, “GNU General Public License”, “GNU Lesser General Public License”, “MIT License”, “other”, “PanLex Use Permission”, “public domain”, “request”, or “unknown”.'
      },
      meaning_count: {
        type: 'integer',
        desc: 'Number of meanings in the source.',
        restriction: { include: 'langvar' }
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
        desc: 'Date added to PanLex.'
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
        restriction: { include: 'langvar' }
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
