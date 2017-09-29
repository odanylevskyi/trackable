(function ( $ ) {

  $.fn.trackable = function( options ) {
    // This is the easiest way to have default options.
    var settings = $.extend(true, {}, $.fn.trackable.defaults, options);

    var actions = ['click', 'keypress', 'submit', 'load', 'dblclick', 'keydown', 'change', 'resize', 'mouseenter', 'keyup', 'focus', 'scroll', 'mouseleave', 'blur', 'unload'];

    var onSuccess = settings.callbacks.success;
    var onError   = settings.callbacks.error;

    var submit = function(data) {
      $.ajax({
        url: data.url,
        method: data.method,
        data: {
          args: data.args,
          action_info: data.action
        },
        success: function(response) {
          onSuccess(response);
        },
        error : function (request, status, error) {
          onError.call(request, status, error);
        }
      })
    };

    return this.each(function() {
      var element = $(this);
      var data = element.data();
      $.each(data, function(key, value) {
        if (key.indexOf('action') != -1) {
          name = key.toString().substring('action'.length).toLowerCase();
          var object = new Object();
          object[name] = value;
          data.action = $.extend({}, data.action, object);
        }
        if (key.indexOf('args') != -1) {
          name = key.toString().substring('args'.length).toLowerCase();
          var object = new Object();
          object[name] = value;
          data.args = $.extend({}, data.args, object);
        }
      });
      if (data.when != undefined && data.when.length > 0 && $.inArray(data.when.toString(), actions) != -1) {
        $(element).on(data.when.toString(), function(e) {
          submit($.extend(true, {}, settings, data));
        });
        if (data.when == 'load') {
          $(element).trigger(data.when.toString());
        }
      } else {
        throw new Error('Your element should have valid action. Here is the list of valid actions: ' + actions.toString());
      }
    });
  };

  $.fn.trackable.cookie = function() {
    this.create = function(name, value, minutes) {
      var expires;
      if (minutes) {
        var date = new Date();
        date.setTime(date.getTime() + (minutes * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
      } else {
        expires = "";
      }
      document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
    };

    this.read = function (name) {
      if (name == undefined || name.length <= 0) {
        name = '_fa_id'
      }
      var nameEQ = encodeURIComponent(name) + "=";
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        while (cookie.charAt(0) === ' ') {
          cookie = cookie.substring(1, cookie.length);
        }
        if (cookie.indexOf(nameEQ) === 0) {
          return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
        }
      }
      return this.generate_uniq_id();
    };

    this.erase = function (name) {
      create(name, "", -1);
    };

    this.generate_uniq_id = function() {
      var id = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for( var i = 0; i < 32; i++ ) {
        id += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return id;
    };
  }

  $.fn.trackable.platform = function() {
    var unknown = 'Unknown';

    // screen
    var screenSize = '';
    if (screen.width) {
      width = (screen.width) ? screen.width : '';
      height = (screen.height) ? screen.height : '';
      screenSize += '' + width + "x" + height;
    }

    //browser
    var nVer = navigator.appVersion;
    var nAgt = navigator.userAgent;
    var browser = navigator.appName;
    var version = '' + parseFloat(navigator.appVersion);
    var majorVersion = parseInt(navigator.appVersion, 10);
    var nameOffset, verOffset, ix;

    // Opera
    if ((verOffset = nAgt.indexOf('Opera')) != -1) {
      browser = 'Opera';
      version = nAgt.substring(verOffset + 6);
      if ((verOffset = nAgt.indexOf('Version')) != -1) {
        version = nAgt.substring(verOffset + 8);
      }
    }
    // MSIE
    else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
      browser = 'Microsoft Internet Explorer';
      version = nAgt.substring(verOffset + 5);
    }

    //IE 11 no longer identifies itself as MS IE, so trap it
    //http://stackoverflow.com/questions/17907445/how-to-detect-ie11
    else if ((browser == 'Netscape') && (nAgt.indexOf('Trident/') != -1)) {

      browser = 'Microsoft Internet Explorer';
      version = nAgt.substring(verOffset + 5);
      if ((verOffset = nAgt.indexOf('rv:')) != -1) {
        version = nAgt.substring(verOffset + 3);
      }

    }

    // Chrome
    else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
      browser = 'Chrome';
      version = nAgt.substring(verOffset + 7);
    }
    // Safari
    else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
      browser = 'Safari';
      version = nAgt.substring(verOffset + 7);
      if ((verOffset = nAgt.indexOf('Version')) != -1) {
        version = nAgt.substring(verOffset + 8);
      }

      // Chrome on iPad identifies itself as Safari. Actual results do not match what Google claims
      //  at: https://developers.google.com/chrome/mobile/docs/user-agent?hl=ja
      //  No mention of chrome in the user agent string. However it does mention CriOS, which presumably
      //  can be keyed on to detect it.
      if (nAgt.indexOf('CriOS') != -1) {
        //Chrome on iPad spoofing Safari...correct it.
        browser = 'Chrome';
        //Don't believe there is a way to grab the accurate version number, so leaving that for now.
      }
    }
    // Firefox
    else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
      browser = 'Firefox';
      version = nAgt.substring(verOffset + 8);
    }
    // Other browsers
    else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
      browser = nAgt.substring(nameOffset, verOffset);
      version = nAgt.substring(verOffset + 1);
      if (browser.toLowerCase() == browser.toUpperCase()) {
        browser = navigator.appName;
      }
    }
    // trim the version string
    if ((ix = version.indexOf(';')) != -1) version = version.substring(0, ix);
    if ((ix = version.indexOf(' ')) != -1) version = version.substring(0, ix);
    if ((ix = version.indexOf(')')) != -1) version = version.substring(0, ix);

    majorVersion = parseInt('' + version, 10);
    if (isNaN(majorVersion)) {
      version = '' + parseFloat(navigator.appVersion);
      majorVersion = parseInt(navigator.appVersion, 10);
    }

    // mobile version
    var mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);

    // cookie
    var cookieEnabled = (navigator.cookieEnabled) ? true : false;

    if (typeof navigator.cookieEnabled == 'undefined' && !cookieEnabled) {
      document.cookie = 'testcookie';
      cookieEnabled = (document.cookie.indexOf('testcookie') != -1) ? true : false;
    }

    // system
    var os = unknown;
    var clientStrings = [
      {s:'Windows 3.11', r:/Win16/},
      {s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
      {s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
      {s:'Windows 98', r:/(Windows 98|Win98)/},
      {s:'Windows CE', r:/Windows CE/},
      {s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
      {s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
      {s:'Windows Server 2003', r:/Windows NT 5.2/},
      {s:'Windows Vista', r:/Windows NT 6.0/},
      {s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
      {s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
      {s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
      {s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
      {s:'Windows ME', r:/Windows ME/},
      {s:'Android', r:/Android/},
      {s:'Open BSD', r:/OpenBSD/},
      {s:'Sun OS', r:/SunOS/},
      {s:'Linux', r:/(Linux|X11)/},
      {s:'iOS', r:/(iPhone|iPad|iPod)/},
      {s:'Mac OS X', r:/Mac OS X/},
      {s:'Mac OS', r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
      {s:'QNX', r:/QNX/},
      {s:'UNIX', r:/UNIX/},
      {s:'BeOS', r:/BeOS/},
      {s:'OS/2', r:/OS\/2/},
      {s:'Search Bot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
    ];
    for (var id in clientStrings) {
      var cs = clientStrings[id];
      if (cs.r.test(nAgt)) {
        os = cs.s;
        break;
      }
    }

    var osVersion = unknown;

    if (/Windows/.test(os)) {
      osVersion = /Windows (.*)/.exec(os)[1];
      os = 'Windows';
    }

    switch (os) {
      case 'Mac OS X':
        osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
        break;

      case 'Android':
        osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
        break;

      case 'iOS':
        osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
        osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
        break;

    }
    return {
      screen: screenSize,
      browser: browser,
      browserVersion: version,
      mobile: mobile,
      os: os,
      osVersion: osVersion,
      cookies: cookieEnabled
    }
  }

  var platform = $.fn.trackable.platform.call();
  var cookie = new $.fn.trackable.cookie();

    $.fn.trackable.defaults = {
    url: '/track',
    method: 'POST',
    args: {},
    action: {
      type: 'view',
      object: 'page',
      id: 'none',
      cookie: cookie.read('_fa_id'),
      user: null,
      session: cookie.read('_fa_session'),
      time: (new Date()),
      ip: '127.0.0.1',
      referrer: document.referrer,
      resourcetype: 'None',
      resourceid: 0,
      currenturl: window.location.pathname + window.location.search + window.location.hash,
      mobile: platform.mobile,
      os: platform.os,
      browser: platform.browser,
      screensize: platform.screen,
      iscookieenabled: platform.cookies
    },
    callbacks: {
      success: function() {},
      error:   function() {}
    }
  }

}( jQuery ));

// $(document).on('turbolinks:load', function () {
//   $('[data-trackable]').trackable({
//     url: '/track-user-action',
//     action: {
//       user:  $('#flender_traker').data('user'),
//       referrer: $('#flender_traker').data('referrer'),
//       ip: $('#flender_traker').data('ip'),
//     },
//     callbacks: {
//       success: function(data) {
//       }
//     }
//   });
// });
