var endpoint = 'https://api.panlex.org/v2';
var currentQuery, currentUrl;

var uiType = {
  modal: {
    bodySelector: '.modal-body',
    topSelector: '.modal-content'
  },
  dropdown: {
    bodySelector: '.dropdown-menu',
    margin: 20
  }
};

initHelpers();

$(document).ready(function () {
  var modal = $('#queryModal');
  modal
  .on('shown.bs.modal', function () { onShowItem(modal, 'modal') })
  .on('hide.bs.modal', function () { onHideItem(modal) } );

  hashChange();

  $(window)
  .on('hashchange', hashChange)
  .on('resize', function() {
    resizeItem(modal, 'modal');
    resizeItem($('#summaryDropdown'), 'dropdown');
  });

  $('#content').show();
}).on('keyup', function (e) {
  // hide popovers with escape key
  if (e.keyCode === 27 && this.id !== 'queryModal') hideOpenPopovers();
});

function initHelpers() {
  Handlebars.registerHelper('eachSorted', function (context, options) {
    var data = Handlebars.createFrame(options.data);

    var ret = '';
    Object.keys(context).sort().forEach(function (key) {
      data.key = key;
      ret += options.fn(context[key], { data: data });
    });
    return ret;
  });
}

function hashChange() {
  setQuery(getHash() || '/langvar');
}

function getHash() {
  return window.location.hash.replace(/^#/, '');
}

function setQuery(query) {
  if (getHash() !== query) window.location.hash = query;
  if (currentQuery === query) return;

  var q = queries[query];

  $('#summary').html(Handlebars.templates.summary({
    query: query,
    summary: q.summary,
    queries: queries
  }));
  $('#queryTypes a').on('click', function() { setQuery($(this).data('query')) });
  setupDropdown($('#summaryDropdown'));

  $('#error').empty();

  $('#description').html(Handlebars.templates.description({ desc: q.desc }));

  $('#reqParams').html(Handlebars.templates.reqParams({
    params: q.reqParams,
    paramsGlobal: q.reqParamsGlobal,
    restrictions: q.reqParamsRestrictions,
    urlParams: q.urlParams,
    types: q.types
  }));

  $('#resFields').html(Handlebars.templates.resFields({
    fields: q.resFields,
    fieldsRoot: q.resFieldsRoot,
    types: q.types
  }));

  setupPopover($('.typeInfo'), { content: typeDescription })
  .on('inserted.bs.popover', function() {
    $('.popover').has('table').addClass('popover-lg');
  });

  setupPopover($('.onlyWhenInfo'));

  currentQuery = query;
  currentUrl = query.replace(/\/<.+$/, '');
  $('#submit').on('click', submitRequest);
}

function typeDescription() {
  var type = $(this).data('type');
  return Handlebars.templates.typeDescription(objectTypes[type]);
}

function setupDropdown(elt) {
  return elt
  .on('shown.bs.dropdown', function() { onShowItem(elt, 'dropdown') })
  .on('hide.bs.dropdown', function() { onHideItem(elt) });
}

function setupPopover(elt, options) {
  options = $.extend({ html: true, placement: 'auto right' }, options || {});
  return elt.popover(options)
  .on('show.bs.popover', hideOpenPopovers);
}

function hideOpenPopovers(e) {
  $('.glyphicon-info-sign').not(this).popover('hide');
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

  if (p.url.length) options.url += '/'
    + p.url.map(function(item) { return encodeURIComponent(item) }).join('/');

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
  var modal = $('#queryModal');
  onShowItem(modal, 'modal');

  if (jqXHR.status !== 0 && (textStatus === 'success' || textStatus === 'error')) {
    try {
      var response = $.parseJSON(jqXHR.responseText);

      $('#queryResponse').html(Handlebars.templates.queryResponse({
        status: jqXHR.status !== 200 ? jqXHR.status : null,
        response: canonicalJson(response, null, 2)
      }));

      modal.modal('handleUpdate');
    } catch (e) {
      console.log(e);
      $('#queryResponse').html('<p>API response contained invalid JSON</p>');
    }
  }
  else $('#queryResponse').html('<p>Unexpected error occurred</p>');
}

function onShowItem(item, type) {
  var t = uiType[type];

  var bodyTop = item.find(t.bodySelector).offset().top;

  if (bodyTop >= 0) {
    item.data('body-top', bodyTop);
    resizeItem(item, type);
  }
}

function onHideItem(item) {
  item.data('body-top', null);
}

function resizeItem(item, type) {
  var t = uiType[type];

  var bodyTop = item.data('body-top');
  if (bodyTop === undefined || bodyTop === null) return;

  var margin = t.margin
    ? t.margin
    : item.find(t.topSelector).offset().top;

  var maxBodyHeight = $(window).height() - bodyTop - margin;
  item.find(t.bodySelector).css('max-height', maxBodyHeight + 'px');
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

