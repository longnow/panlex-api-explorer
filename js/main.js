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
  // populate queryDefaults
  for (var i in queryDefaults) {
    if (i === 'default') continue;

    for (var j in queryDefaults[i]) {
      // apply default values to query types
      if (queryDefaults.default[j])
        queryDefaults[i][j] = $.extend(true, $.extend(true, {}, queryDefaults.default[j]), queryDefaults[i][j]);

      // apply inherited values
      for (var k in queryDefaults[i][j]) {
        var inherit = queryDefaults[i][j][k].inherit;
        if (inherit) queryDefaults[i][j][k] = queryDefaults[inherit][j][k];
      }
    }
  }

  // populate inherited reqParams
  for (var i in queries) {
    var q = queries[i];

    // inherit all params
    if (q.reqParams.inherit) {
      var f = getFilter(queries[i].reqParams);
      q.reqParams = $.extend(true, {}, queries[q.reqParams.inherit].reqParams);
      if (f) applyFilter(q.reqParams, f);
    }
    else {
      for (var j in q.reqParams) {
        // inherit single param
        if (q.reqParams[j].inherit) {
          var f = getFilter(q.reqParams[j]);
          q.reqParams[j] = $.extend(true, {}, queries[q.reqParams[j].inherit].reqParams[j]);
          if (f) applyFilter(q.reqParams[j], f);
        }
      }
    }
  }

  // populate (1) from queryDefaults, (2) reqTypes and resTypes, (3) include desc, (4) restriction desc
  for (var i in queries) {
    var queryType = queries[i].type;

    // apply default values to queries
    if (queryType && queryDefaults[queryType])
      queries[i] = $.extend(true, $.extend(true, {}, queryDefaults[queryType]), queries[i]);

    // make list of request parameter and response object types requiring documentation
    ['reqParams', 'resFields'].forEach(function (j) {
      var types = {};

      for (var k in queries[i][j]) {
        var type = queries[i][j][k].type;
        if (type) {
          type = type.replace(/\[\]$/, '');
          if (objectTypes[type]) types[type] = true;
        }
      }

      types = Object.keys(types);

      if (types.length) {
        var key = j.replace(/[A-Z].+$/, 'Types');
        queries[i][key] = types.sort();
      }
    });

    // populate include desc (deleting param if invalid)
    if (queries[i].reqParams.include) {
      var obj = queries[i].reqParams.include;

      if (obj.options) {
        obj.desc += ' Possible values: '
          + obj.options.map(function (p) { return '<code>' + p + '</code>' }).join(', ')
          + '.';
      }
      else delete queries[i].reqParams.include;
    }

    // populate restriction desc
    if (queries[i].reqParamsRestriction) {
      var obj = queries[i].reqParamsRestriction;
      obj.desc = (obj.context ? obj.context + ', you ' : 'You ');

      if (obj.atLeastOne) {
        obj.desc += 'must provide at least one of the following parameters: '
          + obj.atLeastOne.map(function (p) { return '<code>' + p + '</code>' }).join(', ')
          + '.';
      }
    }
  }
}

function getFilter(obj) {
  if (obj.filter) return { filter: obj.filter };
  else if (obj.filterNot) return { filterNot: obj.filterNot };
  else return null;
}

function applyFilter(obj, f) {
  var sign;

  if (f.filter) {
    f = f.filter;
    sign = 1;
  }
  else if (f.filterNot) {
    f = f.filterNot;
    sign = -1;
  }
  else return obj;

  var set = {};
  f.values.forEach(function (i) { set[i] = 1 });

  if (f.key) {
    if (obj[f.key])
      obj[f.key] = obj[f.key].filter(function (i) { return (set[i] || -1)*sign === 1 });
  }
  else {
    for (var i in obj) {
      if ((set[i] || -1)*sign === -1) delete obj[i];
    }
  }

  return obj;
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

  $('#error').empty();

  var reqUrlParams = url.match(/<[^>]+>/g);
  if (reqUrlParams) {
    reqUrlParams = reqUrlParams.map(function (item) {
      var param = item.replace(/[<>]/g, '');
      return { name: param, attr: urlParams[param] };
    });
  }

  var types = {};
  if (info.reqTypes)
    info.reqTypes.forEach(function (type) { types[type] = objectTypes[type] });

  $('#reqParams').html(Handlebars.templates.reqParams({
    params: info.reqParams,
    restriction: info.reqParamsRestriction,
    urlParams: reqUrlParams,
    types: types
  }));

  $('#submit').on('click', submitRequest);

  types = {};
  if (info.resTypes)
    info.resTypes.forEach(function (type) { types[type] = objectTypes[type] });

  $('#resFields').html(Handlebars.templates.resFields({
    fields: info.resFields,
    types: types
  }));

  currentUrl = url.replace(/\/<.+$/, '');
}

function submitRequest(e) {
  $('#error').empty();

  var p = getReqParams();
  if (!p) return;

  var options = {
    url: endpoint + currentUrl,
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
      if (val.length) p.url[match[1]] = val;
      else {
        setError($(this).data('name'), 'is required');
      }
    }
    else if (val.length) {
      try {
        val = JSON.parse(val);
        p.body[this.name] = val;
      } catch (e) {
        setError(this.name, 'has invalid JSON');
      }
    }
  });

  return error ? null : p;

  function setError(param, message) {
    error = true;
    $('#error').append(Handlebars.templates.error({ param: param, message: message }));
  }
}
