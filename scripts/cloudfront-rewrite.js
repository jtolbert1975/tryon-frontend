function handler(event) {
  var request = event.request;
  var host = request.headers.host ? request.headers.host.value : '';

  // www -> apex (one canonical URL)
  if (host === 'www.adattamento.app') {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: { location: { value: 'https://adattamento.app' + request.uri } }
    };
  }

  var prerendered = ["/blog","/blog/shop-for-clothes-online-without-returns","/blog/how-jeans-should-fit","/blog/build-a-capsule-wardrobe","/blog/how-to-read-size-charts-and-measure-yourself","/blog/choosing-colors-that-work-together","/blog/what-to-wear-to-a-job-interview","/blog/wedding-guest-dress-codes-explained","/blog/how-to-style-accessories","/blog/versatile-shoes-that-go-with-everything","/blog/how-virtual-try-on-works","/affiliate-disclosure","/privacy","/terms"];
  var uri = request.uri;
  if (uri.length > 1 && uri.charAt(uri.length - 1) === '/') {
    uri = uri.slice(0, -1);
  }

  if (uri === '/') {
    request.uri = '/index.html';
  } else if (prerendered.indexOf(uri) !== -1) {
    request.uri = uri + '/index.html';
  } else if (uri.indexOf('.') === -1) {
    // Client-rendered app route (login, dashboard, try-on, ...)
    request.uri = '/index.csr.html';
  }
  return request;
}
