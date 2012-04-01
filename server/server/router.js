function route(handle, pathname, request, response, postData, query) {
  if (typeof handle[pathname] === 'function') {
    handle[pathname](request, response, query, postData);
  } else {
    handle["/error"](request, response, query, postData);
  }
}

exports.route = route;