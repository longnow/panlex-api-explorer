var endpoint = 'https://api.panlex.org/v2';
var currentQuery, currentUrl;

initHelpers();

$(document).ready(function () {
  $('#queryTypes').html(Handlebars.templates.queryTypes({ queries: queries }));
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
    restrictions: info.reqParamsRestrictions,
    urlParams: reqUrlParams,
    types: info.types
  }));

  $('#resFields').html(Handlebars.templates.resFields({
    fields: info.resFields,
    fieldsRoot: info.resFieldsRoot,
    types: info.types
  }));

  $('.typeInfo').popover({
    content: typeDescription,
    html: true,
    placement: 'top',
    trigger: 'click focus'
  });

  currentQuery = url;
  currentUrl = url.replace(/\/<.+$/, '');
  $('#submit').on('click', submitRequest);
}

function typeDescription() {
  var type = $(this).data('type');
  return Handlebars.templates.typeDescription(objectTypes[type]);
}

function submitRequest(e) {
  $('#error').empty();

  var p = getReqParams();
  if (!p) return;

  var options = {
    url: endpoint + currentUrl,
    method: queries[currentQuery].method,
    data: p.body,
    complete: displayResponse
  };

  if (p.url.length) options.url += '/' + p.url.join('/');

  var templateParams = {
    method: options.method,
    url: options.url
  };

  if (options.method === 'GET') {
    var queryParams = $.param(options.data);
    if (queryParams.length) templateParams.url += '?' + queryParams;
  }
  else {
    templateParams.body = canonicalJson(options.data, null, 2);
    options.data = JSON.stringify(options.data);
  }

  $('#queryRequest').html(Handlebars.templates.queryRequest(templateParams));
  $('#queryResponse').html('<p>Running…</p>');
  $('#queryModal').modal('show');

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
      else setError($(this).data('name'), 'is required');
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

function displayResponse(jqXHR, textStatus) {
  if (textStatus === 'success' || textStatus === 'error') {
    try {
      var response = $.parseJSON(jqXHR.responseText);

      $('#queryResponse').html(Handlebars.templates.queryResponse({
        status: jqXHR.status !== 200 ? jqXHR.status : null,
        response: canonicalJson(response, null, 2)
      }));
    } catch (e) {
      $('#queryResponse').html('<p>API response contained invalid JSON</p>');
    }
  }
  else $('#queryResponse').html('<p>Unexpected error occurred</p>');
}

// based on https://www.npmjs.com/package/canonical-json
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

