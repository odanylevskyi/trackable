# Example:
```
$(document).on('turbolinks:load', function () {
  $('[data-trackable]').trackable({
    url: '/track-user-action',
    action: {
      user:  $('#flender_traker').data('user'),
      referrer: $('#flender_traker').data('referrer'),
      ip: $('#flender_traker').data('ip'),
    },
    callbacks: {
      success: function(data) {
      }
    }
  });
});
```
```
<a href="/join" data-trackable="true" data-when="click" data-action-type="btn_click" data-action-id="brand_bar_get_started">Get Started</a>
```
```
<div class="page-wrapper" data-trackable="true" data-action-type="page_view" data-when="load" data-action-resourcetype="User" data-action-resourceid="0" data-action-id="about_page">
```

Below is trakable params:
```
$.fn.trackable.defaults = {
    url: '/track',
    method: 'POST',
    args: {},
    action: {
      type: 'view',
      object: 'page',
      id: 'none',
      cookie: $.fn.trackable.cookie.read('_fa_id'),
      user: null,
      session: $.fn.trackable.cookie.read('_fa_session'),
      time: (new Date()),
      ip: '127.0.0.1',
      referrer: document.referrer,
      resourcetype: 'None',
      resourceid: 0,
      currenturl: window.location.pathname + window.location.search + window.location.hash,
      mobile: $.fn.trackable.platform.mobile,
      os: $.fn.trackable.platform.os,
      browser: $.fn.trackable.platform.browser,
      screensize: $.fn.trackable.platform.screen,
      iscookieenabled: $.fn.trackable.platform.cookies
    },
    callbacks: {
      success: function() {},
      error:   function() {}
    }
  }
```
