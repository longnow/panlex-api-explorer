var endpoint = 'https://api.panlex.org/v2';

var globalParams = {
  reqParams: {
    after:    { },
    cache:    { },
    echo:     { },
    include:  { },
    indent:   { },
    limit:    { },
    offset:   { },
    sort:     { }
  },
  resParams: {
  }
};

var urlParams = {
  definition:   { },
  denotation:   { },
  expr:         { },
  exprtxt:      { },
  langvar:      { },
  meaning:      { },
  source:       { }
};

var queries = {
  '/langvar': {
    desc: 'language variety query',
    reqParams: {
      expr_txt:     { type: 'text[]', desc: 'array of expression texts. Restricts results to language varieties containing a matching expression' },
      id:           { type: 'posint[]', desc: 'array of language variety IDs' },
      uid:          { type: 'uid[]', desc: 'array of language variety uniform identifiers' },
      include:      { type: 'text[]', options: ['denotation_count', 'expr_count', 'langvar_char', 'langvar_cldr_char'] }
    },
    resParams: {
      id:           { type: 'posint', desc: 'language variety ID number' },
      uid:          { type: 'uid', desc: 'language variety’s uniform identifier' },
      langvar_char: { type: 'codepoint_range[]', desc: 'array of code point ranges', include: 'langvar_char' }
    }
  },
  '/langvar/count': { query: '/langvar' },
  '/langvar/:langvar': { query: '/langvar' },
  '/source': {},
  '/expr': {},
  '/denotation': {},
  '/meaning': {},
  '/definition': {}
};

Handlebars.registerHelper('withLookup', function(obj, value, options) {
  return options.fn(obj[value]);
});

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

  var reqParams = $('#reqParams').empty();

  if (info.reqParams) {
    reqParams.append(Handlebars.templates.reqParam({ params: Object.keys(info.reqParams).sort(), info: info.reqParams }));
  }
  else {
    reqParams.append('no parameters');
  }

  var resParams = $('#resParams').empty();

  if (info.resParams) {
    resParams.append(Handlebars.templates.resParam({ params: Object.keys(info.resParams).sort(), info: info.resParams }));
  }
  else {
    resParams.append('no parameters');
  }
}
