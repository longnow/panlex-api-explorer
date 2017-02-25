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

    // apply default values to query types
    queryDefaults[i] = deepCopyExtend(queryDefaults.default, queryDefaults[i]);

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
  // - reqTypes and resTypes
  // - include desc
  // - restriction desc
  for (var i in queries) {
    var queryType = queries[i].type;

    // apply default values to queries
    if (queryType && queryDefaults[queryType])
      queries[i] = deepCopyExtend(queryDefaults[queryType], queries[i]);

    // make set of request parameter and response object types requiring documentation
    ['reqParams', 'resFields', 'resFieldsRoot'].forEach(function (j) {
      var types = {};

      for (var k in queries[i][j]) {
        var type = queries[i][j][k].type;
        if (type) {
          type = type.replace(/(?:\[\])+$/, '');
          if (objectTypes[type]) types[type] = objectTypes[type];
        }
      }

      if (Object.keys(types).length) {
        var key = j.replace(/Params|Fields/, 'Types');
        queries[i][key] = types;
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
    if (queries[i].reqParamsRestrictions) {
      var desc = [];

      queries[i].reqParamsRestrictions.forEach(function (r) {
        if (r.type === 'atLeastOne') {
          var str = (r.context ? r.context + ', you ' : 'You ');
          var conj;

          if (r.not) {
            str += 'must provide at least one parameter other than ';
            conj = 'and';
          }
          else {
            str += 'must provide at least one of the following parameters: ';
            conj = 'or';
          }

          var value = r.value.map(function (p) { return '<code>' + p + '</code>' });
          if (value.length > 2) {
            value[value.length - 1] = conj + ' ' + value[value.length - 1];
            str += value.join(', ');
          }
          else str += value.join(' ' + conj + ' ');

          desc.push(str + '.');
        }
        else if (r.type === 'comment') {
          desc.push(r.value);
        }
        else if (r.type === 'required') {
          desc.push('The parameter <code>' + r.value + '</code> is required.');
        }
      });

      queries[i].reqParamsRestrictions = desc;
    }
  }

  // populate inherited objectTypes
  for (var i in objectTypes) {
    if (objectTypes[i].inherit) {
      var ourFields = objectTypes[i].fields = {};
      var theirFields = queries[objectTypes[i].inherit].resFields;

      for (var j in theirFields) {
        if (!theirFields[j].restriction) ourFields[j] = theirFields[j];
      }
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

function initHelpers() {
  Handlebars.registerHelper('eachSorted', function (context, options) {
    var ret = '';
    Object.keys(context).sort().forEach(function (key) {
      ret += options.fn({ name: key, attr: context[key] });
    });
    return ret;
  });

  Handlebars.registerHelper('urlToId', function (url) {
    return url.replace(/[/<>|_]/g, '');
  });
}

function clickQuery(e) {
  $('.queryLink').removeClass('active');
  setQuery($(this).addClass('active').data('url'));
  window.location.hash = this.id.replace(/^queryLink-/, '');
}

function setQuery(url) {
  var info = queries[url];

  $('#summary').html(Handlebars.templates.summary({ url: url, summary: info.summary }));

  $('#error').empty();

  $('#description').html(Handlebars.templates.description({ desc: info.desc }));

  var reqUrlParams = url.match(/<[^>]+>/g);
  if (reqUrlParams) {
    reqUrlParams = reqUrlParams.map(function (item) {
      var param = item.replace(/[<>]/g, '');
      return { name: param, attr: urlParams[param] };
    });
  }

  $('#reqParams').html(Handlebars.templates.reqParams({
    params: info.reqParams,
    paramsGlobal: info.reqParamsGlobal,
    restriction: info.reqParamsRestrictions,
    urlParams: reqUrlParams,
    types: info.reqTypes
  }));

  $('#submit').on('click', submitRequest);

  $('#resFields').html(Handlebars.templates.resFields({
    fields: info.resFields,
    fieldsRoot: info.resFieldsRoot,
    types: info.resTypes,
    typesRoot: info.resTypesRoot
  }));

  currentUrl = url.replace(/\/<.+$/, '');
}

function submitRequest(e) {
  $('#error').empty();

  var p = getReqParams();
  if (!p) return;

  $('#queryResultBody').html('<p>Running…</p>');
  $('#queryResult').modal('show');

  var options = {
    url: endpoint + currentUrl,
    complete: receiveResult(p.body)
  };

  if (p.url.length) {
    options.method = 'GET';
    options.url += '/' + p.url.join('/');
  }
  else {
    options.method = 'POST';
    options.data = JSON.stringify(p.body);
  }

  $.ajax(options);
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

function receiveResult(body) {
  return function(jqXHR, textStatus) {
    if (textStatus === 'success' || textStatus === 'error') {
      try {
        var response = $.parseJSON(jqXHR.responseText);

        $('#queryResultBody').html(Handlebars.templates.queryResult({
          url: this.url,
          method: this.method,
          body: this.method === 'POST' ? canonicalJson(body, null, 2) : null,
          status: jqXHR.status !== 200 ? jqXHR.status : null,
          response: canonicalJson(response, null, 2)
        }));
      } catch (e) {
        $('#queryResultBody').html('<p>API response contained invalid JSON</p>');
      }
    }
    else $('#queryResultBody').html('<p>Unexpected error occurred</p>');
  }
}

function canonicalJson(object, replacer, space) {
  return JSON.stringify(copyObjectWithSortedKeys(object), replacer, space)
}

function copyObjectWithSortedKeys(object) {
  if (isObject(object)) {
    var newObj = {}
    var keysSorted = Object.keys(object).sort()
    var key
    for (var i = 0, len = keysSorted.length; i < len; i++) {
      key = keysSorted[i]
      newObj[key] = copyObjectWithSortedKeys(object[key])
    }
    return newObj
  } else if (Array.isArray(object)) {
    return object.map(copyObjectWithSortedKeys)
  } else {
    return object
  }
}

function isObject(a) {
  return Object.prototype.toString.call(a) === '[object Object]'
}

