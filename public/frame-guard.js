// Clickjacking protection when X-Frame-Options / CSP frame-ancestors are not yet on the response.
if (window.top !== window.self) {
  document.documentElement.classList.add("df-framed");
  window.top.location = window.self.location;
}
