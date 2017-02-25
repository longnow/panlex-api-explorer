initData();
initHelpers();

var currentUrl;

$(document).ready(function () {
  $('#queryList').html(Handlebars.templates.queryList({ queries: queries }));
  $('.queryLink').on('click', clickQuery);

  var queryLink;
  var hash = window.location.hash.replace(/^#/, '');
  if (hash.length && hash.match(/^[a-z]+$/)) {
    var elt = $('#queryLink-'+hash);
    if (elt.length) queryLink = elt;
  }
  if (!queryLink) queryLink = $('#queryLink-langvar');
  queryLink.trigger('click');

  $('#content').show();
});

function initData() {
  for (var i in queryDefaults) {
    if (i === 'default') continue;

    // populate queryDefaults
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

  // populate count query reqParams from corresponding result query's
  for (var i in queries) {
    var q = queries[i];
    if (q.type === 'count') {
      var resultQuery = queries[i.replace(/\/count$/, '')];
      q.reqParams = $.extend(true, $.extend(true, {}, resultQuery.reqParams), q.reqParams);
      delete q.reqParams.include;
    }
  }

  // populate (1) from queryDefaults, (2) resTypes, (3) include desc
  for (var i in queries) {
    var queryType = queries[i].type;

    // apply default values to queries
    if (queryType && queryDefaults[queryType])
      queries[i] = $.extend(true, $.extend(true, {}, queryDefaults[queryType]), queries[i]);

    // make list of response object types requiring documentation
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

    // generate include desc
    if (queryType === 'result' && queries[i].reqParams.include && queries[i].reqParams.include.options) {
      queries[i].reqParams.include.desc += ' Possible values: ' +
        queries[i].reqParams.include.options.map(function (opt) {
          return '<code>' + opt + '</code>'
        }).join(', ') + '.';
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

  Handlebars.registerHelper('urlToId', function (url) {
    return url.replace(/[/<>\|]/g, '');
  });
}

function clickQuery(e) {
  $('.queryLink').removeClass('active');
  setQuery($(this).addClass('active').data('url'));
  window.location.hash = this.id.replace(/^queryLink-/, '');
}

function setQuery(url) {
  var info = queries[url];

  $('#description').html(Handlebars.templates.description({ url: url, desc: info.desc }));

  var reqUrlParams = url.match(/<[^>]+>/g);
  if (reqUrlParams) {
    reqUrlParams = reqUrlParams.map(function (item) {
      var param = item.replace(/[<>]/g, '');
      return { name: param, attr: urlParams[param] };
    });
  }

  $('#reqParams').html(Handlebars.templates.reqParams({ params: info.reqParams, urlParams: reqUrlParams }));
  $('#submit').on('click', submitRequest);

  var types;
  if (info.resTypes) {
    types = {};
    info.resTypes.forEach(function (type) { types[type] = objectTypes[type] });
  }

  $('#resFields').html(Handlebars.templates.resFields({ fields: info.resFields, types: types }));

  currentUrl = url.replace(/\/<.+$/, '');
}

function submitRequest(e) {
  var p = getReqParams();
  if (!p) return;

  var options = {
    url: endpoint+currentUrl,
    dataType: 'json'
  };

  if (p.url.length) {
    options.method = 'GET';
    options.url += '/' + p.url.join('/');
  }
  else {
    options.method = 'POST';
    options.data = JSON.stringify(p.body);
  }

  $.ajax(options)
    .done(function (data) {})
    .fail(function (data) {});
}

function getReqParams() {
  var p = { body: {}, url: [] };
  var error;

  $('#reqParams input').each(function () {
    var val = this.value.trim();

    var match = this.name.match(/^url_(\d)$/);

    if (match) {
      if (val.length) {
        p.url[match[1]] = val;
      }
      else setError(this);
    }
    else if (val.length) {
      try {
        val = JSON.parse(val);
        p.body[this.name] = val;
      } catch (e) {
        setError(this);
      }
    }
  });

  return error ? null : p;

  function setError(elt) {
    error = true;
    $(elt).addClass('error').one('change', function (e) { $(elt).removeClass('error') });
  }
}
