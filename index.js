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

var commonParams = {
  default: {
    reqParams: {
      cache: {
        type: 'boolean',
        global: true
      },
      echo: {
        type: 'boolean',
        global: true
      },
      indent: {
        type: 'boolean',
        global: true
      },
    },
    resFields: {
      request: {
        type: 'object',
        root: true
      }
    }
  },

  result: {
    reqParams: {
      after: {
        type: 'scalar[]',
        global: true
      },
      include: {
        type: 'string[]',
        global: true
      },
      limit: {
        type: 'integer',
        global: true
      },
      offset: {
        type: 'integer',
        global: true
      },
      sort: {
        type: 'string[]',
        global: true
      }
    },
    resFields: {
      result: {
        type: 'object[]',
        root: true
      },
      resultMax: {
        type: 'integer',
        root: true
      },
      resultNum: {
        type: 'integer',
        root: true
      },
      resultType: {
        type: 'string',
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
        root: true
      },
      countType: {
        type: 'string',
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
        desc: 'array of expression texts. Restricts results to language varieties containing a matching expression'
      },
      expr_txt_degr: {
        type: 'string[]',
        desc: 'array of expression texts. Restricts results to language varieties containing a matching expression in degraded form'
      },
      id: {
        type: 'integer[]',
        desc: 'array of language variety IDs'
      },
      include: {
        type: 'string[]',
        options: ['denotation_count', 'expr_count', 'langvar_char', 'langvar_cldr_char', 'script_expr_txt']
      },
      lang_code: {
        type: 'string[]',
        desc: 'array of three-letter ISO 639 language codes'
      },
      mutable: {
        type: 'boolean',
        desc: 'Restricts results to language varieties that are mutable (if <code>true</code>) or immutable (if <code>false</code>)'
      },
      name_expr: {
        type: 'integer[]',
        desc: 'array of language variety default name expression IDs'
      },
      name_expr_txt: {
        type: 'string[]',
        desc: 'array of language variety default name expression texts'
      },
      name_expr_txt_degr: {
        type: 'string[]',
        desc: 'array of language variety default name expression texts to be matched in their degraded form'
      },
      script_expr: {
        type: 'integer[]',
        desc: 'array of language variety <code>art-262</code> (ISO 15924) expression IDs. Restricts results to language varieties in the specified scripts'
      },
      script_expr_txt: {
        type: 'string[]',
        desc: 'array of language variety <code>art-262</code> (ISO 15924) expression texts. Restricts results to language varieties in the specified scripts'
      },
      trans_expr: {
        type: 'integer[]',
        desc: 'array of expression IDs. Restricts results to those language varieties containing a one-hop translation of one of the expressions'
      },
      uid: {
        type: 'string[]',
        desc: 'array of language variety uniform identifiers'
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
        desc: 'array of code point ranges',
        include: 'langvar_char'
      },
      langvar_cldr_char: {
        type: 'codepoint_range[]',
        desc: 'array of exemplar character objects',
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
        desc: 'the language variety’s script, coded as the language variety <code>art-262</code> (ISO 15924) expression ID'
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

function initData() {
  for (var i in commonParams) {
    if (i === 'default') continue;

    for (var j in commonParams[i]) {
      if (commonParams.default[j])
        commonParams[i][j] = $.extend(true, $.extend(true, {}, commonParams.default[j]), commonParams[i][j]);

      for (var k in commonParams[i][j]) {
        var source = commonParams[i][j][k].inherit;
        if (source) commonParams[i][j][k] = commonParams[source][j][k];
      }
    }
  }

  for (var i in queries) {
    var type = queries[i].type;
    if (type && commonParams[type])
      queries[i] = $.extend(true, $.extend(true, {}, commonParams[type]), queries[i]);
  }
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
    reqParams.html(Handlebars.templates.reqParam({ params: Object.keys(info.reqParams).sort(), info: info.reqParams }));
  }
  else {
    reqParams.html('no parameters');
  }

  var resFields = $('#resFields');

  if (info.resFields) {
    resFields.html(Handlebars.templates.resField({ params: Object.keys(info.resFields).sort(), info: info.resFields }));
  }
  else {
    resFields.html('no parameters');
  }
}
