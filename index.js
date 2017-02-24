var endpoint = 'https://api.panlex.org/v2';

var urlParams = {
  definition: {
    type: 'integer'
  },
  denotation: {
    type: 'integer'
  },
  expr: {
    type: 'integer'
  },
  exprtxt: {
    type: 'string'
  },
  langvar: {
    type: 'integer|uid'
  },
  meaning: {
    type: 'integer'
  },
  source: {
    type: 'integer|source_label'
  }
};

var objectTypes = {
  cldr_char: {
    name: 'CLDR character',
    desc: 'Represents an <a href="http://cldr.unicode.org/translation/characters#TOC-Exemplar-Characters">exemplar character</a> for a language variety, as defined by the Unicode Common Locale Data Repository.',
    fields: {
      category: {
        type: 'string',
        desc: 'character category, typically “pri” (primary/standard), “aux” (auxiliary), or “pun” (punctuation)'
      },
      locale: {
        type: 'string',
        desc: 'Unicode script locale abbreviation'
      },
      range: {
        type: 'codepoint_range',
        desc: 'a code-point range (see below)'
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
        desc: 'whether to return cached responses. Defaults to <code>true</code>. Set to <code>false</code> if you want to ensure that your response contains the latest data from the database. Cached responses will be no more than 24 hours old',
        global: true
      },
      echo: {
        type: 'boolean',
        desc: 'whether to pass the query back in the response as <code>request</code>, which is an object with the keys <code>url</code> and <code>query</code>. Defaults to <code>false</code>',
        global: true
      },
      indent: {
        type: 'boolean',
        desc: 'whether to pretty-print the JSON response. Defaults to <code>false</code>',
        global: true
      },
    },
    resFields: {
      request: {
        type: 'object',
        desc: 'the request query, if <code>echo</code> was on',
        root: true
      }
    }
  },

  result: {
    reqParams: {
      after: {
        type: 'scalar[]',
        desc: 'integers or strings containing values of <code>sort</code> fields. Records will be returned that occur immediately after the indicated value(s) in the sort order. Can be used as an alternative to <code>offset</code>',
        global: true
      },
      include: {
        type: 'string[]',
        global: true
      },
      limit: {
        type: 'integer',
        desc: 'maximum number of records to return. Defaults to <code>resultMax</code>, i.e., the maximum',
        global: true
      },
      offset: {
        type: 'integer',
        desc: 'how many records to omit from the beginning of the returned records. Defaults to 0; cannot be greater than 250000',
        global: true
      },
      sort: {
        type: 'string[]',
        desc: 'fields to sort the result by. Sort strings take the format <em>&lt;field&gt;</em> or <em>&lt;field&gt; asc</em> for ascending order, <em>&lt;field&gt; desc</em> for descending order. You may also sort by <code>include</code> fields if they are present and do not return an array. If you sort by the special field <code>random</code>, the result will be returned in random order. The default is to sort by ID in ascending order.',
        global: true
      }
    },
    resFields: {
      result: {
        type: 'object[]',
        desc: 'results. Limited to <code>resultMax</code> per query; use <code>offset</code> to get more',
        root: true
      },
      resultMax: {
        type: 'integer',
        desc: 'maximum number of <code>result</code> objects that will be returned in a single query (currently 2000)',
        root: true
      },
      resultNum: {
        type: 'integer',
        desc: 'number of objects returned in <code>result</code>',
        root: true
      },
      resultType: {
        type: 'string',
        desc: 'type of objects in <code>result</code>',
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
        desc: 'number of results found',
        root: true
      },
      countType: {
        type: 'string',
        desc: 'type of objects in <code>count</code>',
        root: true
      }
    }
  }
};

var queries = {
  '/definition': {
    type: 'result'
  },
  '/definition/<definition>': {
    type: 'single'
  },
  '/definition/count': {
    type: 'count'
  },
  '/denotation': {
    type: 'result'
  },
  '/denotation/<denotation>': {
    type: 'single'
  },
  '/denotation/count': {
    type: 'count'
  },
  '/expr': {
    type: 'result'
  },
  '/expr/<expr>': {
    type: 'single',
    reqParams: {
      include: {
        type: 'string[]',
        options: ['uid']
      }
    }
  },
  '/expr/<langvar>/<exprtxt>': {

  },
  '/expr/count': {
    type: 'count'
  },
  '/expr/index': {

  },
  '/langvar': {
    type: 'result',
    desc: 'language variety query',
    reqParams: {
      expr_txt: {
        type: 'string[]',
        desc: 'expression texts. Restricts results to language varieties containing a matching expression'
      },
      expr_txt_degr: {
        type: 'string[]',
        desc: 'expression texts. Restricts results to language varieties containing a matching expression in degraded form'
      },
      id: {
        type: 'integer[]',
        desc: 'language variety IDs'
      },
      include: {
        type: 'string[]',
        options: ['denotation_count', 'expr_count', 'langvar_char', 'langvar_cldr_char', 'script_expr_txt']
      },
      lang_code: {
        type: 'string[]',
        desc: 'three-letter ISO 639 language codes'
      },
      mutable: {
        type: 'boolean',
        desc: 'restricts results to language varieties that are mutable (if <code>true</code>) or immutable (if <code>false</code>)'
      },
      name_expr: {
        type: 'integer[]',
        desc: 'language variety default name expression IDs'
      },
      name_expr_txt: {
        type: 'string[]',
        desc: 'language variety default name expression texts'
      },
      name_expr_txt_degr: {
        type: 'string[]',
        desc: 'language variety default name expression texts to be matched in their degraded form'
      },
      script_expr: {
        type: 'integer[]',
        desc: 'language variety <code>art-262</code> (ISO 15924) expression IDs. Restricts results to language varieties in the specified scripts'
      },
      script_expr_txt: {
        type: 'string[]',
        desc: 'language variety <code>art-262</code> (ISO 15924) expression texts. Restricts results to language varieties in the specified scripts'
      },
      trans_expr: {
        type: 'integer[]',
        desc: 'expression IDs. Restricts results to those language varieties containing a one-hop translation of one of the expressions'
      },
      uid: {
        type: 'string[]',
        desc: 'language variety uniform identifiers'
      }
    },
    resFields: {
      denotation_count: {
        type: 'integer',
        desc: 'number of denotations in the language variety',
        include: 'denotation_count'
      },
      expr_count: {
        type: 'integer',
        desc: 'number of expressions in the language variety',
        include: 'expr_count'
      },
      id: {
        type: 'integer',
        desc: 'language variety ID number'
      },
      lang_code: {
        type: 'string',
        desc: 'three-letter ISO 639 language code'
      },
      langvar_char: {
        type: 'codepoint_range[]',
        desc: 'code-point ranges',
        include: 'langvar_char'
      },
      langvar_cldr_char: {
        type: 'cldr_char[]',
        desc: 'CLDR character objects',
        include: 'langvar_cldr_char'
      },
      mutable: {
        type: 'boolean',
        desc: 'whether the language variety is mutable'
      },
      name_expr: {
        type: 'integer',
        desc: 'language variety default name’s expression ID'
      },
      name_expr_txt: {
        type: 'string',
        desc: 'language variety default name’s expression text'
      },
      name_expr_txt_degr: {
        type: 'string',
        desc: 'language variety default name’s degraded expression text'
      },
      script_expr: {
        type: 'integer',
        desc: 'language variety’s script, coded as the language variety <code>art-262</code> (ISO 15924) expression ID'
      },
      script_expr_txt: {
        type: 'string',
        desc: 'text of the <code>script_expr</code> expression',
        include: 'script_expr_txt'
      },
      uid: {
        type: 'string',
        desc: 'language variety’s uniform identifier'
      },
      var_code: {
        type: 'integer',
        desc: 'numeric variety code'
      }
    }
  },
  '/langvar/<langvar>': {
    type: 'single',
    reqParams: {
      include: {
        type: 'string[]',
        options: ['uid']
      }
    }
  },
  '/langvar/count': {
    type: 'count'
  },
  '/meaning': {
    type: 'result'
  },
  '/meaning/<meaning>': {
    type: 'single',
  },
  '/meaning/count': {
    type: 'count'
  },
  '/norm/definition/<langvar>': {

  },
  '/norm/expr/<langvar>': {

  },
  '/source': {
    type: 'result'
  },
  '/source/<source>': {
    type: 'single'
  },
  '/source/count': {
    type: 'count'
  },
  '/txt_degr': {

  }
};

initData();
initHelpers();

function initData() {
  for (var i in queryDefaults) {
    if (i === 'default') continue;

    for (var j in queryDefaults[i]) {
      // apply default values to query types
      if (queryDefaults.default[j])
        queryDefaults[i][j] = $.extend(true, $.extend(true, {}, queryDefaults.default[j]), queryDefaults[i][j]);

      // apply inherited values
      for (var k in queryDefaults[i][j]) {
        var source = queryDefaults[i][j][k].inherit;
        if (source) queryDefaults[i][j][k] = queryDefaults[source][j][k];
      }
    }
  }

  for (var i in queries) {
    // apply default values to queries
    var type = queries[i].type;
    if (type && queryDefaults[type])
      queries[i] = $.extend(true, $.extend(true, {}, queryDefaults[type]), queries[i]);

    // make list of response types requiring documentation
    if (queries[i].resFields) {
      var types = {};

      for (var j in queries[i].resFields) {
        var type = queries[i].resFields[j].type;
        if (type) {
          type = type.replace(/\[\]$/, '');
          if (objectTypes[type]) types[type] = true;
        }
      }

      types = Object.keys(types).sort();
      if (types.length) queries[i].resTypes = types;
    }
  }
}

function initHelpers() {
  Handlebars.registerHelper('eachSorted', function (context, options) {
    var ret = '';
    Object.keys(context).sort().forEach(function (key) {
      ret += options.fn({ name: key, attr: context[key] });
    });
    return ret;
  });
}

$(document).ready(function () {
  var select = $('#query');

  select.html(Handlebars.templates.options({
    options: Object.keys(queries).sort().map(function (item) { return [item,item] })
  }));

  select.on('change', changeQuery);

  var hash = window.location.hash.replace(/^#/, '');
  if (hash.length) select.val(hash);

  select.trigger('change');
});

function changeQuery(e) {
  var url = e.target.value;
  var info = queries[url];
  window.location.hash = url;

  $('#summary').html(info.desc || '');

  var reqParams = $('#reqParams');

  if (info.reqParams) {
    reqParams.html(Handlebars.templates.reqParams({ params: info.reqParams }));
  }
  else {
    reqParams.html('no parameters');
  }

  var resFields = $('#resFields');

  if (info.resFields) {
    var types;
    if (info.resTypes) {
      types = {};
      info.resTypes.forEach(function (type) { types[type] = objectTypes[type] });
    }

    resFields.html(Handlebars.templates.resFields({ fields: info.resFields, types: types }));
  }
  else {
    resFields.html('no parameters');
  }
}
