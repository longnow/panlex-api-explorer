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
      id: {
        type: 'integer[]',
        desc: 'array of language variety IDs'
      },
      uid: {
        type: 'uid[]',
        desc: 'array of language variety uniform identifiers'
      },
      include: {
        type: 'string[]',
        options: ['denotation_count', 'expr_count', 'langvar_char', 'langvar_cldr_char']
      }
    },
    resFields: {
      id: {
        type: 'integer',
        desc: 'language variety ID number'
      },
      uid: {
        type: 'uid',
        desc: 'language variety’s uniform identifier'
      },
      langvar_char: {
        type: 'codepoint_range[]',
        desc: 'array of code point ranges',
        include: 'langvar_char'
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
