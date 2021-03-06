/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*! This file is concatenated for the browser. */


	// at now, jsxc need to have some global vars
	//var jsxc = null, RTC = null, RTCPeerconnection = null;
	window.jsxc = null, window.RTC = null, window.RTCPeerconnection = null;

	(function ($) {
	    "use strict";

	/**
	 * JavaScript Xmpp Chat namespace
	 *
	 * @namespace jsxc
	 */
	jsxc = {

	  /**
	   * Video and file transfer system
	   */
	  multimediaStreamSystem : "multistream", // "original" || "multistream"

	  /** Version of jsxc */
	  version : '< $ app.version $ >',

	  /** True if i'm the master */
	  master : false,

	  /** True if the role allocation is finished */
	  role_allocation : false,

	  /** Timeout for keepalive */
	  to : [],

	  /** Timeout after normal keepalive starts */
	  toBusy : null,

	  /** Timeout for notification */
	  toNotification : null,

	  /** Timeout delay for notification */
	  toNotificationDelay : 500,

	  /** Interval for keep-alive */
	  keepalive : null,

	  /** True if jid, sid and rid was used to connect */
	  reconnect : false,

	  /** True if restore is complete */
	  restoreCompleted : false,

	  /** True if login through box */
	  triggeredFromBox : false,

	  /** True if logout through element click */
	  triggeredFromElement : false,

	  /** True if logout through logout click */
	  triggeredFromLogout : false,

	  /** last values which we wrote into localstorage (IE workaround) */
	  ls : [],

	  stats : null,

	  /**
	   * storage event is even fired if I write something into storage (IE
	   * workaround) 0: conform, 1: not conform, 2: not shure
	   */
	  storageNotConform : null,

	  /** Timeout for storageNotConform test */
	  toSNC : null,

	  /** My bar id */
	  bid : null,

	  /** Some constants */
	  CONST : {
	    NOTIFICATION_DEFAULT : 'default',
	    NOTIFICATION_GRANTED : 'granted',
	    NOTIFICATION_DENIED : 'denied',
	    STATUS : ['offline', 'dnd', 'xa', 'away', 'chat', 'online'],
	    SOUNDS : {
	      MSG : 'incomingMessage.wav', CALL : 'Rotary-Phone6.mp3', NOTICE : 'Ping1.mp3'
	    },
	    REGEX : {
	      JID : new RegExp('\\b[^"&\'\\/:<>@\\s]+@[\\w-_.]+\\b', 'ig'),
	      URL : new RegExp(/(https?:\/\/|www\.)[^\s<>'"]+/gi)
	    },
	    NS : {
	      CARBONS : 'urn:xmpp:carbons:2', FORWARD : 'urn:xmpp:forward:0'
	    },
	    HIDDEN : 'hidden',
	    SHOWN : 'shown'
	  },

	  /**
	   * Parse a unix timestamp and return a formatted time string
	   *
	   * @memberOf jsxc
	   * @param {Object} unixtime
	   * @returns time of day and/or date
	   */
	  getFormattedTime : function(unixtime) {
	    var msgDate = new Date(parseInt(unixtime));
	    var day = ('0' + msgDate.getDate()).slice(-2);
	    var month = ('0' + (msgDate.getMonth() + 1)).slice(-2);
	    var year = msgDate.getFullYear();
	    var hours = ('0' + msgDate.getHours()).slice(-2);
	    var minutes = ('0' + msgDate.getMinutes()).slice(-2);
	    var dateNow = new Date();

	    var date = (typeof msgDate.toLocaleDateString === 'function') ? msgDate.toLocaleDateString() :
	    day + '.' + month + '.' + year;
	    var time = (typeof msgDate.toLocaleTimeString === 'function') ? msgDate.toLocaleTimeString() :
	    hours + ':' + minutes;

	    // compare dates only
	    dateNow.setHours(0, 0, 0, 0);
	    msgDate.setHours(0, 0, 0, 0);

	    if (dateNow.getTime() !== msgDate.getTime()) {
	      return date + ' ' + time;
	    }
	    return time;
	  },

	  /**
	   * Return the last fulljid received or null if no full jid is stored
	   *
	   *
	   * Can update the jid
	   *
	   */
	  getCurrentActiveJidForBid : function(bid) {

	    var fulljid = null;

	    var buddy = jsxc.storage.getUserItem('buddy', bid);
	    console.log(buddy);

	    // jid is present in buddy entrie, return it
	    if (buddy && buddy.jid && Strophe.getResourceFromJid(buddy.jid) !== null) {
	      return buddy.jid;
	    }

	    // jid is not complete so attach the last resource received and store it
	    else if (buddy.res && buddy.res.length > 0) {
	      fulljid = buddy.jid + "/" + buddy.res[0];
	      buddy.jid = fulljid;
	      jsxc.storage.setUserItem('buddy', bid, buddy);
	    }

	    // no res available
	    else {
	      jsxc.error("Invalid buddy entry, no resource available: ");
	      jsxc.error(JSON.stringify(buddy));

	      return null;
	    }

	    // // recover all ressources availables
	    // var res = jsxc.storage.getUserItem('res', bid);
	    // $.each(res, function(ressource, value) {
	    //
	    //   // check if ressourceis online
	    //   if (value === jsxc.CONST.STATUS.indexOf('online')) {
	    //     fulljid = bid + "/" + ressource;
	    //
	    //     // stop loop
	    //     return false;
	    //   }
	    // });

	    return fulljid;

	  },

	  /**
	   * Write debug message to console and to log.
	   *
	   * @memberOf jsxc
	   * @param {String} msg Debug message
	   * @param {Object} data
	   * @param {String} Could be warn|error|null
	   */
	  debug : function(msg, data, level) {

	    if (level) {
	      msg = '[' + level + '] ' + msg;
	    }

	    if (data) {
	      if (jsxc.storage.getItem('debug') === true) {
	        console.log(msg, data);
	      }

	      // try to convert data to string
	      var d;
	      try {
	        // clone html snippet
	        d = $("<span>").prepend($(data).clone()).html();
	      } catch (err) {
	        try {
	          d = JSON.stringify(data);
	        } catch (err2) {
	          d = 'error while stringify, see js console';
	        }
	      }

	      jsxc.log = jsxc.log + '$ ' + msg + ': ' + d + '\n';

	      console.log(msg, data);

	    } else {
	      console.log(msg);

	      // stack trace
	      if (jsxc.storage.getItem('debug')) {
	        var err = new Error();
	        console.log(err.stack);
	      }

	      jsxc.log = jsxc.log + '$ ' + msg + '\n';
	    }
	  },

	  /**
	   * Write warn message.
	   *
	   * @memberOf jsxc
	   * @param {String} msg Warn message
	   * @param {Object} data
	   */
	  warn : function(msg, data) {
	    jsxc.debug(msg, data, 'WARN');
	  },

	  /**
	   * Write error message.
	   *
	   * @memberOf jsxc
	   * @param {String} msg Error message
	   * @param {Object} data
	   */
	  error : function(msg, data) {
	    jsxc.debug(msg, data, 'ERROR');
	  },

	  /** debug log */
	  log : '',

	  /**
	   * Register a listener for disconnecting chat client if user
	   * refresh or leave the webpage
	   * @private
	   */
	  _disconnectBeforeUnload : function() {

	    if (jsxc.master === true) {

	      window.addEventListener("beforeunload", function(e) {

	        jsxc.xmpp.logout(false);

	        // here we call directly this method to be sure it have time to execute
	        jsxc.xmpp.disconnected();

	        // TODO: try to send "presence=unaivalable" from here ?

	        console.error("Disconnected before leaving page");

	      }, false);

	    }

	  },

	  /**
	   * This function initializes important core functions and event handlers.
	   * Afterwards it performs the following actions in the given order:
	   *
	   * <ol>
	   *  <li>If (loginForm.ifFound = 'force' and form was found) or (jid or rid or
	   *    sid was not found) intercept form, and listen for credentials.</li>
	   *  <li>Attach with jid, rid and sid from storage, if no form was found or
	   *    loginForm.ifFound = 'attach'</li>
	   *  <li>Attach with jid, rid and sid from options.xmpp, if no form was found or
	   *    loginForm.ifFound = 'attach'</li>
	   * </ol>
	   *
	   * @memberOf jsxc
	   * @param {object} options See {@link jsxc.options}
	   */
	  init : function(options) {

	    if (options && options.loginForm && typeof options.loginForm.attachIfFound === 'boolean' &&
	        !options.loginForm.ifFound) {
	      // translate deprated option attachIfFound found to new ifFound
	      options.loginForm.ifFound = (options.loginForm.attachIfFound) ? 'attach' : 'pause';
	    }

	    if (options) {
	      // override default options
	      $.extend(true, jsxc.options, options);
	    }

	    jsxc.api.callback("onInit");

	    // Check localStorage
	    if (typeof(localStorage) === 'undefined') {
	      jsxc.warn("Browser doesn't support localStorage.");
	      return;
	    }

	    /**
	     * Getter method for options. Saved options will override default one.
	     *
	     * @param {string} key option key
	     * @returns default or saved option value
	     */
	    jsxc.options.get = function(key) {
	      if (jsxc.bid) {
	        var local = jsxc.storage.getUserItem('options') || {};

	        return (typeof local[key] !== 'undefined') ? local[key] : jsxc.options[key];
	      }

	      return jsxc.options[key];
	    };

	    /**
	     * Setter method for options. Will write into localstorage.
	     *
	     * @param {string} key option key
	     * @param {object} value option value
	     */
	    jsxc.options.set = function(key, value) {
	      jsxc.storage.updateItem('options', key, value, true);
	    };

	    jsxc.storageNotConform = jsxc.storage.getItem('storageNotConform');
	    if (jsxc.storageNotConform === null) {
	      jsxc.storageNotConform = 2;
	    }

	    /**
	     * Initialize i18n
	     */
	    jsxc.localization.init();

	    /**
	     * Initialize stat module
	     * @type {default}
	     */
	    var statsOptions = jsxc.options.get("stats");
	    if (statsOptions && statsOptions.enabled) {

	      var _statsManager = __webpack_require__(1)({

	        destinationUrl : statsOptions.destinationUrl,

	        authorization : statsOptions.authorization,

	        interval : 2000,

	        autosend : true,

	      });

	      jsxc.stats = {
	        addEvent : _statsManager.addEvent.bind(_statsManager)
	      }

	    }

	    else {
	      jsxc.stats = {
	        addEvent : function() {
	        }
	      }
	    }

	    jsxc.stats.addEvent('jsxc.init');

	    if (jsxc.storage.getItem('debug') === true) {
	      jsxc.options.otr.debug = true;
	    }

	    // initailizing sha 1 tool
	    jsxc.sha1 = __webpack_require__(2);

	    // initializing rest api
	    jsxc.rest.init();

	    // help
	    jsxc.help.init();

	    // Register event listener for the storage event
	    window.addEventListener('storage', jsxc.storage.onStorage, false);

	    $(document).on('attached.jsxc', function() {
	      // Looking for logout element
	      if (jsxc.options.logoutElement !== null && $(jsxc.options.logoutElement).length > 0) {
	        var logout = function(ev) {
	          if (!jsxc.xmpp.conn || !jsxc.xmpp.conn.authenticated) {
	            return;
	          }

	          ev.stopPropagation();
	          ev.preventDefault();

	          jsxc.options.logoutElement = $(this);
	          jsxc.triggeredFromLogout = true;

	          jsxc.xmpp.logout();
	        };

	        jsxc.options.logoutElement = $(jsxc.options.logoutElement);

	        jsxc.options.logoutElement.off('click', null, logout).one('click', logout);
	      }
	    });

	    var isStorageAttachParameters = jsxc.storage.getItem('rid') && jsxc.storage.getItem('sid') &&
	        jsxc.storage.getItem('jid');
	    var isOptionsAttachParameters = jsxc.options.xmpp.rid && jsxc.options.xmpp.sid &&
	        jsxc.options.xmpp.jid;
	    var isForceLoginForm = jsxc.options.loginForm && jsxc.options.loginForm.ifFound === 'force' &&
	        jsxc.isLoginForm();

	    // Check if we have to establish a new connection
	    if ((!isStorageAttachParameters && !isOptionsAttachParameters) || isForceLoginForm) {

	      // clean up rid and sid
	      jsxc.storage.removeItem('rid');
	      jsxc.storage.removeItem('sid');

	      // Looking for a login form
	      if (!jsxc.isLoginForm()) {

	        if (jsxc.options.displayRosterMinimized()) {
	          // Show minimized roster
	          jsxc.storage.setUserItem('roster', 'hidden');
	          jsxc.gui.roster.init();
	          jsxc.gui.roster.noConnection();
	        }

	        return;
	      }

	      if (typeof jsxc.options.formFound === 'function') {
	        jsxc.options.formFound.call();
	      }

	      // create jquery object
	      var form = jsxc.options.loginForm.form = $(jsxc.options.loginForm.form);
	      var events = form.data('events') || {
	            submit : []
	          };
	      var submits = [];

	      // save attached submit events and remove them. Will be reattached
	      // in jsxc.submitLoginForm
	      $.each(events.submit, function(index, val) {
	        submits.push(val.handler);
	      });

	      form.data('submits', submits);
	      form.off('submit');

	      // Add jsxc login action to form
	      form.submit(function() {
	        jsxc.prepareLogin(function(settings) {
	          if (settings !== false) {
	            // settings.xmpp.onlogin is deprecated since v2.1.0
	            var enabled = (settings.loginForm && settings.loginForm.enable) ||
	                (settings.xmpp && settings.xmpp.onlogin);
	            enabled = enabled === "true" || enabled === true;

	            if (enabled) {
	              jsxc.options.loginForm.triggered = true;

	              jsxc.xmpp.login(jsxc.options.xmpp.jid, jsxc.options.xmpp.password);
	            }
	          } else {
	            jsxc.submitLoginForm();
	          }
	        });

	        // Trigger submit in jsxc.xmpp.connected()
	        return false;
	      });

	    } else if (!jsxc.isLoginForm() ||
	        (jsxc.options.loginForm && jsxc.options.loginForm.ifFound === 'attach')) {

	      // Restore old connection

	      if (typeof jsxc.storage.getItem('alive') !== 'number') {
	        jsxc.onMaster();
	      } else {
	        jsxc.checkMaster();
	      }
	    }

	  },

	  /**
	   * Attach to previous session if jid, sid and rid are available
	   * in storage or options (default behaviour also for {@link jsxc.init}).
	   *
	   * @memberOf jsxc
	   */
	  /**
	   * Start new chat session with given jid and password.
	   *
	   * @memberOf jsxc
	   * @param {string} jid Jabber Id
	   * @param {string} password Jabber password
	   */
	  /**
	   * Attach to new chat session with jid, sid and rid.
	   *
	   * @memberOf jsxc
	   * @param {string} jid Jabber Id
	   * @param {string} sid Session Id
	   * @param {string} rid Request Id
	   */
	  start : function() {
	    var args = arguments;

	    if (jsxc.role_allocation && !jsxc.master) {
	      jsxc.debug('There is an other master tab');

	      return false;
	    }

	    if (jsxc.xmpp.conn && jsxc.xmpp.connected) {
	      jsxc.debug('We are already connected');

	      return false;
	    }

	    if (args.length === 3) {
	      $(document).one('attached.jsxc', function() {
	        // save rid after first attachment
	        jsxc.xmpp.onRidChange(jsxc.xmpp.conn._proto.rid);

	        jsxc.onMaster();
	      });
	    }

	    jsxc.checkMaster(function() {

	      jsxc.xmpp.login.apply(this, args);

	    });
	  },

	  /**
	   * Returns true if login form is found.
	   *
	   * @memberOf jsxc
	   * @returns {boolean} True if login form was found.
	   */
	  isLoginForm : function() {
	    return jsxc.options.loginForm.form && jsxc.el_exists(jsxc.options.loginForm.form) &&
	        jsxc.el_exists(jsxc.options.loginForm.jid) && jsxc.el_exists(jsxc.options.loginForm.pass);
	  },

	  /**
	   * Load settings and prepare jid.
	   *
	   * @memberOf jsxc
	   * @param {string} username
	   * @param {string} password
	   * @param {function} cb Called after login is prepared with result as param
	   */
	  prepareLogin : function(username, password, cb) {
	    if (typeof username === 'function') {
	      cb = username;
	      username = null;
	    }
	    username = username || $(jsxc.options.loginForm.jid).val();
	    password = password || $(jsxc.options.loginForm.pass).val();

	    if (!jsxc.triggeredFromBox && (jsxc.options.loginForm.onConnecting === 'dialog' ||
	        typeof jsxc.options.loginForm.onConnecting === 'undefined')) {
	      jsxc.gui.showWaitAlert(jsxc.t('Logging_in'));
	    }

	    var settings;

	    if (typeof jsxc.options.loadSettings === 'function') {
	      settings = jsxc.options.loadSettings.call(this, username, password, function(s) {
	        jsxc._prepareLogin(username, password, cb, s);
	      });

	      if (typeof settings !== 'undefined') {
	        jsxc._prepareLogin(username, password, cb, settings);
	      }
	    } else {
	      jsxc._prepareLogin(username, password, cb);
	    }
	  },

	  /**
	   * Process xmpp settings and save loaded settings.
	   *
	   * @private
	   * @memberOf jsxc
	   * @param {string} username
	   * @param {string} password
	   * @param {function} cb Called after login is prepared with result as param
	   * @param {object} [loadedSettings] additonal options
	   */
	  _prepareLogin : function(username, password, cb, loadedSettings) {
	    if (loadedSettings === false) {
	      jsxc.warn('No settings provided');

	      cb(false);
	      return;
	    }

	    // prevent to modify the original object
	    var settings = $.extend(true, {}, jsxc.options);

	    if (loadedSettings) {
	      // overwrite current options with loaded settings;
	      settings = $.extend(true, settings, loadedSettings);
	    } else {
	      loadedSettings = {};
	    }

	    if (typeof settings.xmpp.username === 'string') {
	      username = settings.xmpp.username;
	    }

	    var resource = (settings.xmpp.resource) ? '/' + settings.xmpp.resource : '';
	    var domain = settings.xmpp.domain;
	    var jid;

	    if (username.match(/@(.*)$/)) {
	      jid = (username.match(/\/(.*)$/)) ? username : username + resource;
	    } else {
	      jid = username + '@' + domain + resource;
	    }

	    if (typeof jsxc.options.loginForm.preJid === 'function') {
	      jid = jsxc.options.loginForm.preJid(jid);
	    }

	    jsxc.bid = jsxc.jidToBid(jid);

	    settings.xmpp.username = jid.split('@')[0];
	    settings.xmpp.domain = jid.split('@')[1].split('/')[0];
	    settings.xmpp.resource = jid.split('@')[1].split('/')[1] || "";

	    if (!loadedSettings.xmpp) {
	      // force xmpp settings to be saved to storage
	      loadedSettings.xmpp = {};
	    }

	    // save loaded settings to storage
	    $.each(loadedSettings, function(key) {
	      var old = jsxc.options.get(key);
	      var val = settings[key];
	      val = $.extend(true, old, val);

	      jsxc.options.set(key, val);
	    });

	    jsxc.options.xmpp.jid = jid;
	    jsxc.options.xmpp.password = password;

	    cb(settings);
	  },

	  /**
	   * Called if the script is a slave
	   */
	  onSlave : function() {
	    jsxc.debug('I am the slave.');

	    jsxc.role_allocation = true;
	    jsxc.bid = jsxc.jidToBid(jsxc.storage.getItem('jid'));

	    jsxc.gui.init();

	    jsxc.restoreRoster();
	    jsxc.restoreWindows();
	    jsxc.restoreCompleted = true;

	    $(document).trigger('restoreCompleted.jsxc');
	  },

	  /**
	   * Called if the script is the master
	   */
	  onMaster : function() {
	    jsxc.debug('I am master.');

	    jsxc.master = true;

	    // Init local storage
	    jsxc.storage.setItem('alive', 0);
	    jsxc.storage.setItem('alive_busy', 0);

	    // Sending keepalive signal
	    jsxc.startKeepAlive();

	    jsxc.role_allocation = true;

	    // master have to be disconnected from client on unload
	    jsxc._disconnectBeforeUnload();

	    // Do not automatically connect on master
	    //jsxc.xmpp.login();
	  },

	  /**
	   * Checks if there is a master
	   *
	   * @param {function} [cb] Called if no master was found.
	   */
	  checkMaster : function(cb) {
	    jsxc.debug('check master');

	    cb = (cb && typeof cb === 'function') ? cb : jsxc.onMaster;

	    if (typeof jsxc.storage.getItem('alive') !== 'number') {
	      cb.call();
	    } else {
	      jsxc.to.push(window.setTimeout(cb, 1000));
	      jsxc.storage.ink('alive');
	    }
	  },

	  masterActions : function() {

	    if (!jsxc.xmpp.conn || !jsxc.xmpp.conn.authenticated) {
	      return;
	    }

	    //prepare notifications
	    var noti = jsxc.storage.getUserItem('notification');
	    noti = (typeof noti === 'number') ? noti : 2;
	    if (jsxc.options.notification && noti > 0 && jsxc.notification.hasSupport()) {
	      if (jsxc.notification.hasPermission()) {
	        jsxc.notification.init();
	      } else {
	        jsxc.notification.prepareRequest();
	      }
	    } else {
	      // No support => disable
	      jsxc.options.notification = false;
	    }

	    if (jsxc.options.get('otr').enable) {
	      // create or load DSA key
	      jsxc.otr.createDSA();
	    }

	    jsxc.gui.updateAvatar($('#jsxc_roster > .jsxc_bottom'),
	        jsxc.jidToBid(jsxc.storage.getItem('jid')), 'own');
	  },

	  /**
	   * Start sending keep-alive signal
	   */
	  startKeepAlive : function() {
	    jsxc.keepalive = window.setInterval(jsxc.keepAlive, jsxc.options.timeout - 1000);
	  },

	  /**
	   * Sends the keep-alive signal to signal that the master is still there.
	   */
	  keepAlive : function() {
	    jsxc.storage.ink('alive');
	  },

	  /**
	   * Send one keep-alive signal with higher timeout, and than resume with
	   * normal signal
	   */
	  keepBusyAlive : function() {
	    if (jsxc.toBusy) {
	      window.clearTimeout(jsxc.toBusy);
	    }

	    if (jsxc.keepalive) {
	      window.clearInterval(jsxc.keepalive);
	    }

	    jsxc.storage.ink('alive_busy');
	    jsxc.toBusy = window.setTimeout(jsxc.startKeepAlive, jsxc.options.busyTimeout - 1000);
	  },

	  /**
	   * Generates a random integer number between 0 and max
	   *
	   * @param {Integer} max
	   * @return {Integer} random integer between 0 and max
	   */
	  random : function(max) {
	    return Math.floor(Math.random() * max);
	  },

	  /**
	   * Checks if there is a element with the given selector
	   *
	   * @param {String} selector jQuery selector
	   * @return {Boolean}
	   */
	  el_exists : function(selector) {
	    return $(selector).length > 0;
	  },

	  /**
	   * Creates a CSS compatible string from a JID
	   *
	   * @param {type} jid Valid Jabber ID
	   * @returns {String} css Compatible string
	   */
	  jidToCid : function(jid) {
	    jsxc.warn('jsxc.jidToCid is deprecated!');

	    var cid = Strophe.getBareJidFromJid(jid).replace('@', '-').replace(/\./g, '-').toLowerCase();

	    return cid;
	  },

	  /**
	   * Create comparable bar jid.
	   *
	   * @memberOf jsxc
	   * @param jid
	   * @returns comparable bar jid
	   */
	  jidToBid : function(jid) {
	    return Strophe.unescapeNode(Strophe.getBareJidFromJid(jid).toLowerCase());
	  },

	  /**
	   * Restore roster
	   */
	  restoreRoster : function() {
	    var buddies = jsxc.storage.getUserItem('buddylist');

	    if (!buddies || buddies.length === 0) {
	      jsxc.debug('No saved buddylist.');

	      jsxc.gui.roster.empty();

	      return;
	    }

	    $.each(buddies, function(index, value) {
	      jsxc.gui.roster.add(value);
	    });

	    jsxc.gui.roster.loaded = true;
	    $(document).trigger('cloaded.roster.jsxc');
	  },

	  /**
	   * Restore all windows
	   */
	  restoreWindows : function() {
	    var windows = jsxc.storage.getUserItem('windowlist');

	    if (windows === null) {
	      return;
	    }

	    $.each(windows, function(index, bid) {
	      var win = jsxc.storage.getUserItem('window', bid);

	      if (!win) {
	        jsxc.debug('Associated window-element is missing: ' + bid);
	        return true;
	      }

	      jsxc.gui.window.init(bid);

	      if (!win.minimize) {
	        jsxc.gui.window.show(bid);
	      } else {
	        jsxc.gui.window.hide(bid);
	      }

	      jsxc.gui.window.setText(bid, win.text);
	    });
	  },

	  /**
	   * This method submits the specified login form.
	   */
	  submitLoginForm : function() {
	    var form = jsxc.options.loginForm.form.off('submit');

	    // Attach original events
	    var submits = form.data('submits') || [];
	    $.each(submits, function(index, val) {
	      form.submit(val);
	    });

	    if (form.find('#submit').length > 0) {
	      form.find('#submit').click();
	    } else {
	      form.submit();
	    }
	  },

	  /**
	   * Escapes some characters to HTML character
	   */
	  escapeHTML : function(text) {
	    text = text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
	    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	  },

	  /**
	   * Removes all html tags.
	   *
	   * @memberOf jsxc
	   * @param text
	   * @returns stripped text
	   */
	  removeHTML : function(text) {
	    return $('<span>').html(text).text();
	  },

	  /**
	   * Executes only one of the given events
	   *
	   * @param {string} obj.key event name
	   * @param {function} obj.value function to execute
	   * @returns {string} namespace of all events
	   */
	  switchEvents : function(obj) {
	    var ns = Math.random().toString(36).substr(2, 12);
	    var self = this;

	    $.each(obj, function(key, val) {
	      $(document).one(key + '.' + ns, function() {
	        $(document).off('.' + ns);

	        val.apply(self, arguments);
	      });
	    });

	    return ns;
	  },

	  /**
	   * Checks if tab is hidden.
	   *
	   * @returns {boolean} True if tab is hidden
	   */
	  isHidden : function() {
	    var hidden = false;

	    if (typeof document.hidden !== 'undefined') {
	      hidden = document.hidden;
	    } else if (typeof document.webkitHidden !== 'undefined') {
	      hidden = document.webkitHidden;
	    } else if (typeof document.mozHidden !== 'undefined') {
	      hidden = document.mozHidden;
	    } else if (typeof document.msHidden !== 'undefined') {
	      hidden = document.msHidden;
	    }

	    // handle multiple tabs
	    if (hidden && jsxc.master) {
	      jsxc.storage.ink('hidden', 0);
	    } else if (!hidden && !jsxc.master) {
	      jsxc.storage.ink('hidden');
	    }

	    return hidden;
	  },

	  /**
	   * Checks if tab has focus.
	   *
	   * @returns {boolean} True if tabs has focus
	   */
	  hasFocus : function() {
	    var focus = true;

	    if (typeof document.hasFocus === 'function') {
	      focus = document.hasFocus();
	    }

	    if (!focus && jsxc.master) {
	      jsxc.storage.ink('focus', 0);
	    } else if (focus && !jsxc.master) {
	      jsxc.storage.ink('focus');
	    }

	    return focus;
	  },

	  /**
	   * Executes the given function in jsxc namespace.
	   *
	   * @memberOf jsxc
	   * @param {string} fnName Function name
	   * @param {array} fnParams Function parameters
	   * @returns Function return value
	   */
	  exec : function(fnName, fnParams) {
	    var fnList = fnName.split('.');
	    var fn = jsxc[fnList[0]];
	    var i;
	    for (i = 1; i < fnList.length; i++) {
	      fn = fn[fnList[i]];
	    }

	    if (typeof fn === 'function') {
	      return fn.apply(null, fnParams);
	    }
	  },

	  /**
	   * Hash string into 32-bit signed integer.
	   *
	   * @memberOf jsxc
	   * @param {string} str input string
	   * @returns {integer} 32-bit signed integer
	   */
	  hashStr : function(str) {
	    var hash = 0, i;

	    if (str.length === 0) {
	      return hash;
	    }

	    for (i = 0; i < str.length; i++) {
	      hash = ((hash << 5) - hash) + str.charCodeAt(i);
	      hash |= 0; // Convert to 32bit integer
	    }

	    return hash;
	  },

	  isExtraSmallDevice : function() {
	    return $(window).width() < 500;
	  },

	  /**
	   * Debug tool for printing stack trace
	   *
	   */
	  stackTrace : function() {
	    var time = (new Date()).getTime();
	    console.error("Stack trace");
	    console.error("Time: " + time);
	    console.error((new Error()).stack);
	  },

	  /**
	   * Attach a video stream with element
	   *
	   * Example: attachMediaStream($("<video>").get(0), stream);
	   *
	   * @param stream
	   * @param element
	   */
	  attachMediaStream : function(element, stream) {
	    jsxc.xmpp.conn.jingle.RTC.attachMediaStream(element, stream);
	  }

	};


	/**
	 * Handle XMPP stuff.
	 *
	 * @namespace jsxc.xmpp
	 */
	jsxc.xmpp = {

	  conn : null, // connection

	  /**
	   * Return the node of the current user. Example: jean@something/client is connected so
	   * getCurrentNode() return jean
	   * @returns {*}
	   */
	  getCurrentNode : function() {
	    return Strophe.getNodeFromJid(jsxc.xmpp.conn.jid);
	  },

	  /**
	   * Create new connection or attach to old
	   *
	   * @name login
	   * @memberOf jsxc.xmpp
	   * @private
	   */
	  /**
	   * Create new connection with given parameters.
	   *
	   * @name login^2
	   * @param {string} jid
	   * @param {string} password
	   * @memberOf jsxc.xmpp
	   * @private
	   */
	  /**
	   * Attach connection with given parameters.
	   *
	   * @name login^3
	   * @param {string} jid
	   * @param {string} sid
	   * @param {string} rid
	   * @memberOf jsxc.xmpp
	   * @private
	   */
	  login : function() {

	    // check if not already connected
	    if (jsxc.xmpp.conn && jsxc.xmpp.conn.authenticated) {
	      jsxc.debug('Connection already authenticated.');
	      return;
	    }

	    var jid = null, password = null, sid = null, rid = null;

	    switch (arguments.length) {
	      case 2:
	        jid = arguments[0];
	        password = arguments[1];
	        break;
	      case 3:
	        jid = arguments[0];
	        sid = arguments[1];
	        rid = arguments[2];
	        break;
	      default:
	        sid = jsxc.storage.getItem('sid');
	        rid = jsxc.storage.getItem('rid');

	        if (sid !== null && rid !== null) {
	          jid = jsxc.storage.getItem('jid');
	        } else {
	          sid = jsxc.options.xmpp.sid || null;
	          rid = jsxc.options.xmpp.rid || null;
	          jid = jsxc.options.xmpp.jid;
	        }
	    }

	    // check if jid present
	    if (!jid) {
	      jsxc.warn('Jid required for login');

	      return;
	    }

	    // check if bid present
	    if (!jsxc.bid) {
	      jsxc.bid = jsxc.jidToBid(jid);
	    }

	    // check if url is present
	    var url = jsxc.options.get('xmpp').url;
	    if (!url) {
	      jsxc.warn('xmpp.url required for login');

	      return;
	    }

	    // Register eventlisteners
	    if (!(jsxc.xmpp.conn && jsxc.xmpp.conn.connected)) {

	      $(document).on('connected.jsxc', jsxc.xmpp.connected);
	      $(document).on('attached.jsxc', jsxc.xmpp.attached);
	      $(document).on('disconnected.jsxc', jsxc.xmpp.disconnected);
	      $(document).on('connfail.jsxc', jsxc.xmpp.onConnfail);
	      $(document).on('authfail.jsxc', jsxc.xmpp.onAuthFail);

	      Strophe.addNamespace('RECEIPTS', 'urn:xmpp:receipts');
	    }

	    // Create new connection (no login)
	    jsxc.xmpp.conn = new Strophe.Connection(url);

	    if (jsxc.storage.getItem('debug') === true) {
	      jsxc.xmpp.conn.xmlInput = function(data) {
	        console.log('<', data);
	      };
	      jsxc.xmpp.conn.xmlOutput = function(data) {
	        console.log('>', data);
	      };
	    }

	    jsxc.xmpp.conn.nextValidRid = jsxc.xmpp.onRidChange;

	    var callback = function(status, condition) {

	      jsxc.debug(Object.getOwnPropertyNames(Strophe.Status)[status] + ': ' + condition);

	      switch (status) {
	        case Strophe.Status.CONNECTING:
	          $(document).trigger('connecting.jsxc');
	          break;
	        case Strophe.Status.CONNECTED:
	          jsxc.bid = jsxc.jidToBid(jsxc.xmpp.conn.jid.toLowerCase());
	          $(document).trigger('connected.jsxc');
	          break;
	        case Strophe.Status.ATTACHED:
	          $(document).trigger('attached.jsxc');
	          break;
	        case Strophe.Status.DISCONNECTED:
	          $(document).trigger('disconnected.jsxc');
	          break;
	        case Strophe.Status.CONNFAIL:
	          $(document).trigger('connfail.jsxc');
	          break;
	        case Strophe.Status.AUTHFAIL:
	          $(document).trigger('authfail.jsxc');
	          break;
	      }
	    };

	    if (jsxc.xmpp.conn.caps) {
	      jsxc.xmpp.conn.caps.node = 'djoe-jsxc-client';
	    }

	    if (sid && rid) {
	      jsxc.debug('Try to attach');
	      jsxc.debug('SID: ' + sid);

	      jsxc.reconnect = true;

	      jsxc.xmpp.conn.attach(jid, sid, rid, callback);
	    } else {
	      jsxc.debug('New connection');

	      if (jsxc.xmpp.conn.caps) {
	        // Add system handler, because user handler isn't called before
	        // we are authenticated
	        jsxc.xmpp.conn._addSysHandler(function(stanza) {
	          var from = jsxc.xmpp.conn.domain, c = stanza.querySelector('c'), ver = c.getAttribute(
	              'ver'), node = c.getAttribute('node');

	          var _jidNodeIndex = JSON.parse(localStorage.getItem('strophe.caps._jidNodeIndex')) || {};

	          jsxc.xmpp.conn.caps._jidVerIndex[from] = ver;
	          _jidNodeIndex[from] = node;

	          localStorage.setItem('strophe.caps._jidVerIndex',
	              JSON.stringify(jsxc.xmpp.conn.caps._jidVerIndex));
	          localStorage.setItem('strophe.caps._jidNodeIndex', JSON.stringify(_jidNodeIndex));
	        }, Strophe.NS.CAPS);
	      }

	      jsxc.xmpp.conn.connect(jid, password || jsxc.options.xmpp.password, callback);
	    }
	  },

	  /**
	   * Logs user out of his xmpp session and does some clean up.
	   *
	   * @param {boolean} complete If set to false, roster will not be removed
	   * @returns {Boolean}
	   */
	  logout : function(complete) {

	    var self = jsxc.xmpp;

	    // send the last presence to inform of disconnection
	    if (self.conn) {
	      self.conn.send($pres({
	        type : "unavailable"
	      }));
	    }

	    // instruct all tabs
	    jsxc.storage.removeItem('sid');

	    // clean up
	    jsxc.storage.removeUserItem('buddylist');
	    jsxc.storage.removeUserItem('windowlist');
	    jsxc.storage.removeUserItem('unreadMsg');

	    if (!jsxc.master) {
	      $('#jsxc_roster').remove();
	      $('#jsxc_windowlist').remove();

	      $(document).trigger("removed.gui.jsxc");

	      return true;
	    }

	    if (jsxc.xmpp.conn === null) {
	      return true;
	    }

	    // Hide dropdown menu
	    $('body').click();

	    jsxc.triggeredFromElement = (typeof complete === 'boolean') ? complete : true;

	    // restore all otr objects
	    $.each(jsxc.storage.getUserItem('otrlist') || {}, function(i, val) {
	      jsxc.otr.create(val);
	    });

	    var numOtr = Object.keys(jsxc.otr.objects || {}).length + 1;
	    var disReady = function() {
	      if (--numOtr <= 0) {
	        jsxc.xmpp.conn.flush();

	        setTimeout(function() {
	          if (jsxc.xmpp.conn) {
	            jsxc.xmpp.conn.disconnect();
	          }
	        }, 600);
	      }
	    };

	    // end all private conversations
	    $.each(jsxc.otr.objects || {}, function(key, obj) {
	      if (obj.msgstate === OTR.CONST.MSGSTATE_ENCRYPTED) {
	        obj.endOtr.call(obj, function() {
	          obj.init.call(obj);
	          jsxc.otr.backup(key);

	          disReady();
	        });
	      } else {
	        disReady();
	      }
	    });

	    disReady();

	    // Trigger real logout in jsxc.xmpp.disconnected()
	    return false;
	  },

	  /**
	   * Triggered if connection is established
	   *
	   * @private
	   */
	  connected : function() {

	    jsxc.xmpp.conn.pause();

	    jsxc.xmpp.initNewConnection();

	    jsxc.xmpp.saveSessionParameter();

	    if (jsxc.options.loginForm.triggered) {
	      switch (jsxc.options.loginForm.onConnected || 'submit') {
	        case 'submit':
	          jsxc.submitLoginForm();
	          return;
	        case false:
	          return;
	      }
	    }

	    // start chat

	    jsxc.gui.dialog.close();

	    jsxc.xmpp.conn.resume();
	    jsxc.onMaster();

	    $(document).trigger('attached.jsxc');
	  },

	  /**
	   * Triggered if connection is attached
	   *
	   * @private
	   */
	  attached : function() {

	    $('#jsxc_roster').removeClass('jsxc_noConnection');

	    jsxc.xmpp.conn.addHandler(jsxc.xmpp.onRosterChanged, 'jabber:iq:roster', 'iq', 'set');
	    jsxc.xmpp.conn.addHandler(jsxc.xmpp.onMessage, null, 'message', 'chat');
	    jsxc.xmpp.conn.addHandler(jsxc.xmpp.onReceived, null, 'message');
	    jsxc.xmpp.conn.addHandler(jsxc.xmpp.onPresence, null, 'presence');

	    jsxc.gui.init();

	    var caps = jsxc.xmpp.conn.caps;
	    var domain = jsxc.xmpp.conn.domain;

	    if (caps) {
	      var conditionalEnable = function() {
	      };

	      if (jsxc.options.get('carbons').enable) {
	        conditionalEnable = function() {
	          if (jsxc.xmpp.conn.caps.hasFeatureByJid(domain, jsxc.CONST.NS.CARBONS)) {
	            jsxc.xmpp.carbons.enable();
	          }
	        };

	        $(document).on('caps.strophe', function onCaps(ev, from) {

	          if (from !== domain) {
	            return;
	          }

	          conditionalEnable();

	          $(document).off('caps.strophe', onCaps);
	        });
	      }

	      if (typeof caps._knownCapabilities[caps._jidVerIndex[domain]] === 'undefined') {
	        var _jidNodeIndex = JSON.parse(localStorage.getItem('strophe.caps._jidNodeIndex')) || {};

	        jsxc.debug('Request server capabilities');

	        caps._requestCapabilities(jsxc.xmpp.conn.domain, _jidNodeIndex[domain],
	            caps._jidVerIndex[domain]);
	      } else {
	        // We know server caps
	        conditionalEnable();
	      }
	    }

	    // Only load roaster if necessary
	    if (!jsxc.reconnect || !jsxc.storage.getUserItem('buddylist')) {
	      // in order to not overide existing presence information, we send
	      // pres first after roster is ready
	      $(document).one('cloaded.roster.jsxc', jsxc.xmpp.sendPres);

	      $('#jsxc_roster > p:first').remove();

	      var iq = $iq({
	        type : 'get'
	      }).c('query', {
	        xmlns : 'jabber:iq:roster'
	      });

	      jsxc.xmpp.conn.sendIQ(iq, jsxc.xmpp.onRoster);
	    } else {
	      jsxc.xmpp.sendPres();

	      if (!jsxc.restoreCompleted) {
	        jsxc.restoreRoster();
	        jsxc.restoreWindows();
	        jsxc.restoreCompleted = true;

	        $(document).trigger('restoreCompleted.jsxc');
	      }
	    }

	    jsxc.xmpp.saveSessionParameter();

	    jsxc.masterActions();
	  },

	  saveSessionParameter : function() {

	    var nomJid = Strophe.getBareJidFromJid(jsxc.xmpp.conn.jid).toLowerCase() + '/' +
	        Strophe.getResourceFromJid(jsxc.xmpp.conn.jid);

	    // Save sid and jid
	    jsxc.storage.setItem('sid', jsxc.xmpp.conn._proto.sid);
	    jsxc.storage.setItem('jid', nomJid);
	  },

	  initNewConnection : function() {
	    // make shure roster will be reloaded
	    jsxc.storage.removeUserItem('buddylist');

	    jsxc.storage.removeUserItem('windowlist');
	    jsxc.storage.removeUserItem('own');
	    jsxc.storage.removeUserItem('avatar', 'own');
	    jsxc.storage.removeUserItem('otrlist');
	    jsxc.storage.removeUserItem('unreadMsg');

	    // reset user options
	    jsxc.storage.removeUserElement('options', 'RTCPeerConfig');
	  },

	  /**
	   * Sends presence stanza to server.
	   */
	  sendPres : function() {
	    // disco stuff
	    if (jsxc.xmpp.conn.disco) {
	      jsxc.xmpp.conn.disco.addIdentity('client', 'web', 'JSXC');
	      jsxc.xmpp.conn.disco.addFeature(Strophe.NS.DISCO_INFO);
	      jsxc.xmpp.conn.disco.addFeature(Strophe.NS.RECEIPTS);
	    }

	    // create presence stanza
	    var pres = $pres();

	    if (jsxc.xmpp.conn.caps) {
	      // attach caps
	      pres.c('c', jsxc.xmpp.conn.caps.generateCapsAttrs()).up();
	    }

	    var presState = jsxc.storage.getUserItem('presence') || 'online';
	    if (presState !== 'online') {
	      pres.c('show').t(presState).up();
	    }

	    var priority = jsxc.options.get('priority');
	    if (priority && typeof priority[presState] !== 'undefined' &&
	        parseInt(priority[presState]) !== 0) {
	      pres.c('priority').t(priority[presState]).up();
	    }

	    jsxc.debug('Send presence', pres.toString());
	    jsxc.xmpp.conn.send(pres);
	  },

	  /**
	   * Triggered if lost connection
	   *
	   * @private
	   */
	  disconnected : function() {
	    jsxc.debug('disconnected');

	    jsxc.storage.removeItem('jid');
	    jsxc.storage.removeItem('sid');
	    jsxc.storage.removeItem('rid');
	    jsxc.storage.removeItem('hidden');
	    jsxc.storage.removeUserItem('avatar', 'own');
	    jsxc.storage.removeUserItem('otrlist');

	    $(document).off('connected.jsxc', jsxc.xmpp.connected);
	    $(document).off('attached.jsxc', jsxc.xmpp.attached);
	    $(document).off('disconnected.jsxc', jsxc.xmpp.disconnected);
	    $(document).off('connfail.jsxc', jsxc.xmpp.onConnfail);
	    $(document).off('authfail.jsxc', jsxc.xmpp.onAuthFail);

	    jsxc.xmpp.conn = null;

	    $('#jsxc_windowList').remove();

	    if (jsxc.triggeredFromElement) {
	      $(document).trigger('toggle.roster.jsxc', ['hidden', 0]);
	      $('#jsxc_roster').remove();

	      if (jsxc.triggeredFromLogout) {
	        window.location = jsxc.options.logoutElement.attr('href');
	      }

	      $(document).trigger("removed.gui.jsxc");

	    } else {
	      jsxc.gui.roster.noConnection();
	    }

	    window.clearInterval(jsxc.keepalive);
	    jsxc.role_allocation = false;
	    jsxc.master = false;
	    jsxc.storage.removeItem('alive');

	    console.error("Disconnected from JSXC");

	  },

	  /**
	   * Triggered on connection fault
	   *
	   * @param {String} condition information why we lost the connection
	   * @private
	   */
	  onConnfail : function(ev, condition) {
	    jsxc.debug('XMPP connection failed: ' + condition);

	    if (jsxc.options.loginForm.triggered) {
	      jsxc.submitLoginForm();
	    }
	  },

	  /**
	   * Triggered on auth fail.
	   *
	   * @private
	   */
	  onAuthFail : function() {

	    if (jsxc.options.loginForm.triggered) {
	      switch (jsxc.options.loginForm.onAuthFail || 'ask') {
	        case 'ask':
	          jsxc.gui.showAuthFail();
	          break;
	        case 'submit':
	          jsxc.submitLoginForm();
	          break;
	        case 'quiet':
	        case false:
	          return;
	      }
	    }
	  },

	  /**
	   * Triggered on initial roster load
	   *
	   * @param {dom} iq
	   * @private
	   */
	  onRoster : function(iq) {
	    /*
	     * <iq from='' type='get' id=''> <query xmlns='jabber:iq:roster'> <item
	     * jid='' name='' subscription='' /> ... </query> </iq>
	     */

	    jsxc.debug('Load roster', iq);

	    var buddies = [];

	    $(iq).find('item').each(function() {
	      var jid = $(this).attr('jid');
	      var name = $(this).attr('name') || jid;
	      var bid = jsxc.jidToBid(jid);
	      var sub = $(this).attr('subscription');

	      buddies.push(bid);

	      jsxc.storage.removeUserItem('res', bid);

	      jsxc.storage.saveBuddy(bid, {
	        jid : jid, name : name, status : 0, sub : sub, res : []
	      });

	      jsxc.gui.roster.add(bid);
	    });

	    if (buddies.length === 0) {
	      jsxc.gui.roster.empty();
	    }

	    jsxc.storage.setUserItem('buddylist', buddies);

	    // load bookmarks
	    jsxc.xmpp.bookmarks.load();

	    jsxc.gui.roster.loaded = true;
	    jsxc.debug('Roster loaded');
	    $(document).trigger('cloaded.roster.jsxc');
	  },

	  /**
	   * Triggerd on roster changes
	   *
	   * @param {dom} iq
	   * @returns {Boolean} True to preserve handler
	   * @private
	   */
	  onRosterChanged : function(iq) {
	    /*
	     * <iq from='' type='set' id=''> <query xmlns='jabber:iq:roster'> <item
	     * jid='' name='' subscription='' /> </query> </iq>
	     */

	    jsxc.debug('onRosterChanged', iq);

	    $(iq).find('item').each(function() {
	      var jid = $(this).attr('jid');
	      var name = $(this).attr('name') || jid;
	      var bid = jsxc.jidToBid(jid);
	      var sub = $(this).attr('subscription');
	      // var ask = $(this).attr('ask');

	      if (sub === 'remove') {
	        jsxc.gui.roster.purge(bid);
	      } else {
	        var bl = jsxc.storage.getUserItem('buddylist');

	        if (bl.indexOf(bid) < 0) {
	          bl.push(bid); // (INFO) push returns the new length
	          jsxc.storage.setUserItem('buddylist', bl);
	        }

	        var temp = jsxc.storage.saveBuddy(bid, {
	          jid : jid, name : name, sub : sub
	        });

	        if (temp === 'updated') {

	          jsxc.gui.update(bid);
	          jsxc.gui.roster.reorder(bid);
	        } else {
	          jsxc.gui.roster.add(bid);
	        }
	      }

	      // Remove pending friendship request from notice list
	      if (sub === 'from' || sub === 'both') {
	        var notices = jsxc.storage.getUserItem('notices');
	        var noticeKey = null, notice;

	        for (noticeKey in notices) {
	          notice = notices[noticeKey];

	          if (notice.fnName === 'gui.showApproveDialog' && notice.fnParams[0] === jid) {
	            jsxc.debug('Remove notice with key ' + noticeKey);

	            jsxc.notice.remove(noticeKey);
	          }
	        }
	      }
	    });

	    if (!jsxc.storage.getUserItem('buddylist') ||
	        jsxc.storage.getUserItem('buddylist').length === 0) {
	      jsxc.gui.roster.empty();
	    } else {
	      $('#jsxc_roster > p:first').remove();
	    }

	    // preserve handler
	    return true;
	  },

	  /**
	   * Triggered on incoming presence stanzas
	   *
	   * @param {dom} presence
	   * @private
	   */
	  onPresence : function(presence) {
	    /*
	     * <presence xmlns='jabber:client' type='unavailable' from='' to=''/>
	     *
	     * <presence xmlns='jabber:client' from='' to=''> <priority>5</priority>
	     * <c xmlns='http://jabber.org/protocol/caps'
	     * node='http://psi-im.org/caps' ver='caps-b75d8d2b25' ext='ca cs
	     * ep-notify-2 html'/> </presence>
	     *
	     * <presence xmlns='jabber:client' from='' to=''> <show>chat</show>
	     * <status></status> <priority>5</priority> <c
	     * xmlns='http://jabber.org/protocol/caps' node='http://psi-im.org/caps'
	     * ver='caps-b75d8d2b25' ext='ca cs ep-notify-2 html'/> </presence>
	     */
	    jsxc.debug('onPresence', presence);

	    var ptype = $(presence).attr('type');
	    var from = $(presence).attr('from');

	    // full jid of presence from
	    // /!\ May be not a full jid
	    var jid = from.toLowerCase();

	    var r = Strophe.getResourceFromJid(from);
	    var bid = jsxc.jidToBid(jid);
	    var data = jsxc.storage.getUserItem('buddy', bid) || {};
	    var res = jsxc.storage.getUserItem('res', bid) || {};
	    var status = null;
	    var xVCard = $(presence).find('x[xmlns="vcard-temp:x:update"]');

	    // ignore own presence
	    if (bid === Strophe.getBareJidFromJid(jsxc.storage.getItem("jid"))) {
	      return true;
	    }

	    // ignore error presences
	    if (ptype === 'error') {
	      $(document).trigger('error.presence.jsxc', [from, presence]);

	      var error = $(presence).find('error');

	      //@TODO display error message
	      jsxc.error(
	          '[XMPP] ' + error.attr('code') + ' ' + error.find(">:first-child").prop('tagName'));
	      return true;
	    }

	    // incoming friendship request
	    if (ptype === 'subscribe') {
	      var bl = jsxc.storage.getUserItem('buddylist');

	      if (bl.indexOf(bid) > -1) {
	        jsxc.debug('Auto approve contact request, because he is already in our contact list.');

	        jsxc.xmpp.resFriendReq(jid, true);
	        if (data.sub !== 'to') {
	          jsxc.xmpp.addBuddy(jid, data.name);
	        }

	        return true;
	      }

	      jsxc.storage.setUserItem('friendReq', {
	        jid : jid, approve : -1
	      });
	      jsxc.notice.add(jsxc.t('Friendship_request'), jsxc.t('from') + ' ' + jid,
	          'gui.showApproveDialog', [jid]);

	      return true;
	    }

	    // disconnection presences
	    else if (ptype === 'unavailable' || ptype === 'unsubscribed') {
	      status = jsxc.CONST.STATUS.indexOf('offline');
	    }

	    // custom presences
	    else {
	      var show = $(presence).find('show').text();
	      if (show === '') {
	        status = jsxc.CONST.STATUS.indexOf('online');
	      } else {
	        status = jsxc.CONST.STATUS.indexOf(show);
	      }
	    }

	    // delete resource if buddy disconnecting
	    if (status === 0) {
	      delete res[r];
	    }
	    // or create/modify resource status
	    else if (r !== "" && r !== "null") {
	      res[r] = status;
	    }

	    // This code seems to order resources by highest status value (from offline 0 to online 5)
	    // But when a buddy is disconnecting, his status do not change every time, sometimes it stay at
	    // 5 so now the last resource stored in "buddy" entry will be at first position

	    // var maxVal = [];
	    // var max = 0, prop = null;
	    // for (prop in res) {
	    //   if (res.hasOwnProperty(prop) && prop != "null") {
	    //     if (max <= res[prop]) {
	    //       if (max !== res[prop]) {
	    //         maxVal = [];
	    //         max = res[prop];
	    //       }
	    //       maxVal.push(prop);
	    //     }
	    //   }
	    // }

	    // reorganize resources

	    // max status will be stored in buddy entry and will represent buddy status
	    var maxStatus = 0;

	    // resource array will be stored in buddy entry, with at first position the most recent resource
	    var resArray = [];
	    $.each(res, function(resource, status) {

	      // remove possible "null" resources
	      if (resource === null || resource === "null") {
	        delete res[resource];
	        return true;
	      }

	      // get max status
	      if (status > maxStatus) {
	        maxStatus = status;
	      }

	      // create an array of resource to store it in buddy entry
	      if (resource !== r) {
	        resArray.push(resource);
	      }
	    });

	    // put the last received ressource on first index
	    resArray.unshift(r);

	    if (data.status === 0 && maxStatus > 0) {
	      // buddy has come online
	      jsxc.notification.notify({
	        title : data.name, msg : jsxc.t('has_come_online'), source : bid
	      });
	    }

	    if (data.type === 'groupchat') {
	      data.status = status;
	    } else {
	      data.status = maxStatus;
	    }

	    data.res = resArray;

	    // change jid only if necessary
	    if (r !== "" && r !== null && r !== "null") {
	      data.jid = jid;
	    }

	    // Looking for avatar
	    if (xVCard.length > 0 && data.type !== 'groupchat') {
	      var photo = xVCard.find('photo');

	      if (photo.length > 0 && photo.text() !== data.avatar) {
	        jsxc.storage.removeUserItem('avatar', data.avatar);
	        data.avatar = photo.text();
	      }
	    }

	    // Reset jid
	    if (jsxc.gui.window.get(bid).length > 0) {
	      jsxc.gui.window.get(bid).data('jid', jid);
	    }

	    jsxc.storage.setUserItem('buddy', bid, data);
	    jsxc.storage.setUserItem('res', bid, res);

	    jsxc.debug('Presence (' + from + '): ' + status);

	    jsxc.gui.update(bid);
	    jsxc.gui.roster.reorder(bid);

	    $(document).trigger('presence.jsxc', [from, status, presence]);

	    // preserve handler
	    return true;
	  },

	  /**
	   * Triggered on incoming message stanzas
	   *
	   * @param {dom} presence
	   * @returns {Boolean}
	   * @private
	   */
	  onMessage : function(stanza) {

	    var forwarded = $(stanza).find('forwarded[xmlns="' + jsxc.CONST.NS.FORWARD + '"]');
	    var message, carbon;

	    if (forwarded.length > 0) {
	      message = forwarded.find('> message');
	      forwarded = true;
	      carbon = $(stanza).find('> [xmlns="' + jsxc.CONST.NS.CARBONS + '"]');

	      if (carbon.length === 0) {
	        carbon = false;
	      }

	      jsxc.debug('Incoming forwarded message', message);
	    } else {
	      message = stanza;
	      forwarded = false;
	      carbon = false;

	      jsxc.debug('Incoming message', message);
	    }

	    var body = $(message).find('body:first').text();

	    if (!body || (body.match(/\?OTR/i) && forwarded)) {
	      return true;
	    }

	    var type = $(message).attr('type');
	    var from = $(message).attr('from');
	    var mid = $(message).attr('id');
	    var bid;

	    var delay = $(message).find('delay[xmlns="urn:xmpp:delay"]');

	    var stamp = (delay.length > 0) ? new Date(delay.attr('stamp')) : new Date();
	    stamp = stamp.getTime();

	    if (carbon) {
	      var direction = (carbon.prop("tagName") === 'sent') ? jsxc.Message.OUT : jsxc.Message.IN;
	      bid = jsxc.jidToBid((direction === 'out') ? $(message).attr('to') : from);

	      jsxc.gui.window.postMessage({
	        bid : bid,
	        direction : direction,
	        msg : body,
	        encrypted : false,
	        forwarded : forwarded,
	        stamp : stamp
	      });

	      return true;

	    } else if (forwarded) {
	      // Someone forwarded a message to us

	      body = from + ' ' + jsxc.t('to') + ' ' + $(stanza).attr('to') + '"' + body + '"';

	      from = $(stanza).attr('from');
	    }

	    var jid = Strophe.getBareJidFromJid(from);
	    bid = jsxc.jidToBid(jid);
	    var data = jsxc.storage.getUserItem('buddy', bid);
	    var request = $(message).find("request[xmlns='urn:xmpp:receipts']");

	    if (data === null) {
	      // jid not in roster

	      var chat = jsxc.storage.getUserItem('chat', bid) || [];

	      if (chat.length === 0) {
	        jsxc.notice.add(jsxc.t('Unknown_sender'),
	            jsxc.t('You_received_a_message_from_an_unknown_sender') + ' (' + bid + ').',
	            'gui.showUnknownSender', [bid]);
	      }

	      var msg = jsxc.removeHTML(body);
	      msg = jsxc.escapeHTML(msg);

	      jsxc.storage.saveMessage(bid, 'in', msg, false, forwarded, stamp);

	      return true;
	    }

	    var win = jsxc.gui.window.init(bid);

	    // If we now the full jid, we use it
	    if (type === 'chat') {
	      win.data('jid', from);
	      jsxc.storage.updateUserItem('buddy', bid, {
	        jid : from
	      });
	    }

	    $(document).trigger('message.jsxc', [from, body]);

	    // create related otr object
	    if (jsxc.master && !jsxc.otr.objects[bid]) {
	      jsxc.otr.create(bid);
	    }

	    if (!forwarded && mid !== null && request.length && data !== null &&
	        (data.sub === 'both' || data.sub === 'from') && type === 'chat') {
	      // Send received according to XEP-0184
	      jsxc.xmpp.conn.send($msg({
	        to : from
	      }).c('received', {
	        xmlns : 'urn:xmpp:receipts', id : mid
	      }));
	    }

	    if (jsxc.otr.objects.hasOwnProperty(bid)) {
	      jsxc.otr.objects[bid].receiveMsg(body, {
	        stamp : stamp, forwarded : forwarded
	      });
	    } else {
	      jsxc.gui.window.postMessage({
	        bid : bid,
	        direction : jsxc.Message.IN,
	        msg : body,
	        encrypted : false,
	        forwarded : forwarded,
	        stamp : stamp
	      });
	    }

	    // preserve handler
	    return true;
	  },

	  /**
	   * Triggerd if the rid changed
	   *
	   * @param {integer} rid next valid request id
	   * @private
	   */
	  onRidChange : function(rid) {
	    jsxc.storage.setItem('rid', rid);
	  },

	  /**
	   * response to friendship request
	   *
	   * @param {string} from jid from original friendship req
	   * @param {boolean} approve
	   */
	  resFriendReq : function(from, approve) {

	    if (jsxc.master) {

	      jsxc.xmpp.conn.send($pres({
	        to : from, type : (approve) ? 'subscribed' : 'unsubscribed'
	      }));

	      if (approve === true) {
	        jsxc.api.callback("onBuddyAccepted", [from]);
	      }

	      jsxc.storage.removeUserItem('friendReq');
	      jsxc.gui.dialog.close();

	    } else {
	      jsxc.storage.updateUserItem('friendReq', 'approve', approve);
	    }
	  },

	  /**
	   * Add buddy to my friends
	   *
	   * @param {string} username jid
	   * @param {string} alias
	   */
	  addBuddy : function(username, alias) {
	    var bid = jsxc.jidToBid(username);

	    if (jsxc.master) {
	      // add buddy to roster (trigger onRosterChanged)
	      var iq = $iq({
	        type : 'set'
	      }).c('query', {
	        xmlns : 'jabber:iq:roster'
	      }).c('item', {
	        jid : username, name : alias || ''
	      });
	      jsxc.xmpp.conn.sendIQ(iq);

	      // send subscription request to buddy (trigger onRosterChanged)
	      jsxc.xmpp.conn.send($pres({
	        to : username, type : 'subscribe'
	      }));

	      jsxc.api.callback("onBuddyAdded", [username]);

	      jsxc.storage.removeUserItem('add_' + bid);
	    } else {
	      jsxc.storage.setUserItem('add_' + bid, {
	        username : username, alias : alias || null
	      });
	    }

	    $(document).trigger("buddyListChanged.jsxc");
	  },

	  /**
	   * Remove buddy from my friends
	   *
	   * @param {type} jid
	   */
	  removeBuddy : function(jid) {
	    var bid = jsxc.jidToBid(jid);

	    // Shortcut to remove buddy from roster and cancel all subscriptions
	    var iq = $iq({
	      type : 'set'
	    }).c('query', {
	      xmlns : 'jabber:iq:roster'
	    }).c('item', {
	      jid : Strophe.getBareJidFromJid(jid), subscription : 'remove'
	    });
	    jsxc.xmpp.conn.sendIQ(iq);

	    jsxc.gui.roster.purge(bid);

	    $(document).trigger("buddyListChanged.jsxc");
	  },

	  /**
	   * Triggered on incoming messages, whatever the type of
	   * @param stanza
	   * @returns {boolean}
	   */
	  onReceived : function(stanza) {

	    // check if composing presence
	    var composing = $(stanza).find("composing[xmlns='http://jabber.org/protocol/chatstates']");

	    if (composing.length > 0) {

	      var type = $(stanza).attr("type");
	      var from = $(stanza).attr("from");

	      // ignore own notifications in groupchat
	      if (type === "groupchat" && Strophe.getResourceFromJid(from) === jsxc.xmpp.getCurrentNode()) {
	        return true;
	      }

	      jsxc.gui.window.showComposingPresence(from, type);

	      // stop but keep handler
	      return true;
	    }

	    // check if invitation to conference
	    var invitation = $(stanza).find("x[xmlns='jabber:x:conference']");

	    if (invitation.length > 0) {

	      var buddyName = Strophe.getNodeFromJid($(stanza).attr("from"));

	      var roomjid = invitation.attr("jid");

	      var reason = invitation.attr("reason");
	      reason = reason ? "Motif: " + reason : "";

	      jsxc.notice.add(buddyName + " vous invite à participer à une conversation", "",
	          'gui.showJoinConversationDialog', [roomjid, buddyName]);

	      // stop but keep handler
	      return true;
	    }

	    // show received acknowledgement
	    var received = $(stanza).find("received[xmlns='urn:xmpp:receipts']");

	    if (received.length) {
	      var receivedId = received.attr('id');
	      var message = new jsxc.Message(receivedId);

	      message.received();
	    }

	    return true;
	  },

	  /**
	   * Public function to send message.
	   *
	   * @memberOf jsxc.xmpp
	   * @param bid css jid of user
	   * @param msg message
	   * @param uid unique id
	   */
	  sendMessage : function(bid, msg, uid) {
	    if (jsxc.otr.objects.hasOwnProperty(bid)) {
	      jsxc.otr.objects[bid].sendMsg(msg, uid);
	    } else {
	      jsxc.xmpp._sendMessage(jsxc.gui.window.get(bid).data('jid'), msg, uid);
	    }
	  },

	  /**
	   * Create message stanza and send it.
	   *
	   * @memberOf jsxc.xmpp
	   * @param jid Jabber id
	   * @param msg Message
	   * @param uid unique id
	   * @private
	   */
	  _sendMessage : function(jid, msg, uid) {
	    var data = jsxc.storage.getUserItem('buddy', jsxc.jidToBid(jid)) || {};
	    var isBar = (Strophe.getBareJidFromJid(jid) === jid);
	    var type = data.type || 'chat';

	    var xmlMsg = $msg({
	      to : jid, type : type, id : uid
	    }).c('body').t(msg);

	    if (jsxc.xmpp.carbons.enabled && msg.match(/^\?OTR/)) {
	      xmlMsg.up().c("private", {
	        xmlns : jsxc.CONST.NS.CARBONS
	      });
	    }

	    if (type === 'chat' &&
	        (isBar || jsxc.xmpp.conn.caps.hasFeatureByJid(jid, Strophe.NS.RECEIPTS))) {
	      // Add request according to XEP-0184
	      xmlMsg.up().c('request', {
	        xmlns : 'urn:xmpp:receipts'
	      });
	    }

	    jsxc.xmpp.conn.send(xmlMsg);
	  },

	  /**
	   * This function loads a vcard.
	   *
	   * @memberOf jsxc.xmpp
	   * @param bid
	   * @param cb
	   * @param error_cb
	   */
	  loadVcard : function(bid, cb, error_cb) {
	    if (jsxc.master) {
	      jsxc.xmpp.conn.vcard.get(cb, bid, error_cb);
	    } else {
	      jsxc.storage.setUserItem('vcard', bid, 'request:' + (new Date()).getTime());

	      $(document).one('loaded.vcard.jsxc', function(ev, result) {
	        if (result && result.state === 'success') {
	          cb($(result.data).get(0));
	        } else {
	          error_cb();
	        }
	      });
	    }
	  },

	  /**
	   * Retrieves capabilities.
	   *
	   * @memberOf jsxc.xmpp
	   * @param jid
	   * @returns List of known capabilities
	   */
	  getCapabilitiesByJid : function(jid) {
	    if (jsxc.xmpp.conn) {
	      return jsxc.xmpp.conn.caps.getCapabilitiesByJid(jid);
	    }

	    var jidVerIndex = JSON.parse(localStorage.getItem('strophe.caps._jidVerIndex')) || {};
	    var knownCapabilities = JSON.parse(localStorage.getItem('strophe.caps._knownCapabilities')) ||
	        {};

	    if (jidVerIndex[jid]) {
	      return knownCapabilities[jidVerIndex[jid]];
	    }

	    return null;
	  },

	  /**
	   * Test if jid has given features
	   *
	   * @param  {string}   jid     Jabber id
	   * @param  {string[]} feature Single feature or list of features
	   * @param  {Function} cb      Called with the result as first param.
	   * @return {boolean}          True, if jid has all given features. Null, if we do not know it
	   *     currently.
	   */
	  hasFeatureByJid : function(jid, feature, cb) {
	    var conn = jsxc.xmpp.conn;
	    cb = cb || function() {
	        };

	    if (!feature) {
	      return false;
	    }

	    if (!$.isArray(feature)) {
	      feature = $.makeArray(feature);
	    }

	    var check = function(knownCapabilities) {

	      console.log("knownCapabilities");
	      console.log(knownCapabilities);

	      if (!knownCapabilities) {
	        return null;
	      }
	      var i;
	      for (i = 0; i < feature.length; i++) {
	        if (knownCapabilities['features'].indexOf(feature[i]) < 0) {
	          return false;
	        }
	      }
	      return true;
	    };

	    if (conn.caps._jidVerIndex[jid] && conn.caps._knownCapabilities[conn.caps._jidVerIndex[jid]]) {
	      var hasFeature = check(conn.caps._knownCapabilities[conn.caps._jidVerIndex[jid]]);
	      cb(hasFeature);

	      return hasFeature;
	    }

	    $(document).on('strophe.caps', function(ev, j, capabilities) {

	      if (j === jid) {
	        cb(check(capabilities));

	        $(document).off(ev);
	      }
	    });

	    return null;
	  }
	};

	/**
	 * Handle carbons (XEP-0280);
	 *
	 * @namespace jsxc.xmpp.carbons
	 */
	jsxc.xmpp.carbons = {
	  enabled : false,

	  /**
	   * Enable carbons.
	   *
	   * @memberOf jsxc.xmpp.carbons
	   * @param cb callback
	   */
	  enable : function(cb) {
	    var iq = $iq({
	      type : 'set'
	    }).c('enable', {
	      xmlns : jsxc.CONST.NS.CARBONS
	    });

	    jsxc.xmpp.conn.sendIQ(iq, function() {
	      jsxc.xmpp.carbons.enabled = true;

	      jsxc.debug('Carbons enabled');

	      if (cb) {
	        cb.call(this);
	      }
	    }, function(stanza) {
	      jsxc.warn('Could not enable carbons', stanza);
	    });
	  },

	  /**
	   * Disable carbons.
	   *
	   * @memberOf jsxc.xmpp.carbons
	   * @param cb callback
	   */
	  disable : function(cb) {
	    var iq = $iq({
	      type : 'set'
	    }).c('disable', {
	      xmlns : jsxc.CONST.NS.CARBONS
	    });

	    jsxc.xmpp.conn.sendIQ(iq, function() {
	      jsxc.xmpp.carbons.enabled = false;

	      jsxc.debug('Carbons disabled');

	      if (cb) {
	        cb.call(this);
	      }
	    }, function(stanza) {
	      jsxc.warn('Could not disable carbons', stanza);
	    });
	  },

	  /**
	   * Enable/Disable carbons depending on options key.
	   *
	   * @memberOf jsxc.xmpp.carbons
	   * @param err error message
	   */
	  refresh : function(err) {
	    if (err === false) {
	      return;
	    }

	    if (jsxc.options.get('carbons').enable) {
	      return jsxc.xmpp.carbons.enable();
	    }

	    return jsxc.xmpp.carbons.disable();
	  }
	};

	/**
	 * New Multimedia Stream Manager
	 *
	 * Intend to replace jsxc.lib.webrtc.js
	 *
	 * Modules can be switched by use jsxc.multimediaStreamSystem in
	 * jsxc.lib.js
	 *
	 */

	jsxc.mmstream = {

	  debug : true,

	  auto_accept : false,

	  /**
	   * Waiting time before call after sending invitations. If we call before invitation arrive,
	   * videoconference will fail.
	   *
	   * Receiver need to get all jids participant before first calls
	   *
	   */
	  //WAIT_BEFORE_CALL : 1000,
	  WAIT_BEFORE_CALL : 1000,

	  /**
	   * Hangup call if no response
	   */
	  HANGUP_IF_NO_RESPONSE : 20000,

	  /** required disco features for video call */
	  reqVideoFeatures : ['urn:xmpp:jingle:apps:rtp:video', 'urn:xmpp:jingle:apps:rtp:audio',
	    'urn:xmpp:jingle:transports:ice-udp:1', 'urn:xmpp:jingle:apps:dtls:0'],

	  /** required disco features for file transfer */
	  reqFileFeatures : ['urn:xmpp:jingle:1', 'urn:xmpp:jingle:apps:file-transfer:3'],

	  /**
	   * True if navigator can share is screen
	   */
	  screenSharingCapable : false,

	  /**
	   * Messages for Chrome communicate with Chrome extension
	   */

	  chromeExtensionMessages : {
	    isAvailable : "djoe.screencapture-extension." + "is-available",
	    available : "djoe.screencapture-extension." + "available",
	    getScreenSourceId : "djoe.screencapture-extension." + "get-screen-source-id",
	    getAPTSourceId : "djoe.screencapture-extension." + "get-audio-plus-tab-source-id"
	  },

	  /**
	   * Where local stream is stored, to avoid too many stream creation
	   */
	  localStream : null,

	  /**
	   * Current streams
	   */
	  remoteVideoSessions : {},

	  /**
	   * Recipients for call
	   *
	   */
	  recipients : [],

	  /**
	   * Currents video dialogs
	   */
	  videoDialogs : [],

	  /**
	   * List of full jids which are automatically accepted
	   */
	  videoconferenceAcceptedBuddies : [],

	  /**
	   * List of full jids which are waiting for our response. To avoid too many notifications
	   */
	  videoconferenceWaitingBuddies : [],

	  /**
	   * Same but only sessions. JID => Sessions
	   */
	  videoconferenceWaitingSessions : {},

	  /**
	   *
	   * XMPP connexion
	   *
	   */
	  conn : null,

	  /**
	   * Initialize and configure multimedia stream manager
	   */
	  init : function() {

	    var self = jsxc.mmstream;

	    // create strophe connexion
	    self.conn = jsxc.xmpp.conn;

	    self.messageHandler = self.conn.addHandler(jsxc.mmstream._onReceived, null, 'message');

	    self._registerListenersOnAttached();

	    // check if jingle strophe plugin exist
	    if (!self.conn.jingle) {
	      jsxc.error('No jingle plugin found!');
	      return;
	    }

	    // check screen sharing capabilities
	    if (self._isNavigatorChrome() === true) {
	      self._isChromeExtensionInstalled();
	    }

	    self.gui._initGui();

	    var manager = self.conn.jingle.manager;

	    // listen for incoming jingle calls
	    manager.on('incoming', self._onIncomingJingleSession.bind(self));

	    manager.on('peerStreamAdded', self._onRemoteStreamAdded.bind(self));
	    manager.on('peerStreamRemoved', self._onRemoteStreamRemoved.bind(self));

	    //self.gui.showLocalVideo();

	  },

	  /**
	   * Return an array of jid from a string list "a@b,c@d,e@f"
	   *
	   * @param stringList
	   * @returns {Array}
	   * @private
	   */
	  _unserializeJidList : function(stringList) {

	    var res = stringList.split(",");
	    var finalRes = [];
	    $.each(res, function(index, elmt) {
	      finalRes.push(elmt.trim().toLowerCase());
	    });

	    return finalRes;
	  },

	  /**
	   * Check if received stanza is a videoconference invitation
	   * @param stanza
	   * @private
	   */
	  _onReceived : function(stanza) {

	    console.log("");
	    console.log("_onReceived");
	    console.log(stanza);

	    var self = jsxc.mmstream;

	    // check if stanza is a videoconference invitation
	    var video = $(stanza).find("videoconference");
	    if (video.length > 0) {

	      jsxc.stats.addEvent("jsxc.mmstream.videoconference.invitationReceived");

	      var initiator = $(stanza).attr("from");
	      var participants = self._unserializeJidList(video.attr("users") || "");
	      // var message = video.attr("message");
	      // var datetime = video.attr("datetime");

	      // TODO check if datetime is now - 5 min

	      // check how many participants
	      if (participants.length < 1) {
	        // stop but keep handler
	        return true;
	      }

	      // add buddies to waiting list to avoid too many notifications
	      self.videoconferenceWaitingBuddies =
	          self.videoconferenceWaitingBuddies.concat(participants, [initiator]);

	      if (jsxc.mmstream.debug === true) {
	        console.log("");
	        console.log("self.videoconferenceWaitingBuddies");
	        console.log(self.videoconferenceWaitingBuddies);
	      }

	      // TODO: remove own JID from list
	      // TODO: add message to dialog
	      // TODO: reject all other video conference invitation while user is deciding

	      // show dialog
	      self.gui._showIncomingVideoconferenceDialog(Strophe.getNodeFromJid(initiator))

	      // video conference is accepted
	          .done(function() {

	            console.error("Video conference accepted");

	            jsxc.stats.addEvent("jsxc.mmstream.videoconference.accepted");

	            // iterate people was waiting
	            var waiting = self.videoconferenceWaitingBuddies;
	            var copy = JSON.parse(JSON.stringify(waiting));

	            $.each(copy, function(index, element) {

	              // work only with participants of this videoconference
	              if (element === initiator || participants.indexOf(element) > -1) {

	                // accept each buddy who had already called
	                if (typeof self.videoconferenceWaitingSessions[element] !== "undefined") {

	                  self.videoconferenceWaitingSessions[element].accept();

	                  if (jsxc.mmstream.debug === true) {
	                    console.log("");
	                    console.log("Session accepted");
	                    console.log(element);
	                    console.log(self.videoconferenceWaitingSessions[element]);
	                  }

	                  delete self.videoconferenceWaitingSessions[element];
	                }

	                // or store buddy in auto accept list
	                else {

	                  if (jsxc.mmstream.debug === true) {
	                    console.error("");
	                    console.error("Waiting for buddy");
	                    console.error(element);
	                  }

	                  self.videoconferenceAcceptedBuddies.push(element);
	                }

	                // and remove it from waiting list
	                waiting.splice(waiting.indexOf(element), 1);
	              }

	            });

	            if (jsxc.mmstream.debug === true) {
	              console.log("");
	              console.log("Before call others");
	              console.log("Waiting list");
	              console.log(waiting);
	            }

	            // TODO: to improve
	            setTimeout(function() {

	              // call every participant after our jid to the initator
	              var toCall = participants.concat([initiator]);
	              toCall.sort();
	              toCall = toCall.concat(toCall);

	              var ownIndex = toCall.indexOf(self.conn.jid);

	              for (var i = ownIndex + 1; i < toCall.length; i++) {

	                // stop if we reach initiator
	                if (toCall[i] === initiator) {
	                  break;
	                }

	                // call
	                self.startVideoCall(toCall[i]);

	              }

	            }, self.WAIT_BEFORE_CALL);

	          })

	          // video conference is rejected
	          .fail(function() {

	            jsxc.stats.addEvent("jsxc.mmstream.videoconference.decline");

	            jsxc.gui.feedback("Vidéo conférence rejetée");

	            // TODO: empty buddy waiting list
	            // TODO: empty session waiting list

	          });

	    }

	    // keep handler
	    return true;

	  },

	  /**
	   * Send an invitation for a video conference.
	   *
	   * For now do not use any particulary XEP
	   *
	   * <videoconference users="..."> contains an alphabetical sorted list of users in conference,
	   * not including  initiator
	   *
	   * /!\ Throw error if ther is a non full jid
	   *
	   * @param fulljidArray
	   * @param message
	   * @returns {*}
	   */
	  _sendVideoconferenceInvitation : function(fulljidArray, message) {

	    if (jsxc.mmstream.debug === true) {
	      console.log("");
	      console.log("_sendVideoconferenceInvitation");
	      console.log(fulljidArray, message);
	    }

	    var self = jsxc.mmstream;

	    // sort array of fjid, to order video calls
	    fulljidArray.sort();

	    // check ressources
	    $.each(fulljidArray, function(index, element) {
	      var res = Strophe.getResourceFromJid(element);
	      if (res === null || res === "" || res === "null") {
	        throw "Only full jid are permitted: " + element;
	      }
	    });

	    var msgid = self.conn.getUniqueId();

	    var msg = $msg({

	      from : self.conn.jid,

	      id : msgid
	    })
	        .c("videoconference", {

	          users : fulljidArray.join(","),

	          datetime : new Date().toString(),

	          message : message || ''

	        });

	    // send one invitation to each participants
	    $.each(fulljidArray, function(index, element) {

	      // console.log("sent to " + element);
	      jsxc.stats.addEvent("jsxc.mmstream.videoconference.sendInvitation");

	      var adressedMessage = $(msg.toString()).attr("to", element);
	      self.conn.send(adressedMessage);

	    });

	    return msgid;
	  },

	  /**
	   * Start a videoconference with specified full jids
	   * @param fulljidArray
	   */
	  startVideoconference : function(fulljidArray, message) {

	    var self = jsxc.mmstream;

	    jsxc.stats.addEvent("jsxc.mmstream.videoconference.start");

	    if (jsxc.mmstream.debug === true) {
	      console.log("");
	      console.log("startVideoconference");
	      console.log(fulljidArray, message);
	    }

	    // TODO verify jid list to get full jid

	    // keep jids
	    self.videoconferenceAcceptedBuddies = self.videoconferenceAcceptedBuddies.concat(fulljidArray);

	    // send an invitation to each participant
	    try {
	      self._sendVideoconferenceInvitation(fulljidArray, message);

	      jsxc.gui.feedback("La vidéoconférence va bientôt commencer ...");

	      // TODO: to improve, we have to wait a little to let invitations go
	      setTimeout(function() {

	        // call each participant
	        $.each(fulljidArray, function(index, element) {
	          self.startVideoCall(element);
	        });

	      }, self.WAIT_BEFORE_CALL);

	    } catch (error) {

	      console.log(error);

	      jsxc.gui.feedback(
	          "Erreur lors de l'envoi des invitations. Veuillez rafraichir la page et réessayer.");
	    }

	  },

	  _sendScreensharingInvitation : function(fulljidArray, message) {
	    console.log("_sendScreensharingInvitation");
	    console.log(fulljidArray);
	    console.log(message);
	  },

	  /**
	   * Cast screen to one or multiple users
	   *
	   * First invitations are sent, after screen is casting
	   *
	   */
	  startScreenSharingMultiPart : function(fulljidArray, message) {

	    var self = jsxc.mmstream;

	    jsxc.stats.addEvent("jsxc.mmstream.screensharing.multipart.start");

	    if (jsxc.mmstream.debug === true) {
	      console.log("");
	      console.log("startScreenSharingMultiPart");
	      console.log(fulljidArray, message);
	    }

	    // TODO verify jid list to get full jid

	    // send an invitation to each participant
	    try {
	      self._sendScreensharingInvitation(fulljidArray, message);

	      jsxc.gui.feedback("Le partage d'écran va bientôt commencer ...");

	      // TODO: to improve, we have to wait a little to let invitations go
	      setTimeout(function() {

	        // call each participant
	        $.each(fulljidArray, function(index, element) {
	          self.shareScreen(element);
	        });

	      }, self.WAIT_BEFORE_CALL);

	    } catch (error) {

	      console.log(error);

	      jsxc.gui.feedback(
	          "Erreur lors de l'envoi des invitations. Veuillez rafraichir la page et réessayer.");
	    }
	  },

	  _isNavigatorFirefox : function() {
	    return typeof InstallTrigger !== 'undefined';
	  },

	  _isNavigatorChrome : function() {
	    return !!window.chrome && !!window.chrome.webstore;
	  },

	  /**
	   * Return a promise indicating if sceen capture is available
	   *
	   * /!\ Promise will never fail for now, it can just be done.
	   *
	   *
	   * @returns {*}
	   * @private
	   */
	  _isChromeExtensionInstalled : function() {

	    var self = jsxc.mmstream;
	    var messages = self.chromeExtensionMessages;

	    var defer = $.Deferred();

	    self.screenSharingCapable = false;

	    if (self._isNavigatorChrome() === true) {

	      /**
	       * Before begin capturing, we have to ask for source id and wait for response
	       */
	      window.addEventListener("message", function(event) {

	        if (event && event.data && event.data === messages.available) {
	          self.screenSharingCapable = true;
	          defer.resolve();
	        }

	      });

	      window.postMessage(messages.isAvailable, '*');

	    }

	    else {
	      defer.reject("InvalidNavigator");
	    }

	    return defer.promise();

	  },

	  /**
	   * Return a promise with the user screen stream, or fail
	   * @private
	   */
	  _getUserScreenStream : function() {

	    var self = jsxc.mmstream;

	    var defer = $.Deferred();
	    var messages = self.chromeExtensionMessages;

	    window.addEventListener("message", function(event) {

	      // filter invalid messages
	      if (!event || !event.data) {
	        jsxc.debug("Invalid event: ");
	        jsxc.debug(event);
	        return;
	      }

	      var data = event.data;

	      // extension send video sourceid
	      if (data.sourceId) {

	        // getUserMedia
	        var constraints = {

	          audio : false,

	          video : {
	            mandatory : {
	              chromeMediaSource : "desktop",
	              maxWidth : screen.width > 1920 ? screen.width : 1920,
	              maxHeight : screen.height > 1080 ? screen.height : 1080,
	              chromeMediaSourceId : data.sourceId
	            }
	          }

	        };

	        navigator.webkitGetUserMedia(constraints,

	            function(stream) {

	              jsxc.stats.addEvent("jsxc.mmstream.screensharing.streamAcquired");

	              window.removeEventListener("message", this);

	              defer.resolve(stream);

	            },

	            // error
	            function(error) {

	              jsxc.stats.addEvent("jsxc.mmstream.screensharing.streamRefused");

	              window.removeEventListener("message", this);

	              defer.fail(error);

	            });

	      }
	    });

	    // ask for source id
	    window.postMessage(messages.getScreenSourceId, '*');

	    return defer.promise();

	  },

	  /**
	   * Share screen with one user
	   *
	   *
	   * /!\ Here we don't check if navigator can share screen
	   * /!\ Here we don't check if navigator can share screen
	   * /!\ Here we don't check if navigator can share screen
	   *
	   * @param fullJid
	   */
	  shareScreen : function(fulljid) {

	    if (jsxc.mmstream.debug === true) {
	      console.error("shareScreen: " + fulljid);
	    }

	    var self = jsxc.mmstream;

	    if (Strophe.getResourceFromJid(fulljid) === null) {
	      throw "JID must be full jid";
	    }

	    // ice configuration
	    self.conn.jingle.setICEServers(self.iceServers);

	    // requesting user media
	    // TODO test chrome 'desktop' constraint ?
	    // TODO test firefox 'window' constraint ?

	    self._getUserScreenStream()

	        .then(function(stream) {

	          // openning jingle session
	          var session = self.conn.jingle.initiate(fulljid, stream);

	          session.on('change:connectionState', self._onSessionStateChanged);

	        })

	        .fail(function(error) {

	          jsxc.error('Failed to get access to local media.');
	          jsxc.error(error);

	          jsxc.gui.feedback(
	              "Impossible d'accéder à votre écran, veuillez autoriser l'accès, installer l'extension si nécéssaire et réessayer.");

	        });

	  },

	  /**
	   *  Called when receive incoming media session
	   *
	   */
	  _onIncomingJingleSession : function(session) {

	    if (jsxc.mmstream.debug === true) {
	      console.error("");
	      console.error("_onIncomingJingleSession");
	      console.error(session);
	    }

	    var self = jsxc.mmstream;
	    var type = (session.constructor) ? session.constructor.name : null;

	    if (type === 'FileTransferSession') {
	      self._onIncomingFileTransfer(session);
	    } else if (type === 'MediaSession') {
	      self._onIncomingCall(session);
	    } else {
	      console.error("Unknown session type: " + type, session);
	    }

	  },

	  /**
	   * Called when incoming file transfer
	   */
	  _onIncomingFileTransfer : function() {

	    jsxc.gui.feedback("Transfert de fichier à l'arrivée");

	    throw "Not implemented yet";

	  },

	  /**
	   * Called on incoming video call
	   */
	  _onIncomingCall : function(session) {

	    var self = jsxc.mmstream;

	    if (jsxc.mmstream.debug === true) {
	      console.error("");
	      console.error("_onIncomingCall " + session.peerID);
	      console.error(session);
	      console.error("self.videoconferenceAcceptedBuddies");
	      console.error(self.videoconferenceAcceptedBuddies);
	    }

	    // send signal to partner
	    session.ring();

	    var bid = jsxc.jidToBid(session.peerID);

	    // display notification
	    var notify = function() {
	      jsxc.notification.notify(jsxc.t('Incoming_call'), jsxc.t('from_sender', {
	        sender : bid
	      }));
	    };

	    // accept video call
	    var acceptRemoteSession = function(localStream) {

	      if (jsxc.mmstream.debug === true) {
	        console.log();
	        console.log("Session accepted: " + session.peerID);
	        console.log(session);
	      }

	      session.addStream(localStream);
	      session.accept();

	    };

	    // decline video call
	    var declineRemoteSession = function(error) {

	      if (jsxc.mmstream.debug === true) {
	        console.log();
	        console.log("Session declined: " + session.peerID);
	        console.log(session);
	      }

	      session.decline();

	      jsxc.gui.feedback("Erreur lors de l'accès à la caméra et au micro: " + error);
	      jsxc.error("Error while using audio/video", error);

	    };

	    // auto accept calls if specified
	    if (self.auto_accept === true) {

	      console.error("AUTO ACCEPT " + session.peerID);

	      notify();

	      // require permission on devices if needed
	      self._requireLocalStream()
	          .done(function(localStream) {
	            acceptRemoteSession(localStream);
	          })
	          .fail(function(error) {
	            declineRemoteSession(error);
	          });
	    }

	    /**
	     * Call from videoconference was initiated by client or videoconf was accepted by client
	     */

	    else if (self.videoconferenceAcceptedBuddies.indexOf(session.peerID) > -1) {

	      if (jsxc.mmstream.debug === true) {
	        console.error("BUDDY ACCEPTED " + session.peerID);
	        console.error("self.videoconferenceAcceptedBuddies");
	        console.error(self.videoconferenceAcceptedBuddies);
	      }
	      // remove from video buddies
	      var i1 = self.videoconferenceAcceptedBuddies.indexOf(session.peerID);
	      self.videoconferenceAcceptedBuddies.splice(i1, 1);

	      if (jsxc.mmstream.debug === true) {
	        console.error("After slice");
	        console.error(self.videoconferenceAcceptedBuddies);
	      }
	      // require permission on devices if needed
	      self._requireLocalStream()
	          .done(function(localStream) {
	            acceptRemoteSession(localStream);
	          })
	          .fail(function(error) {
	            declineRemoteSession(error);
	          });

	    }

	    /**
	     * Call from videoconference will maybe accepted by client
	     */

	    else if (self.videoconferenceWaitingBuddies.indexOf(session.peerID) > -1) {

	      if (jsxc.mmstream.debug === true) {
	        console.error("BUDDY WAITING " + session.peerID);
	      }

	      self.videoconferenceWaitingSessions[session.peerID] = {

	        session : session,

	        accept : function() {
	          // require permission on devices if needed
	          self._requireLocalStream()
	              .done(function(localStream) {
	                acceptRemoteSession(localStream);
	              })
	              .fail(function(error) {
	                declineRemoteSession(error);
	              });
	        }
	      };

	      if (jsxc.mmstream.debug === true) {
	        console.error("self.videoconferenceWaitingSessions");
	        console.error(self.videoconferenceWaitingSessions);
	      }

	    }

	    // show accept/decline confirmation dialog
	    else {

	      notify();

	      console.error("INCOMING CALL " + session.peerID);

	      self.gui._showIncomingCallDialog(bid)
	          .done(function() {

	            // require permission on devices if needed
	            self._requireLocalStream()
	                .done(function(localStream) {
	                  acceptRemoteSession(localStream);
	                })
	                .fail(function(error) {
	                  declineRemoteSession(error);
	                });

	          })

	          .fail(function() {
	            jsxc.gui.feedback("Appel rejeté");
	          });
	    }

	  },

	  /**
	   * Require access to local stream and return a promise with the stream
	   *
	   * If the stream already had been required, return the first stream to avoid
	   *
	   * to many local stream
	   *
	   * @returns {*}
	   * @private
	   */
	  _requireLocalStream : function() {

	    // TODO show indication on window that user have to accept to share video

	    var self = jsxc.mmstream;

	    var defer = $.Deferred();

	    // Stream already stored, show it
	    if (self.localStream) {
	      defer.resolve(self.localStream);
	      return defer.promise();
	    }

	    var constraints = {
	      audio : true, video : true
	    };

	    // require local stream
	    self.conn.jingle.RTC.getUserMedia(constraints,

	        function(localStream) {
	          self.localStream = localStream;
	          defer.resolve(localStream);
	        },

	        function(error) {
	          jsxc.error(error);
	          defer.reject(error);
	        });

	    return defer.promise();

	  },

	  /**
	   * Called when a remote stream is received
	   * @param session
	   * @param stream
	   * @private
	   */
	  _onRemoteStreamAdded : function(session, stream) {

	    if (jsxc.mmstream.debug === true) {
	      console.error("_onRemoteStreamAdded");
	      console.error(session, stream);
	    }

	    var self = jsxc.mmstream;

	    // var isVideoDevice = stream.getVideoTracks().length > 0;
	    // var isAudioDevice = stream.getAudioTracks().length > 0;

	    // TODO: don't display if already present

	    self.gui._showVideoStream(stream, session.peerID);

	    // show sidebar if needed
	    if (self.gui.isSidepanelShown() !== true) {
	      self.gui.toggleVideoPanel();
	    }

	    self.remoteVideoSessions[session.peerID] = {
	      session : session,

	      stream : stream
	    };

	    // show local video if needed
	    if (self.gui.isLocalVideoShown() !== true) {
	      self.gui.showLocalVideo();
	    }

	  },

	  /**
	   * Called when a remote stream is removed
	   * @param session
	   * @param stream
	   * @private
	   */
	  _onRemoteStreamRemoved : function(session, stream) {

	    if (jsxc.mmstream.debug === true) {
	      console.error("_onRemoteStreamRemoved");
	      console.error(session, stream);
	    }

	    var self = jsxc.mmstream;

	    self._stopStream(stream);

	    // found session and remove it from session storage
	    var sessionFound = false;

	    if (typeof self.remoteVideoSessions[session.peerID] !== "undefined") {
	      delete self.remoteVideoSessions[session.peerID];
	      sessionFound = true;
	    }

	    // Hide stream AFTER removed session
	    self.gui._hideVideoStream(session.peerID);

	    if (sessionFound !== true) {
	      console.error("No session found");
	    }

	  },

	  /**
	   * Return list of current active sessions
	   * @returns {Array}
	   */
	  getCurrentVideoSessions : function() {
	    return jsxc.mmstream.remoteVideoSessions;
	  },

	  /**
	   * Call another user with video and audio media
	   * @param fullJid
	   */
	  startVideoCall : function(fulljid) {

	    var self = jsxc.mmstream;

	    if (jsxc.mmstream.debug === true) {
	      console.error("startVideoCall " + fulljid);
	    }

	    if (Strophe.getResourceFromJid(fulljid) === null) {
	      throw "JID must be full jid";
	    }

	    // ice configuration
	    self.conn.jingle.setICEServers(self.iceServers);

	    // requesting user media
	    var constraints = {
	      audio : true, video : true
	    };

	    // Open Jingle session
	    self.conn.jingle.RTC.getUserMedia(constraints, function(stream) {

	          // console.log('onUserMediaSuccess');

	          // here we must verify if tracks are enought
	          // var audioTracks = stream.getAudioTracks();
	          // var videoTracks = stream.getVideoTracks();

	          // console.log("Audio / video tracks: ")
	          // console.log(audioTracks);
	          // console.log(videoTracks);

	          // openning jingle session
	          var session = self.conn.jingle.initiate(fulljid, stream);

	          session.on('change:connectionState', self._onSessionStateChanged);

	          // set timer to hangup if no response
	          self._addAutoHangup(session.sid, fulljid);

	        },

	        function() {

	          console.error('Failed to get access to local media. Error ', arguments);

	          jsxc.gui.feedback(
	              "Impossible d'accéder à votre webcam, veuillez autoriser l'accès et réessayer.");

	        });

	  },

	  /**
	   * Array of jid which be called and have to be close
	   * if no response after determined time
	   */
	  autoHangupCalls : {},

	  /**
	   * Remove an auto hangup timer
	   * @param fulljid
	   * @private
	   */
	  _removeAutoHangup : function(sessionid) {

	    var self = jsxc.mmstream;

	    clearTimeout(self.autoHangupCalls[sessionid]);

	    // unregister timer
	    delete self.autoHangupCalls[sessionid];
	  },

	  /**
	   * Register an auto hangup timer
	   * @param fulljid
	   * @private
	   */
	  _addAutoHangup : function(sessionid, fulljid) {

	    var self = jsxc.mmstream;

	    // check if not already present
	    if (Object.keys(self.autoHangupCalls).indexOf(sessionid) > -1) {
	      jsxc.error("Call already exist: " + sessionid);
	      return;
	    }

	    // create a timer to hangup
	    var timeout = setTimeout(function() {

	      // hangup and feedback
	      self.hangupCall(fulljid);

	      jsxc.gui.feedback("Pas de réponse de " + Strophe.getNodeFromJid(fulljid));

	    }, self.HANGUP_IF_NO_RESPONSE);

	    // register timer
	    self.autoHangupCalls[sessionid] = timeout;

	  },

	  /**
	   * Called on session changes
	   *
	   * @param session
	   * @param state
	   * @private
	   */
	  _onSessionStateChanged : function(session, state) {

	    var self = jsxc.mmstream;

	    console.log("[JINGLE] _onSessionStateChanged: " + state);
	    console.log(session);

	    // inform user of problem
	    if (state === "interrupted") {
	      jsxc.gui.feedback("Problème de connexion avec " + Strophe.getNodeFromJid(session.peerID));
	    }

	    // remove auto hangup timer
	    else if (state === "connected") {
	      self._removeAutoHangup(session.sid);
	    }
	  },

	  /**
	   * Stop a call
	   */
	  hangupCall : function(fulljid) {

	    jsxc.stats.addEvent("jsxc.mmstream.videocall.hangupcall");

	    var self = jsxc.mmstream;

	    if (Strophe.getResourceFromJid(fulljid) === null) {
	      throw "JID must be full jid";
	    }

	    self.conn.jingle.terminate(fulljid, "gone");

	    // close local stream if necessary

	    if (Object.keys(self.getCurrentVideoSessions()).length < 1) {
	      self.stopLocalStream();
	    }

	    //$(document).trigger("hangup.videocall.jsxc");

	  },

	  /**
	   * Stop a stream
	   */
	  _stopStream : function(stream) {

	    console.log(stream);

	    $.each(stream.getTracks(), function(index, element) {

	      console.log(element);

	      element.stop();

	      if (typeof element.enabled !== "undefined") {
	        element.enabled = false;
	      }

	    });
	  },

	  /**
	   * Stop local stream and reset it
	   */
	  stopLocalStream : function() {

	    var self = jsxc.mmstream;

	    if (jsxc.mmstream.debug === true) {
	      console.error("Stop local stream");
	      console.error(self.localStream);
	      console.error(self.conn.jingle.localStream);
	    }

	    if (self.localStream) {
	      self._stopStream(self.localStream);
	      self.localStream = null;
	    }

	    if (self.conn.jingle.localStream) {
	      self._stopStream(self.conn.jingle.localStream);
	      self.conn.jingle.localStream = null;
	    }
	  },

	  /**
	   * Return list of capable resources.
	   *
	   * @memberOf jsxc.mmstream
	   * @param jid
	   * @param {(string|string[])} features list of required features
	   * @returns {Array}
	   */
	  getCapableRes : function(jid, features) {

	    var self = jsxc.mmstream;
	    var bid = jsxc.jidToBid(jid);
	    var res = Object.keys(jsxc.storage.getUserItem('res', bid) || {}) || [];

	    if (!features) {
	      return res;
	    } else if (typeof features === 'string') {
	      features = [features];
	    }

	    var available = [];
	    $.each(res, function(i, r) {
	      if (self.conn.caps.hasFeatureByJid(bid + '/' + r, features)) {
	        available.push(r);
	      }
	    });

	    return available;
	  },

	  /**
	   * Update icon on presence or on caps.
	   *
	   * If no jid is given, all roster will be updated
	   *
	   * @memberOf jsxc.mmstream
	   * @param ev
	   * @param status
	   * @private
	   */
	  _onXmppEvent : function(ev, jid) {

	    var self = jsxc.mmstream;

	    // console.log("MMStream on XMPP event");
	    // console.log(ev, jid);

	    if (jid) {
	      self.gui._updateIcon(jsxc.jidToBid(jid));
	      self.gui._updateVideoLink(jsxc.jidToBid(jid));
	    }

	    else {
	      self.gui._updateAllIcons();
	      self.gui._updateAllVideoLinks();
	    }

	    // preserve handler
	    return true;
	  },

	  /**
	   * Attach listeners on connect
	   * @private
	   */
	  _registerListenersOnAttached : function() {

	    var self = jsxc.mmstream;

	    if (self.conn.caps) {
	      $(document).on('caps.strophe', self._onXmppEvent);
	    }

	    $(document).on('init.window.jsxc', self.gui._initChatWindow);

	    // TODO: to improve
	    $(document).on('presence.jsxc', self._onXmppEvent);
	    $(document).on("add.roster.jsxc", self.gui._onXmppEvent);
	    $(document).on("cloaded.roster.jsxc", self.gui._onXmppEvent);
	    $(document).on("buddyListChanged.jsxc", self.gui._onXmppEvent);

	  },

	  /**
	   * Called when
	   */
	  _onDisconnected : function() {

	    var self = jsxc.mmstream;

	    // remove listeners added when attached
	    $(document).off('caps.strophe', self._onXmppEvent);

	    self.conn.deleteHandler(self.messageHandler);

	    // remove all videos
	    $("#jsxc_videoPanel .jsxc_videoThumbContainer").remove();

	    // stop local stream
	    self.stopLocalStream();

	  },

	};

	$(document).ready(function() {
	  if (jsxc.multimediaStreamSystem && jsxc.multimediaStreamSystem === "multistream") {

	    var self = jsxc.mmstream;

	    $(document).on('attached.jsxc', self.init);
	    $(document).on('disconnected.jsxc', self._onDisconnected);
	    $(document).on('removed.gui.jsxc', self.gui.removeGui);

	  }
	});
	/**
	 * Gui part of the multimedia stream  manager
	 *
	 */
	jsxc.mmstream.gui = {

	  /**
	   * JQuery object that represent the side panel on left
	   */
	  videoPanel : null,

	  /**
	   * Create gui and add it to the main window
	   *
	   * @private
	   */
	  _initGui : function() {

	    var self = jsxc.mmstream.gui;

	    // create GUI
	    self.videoPanel = $(jsxc.gui.template.get('videoPanel'));
	    self.videoPanel.addClass("jsxc_state_hidden");

	    // button for opening
	    self.videoPanel.find("#jsxc_toggleVideoPanel").click(function() {
	      jsxc.mmstream.gui.toggleVideoPanel();
	    });

	    self.videoPanel.find(".jsxc_videoPanelContent").perfectScrollbar();

	    $('body').append(self.videoPanel);

	    // init Chrome extension installation button
	    if (jsxc.gui.menu.ready === true) {
	      self._initChromeExtensionDialog();
	    } else {
	      $(document).one("menu.ready.jsxc", self._initChromeExtensionDialog);
	    }

	  },

	  /**
	   * Init dialog and button for installing screen capture Chrome extension
	   * @private
	   */
	  _initChromeExtensionDialog : function() {

	    // show gui for install Chrome extension
	    var installChromeExt = $("#jsxc_menuConversation .jsxc_screenInstallChromeExtension");

	    if (jsxc.mmstream._isNavigatorChrome() !== true) {
	      installChromeExt.css({"display" : "none"});
	    }

	    else {

	      // check if we connected in HTTPS
	      if (document.location.protocol.indexOf("https") > -1) {

	        installChromeExt.click(function() {

	          jsxc.gui.dialog.open(jsxc.gui.template.get('installChromeExtension'), {
	            'noClose' : true
	          });

	          $("#jsxc_dialog .jsxc_closeInstallChromeExtension").click(function() {
	            jsxc.gui.dialog.close();
	          });

	          $("#jsxc_dialog .jsxc_reloadInstallChromeExtension").click(function() {
	            location.reload();
	          });

	        });

	        jsxc.mmstream._isChromeExtensionInstalled()
	            .then(function() {
	              installChromeExt.css({"display" : "none"});
	            });

	      }

	      // we are not in HTTPS
	      else {

	        var message = "Vous devez vous connecter en HTTPS pour la capture fonctionne.";

	        installChromeExt.click(function() {
	          jsxc.gui.feedback(message);
	        });

	        installChromeExt.after("<div class='jsxc_menuAdvice'>" + message + "</div>");
	      }

	    }

	  },

	  /**
	   * Return true if local video is shown
	   * @returns {*}
	   */
	  isLocalVideoShown : function() {
	    var self = jsxc.mmstream.gui;
	    return self.videoPanel.find(".jsxc_local_video_container").length > 0;
	  },

	  /**
	   * Add a stream to the side panel
	   * @param stream
	   * @param jid
	   * @param title
	   * @private
	   */
	  _showVideoStream : function(stream, fulljid, options) {

	    var self = jsxc.mmstream.gui;

	    // TODO: display name only
	    // var jid = Strophe.getNodeFromJid(fulljid);
	    var jid = fulljid;

	    if (Strophe.getResourceFromJid(fulljid) === null) {
	      throw "JID must be full jid";
	    }

	    // add only if not already present
	    var alreadyHere = false;
	    self.videoPanel.find(".jsxc_videoPanelContent").each(function(index, element) {
	      if ($(element).data("fromjid") === fulljid) {
	        alreadyHere = true;
	        return false;
	      }
	    });
	    if (alreadyHere === true) {
	      return;
	    }

	    var defaultOptions = {

	      /**
	       * Title of video thumb
	       */
	      title : "From " + jid,

	      /**
	       * If true, thumb will be append in first position
	       */
	      prepend : false,

	      /**
	       * If false, no hang up button will be displayed
	       */
	      hangupButton : true,

	      /**
	       *
	       */
	      fullscreenButton : true,

	      /**
	       * Supplementary classes to add to video container
	       */
	      supClasses : "",
	    };

	    options = $.extend(defaultOptions, options);

	    // create container for video and title
	    var videoCtr = $("<div>").addClass('jsxc_videoThumbContainer');
	    videoCtr.data("fromjid", fulljid);

	    if (options.supClasses !== "") {
	      videoCtr.addClass(options.supClasses);
	    }

	    $("<h2>").text(options.title).addClass("jsxc_videoThumb_title").appendTo(videoCtr);

	    // create video element and attach media stream
	    var video = $("<video>").addClass("jsxc_videoThumb").appendTo(videoCtr);
	    jsxc.attachMediaStream(video.get(0), stream);

	    // controls
	    if (options.hangupButton === true) {
	      var hangup = $("<div>").addClass('jsxc_hangUpControl jsxc_videoControl').click(function() {
	        jsxc.mmstream.hangupCall(fulljid);
	      });

	      hangup.appendTo(videoCtr);
	    }

	    if (options.fullscreenButton === true) {

	      var fullscreen = $("<div>").addClass('jsxc_fullscreenControl jsxc_videoControl').click(
	          function() {
	            jsxc.mmstream.gui._showVideoFullscreen(fulljid);
	          });

	      fullscreen.appendTo(videoCtr);
	    }

	    // append video on first position if needed
	    if (options.prepend === true) {
	      self.videoPanel.find(".jsxc_videoPanelContent").prepend(videoCtr);
	    }
	    // append video at end
	    else {
	      self.videoPanel.find(".jsxc_videoPanelContent").append(videoCtr);
	    }

	    self.videoPanel.find(".jsxc_videoPanelContent").perfectScrollbar("update");

	  },

	  /**
	   * Hide video stream with optionnal message
	   * @private
	   */
	  _hideVideoStream : function(fulljid) {

	    var mmstream = jsxc.mmstream;
	    var self = jsxc.mmstream.gui;

	    if (Strophe.getResourceFromJid(fulljid) === null) {
	      throw "JID must be full jid";
	    }

	    // search element to remove
	    self.videoPanel.find(".jsxc_videoThumbContainer").each(function() {

	      var cjid = $(this).data("fromjid");
	      if (cjid === fulljid) {

	        // remove element
	        $(this).remove();

	        // display message
	        var node = Strophe.getNodeFromJid(fulljid);
	        var mess = "Connexion interrompue avec " + node;

	        jsxc.gui.feedback(mess);

	        return false;
	      }

	    });

	    // hide localvideo if necessary
	    if (Object.keys(mmstream.getCurrentVideoSessions()).length < 1) {
	      $("#jsxc_videoPanel .jsxc_videoThumbContainer").remove();
	    }

	  },

	  /**
	   * Show local video
	   * @private
	   */
	  showLocalVideo : function() {

	    var mmstream = jsxc.mmstream;
	    var self = jsxc.mmstream.gui;

	    mmstream._requireLocalStream()
	        .done(function(localStream) {
	          self._showVideoStream(localStream, jsxc.xmpp.conn.jid, {
	            title : "Local video stream",
	            prepend : true,
	            hangupButton : false,
	            fullscreenButton : false,
	            supClasses : "jsxc_local_video_container"
	          });
	        })
	        .fail(function(error) {
	          jsxc.gui.feedback("Erreur lors de l'accès à la caméra et au micro: " + error);
	          jsxc.error("Error while using audio/video", error);
	        });

	  },

	  /**
	   * Add "video" button to a window chat menu when open.
	   *
	   * @private
	   * @memberOf jsxc.mmstream
	   * @param event
	   * @param win jQuery window object
	   */
	  _initChatWindow : function(event, win) {

	    var self = jsxc.mmstream;

	    if (win.hasClass('jsxc_groupchat')) {
	      return;
	    }

	    jsxc.debug('mmstream._initChatWindow');

	    if (!self.conn) {
	      $(document).one('attached.jsxc', function() {
	        self.gui._initChatWindow(null, win);
	      });
	      return;
	    }

	    var div = $('<div>').addClass('jsxc_video');
	    win.find('.jsxc_tools .jsxc_settings').after(div);

	    self.gui._updateIcon(win.data('bid'));
	  },

	  /**
	   *
	   * @private
	   */
	  _updateAllIcons : function() {
	    // TODO
	  },

	  /**
	   * Update all the video links
	   * @private
	   */
	  _updateAllVideoLinks : function() {

	    var self = jsxc.mmstream.gui;

	    $.each(jsxc.storage.getUserItem('buddylist') || [], function(index, item) {
	      self._updateVideoLink(item);
	    });
	  },

	  /**
	   * Add action to video call link.
	   *
	   * Action is determined only by the presence of resource.
	   * If all clients are this kind of JSXC, then no problem will append
	   *
	   *
	   * @param bid
	   * @private
	   */
	  _updateVideoLink : function(bid) {

	    var mmstream = jsxc.mmstream;

	    if (bid === jsxc.jidToBid(mmstream.conn.jid)) {
	      return;
	    }

	    jsxc.debug('Update link', bid);

	    // search available ressource
	    var fulljid = jsxc.getCurrentActiveJidForBid(bid);

	    var bud = jsxc.gui.roster.getItem(bid);
	    var videoLink = bud.find('.jsxc_videocall');

	    // no ressource available
	    if (fulljid !== null) {

	      videoLink.css("text-decoration", "underline");

	      // simple video call
	      videoLink.click(function() {

	        jsxc.gui.feedback("L'appel va bientôt commencer");

	        jsxc.mmstream.startVideoCall(fulljid);
	        return false;
	      });

	    } else {
	      videoLink.css("text-decoration", "line-through");
	      videoLink.off("click");
	    }

	  },

	  /**
	   * Remove all GUI elements
	   */
	  removeGui : function() {
	    $("#jsxc_videoPanel").remove();
	  },

	  /**
	   * Enable or disable "video" icon and assign full jid.
	   *
	   * @memberOf jsxc.mmstream
	   * @param bid CSS conform jid
	   */
	  _updateIcon : function(bid) {

	    jsxc.debug('Update icon', bid);

	    var mmstream = jsxc.mmstream;

	    if (bid === jsxc.jidToBid(mmstream.conn.jid)) {
	      return;
	    }

	    var win = jsxc.gui.window.get(bid);

	    var fulljid = jsxc.getCurrentActiveJidForBid(bid);

	    // get the video icon
	    var el = win.find('.jsxc_video');
	    el.off('click');

	    if (fulljid !== null) {

	      el.click(function() {
	        mmstream.startVideoCall(fulljid);
	      });

	      el.removeClass('jsxc_disabled');
	      el.attr('title', jsxc.t('Start_video_call'));

	      win.find('.jsxc_sendFile').removeClass('jsxc_disabled');
	    }

	    else {
	      el.addClass('jsxc_disabled');

	      el.attr('title', jsxc.t('Video_call_not_possible'));

	      win.find('.jsxc_sendFile').addClass('jsxc_disabled');
	    }

	  },

	  /**
	   * Create and show a new dialog displaying video stream
	   *
	   */
	  _newVideoDialog : function(stream, title) {

	    var self = jsxc.mmstream;

	    title = title || "";

	    // create and append dialog to body
	    var dialog = $("<video>");
	    dialog.appendTo($("body"));

	    self.videoDialogs.push(dialog);

	    // attach stream
	    jsxc.attachMediaStream(dialog.get(0), stream);

	    dialog.dialog({
	      title : title, height : '400', width : 'auto'
	    });

	  },

	  /**
	   * Return true if sidebar is shown
	   */
	  isSidepanelShown : function() {
	    var self = jsxc.mmstream.gui;
	    return self.videoPanel && self.videoPanel.hasClass('jsxc_state_shown');
	  },

	  /**
	   * Open or close video panel
	   *
	   * State can be 'true' or 'false'
	   *
	   */
	  toggleVideoPanel : function(state) {

	    var self = jsxc.mmstream.gui;
	    var panel = self.videoPanel;

	    if (typeof state === "undefined") {
	      state = !panel.hasClass('jsxc_state_shown');
	    }

	    panel.removeClass('jsxc_state_hidden jsxc_state_shown');

	    // show window
	    if (state === true) {
	      panel.addClass('jsxc_state_shown');
	    }

	    // close window
	    else {
	      panel.addClass('jsxc_state_hidden');
	    }

	    $(document).trigger('toggle.videoPanel.jsxc', [state]);

	  },

	  _ringOnIncoming : function() {
	    jsxc.notification.playSound(jsxc.CONST.SOUNDS.CALL, true, true);
	  },

	  _stopRinging : function() {
	    jsxc.notification.stopSound();
	  },

	  /**
	   * Show an "accept / decline" dialog for an incoming call
	   */
	  _showIncomingCallDialog : function(bid) {

	    var self = jsxc.mmstream.gui;

	    var defer = $.Deferred();

	    var dialog = jsxc.gui.dialog.open(jsxc.gui.template.get('incomingCall', bid), {
	      noClose : true
	    });

	    self._ringOnIncoming();

	    dialog.find('.jsxc_accept').click(function() {

	      self._stopRinging();

	      defer.resolve("ACCEPT");

	      jsxc.gui.dialog.close();

	    });

	    dialog.find('.jsxc_reject').click(function() {

	      self._stopRinging();

	      defer.fail("REJECT");

	      jsxc.gui.dialog.close();

	    });

	    return defer.promise();

	  },

	  /**
	   * Show an "accept / decline" dialog for an incoming videoconference
	   */
	  _showIncomingVideoconferenceDialog : function(bid) {

	    var self = jsxc.mmstream.gui;

	    var defer = $.Deferred();

	    var dialog = jsxc.gui.dialog.open(jsxc.gui.template.get('incomingVideoconference', bid), {
	      noClose : true
	    });

	    self._ringOnIncoming();

	    dialog.find('.jsxc_accept').click(function() {

	      self._stopRinging();

	      defer.resolve("ACCEPT");

	      jsxc.gui.dialog.close();

	    });

	    dialog.find('.jsxc_reject').click(function() {

	      self._stopRinging();

	      defer.fail("REJECT");

	      jsxc.gui.dialog.close();

	    });

	    return defer.promise();

	  },

	  /**
	   *
	   *
	   * @param fulljid
	   * @private
	   */
	  _showVideoFullscreen : function(fulljid) {

	    // var self = jsxc.mmstream.gui;

	    if (Strophe.getResourceFromJid(fulljid) === null) {
	      throw "JID must be full jid";
	    }

	    // hide video panel
	    jsxc.mmstream.gui.toggleVideoPanel(false);

	    // show video pop up
	    jsxc.gui.dialog.open(jsxc.gui.template.get('videoStreamDialog'), {
	      'noClose' : true
	    });

	    $("#jsxc_dialog .jsxc_from_jid").text(fulljid);

	    $("#jsxc_dialog .jsxc_hangUpCall").click(function() {
	      jsxc.mmstream.hangupCall(fulljid);
	      jsxc.gui.dialog.close();
	    });

	    $("#jsxc_dialog .jsxc_closeVideoDialog").click(function() {
	      jsxc.gui.dialog.close();
	    });

	    // attach video stream
	    var video = $("#jsxc_dialog video");
	    var session = jsxc.mmstream.getCurrentVideoSessions()[fulljid];

	    if (session && session.stream) {
	      jsxc.attachMediaStream(video.get(0), session.stream);
	      video.get(0).play();
	    }

	    else {
	      $("#jsxc_dialog h3").text("Vidéo indisponible");
	    }

	  }

	};

	/**
	 * Load message object with given uid.
	 * 
	 * @class Message
	 * @memberOf jsxc
	 * @param {string} uid Unified identifier from message object
	 */
	/**
	 * Create new message object.
	 *
	 * @class Message
	 * @memberOf jsxc
	 * @param {object} args New message properties
	 * @param {string} args.bid
	 * @param {direction} args.direction
	 * @param {string} args.msg
	 * @param {boolean} args.encrypted
	 * @param {boolean} args.forwarded
	 * @param {boolean} args.sender
	 * @param {integer} args.stamp
	 * @param {object} args.attachment Attached data
	 * @param {string} args.attachment.name File name
	 * @param {string} args.attachment.size File size
	 * @param {string} args.attachment.type File type
	 * @param {string} args.attachment.data File data
	 */

	jsxc.Message = function() {

	   /** @member {string} */
	   this._uid = null;

	   /** @member {boolean} */
	   this._received = false;

	   /** @member {boolean} */
	   this.encrypted = false;

	   /** @member {boolean} */
	   this.forwarded = false;

	   /** @member {integer} */
	   this.stamp = new Date().getTime();

	   if (typeof arguments[0] === 'string' && arguments[0].length > 0 && arguments.length === 1) {
	      this._uid = arguments[0];

	      this.load(this._uid);
	   } else if (typeof arguments[0] === 'object' && arguments[0] !== null) {
	      $.extend(this, arguments[0]);
	   }

	   if (!this._uid) {
	      this._uid = new Date().getTime() + ':msg';
	   }
	};

	/**
	 * Load message properties.
	 *
	 * @memberof jsxc.Message
	 * @param  {string} uid
	 */
	jsxc.Message.prototype.load = function(uid) {
	   var data = jsxc.storage.getUserItem('msg', uid);

	   if (!data) {
	      jsxc.debug('Could not load message with uid ' + uid);
	   }

	   $.extend(this, data);
	};

	/**
	 * Save message properties and create thumbnail.
	 *
	 * @memberOf jsxc.Message
	 * @return {Message} this object
	 */
	jsxc.Message.prototype.save = function() {
	   var history;

	   if (this.bid) {
	      history = jsxc.storage.getUserItem('history', this.bid) || [];

	      if (history.indexOf(this._uid) < 0) {
	         if (history.length > jsxc.options.get('numberOfMsg')) {
	            jsxc.Message.delete(history.pop());
	         }
	      } else {
	         history = null;
	      }
	   }

	   if (Image && this.attachment && this.attachment.type.match(/^image\//i) && this.attachment.data) {
	      var sHeight, sWidth, sx, sy;
	      var dHeight = 100,
	         dWidth = 100;
	      var canvas = $("<canvas>").get(0);

	      canvas.width = dWidth;
	      canvas.height = dHeight;

	      var ctx = canvas.getContext("2d");
	      var img = new Image();

	      img.src = this.attachment.data;

	      if (img.height > img.width) {
	         sHeight = img.width;
	         sWidth = img.width;
	         sx = 0;
	         sy = (img.height - img.width) / 2;
	      } else {
	         sHeight = img.height;
	         sWidth = img.height;
	         sx = (img.width - img.height) / 2;
	         sy = 0;
	      }

	      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight);

	      this.attachment.thumbnail = canvas.toDataURL();

	      if (this.direction === 'out') {
	         // save storage
	         this.attachment.data = null;
	      }
	   }

	   var data;

	   if (this.attachment && this.attachment.size > jsxc.options.maxStorableSize && this.direction === 'in') {
	      jsxc.debug('Attachment to large to store');

	      data = this.attachment.data;
	      this.attachment.data = null;
	      this.attachment.persistent = false;

	      //@TODO inform user
	   }

	   jsxc.storage.setUserItem('msg', this._uid, this);

	   if (history) {
	      history.unshift(this._uid);

	      jsxc.storage.setUserItem('history', this.bid, history);
	   }

	   if (data && this.attachment) {
	      this.attachment.data = data;
	   }

	   return this;
	};

	/**
	 * Remove object from storage.
	 * 
	 * @memberOf jsxc.Message
	 */
	jsxc.Message.prototype.delete = function() {
	   jsxc.Message.delete(this._uid);
	};

	/**
	 * Returns object as jquery object.
	 *
	 * @memberOf jsxc.Message
	 * @return {jQuery} Representation in DOM
	 */
	jsxc.Message.prototype.getDOM = function() {
	   return jsxc.Message.getDOM(this._uid);
	};

	/**
	 * Mark message as received.
	 * 
	 * @memberOf jsxc.Message
	 */
	jsxc.Message.prototype.received = function() {
	   this._received = true;
	   this.save();

	   this.getDOM().addClass('jsxc_received');
	};

	/**
	 * Returns true if the message was already received.
	 *
	 * @memberOf jsxc.Message
	 * @return {boolean} true means received
	 */
	jsxc.Message.prototype.isReceived = function() {
	   return this._received;
	};

	/**
	 * Remove message with uid.
	 *
	 * @memberOf jsxc.Message
	 * @static
	 * @param  {string} uid message uid
	 */
	jsxc.Message.delete = function(uid) {
	   var data = jsxc.storage.getUserItem('msg', uid);

	   if (data) {
	      jsxc.storage.removeUserItem('msg', uid);

	      if (data.bid) {
	         var history = jsxc.storage.getUserItem('history', data.bid) || [];

	         history = $.grep(history, function(el) {
	            return el !== uid;
	         });

	         jsxc.storage.setUserItem('history', data.bid);
	      }
	   }
	};

	/**
	 * Returns message object as jquery object.
	 *
	 * @memberOf jsxc.Message
	 * @static
	 * @param  {string} uid message uid
	 * @return {jQuery} jQuery representation in DOM
	 */
	jsxc.Message.getDOM = function(uid) {
	   return $('#' + uid.replace(/:/g, '-'));
	};

	/**
	 * Message direction can be incoming, outgoing or system.
	 * 
	 * @typedef {(jsxc.Message.IN|jsxc.Message.OUT|jsxc.Message.SYS)} direction
	 */

	/**
	 * @constant
	 * @type {string}
	 * @default
	 */
	jsxc.Message.IN = 'in';

	/**
	 * @constant
	 * @type {string}
	 * @default
	 */
	jsxc.Message.OUT = 'out';

	/**
	 * @constant
	 * @type {string}
	 * @default
	 */
	jsxc.Message.SYS = 'sys';

	/**
	 * API for manipulating JSXC
	 *
	 */

	jsxc.api = {

	  /**
	   * Availables events can be used for register callbacks
	   */
	  _availableEvents : ['onReconnectDemand', 'onBuddyAdded', 'onBuddyAccepted', "onInit"],

	  /**
	   * Registered callbacks
	   */
	  _callbacks : {},

	  /**
	   * Register callback will be internally called on events. Events can be:
	   * <ul>
	   *   <li>reconnect</li>
	   *   <li>onBuddyAdded</li>
	   * </ul>
	   *
	   * Argument must be an object like this:
	   * {
	   *    "event": function(){},
	   *    "event": function(){},
	   *    "event": function(){},
	   * }
	   *
	   * This method be used before JSXC init
	   *
	   * @param callbacks
	   */
	  registerCallbacks : function(callbacks) {

	    var self = jsxc.api;

	    // check arguments
	    $.each(callbacks, function(event, element) {

	      if (self._availableEvents.indexOf(event) < 0) {
	        throw "Unknown event: " + event + " / Availables: " + self._availableEvents;
	      }

	      if (typeof element !== "function") {
	        throw "Invalid callback, must be a function: " + (typeof element);
	      }

	    });

	    self._callbacks = callbacks;

	  },

	  /**
	   * Add a custom module to JSXC API
	   *
	   * Argument must look like this:
	   *
	   * {
	   *    name: "validJavascriptModuleName",
	   *    module: {....}
	   * }
	   *
	   */
	  registerCustomModule : function(module) {

	    var self = jsxc.api;

	    if (typeof self[module.name] !== "undefined") {
	      throw "Module already exist: " + module.name;
	    }

	    self[module.name] = module.module;

	  },

	  /**
	   * Call all te callbacks bind with an event.
	   *
	   * Return the number of callbacks called
	   *
	   * @param arguments
	   */
	  callback : function(targetEvent, targetArguments) {

	    var self = jsxc.api;

	    var called = 0;

	    // check arguments
	    if (self._availableEvents.indexOf(targetEvent) < 0) {
	      throw "Unknown event: " + targetEvent + " / Availables: " + self._availableEvents;
	    }

	    targetArguments = targetArguments || [];

	    if (targetArguments.constructor !== Array) {
	      throw "Invalid arguments specified (must provide an array): " + targetArguments;
	    }

	    // call registered callbacks
	    $.each(self._callbacks, function(event, callback) {

	      if (event === targetEvent) {

	        try {

	          callback.apply(callback, targetArguments);

	          called++;

	        } catch (e) {
	          console.error("Error in jsxc.api.callback");
	          console.error(e);
	        }

	      }

	    });

	    return called;

	  },

	  /**
	   * Show a toast with message
	   * @param message
	   * @param type
	   * @param timeout
	   */
	  feedback : function(message, type, timeout) {
	    jsxc.gui.feedback(message, type, timeout);
	  },

	  /**
	   * Open chat window bound to the specified jid
	   *
	   * Jid can be a full jid or a bare jid
	   *
	   * @param login
	   */
	  openChatWindow : function(jid) {

	    var self = jsxc.api;
	    var bid = Strophe.getBareJidFromJid(jid);

	    self.checkConnectedOrThrow();

	    // if user isn't in buddylist, create a buddy list entry
	    // with no suscription
	    if (self.getBuddyList().indexOf(jid) < 0) {

	      jsxc.storage.setUserItem('buddy', bid, {
	        jid: jid,
	        name: '',
	        status: 0,
	        sub: 'none',
	        msgstate: 0,
	        transferReq: -1,
	        trust: false,
	        œ: null,
	        res: [],
	        type: 'chat'
	      });
	    }

	    // open chat window
	    jsxc.gui.window.open(bid);

	  },

	  /**
	   * Return the buddy list
	   */
	  getBuddyList : function() {
	    return jsxc.storage.getUserItem('buddylist') || [];
	  },

	  isConnected: function(){
	    return jsxc.xmpp.conn !== null;
	  },

	  /**
	   * Check if we are connected, if not show feedback, open roster and throw exception
	   */
	  checkConnectedOrThrow: function(){

	    var self = jsxc.api;

	    if(self.isConnected() !== true){
	      
	      self.feedback("Vous n'êtes pas connecté au client de messagerie");
	      jsxc.gui.roster.toggle("shown");

	      throw "Not connected to JSXC client";
	    }
	  }

	};
	/**
	 * Etherpad integration
	 * @type {{openpad: jsxc.etherpad.openpad}}
	 */

	jsxc.etherpad = {

	  /**
	   * Return true if Etherpad is enabled
	   * @returns {boolean}
	   */
	  isEtherpadEnabled : function() {
	    var opts = jsxc.options.get("etherpad");
	    return opts.enabled === true;
	  },

	  getEtherpadLinkFor : function(padId) {
	    var opts = jsxc.options.get("etherpad");
	    return opts.ressource + 'p/' + padId +
	        '?showControls=true&showChat=false&showLineNumbers=true&useMonospaceFont=true';
	  },

	  /**
	   * Open a new pad in a window
	   * @param bid
	   */
	  openpad : function(padId) {

	    jsxc.stats.addEvent('jsxc.etherpad.opened');

	    if (jsxc.etherpad.isEtherpadEnabled() === false) {
	      jsxc.warn('Etherpad not enabled');
	      jsxc.gui.feedback("Etherpad n'est pas activé.");
	      return;
	    }

	    // embedable code of pad
	    var embedCode = '<iframe name="embed_readwrite" src="' +
	        jsxc.etherpad.getEtherpadLinkFor(padId) + '" style="width: 100%; height: 100%"></iframe>';        // container for pad
	    var dialogId = "jsxc_pad_" + padId;
	    var dialog = $("<div></div>").attr('id', dialogId);
	    dialog.append(embedCode);

	    // add and show dialog
	    $("body").append(dialog);

	    dialog.dialog({
	      height : 400, width : 600
	    });

	  }

	};
	/* global Favico, emojione*/
	/**
	 * Handle functions for chat window's and buddylist
	 *
	 * @namespace jsxc.gui
	 */
	jsxc.gui = {
	  /** Smilie token to file mapping */
	  emotions : [['O:-) O:)', 'innocent'], ['>:-( >:( &gt;:-( &gt;:(', 'angry'],
	    [':-) :)', 'slight_smile'], [':-D :D', 'grin'], [':-( :(', 'disappointed'], [';-) ;)', 'wink'],
	    [':-P :P', 'stuck_out_tongue'], ['=-O', 'astonished'], [':kiss: :-*', 'kissing_heart'],
	    ['8-) :cool:', 'sunglasses'], [':-X :X', 'zipper_mouth'], [':yes:', 'thumbsup'],
	    [':no:', 'thumbsdown'], [':beer:', 'beer'], [':coffee:', 'coffee'], [':devil:', 'smiling_imp'],
	    [':kiss: :kissing:', 'kissing'], ['@->-- @-&gt;--', 'rose'], [':music:', 'musical_note'],
	    [':love:', 'heart_eyes'], [':heart:', 'heart'], [':brokenheart:', 'broken_heart'],
	    [':zzz:', 'zzz'], [':wait:', 'hand_splayed']],

	  favicon : null,

	  regShortNames : null,

	  emoticonList : {
	    'core' : {
	      ':klaus:' : ['klaus'],
	      ':jabber:' : ['jabber'],
	      ':xmpp:' : ['xmpp'],
	      ':jsxc:' : ['jsxc'],
	      ':owncloud:' : ['owncloud']
	    }, 'emojione' : emojione.emojioneList
	  },

	  /**
	   * Different uri query actions as defined in XEP-0147.
	   *
	   * @namespace jsxc.gui.queryActions
	   */
	  queryActions : {
	    /** xmpp:JID?message[;body=TEXT] */
	    message : function(jid, params) {
	      var win = jsxc.gui.window.open(jsxc.jidToBid(jid));

	      if (params && typeof params.body === 'string') {
	        win.find('.jsxc_textinput').val(params.body);
	      }
	    },

	    /** xmpp:JID?remove */
	    remove : function(jid) {
	      jsxc.gui.showRemoveDialog(jsxc.jidToBid(jid));
	    },

	    /** xmpp:JID?subscribe[;name=NAME] */
	    subscribe : function(jid, params) {
	      jsxc.gui.showContactDialog(jid);

	      if (params && typeof params.name) {
	        $('#jsxc_alias').val(params.name);
	      }
	    },

	    /** xmpp:JID?vcard */
	    vcard : function(jid) {
	      jsxc.gui.showVcard(jid);
	    },

	    /** xmpp:JID?join[;password=TEXT] */
	    join : function(jid, params) {
	      var password = (params && params.password) ? params.password : null;

	      jsxc.muc.showJoinChat(jid, password);
	    }
	  },

	  /**
	   * Creates application skeleton.
	   *
	   * @memberOf jsxc.gui
	   */
	  init : function() {

	    // Prevent duplicate windowList
	    if ($('#jsxc_windowList').length > 0) {
	      return;
	    }

	    jsxc.gui.regShortNames = new RegExp(emojione.regShortNames.source + '|(' +
	        Object.keys(jsxc.gui.emoticonList.core).join('|') + ')', 'gi');

	    $('body').append($(jsxc.gui.template.get('windowList')));

	    $(window).resize(jsxc.gui.updateWindowListSB);
	    $('#jsxc_windowList').resize(jsxc.gui.updateWindowListSB);

	    $('#jsxc_windowListSB .jsxc_scrollLeft').click(function() {
	      jsxc.gui.scrollWindowListBy(-200);
	    });
	    $('#jsxc_windowListSB .jsxc_scrollRight').click(function() {
	      jsxc.gui.scrollWindowListBy(200);
	    });
	    $('#jsxc_windowList').on('wheel', function(ev) {
	      if ($('#jsxc_windowList').data('isOver')) {
	        jsxc.gui.scrollWindowListBy((ev.originalEvent.wheelDelta > 0) ? 200 : -200);
	      }
	    });

	    jsxc.gui.tooltip('#jsxc_windowList');

	    var fo = jsxc.options.get('favicon');
	    if (fo && fo.enable) {
	      jsxc.gui.favicon = new Favico({
	        animation : 'pop', bgColor : fo.bgColor, textColor : fo.textColor
	      });

	      jsxc.gui.favicon.badge(jsxc.storage.getUserItem('unreadMsg') || 0);
	    }

	    if (!jsxc.el_exists('#jsxc_roster')) {
	      jsxc.gui.roster.init();
	    }

	    // prepare regexp for emotions
	    $.each(jsxc.gui.emotions, function(i, val) {
	      // escape characters
	      var reg = val[0].replace(/(\/|\||\*|\.|\+|\?|\^|\$|\(|\)|\[|\]|\{|\})/g, '\\$1');
	      reg = '(' + reg.split(' ').join('|') + ')';
	      jsxc.gui.emotions[i][2] = new RegExp(reg, 'g');
	    });

	    // We need this often, so we creates some template jquery objects
	    jsxc.gui.windowTemplate = $(jsxc.gui.template.get('chatWindow'));
	    jsxc.gui.buddyTemplate = $(jsxc.gui.template.get('rosterBuddy'));
	  },

	  /**
	   * Init tooltip plugin for given jQuery selector.
	   *
	   * @param {String} selector jQuery selector
	   * @memberOf jsxc.gui
	   */
	  tooltip : function(selector) {
	    $(selector).tooltip({
	      show : {
	        delay : 600
	      }, content : function() {
	        return $(this).attr('title').replace(/\n/g, '<br />');
	      }
	    });
	  },

	  /**
	   * Updates Information in roster and chatbar
	   *
	   * @param {String} bid bar jid
	   */
	  update : function(bid) {
	    var data = jsxc.storage.getUserItem('buddy', bid);

	    if (!data) {
	      jsxc.debug('No data for ' + bid);
	      return;
	    }

	    var ri = jsxc.gui.roster.getItem(bid); // roster item from user
	    var we = jsxc.gui.window.get(bid); // window element from user
	    var ue = ri.add(we); // both
	    var spot = $('.jsxc_spot[data-bid="' + bid + '"]');

	    // Attach data to corresponding roster item
	    ri.data(data);

	    // Add online status
	    jsxc.gui.updatePresence(bid, jsxc.CONST.STATUS[data.status]);

	    // Change name and add title
	    ue.find('.jsxc_name:first').add(spot).text(data.name).attr('title', jsxc.t('is_', {
	      status : jsxc.t(jsxc.CONST.STATUS[data.status])
	    }));

	    // if(window.location.protocol === "https:"){
	    //     we.find('.jsxc_transfer').addClass('jsxc_enc').attr('title',
	    // jsxc.t('your_connection_is_encrypted')); we.find('.jsxc_settings
	    // .jsxc_verification').removeClass('jsxc_disabled'); we.find('.jsxc_settings
	    // .jsxc_transfer').text(jsxc.t('close_private')); }  else {
	    // we.find('.jsxc_transfer').removeClass('jsxc_enc jsxc_fin').attr('title',
	    // jsxc.t('your_connection_is_unencrypted')); we.find('.jsxc_settings
	    // .jsxc_verification').addClass('jsxc_disabled'); we.find('.jsxc_settings
	    // .jsxc_transfer').text(jsxc.t('start_private')); }

	    // Update gui according to encryption state
	    switch (data.msgstate) {
	      case 0:
	        we.find('.jsxc_transfer').removeClass('jsxc_enc jsxc_fin').attr('title',
	            jsxc.t('your_connection_is_unencrypted'));
	        we.find('.jsxc_settings .jsxc_verification').addClass('jsxc_disabled');
	        we.find('.jsxc_settings .jsxc_transfer').text(jsxc.t('start_private'));
	        break;
	      case 1:
	        we.find('.jsxc_transfer').addClass('jsxc_enc').attr('title',
	            jsxc.t('your_connection_is_encrypted'));
	        we.find('.jsxc_settings .jsxc_verification').removeClass('jsxc_disabled');
	        we.find('.jsxc_settings .jsxc_transfer').text(jsxc.t('close_private'));
	        break;
	      case 2:
	        we.find('.jsxc_settings .jsxc_verification').addClass('jsxc_disabled');
	        we.find('.jsxc_transfer').removeClass('jsxc_enc').addClass('jsxc_fin').attr('title',
	            jsxc.t('your_buddy_closed_the_private_connection'));
	        we.find('.jsxc_settings .jsxc_transfer').text(jsxc.t('close_private'));
	        break;
	    }

	    // update gui according to verification state
	    if (data.trust) {
	      we.find('.jsxc_transfer').addClass('jsxc_trust').attr('title',
	          jsxc.t('your_buddy_is_verificated'));
	    } else {
	      we.find('.jsxc_transfer').removeClass('jsxc_trust');
	    }

	    // update gui according to subscription state
	    if (data.sub && data.sub !== 'both') {
	      ue.addClass('jsxc_oneway');
	    } else {
	      ue.removeClass('jsxc_oneway');
	    }

	    var info = Strophe.getBareJidFromJid(data.jid) + '\n';
	    info += jsxc.t('Subscription') + ': ' + jsxc.t(data.sub) + '\n';
	    info += jsxc.t('Status') + ': ' + jsxc.t(jsxc.CONST.STATUS[data.status]);

	    ri.find('.jsxc_name').attr('title', info);

	    jsxc.gui.updateAvatar(ri.add(we.find('.jsxc_bar')), data.jid, data.avatar);
	  },

	  /**
	   * Update avatar on all given elements.
	   *
	   * @memberOf jsxc.gui
	   * @param {jQuery} el Elements with subelement .jsxc_avatar
	   * @param {string} jid Jid
	   * @param {string} aid Avatar id (sha1 hash of image)
	   */
	  updateAvatar : function(el, jid, aid) {

	    var setAvatar = function(src) {
	      if (src === 0 || src === '0') {
	        if (typeof jsxc.options.defaultAvatar === 'function') {
	          jsxc.options.defaultAvatar.call(el, jid);
	          return;
	        }
	        jsxc.gui.avatarPlaceholder(el.find('.jsxc_avatar'), jid);
	        return;
	      }

	      el.find('.jsxc_avatar').removeAttr('style');

	      el.find('.jsxc_avatar').css({
	        'background-image' : 'url(' + src + ')', 'text-indent' : '999px'
	      });
	    };

	    if (typeof aid === 'undefined') {
	      setAvatar(0);
	      return;
	    }

	    var avatarSrc = jsxc.storage.getUserItem('avatar', aid);

	    if (avatarSrc !== null) {
	      setAvatar(avatarSrc);
	    } else {
	      var handler_cb = function(stanza) {
	        jsxc.debug('vCard', stanza);

	        var vCard = $(stanza).find("vCard > PHOTO");
	        var src;

	        if (vCard.length === 0) {
	          jsxc.debug('No photo provided');
	          src = '0';
	        } else if (vCard.find('EXTVAL').length > 0) {
	          src = vCard.find('EXTVAL').text();
	        } else {
	          var img = vCard.find('BINVAL').text();
	          var type = vCard.find('TYPE').text();
	          src = 'data:' + type + ';base64,' + img;
	        }

	        // concat chunks
	        src = src.replace(/[\t\r\n\f]/gi, '');

	        jsxc.storage.setUserItem('avatar', aid, src);
	        setAvatar(src);
	      };

	      var error_cb = function(msg) {
	        jsxc.warn('Could not load vcard.', msg);

	        jsxc.storage.setUserItem('avatar', aid, 0);
	        setAvatar(0);
	      };

	      // workaround for https://github.com/strophe/strophejs/issues/172
	      if (Strophe.getBareJidFromJid(jid) === Strophe.getBareJidFromJid(jsxc.xmpp.conn.jid)) {
	        jsxc.xmpp.conn.vcard.get(handler_cb, error_cb);
	      } else {
	        jsxc.xmpp.conn.vcard.get(handler_cb, Strophe.getBareJidFromJid(jid), error_cb);
	      }
	    }
	  },

	  /**
	   * Updates scrollbar handlers.
	   *
	   * @memberOf jsxc.gui
	   */
	  updateWindowListSB : function() {

	    if ($('#jsxc_windowList>ul').width() > $('#jsxc_windowList').width()) {
	      $('#jsxc_windowListSB > div').removeClass('jsxc_disabled');
	    } else {
	      $('#jsxc_windowListSB > div').addClass('jsxc_disabled');
	      $('#jsxc_windowList>ul').css('right', '0px');
	    }
	  },

	  /**
	   * Scroll window list by offset.
	   *
	   * @memberOf jsxc.gui
	   * @param offset
	   */
	  scrollWindowListBy : function(offset) {

	    var scrollWidth = $('#jsxc_windowList>ul').width();
	    var width = $('#jsxc_windowList').width();
	    var el = $('#jsxc_windowList>ul');
	    var right = parseInt(el.css('right')) - offset;
	    var padding = $("#jsxc_windowListSB").width();

	    if (scrollWidth < width) {
	      return;
	    }

	    if (right > 0) {
	      right = 0;
	    }

	    if (right < width - scrollWidth - padding) {
	      right = width - scrollWidth - padding;
	    }

	    el.css('right', right + 'px');
	  },

	  /**
	   * Returns the window element
	   *
	   * @deprecated Use {@link jsxc.gui.window.get} instead.
	   * @param {String} bid
	   * @returns {jquery} jQuery object of the window element
	   */
	  getWindow : function(bid) {

	    jsxc.warn('jsxc.gui.getWindow is deprecated!');

	    return jsxc.gui.window.get(bid);
	  },

	  /**
	   Transform list in menu. Structure must be like that:
	   <container id="idToPass">
	   <ul>
	   <li>Menu elements 1</li>
	   <li>Menu elements 2</li>
	   <li>Menu elements ...</li>
	   </ul>
	   </container>

	   With timeout for closing

	   * @memberof jsxc.gui
	   */
	  toggleList : function(el) {

	    var self = el || $(this);

	    self.disableSelection();

	    self.addClass('jsxc_list');

	    var ul = self.find('ul');
	    var slideUp = null;

	    slideUp = function() {

	      self.removeClass('jsxc_opened');

	      $('body').off('click', null, slideUp);
	    };

	    $(this).click(function() {

	      if (!self.hasClass('jsxc_opened')) {
	        // hide other lists
	        $('body').click();
	        $('body').one('click', slideUp);
	      } else {
	        $('body').off('click', null, slideUp);
	      }

	      window.clearTimeout(ul.data('timer'));

	      self.toggleClass('jsxc_opened');

	      return false;

	    }).mouseleave(function() {
	      ul.data('timer', window.setTimeout(slideUp, 2000));
	    }).mouseenter(function() {
	      window.clearTimeout(ul.data('timer'));
	    });
	  },

	  /**
	   * Creates and show loginbox
	   */
	  showLoginBox : function() {
	    // Set focus to password field
	    $(document).on("complete.dialog.jsxc", function() {
	      $('#jsxc_password').focus();
	    });

	    jsxc.gui.dialog.open(jsxc.gui.template.get('loginBox'));

	    var alert = $('#jsxc_dialog').find('.jsxc_alert');
	    alert.hide();

	    $('#jsxc_dialog').find('form').submit(function(ev) {

	      ev.preventDefault();

	      $(this).find('button[data-jsxc-loading-text]').trigger('btnloading.jsxc');

	      jsxc.options.loginForm.form = $(this);
	      jsxc.options.loginForm.jid = $(this).find('#jsxc_username');
	      jsxc.options.loginForm.pass = $(this).find('#jsxc_password');

	      jsxc.triggeredFromBox = true;
	      jsxc.options.loginForm.triggered = false;

	      jsxc.prepareLogin(function(settings) {
	        if (settings === false) {
	          onAuthFail();
	        } else {
	          $(document).on('authfail.jsxc', onAuthFail);

	          jsxc.xmpp.login();
	        }
	      });
	    });

	    function onAuthFail() {
	      alert.show();
	      jsxc.gui.dialog.resize();

	      $('#jsxc_dialog').find('button').trigger('btnfinished.jsxc');

	      $('#jsxc_dialog').find('input').one('keypress', function() {
	        alert.hide();
	        jsxc.gui.dialog.resize();
	      });
	    }
	  },

	  /**
	   * Creates and show the fingerprint dialog
	   *
	   * @param {String} bid
	   */
	  showFingerprints : function(bid) {
	    jsxc.gui.dialog.open(jsxc.gui.template.get('fingerprintsDialog', bid));
	  },

	  /**
	   * Creates and show the verification dialog
	   *
	   * @param {String} bid
	   */
	  showVerification : function(bid) {

	    // Check if there is a open dialog
	    if ($('#jsxc_dialog').length > 0) {
	      setTimeout(function() {
	        jsxc.gui.showVerification(bid);
	      }, 3000);
	      return;
	    }

	    // verification only possible if the connection is encrypted
	    if (jsxc.storage.getUserItem('buddy', bid).msgstate !== OTR.CONST.MSGSTATE_ENCRYPTED) {
	      jsxc.warn('Connection not encrypted');
	      return;
	    }

	    jsxc.gui.dialog.open(jsxc.gui.template.get('authenticationDialog', bid), {
	      name : 'smp'
	    });

	    // Add handler

	    $('#jsxc_dialog > div:gt(0)').hide();
	    $('#jsxc_dialog > div:eq(0) button').click(function() {

	      $(this).siblings().removeClass('active');
	      $(this).addClass('active');
	      $(this).get(0).blur();

	      $('#jsxc_dialog > div:gt(0)').hide();
	      $('#jsxc_dialog > div:eq(' + ($(this).index() + 1) + ')').show().find('input:first').focus();
	    });

	    // Manual
	    $('#jsxc_dialog > div:eq(1) .jsxc_submit').click(function() {
	      if (jsxc.master) {
	        jsxc.otr.objects[bid].trust = true;
	      }

	      jsxc.storage.updateUserItem('buddy', bid, 'trust', true);

	      jsxc.gui.dialog.close('smp');

	      jsxc.storage.updateUserItem('buddy', bid, 'trust', true);
	      jsxc.gui.window.postMessage({
	        bid : bid, direction : jsxc.Message.SYS, msg : jsxc.t('conversation_is_now_verified')
	      });
	      jsxc.gui.update(bid);
	    });

	    // Question
	    $('#jsxc_dialog > div:eq(2) .jsxc_submit').click(function() {
	      var div = $('#jsxc_dialog > div:eq(2)');
	      var sec = div.find('#jsxc_secret2').val();
	      var quest = div.find('#jsxc_quest').val();

	      if (sec === '' || quest === '') {
	        // Add information for the user which form is missing
	        div.find('input[value=""]').addClass('jsxc_invalid').keyup(function() {
	          if ($(this).val().match(/.*/)) {
	            $(this).removeClass('jsxc_invalid');
	          }
	        });
	        return;
	      }

	      if (jsxc.master) {
	        jsxc.otr.sendSmpReq(bid, sec, quest);
	      } else {
	        jsxc.storage.setUserItem('smp', bid, {
	          sec : sec, quest : quest
	        });
	      }

	      jsxc.gui.dialog.close('smp');

	      jsxc.gui.window.postMessage({
	        bid : bid, direction : jsxc.Message.SYS, msg : jsxc.t('authentication_query_sent')
	      });
	    });

	    // Secret
	    $('#jsxc_dialog > div:eq(3) .jsxc_submit').click(function() {
	      var div = $('#jsxc_dialog > div:eq(3)');
	      var sec = div.find('#jsxc_secret').val();

	      if (sec === '') {
	        // Add information for the user which form is missing
	        div.find('#jsxc_secret').addClass('jsxc_invalid').keyup(function() {
	          if ($(this).val().match(/.*/)) {
	            $(this).removeClass('jsxc_invalid');
	          }
	        });
	        return;
	      }

	      if (jsxc.master) {
	        jsxc.otr.sendSmpReq(bid, sec);
	      } else {
	        jsxc.storage.setUserItem('smp', bid, {
	          sec : sec, quest : null
	        });
	      }

	      jsxc.gui.dialog.close('smp');

	      jsxc.gui.window.postMessage({
	        bid : bid, direction : 'sys', msg : jsxc.t('authentication_query_sent')
	      });
	    });
	  },

	  /**
	   * Create and show approve dialog
	   *
	   * @param {type} from valid jid
	   */
	  showApproveDialog : function(from) {
	    jsxc.gui.dialog.open(jsxc.gui.template.get('approveDialog'), {
	      'noClose' : true
	    });

	    $('#jsxc_dialog .jsxc_their_jid').text(Strophe.getBareJidFromJid(from));

	    $('#jsxc_dialog .jsxc_deny').click(function(ev) {
	      ev.stopPropagation();

	      jsxc.xmpp.resFriendReq(from, false);

	      jsxc.gui.dialog.close();
	    });

	    $('#jsxc_dialog .jsxc_approve').click(function(ev) {
	      ev.stopPropagation();

	      var data = jsxc.storage.getUserItem('buddy', jsxc.jidToBid(from));

	      jsxc.xmpp.resFriendReq(from, true);

	      // If friendship is not mutual show contact dialog
	      if (!data || data.sub === 'from') {
	        jsxc.gui.showContactDialog(from);
	      }
	    });
	  },

	  /**
	   * Create and show join discussion dialog
	   *
	   * @param {type} from valid jid
	   */
	  showJoinConversationDialog : function(roomjid, buddyName) {

	    jsxc.gui.dialog.open(jsxc.gui.template.get('joinConversationDialog'), {
	      'noClose' : true
	    });

	    $('#jsxc_dialog .jsxc_buddyName').text(Strophe.getBareJidFromJid(buddyName));

	    $('#jsxc_dialog .jsxc_deny').click(function(ev) {
	      ev.stopPropagation();

	      jsxc.gui.feedback("Invitation refusée");

	      jsxc.gui.dialog.close();
	    });

	    $('#jsxc_dialog .jsxc_approve').click(function(ev) {
	      ev.stopPropagation();

	      jsxc.gui.dialog.close();

	      // clean up
	      jsxc.gui.window.clear(roomjid);
	      jsxc.storage.setUserItem('member', roomjid, {});

	      // TODO: set title and subject ?
	      jsxc.muc.join(roomjid, jsxc.xmpp.getCurrentNode(), null, null, null, true, true);

	      // open window
	      jsxc.gui.window.open(roomjid);
	    });
	  },

	  /**
	   * Create and show dialog to add a buddy
	   *
	   * @param {string} [username] jabber id
	   */
	  showContactDialog : function(username) {
	    jsxc.gui.dialog.open(jsxc.gui.template.get('contactDialog'));

	    // If we got a friendship request, we would display the username in our
	    // response
	    if (username) {
	      $('#jsxc_username').val(username);
	    }

	    $('#jsxc_username').keyup(function() {
	      if (typeof jsxc.options.getUsers === 'function') {
	        var val = $(this).val();
	        $('#jsxc_userlist').empty();

	        if (val !== '') {
	          jsxc.options.getUsers.call(this, val, function(list) {
	            $.each(list || {}, function(uid, displayname) {
	              var option = $('<option>');
	              option.attr('data-username', uid);
	              option.attr('data-alias', displayname);

	              option.attr('value', uid).appendTo('#jsxc_userlist');

	              if (uid !== displayname) {
	                option.clone().attr('value', displayname).appendTo('#jsxc_userlist');
	              }
	            });
	          });
	        }
	      }
	    });

	    $('#jsxc_username').on('input', function() {
	      var val = $(this).val();
	      var option = $('#jsxc_userlist').find(
	          'option[data-username="' + val + '"], option[data-alias="' + val + '"]');

	      if (option.length > 0) {
	        $('#jsxc_username').val(option.attr('data-username'));
	        $('#jsxc_alias').val(option.attr('data-alias'));
	      }
	    });

	    $('#jsxc_dialog form').submit(function(ev) {
	      ev.preventDefault();

	      var username = $('#jsxc_username').val();
	      var alias = $('#jsxc_alias').val();

	      if (!username.match(/@(.*)$/)) {
	        username += '@' + Strophe.getDomainFromJid(jsxc.storage.getItem('jid'));
	      }

	      // Check if the username is valid
	      if (!username || !username.match(jsxc.CONST.REGEX.JID)) {
	        // Add notification
	        $('#jsxc_username').addClass('jsxc_invalid').keyup(function() {
	          if ($(this).val().match(jsxc.CONST.REGEX.JID)) {
	            $(this).removeClass('jsxc_invalid');
	          }
	        });
	        return false;
	      }
	      jsxc.xmpp.addBuddy(username, alias);

	      jsxc.gui.dialog.close();

	      return false;
	    });
	  },

	  /**
	   * Create and show dialog to remove a buddy
	   *
	   * @param {type} bid
	   * @returns {undefined}
	   */
	  showRemoveDialog : function(bid) {

	    jsxc.gui.dialog.open(jsxc.gui.template.get('removeDialog', bid));

	    var data = jsxc.storage.getUserItem('buddy', bid);

	    $('#jsxc_dialog .jsxc_remove').click(function(ev) {
	      ev.stopPropagation();

	      if (jsxc.master) {
	        jsxc.xmpp.removeBuddy(data.jid);
	      } else {
	        // inform master
	        jsxc.storage.setUserItem('deletebuddy', bid, {
	          jid : data.jid
	        });
	      }

	      jsxc.gui.dialog.close();
	    });
	  },

	  /**
	   * Show a dialog to select a conversation
	   *
	   * @param {type} bid
	   * @returns {undefined}
	   */
	  showConversationSelectionDialog : function() {

	    var defer = $.Deferred();

	    jsxc.gui.dialog.open(jsxc.gui.template.get('conversationSelectionDialog'));

	    jsxc.gui.createConversationList("#jsxc_dialogConversationList");

	    $('#jsxc_dialog .jsxc_confirm').click(function(ev) {
	      ev.stopPropagation();

	      // get selected elements
	      var selItems = $("#jsxc_dialogConversationList .ui-selected");

	      defer.resolve(selItems);

	      jsxc.gui.dialog.close();
	    });

	    $('#jsxc_dialog .jsxc_cancel').click(function(ev) {
	      ev.stopPropagation();

	      defer.reject("user canceled");

	    });

	    return defer.promise();
	  },

	  /**
	   * Create and show a wait dialog
	   *
	   * @param {type} msg message to display to the user
	   * @returns {undefined}
	   */
	  showWaitAlert : function(msg) {
	    jsxc.gui.dialog.open(jsxc.gui.template.get('waitAlert', null, msg), {
	      'noClose' : true
	    });
	  },

	  /**
	   * Create and show a wait dialog
	   *
	   * @param {type} msg message to display to the user
	   * @returns {undefined}
	   */
	  showAlert : function(msg) {
	    jsxc.gui.dialog.open(jsxc.gui.template.get('alert', null, msg));
	  },

	  /**
	   * Create and show a auth fail dialog
	   *
	   * @returns {undefined}
	   */
	  showAuthFail : function() {
	    jsxc.gui.dialog.open(jsxc.gui.template.get('authFailDialog'));

	    if (jsxc.options.loginForm.triggered !== false) {
	      $('#jsxc_dialog .jsxc_cancel').hide();
	    }

	    $('#jsxc_dialog .jsxc_retry').click(function() {
	      jsxc.gui.dialog.close();
	    });

	    $('#jsxc_dialog .jsxc_cancel').click(function() {
	      jsxc.submitLoginForm();
	    });
	  },

	  /**
	   * Create and show a confirm dialog
	   *
	   * @param {String} msg Message
	   * @param {function} confirm
	   * @param {function} dismiss
	   * @returns {undefined}
	   */
	  showConfirmDialog : function(msg, confirm, dismiss) {
	    jsxc.gui.dialog.open(jsxc.gui.template.get('confirmDialog', null, msg), {
	      noClose : true
	    });

	    if (confirm) {
	      $('#jsxc_dialog .jsxc_confirm').click(confirm);
	    }

	    if (dismiss) {
	      $('#jsxc_dialog .jsxc_dismiss').click(dismiss);
	    }
	  },

	  /**
	   * Show about dialog.
	   *
	   * @memberOf jsxc.gui
	   */
	  showAboutDialog : function() {
	    jsxc.gui.dialog.open(jsxc.gui.template.get('aboutDialog'));

	    $('#jsxc_dialog .jsxc_debuglog').click(function() {
	      jsxc.gui.showDebugLog();
	    });
	  },

	  /**
	   * Show debug log.
	   *
	   * @memberOf jsxc.gui
	   */
	  showDebugLog : function() {
	    var userInfo = '<h3>User information</h3>';

	    if (navigator) {
	      var key;
	      for (key in navigator) {
	        if (typeof navigator[key] === 'string') {
	          userInfo += '<b>' + key + ':</b> ' + navigator[key] + '<br />';
	        }
	      }
	    }

	    if ($.fn && $.fn.jquery) {
	      userInfo += '<b>jQuery:</b> ' + $.fn.jquery + '<br />';
	    }

	    if (window.screen) {
	      userInfo += '<b>Height:</b> ' + window.screen.height + '<br />';
	      userInfo += '<b>Width:</b> ' + window.screen.width + '<br />';
	    }

	    userInfo += '<b>jsxc version:</b> ' + jsxc.version + '<br />';

	    jsxc.gui.dialog.open(
	        '<div class="jsxc_log">' + userInfo + '<h3>Log</h3><pre>' + jsxc.escapeHTML(jsxc.log) +
	        '</pre></div>');
	  },

	  /**
	   * Show vCard of user with the given bar jid.
	   *
	   * @memberOf jsxc.gui
	   * @param {String} jid
	   */
	  showVcard : function(jid) {
	    var bid = jsxc.jidToBid(jid);
	    jsxc.gui.dialog.open(jsxc.gui.template.get('vCard', bid));

	    var data = jsxc.storage.getUserItem('buddy', bid);

	    if (data) {
	      // Display resources and corresponding information
	      var i, j, res, identities, identity = null, cap, client;
	      for (i = 0; i < data.res.length; i++) {
	        res = data.res[i];

	        identities = [];
	        cap = jsxc.xmpp.getCapabilitiesByJid(bid + '/' + res);

	        if (cap !== null && cap.identities !== null) {
	          identities = cap.identities;
	        }

	        client = '';
	        for (j = 0; j < identities.length; j++) {
	          identity = identities[j];
	          if (identity.category === 'client') {
	            if (client !== '') {
	              client += ',\n';
	            }

	            client += identity.name + ' (' + identity.type + ')';
	          }
	        }

	        var status = jsxc.storage.getUserItem('res', bid)[res];

	        $('#jsxc_dialog ul.jsxc_vCard').append(
	            '<li class="jsxc_sep"><strong>' + jsxc.t('Resource') + ':</strong> ' + res + '</li>');
	        $('#jsxc_dialog ul.jsxc_vCard').append(
	            '<li><strong>' + jsxc.t('Client') + ':</strong> ' + client + '</li>');
	        $('#jsxc_dialog ul.jsxc_vCard').append(
	            '<li><strong>' + jsxc.t('Status') + ':</strong> ' + jsxc.t(jsxc.CONST.STATUS[status]) +
	            '</li>');
	      }
	    }

	    var printProp = function(el, depth) {
	      var content = '';

	      el.each(function() {
	        var item = $(this);
	        var children = $(this).children();

	        content += '<li>';

	        var prop = jsxc.t(item[0].tagName);

	        if (prop !== ' ') {
	          content += '<strong>' + prop + ':</strong> ';
	        }

	        if (item[0].tagName === 'PHOTO') {

	        } else if (children.length > 0) {
	          content += '<ul>';
	          content += printProp(children, depth + 1);
	          content += '</ul>';
	        } else if (item.text() !== '') {
	          content += jsxc.escapeHTML(item.text());
	        }

	        content += '</li>';

	        if (depth === 0 && $('#jsxc_dialog ul.jsxc_vCard').length > 0) {
	          if ($('#jsxc_dialog ul.jsxc_vCard li.jsxc_sep:first').length > 0) {
	            $('#jsxc_dialog ul.jsxc_vCard li.jsxc_sep:first').before(content);
	          } else {
	            $('#jsxc_dialog ul.jsxc_vCard').append(content);
	          }
	          content = '';
	        }
	      });

	      if (depth > 0) {
	        return content;
	      }
	    };

	    var failedToLoad = function() {
	      if ($('#jsxc_dialog ul.jsxc_vCard').length === 0) {
	        return;
	      }

	      $('#jsxc_dialog p').remove();

	      var content = '<p>';
	      content += jsxc.t('Sorry_your_buddy_doesnt_provide_any_information');
	      content += '</p>';

	      $('#jsxc_dialog').append(content);
	    };

	    jsxc.xmpp.loadVcard(bid, function(stanza) {

	      if ($('#jsxc_dialog ul.jsxc_vCard').length === 0) {
	        return;
	      }

	      $('#jsxc_dialog p').remove();

	      var photo = $(stanza).find("vCard > PHOTO");

	      if (photo.length > 0) {
	        var img = photo.find('BINVAL').text();
	        var type = photo.find('TYPE').text();
	        var src = 'data:' + type + ';base64,' + img;

	        if (photo.find('EXTVAL').length > 0) {
	          src = photo.find('EXTVAL').text();
	        }

	        // concat chunks
	        src = src.replace(/[\t\r\n\f]/gi, '');

	        var img_el = $('<img class="jsxc_vCard" alt="avatar" />');
	        img_el.attr('src', src);

	        $('#jsxc_dialog h3').before(img_el);
	      }

	      if ($(stanza).find('vCard').length === 0 ||
	          ($(stanza).find('vcard > *').length === 1 && photo.length === 1)) {
	        failedToLoad();
	        return;
	      }

	      printProp($(stanza).find('vcard > *'), 0);

	    }, failedToLoad);
	  },

	  /**
	   Open a dialog box with misc settings.

	   */
	  showSettings : function() {

	    jsxc.gui.dialog.open(jsxc.gui.template.get('settings'));

	    if (jsxc.options.get('xmpp').overwrite === 'false' ||
	        jsxc.options.get('xmpp').overwrite === false) {
	      $('.jsxc_fieldsetXmpp').parent().hide();
	    }

	    $('#jsxc_dialog form').each(function() {
	      var self = $(this);

	      self.find('input[type!="submit"]').each(function() {
	        var id = this.id.split("-");
	        var prop = id[0];
	        var key = id[1];
	        var type = this.type;

	        var data = jsxc.options.get(prop);

	        if (data && typeof data[key] !== 'undefined') {
	          if (type === 'checkbox') {
	            if (data[key] !== 'false' && data[key] !== false) {
	              this.checked = 'checked';
	            }
	          } else {
	            $(this).val(data[key]);
	          }
	        }
	      });
	    });

	    $('#jsxc_dialog form').submit(function() {

	      var self = $(this);
	      var data = {};

	      self.find('input[type!="submit"]').each(function() {
	        var id = this.id.split("-");
	        var prop = id[0];
	        var key = id[1];
	        var val;
	        var type = this.type;

	        if (type === 'checkbox') {
	          val = this.checked;
	        } else {
	          val = $(this).val();
	        }

	        if (!data[prop]) {
	          data[prop] = {};
	        }

	        data[prop][key] = val;
	      });

	      $.each(data, function(key, val) {
	        jsxc.options.set(key, val);
	      });

	      var cb = function(success) {
	        if (typeof self.attr('data-onsubmit') === 'string') {
	          jsxc.exec(self.attr('data-onsubmit'), [success]);
	        }

	        setTimeout(function() {
	          if (success) {
	            self.find('button[type="submit"]').switchClass('btn-primary', 'btn-success');
	          } else {
	            self.find('button[type="submit"]').switchClass('btn-primary', 'btn-danger');
	          }
	          setTimeout(function() {
	            self.find('button[type="submit"]').switchClass('btn-danger btn-success', 'btn-primary');
	          }, 2000);
	        }, 200);
	      };

	      jsxc.options.saveSettinsPermanent.call(this, data, cb);

	      return false;
	    });
	  },

	  /**
	   * Show prompt for notification permission.
	   *
	   * @memberOf jsxc.gui
	   */
	  showRequestNotification : function() {

	    jsxc.switchEvents({
	      'notificationready.jsxc' : function() {
	        jsxc.gui.dialog.close();
	        jsxc.notification.init();
	        jsxc.storage.setUserItem('notification', 1);
	      }, 'notificationfailure.jsxc' : function() {
	        jsxc.gui.dialog.close();
	        jsxc.options.notification = false;
	        jsxc.storage.setUserItem('notification', 0);
	      }
	    });

	    jsxc.gui.showConfirmDialog(jsxc.t('Should_we_notify_you_'), function() {
	      jsxc.gui.dialog.open(jsxc.gui.template.get('pleaseAccept'), {
	        noClose : true
	      });

	      jsxc.notification.requestPermission();
	    }, function() {
	      $(document).trigger('notificationfailure.jsxc');
	    });
	  },

	  showUnknownSender : function(bid) {
	    var confirmationText = jsxc.t('You_received_a_message_from_an_unknown_sender_', {
	      sender : bid
	    });
	    jsxc.gui.showConfirmDialog(confirmationText, function() {

	      jsxc.gui.dialog.close();

	      jsxc.storage.saveBuddy(bid, {
	        jid : bid, name : bid, status : 0, sub : 'none', res : []
	      });

	      jsxc.gui.window.open(bid);

	    }, function() {
	      // reset state
	      jsxc.storage.removeUserItem('chat', bid);
	    });
	  },

	  showSelectionDialog : function(header, msg, primary, option, primaryLabel, optionLabel) {
	    var opt;

	    if (arguments.length === 1 && typeof header === 'object' && header !== null) {
	      opt = header;
	    } else {
	      opt = {
	        header : header, msg : msg, primary : {
	          label : primaryLabel, cb : primary
	        }, option : {
	          label : optionLabel, cb : option
	        }
	      };
	    }

	    var dialog = jsxc.gui.dialog.open(jsxc.gui.template.get('selectionDialog'), {
	      noClose : true
	    });

	    if (opt.header) {
	      dialog.find('h3').text(opt.header);
	    } else {
	      dialog.find('h3').hide();
	    }

	    if (opt.msg) {
	      dialog.find('p').text(opt.msg);
	    } else {
	      dialog.find('p').hide();
	    }

	    if (opt.primary && opt.primary.label) {
	      dialog.find('.btn-primary').text(opt.primary.label);
	    }

	    if (opt.primary && opt.option.label) {
	      dialog.find('.btn-default').text(opt.option.label);
	    }

	    if (opt.primary && opt.primary.cb) {
	      dialog.find('.btn-primary').click(opt.primary.cb);
	    }

	    if (opt.primary && opt.option.cb) {
	      dialog.find('.btn-primary').click(opt.option.cb);
	    }
	  },

	  /**
	   * Change own presence to pres.
	   *
	   * @memberOf jsxc.gui
	   * @param pres {CONST.STATUS} New presence state
	   * @param external {boolean} True if triggered from other tab.
	   */
	  changePresence : function(pres, external) {

	    if (external !== true) {
	      jsxc.storage.setUserItem('presence', pres);
	    }

	    if (jsxc.master) {
	      jsxc.xmpp.sendPres();
	    }

	    $('#jsxc_presence > span').text($('#jsxc_presence .jsxc_inner ul .jsxc_' + pres).text());

	    jsxc.gui.updatePresence('own', pres);
	  },

	  /**
	   * Update all presence objects for given user.
	   *
	   * @memberOf jsxc.gui
	   * @param bid bar jid of user.
	   * @param {CONST.STATUS} pres New presence state.
	   */
	  updatePresence : function(bid, pres) {

	    if (bid === 'own') {
	      if (pres === 'dnd') {
	        $('#jsxc_menu .jsxc_muteNotification').addClass('jsxc_disabled');
	        jsxc.notification.muteSound(true);
	      } else {
	        $('#jsxc_menu .jsxc_muteNotification').removeClass('jsxc_disabled');

	        if (!jsxc.options.get('muteNotification')) {
	          jsxc.notification.unmuteSound(true);
	        }
	      }
	    }

	    $('[data-bid="' + bid + '"]').each(function() {
	      var el = $(this);

	      el.attr('data-status', pres);

	      if (el.find('.jsxc_avatar').length > 0) {
	        el = el.find('.jsxc_avatar');
	      }

	      el.removeClass('jsxc_' + jsxc.CONST.STATUS.join(' jsxc_')).addClass('jsxc_' + pres);
	    });
	  },

	  /**
	   * Switch read state to UNread and increase counter.
	   *
	   * @memberOf jsxc.gui
	   * @param bid
	   */
	  unreadMsg : function(bid) {
	    var winData = jsxc.storage.getUserItem('window', bid) || {};
	    var count = (winData && winData.unread) || 0;
	    count = (count === true) ? 1 : count + 1; //unread was boolean (<2.1.0)

	    // update user counter
	    winData.unread = count;
	    jsxc.storage.setUserItem('window', bid, winData);

	    // update counter of total unread messages
	    var total = jsxc.storage.getUserItem('unreadMsg') || 0;
	    total++;
	    jsxc.storage.setUserItem('unreadMsg', total);

	    if (jsxc.gui.favicon) {
	      jsxc.gui.favicon.badge(total);
	    }

	    jsxc.gui._unreadMsg(bid, count);
	  },

	  /**
	   * Switch read state to UNread.
	   *
	   * @memberOf jsxc.gui
	   * @param bid
	   * @param count
	   */
	  _unreadMsg : function(bid, count) {
	    var win = jsxc.gui.window.get(bid);

	    if (typeof count !== 'number') {
	      // get counter after page reload
	      var winData = jsxc.storage.getUserItem('window', bid);
	      count = (winData && winData.unread) || 1;
	      count = (count === true) ? 1 : count; //unread was boolean (<2.1.0)
	    }

	    var el = jsxc.gui.roster.getItem(bid).add(win);

	    el.addClass('jsxc_unreadMsg');
	    el.find('.jsxc_unread').text(count);
	  },

	  /**
	   * Switch read state to read.
	   *
	   * @memberOf jsxc.gui
	   * @param bid
	   */
	  readMsg : function(bid) {
	    var win = jsxc.gui.window.get(bid);
	    var winData = jsxc.storage.getUserItem('window', bid);
	    var count = (winData && winData.unread) || 0;
	    count = (count === true) ? 0 : count; //unread was boolean (<2.1.0)

	    var el = jsxc.gui.roster.getItem(bid).add(win);
	    el.removeClass('jsxc_unreadMsg');
	    el.find('.jsxc_unread').text(0);

	    // update counters if not called from other tab
	    if (count > 0) {
	      // update counter of total unread messages
	      var total = jsxc.storage.getUserItem('unreadMsg') || 0;
	      total -= count;
	      jsxc.storage.setUserItem('unreadMsg', total);

	      if (jsxc.gui.favicon) {
	        jsxc.gui.favicon.badge(total);
	      }

	      jsxc.storage.updateUserItem('window', bid, 'unread', 0);
	    }
	  },

	  /**
	   * This function searches for URI scheme according to XEP-0147.
	   *
	   * @memberOf jsxc.gui
	   * @param container In which element should we search?
	   */
	  detectUriScheme : function(container) {
	    container = (container) ? $(container) : $('body');

	    container.find("a[href^='xmpp:']").each(function() {

	      var element = $(this);
	      var href = element.attr('href').replace(/^xmpp:/, '');
	      var jid = href.split('?')[0];
	      var action, params = {};

	      if (href.indexOf('?') < 0) {
	        action = 'message';
	      } else {
	        var pairs = href.substring(href.indexOf('?') + 1).split(';');
	        action = pairs[0];

	        var i, key, value;
	        for (i = 1; i < pairs.length; i++) {
	          key = pairs[i].split('=')[0];
	          value =
	              (pairs[i].indexOf('=') > 0) ? pairs[i].substring(pairs[i].indexOf('=') + 1) : null;

	          params[decodeURIComponent(key)] = decodeURIComponent(value);
	        }
	      }

	      if (typeof jsxc.gui.queryActions[action] === 'function') {
	        element.addClass('jsxc_uriScheme jsxc_uriScheme_' + action);

	        element.off('click').click(function(ev) {
	          ev.stopPropagation();

	          jsxc.gui.queryActions[action].call(jsxc, jid, params);

	          return false;
	        });
	      }
	    });
	  },

	  detectEmail : function(container) {
	    container = (container) ? $(container) : $('body');

	    container.find('a[href^="mailto:"],a[href^="xmpp:"]').each(function() {
	      var spot = $("<span>X</span>").addClass("jsxc_spot");
	      var href = $(this).attr("href").replace(/^ *(mailto|xmpp):/, "").trim();

	      if (href !== '' && href !== Strophe.getBareJidFromJid(jsxc.storage.getItem("jid"))) {
	        var bid = jsxc.jidToBid(href);
	        var self = $(this);
	        var s = self.prev();

	        if (!s.hasClass('jsxc_spot')) {
	          s = spot.clone().attr('data-bid', bid);

	          self.before(s);
	        }

	        s.off('click');

	        if (jsxc.storage.getUserItem('buddy', bid)) {
	          jsxc.gui.update(bid);
	          s.click(function() {
	            jsxc.gui.window.open(bid);

	            return false;
	          });
	        } else {
	          s.click(function() {
	            jsxc.gui.showContactDialog(href);

	            return false;
	          });
	        }
	      }
	    });
	  },

	  avatarPlaceholder : function(el, seed, text) {
	    text = text || seed;

	    var options = jsxc.options.get('avatarplaceholder') || {};
	    var hash = jsxc.hashStr(seed);

	    var hue = Math.abs(hash) % 360;
	    var saturation = options.saturation || 90;
	    var lightness = options.lightness || 65;

	    el.css({
	      'background-color' : 'hsl(' + hue + ', ' + saturation + '%, ' + lightness + '%)',
	      'color' : '#fff',
	      'font-weight' : 'bold',
	      'text-align' : 'center',
	      'line-height' : el.height() + 'px',
	      'font-size' : el.height() * 0.6 + 'px'
	    });

	    if (typeof text === 'string' && text.length > 0) {
	      el.text(text[0].toUpperCase());
	    }
	  },

	  /**
	   * Replace shortname emoticons with images.
	   *
	   * @param  {string} str text with emoticons as shortname
	   * @return {string} text with emoticons as images
	   */
	  shortnameToImage : function(str) {
	    str = str.replace(jsxc.gui.regShortNames, function(shortname) {
	      if (typeof shortname === 'undefined' || shortname === '' ||
	          (!(shortname in jsxc.gui.emoticonList.emojione) &&
	          !(shortname in jsxc.gui.emoticonList.core))) {
	        return shortname;
	      }

	      var src, filename;

	      if (jsxc.gui.emoticonList.core[shortname]) {
	        filename =
	            jsxc.gui.emoticonList.core[shortname][jsxc.gui.emoticonList.core[shortname].length -
	            1].replace(/^:([^:]+):$/, '$1');
	        src = jsxc.options.root + '/img/emotions/' + filename + '.svg';
	      } else if (jsxc.gui.emoticonList.emojione[shortname]) {
	        filename =
	            jsxc.gui.emoticonList.emojione[shortname][jsxc.gui.emoticonList.emojione[shortname].length -
	            1];
	        src = jsxc.options.root + '/lib/emojione/assets/svg/' + filename + '.svg';
	      }

	      var div = $('<div>');

	      div.addClass('jsxc_emoticon');
	      div.css('background-image', 'url(' + src + ')');
	      div.attr('title', shortname);

	      return div.prop('outerHTML');
	    });

	    return str;
	  }
	};

	/**
	 * Handle functions related to the gui of the roster
	 *
	 * @namespace jsxc.gui.roster
	 */
	jsxc.gui.roster = {

	  /** True if roster is initialised */
	  ready : false,

	  /** True if all items are loaded */
	  loaded : false,

	  /**
	   * Init the roster skeleton
	   *
	   * @memberOf jsxc.gui.roster
	   * @returns {undefined}
	   */
	  init : function() {

	    // adding roster skeleton to body, or other choosen element
	    $(jsxc.options.rosterAppend + ':first').append($(jsxc.gui.template.get('roster')));

	    // display or hide offline buddies
	    if (jsxc.options.get('hideOffline')) {
	      $('#jsxc_menu .jsxc_hideOffline').text(jsxc.t('Show_offline'));
	      $('#jsxc_buddylist').addClass('jsxc_hideOffline');
	    }

	    // mute sounds
	    if (jsxc.options.get('muteNotification')) {
	      jsxc.notification.muteSound();
	    }

	    // hide show roster
	    $('#jsxc_toggleRoster').click(function() {
	      jsxc.gui.roster.toggle();
	    });

	    $('#jsxc_buddylist').slimScroll({
	      distance : '3px',
	      height : ($('#jsxc_roster').height() - 31) + 'px',
	      width : $('#jsxc_buddylist').width() + 'px',
	      color : '#fff',
	      opacity : '0.5'
	    });

	    // initialize main menu
	    jsxc.gui.menu.init();

	    var rosterState = jsxc.storage.getUserItem('roster') ||
	        (jsxc.options.get('loginForm').startMinimized ? 'hidden' : 'shown');

	    $('#jsxc_roster').addClass('jsxc_state_' + rosterState);
	    $('#jsxc_windowList').addClass('jsxc_roster_' + rosterState);

	    var pres = jsxc.storage.getUserItem('presence') || 'online';
	    $('#jsxc_presence > span').text($('#jsxc_presence .jsxc_' + pres).text());
	    jsxc.gui.updatePresence('own', pres);

	    jsxc.gui.tooltip('#jsxc_roster');

	    jsxc.notice.load();

	    jsxc.gui.roster.ready = true;

	    $(document).trigger('ready.roster.jsxc');

	  },

	  /**
	   * Create roster item and add it to the roster
	   *
	   * @param {String} bid bar jid
	   */
	  add : function(bid) {

	    var data = jsxc.storage.getUserItem('buddy', bid);
	    var bud = jsxc.gui.buddyTemplate.clone().attr('data-bid', bid).attr('data-type',
	        data.type || 'chat');

	    jsxc.gui.roster.insert(bid, bud);

	    bud.click(function() {
	      jsxc.gui.window.open(bid);
	    });

	    bud.find('.jsxc_msg').click(function() {
	      jsxc.gui.window.open(bid);

	      return false;
	    });

	    bud.find('.jsxc_rename').click(function() {
	      jsxc.gui.roster.rename(bid);
	      return false;
	    });

	    if (data.type !== 'groupchat') {
	      bud.find('.jsxc_delete').click(function() {
	        jsxc.gui.showRemoveDialog(bid);
	        return false;
	      });
	    }

	    var expandClick = function() {
	      bud.trigger('extra.jsxc');

	      $('body').click();

	      if (!bud.find('.jsxc_menu').hasClass('jsxc_open')) {
	        bud.find('.jsxc_menu').addClass('jsxc_open');

	        $('body').one('click', function() {
	          bud.find('.jsxc_menu').removeClass('jsxc_open');
	        });
	      }

	      return false;
	    };

	    bud.find('.jsxc_more').click(expandClick);

	    bud.find('.jsxc_vcard').click(function() {
	      jsxc.gui.showVcard(data.jid);

	      return false;
	    });

	    jsxc.gui.update(bid);

	    // update scrollbar
	    $('#jsxc_buddylist').slimScroll({
	      scrollTo : '0px'
	    });

	    var history = jsxc.storage.getUserItem('history', bid) || [];
	    var i = 0;
	    while (history.length > i) {
	      var message = new jsxc.Message(history[i]);
	      if (message.direction !== jsxc.Message.SYS) {
	        $('[data-bid="' + bid + '"]').find('.jsxc_lastmsg .jsxc_text').html(message.msg);
	        break;
	      }
	      i++;
	    }

	    $(document).trigger('add.roster.jsxc', [bid, data, bud]);
	  },

	  getItem : function(bid) {
	    return $("#jsxc_buddylist > li[data-bid='" + bid + "']");
	  },

	  /**
	   * Insert roster item. First order: online > away > offline. Second order:
	   * alphabetical of the name
	   *
	   * @param {type} bid
	   * @param {jquery} li roster item which should be insert
	   * @returns {undefined}
	   */
	  insert : function(bid, li) {

	    var data = jsxc.storage.getUserItem('buddy', bid);
	    var listElements = $('#jsxc_buddylist > li');
	    var insert = false;

	    // Insert buddy with no mutual friendship to the end
	    var status = (data.sub === 'both') ? data.status : -1;

	    listElements.each(function() {

	      var thisStatus = ($(this).data('sub') === 'both') ? $(this).data('status') : -1;

	      if (($(this).data('name').toLowerCase() > data.name.toLowerCase() && thisStatus === status) ||
	          thisStatus < status) {

	        $(this).before(li);
	        insert = true;

	        return false;
	      }
	    });

	    if (!insert) {
	      li.appendTo('#jsxc_buddylist');
	    }
	  },

	  /**
	   * Initiate reorder of roster item
	   *
	   * @param {type} bid
	   * @returns {undefined}
	   */
	  reorder : function(bid) {
	    jsxc.gui.roster.insert(bid, jsxc.gui.roster.remove(bid));
	  },

	  /**
	   * Removes buddy from roster
	   *
	   * @param {String} bid bar jid
	   * @return {JQueryObject} Roster list element
	   */
	  remove : function(bid) {
	    return jsxc.gui.roster.getItem(bid).detach();
	  },

	  /**
	   * Removes buddy from roster and clean up
	   *
	   * @param {String} bid bar compatible jid
	   */
	  purge : function(bid) {
	    if (jsxc.master) {
	      jsxc.storage.removeUserItem('buddy', bid);
	      jsxc.storage.removeUserItem('otr', bid);
	      jsxc.storage.removeUserItem('otr_version_' + bid);
	      jsxc.storage.removeUserItem('chat', bid);
	      jsxc.storage.removeUserItem('window', bid);
	      jsxc.storage.removeUserElement('buddylist', bid);
	      jsxc.storage.removeUserElement('windowlist', bid);
	    }

	    jsxc.gui.window._close(bid);
	    jsxc.gui.roster.remove(bid);
	  },

	  /**
	   * Create input element for rename action
	   *
	   * @param {type} bid
	   * @returns {undefined}
	   */
	  rename : function(bid) {
	    var name = jsxc.gui.roster.getItem(bid).find('.jsxc_name');
	    var options = jsxc.gui.roster.getItem(bid).find('.jsxc_lastmsg, .jsxc_more');
	    var input = $('<input type="text" name="name"/>');

	    // hide more menu
	    $('body').click();

	    options.hide();
	    name = name.replaceWith(input);

	    input.val(name.text());
	    input.keypress(function(ev) {
	      if (ev.which !== 13) {
	        return;
	      }

	      options.css('display', '');
	      input.replaceWith(name);
	      jsxc.gui.roster._rename(bid, $(this).val());

	      $('html').off('click');
	    });

	    // Disable html click event, if click on input
	    input.click(function() {
	      return false;
	    });

	    $('html').one('click', function() {
	      options.css('display', '');
	      input.replaceWith(name);
	      jsxc.gui.roster._rename(bid, input.val());
	    });
	  },

	  /**
	   * Rename buddy
	   *
	   * @param {type} bid
	   * @param {type} newname new name of buddy
	   * @returns {undefined}
	   */
	  _rename : function(bid, newname) {
	    if (jsxc.master) {
	      var d = jsxc.storage.getUserItem('buddy', bid) || {};

	      if (d.type === 'chat') {
	        var iq = $iq({
	          type : 'set'
	        }).c('query', {
	          xmlns : 'jabber:iq:roster'
	        }).c('item', {
	          jid : Strophe.getBareJidFromJid(d.jid), name : newname
	        });
	        jsxc.xmpp.conn.sendIQ(iq);
	      } else if (d.type === 'groupchat') {
	        jsxc.xmpp.bookmarks.add(bid, newname, d.nickname, d.autojoin);
	      }
	    }

	    jsxc.storage.updateUserItem('buddy', bid, 'name', newname);
	    jsxc.gui.update(bid);
	  },

	  /**
	   * Toogle complete roster
	   *
	   * @param {string} state Toggle to state
	   */
	  toggle : function(state) {

	    jsxc.stats.addEvent('jsxc.toggleroster.' + state || 'toggle');

	    var duration;

	    var roster = $('#jsxc_roster');
	    var wl = $('#jsxc_windowList');

	    if (!state) {
	      state = (jsxc.storage.getUserItem('roster') === jsxc.CONST.HIDDEN) ? jsxc.CONST.SHOWN :
	          jsxc.CONST.HIDDEN;
	    }

	    if (state === 'shown' && jsxc.isExtraSmallDevice()) {
	      jsxc.gui.window.hide();
	    }

	    jsxc.storage.setUserItem('roster', state);

	    roster.removeClass('jsxc_state_hidden jsxc_state_shown').addClass('jsxc_state_' + state);
	    wl.removeClass('jsxc_roster_hidden jsxc_roster_shown').addClass('jsxc_roster_' + state);

	    duration = parseFloat(roster.css('transitionDuration') || 0) * 1000;

	    setTimeout(function() {
	      jsxc.gui.updateWindowListSB();
	    }, duration);

	    $(document).trigger('toggle.roster.jsxc', [state, duration]);

	    return duration;
	  },

	  /**
	   * Shows a text with link to a login box that no connection exists.
	   */
	  noConnection : function() {

	    $('#jsxc_roster').addClass('jsxc_noConnection');

	    $('#jsxc_buddylist').empty();

	    $('#jsxc_roster').find(".jsxc_rosterIsEmptyMessage").remove();

	    $('#jsxc_roster').append($('<p>' + jsxc.t('no_connection') + '</p>').append(
	        ' <a>' + jsxc.t('relogin') + '</a>').click(function() {

	      // show login box only if there is no reconnection callback

	      var called = jsxc.api.callback("onReconnectDemand");
	      if (called < 1) {
	        jsxc.gui.showLoginBox();
	      }

	    }));
	  },

	  /**
	   * Shows a text with link to add a new buddy.
	   *
	   * @memberOf jsxc.gui.roster
	   */
	  empty : function() {
	    var text = $(
	        '<p class="jsxc_rosterIsEmptyMessage">' + jsxc.t('Your_roster_is_empty_add_') + '</p>');
	    var link = text.find('a');

	    link.click(function() {
	      //jsxc.gui.showContactDialog();
	      jsxc.gui.menu.openSideMenu();
	    });
	    text.append(link);
	    text.append('.');

	    if ($('#jsxc_roster').find(".jsxc_rosterIsEmptyMessage").length < 1) {
	      $('#jsxc_roster').prepend(text);
	    }

	  }
	};

	/**
	 * Wrapper for dialog
	 *
	 * @namespace jsxc.gui.dialog
	 */
	jsxc.gui.dialog = {
	  /**
	   * Open a Dialog.
	   *
	   * @memberOf jsxc.gui.dialog
	   * @param {String} data Data of the dialog
	   * @param {Object} [o] Options for the dialog
	   * @param {Boolean} [o.noClose] If true, hide all default close options
	   * @returns {jQuery} Dialog object
	   */
	  open : function(data, o) {

	    var opt = $.extend({
	      name : ''
	    }, o);

	    $.magnificPopup.open({
	      items : {
	        src : '<div data-name="' + opt.name + '" id="jsxc_dialog">' + data + '</div>'
	      }, type : 'inline', modal : opt.noClose, callbacks : {
	        beforeClose : function() {
	          $(document).trigger('cleanup.dialog.jsxc');
	        }, afterClose : function() {
	          $(document).trigger('close.dialog.jsxc');
	        }, open : function() {
	          $('#jsxc_dialog .jsxc_close').click(function(ev) {
	            ev.preventDefault();

	            jsxc.gui.dialog.close();
	          });

	          $('#jsxc_dialog form').each(function() {
	            var form = $(this);

	            form.find('button[data-jsxc-loading-text]').each(function() {
	              var btn = $(this);

	              btn.on('btnloading.jsxc', function() {
	                if (!btn.prop('disabled')) {
	                  btn.prop('disabled', true);

	                  btn.data('jsxc_value', btn.text());

	                  btn.text(btn.attr('data-jsxc-loading-text'));
	                }
	              });

	              btn.on('btnfinished.jsxc', function() {
	                if (btn.prop('disabled')) {
	                  btn.prop('disabled', false);

	                  btn.text(btn.data('jsxc_value'));
	                }
	              });
	            });
	          });

	          jsxc.gui.dialog.resize();

	          $(document).trigger('complete.dialog.jsxc');
	        }
	      }
	    });

	    return $('#jsxc_dialog');
	  },

	  /**
	   * If no name is provided every dialog will be closed,
	   * otherwise only dialog with given name is closed.
	   *
	   * @param {string} [name] Close only dialog with the given name
	   */
	  close : function(name) {
	    jsxc.debug('close dialog');

	    if (typeof name === 'string' && name.length > 0 &&
	        !jsxc.el_exists('#jsxc_dialog[data-name=' + name + ']')) {
	      return;
	    }

	    $.magnificPopup.close();
	  },

	  /**
	   * Resizes current dialog.
	   *
	   * @param {Object} options e.g. width and height
	   */
	  resize : function() {

	  }
	};

	/**
	 * Handle functions related to the gui of the window
	 *
	 * @namespace jsxc.gui.window
	 */
	jsxc.gui.window = {

	  /**
	   * Interval between composing chat state sends
	   */
	  sendComposingIntervalMs : 900, /**
	   *
	   */
	  hideComposingNotifDelay : 3000,

	  /**
	   * Show a composing presence from jid specified in argument. JID can be a room jid or a person jid
	   * @param from
	   */
	  showComposingPresence : function(from, type) {

	    var bid = Strophe.getBareJidFromJid(from);
	    var user = type === "chat" ? Strophe.getNodeFromJid(from) : Strophe.getResourceFromJid(from);

	    // iterate window list
	    $('#jsxc_windowList .jsxc_windowItem').each(function() {

	      // the window element, where are stored informations
	      var self = $(this);

	      var winBid = self.data("bid");

	      // check conversation
	      if (winBid === bid) {

	        // add user in array if necessary
	        var usersComposing = self.data("usersComposing") || [];
	        if (usersComposing.indexOf(user) === -1) {
	          usersComposing.push(user);
	          self.data("usersComposing", usersComposing);
	        }

	        var textarea = self.find(".jsxc_textarea");
	        var composingNotif = textarea.find(".jsxc_userComposing");

	        // add notification if necessary
	        if (composingNotif.length < 1) {
	          textarea.append("<div class='jsxc_userComposing jsxc_chatmessage jsxc_sys'></div>");
	          composingNotif = textarea.find(".jsxc_userComposing");
	        }

	        // change text
	        var msg = usersComposing.length > 1 ? " sont en train d'écrire ..." :
	            " est en train d'écrire ...";
	        composingNotif.html(usersComposing.join(", ") + msg);

	        // scroll to bottom
	        jsxc.gui.window.scrollDown(winBid);

	        // hide notification after delay
	        if ($(this).data("composingTimeout")) {
	          clearTimeout($(this).data("composingTimeout"));
	        }

	        $(this).data("composingTimeout",

	            setTimeout(function() {

	              textarea.find(".jsxc_userComposing").remove();

	              // empty user list
	              self.data("usersComposing", []);

	            }, jsxc.gui.window.hideComposingNotifDelay));

	        // show only one presence
	        return false;
	      }

	    });
	  },

	  /**
	   * Init a window skeleton
	   *
	   * @memberOf jsxc.gui.window
	   * @param {String} bid
	   * @returns {jQuery} Window object
	   */
	  init : function(bid) {

	    if (jsxc.gui.window.get(bid).length > 0) {
	      return jsxc.gui.window.get(bid);
	    }

	    var win = jsxc.gui.windowTemplate.clone().attr('data-bid', bid).appendTo(
	        '#jsxc_windowList > ul');
	    var data = jsxc.storage.getUserItem('buddy', bid);

	    // Attach jid to window
	    win.data('jid', data.jid);

	    // Add handler

	    // @TODO generalize this. Duplicate of jsxc.roster.add
	    var expandClick = function() {
	      win.trigger('extra.jsxc');

	      $('body').click();

	      if (!win.find('.jsxc_menu').hasClass('jsxc_open')) {
	        win.find('.jsxc_menu').addClass('jsxc_open');

	        $('body').one('click', function() {
	          win.find('.jsxc_menu').removeClass('jsxc_open');
	        });
	      }

	      return false;
	    };

	    win.find('.jsxc_more').click(expandClick);

	    // open a pad
	    win.find(".jsxc_openpad").click(function() {

	      var padId = bid.substr(0, 26).replace(/[^a-z0-9]+/gi, "") + "_" +
	          jsxc.sha1.hash(bid).substr(0, 22);

	      padId = padId.toLocaleLowerCase();

	      console.log(padId);

	      jsxc.etherpad.openpad(padId);
	    });

	    win.find('.jsxc_verification').click(function() {
	      jsxc.gui.showVerification(bid);
	    });

	    win.find('.jsxc_fingerprints').click(function() {
	      jsxc.gui.showFingerprints(bid);
	    });

	    win.find('.jsxc_transfer').click(function() {
	      jsxc.otr.toggleTransfer(bid);
	    });

	    win.find('.jsxc_bar').click(function() {
	      jsxc.gui.window.toggle(bid);
	    });

	    win.find('.jsxc_close').click(function() {
	      jsxc.gui.window.close(bid);
	    });

	    win.find('.jsxc_clear').click(function() {
	      jsxc.gui.window.clear(bid);
	    });

	    win.find('.jsxc_sendFile').click(function() {
	      $('body').click();

	      jsxc.gui.window.sendFile(bid);
	    });

	    win.find('.jsxc_tools').click(function() {
	      return false;
	    });

	    // last composing state sent time is stored here
	    win.data('lastComposingStateSent', -1);

	    win.find('.jsxc_textinput').keyup(function(ev) {
	      var body = $(this).val();

	      if (ev.which === 13) {
	        body = '';
	      }

	      jsxc.storage.updateUserItem('window', bid, 'text', body);

	      if (ev.which === 27) {
	        jsxc.gui.window.close(bid);
	      }

	      // send composing presence
	      if (jsxc.xmpp.conn) {

	        var now = new Date().getTime();
	        var last = win.data('lastComposingStateSent');

	        // send only every 'n' ms interval
	        if (last === "-1" || (now - last) > jsxc.gui.window.sendComposingIntervalMs) {

	          var type = win.hasClass('jsxc_groupchat') ? 'groupchat' : 'chat';

	          jsxc.xmpp.conn.chatstates.sendComposing(bid, type);

	          win.data('lastComposingStateSent', now);
	        }

	      }

	    }).keypress(function(ev) {
	      if (ev.which !== 13 || !$(this).val()) {
	        return;
	      }

	      jsxc.gui.window.postMessage({
	        bid : bid, direction : jsxc.Message.OUT, msg : $(this).val()
	      });

	      $(this).val('');
	    }).focus(function() {
	      // remove unread flag
	      jsxc.gui.readMsg(bid);
	    }).mouseenter(function() {
	      $('#jsxc_windowList').data('isOver', true);
	    }).mouseleave(function() {
	      $('#jsxc_windowList').data('isOver', false);
	    });

	    win.find('.jsxc_textarea').click(function() {
	      // check if user clicks element or selects text
	      if (typeof getSelection === 'function' && !getSelection().toString()) {
	        win.find('.jsxc_textinput').focus();
	      }
	    });

	    win.find('.jsxc_textarea').slimScroll({
	      height : '234px', distance : '3px'
	    });

	    win.find('.jsxc_name').disableSelection();

	    win.find('.slimScrollDiv').resizable({
	      handles : 'w, nw, n', minHeight : 234, minWidth : 250, resize : function(event, ui) {
	        jsxc.gui.window.resize(win, ui);
	      }, start : function() {
	        win.removeClass('jsxc_normal');
	      }, stop : function() {
	        win.addClass('jsxc_normal');
	      }
	    });

	    win.find('.jsxc_window').css('bottom', -1 * win.find('.jsxc_fade').height());

	    if ($.inArray(bid, jsxc.storage.getUserItem('windowlist')) < 0) {

	      // add window to windowlist
	      var wl = jsxc.storage.getUserItem('windowlist') || [];
	      wl.push(bid);
	      jsxc.storage.setUserItem('windowlist', wl);

	      // init window element in storage
	      jsxc.storage.setUserItem('window', bid, {
	        minimize : true, text : '', unread : 0
	      });

	      jsxc.gui.window.hide(bid);
	    } else {

	      if (jsxc.storage.getUserItem('window', bid).unread) {
	        jsxc.gui._unreadMsg(bid);
	      }
	    }

	    $.each(jsxc.gui.emotions, function(i, val) {
	      var ins = val[0].split(' ')[0];
	      var li = $('<li>');
	      li.append(jsxc.gui.shortnameToImage(':' + val[1] + ':'));
	      li.find('div').attr('title', ins);
	      li.click(function() {
	        win.find('input').val(win.find('input').val() + ins);
	        win.find('input').focus();
	      });
	      win.find('.jsxc_emoticons ul').prepend(li);
	    });

	    jsxc.gui.toggleList.call(win.find('.jsxc_emoticons'));

	    jsxc.gui.window.restoreChat(bid);

	    jsxc.gui.update(bid);

	    jsxc.gui.updateWindowListSB();

	    // create related otr object
	    if (jsxc.master && !jsxc.otr.objects[bid]) {
	      jsxc.otr.create(bid);
	    } else {
	      jsxc.otr.enable(bid);
	    }

	    $(document).trigger('init.window.jsxc', [win]);

	    return win;
	  },

	  /**
	   * Resize given window to given size. If no size is provided the window is resized to the default
	   * size.
	   *
	   * @param  {(string|jquery)} win Bid or window object
	   * @param  {object} ui    The size has to be in the format {size:{width: [INT], height: [INT]}}
	   * @param  {boolean} [outer] If true the given size is used as outer dimensions.
	   */
	  resize : function(win, ui, outer) {
	    var bid;

	    if (typeof win === 'object') {
	      bid = win.attr('data-bid');
	    } else if (typeof win === 'string') {
	      bid = win;
	      win = jsxc.gui.window.get(bid);
	    } else {
	      jsxc.warn('jsxc.gui.window.resize has to be called either with bid or window object.');
	      return;
	    }

	    if (!win.attr('data-default-height')) {
	      win.attr('data-default-height', win.find('.ui-resizable').height());
	    }

	    if (!win.attr('data-default-width')) {
	      win.attr('data-default-width', win.find('.ui-resizable').width());
	    }

	    var outer_height_diff = (outer) ?
	    win.find('.jsxc_window').outerHeight() - win.find('.ui-resizable').height() : 0;

	    ui = $.extend({
	      size : {
	        width : parseInt(win.attr('data-default-width')),
	        height : parseInt(win.attr('data-default-height')) + outer_height_diff
	      }
	    }, ui || {});

	    if (outer) {
	      ui.size.height -= outer_height_diff;
	    }

	    win.find('.slimScrollDiv').css({
	      width : ui.size.width, height : ui.size.height
	    });

	    win.width(ui.size.width);

	    win.find('.jsxc_textarea').slimScroll({
	      height : ui.size.height
	    });

	    // var offset = win.find('.slimScrollDiv').position().top;
	    //win.find('.jsxc_emoticons').css('top', (ui.size.height + offset + 6) + 'px');

	    $(document).trigger('resize.window.jsxc', [win, bid, ui.size]);
	  },

	  fullsize : function(bid) {
	    var win = jsxc.gui.window.get(bid);
	    var size = jsxc.options.viewport.getSize();

	    size.width -= 10;
	    size.height -= win.find('.jsxc_bar').outerHeight() + win.find('.jsxc_textinput').outerHeight();

	    jsxc.gui.window.resize(win, {
	      size : size
	    });
	  },

	  /**
	   * Returns the window element
	   *
	   * @param {String} bid
	   * @returns {jquery} jQuery object of the window element
	   */
	  get : function(id) {
	    return $("li.jsxc_windowItem[data-bid='" + jsxc.jidToBid(id) + "']");
	  },

	  /**
	   * Open a window, related to the bid. If the window doesn't exist, it will be
	   * created.
	   *
	   * @param {String} bid
	   * @returns {jQuery} Window object
	   */
	  open : function(bid) {

	    var win = jsxc.gui.window.init(bid);

	    jsxc.gui.window.show(bid);
	    jsxc.gui.window.highlight(bid);

	    return win;
	  },

	  /**
	   * Close chatwindow and clean up
	   *
	   * @param {String} bid bar jid
	   */
	  close : function(bid) {

	    if (jsxc.gui.window.get(bid).length === 0) {
	      jsxc.warn('Want to close a window, that is not open.');
	      return;
	    }

	    jsxc.storage.removeUserElement('windowlist', bid);
	    jsxc.storage.removeUserItem('window', bid);

	    if (jsxc.storage.getUserItem('buddylist').indexOf(bid) < 0) {
	      // delete data from unknown sender

	      jsxc.storage.removeUserItem('buddy', bid);
	      jsxc.storage.removeUserItem('chat', bid);
	    }

	    jsxc.gui.window._close(bid);
	  },

	  /**
	   * Close chatwindow
	   *
	   * @param {String} bid
	   */
	  _close : function(bid) {
	    jsxc.gui.window.get(bid).remove();
	    jsxc.gui.updateWindowListSB();
	  },

	  /**
	   * Toggle between minimize and maximize of the text area
	   *
	   * @param {String} bid bar jid
	   */
	  toggle : function(bid) {

	    var win = jsxc.gui.window.get(bid);

	    if (win.parents("#jsxc_windowList").length === 0) {
	      return;
	    }

	    if (win.hasClass('jsxc_min')) {
	      jsxc.gui.window.show(bid);
	    } else {
	      jsxc.gui.window.hide(bid);
	    }

	    jsxc.gui.updateWindowListSB();
	  },

	  /**
	   * Maximize text area and save
	   *
	   * @param {String} bid
	   */
	  show : function(bid) {

	    jsxc.storage.updateUserItem('window', bid, 'minimize', false);

	    return jsxc.gui.window._show(bid);
	  },

	  /**
	   * Maximize text area
	   *
	   * @param {String} bid
	   * @returns {undefined}
	   */
	  _show : function(bid) {
	    var win = jsxc.gui.window.get(bid);
	    var duration = 0;

	    if (jsxc.isExtraSmallDevice()) {
	      if (parseFloat($('#jsxc_roster').css('right')) >= 0) {
	        duration = jsxc.gui.roster.toggle();
	      }

	      jsxc.gui.window.hide();
	      jsxc.gui.window.fullsize(bid);
	    }

	    win.removeClass('jsxc_min').addClass('jsxc_normal');
	    win.find('.jsxc_window').css('bottom', '0');

	    setTimeout(function() {
	      var padding = $("#jsxc_windowListSB").width();
	      var innerWidth = $('#jsxc_windowList>ul').width();
	      var outerWidth = $('#jsxc_windowList').width() - padding;

	      if (innerWidth > outerWidth) {
	        var offset = parseInt($('#jsxc_windowList>ul').css('right'));
	        var width = win.outerWidth(true);

	        var right = innerWidth - win.position().left - width + offset;
	        var left = outerWidth - (innerWidth - win.position().left) - offset;

	        if (left < 0) {
	          jsxc.gui.scrollWindowListBy(left * -1);
	        }

	        if (right < 0) {
	          jsxc.gui.scrollWindowListBy(right);
	        }
	      }
	    }, duration);

	    // If the area is hidden, the scrolldown function doesn't work. So we
	    // call it here.
	    jsxc.gui.window.scrollDown(bid);

	    if (jsxc.restoreCompleted) {
	      win.find('.jsxc_textinput').focus();
	    }

	    win.trigger('show.window.jsxc');
	  },

	  /**
	   * Minimize text area and save
	   *
	   * @param {String} [bid]
	   */
	  hide : function(bid) {
	    var hide = function(bid) {
	      jsxc.storage.updateUserItem('window', bid, 'minimize', true);

	      jsxc.gui.window._hide(bid);
	    };

	    if (bid) {
	      hide(bid);
	    } else {
	      $('#jsxc_windowList > ul > li').each(function() {
	        var el = $(this);

	        if (!el.hasClass('jsxc_min')) {
	          hide(el.attr('data-bid'));
	        }
	      });
	    }
	  },

	  /**
	   * Minimize text area
	   *
	   * @param {String} bid
	   */
	  _hide : function(bid) {
	    var win = jsxc.gui.window.get(bid);

	    win.removeClass('jsxc_normal').addClass('jsxc_min');
	    win.find('.jsxc_window').css('bottom', -1 * win.find('.jsxc_fade').height());

	    win.trigger('hidden.window.jsxc');
	  },

	  /**
	   * Highlight window
	   *
	   * @param {type} bid
	   */
	  highlight : function(bid) {
	    var el = jsxc.gui.window.get(bid).find(' .jsxc_bar');

	    if (!el.is(':animated')) {
	      el.effect('highlight', {
	        color : 'orange'
	      }, 2000);
	    }
	  },

	  /**
	   * Scroll chat area to the bottom
	   *
	   * @param {String} bid bar jid
	   */
	  scrollDown : function(bid) {
	    var chat = jsxc.gui.window.get(bid).find('.jsxc_textarea');

	    // check if chat exist
	    if (chat.length === 0) {
	      return;
	    }

	    chat.slimScroll({
	      scrollTo : (chat.get(0).scrollHeight + 'px')
	    });
	  },

	  /**
	   * Write Message to chat area and save. Check border cases and remove html.
	   *
	   * @function postMessage
	   * @memberOf jsxc.gui.window
	   * @param {jsxc.Message} message object to be send
	   * @return {jsxc.Message} maybe modified message object
	   */
	  /**
	   * Create message object from given properties, write Message to chat area
	   * and save. Check border cases and remove html.
	   *
	   * @function postMessage
	   * @memberOf jsxc.gui.window
	   * @param {object} args New message properties
	   * @param {string} args.bid
	   * @param {direction} args.direction
	   * @param {string} args.msg
	   * @param {boolean} args.encrypted
	   * @param {boolean} args.forwarded
	   * @param {boolean} args.sender
	   * @param {integer} args.stamp
	   * @param {object} args.attachment Attached data
	   * @param {string} args.attachment.name File name
	   * @param {string} args.attachment.size File size
	   * @param {string} args.attachment.type File type
	   * @param {string} args.attachment.data File data
	   * @return {jsxc.Message} maybe modified message object
	   */
	  postMessage : function(message) {

	    if (typeof message === 'object' && !(message instanceof jsxc.Message)) {
	      message = new jsxc.Message(message);
	    }

	    var data = jsxc.storage.getUserItem('buddy', message.bid);
	    var html_msg = message.msg;

	    // remove html tags and reencode html tags
	    message.msg = jsxc.removeHTML(message.msg);
	    message.msg = jsxc.escapeHTML(message.msg);

	    // exceptions:

	    if (message.direction === jsxc.Message.OUT && data.msgstate === OTR.CONST.MSGSTATE_FINISHED &&
	        message.forwarded !== true) {
	      message.direction = jsxc.Message.SYS;
	      message.msg = jsxc.t('your_message_wasnt_send_please_end_your_private_conversation');
	    }

	    if (message.direction === jsxc.Message.OUT && data.msgstate === OTR.CONST.MSGSTATE_FINISHED) {
	      message.direction = 'sys';
	      message.msg = jsxc.t('unencrypted_message_received') + ' ' + message.msg;
	    }

	    message.encrypted = message.encrypted || data.msgstate === OTR.CONST.MSGSTATE_ENCRYPTED;

	    try {
	      message.save();
	    } catch (err) {
	      jsxc.warn('Unable to save message.', err);

	      message = new jsxc.Message({
	        msg : 'Unable to save that message. Please clear some chat histories.',
	        direction : jsxc.Message.SYS
	      });
	    }

	    if (message.direction === 'in' &&
	        !jsxc.gui.window.get(message.bid).find('.jsxc_textinput').is(":focus")) {
	      jsxc.gui.unreadMsg(message.bid);

	      $(document).trigger('postmessagein.jsxc', [message.bid, html_msg]);
	    }

	    if (message.direction === jsxc.Message.OUT && jsxc.master && message.forwarded !== true &&
	        html_msg) {
	      jsxc.xmpp.sendMessage(message.bid, html_msg, message._uid);
	    }

	    jsxc.gui.window._postMessage(message);

	    if (message.direction === 'out' && message.msg === '?' &&
	        jsxc.options.get('theAnswerToAnything') !== false) {
	      if (typeof jsxc.options.get('theAnswerToAnything') === 'undefined' ||
	          (Math.random() * 100 % 42) < 1) {
	        jsxc.options.set('theAnswerToAnything', true);

	        jsxc.gui.window.postMessage(new jsxc.Message({
	          bid : message.bid, direction : jsxc.Message.SYS, msg : '42'
	        }));
	      }
	    }

	    return message;
	  },

	  /**
	   * Write Message to chat area
	   *
	   * @param {String} bid bar jid
	   * @param {Object} post Post object with direction, msg, uid, received
	   * @param {Bool} restore If true no highlights are used
	   */
	  _postMessage : function(message, restore) {
	    var bid = message.bid;
	    var win = jsxc.gui.window.get(bid);
	    var msg = message.msg;
	    var direction = message.direction;
	    var uid = message._uid;

	    // remove user composing notifications
	    win.find(".jsxc_userComposing").remove();

	    if (win.find('.jsxc_textinput').is(':not(:focus)') && direction === jsxc.Message.IN &&
	        !restore) {
	      jsxc.gui.window.highlight(bid);
	    }

	    msg = msg.replace(jsxc.CONST.REGEX.URL, function(url) {

	      var href = (url.match(/^https?:\/\//i)) ? url : 'http://' + url;

	      // @TODO use jquery element builder
	      return '<a href="' + href + '" target="_blank">' + url + '</a>';
	    });

	    msg = msg.replace(
	        new RegExp('(xmpp:)?(' + jsxc.CONST.REGEX.JID.source + ')(\\?[^\\s]+\\b)?', 'i'),
	        function(match, protocol, jid, action) {
	          if (protocol === 'xmpp:') {
	            if (typeof action === 'string') {
	              jid += action;
	            }

	            // @TODO use jquery element builder
	            return '<a href="xmpp:' + jid + '">xmpp:' + jid + '</a>';
	          }

	          // @TODO use jquery element builder
	          return '<a href="mailto:' + jid + '" target="_blank">mailto:' + jid + '</a>';
	        });

	    // replace emoticons from XEP-0038 and pidgin with shortnames
	    $.each(jsxc.gui.emotions, function(i, val) {
	      msg = msg.replace(val[2], ':' + val[1] + ':');
	    });

	    // translate shortnames to images
	    msg = jsxc.gui.shortnameToImage(msg);

	    // replace line breaks
	    msg = msg.replace(/(\r\n|\r|\n)/g, '<br />');

	    var msgDiv = $("<div>"), msgTsDiv = $("<div>");
	    msgDiv.addClass('jsxc_chatmessage jsxc_' + direction);
	    msgDiv.attr('id', uid.replace(/:/g, '-'));
	    msgDiv.html('<div>' + msg + '</div>');
	    msgTsDiv.addClass('jsxc_timestamp');
	    msgTsDiv.text(jsxc.getFormattedTime(message.stamp));

	    if (message.isReceived() || false) {
	      msgDiv.addClass('jsxc_received');
	    }

	    if (message.forwarded) {
	      msgDiv.addClass('jsxc_forwarded');
	    }

	    if (message.encrypted) {
	      msgDiv.addClass('jsxc_encrypted');
	    }

	    if (message.attachment && message.attachment.name) {
	      var attachment = $('<div>');
	      attachment.addClass('jsxc_attachment');
	      attachment.addClass('jsxc_' + message.attachment.type.replace(/\//, '-'));
	      attachment.addClass('jsxc_' + message.attachment.type.replace(/^([^/]+)\/.*/, '$1'));

	      if (message.attachment.persistent === false) {
	        attachment.addClass('jsxc_notPersistent');
	      }

	      if (message.attachment.data) {
	        attachment.addClass('jsxc_data');
	      }

	      if (message.attachment.type.match(/^image\//) && message.attachment.thumbnail) {
	        $('<img alt="preview">').attr('src', message.attachment.thumbnail).attr('title',
	            message.attachment.name).appendTo(attachment);
	      } else {
	        attachment.text(message.attachment.name);
	      }

	      if (message.attachment.data) {
	        attachment = $('<a>').append(attachment);
	        attachment.attr('href', message.attachment.data);
	        attachment.attr('download', message.attachment.name);
	      }

	      msgDiv.find('div').first().append(attachment);
	    }

	    if (direction === 'sys') {
	      jsxc.gui.window.get(bid).find('.jsxc_textarea').append('<div style="clear:both"/>');
	    } else if (typeof message.stamp !== 'undefined') {
	      msgDiv.append(msgTsDiv);
	    }

	    if (direction !== 'sys') {
	      $('[data-bid="' + bid + '"]').find('.jsxc_lastmsg .jsxc_text').html(msg);
	    }

	    if (jsxc.Message.getDOM(uid).length > 0) {
	      jsxc.Message.getDOM(uid).replaceWith(msgDiv);
	    } else {
	      win.find('.jsxc_textarea').append(msgDiv);
	    }

	    if (typeof message.sender === 'object' && message.sender !== null) {
	      var title = '';
	      var avatarDiv = $('<div>');
	      avatarDiv.addClass('jsxc_avatar').prependTo(msgDiv);

	      if (typeof message.sender.jid === 'string') {
	        msgDiv.attr('data-bid', jsxc.jidToBid(message.sender.jid));

	        var data = jsxc.storage.getUserItem('buddy', jsxc.jidToBid(message.sender.jid)) || {};
	        jsxc.gui.updateAvatar(msgDiv, jsxc.jidToBid(message.sender.jid), data.avatar);

	        title = jsxc.jidToBid(message.sender.jid);
	      }

	      if (typeof message.sender.name === 'string') {
	        msgDiv.attr('data-name', message.sender.name);

	        if (typeof message.sender.jid !== 'string') {
	          jsxc.gui.avatarPlaceholder(avatarDiv, message.sender.name);
	        }

	        if (title !== '') {
	          title = '\n' + title;
	        }

	        title = message.sender.name + title;

	        msgTsDiv.text(msgTsDiv.text() + ' ' + message.sender.name);
	      }

	      avatarDiv.attr('title', jsxc.escapeHTML(title));

	      if (msgDiv.prev().length > 0 &&
	          msgDiv.prev().find('.jsxc_avatar').attr('title') === avatarDiv.attr('title')) {
	        avatarDiv.css('visibility', 'hidden');
	      }
	    }

	    jsxc.gui.detectUriScheme(win);
	    jsxc.gui.detectEmail(win);

	    jsxc.gui.window.scrollDown(bid);
	  },

	  /**
	   * Set text into input area
	   *
	   * @param {type} bid
	   * @param {type} text
	   * @returns {undefined}
	   */
	  setText : function(bid, text) {
	    jsxc.gui.window.get(bid).find('.jsxc_textinput').val(text);
	  },

	  /**
	   * Load old log into chat area
	   *
	   * @param {type} bid
	   * @returns {undefined}
	   */
	  restoreChat : function(bid) {
	    var chat = jsxc.storage.getUserItem('chat', bid);

	    // convert legacy storage structure introduced in v3.0.0
	    if (chat) {
	      while (chat !== null && chat.length > 0) {
	        var c = chat.pop();

	        c.bid = bid;
	        c._uid = c.uid;
	        delete c.uid;

	        var message = new jsxc.Message(c);
	        message.save();

	        jsxc.gui.window._postMessage(message, true);
	      }

	      jsxc.storage.removeUserItem('chat', bid);
	    }

	    var history = jsxc.storage.getUserItem('history', bid);

	    while (history !== null && history.length > 0) {
	      var uid = history.pop();

	      jsxc.gui.window._postMessage(new jsxc.Message(uid), true);
	    }
	  },

	  /**
	   * Clear chat history
	   *
	   * @param {type} bid
	   * @returns {undefined}
	   */
	  clear : function(bid) {
	    // deprecated
	    jsxc.storage.removeUserItem('chat', bid);

	    var history = jsxc.storage.getUserItem('history', bid) || [];

	    history.map(function(id) {
	      jsxc.storage.removeUserItem('msg', id);
	    });

	    jsxc.storage.setUserItem('history', bid, []);

	    var win = jsxc.gui.window.get(bid);

	    if (win.length > 0) {
	      win.find('.jsxc_textarea').empty();
	    }
	  },

	  /**
	   * Mark message as received.
	   *
	   * @param  {string} bid
	   * @param  {string} uid message id
	   * @deprecated since v3.0.0. Use {@link jsxc.Message.received}.
	   */
	  receivedMessage : function(bid, uid) {
	    jsxc.warn('Using deprecated receivedMessage.');

	    var message = new jsxc.Message(uid);

	    message.received();
	  },

	  updateProgress : function(message, sent, size) {
	    var div = message.getDOM();
	    var span = div.find('.jsxc_timestamp span');

	    if (span.length === 0) {
	      div.find('.jsxc_timestamp').append('<span>');
	      span = div.find('.jsxc_timestamp span');
	    }

	    span.text(' ' + Math.round(sent / size * 100) + '%');

	    if (sent === size) {
	      span.remove();

	      message.received();
	    }
	  },

	  showOverlay : function(bid, content, allowClose) {
	    var win = jsxc.gui.window.get(bid);

	    win.find('.jsxc_overlay .jsxc_body').empty().append(content);
	    win.find('.jsxc_overlay .jsxc_close').off('click').click(function() {
	      jsxc.gui.window.hideOverlay(bid);
	    });

	    if (allowClose !== true) {
	      win.find('.jsxc_overlay .jsxc_close').hide();
	    } else {
	      win.find('.jsxc_overlay .jsxc_close').show();
	    }

	    win.addClass('jsxc_showOverlay');
	  },

	  hideOverlay : function(bid) {
	    var win = jsxc.gui.window.get(bid);

	    win.removeClass('jsxc_showOverlay');
	  },

	  selectResource : function(bid, text, cb, res) {
	    res = res || jsxc.storage.getUserItem('res', bid) || [];
	    cb = cb || function() {
	        };

	    if (res.length > 0) {
	      var content = $('<div>');
	      var list = $('<ul>'), i, li;

	      for (i = 0; i < res.length; i++) {
	        li = $('<li>');

	        li.append($('<a>').text(res[i]));
	        li.appendTo(list);
	      }

	      list.find('a').click(function(ev) {
	        ev.preventDefault();

	        jsxc.gui.window.hideOverlay(bid);

	        cb({
	          status : 'selected', result : $(this).text()
	        });
	      });

	      if (text) {
	        $('<p>').text(text).appendTo(content);
	      }

	      list.appendTo(content);

	      jsxc.gui.window.showOverlay(bid, content);
	    } else {
	      cb({
	        status : 'unavailable'
	      });
	    }
	  },

	  smpRequest : function(bid, question) {
	    var content = $('<div>');

	    var p = $('<p>');
	    p.text(jsxc.t('smpRequestReceived'));
	    p.appendTo(content);

	    var abort = $('<button>');
	    abort.text(jsxc.t('Abort'));
	    abort.click(function() {
	      jsxc.gui.window.hideOverlay(bid);
	      jsxc.storage.removeUserItem('smp', bid);

	      if (jsxc.master && jsxc.otr.objects[bid]) {
	        jsxc.otr.objects[bid].sm.abort();
	      }
	    });
	    abort.appendTo(content);

	    var verify = $('<button>');
	    verify.text(jsxc.t('Verify'));
	    verify.addClass('jsxc_btn jsxc_btn-primary');
	    verify.click(function() {
	      jsxc.gui.window.hideOverlay(bid);

	      jsxc.otr.onSmpQuestion(bid, question);
	    });
	    verify.appendTo(content);

	    jsxc.gui.window.showOverlay(bid, content);
	  },

	  sendFile : function(jid) {
	    var bid = jsxc.jidToBid(jid);
	    var win = jsxc.gui.window.get(bid);
	    var res = Strophe.getResourceFromJid(jid);

	    if (!res) {
	      jid = win.data('jid');
	      res = Strophe.getResourceFromJid(jid);

	      var fileCapableRes = jsxc.webrtc.getCapableRes(jid, jsxc.webrtc.reqFileFeatures);
	      var resources = Object.keys(jsxc.storage.getUserItem('res', bid)) || [];

	      if (res === null && resources.length === 1 && fileCapableRes.length === 1) {
	        res = fileCapableRes[0];
	        jid = bid + '/' + res;
	      } else if (fileCapableRes.indexOf(res) < 0) {
	        jsxc.gui.window.selectResource(bid, jsxc.t('Your_contact_uses_multiple_clients_'),
	            function(data) {
	              if (data.status === 'unavailable') {
	                jsxc.gui.window.hideOverlay(bid);
	              } else if (data.status === 'selected') {
	                jsxc.gui.window.sendFile(bid + '/' + data.result);
	              }
	            }, fileCapableRes);

	        return;
	      }
	    }

	    var msg = $('<div><div><label><input type="file" name="files" /><label></div></div>');
	    msg.addClass('jsxc_chatmessage');

	    jsxc.gui.window.showOverlay(bid, msg, true);

	    msg.find('label').click();

	    msg.find('[type="file"]').change(function(ev) {
	      var file = ev.target.files[0]; // FileList object

	      if (!file) {
	        return;
	      }

	      var attachment = $('<div>');
	      attachment.addClass('jsxc_attachment');
	      attachment.addClass('jsxc_' + file.type.replace(/\//, '-'));
	      attachment.addClass('jsxc_' + file.type.replace(/^([^/]+)\/.*/, '$1'));

	      msg.empty().append(attachment);

	      if (FileReader && file.type.match(/^image\//)) {
	        var img = $('<img alt="preview">').attr('title', file.name);
	        img.attr('src', jsxc.options.get('root') + '/img/loading.gif');
	        img.appendTo(attachment);

	        var reader = new FileReader();

	        reader.onload = function() {
	          img.attr('src', reader.result);
	        };

	        reader.readAsDataURL(file);
	      } else {
	        attachment.text(file.name + ' (' + file.size + ' byte)');
	      }

	      $('<button>').addClass('jsxc_btn jsxc_btn-primary').text(jsxc.t('Send')).click(function() {
	        var sess = jsxc.webrtc.sendFile(jid, file);

	        jsxc.gui.window.hideOverlay(bid);

	        var message = jsxc.gui.window.postMessage({
	          _uid : sess.sid + ':msg', bid : bid, direction : 'out', attachment : {
	            name : file.name,
	            size : file.size,
	            type : file.type,
	            data : (file.type.match(/^image\//)) ? img.attr('src') : null
	          }
	        });

	        sess.sender.on('progress', function(sent, size) {
	          jsxc.gui.window.updateProgress(message, sent, size);
	        });

	        msg.remove();

	      }).appendTo(msg);

	      $('<button>').addClass('jsxc_btn jsxc_btn-default').text(jsxc.t('Abort')).click(function() {
	        jsxc.gui.window.hideOverlay(bid);
	      }).appendTo(msg);
	    });
	  }
	};

	jsxc.gui.template = {};

	/**
	 * Return requested template and replace all placeholder
	 *
	 * @memberOf jsxc.gui.template;
	 * @param {type} name template name
	 * @param {type} bid
	 * @param {type} msg
	 * @returns {String} HTML Template
	 */
	jsxc.gui.template.get = function(name, bid, msg) {

	  // common placeholder
	  var ph = {
	    my_priv_fingerprint : jsxc.storage.getUserItem('priv_fingerprint') ?
	        jsxc.storage.getUserItem('priv_fingerprint').replace(/(.{8})/g, '$1 ') :
	        jsxc.t('not_available'),
	    my_jid : jsxc.storage.getItem('jid') || '',
	    my_node : Strophe.getNodeFromJid(jsxc.storage.getItem('jid') || '') || '',
	    root : jsxc.options.root,
	    app_name : jsxc.options.app_name,
	    version : jsxc.version
	  };

	  // placeholder depending on bid
	  if (bid) {
	    var data = jsxc.storage.getUserItem('buddy', bid);

	    $.extend(ph, {
	      bid_priv_fingerprint : (data && data.fingerprint) ?
	          data.fingerprint.replace(/(.{8})/g, '$1 ') : jsxc.t('not_available'),
	      bid_jid : bid,
	      bid_name : (data && data.name) ? data.name : bid
	    });
	  }

	  // placeholder depending on msg
	  if (msg) {
	    $.extend(ph, {
	      msg : msg
	    });
	  }

	  var ret = jsxc.gui.template[name];

	  if (typeof(ret) === 'string') {
	    // prevent 404
	    ret = ret.replace(/\{\{root\}\}/g, ph.root);

	    // convert to string

	    // ret = $('<div>').append($(ret).i18n()).html();
	    ret = $('<div>').append(jsxc.localization.processHtmlString(ret)).html();

	    // replace placeholders
	    ret = ret.replace(/\{\{([a-zA-Z0-9_\-]+)\}\}/g, function(s, key) {
	      return (typeof ph[key] === 'string') ? ph[key] : s;
	    });

	    return ret;
	  }

	  jsxc.debug('Template not available: ' + name);
	  return name;
	};

	/**
	 *
	 * Main menu. This menu is included in roster.
	 *
	 * <p>All templates are stored in templates/menu*.html
	 *
	 * <p>Call init() to build the menu. First init call is done in jsxc.roster.init()
	 *
	 * @namespace menu
	 *
	 * */
	jsxc.gui.menu = {

	  /**
	   * Time out before close menu
	   */
	  timeoutBeforeClose : 5000,

	  ready : false,

	  /**
	   * Menu elements. Each menu element has a label, a template name and an optional init function.
	   */
	  elements : {

	    /**
	     *
	     *
	     *
	     *  WELCOME PANEL
	     *
	     *
	     *
	     */
	    welcomePanel : {
	      label : "Accueil", template : "menuWelcome", init : function() {

	        // change presence or logout
	        $('#jsxc_menuWelcome .jsxc_menu_offline').click(function() {
	          jsxc.xmpp.logout(false);

	          // close menu and roster
	          jsxc.gui.menu.closeSideMenu();
	          jsxc.gui.roster.toggle();
	        });

	        // change presence or logout
	        $('#jsxc_menuWelcome .jsxc_status_buttons div').click(function() {
	          var self = $(this);

	          // pres info is stored in "data-pres" html arg
	          var pres = self.data('pres');

	          if (pres === 'offline') {
	            jsxc.xmpp.logout(false);
	          } else {
	            jsxc.gui.changePresence(pres);
	          }

	        });

	        var userList = jsxc.gui.createUserList("#jsxc_contactsUserList");

	        // invite user
	        $('#jsxc_menuWelcome .jsxc_addBuddyFromList').click(function() {

	          // retrieve first element selected
	          var selItems = $("#jsxc_contactsUserList .ui-selected");

	          // test if a user is selected
	          if (selItems.length < 1) {
	            jsxc.gui.feedback("Vous devez sélectionner un utilisateur", "warn");
	            return;
	          }

	          var alreadyBuddy = "";
	          var added = "";

	          selItems.each(function() {

	            // test if already buddy
	            if ($(this).hasClass("buddy_item")) {
	              alreadyBuddy += $(this).data("username") + ", ";
	              return true;
	            }

	            // add user
	            jsxc.xmpp.addBuddy($(this).data("userjid"));
	            added += $(this).data("username") + ", ";

	          });

	          if (alreadyBuddy.length > 0) {
	            jsxc.gui.feedback(
	                "Déjà dans vos contacts: " + alreadyBuddy.substring(0, alreadyBuddy.length - 2));
	          }

	          if (added.length > 0) {
	            jsxc.gui.feedback(
	                "Une invitation à été envoyée<br> à " + added.substring(0, added.length - 2));
	          }

	          // stop propagating
	          return false;
	        });

	        // remove contact
	        $('#jsxc_menuWelcome .jsxc_removeBuddyFromList').click(function() {

	          // retrieve first element selected
	          var selItems = $("#jsxc_menuWelcome .ui-selected");

	          //console.log(selItems);

	          if (selItems.length < 1) {
	            jsxc.gui.feedback("Vous devez sélectionner un utilisateur", "warn");
	            return;
	          }

	          var usersList = "";
	          selItems.each(function() {
	            usersList += $(this).data("username") + ", ";
	          });
	          usersList = usersList.substring(0, usersList.length - 2);

	          // show confirmation dialog
	          jsxc.gui.dialog.open(jsxc.gui.template.get('removeManyDialog', null, usersList));

	          $('#jsxc_dialog .jsxc_remove').click(function(ev) {
	            ev.stopPropagation();

	            selItems.each(function() {

	              if (jsxc.master) {
	                jsxc.xmpp.removeBuddy($(this).data("userjid"));
	              } else {
	                // inform master
	                jsxc.storage.setUserItem('deletebuddy', $(this).data("userjid"), {
	                  jid : $(this).data("userjid")
	                });
	              }

	            });

	            jsxc.gui.dialog.close();
	          });

	        });

	        // refresh list
	        $('#jsxc_menuWelcome .jsxc_refreshBuddyList').click(function() {

	          userList.updateUserList("freshList");

	          jsxc.gui.feedback("Mise à jour de la liste d'utilisateurs");

	        });

	      },
	    },

	    /**
	     *
	     * CONVERSATION PANEL
	     *
	     *
	     *
	     */

	    conversationPanel : {
	      label : "Conversations et multimédia", template : "menuConversations", init : function() {

	        // buddy list for room creation
	        var buddyList = jsxc.gui.createBuddyList("#jsxc_conversationUserList");

	        // update buddy list on click
	        $("#jsxc_menuConversation .jsxc_refreshBuddyList").click(function() {

	          buddyList.updateBuddyList();

	          jsxc.gui.feedback("Mise à jour en cours ...");
	        });

	        $("#jsxc_menuConversation .jsxc_createConversation").click(function() {

	          var selItems = $("#jsxc_conversationUserList .ui-selected");

	          // check selected elements
	          if (selItems.length < 1) {
	            jsxc.gui.feedback("Vous devez sélectionner au moins un contact", "warn");
	            return;
	          }

	          // prepare title
	          // var title = $("#jsxc_menuConversation .jsxc_inputRoomTitle").val().trim();

	          // prepare subject
	          // var subject = $("#jsxc_menuConversation .jsxc_inputRoomSubject").val().trim();

	          // prepare initial participants
	          var buddies = [];
	          selItems.each(function() {
	            buddies.push($(this).data("userjid"));
	          });

	          // jsxc.muc.createNewConversationWith(buddies, title, subject);
	          jsxc.muc.createNewConversationWith(buddies);

	        });

	        // invite users
	        $(".jsxc_inviteBuddiesOnConversation").click(function() {

	          var selItems = $("#jsxc_conversationUserList .ui-selected");

	          // check selected elements
	          if (selItems.length < 1) {
	            jsxc.gui.feedback("Vous devez sélectionner au moins un contact", "warn");
	            return;
	          }

	          // get user array
	          var users = [];
	          selItems.each(function() {
	            users.push($(this).data("userjid"));
	          });

	          // show dialog
	          jsxc.gui.showConversationSelectionDialog()

	          // user clicks OK
	              .done(function(conversations) {

	                // iterate conversations
	                conversations.each(function() {
	                  var conversJid = $(this).data("conversjid");
	                  jsxc.muc.inviteParticipants(conversJid, users);
	                });

	              });
	        });

	        // // display room dialog
	        // $("#jsxc_menuConversation .jsxc_roomDialog").click(jsxc.muc.showJoinChat);

	        /**
	         * Video conference
	         *
	         */

	        /**
	         * Get selected contacts and return array of FULL jids
	         * @returns {Array}
	         * @private
	         */
	        var _getSelectedContactsForMultimedia = function() {

	          var selItems = $("#jsxc_conversationUserList .ui-selected");

	          // check selected elements
	          if (selItems.length < 1) {
	            jsxc.gui.feedback("Vous devez sélectionner au moins un contact", "warn");
	            return;
	          }

	          /**
	           * Get full jid of people to call
	           */
	          var toCall = [];

	          $.each(selItems, function() {

	            // get informations about buddy
	            var bid = $(this).data("userjid");

	            var fulljid = jsxc.getCurrentActiveJidForBid(bid);

	            // no ressource available
	            if (fulljid === null) {

	              var node = Strophe.getNodeFromJid(bid);

	              jsxc.error("Invalid buddy for video call", bid);

	              jsxc.gui.feedback("Impossible de contacter " + node +
	                  ". Vérifiez votre contact est bien connecté et rafraichissez la page.");

	              // stop loop
	              return false;
	            }

	            else {
	              toCall.push(fulljid);
	            }

	          });

	          return toCall;
	        };

	        // create video conference

	        $("#jsxc_menuConversation .jsxc_createConference").click(function() {

	          var toCall = _getSelectedContactsForMultimedia();

	          if (toCall && toCall.length > 0) {
	            jsxc.mmstream.startVideoconference(toCall);
	          }

	        });

	        // call contacts separately

	        $("#jsxc_menuConversation .jsxc_callContacts").click(function() {

	          var toCall = _getSelectedContactsForMultimedia();

	          // call each participant
	          if (toCall && toCall.length > 0) {
	            $.each(toCall, function(index, element) {
	              jsxc.mmstream.startVideoCall(element);
	            });
	          }

	        });

	        /**
	         *
	         * Screen sharing
	         *
	         */

	        $("#jsxc_menuConversation .jsxc_screenSharing").click(function() {

	          if (jsxc.mmstream.screenSharingCapable === true) {
	            var toCall = _getSelectedContactsForMultimedia();

	            if (toCall && toCall.length > 0) {
	              jsxc.mmstream.startScreenSharingMultiPart(toCall);
	            }
	          }

	          else {
	            jsxc.gui.feedback(
	                "Pour partager votre écran vous devez utiliser le navigateur Chrome et " +
	                "installer l'extension de capture d'écran.");

	          }

	        });

	        /**
	         * Etherpad
	         *
	         */

	        // show share link
	        var etherpadNameTxt = $("#jsxc_etherpad_name");
	        var etherpadShareLink = $("#jsxc_menuConversation .jsxc_etherpad_sharelink");
	        var etherpadShareLinkTxt = $("#jsxc_menuConversation .jsxc_etherpad_sharetextfield");

	        etherpadNameTxt.keyup(function() {

	          var hrefLink = jsxc.etherpad.getEtherpadLinkFor(etherpadNameTxt.val());

	          etherpadShareLink.attr({
	            href : hrefLink
	          });

	          etherpadShareLinkTxt.val(hrefLink);
	        });

	        // create Etherpad documents
	        $("#jsxc_menuConversation .jsxc_openpad").click(function() {

	          var etherpadId = $("#jsxc_etherpad_name").val().toLowerCase();

	          if (!etherpadId.match(/^[a-z0-9_-]{5,50}$/i)) {
	            jsxc.gui.feedback("Nom invalide: /^[a-z0-9_-]{5,50}$/i");
	            return true;
	          }

	          jsxc.etherpad.openpad(etherpadId);

	        });

	      },

	    },

	    settingsPanel : {
	      label : "Paramètres", template : "menuSettings", init : function() {

	        // mute notifications
	        $('#jsxc_menuSettings .jsxc_muteNotification').click(function() {

	          if (jsxc.storage.getUserItem('presence') === 'dnd') {
	            return;
	          }

	          // invert current choice
	          var mute = !jsxc.options.get('muteNotification');

	          if (mute) {
	            jsxc.notification.muteSound();
	          } else {
	            jsxc.notification.unmuteSound();
	          }
	        });

	        $("#jsxc_menuSettings .jsxc_showNotificationRequestDialog").click(function() {
	          jsxc.gui.showRequestNotification();
	        });

	        // show dialog settings
	        $('#jsxc_menuSettings .jsxc_dialog_settings').click(function() {
	          jsxc.gui.showSettings();
	        });

	        // display or hide offline buddies
	        $('#jsxc_menuSettings .jsxc_hideOffline').click(function() {

	          var hideOffline = !jsxc.options.get('hideOffline');

	          if (hideOffline) {
	            $('#jsxc_buddylist').addClass('jsxc_hideOffline');
	          } else {
	            $('#jsxc_buddylist').removeClass('jsxc_hideOffline');
	          }

	          $(this).text(hideOffline ? jsxc.t('Show_offline') : jsxc.t('Hide_offline'));

	          jsxc.options.set('hideOffline', hideOffline);
	        });

	        // about dialog
	        $('#jsxc_menuSettings .jsxc_about').click(function() {
	          jsxc.gui.showAboutDialog();
	        });

	      },
	    },

	  },

	  /**
	   * Initialise menu and menu elements
	   */
	  init : function() {

	    var self = jsxc.gui.menu;

	    // disable text selection
	    $("#jsxc_side_menu").disableSelection();

	    var menuRoot = $("#jsxc_side_menu_content");

	    // initializing elements
	    for (var prop in this.elements) {
	      var elmt = this.elements[prop];

	      // add Title
	      menuRoot.append("<h1>" + elmt.label + "</h1>");

	      // load and add template
	      if (typeof elmt.template === "undefined") {
	        throw "Parameter cannot be undefined: " + elmt.template;
	      }
	      elmt.template = jsxc.gui.template.get(elmt.template);

	      menuRoot.append(elmt.template);

	      // launch init function
	      if (typeof elmt.init !== "undefined") {
	        elmt.init.call(elmt);
	      }
	    }

	    // set accordion menu
	    this._initAccordion();

	    // set foldable
	    this._initFoldableActions();

	    // open at launch
	    $("#jsxc_side_menu_content > h1.ui-accordion-header").eq(0).trigger("click");

	    self.ready = true;
	    $(document).trigger("menu.ready.jsxc");

	  },

	  /**
	   * Set menu accordion and searchable
	   */
	  _initAccordion : function() {

	    // voir: http://www.w3schools.com/howto/howto_js_accordion.asp

	    // create accordion
	    $("#jsxc_side_menu_content").accordion({
	      collapsible : false, heightStyle : "fill", header : "h1"
	    });

	    // adding better srollbars
	    $("#jsxc_side_menu_content > div").each(function() {
	      $(this).perfectScrollbar();
	    });

	    var self = this;

	    // add search text fields and buttons
	    $("#jsxc_menu_search_text_field").keyup(self.onSearchKeyUp);

	    // show next result
	    $("#jsxc_menu_next_btn").click(function() {
	      self.showNextResult();
	    });

	    // show previous result
	    $("#jsxc_menu_previous_btn").click(function() {
	      self.showPreviousResult();
	    });

	  },

	  /**
	   * Current index of search result
	   */
	  currentSearchResultIndex : 0,

	  /**
	   * All currents results
	   */
	  currentResults : [],

	  /**
	   * Title mark displayed when a result occur in a panel
	   */
	  searchTitleMark : "<span class='jsxc_menu_search_title_mark'> &lt;!&gt;</span>",

	  /**
	   * Settings for text highliting. Using jquery.highlight.js
	   */
	  highlightSettings : {
	    caseSensitive : false, className : 'jsxc_menu_search_results'
	  },

	  /**
	   * Called by search text field when user type something
	   */
	  onSearchKeyUp : function() {

	    // terms to search
	    var rawTerms = $(this).val().trim();

	    //console.log(rawTerms);

	    var self = jsxc.gui.menu;

	    // reinitialize indicators
	    self.currentResults = [];
	    self.currentSearchResultIndex = 0;
	    $("#jsxc_side_menu_content span.jsxc_menu_search_title_mark").remove();

	    // champs vide, arret
	    if (rawTerms.length < 1) {

	      self.feedback();

	      self.resetHighlights();

	      $("#jsxc_side_menu_content > h1.ui-accordion-header").eq(0).trigger("click");

	      return;
	    }

	    // surligner les résultats
	    self.highlightTerms(rawTerms);

	    // lister les résultats
	    self.currentResults = $(".jsxc_menu_search_results");

	    // pas de résultats, activer le premier onglet
	    if (self.currentResults.length < 1) {

	      self.feedback("Aucun résultat");

	      $("#jsxc_side_menu_content > h1.ui-accordion-header").eq(0).trigger("click");

	    }

	    // un ou plusieurs résultats, afficher l'onglet du premier resultat correspondant
	    else {

	      // ajouter les marques aux titres correspondants
	      self.currentResults.each(function(index) {

	        var title;
	        var titleSearch = $(this).parents("h1.ui-accordion-header");
	        if (titleSearch.length > 0) {
	          title = titleSearch.eq(0);
	        } else {
	          title = self.currentResults.eq(index).parents("div.ui-accordion-content").prev(
	              "h1.ui-accordion-header");
	        }

	        var mark = $(self.searchTitleMark);

	        if (title.find("span.jsxc_menu_search_title_mark").length < 1) {
	          title.append(mark);
	        }

	      });

	      self.selectResult(0);

	    }
	  },

	  /**
	   * Display a message for user
	   */
	  feedback : function(text) {
	    $("#jsxc_menu_feedback").html(text || "&nbsp;");
	  },

	  /**
	   * Highlight all term searched
	   */
	  highlightTerms : function(terms) {

	    this.resetHighlights();

	    // surligner tous les élements
	    $("#jsxc_side_menu_content").highlight(terms, this.highlightSettings);

	  },

	  /**
	   * Enlever le surlignage
	   */
	  resetHighlights : function() {

	    $("#jsxc_side_menu_content").unhighlight(this.highlightSettings);

	    // retirer les précédents résultats actifs
	    $("#jsxc_side_menu_content .jsxc_menu_active_result").each(function() {
	      $(this).removeClass("jsxc_menu_active_result");
	    });
	  },

	  /**
	   * Active the next result
	   */
	  showNextResult : function() {

	    this.currentSearchResultIndex++;

	    if (this.currentSearchResultIndex > this.currentResults.length - 1) {
	      this.feedback("Dernier résultat atteint");
	      this.currentSearchResultIndex = this.currentResults.length - 1;
	    }

	    this.selectResult(this.currentSearchResultIndex);

	  },

	  /**
	   * Active the previous result
	   */
	  showPreviousResult : function() {

	    this.currentSearchResultIndex--;

	    if (this.currentSearchResultIndex <= 0) {
	      this.feedback("Premier résultat atteint");
	      this.currentSearchResultIndex = 0;
	    }

	    this.selectResult(this.currentSearchResultIndex);

	  },

	  /**
	   * Show result tab and active it
	   */
	  selectResult : function(index) {

	    // retirer les précédents résultats actifs
	    $("#jsxc_side_menu_content .jsxc_menu_active_result").each(function() {
	      $(this).removeClass("jsxc_menu_active_result");
	    });

	    // ajouter la classe au résultat actif
	    if (this.currentResults.length > 0) {
	      this.currentResults.eq(this.currentSearchResultIndex).addClass("jsxc_menu_active_result");

	      // activer l'accordéon correspondant
	      var titleSearch = this.currentResults.eq(index).parents("h1");
	      if (titleSearch.length > 0) {
	        titleSearch.eq(0).trigger("click");
	      } else {
	        this.currentResults.eq(index).parents("div.ui-accordion-content").prev(
	            "h1.ui-accordion-header").trigger("click");
	      }
	    }

	  },

	  /**
	   * Open side menu with parameters and options
	   */
	  openSideMenu : function() {

	    var self = $("#jsxc_side_menu");

	    // state is saved inside the jquery element
	    self.data("sideMenuEnabled", true);

	    // reresh accordion size
	    $("#jsxc_side_menu_content").accordion("refresh");

	    self.animate({right : "0px"});

	    // focus on search text field, but not on small devices
	    var txtField = $("#jsxc_menu_search_text_field");
	    if ($(window).height() > 600) {
	      txtField.get(0).focus();
	      txtField.get(0).select();
	    }

	  },

	  /**
	   * Close the side menu
	   */
	  closeSideMenu : function() {

	    var self = $("#jsxc_side_menu");

	    // state is saved inside the jquery element
	    self.data("sideMenuEnabled", false);

	    self.animate({right : "-200px"});

	    // clear timer
	    window.clearTimeout(self.data('timerForClosing'));
	  },

	  /**
	   * Associate click with fold / unfold menu action
	   */
	  _initFoldableActions : function() {

	    var sideMenu = $("#jsxc_side_menu");

	    var self = this;

	    // when clicking open menu, and launch timer to hide it after inactivity
	    $("#jsxc_menu > span").click(function() {

	      //  side menu is open, close it
	      if (sideMenu.data("sideMenuEnabled")) {
	        self.closeSideMenu();
	      }

	      // side menu is closed, open it
	      else {
	        self.openSideMenu();
	      }

	      return false;

	    });

	    // mouse leaving, timeout to hide
	    // timeouts are stored in self element with jquery.data()
	    sideMenu.mouseleave(function() {
	      sideMenu.data('timerForClosing',
	          window.setTimeout(self.closeSideMenu, jsxc.gui.menu.timeoutBeforeClose));
	    });

	    // mouse entering, clear timeout to hide
	    // timeouts are stored in self element with jquery.data()
	    sideMenu.mouseenter(function() {
	      window.clearTimeout(sideMenu.data('timerForClosing'));
	    });

	    // close side menu when roster is closed
	    $(document).on("toggle.roster.jsxc", function() {
	      self.closeSideMenu();
	    });

	    // click on notification, show first panel

	    // when clicking open menu, and launch timer to hide it after inactivity
	    $("#jsxc_roster .jsxc_menu_notif_bottom_roster").click(function() {

	      //  side menu is closed, open it
	      if (sideMenu.data("sideMenuEnabled") !== true) {
	        self.openSideMenu();
	      }

	      // open first tab
	      $("#jsxc_side_menu_content > h1.ui-accordion-header").eq(0).trigger("click");

	      return false;

	    });

	    // click on text field, show cursor
	    // workaround for firefox
	    var txtField = $("#jsxc_menu_search_text_field");
	    txtField.click(function() {
	      txtField.get(0).focus();
	      txtField.get(0).select();
	    });

	  },

	};
	/**
	 * Show a feedback message. Type can be 'info' or 'warn'
	 *
	 * @param selector
	 * @returns {JQuery|jQuery|HTMLElement}
	 */
	jsxc.gui.feedback = function(message, type, timeout) {

	  jsxc.stats.addEvent("jsxc.feedback.toast");

	  var defaultType = "info";

	  var bgColors = {
	    info : '#1a1a1a', warn : '#520400',
	  };
	  var icons = {
	    info : 'info', warn : 'warning',
	  };

	  // show the toast
	  $.toast({
	    text : message, // Text that is to be shown in the toast
	    icon : icons[type || defaultType], // Type of toast icon
	    showHideTransition : 'slide', // fade, slide or plain
	    allowToastClose : true, // Boolean value true or false
	    hideAfter : timeout || 3000, // false to make it sticky or number representing the miliseconds
	                                 // as time after which toast needs to be hidden
	    stack : 3, // false if there should be only one toast at a time or a number representing the
	               // maximum number of toasts to be shown at a time
	    position : 'top-center', // bottom-left or bottom-right or bottom-center or top-left or
	                             // top-right or top-center or mid-center or an object representing the
	                             // left, right, top, bottom values
	    textAlign : 'left',  // Text alignment i.e. left, right or center
	    loader : false,  // Whether to show loader or not. True by default
	    bgColor : bgColors[type || defaultType], // background color of toast
	  });

	};

	/**
	 * Create a filterable list. Need jquery.highlight.js.
	 *
	 * @param options
	 */
	jsxc.gui._createFilterableList = function(selector, options) {

	  this.defaultOptions = {

	    highlightClass : "filterableList-result", searchPlaceholder : "Rechercher ..."

	  };

	  var settings = $.extend({}, this.defaultOptions, options);

	  // root of list
	  var root = $(selector);
	  root.addClass("jsxc_filterableList");

	  // // must have position arg to avoid error with perfectscrollbar
	  // root.css({
	  //     position: "relative",
	  // });

	  // append search text field
	  var searchTxt = $(
	      "<input type='text' class='jsxc_filterTextField' placeholder='" + settings.searchPlaceholder +
	      "'/>");
	  searchTxt.css({
	    height : "26px", width : "100%"
	  });
	  searchTxt.appendTo(root);

	  // click on text field, show cursor
	  // workaround for firefox
	  searchTxt.click(function() {
	    searchTxt.get(0).focus();
	    searchTxt.get(0).select();
	  });

	  // list in a container for perfect scrollabr
	  var container = $("<div class='list_container'></div>");
	  container.css({
	    position : "relative", width : "100%", height : '85%'
	  });

	  // append list to container
	  var list = $("<ol></ol>");
	  list.appendTo(container);

	  // // fake items
	  // for (var i = 0; i < 300; i++) {
	  //     list.append("<li class='ui-widget-content'>" + chance.name() + "</li>");
	  // }

	  list.selectable();

	  root.append(container);
	  container.perfectScrollbar();

	  // settings for highlight search results
	  var highlightSettings = {
	    caseSensitive : false, className : settings.highlightClass
	  };

	  // undo highlight
	  var resetHighlight = function() {
	    list.unhighlight(highlightSettings);
	  };

	  // search terms when user type
	  var searchInList = function(rawTerms) {

	    var terms = rawTerms.trim();

	    // reset list
	    list.find(".filterableNoResult").remove();
	    resetHighlight();

	    if (terms === "") {
	      root.find("li").css({"display" : "block"});

	      container.perfectScrollbar("update");

	      container.scrollTop(0);

	      return;
	    }

	    // search terms
	    list.highlight(terms, highlightSettings);

	    // hide others
	    var result = 0;
	    root.find("li").each(function() {
	      if ($(this).has("span." + settings.highlightClass).length === 0) {
	        $(this).css({'display' : 'none'});
	      } else {
	        $(this).css({'display' : 'block'});
	        result++;
	      }
	    });

	    if (result < 1) {
	      list.prepend("<li class='filterableNoResult'>Aucun résultat</li>");
	    }

	    container.perfectScrollbar("update");

	    // scroll to top
	    container.scrollTop(0);

	  };

	  searchTxt.keyup(function() {
	    searchInList(searchTxt.val());
	  });

	  return root;

	};

	/**
	 * Create a room list
	 *
	 * @param selector
	 */
	jsxc.gui.createRoomList = function(selector) {

	  var root = $(selector);

	  root.addClass("jsxc_roomListContainer");

	  root.append("<ol class='jsxc_roomList'></ol>");

	  var list = $(selector + " .jsxc_roomList");

	  // make selectable list
	  list.selectable();

	  // make list scrollable
	  root.perfectScrollbar();

	  // refresh room list
	  var updateRoomList = function() {

	    jsxc.xmpp.conn.muc.listRooms(jsxc.options.get('muc').server,

	        // getting list
	        function(stanza) {

	          list.empty();

	          var items = $(stanza).find('item');

	          // no rooms
	          if (items.length < 1) {

	            // create list element
	            var li = $("<li></li>")
	                .text("Aucun salon disponible")
	                .attr({
	                  'class' : 'ui-widget-content', 'roomjid' : "_NO_ROOM_AVAILABLE"
	                });

	            list.append(li);

	          }

	          // list all rooms
	          else {

	            items.each(function() {

	              var rjid = $(this).attr('jid').toLowerCase();
	              var rnode = Strophe.getNodeFromJid(rjid);
	              var rname = $(this).attr('name') || rnode;

	              // create list element
	              var li = $("<li></li>")
	                  .text(rname)
	                  .attr({
	                    'data-roomjid' : rjid,
	                    'data-rname' : rname,
	                    'class' : 'ui-widget-content',
	                    'title' : rjid
	                  });

	              list.append(li);
	            });
	          }

	        },

	        // error while getting list
	        function() {

	          list.empty();

	          jsxc.debug("Unable to retrieve rooms", arguments);

	          // create list element
	          var li = $("<li></li>")
	              .text("Liste des salons indisponible")
	              .attr({
	                'class' : 'ui-widget-content'
	              });

	          list.append(li);
	        });

	  };

	  // update each time buddy list change
	  $(document).on("status.muc.jsxc", updateRoomList);

	  // first update
	  updateRoomList();

	  return {
	    /**
	     * Jquery object on root
	     */
	    "root" : root,

	    /**
	     * Update list
	     */
	    "updateRoomList" : updateRoomList
	  };

	};

	/**
	 * Create an user list. To retrieve selected elements select $("#listId .ui-selected");
	 *
	 *
	 * <p>Each item contains data:
	 *
	 * <p>'data-userjid': elmt.jid, 'data-username': elmt.username,
	 *
	 *
	 * @param selector
	 */
	jsxc.gui.createUserList = function(selector) {

	  // var root = $(selector);

	  console.log(selector);

	  var root = jsxc.gui._createFilterableList(selector);
	  root.addClass("jsxc_userListContainer");

	  var list = root.find("ol");

	  // update lists
	  var updateUserList = function(freshList) {

	    var search = jsxc.xmpp.search.getUserList;

	    if (freshList === "freshList") {
	      search = jsxc.xmpp.search.getFreshUserList;
	    }

	    // add contact to list
	    search().then(function(users) {

	          // remove exisiting elements
	          list.empty();

	          // add users
	          $.each(users, function(index, elmt) {

	            // check if not user
	            if (elmt.username === jsxc.xmpp.getCurrentNode()) {
	              return true;
	            }

	            // create list element
	            var li = $("<li></li>")
	                .text(elmt.username)
	                .attr({
	                  'data-userjid' : elmt.jid,
	                  'data-username' : elmt.username,
	                  'class' : 'ui-widget-content',
	                  'title' : elmt.username + " n'est pas dans vos contacts"
	                });

	            // modify element if buddy
	            if (elmt._is_buddy) {
	              li.addClass("buddy_item")
	                  .attr({
	                    'title' : elmt.username + " est dans vos contacts"
	                  });
	            }

	            list.append(li);
	          });
	        },

	        // error while updating
	        function() {

	          // remove exisiting elements
	          list.empty();

	          var li = $("<li></li>")
	              .text("Liste des contacts indisponible")
	              .attr({'class' : 'ui-widget-content'});

	          list.append(li);

	        });
	  };

	  // update each time buddy list change
	  $(document).on("add.roster.jsxc", updateUserList);
	  $(document).on("cloaded.roster.jsxc", updateUserList);
	  $(document).on("buddyListChanged.jsxc", updateUserList);

	  // first update
	  updateUserList();

	  return {
	    /**
	     * Jquery object on root
	     */
	    "root" : root,

	    /**
	     * Update list
	     */
	    "updateUserList" : updateUserList
	  };

	};

	/**
	 * Create a buddy list. To retrieve selected elements select $("#listId .ui-selected");
	 *
	 *
	 * <p>Each item contains data:
	 *
	 * <p>'data-userjid': elmt.jid, 'data-username': elmt.username,
	 *
	 *
	 * @param selector
	 */
	jsxc.gui.createBuddyList = function(selector) {

	  var root = $(selector);

	  root.addClass("jsxc_buddyListContainer");

	  root.append("<ol class='jsxc_buddyList'></ol>");

	  var list = $(selector + " .jsxc_buddyList");

	  // make selectable list
	  list.selectable();

	  // make list scrollable
	  root.perfectScrollbar();

	  // update lists
	  var updateBuddyList = function() {

	    list.empty();

	    var buddylist = jsxc.storage.getLocaleBuddyListBJID();

	    var buddyNumber = 0;

	    $.each(buddylist, function(index, jid) {

	      //console.log(jsxc.storage.getUserItem('buddy', Strophe.getBareJidFromJid(jid)));

	      var infos = jsxc.storage.getUserItem('buddy', Strophe.getBareJidFromJid(jid));

	      // check friendship
	      var realFriend = infos.sub === 'both' && infos.type !== 'groupchat';

	      if (realFriend !== true) {
	        return true;
	      }

	      var userName = Strophe.getNodeFromJid(jid);

	      // create list element
	      var li = $("<li></li>")
	          .text(userName)
	          .attr({
	            'data-userjid' : jid, 'data-username' : userName, 'class' : 'ui-widget-content'
	          });

	      list.append(li);

	      buddyNumber++;

	    });

	    if (buddyNumber < 1) {
	      // create list element
	      var li = $("<li></li>")
	          .text("Aucun contact confirmé")
	          .attr({
	            'data-userjid' : null, 'data-username' : null, 'class' : 'ui-widget-content'
	          });

	      list.append(li);
	    }

	  };

	  // update each time buddy list change
	  $(document).on("add.roster.jsxc", updateBuddyList);
	  $(document).on("cloaded.roster.jsxc", updateBuddyList);
	  $(document).on("buddyListChanged.jsxc", updateBuddyList);

	  // first update
	  updateBuddyList();

	  return {
	    /**
	     * Jquery object on root
	     */
	    "root" : root,

	    /**
	     * Update list
	     */
	    "updateBuddyList" : updateBuddyList
	  };

	};

	/**
	 * Create a conversation list. To retrieve selected elements select $("#listId .ui-selected");
	 *
	 *
	 * <p>Each item contains data:
	 *
	 * <p>'data-conversjid'
	 *
	 *
	 * @param selector
	 */
	jsxc.gui.createConversationList = function(selector) {

	  var root = $(selector);

	  root.addClass("jsxc_conversationListContainer");

	  root.append("<ol class='jsxc_conversationList'></ol>");

	  var list = $(selector + " .jsxc_conversationList");

	  // make selectable list
	  list.selectable();

	  // make list scrollable
	  root.perfectScrollbar();

	  // update lists
	  var updateConversationList = function() {

	    list.empty();

	    var conversList = jsxc.storage.getLocaleBuddyListBJID();

	    var conversNumber = 0;

	    $.each(conversList, function(index, jid) {

	      var infos = jsxc.storage.getUserItem('buddy', Strophe.getBareJidFromJid(jid));

	      // check friendship
	      var chatRoom = infos.type === 'groupchat';

	      if (chatRoom !== true) {
	        return true;
	      }

	      var conversName = Strophe.getNodeFromJid(jid);

	      // create list element
	      var li = $("<li></li>")
	          .text(conversName)
	          .attr({
	            'data-conversjid' : jid, 'class' : 'ui-widget-content'
	          });

	      list.append(li);

	      conversNumber++;

	    });

	    if (conversNumber < 1) {
	      // create list element
	      var li = $("<li></li>")
	          .text("Aucune conversation")
	          .attr({
	            'data-conversjid' : null, 'class' : 'ui-widget-content'
	          });

	      list.append(li);
	    }

	  };

	  // update each time buddy list change
	  $(document).on("add.roster.jsxc", updateConversationList);
	  $(document).on("cloaded.roster.jsxc", updateConversationList);
	  $(document).on("buddyListChanged.jsxc", updateConversationList);

	  // first update
	  updateConversationList();

	  return {
	    /**
	     * Jquery object on root
	     */
	    "root" : root,

	    /**
	     * Update list
	     */
	    "updateConversationList" : updateConversationList
	  };

	};
	/**
	 * API for manipulating JSXC
	 *
	 */

	jsxc.help = {

	  currentTutorial : null,

	  tutorials : {},

	  /**
	   * Get an array containing all tutorials
	   */
	  getAllTutorials : function() {

	    var self = jsxc.help;

	    var res = {};

	    $.each(self.tutorials, function(index, element) {
	      res[index] = element();
	    });

	    return res;
	  },

	  /**
	   * Launch a visual tutorial
	   * @param name
	   */
	  launchTutorial : function(name) {

	    var self = jsxc.help;

	    jsxc.stats.addEvent("jsxc.help.tutorial." + name);

	    console.log("Launching tutorial");
	    console.log(name);

	    // TODO: Check if a tutorial is already running

	    if (typeof self.tutorials[name] === "undefined") {
	      throw "Invalid tutorial name: " + name;
	    }

	    var tutorial = self.tutorials[name]();

	    var tour = new Shepherd.Tour({

	      defaults : {
	        classes : 'shepherd-theme-default jsxc_demotour_item',
	        scrollTo : true,
	        showCancelLink : true,
	        buttons : [

	          {
	            text : '<',

	            action : function() {
	              Shepherd.activeTour.back();
	            }

	          },

	          {
	            text : '>',

	            action : function() {
	              Shepherd.activeTour.next();
	            }

	          },

	        ]

	      }
	    });

	    $.each(tutorial.steps, function(index, element) {
	      tour.addStep(element);
	    });

	    tour.start();

	  },

	  /**
	   * Initialization of all tutorials
	   */
	  init : function() {

	    var self = jsxc.help;

	    self.tutorials["interface"] = function() {

	      return {

	        description : "Visite de l'interface",

	        steps : [

	          {
	            title : "Interface",
	            text : "<p>Vous allez découvrir les fonctionnalités offerte par la" +
	            " plateforme en 5 étapes.</p>",
	            attachTo : {element : 'body', on : 'top'},
	            when : {
	              'before-show' : function() {
	                jsxc.gui.roster.toggle("hidden");
	                jsxc.mmstream.gui.toggleVideoPanel(false);
	              }
	            }
	          },

	          {
	            title : "Interface",
	            text : "<p>L'interface principale est disponible à droite. Cliquez sur la barre " +
	            "transparente pour l'afficher.</p>",
	            attachTo : {element : '#jsxc_toggleRoster', on : 'left'},
	            advanceOn : "#jsxc_toggleRoster click",
	            when : {
	              'before-hide' : function() {
	                jsxc.gui.roster.toggle("shown");
	              }
	            }
	          },

	          {
	            title : "Interface",
	            text : "<p>Les appels vidéos sont affichés à gauche.</p>",
	            attachTo : {element : '#jsxc_toggleVideoPanel', on : 'left'},
	            advanceOn : "#jsxc_toggleVideoPanel click",
	            when : {
	              'before-hide' : function() {
	                jsxc.mmstream.gui.toggleVideoPanel(true);
	              }
	            }
	          },

	          {
	            title : "Interface",
	            text : "<p>Le menu permet d'accéder à toutes les fonctionnalités.</p>",
	            attachTo : {element : '#jsxc_menu', on : 'left'},
	            advanceOn : "#jsxc_menu click",
	            when : {
	              'before-hide' : function() {
	                $("#jsxc_menu").trigger("click");
	              }
	            }
	          },

	          {
	            title : "Travail en cours",
	            text : "<p>Travail en cours, cet assistant sera bientôt terminé.</p>",
	            attachTo : {element : '#jsxc_toggleRoster', on : 'right'},
	            when : {
	              'before-show' : function() {

	              }
	            }
	          }

	        ]
	      };

	    };

	    self.tutorials["demotour"] = function() {

	      return {

	        description : "Démonstration",

	        steps : [
	          {
	            title : "Travail en cours",
	            text : "<p>Travail en cours, cet assistant sera bientôt terminé.</p>",
	            attachTo : {element : '#jsxc_toggleRoster', on : 'right'},
	            when : {
	              'before-show' : function() {

	              }
	            }
	          }]

	      };
	    };


	  },

	};
	jsxc.localization = {

	    init: function () {

	        // detect language
	        var lang;
	        if (jsxc.storage.getItem('lang') !== null) {
	            lang = jsxc.storage.getItem('lang');
	        } else if (jsxc.options.autoLang && navigator.language) {
	            lang = navigator.language.substr(0, 2);
	        } else {
	            lang = jsxc.options.defaultLang;
	        }

	        /**
	         *
	         *
	         *
	         *
	         *
	         *
	         *
	         *
	         */

	        /* jshint ignore:start */

	        /**
	         *
	         *
	         *
	         *
	         *
	         *
	         *
	         *
	         */

	        // import i18n relative to tmp/. Import only amd module, not jquery.
	        jsxc.i18n = __webpack_require__(3);

	        // shortcut
	        jsxc.t = jsxc.i18n.translate;

	        // initialize i18n translator
	        jsxc.i18n.init({
	            lng: lang,
	            fallbackLng: 'en',
	            resStore: chatclient_I18next_ressource_store,
	            // use localStorage and set expiration to a day
	            useLocalStorage: true,
	            localStorageExpirationTime: 60 * 60 * 24 * 1000,
	            debug: jsxc.storage.getItem('debug') === true
	        });

	        /**
	         *
	         *
	         *
	         *
	         *
	         *
	         *
	         *
	         */

	        /* jshint ignore:end */

	        /**
	         *
	         *
	         *
	         *
	         *
	         *
	         *
	         *
	         */
	    },

	    processHtmlString: function (str, options) {

	        var o = jsxc.i18n.options;

	        return $(str).each(function () {

	            // localize element itself
	            jsxc.localization._localize($(this), options);

	            // localize childs
	            var elements = $(this).find('[' + o.selectorAttr + ']');
	            elements.each(function () {
	                jsxc.localization._localize($(this), options);
	            });

	        });

	        // return jsxc.i18n.translate($(str));

	        //
	        // return this.each(function () {
	        //     // localize element itself
	        //     jsxc.i18n.localize($(this), options);
	        //
	        //     // localize childs
	        //     var elements = $(this).find('[' + o.selectorAttr + ']');
	        //     elements.each(function () {
	        //         jsxc.i18n.localize($(this), options);
	        //     });
	        // });

	    },

	    _parse: function (ele, key, options) {

	        var o = jsxc.i18n.options;

	        if (key.length === 0) {
	            return;
	        }

	        var attr = 'text';

	        if (key.indexOf('[') === 0) {
	            var parts = key.split(']');
	            key = parts[1];
	            attr = parts[0].substr(1, parts[0].length - 1);
	        }

	        if (key.indexOf(';') === key.length - 1) {
	            key = key.substr(0, key.length - 2);
	        }

	        var optionsToUse;
	        if (attr === 'html') {
	            optionsToUse = o.defaultValueFromContent ? $.extend({defaultValue: ele.html()}, options) : options;
	            ele.html(jsxc.t(key, optionsToUse));
	        } else if (attr === 'text') {
	            optionsToUse = o.defaultValueFromContent ? $.extend({defaultValue: ele.text()}, options) : options;
	            ele.text(jsxc.t(key, optionsToUse));
	        } else if (attr === 'prepend') {
	            optionsToUse = o.defaultValueFromContent ? $.extend({defaultValue: ele.html()}, options) : options;
	            ele.prepend(jsxc.t(key, optionsToUse));
	        } else if (attr === 'append') {
	            optionsToUse = o.defaultValueFromContent ? $.extend({defaultValue: ele.html()}, options) : options;
	            ele.append(jsxc.t(key, optionsToUse));
	        } else if (attr.indexOf("data-") === 0) {
	            var dataAttr = attr.substr(("data-").length);
	            optionsToUse = o.defaultValueFromContent ? $.extend({defaultValue: ele.data(dataAttr)}, options) : options;
	            var translated = jsxc.t(key, optionsToUse);
	            //we change into the data cache
	            ele.data(dataAttr, translated);
	            //we change into the dom
	            ele.attr(attr, translated);
	        } else {
	            optionsToUse = o.defaultValueFromContent ? $.extend({defaultValue: ele.attr(attr)}, options) : options;
	            ele.attr(attr, jsxc.t(key, optionsToUse));
	        }
	    },


	    _localize: function (ele, options) {

	        var o = jsxc.i18n.options;

	        var key = ele.attr(o.selectorAttr);
	        if (!key && typeof key !== 'undefined' && key !== false) {
	            key = ele.text() || ele.val();
	        }
	        if (!key) {
	            return;
	        }

	        var target = ele
	            , targetSelector = ele.data("i18n-target");
	        if (targetSelector) {
	            target = ele.find(targetSelector) || ele;
	        }

	        if (!options && o.useDataAttrOptions === true) {
	            options = ele.data("i18n-options");
	        }
	        options = options || {};

	        if (key.indexOf(';') >= 0) {
	            var keys = key.split(';');

	            $.each(keys, function (m, k) {
	                if (k !== '') {
	                    jsxc.localization._parse(target, k, options);
	                }
	            });

	        } else {
	            jsxc.localization._parse(target, key, options);
	        }

	        if (o.useDataAttrOptions === true) {
	            ele.data("i18n-options", options);
	        }
	    }
	};

	/**
	 * Implements Multi-User Chat (XEP-0045).
	 *
	 * @namespace jsxc.muc
	 */
	jsxc.muc = {
	  /** strophe connection */
	  conn : null,

	  /** some constants */
	  CONST : {
	    AFFILIATION : {
	      ADMIN : 'statVisualition',
	      MEMBER : 'member',
	      OUTCAST : 'outcast',
	      OWNER : 'owner',
	      NONE : 'none'
	    }, ROLE : {
	      MODERATOR : 'moderator', PARTICIPANT : 'participant', VISITOR : 'visitor', NONE : 'none'
	    }, ROOMSTATE : {
	      INIT : 0, ENTERED : 1, EXITED : 2, AWAIT_DESTRUCTION : 3, DESTROYED : 4
	    }, ROOMCONFIG : {
	      INSTANT : 'instant'
	    }
	  },

	  /**
	   * Initialize muc plugin.
	   *
	   * @private
	   * @memberof jsxc.muc
	   * @param {object} o Options
	   */
	  init : function(o) {
	    var self = jsxc.muc;
	    self.conn = jsxc.xmpp.conn;

	    var options = o || jsxc.options.get('muc');

	    if (!options || typeof options.server !== 'string') {
	      jsxc.debug('Discover muc service');

	      // prosody does not respond, if we send query before initial presence was sent
	      setTimeout(function() {
	        self.conn.disco.items(Strophe.getDomainFromJid(self.conn.jid), null, function(items) {
	          $(items).find('item').each(function() {
	            var jid = $(this).attr('jid');
	            var discovered = false;

	            self.conn.disco.info(jid, null, function(info) {
	              var mucFeature = $(info).find('feature[var="' + Strophe.NS.MUC + '"]');
	              var mucIdentity = $(info).find('identity[category="conference"][type="text"]');

	              if (mucFeature.length > 0 && mucIdentity.length > 0) {

	                jsxc.debug('muc service found', jid);

	                jsxc.options.set('muc', {
	                  server : jid, name : $(info).find('identity').attr('name')
	                });

	                discovered = true;

	                self.init();
	              }
	            });

	            return !discovered;
	          });
	        });
	      }, 1000);

	      return;
	    }

	    if (jsxc.gui.roster.ready) {
	      self.initMenu();
	    } else {
	      $(document).one('ready.roster.jsxc', jsxc.muc.initMenu);
	    }

	    $(document).on('presence.jsxc', jsxc.muc.onPresence);
	    $(document).on('error.presence.jsxc', jsxc.muc.onPresenceError);

	    self.conn.addHandler(self.onGroupchatMessage, null, 'message', 'groupchat');
	    self.conn.addHandler(self.onErrorMessage, null, 'message', 'error');
	    self.conn.muc.roomNames = jsxc.storage.getUserItem('roomNames') || [];
	  },

	  /**
	   * Add entry to menu.
	   *
	   * @memberOf jsxc.muc
	   */
	  initMenu : function() {
	    var li = $('<li>').attr('class', 'jsxc_joinChat jsxc_groupcontacticon').text(
	        jsxc.t('Join_chat'));

	    li.click(jsxc.muc.showJoinChat);

	    $('#jsxc_menu ul .jsxc_about').before(li);
	  },

	  /**
	   * Open join dialog.
	   *
	   * @memberOf jsxc.muc
	   * @param {string} [r] - room jid
	   * @param {string} [p] - room password
	   */
	  showJoinChat : function(r, p) {
	    var self = jsxc.muc;
	    var dialog = jsxc.gui.dialog.open(jsxc.gui.template.get('joinChat'));

	    // hide second step button
	    dialog.find('.jsxc_join').hide();

	    // prepopulate room jid
	    if (typeof r === 'string') {
	      dialog.find('#jsxc_room').val(r);
	    }

	    // prepopulate room password
	    if (typeof p === 'string') {
	      dialog.find('#jsxc_password').val(p);
	    }

	    // display conference server
	    dialog.find('#jsxc_server').val(jsxc.options.get('muc').server);

	    // handle error response
	    var error_handler = function(event, condition, room) {
	      var msg;

	      switch (condition) {
	        case 'not-authorized':
	          // password-protected room
	          msg = jsxc.t('A_password_is_required');
	          break;
	        case 'registration-required':
	          // members-only room
	          msg = jsxc.t('You_are_not_on_the_member_list');
	          break;
	        case 'forbidden':
	          // banned users
	          msg = jsxc.t('You_are_banned_from_this_room');
	          break;
	        case 'conflict':
	          // nickname conflict
	          msg = jsxc.t('Your_desired_nickname_');
	          break;
	        case 'service-unavailable':
	          // max users
	          msg = jsxc.t('The_maximum_number_');
	          break;
	        case 'item-not-found':
	          // locked or non-existing room
	          msg = jsxc.t('This_room_is_locked_');
	          break;
	        case 'not-allowed':
	          // room creation is restricted
	          msg = jsxc.t('You_are_not_allowed_to_create_');
	          break;
	        default:
	          jsxc.warn('Unknown muc error condition: ' + condition);
	          msg = jsxc.t('Error') + ': ' + condition;
	      }

	      // clean up strophe.muc rooms
	      var roomIndex = self.conn.muc.roomNames.indexOf(room);

	      if (roomIndex > -1) {
	        self.conn.muc.roomNames.splice(roomIndex, 1);
	        delete self.conn.muc.rooms[room];
	      }

	      dialog.find('.jsxc_warning').text(msg);
	    };

	    $(document).on('error.muc.jsxc', error_handler);

	    $(document).on('close.dialog.jsxc', function() {
	      $(document).off('error.muc.jsxc', error_handler);
	    });

	    // load room list
	    self.conn.muc.listRooms(jsxc.options.get('muc').server, function(stanza) {

	      // workaround: chrome does not display dropdown arrow for dynamically filled datalists
	      $('#jsxc_roomlist option:last').remove();

	      $(stanza).find('item').each(function() {
	        var r = $('<option>');
	        var rjid = $(this).attr('jid').toLowerCase();
	        var rnode = Strophe.getNodeFromJid(rjid);
	        var rname = $(this).attr('name') || rnode;

	        r.text(rname);
	        r.attr('data-jid', rjid);
	        r.attr('value', rnode);

	        $('#jsxc_roomlist select').append(r);
	      });

	      var set = $(stanza).find('set[xmlns="http://jabber.org/protocol/rsm"]');

	      if (set.length > 0) {
	        var count = set.find('count').text() || '?';

	        dialog.find('.jsxc_inputinfo').removeClass('jsxc_waiting').text(jsxc.t('Could_load_only', {
	          count : count
	        }));
	      } else {
	        dialog.find('.jsxc_inputinfo').hide();
	      }
	    }, function() {
	      jsxc.warn('Could not load rooms');

	      // room autocompletion is a comfort feature, so it is not necessary to inform the user
	      dialog.find('.jsxc_inputinfo').hide();
	    });

	    dialog.find('#jsxc_nickname').attr('placeholder', Strophe.getNodeFromJid(self.conn.jid));

	    dialog.find('#jsxc_bookmark').change(function() {
	      if ($(this).prop('checked')) {
	        $('#jsxc_autojoin').prop('disabled', false);
	        $('#jsxc_autojoin').parent('.checkbox').removeClass('disabled');
	      } else {
	        $('#jsxc_autojoin').prop('disabled', true).prop('checked', false);
	        $('#jsxc_autojoin').parent('.checkbox').addClass('disabled');
	      }
	    });

	    dialog.find('.jsxc_continue').click(function(ev) {
	      ev.preventDefault();

	      var room = ($('#jsxc_room').val()) ? jsxc.jidToBid($('#jsxc_room').val()) : null;
	      var nickname = $('#jsxc_nickname').val() || Strophe.getNodeFromJid(self.conn.jid);
	      var password = $('#jsxc_password').val() || null;

	      if (!room || !room.match(/^[^"&\'\/:<>@\s]+$/i)) {
	        $('#jsxc_room').addClass('jsxc_invalid').keyup(function() {
	          if ($(this).val()) {
	            $(this).removeClass('jsxc_invalid');
	          }
	        });
	        return false;
	      }

	      if (!room.match(/@(.*)$/)) {
	        room += '@' + jsxc.options.get('muc').server;
	      }

	      if (jsxc.xmpp.conn.muc.roomNames.indexOf(room) < 0) {
	        // not already joined

	        var discoReceived = function(roomName, subject) {
	          // we received the room information

	          jsxc.gui.dialog.resize();

	          dialog.find('.jsxc_continue').hide();

	          dialog.find('.jsxc_join').show().effect('highlight', {
	            color : 'green'
	          }, 4000);

	          dialog.find('.jsxc_join').click(function(ev) {
	            ev.preventDefault();

	            var bookmark = $("#jsxc_bookmark").prop("checked");
	            var autojoin = $('#jsxc_autojoin').prop('checked');

	            // clean up
	            jsxc.gui.window.clear(room);
	            jsxc.storage.setUserItem('member', room, {});

	            self.join(room, nickname, password, roomName, subject, bookmark, autojoin);

	            return false;
	          });
	        };

	        dialog.find('.jsxc_msg').append(
	            $('<p>').text(jsxc.t('Loading_room_information')).addClass('jsxc_waiting'));
	        jsxc.gui.dialog.resize();

	        self.conn.disco.info(room, null, function(stanza) {
	          dialog.find('.jsxc_msg').html('<p>' + jsxc.t('This_room_is') + '</p>');

	          var table = $('<table>');

	          $(stanza).find('feature').each(function() {
	            var feature = $(this).attr('var');

	            if (feature !== '' && jsxc.i18n.exists(feature)) {
	              var tr = $('<tr>');

	              $('<td>').text(feature).appendTo(tr);
	              tr.appendTo(table);

	              // Original, removed when shifting i18n from jquery plugin to object
	              // $('<td>').text(jsxc.t(feature + '.keyword')).appendTo(tr);
	              // $('<td>').text(jsxc.t(feature + '.keyword')).appendTo(tr);
	              // $('<td>').text(jsxc.t(feature + '.description')).appendTo(tr);
	              // tr.appendTo(table);
	            }
	          });

	          dialog.find('.jsxc_msg').append(table);

	          var roomName = $(stanza).find('identity').attr('name');
	          var subject = $(stanza).find('field[var="muc#roominfo_subject"]').attr('label');

	          //@TODO display subject, number of occupants, etc.

	          discoReceived(roomName, subject);
	        }, function() {
	          dialog.find('.jsxc_msg').empty();
	          $('<p>').text(jsxc.t('Room_not_found_')).appendTo(dialog.find('.jsxc_msg'));

	          discoReceived();
	        });
	      } else {
	        dialog.find('.jsxc_warning').text(jsxc.t('You_already_joined_this_room'));
	      }

	      return false;
	    });

	    dialog.find('input').keydown(function(ev) {

	      if (ev.which !== 13) {
	        // reset messages and room information

	        dialog.find('.jsxc_warning').empty();

	        if (dialog.find('.jsxc_continue').is(":hidden")) {
	          dialog.find('.jsxc_continue').show();
	          dialog.find('.jsxc_join').hide().off('click');
	          dialog.find('.jsxc_msg').empty();
	          jsxc.gui.dialog.resize();
	        }

	        return;
	      }

	      if (!dialog.find('.jsxc_continue').is(":hidden")) {
	        dialog.find('.jsxc_continue').click();
	      } else {
	        dialog.find('.jsxc_join').click();
	      }
	    });
	  },

	  /**
	   * Request and show room configuration.
	   *
	   * @memberOf jsxc.muc
	   * @param  {string} room - room jid
	   */
	  showRoomConfiguration : function(room) {
	    var self = jsxc.muc;

	    self.conn.muc.configure(room, function(stanza) {

	      var form = Strophe.x.Form.fromXML(stanza);

	      window.f = form;
	      self._showRoomConfiguration(room, form);
	    }, function() {
	      jsxc.debug('Could not load room configuration');

	      //@TODO show error
	    });
	  },

	  /**
	   * Show room configuration.
	   *
	   * @private
	   * @memberOf jsxc.muc
	   * @param  {string} room - room jid
	   * @param  {Strophe.x.Form} config - current room config as Form object
	   */
	  _showRoomConfiguration : function(room, config) {
	    var self = jsxc.muc;
	    var dialog = jsxc.gui.dialog.open(jsxc.muc.helper.formToHTML(config));
	    var form = dialog.find('form');

	    var submit = $('<button>');
	    submit.addClass('btn btn-primary');
	    submit.attr('type', 'submit');
	    submit.text(jsxc.t('Join'));

	    var cancel = $('<button>');
	    cancel.addClass('btn btn-default');
	    cancel.attr('type', 'button');
	    cancel.text(jsxc.t('Cancel'));

	    var formGroup = $('<div>');
	    formGroup.addClass('form-group');
	    $('<div>').addClass('col-sm-offset-6 col-sm-6').appendTo(formGroup);
	    formGroup.find('>div').append(cancel);
	    formGroup.find('>div').append(submit);

	    form.append(formGroup);

	    form.submit(function(ev) {
	      ev.preventDefault();

	      var config = Strophe.x.Form.fromHTML(form.get(0));
	      self.conn.muc.saveConfiguration(room, config, function() {
	        jsxc.storage.updateUserItem('buddy', room, 'config', config);

	        jsxc.debug('Room configuration saved.');
	      }, function() {
	        jsxc.warn('Could not save room configuration.');

	        //@TODO display error
	      });

	      jsxc.gui.dialog.close();

	      return false;
	    });

	    cancel.click(function() {
	      self.conn.muc.cancelConfigure(room);

	      jsxc.gui.dialog.close();
	    });
	  },

	  /**
	   * Join the given room.
	   *
	   * @memberOf jsxc.muc
	   * @param {string} room Room jid
	   * @param {string} nickname Desired nickname
	   * @param {string} [password] Password
	   * @param {string} [roomName] Room alias
	   * @param {string} [subject] Current subject
	   */
	  join : function(room, nickname, password, roomName, subject, bookmark, autojoin,
	      additionnalDatas) {

	    var self = jsxc.muc;

	    var datas = {
	      jid : room,
	      name : roomName || room,
	      sub : 'both',
	      type : 'groupchat',
	      state : self.CONST.ROOMSTATE.INIT,
	      subject : subject,
	      bookmarked : bookmark || false,
	      autojoin : autojoin || false,
	      nickname : nickname,
	      config : null
	    };

	    if (additionnalDatas) {
	      $.extend(datas, additionnalDatas);
	    }

	    // save room configuration in localstorage
	    jsxc.storage.setUserItem('buddy', room, datas);

	    // join room
	    jsxc.xmpp.conn.muc.join(room, nickname, null, null, null, password);

	    // save bookmark
	    if (bookmark) {
	      jsxc.xmpp.bookmarks.add(room, roomName, nickname, autojoin);
	    }
	  },

	  /**
	   * Leave given room.
	   *
	   * @memberOf jsxc.muc
	   * @param {string} room Room jid
	   */
	  leave : function(room) {
	    var self = jsxc.muc;
	    var own = jsxc.storage.getUserItem('ownNicknames') || {};
	    var data = jsxc.storage.getUserItem('buddy', room) || {};

	    if (data.state === self.CONST.ROOMSTATE.ENTERED) {
	      self.conn.muc.leave(room, own[room], function() {
	        self.onExited(room);
	      });
	    } else {
	      self.onExited(room);
	    }
	  },

	  /**
	   * Clean up after we exited a room.
	   *
	   * @private
	   * @memberOf jsxc.muc
	   * @param {string} room Room jid
	   */
	  onExited : function(room) {
	    var self = jsxc.muc;
	    var own = jsxc.storage.getUserItem('ownNicknames') || {};
	    var roomdata = jsxc.storage.getUserItem('buddy', room) || {};

	    jsxc.storage.setUserItem('roomNames', self.conn.muc.roomNames);

	    delete own[room];
	    jsxc.storage.setUserItem('ownNicknames', own);
	    jsxc.storage.removeUserItem('member', room);
	    jsxc.storage.removeUserItem('chat', room);

	    jsxc.gui.window.close(room);

	    jsxc.storage.updateUserItem('buddy', room, 'state', self.CONST.ROOMSTATE.EXITED);

	    if (!roomdata.bookmarked) {
	      jsxc.gui.roster.purge(room);
	    }
	  },

	  /**
	   * Destroy the given room.
	   *
	   * @memberOf jsxc.muc
	   * @param {string} room Room jid
	   * @param {function} handler_cb Function to handle the successful destruction
	   * @param {function} error_cb Function to handle an error
	   */
	  destroy : function(room, handler_cb, error_cb) {
	    var self = jsxc.muc;
	    var roomdata = jsxc.storage.getUserItem('buddy', room);

	    jsxc.storage.updateUserItem('buddy', room, 'state', self.CONST.ROOMSTATE.AWAIT_DESTRUCTION);
	    jsxc.gui.window.postMessage({
	      bid : room, direction : jsxc.Message.SYS, msg : jsxc.t('This_room_will_be_closed')
	    });

	    var iq = $iq({
	      to : room, type : "set"
	    }).c("query", {
	      xmlns : Strophe.NS.MUC_OWNER
	    }).c("destroy");

	    jsxc.muc.conn.sendIQ(iq.tree(), handler_cb, error_cb);

	    if (roomdata.bookmarked) {
	      jsxc.xmpp.bookmarks.delete(room);
	    }
	  },

	  /**
	   * Close the given room.
	   *
	   * @memberOf jsxc.muc
	   * @param room Room jid
	   */
	  close : function(room) {
	    var self = jsxc.muc;
	    var roomdata = jsxc.storage.getUserItem('buddy', room) || {};

	    self.emptyMembers(room);

	    var roomIndex = self.conn.muc.roomNames.indexOf(room);

	    if (roomIndex > -1) {
	      self.conn.muc.roomNames.splice(roomIndex, 1);
	      delete self.conn.muc.rooms[room];
	    }

	    jsxc.storage.setUserItem('roomNames', self.conn.muc.roomNames);

	    if (roomdata.state === self.CONST.ROOMSTATE.AWAIT_DESTRUCTION) {
	      self.onExited(room);
	    }

	    roomdata.state = self.CONST.ROOMSTATE.DESTROYED;

	    jsxc.storage.setUserItem('buddy', room, roomdata);
	  },

	  /**
	   * Init group chat window.
	   *
	   * @private
	   * @memberOf jsxc.muc
	   * @param event Event
	   * @param {jQuery} win Window object
	   */
	  initWindow : function(event, win) {
	    var self = jsxc.muc;

	    if (!jsxc.xmpp.conn) {
	      $(document).one('attached.jsxc', function() {
	        self.initWindow(null, win);
	      });
	      return;
	    }

	    var data = win.data();
	    var bid = jsxc.jidToBid(data.jid);
	    var roomdata = jsxc.storage.getUserItem('buddy', bid);

	    if (roomdata.type !== 'groupchat') {
	      return;
	    }

	    win.addClass('jsxc_groupchat');

	    var own = jsxc.storage.getUserItem('ownNicknames') || {};
	    var ownNickname = own[bid];
	    var mlIcon = $('<div class="jsxc_members"></div>');

	    win.find('.jsxc_tools > .jsxc_settings').after(mlIcon);

	    var ml = $('<div class="jsxc_memberlist"><ul></ul></div>');
	    win.find('.jsxc_fade').prepend(ml);

	    ml.on('wheel', function(ev) {
	      jsxc.muc.scrollMemberListBy(bid, (ev.originalEvent.wheelDelta > 0) ? 50 : -50);
	    });

	    // toggle member list
	    var toggleMl = function(ev) {
	      if (ev) {
	        ev.preventDefault();
	      }

	      var slimOptions = {};
	      var ul = ml.find('ul:first');
	      var slimHeight = null;

	      ml.toggleClass('jsxc_expand');

	      if (ml.hasClass('jsxc_expand')) {
	        $('body').click();
	        $('body').one('click', toggleMl);

	        ul.mouseleave(function() {
	          ul.data('timer', window.setTimeout(toggleMl, 2000));
	        }).mouseenter(function() {
	          window.clearTimeout(ul.data('timer'));
	        }).css('left', '0px');

	        var maxHeight = win.find(".jsxc_textarea").height() * 0.8;
	        var innerHeight = ml.find('ul').height() + 3;
	        slimHeight = (innerHeight > maxHeight) ? maxHeight : innerHeight;

	        slimOptions = {
	          distance : '3px',
	          height : slimHeight + 'px',
	          width : '100%',
	          color : '#fff',
	          opacity : '0.5'
	        };

	        ml.css('height', slimHeight + 'px');
	      } else {
	        slimOptions = {
	          destroy : true
	        };

	        ul.attr('style', '');
	        ml.css('height', '');

	        window.clearTimeout(ul.data('timer'));
	        $('body').off('click', null, toggleMl);
	        ul.off('mouseleave mouseenter');
	      }

	      ul.slimscroll(slimOptions);

	      return false;
	    };

	    mlIcon.click(toggleMl);

	    win.on('resize', function() {
	      // update member list position
	      jsxc.muc.scrollMemberListBy(bid, 0);
	    });

	    var destroy = $('<a>');
	    destroy.text(jsxc.t('Destroy'));
	    destroy.addClass('jsxc_destroy');
	    destroy.hide();
	    destroy.click(function() {
	      self.destroy(bid);
	    });

	    win.find('.jsxc_settings ul').append($('<li>').append(destroy));

	    if (roomdata.state > self.CONST.ROOMSTATE.INIT) {
	      var member = jsxc.storage.getUserItem('member', bid) || {};

	      $.each(member, function(nickname, val) {
	        self.insertMember(bid, nickname, val);

	        if (nickname === ownNickname && val.affiliation === self.CONST.AFFILIATION.OWNER) {
	          destroy.show();
	        }
	      });
	    }

	    var leave = $('<a>');
	    leave.text(jsxc.t('Leave'));
	    leave.addClass('jsxc_leave');
	    leave.click(function() {
	      self.leave(bid);
	    });

	    win.find('.jsxc_settings ul').append($('<li>').append(leave));
	  },

	  /**
	   * Triggered on incoming presence stanzas.
	   *
	   * @private
	   * @memberOf jsxc.muc
	   * @param event
	   * @param {string} from Jid
	   * @param {integer} status Online status between 0 and 5
	   * @param {string} presence Presence stanza
	   */
	  onPresence : function(event, from, status, presence) {
	    
	    if(!from){
	      return true;
	    }

	    var self = jsxc.muc;
	    var room = jsxc.jidToBid(from);
	    var roomdata = jsxc.storage.getUserItem('buddy', room);
	    var xdata = $(presence).find('x[xmlns^="' + Strophe.NS.MUC + '"]');

	    if (self.conn.muc.roomNames.indexOf(room) < 0 || xdata.length === 0) {
	      return true;
	    }

	    var res = Strophe.getResourceFromJid(from) || '';
	    var nickname = Strophe.unescapeNode(res);
	    var own = jsxc.storage.getUserItem('ownNicknames') || {};
	    var member = jsxc.storage.getUserItem('member', room) || {};
	    var codes = [];

	    xdata.find('status').each(function() {
	      var code = $(this).attr('code');

	      jsxc.debug('[muc][code]', code);

	      codes.push(code);
	    });

	    if (roomdata.state === self.CONST.ROOMSTATE.INIT) {
	      // successfully joined

	      jsxc.storage.setUserItem('roomNames', jsxc.xmpp.conn.muc.roomNames);

	      if (jsxc.gui.roster.getItem(room).length === 0) {
	        var bl = jsxc.storage.getUserItem('buddylist');
	        bl.push(room);
	        jsxc.storage.setUserItem('buddylist', bl);

	        jsxc.gui.roster.add(room);
	      }

	      if ($('#jsxc_dialog').length > 0) {
	        // User joined the room manually
	        jsxc.gui.window.open(room);
	        jsxc.gui.dialog.close();
	      }
	    }

	    var jid = xdata.find('item').attr('jid') || null;

	    if (status === 0) {
	      if (xdata.find('destroy').length > 0) {
	        // room has been destroyed
	        member = {};

	        jsxc.gui.window.postMessage({
	          bid : room, direction : jsxc.Message.SYS, msg : jsxc.t('This_room_has_been_closed')
	        });

	        self.close(room);
	      } else {
	        delete member[nickname];

	        self.removeMember(room, nickname);

	        var newNickname = xdata.find('item').attr('nick');

	        if (codes.indexOf('303') > -1 && newNickname) {
	          // user changed his nickname

	          newNickname = Strophe.unescapeNode(newNickname);

	          // prevent to display enter message
	          member[newNickname] = {};

	          jsxc.gui.window.postMessage({
	            bid : room, direction : jsxc.Message.SYS, msg : jsxc.t('is_now_known_as', {
	              oldNickname : nickname, newNickname : newNickname, escapeInterpolation : true
	            })
	          });
	        } else if (codes.length === 0 || (codes.length === 1 && codes.indexOf('110') > -1)) {
	          // normal user exit
	          jsxc.gui.window.postMessage({
	            bid : room, direction : jsxc.Message.SYS, msg : jsxc.t('left_the_building', {
	              nickname : nickname, escapeInterpolation : true
	            })
	          });
	        }
	      }
	    } else {
	      // new member joined

	      if (!member[nickname] && own[room]) {
	        jsxc.gui.window.postMessage({
	          bid : room, direction : jsxc.Message.SYS, msg : jsxc.t('entered_the_room', {
	            nickname : nickname, escapeInterpolation : true
	          })
	        });
	      }

	      member[nickname] = {
	        jid : jid,
	        status : status,
	        roomJid : from,
	        affiliation : xdata.find('item').attr('affiliation'),
	        role : xdata.find('item').attr('role')
	      };

	      self.insertMember(room, nickname, member[nickname]);
	    }

	    jsxc.storage.setUserItem('member', room, member);

	    $.each(codes, function(index, code) {
	      // call code functions and trigger event

	      if (typeof self.onStatus[code] === 'function') {
	        self.onStatus[code].call(this, room, nickname, member[nickname] || {}, xdata);
	      }

	      $(document).trigger('status.muc.jsxc',
	          [code, room, nickname, member[nickname] || {}, presence]);
	    });

	    return true;
	  },

	  /**
	   * Handle group chat presence errors.
	   *
	   * @memberOf jsxc.muc
	   * @param event
	   * @param {string} from Jid
	   * @param {string} presence Presence stanza
	   * @returns {Boolean} Returns true on success
	   */
	  onPresenceError : function(event, from, presence) {
	    
	    if(!from){
	      return true;
	    }
	    
	    var self = jsxc.muc;
	    var xdata = $(presence).find('x[xmlns="' + Strophe.NS.MUC + '"]');
	    var room = jsxc.jidToBid(from);

	    if (xdata.length === 0 || self.conn.muc.roomNames.indexOf(room) < 0) {
	      return true;
	    }

	    var error = $(presence).find('error');
	    var condition = error.children()[0].tagName;

	    jsxc.debug('[muc][error]', condition);

	    $(document).trigger('error.muc.jsxc', [condition, room]);

	    return true;
	  },

	  /**
	   * Handle status codes. Every function gets room jid, nickname, member data and xdata.
	   *
	   * @memberOf jsxc.muc
	   */
	  onStatus : {

	    /** Inform user that presence refers to itself */
	    110 : function(room, nickname, data) {

	      var self = jsxc.muc;
	      var own = jsxc.storage.getUserItem('ownNicknames') || {};

	      own[room] = nickname;
	      jsxc.storage.setUserItem('ownNicknames', own);

	      if (data.affiliation === self.CONST.AFFILIATION.OWNER) {
	        jsxc.gui.window.get(room).find('.jsxc_destroy').show();
	      }

	      var roomdata = jsxc.storage.getUserItem('buddy', room);

	      if (roomdata.state === self.CONST.ROOMSTATE.INIT) {
	        roomdata.state = self.CONST.ROOMSTATE.ENTERED;

	        jsxc.storage.setUserItem('buddy', room, roomdata);
	      }
	    },
	    /** Inform occupants that room logging is now enabled */
	    170 : function(room) {
	      jsxc.gui.window.postMessage({
	        bid : room, direction : jsxc.Message.SYS, msg : jsxc.t('Room_logging_is_enabled')
	      });
	    },
	    /** Inform occupants that room logging is now disabled */
	    171 : function(room) {
	      jsxc.gui.window.postMessage({
	        bid : room, direction : jsxc.Message.SYS, msg : jsxc.t('Room_logging_is_disabled')
	      });
	    },
	    /** Inform occupants that the room is now non-anonymous */
	    172 : function(room) {
	      jsxc.gui.window.postMessage({
	        bid : room, direction : jsxc.Message.SYS, msg : jsxc.t('Room_is_now_non-anoymous')
	      });
	    },
	    /** Inform occupants that the room is now semi-anonymous */
	    173 : function(room) {
	      jsxc.gui.window.postMessage({
	        bid : room, direction : jsxc.Message.SYS, msg : jsxc.t('Room_is_now_semi-anonymous')
	      });
	    },
	    /** Inform user that a new room has been created */
	    201 : function(room) {

	      var self = jsxc.muc;
	      var roomdata = jsxc.storage.getUserItem('buddy', room) || {};

	      if (roomdata.autojoin && roomdata.config === self.CONST.ROOMCONFIG.INSTANT) {
	        self.conn.muc.createInstantRoom(room);
	      } else if (roomdata.autojoin && typeof roomdata.config !== 'undefined' &&
	          roomdata.config !== null) {
	        self.conn.muc.saveConfiguration(room, roomdata.config, function() {
	          jsxc.debug('Cached room configuration saved.');
	        }, function() {
	          jsxc.warn('Could not save cached room configuration.');

	          //@TODO display error
	        });
	      } else {

	        // launch configuration of room
	        self.conn.muc.configure(room, function(stanza) {
	              self._configureChatRoom(room, stanza);
	            },

	            // fail loading room configuration
	            function(response) {

	              jsxc.warn("Error while loading room configuration", response);

	              jsxc.gui.feedback("Erreur lors de la configuration de la discussion");

	            });

	      }

	    },
	    /** Inform user that he or she has been banned */
	    301 : function(room, nickname, data, xdata) {
	      var own = jsxc.storage.getUserItem('ownNicknames') || {};

	      if (own[room] === nickname) {
	        jsxc.muc.close(room);
	        jsxc.gui.window.postMessage({
	          bid : room, direction : jsxc.Message.SYS, msg : jsxc.t('muc_removed_banned')
	        });

	        jsxc.muc.postReason(room, xdata);
	      } else {
	        jsxc.gui.window.postMessage({
	          bid : room, direction : jsxc.Message.SYS, msg : jsxc.t('muc_removed_info_banned', {
	            nickname : nickname, escapeInterpolation : true
	          })
	        });
	      }
	    },
	    /** Inform user that he or she has been kicked */
	    307 : function(room, nickname, data, xdata) {
	      var own = jsxc.storage.getUserItem('ownNicknames') || {};

	      if (own[room] === nickname) {
	        jsxc.muc.close(room);
	        jsxc.gui.window.postMessage({
	          bid : room, direction : jsxc.Message.SYS, msg : jsxc.t('muc_removed_kicked')
	        });

	        jsxc.muc.postReason(room, xdata);
	      } else {
	        jsxc.gui.window.postMessage({
	          bid : room, direction : jsxc.Message.SYS, msg : jsxc.t('muc_removed_info_kicked', {
	            nickname : nickname, escapeInterpolation : true
	          })
	        });
	      }
	    },
	    /** Inform user that he or she is beeing removed from the room because of an affiliation change */
	    321 : function(room, nickname) {
	      var own = jsxc.storage.getUserItem('ownNicknames') || {};

	      if (own[room] === nickname) {
	        jsxc.muc.close(room);

	        jsxc.gui.window.postMessage({
	          bid : room, direction : jsxc.Message.SYS, msg : jsxc.t('muc_removed_affiliation')
	        });
	      } else {
	        jsxc.gui.window.postMessage({
	          bid : room, direction : jsxc.Message.SYS, msg : jsxc.t('muc_removed_info_affiliation', {
	            nickname : nickname, escapeInterpolation : true
	          })
	        });
	      }
	    },
	    /**
	     * Inform user that he or she is beeing removed from the room because the room has been
	     * changed to members-only and the user is not a member
	     */
	    322 : function(room, nickname) {
	      var own = jsxc.storage.getUserItem('ownNicknames') || {};

	      if (own[room] === nickname) {
	        jsxc.muc.close(room);
	        jsxc.gui.window.postMessage({
	          bid : room, direction : jsxc.Message.SYS, msg : jsxc.t('muc_removed_membersonly')
	        });
	      } else {
	        jsxc.gui.window.postMessage({
	          bid : room, direction : jsxc.Message.SYS, msg : jsxc.t('muc_removed_info_membersonly', {
	            nickname : nickname, escapeInterpolation : true
	          })
	        });
	      }
	    },
	    /**
	     * Inform user that he or she is beeing removed from the room because the MUC service
	     * is being shut down
	     */
	    332 : function(room) {
	      jsxc.muc.close(room);
	      jsxc.gui.window.postMessage({
	        bid : room, direction : jsxc.Message.SYS, msg : jsxc.t('muc_removed_shutdown')
	      });
	    }
	  },

	  /**
	   * Configure a chat room after creation
	   * @param stanza
	   * @param room
	   */
	  _configureChatRoom : function(room, stanza) {

	    var self = jsxc.muc;
	    var roomdata = jsxc.storage.getUserItem('buddy', room) || {};

	    // define fields
	    var fieldValues = {
	      "muc#roomconfig_roomname" : roomdata.name,
	      "muc#roomconfig_roomdesc" : roomdata.subject,
	      "muc#roomconfig_changesubject" : "0",
	      "muc#roomconfig_maxusers" : "0",
	      "muc#roomconfig_presencebroadcast" : "visitor",
	      "muc#roomconfig_publicroom" : "0",
	      "muc#roomconfig_persistentroom" : "1",
	      "muc#roomconfig_moderatedroom" : "0",
	      "muc#roomconfig_membersonly" : "0",
	      "muc#roomconfig_allowinvites" : "1",
	      "muc#roomconfig_passwordprotectedroom" : "0",
	      "muc#roomconfig_whois" : "anyone",
	      "muc#roomconfig_enablelogging" : "1",
	      "x-muc#roomconfig_canchangenick" : "0",
	      "x-muc#roomconfig_registration" : "0", // "muc#roomconfig_roomadmins": "",
	      // "muc#roomconfig_roomowners": "",
	    };

	    // parse form from stanza
	    var form = Strophe.x.Form.fromXML(stanza);

	    // if no form, take default
	    if (!form) {
	      form = fieldValues;
	    } else {

	      $.each(form.fields, function(index, item) {

	        if (typeof fieldValues[item.var] !== "undefined") {
	          item.values = [fieldValues[item.var]];
	        }

	      });

	    }
	    // self.conn.muc.cancelConfigure(room);

	    // send configuration to server
	    self.conn.muc.saveConfiguration(room, form, function() {

	          // save configuration
	          jsxc.storage.updateUserItem('buddy', room, 'config', form);

	          // invite users
	          self.inviteParticipants(room, roomdata.initialParticipants);
	        },

	        // configuration fail
	        function(response) {

	          jsxc.warn("Error while configuring room", response);

	          jsxc.gui.feedback("Erreur lors de la création de la discussion");

	        });
	  },

	  /**
	   * Invite participants to a chat room
	   * @param room
	   */
	  inviteParticipants : function(room, jidArray) {

	    var self = jsxc.muc;

	    $.each(jidArray, function(index, jid) {

	      jsxc.stats.addEvent("jsxc.muc.invitation.sent");

	      self.conn.muc.directInvite(room, jid,
	          "Vous êtes invité aux chateau de Versaaaaaaiiiillles !");
	    });
	  },

	  /**
	   * Extract reason from xdata and if available post it to room.
	   *
	   * @memberOf jsxc.muc
	   * @param {string} room Room jid
	   * @param {jQuery} xdata Xdata
	   */
	  postReason : function(room, xdata) {
	    var actor = {
	      name : xdata.find('actor').attr('nick'), jid : xdata.find('actor').attr('jid')
	    };
	    var reason = xdata.find('reason').text();

	    if (reason !== '') {
	      reason = jsxc.t('Reason') + ': ' + reason;

	      if (typeof actor.name === 'string' || typeof actor.jid === 'string') {
	        jsxc.gui.window.postMessage({
	          bid : room, direction : jsxc.Message.IN, msg : reason, sender : actor
	        });
	      } else {
	        jsxc.gui.window.postMessage({
	          bid : room, direction : jsxc.Message.SYS, msg : reason
	        });
	      }
	    }
	  },

	  /**
	   * Insert member to room member list.
	   *
	   * @memberOf jsxc.muc
	   * @param {string} room Room jid
	   * @param {string} nickname Nickname
	   * @param {string} memberdata Member data
	   */
	  insertMember : function(room, nickname, memberdata) {
	    var self = jsxc.muc;
	    var win = jsxc.gui.window.get(room);
	    var jid = memberdata.jid;
	    var m = win.find('.jsxc_memberlist li[data-nickname="' + nickname + '"]');

	    if (m.length === 0) {
	      var title = jsxc.escapeHTML(nickname);

	      m = $('<li><div class="jsxc_avatar"></div><div class="jsxc_name"/></li>');
	      m.attr('data-nickname', nickname);

	      win.find('.jsxc_memberlist ul').append(m);

	      if (typeof jid === 'string') {
	        m.find('.jsxc_name').text(jsxc.jidToBid(jid));
	        m.attr('data-bid', jsxc.jidToBid(jid));
	        title = title + '\n' + jsxc.jidToBid(jid);

	        var data = jsxc.storage.getUserItem('buddy', jsxc.jidToBid(jid));

	        if (data !== null && typeof data === 'object') {
	          jsxc.gui.updateAvatar(m, jsxc.jidToBid(jid), data.avatar);
	        } else if (jsxc.jidToBid(jid) === jsxc.jidToBid(self.conn.jid)) {
	          jsxc.gui.updateAvatar(m, jsxc.jidToBid(jid), 'own');
	        }
	      } else {
	        m.find('.jsxc_name').text(nickname);

	        jsxc.gui.avatarPlaceholder(m.find('.jsxc_avatar'), nickname);
	      }

	      m.attr('title', title);
	    }
	  },

	  /**
	   * Remove member from room member list.
	   *
	   * @memberOf jsxc.muc
	   * @param {string} room Room jid
	   * @param {string} nickname Nickname
	   */
	  removeMember : function(room, nickname) {
	    var win = jsxc.gui.window.get(room);
	    var m = win.find('.jsxc_memberlist li[data-nickname="' + nickname + '"]');

	    if (m.length > 0) {
	      m.remove();
	    }
	  },

	  /**
	   * Scroll or update member list position.
	   *
	   * @memberOf jsxc.muc
	   * @param {string} room Room jid
	   * @param {integer} offset =0: update position; >0: Scroll to left; <0: Scroll to right
	   */
	  scrollMemberListBy : function(room, offset) {
	    var win = jsxc.gui.window.get(room);

	    if (win.find('.jsxc_memberlist').hasClass('jsxc_expand')) {
	      return;
	    }

	    var el = win.find('.jsxc_memberlist ul:first');
	    var scrollWidth = el.width();
	    var width = win.find('.jsxc_memberlist').width();
	    var left = parseInt(el.css('left'));

	    left = (isNaN(left)) ? 0 - offset : left - offset;

	    if (scrollWidth < width || left > 0) {
	      left = 0;
	    } else if (left < width - scrollWidth) {
	      left = width - scrollWidth;
	    }

	    el.css('left', left + 'px');
	  },

	  /**
	   * Empty member list.
	   *
	   * @memberOf jsxc.muc
	   * @param {string} room Room jid
	   */
	  emptyMembers : function(room) {
	    var win = jsxc.gui.window.get(room);

	    win.find('.jsxc_memberlist').empty();

	    jsxc.storage.setUserItem('member', room, {});
	  },

	  /**
	   * Handle incoming group chat message.
	   *
	   * @private
	   * @memberOf jsxc.muc
	   * @param {string} message Message stanza
	   * @returns {boolean} True on success
	   */
	  onGroupchatMessage : function(message) {
	    var id = $(message).attr('id');

	    if (id && jsxc.el_exists(jsxc.Message.getDOM(id))) {
	      // ignore own incoming messages
	      return true;
	    }

	    var from = $(message).attr('from');
	    var body = $(message).find('body:first').text();
	    var room = jsxc.jidToBid(from);
	    var nickname = Strophe.unescapeNode(Strophe.getResourceFromJid(from));

	    if (body !== '') {
	      var delay = $(message).find('delay[xmlns="urn:xmpp:delay"]');
	      var stamp = (delay.length > 0) ? new Date(delay.attr('stamp')) : new Date();
	      stamp = stamp.getTime();

	      var member = jsxc.storage.getUserItem('member', room) || {};

	      var sender = {};
	      sender.name = nickname;

	      if (member[nickname] && typeof member[nickname].jid === 'string') {
	        sender.jid = member[nickname].jid;
	      }

	      jsxc.gui.window.init(room);

	      jsxc.gui.window.postMessage({
	        bid : room, direction : jsxc.Message.IN, msg : body, stamp : stamp, sender : sender
	      });
	    }

	    var subject = $(message).find('subject');

	    if (subject.length > 0) {
	      var roomdata = jsxc.storage.getUserItem('buddy', room);

	      roomdata.subject = subject.text();

	      jsxc.storage.setUserItem('buddy', room, roomdata);

	      jsxc.gui.window.postMessage({
	        bid : room, direction : jsxc.Message.SYS, msg : jsxc.t('changed_subject_to', {
	          nickname : nickname, subject : subject.text()
	        })
	      });
	    }

	    return true;
	  },

	  /**
	   * Handle group chat error message.
	   *
	   * @private
	   * @memberOf jsxc.muc
	   * @param {string} message Message stanza
	   */
	  onErrorMessage : function(message) {
	    var room = jsxc.jidToBid($(message).attr('from'));

	    if (jsxc.gui.window.get(room).length === 0) {
	      return true;
	    }

	    if ($(message).find('item-not-found').length > 0) {
	      jsxc.gui.window.postMessage({
	        bid : room, direction : jsxc.Message.SYS, msg : jsxc.t('message_not_send_item-not-found')
	      });
	    } else if ($(message).find('forbidden').length > 0) {
	      jsxc.gui.window.postMessage({
	        bid : room, direction : jsxc.Message.SYS, msg : jsxc.t('message_not_send_forbidden')
	      });
	    } else if ($(message).find('not-acceptable').length > 0) {
	      jsxc.gui.window.postMessage({
	        bid : room, direction : jsxc.Message.SYS, msg : jsxc.t('message_not_send_not-acceptable')
	      });
	    } else {
	      jsxc.gui.window.postMessage({
	        bid : room, direction : jsxc.Message.SYS, msg : jsxc.t('message_not_send')
	      });
	    }

	    jsxc.debug('[muc] error message for ' + room, $(message).find('error')[0]);

	    return true;
	  },

	  /**
	   * Launch creation of a new conversation with buddy array.
	   *
	   * @param buddiesId
	   */
	  createNewConversationWith : function(buddies, title, subject) {

	    jsxc.stats.addEvent("jsxc.muc.conversation.new");

	    var d = new Date();

	    // prepare title of room. If no title, using all usernames sorted.
	    if (!title || title.length < 1) {

	      // create username array
	      var userNodeArray = [jsxc.xmpp.getCurrentNode()];
	      $.each(buddies, function(index, item) {
	        userNodeArray.push(Strophe.getNodeFromJid(item));
	      });
	      userNodeArray.sort();

	      title = userNodeArray.join(", ");

	      title += " " + d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getUTCFullYear();

	    }

	    // prepare id of room, all in lower case, otherwise problem will appear with local storage
	    var datestamp = d.toISOString().replace(/[^0-9]+/gi, "");

	    var roomjid = datestamp + "_" + jsxc.xmpp.getCurrentNode() + "@" +
	        jsxc.options.get('muc').server;

	    // all in lower case, otherwise problem will appear with local storage
	    // all in lower case, otherwise problem will appear with local storage
	    // all in lower case, otherwise problem will appear with local storage
	    roomjid = roomjid.toLowerCase();

	    // save initial participants for invite them, without current user
	    var initialParticipants = [];
	    $.each(buddies, function(index, item) {
	      initialParticipants.push(item);
	    });

	    // clean up
	    jsxc.gui.window.clear(roomjid);
	    jsxc.storage.setUserItem('member', roomjid, {});

	    jsxc.muc.join(roomjid, jsxc.xmpp.getCurrentNode(), null, title, subject || '', true, true,
	        {"initialParticipants" : initialParticipants});

	    // open window
	    jsxc.gui.window.open(roomjid);
	  },

	  /**
	   * Prepare group chat roster item.
	   *
	   * @private
	   * @memberOf jsxc.muc
	   * @param event
	   * @param {string} room Room jid
	   * @param {object} data Room data
	   * @param {jQuery} bud Roster item
	   */
	  onAddRoster : function(event, room, data, bud) {
	    var self = jsxc.muc;

	    if (data.type !== 'groupchat') {
	      return;
	    }

	    var bo = $('<a>');
	    $('<span>').addClass('jsxc_icon jsxc_bookmarkicon').appendTo(bo);
	    $('<span>').text(jsxc.t('Bookmark')).appendTo(bo);
	    bo.addClass('jsxc_bookmarkOptions');
	    bo.click(function(ev) {
	      ev.preventDefault();

	      jsxc.xmpp.bookmarks.showDialog(room);

	      return false;
	    });

	    bud.find('.jsxc_menu ul').append($('<li>').append(bo));

	    if (data.bookmarked) {
	      bud.addClass('jsxc_bookmarked');
	    }

	    bud.off('click').click(function() {

	      jsxc.gui.window.open(room);

	      // var data = jsxc.storage.getUserItem('buddy', room);

	      // if (data.state === self.CONST.ROOMSTATE.INIT || data.state ===
	      // self.CONST.ROOMSTATE.EXITED) { self.showJoinChat();
	      // $('#jsxc_room').val(Strophe.getNodeFromJid(data.jid));
	      // $('#jsxc_nickname').val(data.nickname); $('#jsxc_bookmark').prop('checked',
	      // data.bookmarked); $('#jsxc_autojoin').prop('checked', data.autojoin);
	      // $('#jsxc_showJoinChat .jsxc_bookmark').hide(); } else { jsxc.gui.window.open(room); }
	    });

	    bud.find('.jsxc_delete').click(function() {
	      if (data.bookmarked) {
	        jsxc.xmpp.bookmarks.delete(room);
	      }

	      self.leave(room);
	      return false;
	    });
	  },

	  /**
	   * Some helper functions.
	   *
	   * @type {Object}
	   */
	  helper : {
	    /**
	     * Convert x:data form to html.
	     *
	     * @param  {Strophe.x.Form} form - x:data form
	     * @return {jQuery} jQuery representation of x:data field
	     */
	    formToHTML : function(form) {
	      if (!(form instanceof Strophe.x.Form)) {
	        return;
	      }

	      var html = $('<form>');

	      html.attr('data-type', form.type);
	      html.addClass('form-horizontal');

	      if (form.title) {
	        html.append("<h3>" + form.title + "</h3>");
	      }

	      if (form.instructions) {
	        html.append("<p>" + form.instructions + "</p>");
	      }

	      if (form.fields.length > 0) {
	        var i;
	        for (i = 0; i < form.fields.length; i++) {
	          html.append(jsxc.muc.helper.fieldToHtml(form.fields[i]));
	        }
	      }

	      return $('<div>').append(html).html();
	    },

	    /**
	     * Convert x:data field to html.
	     *
	     * @param  {Strophe.x.Field} field - x:data field
	     * @return {html} html representation of x:data field
	     */
	    fieldToHtml : function(field) {
	      var self = field || this;
	      field = null;
	      var el, val, opt, i, o, j, k, txt, line, _ref2;

	      var id = "Strophe.x.Field-" + self['type'] + "-" + self['var'];
	      var html = $('<div>');
	      html.addClass('form-group');

	      if (self.label) {
	        var label = $('<label>');
	        label.attr('for', id);
	        label.addClass('col-sm-6 control-label');
	        label.text(self.label);
	        label.appendTo(html);
	      }

	      switch (self.type.toLowerCase()) {
	        case 'list-single':
	        case 'list-multi':

	          el = $('<select>');
	          if (self.type === 'list-multi') {
	            el.attr('multiple', 'multiple');
	          }

	          for (i = 0; i < self.options.length; i++) {
	            opt = self.options[i];
	            if (!opt) {
	              continue;
	            }
	            o = $(opt.toHTML());

	            for (j = 0; j < self.values; j++) {
	              k = self.values[j];
	              if (k.toString() === opt.value.toString()) {
	                o.attr('selected', 'selected');
	              }
	            }
	            o.appendTo(el);
	          }

	          break;
	        case 'text-multi':
	        case 'jid-multi':
	          el = $("<textarea>");
	          txt = ((function() {
	            var i, _results;
	            _results = [];
	            for (i = 0; i < self.values.length; i++) {
	              line = self.values[i];
	              _results.push(line);
	            }
	            return _results;
	          }).call(this)).join('\n');
	          if (txt) {
	            el.text(txt);
	          }
	          break;
	        case 'text-single':
	        case 'boolean':
	        case 'text-private':
	        case 'hidden':
	        case 'fixed':
	        case 'jid-single':
	          el = $("<input>");

	          if (self.values) {
	            el.attr('value', self.values[0]);
	          }
	          switch (self.type.toLowerCase()) {
	            case 'text-single':
	              el.attr('type', 'text');
	              el.attr('placeholder', self.desc);
	              el.addClass('form-control');
	              break;
	            case 'boolean':
	              el.attr('type', 'checkbox');
	              val = (_ref2 = self.values[0]) != null ?
	                  typeof _ref2.toString === "function" ? _ref2.toString() : void 0 : void 0;
	              if (val && (val === "true" || val === "1")) {
	                el.attr('checked', 'checked');
	              }
	              break;
	            case 'text-private':
	              el.attr('type', 'password');
	              el.addClass('form-control');
	              break;
	            case 'hidden':
	              el.attr('type', 'hidden');
	              break;
	            case 'fixed':
	              el.attr('type', 'text').attr('readonly', 'readonly');
	              el.addClass('form-control');
	              break;
	            case 'jid-single':
	              el.attr('type', 'email');
	              el.addClass('form-control');
	          }
	          break;
	        default:
	          el = $("<input type='text'>");
	      }

	      el.attr('id', id);
	      el.attr('name', self["var"]);

	      if (self.required) {
	        el.attr('required', self.required);
	      }

	      var inner = el;
	      el = $('<div>');
	      el.addClass('col-sm-6');
	      el.append(inner);

	      html.append(el);

	      return html.get(0);
	    }
	  }
	};

	$(document).on('init.window.jsxc', jsxc.muc.initWindow);
	$(document).on('add.roster.jsxc', jsxc.muc.onAddRoster);

	$(document).one('attached.jsxc', function() {
	  jsxc.muc.init();
	});

	$(document).one('connected.jsxc', function() {
	  jsxc.storage.removeUserItem('roomNames');
	  jsxc.storage.removeUserItem('ownNicknames');
	});

	/**
	 * This namespace handle the notice system.
	 *
	 * @namspace jsxc.notice
	 * @memberOf jsxc
	 */
	jsxc.notice = {
	    /** Number of notices. */
	    _num: 0,

	    /**
	     * Loads the saved notices.
	     *
	     * @memberOf jsxc.notice
	     */
	    load: function () {
	        // reset list
	        $('#jsxc_notice ul li').remove();

	        $('#jsxc_roster .jsxc_menu_notif_number').text('');
	        jsxc.notice._num = 0;

	        var saved = jsxc.storage.getUserItem('notices') || [];
	        var key = null;

	        // console.log(jsxc.storage.getUserItem('notices'));

	        for (key in saved) {
	            if (saved.hasOwnProperty(key)) {
	                var val = saved[key];

	                jsxc.notice.add(val.msg, val.description, val.fnName, val.fnParams, key);
	            }
	        }
	    },

	    /**
	     * Add a new notice to the stack;
	     *
	     * @memberOf jsxc.notice
	     * @param msg Header message
	     * @param description Notice description
	     * @param fnName Function name to be called if you open the notice
	     * @param fnParams Array of params for function
	     * @param id Notice id
	     */
	    add: function (msg, description, fnName, fnParams, id) {
	        var nid = id || Date.now();
	        var list = $('#jsxc_notice ul');
	        var notice = $('<li/>');

	        notice.click(function () {
	            jsxc.notice.remove(nid);

	            jsxc.exec(fnName, fnParams);

	            return false;
	        });

	        notice.text(msg + " " + description);
	        notice.attr('title', description || '');
	        notice.attr('data-nid', nid);
	        list.append(notice);

	        $('#jsxc_roster .jsxc_menu_notif_number').text(++jsxc.notice._num);

	        if (!id) {
	            var saved = jsxc.storage.getUserItem('notices') || {};
	            saved[nid] = {
	                msg: msg,
	                description: description,
	                fnName: fnName,
	                fnParams: fnParams
	            };

	            jsxc.storage.setUserItem('notices', saved);

	            jsxc.notification.notify(msg, description || '', null, true, jsxc.CONST.SOUNDS.NOTICE);
	        }
	    },

	    /**
	     * Removes notice from stack
	     *
	     * @memberOf jsxc.notice
	     * @param nid The notice id
	     */
	    remove: function (nid) {
	        var el = $('#jsxc_notice li[data-nid=' + nid + ']');

	        el.remove();
	        $('#jsxc_roster .jsxc_menu_notif_number').text(--jsxc.notice._num || '');

	        var s = jsxc.storage.getUserItem('notices');
	        delete s[nid];
	        jsxc.storage.setUserItem('notices', s);
	    },

	    /**
	     * Check if there is already a notice for the given function name.
	     *
	     * @memberOf jsxc.notice
	     * @param {string} fnName Function name
	     * @returns {boolean} True if there is >0 functions with the given name
	     */
	    has: function (fnName) {
	        var saved = jsxc.storage.getUserItem('notices') || [];
	        var has = false;

	        $.each(saved, function (index, val) {
	            if (val.fnName === fnName) {
	                has = true;

	                return false;
	            }
	        });

	        return has;
	    }
	};

	/**
	 * This namespace handles the Notification API.
	 * 
	 * @namespace jsxc.notification
	 */
	jsxc.notification = {

	   /** Current audio file. */
	   audio: null,

	   /**
	    * Register notification on incoming messages.
	    * 
	    * @memberOf jsxc.notification
	    */
	   init: function() {
	      $(document).on('postmessagein.jsxc', function(event, bid, msg) {
	         msg = (msg && msg.match(/^\?OTR/)) ? jsxc.t('Encrypted_message') : msg;
	         var data = jsxc.storage.getUserItem('buddy', bid);

	         jsxc.notification.notify({
	            title: jsxc.t('New_message_from', {
	               name: data.name
	            }),
	            msg: msg,
	            soundFile: jsxc.CONST.SOUNDS.MSG,
	            source: bid
	         });
	      });
	   },

	   /**
	    * Shows a pop up notification and optional play sound.
	    * 
	    * @param title Title
	    * @param msg Message
	    * @param d Duration
	    * @param force Should message also shown, if tab is visible?
	    * @param soundFile Playing given sound file
	    * @param loop Loop sound file?
	    * @param source Bid which triggered this notification
	    */
	   notify: function(title, msg, d, force, soundFile, loop, source) {
	      if (!jsxc.options.notification || !jsxc.notification.hasPermission()) {
	         return; // notifications disabled
	      }

	      var o;

	      if (title !== null && typeof title === 'object') {
	         o = title;
	      } else {
	         o = {
	            title: title,
	            msg: msg,
	            duration: d,
	            force: force,
	            soundFile: soundFile,
	            loop: loop,
	            source: source
	         };
	      }

	      if (jsxc.hasFocus() && !o.force) {
	         return; // Tab is visible
	      }

	      var icon = o.icon || jsxc.options.root + '/img/XMPP_logo.png';

	      if (typeof o.source === 'string') {
	         var data = jsxc.storage.getUserItem('buddy', o.source);
	         var src = jsxc.storage.getUserItem('avatar', data.avatar);

	         if (typeof src === 'string' && src !== '0') {
	            icon = src;
	         }
	      }

	      jsxc.toNotification = setTimeout(function() {

	         if (typeof o.soundFile === 'string') {
	            jsxc.notification.playSound(o.soundFile, o.loop, o.force);
	         }

	         var popup = new Notification(jsxc.t(o.title), {
	            body: jsxc.t(o.msg),
	            icon: icon
	         });

	         var duration = o.duration || jsxc.options.popupDuration;

	         if (duration > 0) {
	            setTimeout(function() {
	               popup.close();
	            }, duration);
	         }
	      }, jsxc.toNotificationDelay);
	   },

	   /**
	    * Checks if browser has support for notifications and add on chrome to the
	    * default api.
	    * 
	    * @returns {Boolean} True if the browser has support.
	    */
	   hasSupport: function() {
	      if (window.webkitNotifications) {
	         // prepare chrome

	         window.Notification = function(title, opt) {
	            var popup = window.webkitNotifications.createNotification(null, title, opt.body);
	            popup.show();

	            popup.close = function() {
	               popup.cancel();
	            };

	            return popup;
	         };

	         var permission;
	         switch (window.webkitNotifications.checkPermission()) {
	            case 0:
	               permission = jsxc.CONST.NOTIFICATION_GRANTED;
	               break;
	            case 2:
	               permission = jsxc.CONST.NOTIFICATION_DENIED;
	               break;
	            default: // 1
	               permission = jsxc.CONST.NOTIFICATION_DEFAULT;
	         }
	         window.Notification.permission = permission;

	         window.Notification.requestPermission = function(func) {
	            window.webkitNotifications.requestPermission(func);
	         };

	         return true;
	      } else if (window.Notification) {
	         return true;
	      } else {
	         return false;
	      }
	   },

	   /**
	    * Ask user on first incoming message if we should inform him about new
	    * messages.
	    */
	   prepareRequest: function() {

	      if (jsxc.notice.has('gui.showRequestNotification')) {
	         return;
	      }

	      $(document).one('postmessagein.jsxc', function() {
	         setTimeout(function() {
	            jsxc.notice.add(jsxc.t('Notifications') + '?', jsxc.t('Should_we_notify_you_'), 'gui.showRequestNotification');
	         }, 1000);
	      });
	   },

	   /**
	    * Request notification permission.
	    */
	   requestPermission: function() {
	      window.Notification.requestPermission(function(status) {
	         if (window.Notification.permission !== status) {
	            window.Notification.permission = status;
	         }

	         if (jsxc.notification.hasPermission()) {
	            $(document).trigger('notificationready.jsxc');
	         } else {
	            $(document).trigger('notificationfailure.jsxc');
	         }
	      });
	   },

	   /**
	    * Check permission.
	    * 
	    * @returns {Boolean} True if we have the permission
	    */
	   hasPermission: function() {
	      return window.Notification.permission === jsxc.CONST.NOTIFICATION_GRANTED;
	   },

	   /**
	    * Plays the given file.
	    * 
	    * @memberOf jsxc.notification
	    * @param {string} soundFile File relative to the sound directory
	    * @param {boolean} loop True for loop
	    * @param {boolean} force Play even if a tab is visible. Default: false.
	    */
	   playSound: function(soundFile, loop, force) {
	      if (!jsxc.master) {
	         // only master plays sound
	         return;
	      }

	      if (jsxc.options.get('muteNotification') || jsxc.storage.getUserItem('presence') === 'dnd') {
	         // sound mute or own presence is dnd
	         return;
	      }

	      if (jsxc.hasFocus() && !force) {
	         // tab is visible
	         return;
	      }

	      // stop current audio file
	      jsxc.notification.stopSound();

	      var audio = new Audio(jsxc.options.root + '/sound/' + soundFile);
	      audio.loop = loop || false;
	      audio.play();

	      jsxc.notification.audio = audio;
	   },

	   /**
	    * Stop/remove current sound.
	    * 
	    * @memberOf jsxc.notification
	    */
	   stopSound: function() {
	      var audio = jsxc.notification.audio;

	      if (typeof audio !== 'undefined' && audio !== null) {
	         audio.pause();
	         jsxc.notification.audio = null;
	      }
	   },

	   /**
	    * Mute sound.
	    * 
	    * @memberOf jsxc.notification
	    * @param {boolean} external True if triggered from external tab. Default:
	    *        false.
	    */
	   muteSound: function(external) {
	      $('#jsxc_menu .jsxc_muteNotification').text(jsxc.t('Unmute'));

	      if (external !== true) {
	         jsxc.options.set('muteNotification', true);
	      }
	   },

	   /**
	    * Unmute sound.
	    * 
	    * @memberOf jsxc.notification
	    * @param {boolean} external True if triggered from external tab. Default:
	    *        false.
	    */
	   unmuteSound: function(external) {
	      $('#jsxc_menu .jsxc_muteNotification').text(jsxc.t('Mute'));

	      if (external !== true) {
	         jsxc.options.set('muteNotification', false);
	      }
	   }
	};

	/**
	 * Set some options for the chat.
	 *
	 * @namespace jsxc.options
	 */
	jsxc.options = {

	  // REST support
	  rest : {
	    apiName : "", apiBaseUrl : "", apiKey : ""
	  },

	  // Stats support
	  stats : {
	    enabled : false,
	    destinationUrl : "https://domain-without-trailing-slash.net/stats",
	    autosend : true,
	    authorization : "key"
	  },

	  /** name of container application (e.g. owncloud or SOGo) */
	  app_name : 'web applications',

	  /** Timeout for the keepalive signal */
	  timeout : 3000,

	  /** Timeout for the keepalive signal if the master is busy */
	  busyTimeout : 15000,

	  /** OTR options */
	  otr : {
	    enable : true,
	    ERROR_START_AKE : false,
	    debug : false,
	    SEND_WHITESPACE_TAG : true,
	    WHITESPACE_START_AKE : true
	  },

	  /** Etherpad support **/
	  etherpad : {

	    // true or false
	    enabled : false,

	    // ressource like http://server.tld/etherpad_root/
	    ressource : null
	  },

	  /** xmpp options */
	  xmpp : {
	    /** BOSH url */
	    url : null,

	    /** XMPP JID*/
	    jid : null,

	    /** XMPP domain */
	    domain : null,

	    /** Domain for user search, XEP 0055*/
	    searchDomain : null,

	    /** XMPP password */
	    password : null,

	    /** session id */
	    sid : null,

	    /** request id */
	    rid : null,

	    /** True: Allow user to overwrite xmpp settings */
	    overwrite : false,

	    /** @deprecated since v2.1.0. Use now loginForm.enable. */
	    onlogin : null
	  },

	  /** default xmpp priorities */
	  priority : {
	    online : 0, chat : 0, away : 0, xa : 0, dnd : 0
	  },

	  /**
	   * This function is called if a login form was found, but before any
	   * modification is done to it.
	   *
	   * @memberOf jsxc.options
	   * @function
	   */
	  formFound : null,

	  /** If all 3 properties are set and enable is true, the login form is used */
	  loginForm : {
	    /** False, disables login through login form */
	    enable : true,

	    /** jquery object from form */
	    form : null,

	    /** jquery object from input element which contains the jid */
	    jid : null,

	    /** jquery object from input element which contains the password */
	    pass : null,

	    /** manipulate JID from input element */
	    preJid : function(jid) {
	      return jid;
	    },

	    /**
	     * Action after login was called: dialog [String] Show wait dialog, false [boolean] |
	     * quiet [String] Do nothing
	     */
	    onConnecting : 'dialog',

	    /**
	     * Action after connected: submit [String] Submit form, false [boolean] Do
	     * nothing, continue [String] Start chat
	     */
	    onConnected : 'submit',

	    /**
	     * Action after auth fail: submit [String] Submit form, false [boolean] | quiet [String] Do
	     * nothing, ask [String] Show auth fail dialog
	     */
	    onAuthFail : 'submit',

	    /**
	     * True: Attach connection even is login form was found.
	     *
	     * @type {Boolean}
	     * @deprecated since 3.0.0. Use now loginForm.ifFound (true => attach, false => pause)
	     */
	    attachIfFound : true,

	    /**
	     * Describes what we should do if login form was found:
	     * - Attach connection
	     * - Force new connection with loginForm.jid and loginForm.passed
	     * - Pause connection and do nothing
	     *
	     * @type {(attach|force|pause)}
	     */
	    ifFound : 'attach',

	    /**
	     * True: Display roster minimized after first login. Afterwards the last
	     * roster state will be used.
	     */
	    startMinimized : false
	  },

	  /** jquery object from logout element */
	  logoutElement : null,

	  /** How many messages should be logged? */
	  numberOfMsg : 10,

	  /** Default language */
	  defaultLang : 'en',

	  /** auto language detection */
	  autoLang : true,

	  /** Place for roster */
	  rosterAppend : 'body',

	  /** Should we use the HTML5 notification API? */
	  notification : true,

	  /** duration for notification */
	  popupDuration : 6000,

	  /** Absolute path root of JSXC installation */
	  root : '',

	  /**
	   * This function decides wether the roster will be displayed or not if no
	   * connection is found.
	   */
	  displayRosterMinimized : function() {
	    return false;
	  },

	  /** Set to true if you want to hide offline buddies. */
	  hideOffline : false,

	  /** Mute notification sound? */
	  muteNotification : false,

	  /**
	   * If no avatar is found, this function is called.
	   *
	   * @param jid Jid of that user.
	   * @this {jQuery} Elements to update with probable .jsxc_avatar elements
	   */
	  defaultAvatar : function(jid) {
	    jsxc.gui.avatarPlaceholder($(this).find('.jsxc_avatar'), jid);
	  },

	  /**
	   * This callback processes all settings.
	   * @callback loadSettingsCallback
	   * @param settings {object} could be every jsxc option
	   */

	  /**
	   * Returns permanent saved settings and overwrite default jsxc.options.
	   *
	   * @memberOf jsxc.options
	   * @function
	   * @param username {string} username
	   * @param password {string} password
	   * @param cb {loadSettingsCallback} Callback that handles the result
	   */
	  loadSettings : null,

	  /**
	   * Call this function to save user settings permanent.
	   *
	   * @memberOf jsxc.options
	   * @param data Holds all data as key/value
	   * @param cb Called with true on success, false otherwise
	   */
	  saveSettinsPermanent : function(data, cb) {
	    cb(true);
	  },

	  carbons : {
	    /** Enable carbon copies? */
	    enable : false
	  },

	  /**
	   * Processes user list.
	   *
	   * @callback getUsers-cb
	   * @param {object} list List of users, key: username, value: alias
	   */

	  /**
	   * Returns a list of usernames and aliases
	   *
	   * @function getUsers
	   * @memberOf jsxc.options
	   * @param {string} search Search token (start with)
	   * @param {getUsers-cb} cb Called with list of users
	   */
	  getUsers : null,

	  /** Options for info in favicon */
	  favicon : {
	    enable : true,

	    /** Favicon info background color */
	    bgColor : '#E59400',

	    /** Favicon info text color */
	    textColor : '#fff'
	  },

	  /** @deprecated since v2.1.0. Use now RTCPeerConfig.url. */
	  turnCredentialsPath : null,

	  /** RTCPeerConfiguration used for audio/video calls. */
	  RTCPeerConfig : {
	    /** Time-to-live for config from url */
	    ttl : 3600,

	    /** [optional] If set, jsxc requests and uses RTCPeerConfig from this url */
	    url : null,

	    /** If true, jsxc send cookies when requesting RTCPeerConfig from the url above */
	    withCredentials : false,

	    /** ICE servers like defined in http://www.w3.org/TR/webrtc/#idl-def-RTCIceServer */
	    iceServers : [{
	      urls : 'stun:stun.stunprotocol.org'
	    }]
	  },

	  /** Link to an online user manual */
	  onlineHelp : 'http://www.jsxc.org/manual.html',

	  viewport : {
	    getSize : function() {
	      var w = $(window).width() - $('#jsxc_windowListSB').width();
	      var h = $(window).height();

	      if (jsxc.storage.getUserItem('roster') === 'shown') {
	        w -= $('#jsxc_roster').outerWidth(true);
	      }

	      return {
	        width : w, height : h
	      };
	    }
	  },

	  maxStorableSize : 1000000
	};

	/**
	 * @namespace jsxc.otr
	 */
	jsxc.otr = {
	   /** list of otr objects */
	   objects: {},

	   dsaFallback: null,
	   /**
	    * Handler for otr receive event
	    * 
	    * @memberOf jsxc.otr
	    * @param {Object} d
	    * @param {string} d.bid
	    * @param {string} d.msg received message
	    * @param {boolean} d.encrypted True, if msg was encrypted.
	    * @param {boolean} d.forwarded
	    * @param {string} d.stamp timestamp
	    */
	   receiveMessage: function(d) {
	      var bid = d.bid;

	      if (jsxc.otr.objects[bid].msgstate !== OTR.CONST.MSGSTATE_PLAINTEXT) {
	         jsxc.otr.backup(bid);
	      }

	      if (jsxc.otr.objects[bid].msgstate !== OTR.CONST.MSGSTATE_PLAINTEXT && !d.encrypted) {
	         jsxc.gui.window.postMessage({
	            bid: bid,
	            direction: jsxc.Message.SYS,
	            msg: jsxc.t('Received_an_unencrypted_message') + '. [' + d.msg + ']',
	            encrypted: d.encrypted,
	            forwarded: d.forwarded,
	            stamp: d.stamp
	         });
	      } else {
	         jsxc.gui.window.postMessage({
	            bid: bid,
	            direction: jsxc.Message.IN,
	            msg: d.msg,
	            encrypted: d.encrypted,
	            forwarded: d.forwarded,
	            stamp: d.stamp
	         });
	      }
	   },

	   /**
	    * Handler for otr send event
	    * 
	    * @param {string} jid
	    * @param {string} msg message to be send
	    */
	   sendMessage: function(jid, msg, uid) {
	      if (jsxc.otr.objects[jsxc.jidToBid(jid)].msgstate !== 0) {
	         jsxc.otr.backup(jsxc.jidToBid(jid));
	      }

	      jsxc.xmpp._sendMessage(jid, msg, uid);
	   },

	   /**
	    * Create new otr instance
	    * 
	    * @param {type} bid
	    * @returns {undefined}
	    */
	   create: function(bid) {

	      if (jsxc.otr.objects.hasOwnProperty(bid)) {
	         return;
	      }

	      if (!jsxc.options.otr.priv) {
	         return;
	      }

	      // save list of otr objects
	      var ol = jsxc.storage.getUserItem('otrlist') || [];
	      if (ol.indexOf(bid) < 0) {
	         ol.push(bid);
	         jsxc.storage.setUserItem('otrlist', ol);
	      }

	      jsxc.otr.objects[bid] = new OTR(jsxc.options.otr);

	      if (jsxc.options.otr.SEND_WHITESPACE_TAG) {
	         jsxc.otr.objects[bid].SEND_WHITESPACE_TAG = true;
	      }

	      if (jsxc.options.otr.WHITESPACE_START_AKE) {
	         jsxc.otr.objects[bid].WHITESPACE_START_AKE = true;
	      }

	      jsxc.otr.objects[bid].on('status', function(status) {
	         var data = jsxc.storage.getUserItem('buddy', bid);

	         if (data === null) {
	            return;
	         }

	         switch (status) {
	            case OTR.CONST.STATUS_SEND_QUERY:
	               jsxc.gui.window.postMessage({
	                  bid: bid,
	                  direction: jsxc.Message.SYS,
	                  msg: jsxc.t('trying_to_start_private_conversation')
	               });
	               break;
	            case OTR.CONST.STATUS_AKE_SUCCESS:
	               data.fingerprint = jsxc.otr.objects[bid].their_priv_pk.fingerprint();
	               data.msgstate = OTR.CONST.MSGSTATE_ENCRYPTED;

	               var msg_state = jsxc.otr.objects[bid].trust ? 'Verified' : 'Unverified';
	               var msg = jsxc.t(msg_state + '_private_conversation_started');

	               jsxc.gui.window.postMessage({
	                  bid: bid,
	                  direction: 'sys',
	                  msg: msg
	               });
	               break;
	            case OTR.CONST.STATUS_END_OTR:
	               data.fingerprint = null;

	               if (jsxc.otr.objects[bid].msgstate === OTR.CONST.MSGSTATE_PLAINTEXT) {
	                  // we abort the private conversation

	                  data.msgstate = OTR.CONST.MSGSTATE_PLAINTEXT;
	                  jsxc.gui.window.postMessage({
	                     bid: bid,
	                     direction: jsxc.Message.SYS,
	                     msg: jsxc.t('private_conversation_aborted')
	                  });

	               } else {
	                  // the buddy abort the private conversation

	                  data.msgstate = OTR.CONST.MSGSTATE_FINISHED;
	                  jsxc.gui.window.postMessage({
	                     bid: bid,
	                     direction: jsxc.Message.SYS,
	                     msg: jsxc.t('your_buddy_closed_the_private_conversation_you_should_do_the_same')
	                  });
	               }
	               break;
	            case OTR.CONST.STATUS_SMP_HANDLE:
	               jsxc.keepBusyAlive();
	               break;
	         }

	         jsxc.storage.setUserItem('buddy', bid, data);

	         // for encryption and verification state
	         jsxc.gui.update(bid);
	      });

	      jsxc.otr.objects[bid].on('smp', function(type, data) {
	         switch (type) {
	            case 'question': // verification request received
	               jsxc.gui.window.postMessage({
	                  bid: bid,
	                  direction: jsxc.Message.SYS,
	                  msg: jsxc.t('Authentication_request_received')
	               });

	               jsxc.gui.window.smpRequest(bid, data);
	               jsxc.storage.setUserItem('smp', bid, {
	                  data: data || null
	               });

	               break;
	            case 'trust': // verification completed
	               jsxc.otr.objects[bid].trust = data;
	               jsxc.storage.updateUserItem('buddy', bid, 'trust', data);
	               jsxc.otr.backup(bid);
	               jsxc.gui.update(bid);

	               if (data) {
	                  jsxc.gui.window.postMessage({
	                     bid: bid,
	                     direction: jsxc.Message.SYS,
	                     msg: jsxc.t('conversation_is_now_verified')
	                  });
	               } else {
	                  jsxc.gui.window.postMessage({
	                     bid: bid,
	                     direction: jsxc.Message.SYS,
	                     msg: jsxc.t('authentication_failed')
	                  });
	               }
	               jsxc.storage.removeUserItem('smp', bid);
	               jsxc.gui.dialog.close('smp');
	               break;
	            case 'abort':
	               jsxc.gui.window.hideOverlay(bid);
	               jsxc.gui.window.postMessage({
	                  bid: bid,
	                  direction: jsxc.Message.SYS,
	                  msg: jsxc.t('Authentication_aborted')
	               });
	               break;
	            default:
	               jsxc.debug('[OTR] sm callback: Unknown type: ' + type);
	         }
	      });

	      // Receive message
	      jsxc.otr.objects[bid].on('ui', function(msg, encrypted, meta) {
	         jsxc.otr.receiveMessage({
	            bid: bid,
	            msg: msg,
	            encrypted: encrypted === true,
	            stamp: meta.stamp,
	            forwarded: meta.forwarded
	         });
	      });

	      // Send message
	      jsxc.otr.objects[bid].on('io', function(msg, uid) {
	         var jid = jsxc.gui.window.get(bid).data('jid') || jsxc.otr.objects[bid].jid;

	         jsxc.otr.objects[bid].jid = jid;

	         jsxc.otr.sendMessage(jid, msg, uid);
	      });

	      jsxc.otr.objects[bid].on('error', function(err) {
	         // Handle this case in jsxc.otr.receiveMessage
	         if (err !== 'Received an unencrypted message.') {
	            jsxc.gui.window.postMessage({
	               bid: bid,
	               direction: jsxc.Message.SYS,
	               msg: '[OTR] ' + jsxc.t(err)
	            });
	         }

	         jsxc.error('[OTR] ' + err);
	      });

	      jsxc.otr.restore(bid);
	   },

	   /**
	    * show verification dialog with related part (secret or question)
	    * 
	    * @param {type} bid
	    * @param {string} [data]
	    * @returns {undefined}
	    */
	   onSmpQuestion: function(bid, data) {
	      jsxc.gui.showVerification(bid);

	      $('#jsxc_dialog select').prop('selectedIndex', (data ? 2 : 3)).change();
	      $('#jsxc_dialog > div:eq(0)').hide();

	      if (data) {
	         $('#jsxc_dialog > div:eq(2)').find('#jsxc_quest').val(data).prop('disabled', true);
	         $('#jsxc_dialog > div:eq(2)').find('.jsxc_submit').text(jsxc.t('Answer'));
	         $('#jsxc_dialog > div:eq(2)').find('.jsxc_explanation').text(jsxc.t('onsmp_explanation_question'));
	         $('#jsxc_dialog > div:eq(2)').show();
	      } else {
	         $('#jsxc_dialog > div:eq(3)').find('.jsxc_explanation').text(jsxc.t('onsmp_explanation_secret'));
	         $('#jsxc_dialog > div:eq(3)').show();
	      }

	      $('#jsxc_dialog .jsxc_close').click(function() {
	         jsxc.storage.removeUserItem('smp', bid);

	         if (jsxc.master) {
	            jsxc.otr.objects[bid].sm.abort();
	         }
	      });
	   },

	   /**
	    * Send verification request to buddy
	    * 
	    * @param {string} bid
	    * @param {string} sec secret
	    * @param {string} [quest] question
	    * @returns {undefined}
	    */
	   sendSmpReq: function(bid, sec, quest) {
	      jsxc.keepBusyAlive();

	      jsxc.otr.objects[bid].smpSecret(sec, quest || '');
	   },

	   /**
	    * Toggle encryption state
	    * 
	    * @param {type} bid
	    * @returns {undefined}
	    */
	   toggleTransfer: function(bid) {
	      if (typeof OTR !== 'function') {
	         return;
	      }

	      if (jsxc.storage.getUserItem('buddy', bid).msgstate === 0) {
	         jsxc.otr.goEncrypt(bid);
	      } else {
	         jsxc.otr.goPlain(bid);
	      }
	   },

	   /**
	    * Send request to encrypt the session
	    * 
	    * @param {type} bid
	    * @returns {undefined}
	    */
	   goEncrypt: function(bid) {
	      if (jsxc.master) {
	         if (jsxc.otr.objects.hasOwnProperty(bid)) {
	            jsxc.otr.objects[bid].sendQueryMsg();
	         }
	      } else {
	         jsxc.storage.updateUserItem('buddy', bid, 'transferReq', 1);
	      }
	   },

	   /**
	    * Abort encryptet session
	    * 
	    * @param {type} bid
	    * @param cb callback
	    * @returns {undefined}
	    */
	   goPlain: function(bid, cb) {
	      if (jsxc.master) {
	         if (jsxc.otr.objects.hasOwnProperty(bid)) {
	            jsxc.otr.objects[bid].endOtr.call(jsxc.otr.objects[bid], cb);
	            jsxc.otr.objects[bid].init.call(jsxc.otr.objects[bid]);

	            jsxc.otr.backup(bid);
	         }
	      } else {
	         jsxc.storage.updateUserItem('buddy', bid, 'transferReq', 0);
	      }
	   },

	   /**
	    * Backups otr session
	    * 
	    * @param {string} bid
	    */
	   backup: function(bid) {
	      var o = jsxc.otr.objects[bid]; // otr object
	      var r = {}; // return value

	      if (o === null) {
	         return;
	      }

	      // all variables which should be saved
	      var savekey = ['jid', 'our_instance_tag', 'msgstate', 'authstate', 'fragment', 'their_y', 'their_old_y', 'their_keyid', 'their_instance_tag', 'our_dh', 'our_old_dh', 'our_keyid', 'sessKeys', 'storedMgs', 'oldMacKeys', 'trust', 'transmittedRS', 'ssid', 'receivedPlaintext', 'authstate', 'send_interval'];

	      var i;
	      for (i = 0; i < savekey.length; i++) {
	         r[savekey[i]] = JSON.stringify(o[savekey[i]]);
	      }

	      if (o.their_priv_pk !== null) {
	         r.their_priv_pk = JSON.stringify(o.their_priv_pk.packPublic());
	      }

	      if (o.ake.otr_version && o.ake.otr_version !== '') {
	         r.otr_version = JSON.stringify(o.ake.otr_version);
	      }

	      jsxc.storage.setUserItem('otr', bid, r);
	   },

	   /**
	    * Restore old otr session
	    * 
	    * @param {string} bid
	    */
	   restore: function(bid) {
	      var o = jsxc.otr.objects[bid];
	      var d = jsxc.storage.getUserItem('otr', bid);

	      if (o !== null || d !== null) {
	         var key;
	         for (key in d) {
	            if (d.hasOwnProperty(key)) {
	               var val = JSON.parse(d[key]);
	               if (key === 'their_priv_pk' && val !== null) {
	                  val = DSA.parsePublic(val);
	               }
	               if (key === 'otr_version' && val !== null) {
	                  o.ake.otr_version = val;
	               } else {
	                  o[key] = val;
	               }
	            }
	         }

	         jsxc.otr.objects[bid] = o;

	         if (o.msgstate === 1 && o.their_priv_pk !== null) {
	            o._smInit.call(jsxc.otr.objects[bid]);
	         }
	      }

	      jsxc.otr.enable(bid);
	   },

	   /**
	    * Create or load DSA key
	    * 
	    * @returns {unresolved}
	    */
	   createDSA: function() {
	      if (jsxc.options.otr.priv) {
	         return;
	      }

	      if (typeof OTR !== 'function') {
	         jsxc.warn('OTR support disabled');

	         OTR = {};
	         OTR.CONST = {
	            MSGSTATE_PLAINTEXT: 0,
	            MSGSTATE_ENCRYPTED: 1,
	            MSGSTATE_FINISHED: 2
	         };

	         return;
	      }

	      if (jsxc.storage.getUserItem('key') === null) {
	         var msg = jsxc.t('Creating_your_private_key_');
	         var worker = null;

	         if (Worker) {
	            // try to create web-worker

	            try {
	               worker = new Worker(jsxc.options.root + '/lib/otr/lib/dsa-webworker.js');
	            } catch (err) {
	               jsxc.warn('Couldn\'t create web-worker.', err);
	            }
	         }

	         jsxc.otr.dsaFallback = (worker === null);

	         if (!jsxc.otr.dsaFallback) {
	            // create DSA key in background

	            worker.onmessage = function(e) {
	               var type = e.data.type;
	               var val = e.data.val;

	               if (type === 'debug') {
	                  jsxc.debug(val);
	               } else if (type === 'data') {
	                  jsxc.otr.DSAready(DSA.parsePrivate(val));
	               }
	            };

	            jsxc.debug('DSA key creation started.');

	            // start worker
	            worker.postMessage({
	               imports: [jsxc.options.root + '/lib/otr/vendor/salsa20.js', jsxc.options.root + '/lib/otr/vendor/bigint.js', jsxc.options.root + '/lib/otr/vendor/crypto.js', jsxc.options.root + '/lib/otr/vendor/eventemitter.js', jsxc.options.root + '/lib/otr/lib/const.js', jsxc.options.root + '/lib/otr/lib/helpers.js', jsxc.options.root + '/lib/otr/lib/dsa.js'],
	               seed: BigInt.getSeed(),
	               debug: true
	            });

	         } else {
	            // fallback
	            jsxc.xmpp.conn.pause();

	            jsxc.gui.dialog.open(jsxc.gui.template.get('waitAlert', null, msg), {
	               noClose: true
	            });

	            jsxc.debug('DSA key creation started in fallback mode.');

	            // wait until the wait alert is opened
	            setTimeout(function() {
	               var dsa = new DSA();
	               jsxc.otr.DSAready(dsa);
	            }, 500);
	         }
	      } else {
	         jsxc.debug('DSA key loaded');
	         jsxc.options.otr.priv = DSA.parsePrivate(jsxc.storage.getUserItem('key'));

	         jsxc.otr._createDSA();
	      }
	   },

	   /**
	    * Ending of createDSA().
	    */
	   _createDSA: function() {

	      jsxc.storage.setUserItem('priv_fingerprint', jsxc.options.otr.priv.fingerprint());

	      $.each(jsxc.storage.getUserItem('windowlist') || [], function(index, val) {
	         jsxc.otr.create(val);
	      });
	   },

	   /**
	    * Ending of DSA key generation.
	    * 
	    * @param {DSA} dsa DSA object
	    */
	   DSAready: function(dsa) {
	      jsxc.storage.setUserItem('key', dsa.packPrivate());
	      jsxc.options.otr.priv = dsa;

	      // close wait alert
	      if (jsxc.otr.dsaFallback) {
	         jsxc.xmpp.conn.resume();
	         jsxc.gui.dialog.close();
	      }

	      jsxc.otr._createDSA();
	   },

	   enable: function(bid) {
	      jsxc.gui.window.get(bid).find('.jsxc_otr').removeClass('jsxc_disabled');
	   }
	};

	/**
	 * REST operations
	 *
	 *
	 */
	jsxc.rest = {

	    init: function () {

	        var self = jsxc.rest;

	        // initialising openfire
	        self.openfire.apiBaseUrl = jsxc.options.get('rest').apiBaseUrl || "";
	        self.openfire.apiKey = jsxc.options.get('rest').apiKey || "";

	    },

	    openfire: {

	        /**
	         * URL for accessing REST API
	         */
	        apiBaseUrl: "",

	        /**
	         * Auth key
	         */
	        apiKey: "",

	        /**
	         * Check if all parameters needed to use API are presents
	         * @returns {boolean}
	         * @private
	         */
	        _checkAvailability: function () {

	            var self = jsxc.rest.openfire;

	            if (self.apiBaseUrl === "") {
	                jsxc.warn("Rest api not available: no base url found");
	                return false;
	            }
	            if (self.apiKey === "") {
	                jsxc.warn("Rest api not available: no api key found");
	                return false;
	            }

	            return true;
	        },

	        /**
	         * Create an user and return a JQuery promise.
	         *
	         * User login will be in lower case.
	         *
	         * Errors:
	         * 409: user exist
	         * 500: invalid username
	         *
	         * @param userJid
	         * @returns {*}
	         */
	        createUser: function (userNode) {

	            var self = jsxc.rest.openfire;
	            if (self._checkAvailability() !== true) {

	                var falsePromise = $.Deferred().promise();
	                falsePromise.fail("Openfire REST API unavailable");

	                return falsePromise;
	            }

	            return self._asyncRequest(
	                'POST',
	                "/users",
	                {
	                    username: userNode.toLowerCase(),
	                    password: "azerty",
	                }
	            );

	        },

	        /**
	         *
	         * Utils to do async REST requests
	         *
	         *
	         */
	        _asyncRequest: function (type, url, data, headers) {

	            var self = jsxc.rest.openfire;

	            if (typeof type === "undefined") {
	                throw "Parameter cannot be undefined: " + type;
	            }
	            if (typeof url === "undefined") {
	                throw "Parameter cannot be undefined: " + url;
	            }

	            var restUrl = self.apiBaseUrl + url;

	            var req = {
	                url: restUrl,
	                type: type,
	                dataType: "json",
	                headers: {
	                    "Authorization": self.apiKey,
	                    "Content-Type": "application/json"
	                }
	            };

	            // ajouter des données si necessaire
	            if (typeof data !== "undefined") {
	                req.data = JSON.stringify(data);
	            }

	            // ajouter entetes si necessaire
	            if (typeof headers !== "undefined") {
	                $.extend(req.headers, headers);
	            }

	            return $.ajax(req);

	        },

	    }

	};

	/**
	 * Handle long-live data
	 *
	 * @namespace jsxc.storage
	 */
	jsxc.storage = {
	    /**
	     * Prefix for localstorage
	     *
	     * @privat
	     */
	    PREFIX: 'jsxc',

	    SEP: ':',

	    /**
	     * @param {type} uk Should we generate a user prefix?
	     * @returns {String} prefix
	     * @memberOf jsxc.storage
	     */
	    getPrefix: function (uk) {
	        var self = jsxc.storage;

	        if (uk && !jsxc.bid) {
	            console.trace('Unable to create user prefix');
	        }

	        return self.PREFIX + self.SEP + ((uk && jsxc.bid) ? jsxc.bid + self.SEP : '');
	    },

	    /**
	     * Save item to storage
	     *
	     * @function
	     * @param {String} key variablename
	     * @param {Object} value value
	     * @param {String} uk Userkey? Should we add the bid as prefix?
	     */
	    setItem: function (key, value, uk) {

	        // Workaround for non-conform browser
	        if (jsxc.storageNotConform > 0 && key !== 'rid') {
	            if (jsxc.storageNotConform > 1 && jsxc.toSNC === null) {
	                jsxc.toSNC = window.setTimeout(function () {
	                    jsxc.storageNotConform = 0;
	                    jsxc.storage.setItem('storageNotConform', 0);
	                }, 1000);
	            }

	            jsxc.ls.push(JSON.stringify({
	                key: key,
	                value: value
	            }));
	        }

	        if (typeof(value) === 'object') {
	            // exclude jquery objects, because otherwise safari will fail
	            value = JSON.stringify(value, function (key, val) {
	                if (!(val instanceof jQuery)) {
	                    return val;
	                }
	            });
	        }

	        localStorage.setItem(jsxc.storage.getPrefix(uk) + key, value);

	    },

	    setUserItem: function (type, key, value) {
	        var self = jsxc.storage;

	        if (arguments.length === 2) {
	            value = key;
	            key = type;
	            type = '';
	        } else if (arguments.length === 3) {
	            key = type + self.SEP + key;
	        }

	        return jsxc.storage.setItem(key, value, true);
	    },

	    /**
	     * Load item from storage
	     *
	     * @function
	     * @param {String} key variablename
	     * @param {String} uk Userkey? Should we add the bid as prefix?
	     */
	    getItem: function (key, uk) {

	        key = jsxc.storage.getPrefix(uk) + key;

	        var value = localStorage.getItem(key);
	        try {
	            return JSON.parse(value);
	        } catch (e) {
	            return value;
	        }

	    },

	    /**
	     * Get a user item from storage.
	     *
	     * @param key
	     * @returns user item
	     */
	    getUserItem: function (type, key) {
	        var self = jsxc.storage;

	        if (arguments.length === 1) {
	            key = type;
	        } else if (arguments.length === 2) {
	            key = type + self.SEP + key;
	        }

	        return jsxc.storage.getItem(key, true);
	    },

	    /**
	     * Remove item from storage
	     *
	     * @function
	     * @param {String} key variablename
	     * @param {String} uk Userkey? Should we add the bid as prefix?
	     */
	    removeItem: function (key, uk) {

	        // Workaround for non-conforming browser
	        if (jsxc.storageNotConform && key !== 'rid') {
	            jsxc.ls.push(JSON.stringify({
	                key: jsxc.storage.prefix + key,
	                value: ''
	            }));
	        }

	        localStorage.removeItem(jsxc.storage.getPrefix(uk) + key);
	    },

	    /**
	     * Remove user item from storage.
	     *
	     * @param key
	     */
	    removeUserItem: function (type, key) {
	        var self = jsxc.storage;

	        if (arguments.length === 1) {
	            key = type;
	        } else if (arguments.length === 2) {
	            key = type + self.SEP + key;
	        }

	        jsxc.storage.removeItem(key, true);
	    },

	    /**
	     * Updates value of a variable in a saved object.
	     *
	     * @function
	     * @param {String} key variablename
	     * @param {String|object} variable variablename in object or object with
	     *        variable/key pairs
	     * @param {Object} [value] value
	     * @param {String} uk Userkey? Should we add the bid as prefix?
	     */
	    updateItem: function (key, variable, value, uk) {

	        var data = jsxc.storage.getItem(key, uk) || {};

	        if (typeof(variable) === 'object') {

	            $.each(variable, function (key, val) {
	                if (typeof(data[key]) === 'undefined') {
	                    jsxc.debug('Variable ' + key + ' doesn\'t exist in ' + variable + '. It was created.');
	                }

	                data[key] = val;
	            });
	        } else {
	            if (typeof(data[variable]) === 'undefined') {
	                jsxc.debug('Variable ' + variable + ' doesn\'t exist. It was created.');
	            }

	            data[variable] = value;
	        }

	        jsxc.storage.setItem(key, data, uk);
	    },

	    /**
	     * Updates value of a variable in a saved user object.
	     *
	     * @param {String} type variable type (a prefix)
	     * @param {String} key variable name
	     * @param {String|object} variable variable name in object or object with
	     *        variable/key pairs
	     * @param {Object} [value] value (not used if the variable was an object)
	     */
	    updateUserItem: function (type, key, variable, value) {
	        var self = jsxc.storage;

	        if (arguments.length === 4 || (arguments.length === 3 && typeof variable === 'object')) {
	            key = type + self.SEP + key;
	        } else {
	            value = variable;
	            variable = key;
	            key = type;
	        }

	        return jsxc.storage.updateItem(key, variable, value, true);
	    },

	    /**
	     * Increments value
	     *
	     * @function
	     * @param {String} key variablename
	     * @param {String} uk Userkey? Should we add the bid as prefix?
	     */
	    ink: function (key, uk) {

	        jsxc.storage.setItem(key, Number(jsxc.storage.getItem(key, uk)) + 1, uk);
	    },

	    /**
	     * Remove element from array or object
	     *
	     * @param {string} key name of array or object
	     * @param {string} name name of element in array or object
	     * @param {String} uk Userkey? Should we add the bid as prefix?
	     * @returns {undefined}
	     */
	    removeElement: function (key, name, uk) {
	        var item = jsxc.storage.getItem(key, uk);

	        if ($.isArray(item)) {
	            item = $.grep(item, function (e) {
	                return e !== name;
	            });
	        } else if (typeof(item) === 'object' && item !== null) {
	            delete item[name];
	        }

	        jsxc.storage.setItem(key, item, uk);
	    },

	    removeUserElement: function (type, key, name) {
	        var self = jsxc.storage;

	        if (arguments.length === 2) {
	            name = key;
	            key = type;
	        } else if (arguments.length === 3) {
	            key = type + self.SEP + key;
	        }

	        return jsxc.storage.removeElement(key, name, true);
	    },

	    /**
	     * Triggered if changes are recognized
	     *
	     * @function
	     * @param {event} e Storage event
	     * @param {String} e.key Key name which triggered event
	     * @param {Object} e.oldValue Old Value for key
	     * @param {Object} e.newValue New Value for key
	     * @param {String} e.url
	     */
	    onStorage: function (e) {

	        // skip
	        if (e.key === jsxc.storage.PREFIX + jsxc.storage.SEP + 'rid') {
	            return;
	        }

	        var re = new RegExp('^' + jsxc.storage.PREFIX + jsxc.storage.SEP + '(?:[^' + jsxc.storage.SEP + ']+@[^' + jsxc.storage.SEP + ']+' + jsxc.storage.SEP + ')?(.*)', 'i');
	        var key = e.key.replace(re, '$1');

	        // Workaround for non-conforming browser, which trigger
	        // events on every page (notably IE): Ignore own writes
	        // (own)
	        if (jsxc.storageNotConform > 0 && jsxc.ls.length > 0) {

	            var val = e.newValue;
	            try {
	                val = JSON.parse(val);
	            } catch (err) {
	            }

	            var index = $.inArray(JSON.stringify({
	                key: key,
	                value: val
	            }), jsxc.ls);

	            if (index >= 0) {

	                // confirm that the storage event is not fired regularly
	                if (jsxc.storageNotConform > 1) {
	                    window.clearTimeout(jsxc.toSNC);
	                    jsxc.storageNotConform = 1;
	                    jsxc.storage.setItem('storageNotConform', 1);
	                }

	                jsxc.ls.splice(index, 1);
	                return;
	            }
	        }

	        // Workaround for non-conforming browser
	        if (e.oldValue === e.newValue) {
	            return;
	        }

	        var n, o;
	        var bid = key.replace(new RegExp('[^' + jsxc.storage.SEP + ']+' + jsxc.storage.SEP + '(.*)', 'i'), '$1');

	        // react if someone asks whether there is a master
	        if (jsxc.master && key === 'alive') {
	            jsxc.debug('Master request.');

	            jsxc.storage.ink('alive');
	            return;
	        }

	        // master alive
	        if (!jsxc.master && (key === 'alive' || key === 'alive_busy') && !jsxc.triggeredFromElement) {

	            // reset timeouts
	            jsxc.to = $.grep(jsxc.to, function (timeout) {
	                window.clearTimeout(timeout);

	                return false;
	            });
	            jsxc.to.push(window.setTimeout(jsxc.checkMaster, ((key === 'alive') ? jsxc.options.timeout : jsxc.options.busyTimeout) + jsxc.random(60)));

	            // only call the first time
	            if (!jsxc.role_allocation) {
	                jsxc.onSlave();
	            }

	            return;
	        }

	        if (key.match(/^notices/)) {
	            jsxc.notice.load();
	        }

	        if (key.match(/^presence/)) {
	            jsxc.gui.changePresence(e.newValue, true);
	        }

	        if (key.match(/^options/) && e.newValue) {
	            n = JSON.parse(e.newValue);

	            if (typeof n.muteNotification !== 'undefined' && n.muteNotification) {
	                jsxc.notification.muteSound(true);
	            } else {
	                jsxc.notification.unmuteSound(true);
	            }
	        }

	        if (key.match(/^hidden/)) {
	            if (jsxc.master) {
	                clearTimeout(jsxc.toNotification);
	            } else {
	                jsxc.isHidden();
	            }
	        }

	        if (key.match(/^focus/)) {
	            if (jsxc.master) {
	                clearTimeout(jsxc.toNotification);
	            } else {
	                jsxc.hasFocus();
	            }
	        }

	        if (key.match(new RegExp('^history' + jsxc.storage.SEP))) {

	            var history = JSON.parse(e.newValue);
	            var uid, el, message;

	            while (history.length > 0) {
	                uid = history.pop();

	                message = new jsxc.Message(uid);
	                el = message.getDOM();

	                if (el.length === 0) {
	                    if (jsxc.master && message.direction === jsxc.Message.OUT) {
	                        jsxc.xmpp.sendMessage(message.bid, message.msg, message._uid);
	                    }

	                    jsxc.gui.window._postMessage(message, true);
	                } else if (message.isReceived()) {
	                    el.addClass('jsxc_received');
	                }
	            }
	            return;
	        }

	        if (key.match(new RegExp('^window' + jsxc.storage.SEP))) {

	            if (!e.newValue) {
	                jsxc.gui.window._close(bid);
	                return;
	            }

	            if (!e.oldValue) {
	                jsxc.gui.window.open(bid);
	                return;
	            }

	            n = JSON.parse(e.newValue);
	            o = JSON.parse(e.oldValue);

	            if (n.minimize !== o.minimize) {
	                if (n.minimize) {
	                    jsxc.gui.window._hide(bid);
	                } else {
	                    jsxc.gui.window._show(bid);
	                }
	            }

	            jsxc.gui.window.setText(bid, n.text);

	            if (n.unread !== o.unread) {
	                if (n.unread === 0) {
	                    jsxc.gui.readMsg(bid);
	                } else {
	                    jsxc.gui._unreadMsg(bid, n.unread);
	                }
	            }

	            return;
	        }

	        if (key.match(/^unreadMsg/) && jsxc.gui.favicon) {
	            jsxc.gui.favicon.badge(parseInt(e.newValue) || 0);
	        }

	        if (key.match(new RegExp('^smp' + jsxc.storage.SEP))) {

	            if (!e.newValue) {

	                jsxc.gui.dialog.close('smp');
	                jsxc.gui.window.hideOverlay(bid);

	                if (jsxc.master) {
	                    jsxc.otr.objects[bid].sm.abort();
	                }

	                return;
	            }

	            n = JSON.parse(e.newValue);

	            if (typeof(n.data) !== 'undefined') {

	                jsxc.gui.window.smpRequest(bid, n.data);

	            } else if (jsxc.master && n.sec) {
	                jsxc.gui.dialog.close('smp');
	                jsxc.gui.window.hideOverlay(bid);

	                jsxc.otr.sendSmpReq(bid, n.sec, n.quest);
	            }
	        }

	        if (!jsxc.master && key.match(new RegExp('^buddy' + jsxc.storage.SEP))) {

	            if (!e.newValue) {
	                jsxc.gui.roster.purge(bid);
	                return;
	            }
	            if (!e.oldValue) {
	                jsxc.gui.roster.add(bid);
	                return;
	            }

	            n = JSON.parse(e.newValue);
	            o = JSON.parse(e.oldValue);

	            jsxc.gui.update(bid);

	            if (o.status !== n.status || o.sub !== n.sub) {
	                jsxc.gui.roster.reorder(bid);
	            }
	        }

	        if (jsxc.master && key.match(new RegExp('^deletebuddy' + jsxc.storage.SEP)) && e.newValue) {
	            n = JSON.parse(e.newValue);

	            jsxc.xmpp.removeBuddy(n.jid);
	            jsxc.storage.removeUserItem(key);
	        }

	        if (jsxc.master && key.match(new RegExp('^buddy' + jsxc.storage.SEP))) {

	            n = JSON.parse(e.newValue);
	            o = JSON.parse(e.oldValue);

	            if (o.transferReq !== n.transferReq) {
	                jsxc.storage.updateUserItem('buddy', bid, 'transferReq', -1);

	                if (n.transferReq === 0) {
	                    jsxc.otr.goPlain(bid);
	                }
	                if (n.transferReq === 1) {
	                    jsxc.otr.goEncrypt(bid);
	                }
	            }

	            if (o.name !== n.name) {
	                jsxc.gui.roster._rename(bid, n.name);
	            }
	        }

	        // logout
	        if (key === 'sid') {
	            if (!e.newValue) {
	                // if (jsxc.master && jsxc.xmpp.conn) {
	                // jsxc.xmpp.conn.disconnect();
	                // jsxc.triggeredFromElement = true;
	                // }
	                jsxc.xmpp.logout();

	            }
	            return;
	        }

	        if (key === 'friendReq') {
	            n = JSON.parse(e.newValue);

	            if (jsxc.master && n.approve >= 0) {
	                jsxc.xmpp.resFriendReq(n.jid, n.approve);
	            }
	        }

	        if (jsxc.master && key.match(new RegExp('^add' + jsxc.storage.SEP))) {
	            n = JSON.parse(e.newValue);

	            jsxc.xmpp.addBuddy(n.username, n.alias);
	        }

	        if (key === 'roster') {
	            jsxc.gui.roster.toggle(e.newValue);
	        }

	        if (jsxc.master && key.match(new RegExp('^vcard' + jsxc.storage.SEP)) && e.newValue !== null && e.newValue.match(/^request:/)) {

	            jsxc.xmpp.loadVcard(bid, function (stanza) {
	                jsxc.storage.setUserItem('vcard', bid, {
	                    state: 'success',
	                    data: $('<div>').append(stanza).html()
	                });
	            }, function () {
	                jsxc.storage.setUserItem('vcard', bid, {
	                    state: 'error'
	                });
	            });
	        }

	        if (!jsxc.master && key.match(new RegExp('^vcard' + jsxc.storage.SEP)) && e.newValue !== null && !e.newValue.match(/^request:/)) {
	            n = JSON.parse(e.newValue);

	            if (typeof n.state !== 'undefined') {
	                $(document).trigger('loaded.vcard.jsxc', n);
	            }

	            jsxc.storage.removeUserItem('vcard', bid);
	        }
	    },

	    /**
	     * Save or update buddy data.
	     *
	     * @memberOf jsxc.storage
	     * @param bid
	     * @param data
	     * @returns {String} Updated or created
	     */
	    saveBuddy: function (bid, data) {

	        if (jsxc.storage.getUserItem('buddy', bid)) {
	            jsxc.storage.updateUserItem('buddy', bid, data);

	            return 'updated';
	        }

	        jsxc.storage.setUserItem('buddy', bid, $.extend({
	            jid: '',
	            name: '',
	            status: 0,
	            sub: 'none',
	            msgstate: 0,
	            transferReq: -1,
	            trust: false,
	            œ: null,
	            res: [],
	            type: 'chat'
	        }, data));

	        return 'created';
	    },

	    /**
	     * Return the local list of buddies, in the form of bare JID
	     *
	     * <p> Sometimes buddies are stocked in form of "node", "node@domain", ...
	     *
	     */
	    getLocaleBuddyListBJID: function () {

	        var output = [];

	        $.each(jsxc.storage.getUserItem('buddylist') || [], function (index, item) {
	            output.push(jsxc.jidToBid(item));
	        });

	        return output;
	    },
	};

	/* global MediaStreamTrack, File */
	/* jshint -W020 */

	/**
	 * WebRTC namespace for jsxc.
	 *
	 * @namespace jsxc.webrtc
	 */
	jsxc.webrtc = {

	  /** strophe connection */
	  conn : null,

	  /** local video stream */
	  localStream : null,

	  /** remote video stream */
	  remoteStream : null,

	  /** jid of the last caller */
	  last_caller : null,

	  /** should we auto accept incoming calls? */
	  AUTO_ACCEPT : false,

	  /** required disco features for video call */
	  reqVideoFeatures : ['urn:xmpp:jingle:apps:rtp:video', 'urn:xmpp:jingle:apps:rtp:audio',
	    'urn:xmpp:jingle:transports:ice-udp:1', 'urn:xmpp:jingle:apps:dtls:0'],

	  /** required disco features for file transfer */
	  reqFileFeatures : ['urn:xmpp:jingle:1', 'urn:xmpp:jingle:apps:file-transfer:3'],

	  /** bare jid to current jid mapping */
	  chatJids : {},

	  /**
	   * Initialize webrtc plugin.
	   *
	   * @private
	   * @memberOf jsxc.webrtc
	   */
	  init : function() {
	    var self = jsxc.webrtc;

	    // shortcut
	    self.conn = jsxc.xmpp.conn;

	    if (!self.conn.jingle) {
	      jsxc.error('No jingle plugin found!');
	      return;
	    }

	    var manager = self.conn.jingle.manager;

	    $(document).on('message.jsxc', self.onMessage);
	    $(document).on('presence.jsxc', self.onPresence);

	    $(document).on('mediaready.jingle', self.onMediaReady);
	    $(document).on('mediafailure.jingle', self.onMediaFailure);

	    manager.on('incoming', $.proxy(self.onIncoming, self));

	    manager.on('terminated', $.proxy(self.onTerminated, self));
	    manager.on('ringing', $.proxy(self.onCallRinging, self));

	    manager.on('receivedFile', $.proxy(self.onReceivedFile, self));

	    manager.on('sentFile', function(sess, metadata) {
	      jsxc.debug('sent ' + metadata.hash);
	    });

	    manager.on('peerStreamAdded', $.proxy(self.onRemoteStreamAdded, self));
	    manager.on('peerStreamRemoved', $.proxy(self.onRemoteStreamRemoved, self));

	    manager.on('log:*', function(level, msg) {
	      jsxc.debug('[JINGLE][' + level + ']', msg);
	    });

	    if (self.conn.caps) {
	      $(document).on('caps.strophe', self.onCaps);
	    }

	    var url = jsxc.options.get('RTCPeerConfig').url || jsxc.options.turnCredentialsPath;
	    var peerConfig = jsxc.options.get('RTCPeerConfig');

	    if (typeof url === 'string' && url.length > 0) {
	      self.getTurnCrendentials(url);
	    } else {
	      if (jsxc.storage.getUserItem('iceValidity')) {
	        // old ice validity found. Clean up.
	        jsxc.storage.removeUserItem('iceValidity');

	        // Replace saved servers with the once passed to jsxc
	        peerConfig.iceServers = jsxc.options.RTCPeerConfig.iceServers;
	        jsxc.options.set('RTCPeerConfig', peerConfig);
	      }

	      self.conn.jingle.setICEServers(peerConfig.iceServers);
	    }

	    /**
	     * Sound notifications
	     */
	    $(document).on('callincoming.jingle', self._ringOnIncomming);
	    $(document).on('accept.call.jsxc reject.call.jsxc',self._stopRinging);

	  },

	  _ringOnIncomming: function(){
	    jsxc.notification.playSound(jsxc.CONST.SOUNDS.CALL, true, true);
	  },

	  _stopRinging: function(){
	    jsxc.notification.stopSound();
	  },

	  onConnected : function() {
	    //Request new credentials after login
	    jsxc.storage.removeUserItem('iceValidity');
	  },

	  onDisconnected : function() {
	    var self = jsxc.webrtc;

	    $(document).off('message.jsxc', self.onMessage);
	    $(document).off('presence.jsxc', self.onPresence);

	    $(document).off('mediaready.jingle', self.onMediaReady);
	    $(document).off('mediafailure.jingle', self.onMediaFailure);

	    $(document).off('caps.strophe', self.onCaps);
	    
	    /**
	     * Sound notifications
	     */
	    $(document).off('callincoming.jingle', self._ringOnIncomming);
	    $(document).off('accept.call.jsxc reject.call.jsxc',self._stopRinging);
	  },

	  /**
	   * Checks if cached configuration is valid and if necessary update it.
	   *
	   * @memberOf jsxc.webrtc
	   * @param {string} [url]
	   */
	  getTurnCrendentials : function(url) {
	    var self = jsxc.webrtc;

	    url = url || jsxc.options.get('RTCPeerConfig').url || jsxc.options.turnCredentialsPath;
	    var ttl = (jsxc.storage.getUserItem('iceValidity') || 0) - (new Date()).getTime();

	    // validity from jsxc < 2.1.0 is invalid
	    if (jsxc.storage.getUserItem('iceConfig')) {
	      jsxc.storage.removeUserItem('iceConfig');
	      ttl = -1;
	    }

	    if (ttl > 0) {
	      // credentials valid

	      self.conn.jingle.setICEServers(jsxc.options.get('RTCPeerConfig').iceServers);

	      window.setTimeout(jsxc.webrtc.getTurnCrendentials, ttl + 500);
	      return;
	    }

	    $.ajax(url, {
	      async : true, xhrFields : {
	        withCredentials : jsxc.options.get('RTCPeerConfig').withCredentials
	      }, success : function(data) {
	        var ttl = data.ttl || 3600;
	        var iceServers = data.iceServers;

	        if (!iceServers && data.url) {
	          // parse deprecated (v2.1.0) syntax
	          jsxc.warn('Received RTCPeer configuration is deprecated. Use now RTCPeerConfig.url.');

	          iceServers = [{
	            urls : data.url
	          }];

	          if (data.username) {
	            iceServers[0].username = data.username;
	          }

	          if (data.credential) {
	            iceServers[0].credential = data.credential;
	          }
	        }

	        if (iceServers && iceServers.length > 0) {
	          // url as parameter is deprecated
	          var url = iceServers[0].url && iceServers[0].url.length > 0;
	          var urls = iceServers[0].urls && iceServers[0].urls.length > 0;

	          if (urls || url) {
	            jsxc.debug('ice servers received');

	            var peerConfig = jsxc.options.get('RTCPeerConfig');
	            peerConfig.iceServers = iceServers;
	            jsxc.options.set('RTCPeerConfig', peerConfig);

	            self.conn.jingle.setICEServers(iceServers);

	            jsxc.storage.setUserItem('iceValidity', (new Date()).getTime() + 1000 * ttl);
	          } else {
	            jsxc.warn('No valid url found in first ice object.');
	          }
	        }
	      }, dataType : 'json'
	    });
	  },

	  /**
	   * Return list of capable resources.
	   *
	   * @memberOf jsxc.webrtc
	   * @param jid
	   * @param {(string|string[])} features list of required features
	   * @returns {Array}
	   */
	  getCapableRes : function(jid, features) {
	    var self = jsxc.webrtc;
	    var bid = jsxc.jidToBid(jid);
	    var res = Object.keys(jsxc.storage.getUserItem('res', bid) || {}) || [];

	    if (!features) {
	      return res;
	    } else if (typeof features === 'string') {
	      features = [features];
	    }

	    var available = [];
	    $.each(res, function(i, r) {
	      if (self.conn.caps.hasFeatureByJid(bid + '/' + r, features)) {
	        available.push(r);
	      }
	    });

	    return available;
	  },

	  /**
	   * Add "video" button to window menu.
	   *
	   * @private
	   * @memberOf jsxc.webrtc
	   * @param event
	   * @param win jQuery window object
	   */
	  initWindow : function(event, win) {
	    var self = jsxc.webrtc;

	    if (win.hasClass('jsxc_groupchat')) {
	      return;
	    }

	    jsxc.debug('webrtc.initWindow');

	    if (!self.conn) {
	      $(document).one('attached.jsxc', function() {
	        self.initWindow(null, win);
	      });
	      return;
	    }

	    var div = $('<div>').addClass('jsxc_video');
	    win.find('.jsxc_tools .jsxc_settings').after(div);

	    self.updateIcon(win.data('bid'));
	  },

	  /**
	   * Enable or disable "video" icon and assign full jid.
	   *
	   * @memberOf jsxc.webrtc
	   * @param bid CSS conform jid
	   */
	  updateIcon : function(bid) {
	    jsxc.debug('Update icon', bid);

	    var self = jsxc.webrtc;

	    if (bid === jsxc.jidToBid(self.conn.jid)) {
	      return;
	    }

	    var win = jsxc.gui.window.get(bid);
	    var jid = win.data('jid');
	    var ls = jsxc.storage.getUserItem('buddy', bid);

	    if (typeof jid !== 'string') {
	      if (ls && typeof ls.jid === 'string') {
	        jid = ls.jid;
	      } else {
	        jsxc.debug('[webrtc] Could not update icon, because could not find jid for ' + bid);
	        return;
	      }
	    }

	    var res = Strophe.getResourceFromJid(jid);

	    var el = win.find('.jsxc_video');

	    var capableRes = self.getCapableRes(jid, self.reqVideoFeatures);
	    var targetRes = res;

	    if (targetRes === null) {
	      $.each(jsxc.storage.getUserItem('buddy', bid).res || [], function(index, val) {
	        if (capableRes.indexOf(val) > -1) {
	          targetRes = val;
	          return false;
	        }
	      });

	      jid = jid + '/' + targetRes;
	    }

	    el.off('click');

	    if (capableRes.indexOf(targetRes) > -1) {
	      el.click(function() {
	        self.startCall(jid);
	      });

	      el.removeClass('jsxc_disabled');

	      el.attr('title', jsxc.t('Start_video_call'));
	    } else {
	      el.addClass('jsxc_disabled');

	      el.attr('title', jsxc.t('Video_call_not_possible'));
	    }

	    var fileCapableRes = self.getCapableRes(jid, self.reqFileFeatures);
	    var resources = Object.keys(jsxc.storage.getUserItem('res', bid) || {}) || [];

	    if (fileCapableRes.indexOf(res) > -1 ||
	        (res === null && fileCapableRes.length === 1 && resources.length === 1)) {
	      win.find('.jsxc_sendFile').removeClass('jsxc_disabled');
	    } else {
	      win.find('.jsxc_sendFile').addClass('jsxc_disabled');
	    }
	  },

	  /**
	   * Check if full jid changed.
	   *
	   * @private
	   * @memberOf jsxc.webrtc
	   * @param e
	   * @param from full jid
	   */
	  onMessage : function(e, from) {
	    var self = jsxc.webrtc;
	    var bid = jsxc.jidToBid(from);

	    jsxc.debug('webrtc.onmessage', from);

	    if (self.chatJids[bid] !== from) {
	      self.updateIcon(bid);
	      self.chatJids[bid] = from;
	    }
	  },

	  /**
	   * Update icon on presence.
	   *
	   * @memberOf jsxc.webrtc
	   * @param ev
	   * @param status
	   * @private
	   */
	  onPresence : function(ev, jid, status, presence) {
	    var self = jsxc.webrtc;

	    if(!jid){
	      return true;
	    }

	    if ($(presence).find('c[xmlns="' + Strophe.NS.CAPS + '"]').length === 0) {
	      jsxc.debug('webrtc.onpresence', jid);

	      self.updateIcon(jsxc.jidToBid(jid));
	    }
	  },

	  /**
	   * Display status message to user.
	   *
	   * @memberOf jsxc.webrtc
	   * @param txt message
	   * @param d duration in ms
	   */
	  setStatus : function(txt, d) {
	    var status = $('.jsxc_webrtc .jsxc_status');
	    var duration = (typeof d === 'undefined' || d === null) ? 4000 : d;

	    jsxc.debug('[Webrtc]', txt);

	    if (status.html()) {
	      // attach old messages
	      txt = status.html() + '<br />' + txt;
	    }

	    status.html(txt);

	    status.css({
	      'margin-left' : '-' + (status.width() / 2) + 'px', opacity : 0, display : 'block'
	    });

	    status.stop().animate({
	      opacity : 1
	    });

	    clearTimeout(status.data('timeout'));

	    if (duration === 0) {
	      return;
	    }

	    var to = setTimeout(function() {
	      status.stop().animate({
	        opacity : 0
	      }, function() {
	        status.html('');
	      });
	    }, duration);

	    status.data('timeout', to);
	  },

	  /**
	   * Update "video" button if we receive cap information.
	   *
	   * @private
	   * @memberOf jsxc.webrtc
	   * @param event
	   * @param jid
	   */
	  onCaps : function(event, jid) {
	    var self = jsxc.webrtc;

	    if (jsxc.gui.roster.loaded) {
	      self.updateIcon(jsxc.jidToBid(jid));
	    } else {
	      $(document).on('cloaded.roster.jsxc', function() {
	        self.updateIcon(jsxc.jidToBid(jid));
	      });
	    }
	  },

	  /**
	   * Called if video/audio is ready. Open window and display some messages.
	   *
	   * @private
	   * @memberOf jsxc.webrtc
	   * @param event
	   * @param stream
	   */
	  onMediaReady : function(event, stream) {
	    jsxc.debug('media ready');

	    var self = jsxc.webrtc;

	    self.localStream = stream;
	    self.conn.jingle.localStream = stream;

	    var dialog = jsxc.gui.showVideoWindow(self.last_caller);

	    var audioTracks = stream.getAudioTracks();
	    var videoTracks = stream.getVideoTracks();
	    var i;

	    for (i = 0; i < audioTracks.length; i++) {
	      self.setStatus((audioTracks.length > 0) ? jsxc.t('Use_local_audio_device') :
	          jsxc.t('No_local_audio_device'));

	      jsxc.debug('using audio device "' + audioTracks[i].label + '"');
	    }

	    for (i = 0; i < videoTracks.length; i++) {
	      self.setStatus((videoTracks.length > 0) ? jsxc.t('Use_local_video_device') :
	          jsxc.t('No_local_video_device'));

	      jsxc.debug('using video device "' + videoTracks[i].label + '"');

	      dialog.find('.jsxc_localvideo').show();
	    }

	    $(document).trigger('finish.mediaready.jsxc');
	  },

	  /**
	   * Called if media failes.
	   *
	   * @private
	   * @memberOf jsxc.webrtc
	   */
	  onMediaFailure : function(ev, err) {

	    jsxc.stats.addEvent("jsxc.webrtc.mediafailure");

	    var self = jsxc.webrtc;
	    err = err || {
	          name : 'Undefined'
	        };

	    self.setStatus('media failure');

	    jsxc.gui.window.postMessage({
	      bid : jsxc.jidToBid(jsxc.webrtc.last_caller),
	      direction : jsxc.Message.SYS,
	      msg : jsxc.t('Media_failure') + ': ' + jsxc.t(err.name) + ' (' + err.name + ').'
	    });

	    jsxc.debug('media failure: ' + err.name);
	  },

	  onIncoming : function(session) {

	    jsxc.stats.addEvent("jsxc.webrtc.call.incoming");

	    var self = jsxc.webrtc;
	    var type = (session.constructor) ? session.constructor.name : null;

	    if (type === 'FileTransferSession') {
	      self.onIncomingFileTransfer(session);
	    } else if (type === 'MediaSession') {
	      self.onIncomingCall(session);
	    } else {
	      jsxc.error("Unknown session type: " + type, session);
	    }
	  },

	  onIncomingFileTransfer : function(session) {

	    jsxc.stats.addEvent("jsxc.webrtc.file.incoming");

	    jsxc.debug('incoming file transfer from ' + session.peerID);

	    var buddylist = jsxc.storage.getUserItem('buddylist') || [];
	    var bid = jsxc.jidToBid(session.peerID);

	    if (buddylist.indexOf(bid) > -1) {
	      //Accept file transfers only from contacts
	      session.accept();

	      var message = jsxc.gui.window.postMessage({
	        _uid : session.sid + ':msg', bid : bid, direction : jsxc.Message.IN, attachment : {
	          name : session.receiver.metadata.name,
	          type : session.receiver.metadata.type || 'application/octet-stream'
	        }
	      });

	      session.receiver.on('progress', function(sent, size) {
	        jsxc.gui.window.updateProgress(message, sent, size);
	      });
	    }
	  },

	  /**
	   * Called on incoming call.
	   *
	   * @private
	   * @memberOf jsxc.webrtc
	   * @param event
	   * @param sid Session id
	   */
	  onIncomingCall : function(session) {
	    jsxc.debug('incoming call from ' + session.peerID);

	    var self = jsxc.webrtc;
	    var bid = jsxc.jidToBid(session.peerID);

	    session.on('change:connectionState', $.proxy(self.onIceConnectionStateChanged, self));

	    jsxc.gui.window.postMessage({
	      bid : bid, direction : jsxc.Message.SYS, msg : jsxc.t('Incoming_call')
	    });

	    // display notification
	    jsxc.notification.notify(jsxc.t('Incoming_call'), jsxc.t('from_sender', {
	      sender : bid
	    }));

	    // send signal to partner
	    session.ring();

	    jsxc.webrtc.last_caller = session.peerID;

	    if (jsxc.webrtc.AUTO_ACCEPT) {
	      self.reqUserMedia();
	      return;
	    }

	    var dialog = jsxc.gui.dialog.open(jsxc.gui.template.get('incomingCall', bid), {
	      noClose : true
	    });

	    dialog.find('.jsxc_accept').click(function() {
	      $(document).trigger('accept.call.jsxc');

	      jsxc.switchEvents({
	        'mediaready.jingle' : function(event, stream) {
	          self.setStatus('Accept call');

	          session.addStream(stream);

	          session.accept();
	        }, 'mediafailure.jingle' : function() {
	          session.decline();
	        }
	      });

	      self.reqUserMedia();
	    });

	    dialog.find('.jsxc_reject').click(function() {
	      jsxc.gui.dialog.close();
	      $(document).trigger('reject.call.jsxc');

	      session.decline();
	    });
	  },

	  onTerminated : function(session, reason) {
	    var self = jsxc.webrtc;
	    var type = (session.constructor) ? session.constructor.name : null;

	    if (type === 'MediaSession') {
	      self.onCallTerminated(session, reason);
	    }
	  },

	  /**
	   * Called if call is terminated.
	   *
	   * @private
	   * @memberOf jsxc.webrtc
	   * @param event
	   * @param sid Session id
	   * @param reason Reason for termination
	   * @param [text] Optional explanation
	   */
	  onCallTerminated : function(session, reason) {
	    this.setStatus(
	        'call terminated ' + session.peerID + (reason && reason.condition ? reason.condition : ''));

	    var bid = jsxc.jidToBid(session.peerID);

	    if (this.localStream) {
	      if (typeof this.localStream.stop === 'function') {
	        this.localStream.stop();
	      } else {
	        var tracks = this.localStream.getTracks();
	        tracks.forEach(function(track) {
	          track.stop();
	        });
	      }
	    }

	    if ($('.jsxc_videoContainer').length) {
	      $('.jsxc_remotevideo')[0].src = "";
	      $('.jsxc_localvideo')[0].src = "";
	    }

	    this.conn.jingle.localStream = null;
	    this.localStream = null;
	    this.remoteStream = null;

	    jsxc.gui.closeVideoWindow();

	    $(document).off('error.jingle');

	    jsxc.gui.window.postMessage({
	      bid : bid,
	      direction : jsxc.Message.SYS,
	      msg : (jsxc.t('Call_terminated') +
	      (reason && reason.condition ? (': ' + jsxc.t('jingle_reason_' + reason.condition)) : '') +
	      '.')
	    });
	  },

	  /**
	   * Remote station is ringing.
	   *
	   * @private
	   * @memberOf jsxc.webrtc
	   */
	  onCallRinging : function() {
	    this.setStatus('ringing...', 0);
	  },

	  /**
	   * Called if we receive a remote stream.
	   *
	   * @private
	   * @memberOf jsxc.webrtc
	   * @param event
	   * @param data
	   * @param sid Session id
	   */
	  onRemoteStreamAdded : function(session, stream) {

	    jsxc.stats.addEvent("jsxc.webrtc.call.remote-stream-received");

	    this.setStatus('Remote stream for session ' + session.sid + ' added.');

	    this.remoteStream = stream;

	    var isVideoDevice = stream.getVideoTracks().length > 0;
	    var isAudioDevice = stream.getAudioTracks().length > 0;

	    this.setStatus(isVideoDevice ? 'Use remote video device.' : 'No remote video device');
	    this.setStatus(isAudioDevice ? 'Use remote audio device.' : 'No remote audio device');

	    if ($('.jsxc_remotevideo').length) {
	      this.attachMediaStream($('#jsxc_webrtc .jsxc_remotevideo'), stream);

	      $('#jsxc_webrtc .jsxc_' + (isVideoDevice ? 'remotevideo' : 'noRemoteVideo')).addClass(
	          'jsxc_deviceAvailable');
	    }
	  },

	  /**
	   * Attach media stream to element.
	   *
	   * @memberOf jsxc.webrtc
	   * @param element {Element|jQuery}
	   * @param stream {mediastream}
	   */
	  attachMediaStream : function(element, stream) {
	    var self = jsxc.webrtc;

	    self.conn.jingle.RTC.attachMediaStream((element instanceof jQuery) ? element.get(0) : element,
	        stream);
	  },

	  /**
	   * Called if the remote stream was removed.
	   *
	   * @private
	   * @meberOf jsxc.webrtc
	   * @param event
	   * @param data
	   * @param sid Session id
	   */
	  onRemoteStreamRemoved : function(session) {
	    this.setStatus('Remote stream for ' + session.jid + ' removed.');

	    //@TODO clean up
	  },

	  /**
	   * Extracts local and remote ip and display it to the user.
	   *
	   * @private
	   * @memberOf jsxc.webrtc
	   * @param event
	   * @param sid session id
	   * @param sess
	   */
	  onIceConnectionStateChanged : function(session, state) {
	    var self = jsxc.webrtc;

	    jsxc.debug('connection state for ' + session.sid, state);

	    if (state === 'connected') {

	      $('#jsxc_webrtc .jsxc_deviceAvailable').show();
	      $('#jsxc_webrtc .bubblingG').hide();

	    } else if (state === 'failed') {
	      jsxc.gui.window.postMessage({
	        bid : jsxc.jidToBid(session.peerID),
	        direction : jsxc.Message.SYS,
	        msg : jsxc.t('ICE_connection_failure')
	      });

	      session.end('failed-transport');

	      $(document).trigger('callterminated.jingle');
	    } else if (state === 'interrupted') {
	      self.setStatus(jsxc.t('Connection_interrupted'));
	    }
	  },

	  /**
	   * Start a call to the specified jid.
	   *
	   * @memberOf jsxc.webrtc
	   * @param jid full jid
	   * @param um requested user media
	   */
	  startCall : function(jid, um) {
	    var self = this;

	    if (Strophe.getResourceFromJid(jid) === null) {
	      jsxc.debug('We need a full jid');
	      return;
	    }

	    self.last_caller = jid;

	    jsxc.switchEvents({
	      'finish.mediaready.jsxc' : function() {
	        self.setStatus('Initiate call');

	        jsxc.gui.window.postMessage({
	          bid : jsxc.jidToBid(jid), direction : jsxc.Message.SYS, msg : jsxc.t('Call_started')
	        });

	        $(document).one('error.jingle', function(e, sid, error) {
	          if (error && error.source !== 'offer') {
	            return;
	          }

	          setTimeout(function() {
	            jsxc.gui.showAlert(
	                "Sorry, we couldn't establish a connection. Maybe your buddy is offline.");
	          }, 500);
	        });

	        var session = self.conn.jingle.initiate(jid);

	        session.on('change:connectionState', $.proxy(self.onIceConnectionStateChanged, self));
	      }, 'mediafailure.jingle' : function() {

	        // Are all window closed on a failure ?
	        jsxc.gui.dialog.close();
	      }
	    });

	    self.reqUserMedia(um);
	  },

	  /**
	   * Hang up the current call.
	   *
	   * @memberOf jsxc.webrtc
	   */
	  hangUp : function(reason, text) {
	    if (jsxc.webrtc.conn.jingle.manager &&
	        !$.isEmptyObject(jsxc.webrtc.conn.jingle.manager.peers)) {
	      jsxc.webrtc.conn.jingle.terminate(null, reason, text);
	    } else {
	      jsxc.gui.closeVideoWindow();
	    }

	    // @TODO check event
	    $(document).trigger('callterminated.jingle');
	  },

	  /**
	   * Request video and audio from local user.
	   *
	   * @memberOf jsxc.webrtc
	   */
	  reqUserMedia : function(um) {
	    if (this.localStream) {
	      $(document).trigger('mediaready.jingle', [this.localStream]);
	      return;
	    }

	    um = um || ['video', 'audio'];

	    jsxc.gui.dialog.open(jsxc.gui.template.get('allowMediaAccess'), {
	      noClose : true
	    });

	    this.setStatus('please allow access to microphone and camera');

	    if (typeof MediaStreamTrack !== 'undefined' &&
	        typeof MediaStreamTrack.getSources !== 'undefined') {
	      MediaStreamTrack.getSources(function(sourceInfo) {
	        var availableDevices = sourceInfo.map(function(el) {

	          return el.kind;
	        });

	        um = um.filter(function(el) {
	          return availableDevices.indexOf(el) !== -1;
	        });

	        jsxc.webrtc.getUserMedia(um);
	      });
	    } else {
	      jsxc.webrtc.getUserMedia(um);
	    }
	  },

	  getUserMedia : function(um) {
	    var self = jsxc.webrtc;
	    var constraints = {};

	    if (um.indexOf('video') > -1) {
	      constraints.video = true;
	    }

	    if (um.indexOf('audio') > -1) {
	      constraints.audio = true;
	    }

	    try {
	      self.conn.jingle.RTC.getUserMedia(constraints, function(stream) {
	        jsxc.debug('onUserMediaSuccess');
	        $(document).trigger('mediaready.jingle', [stream]);
	      }, function(error) {
	        jsxc.warn('Failed to get access to local media. Error ', error);
	        $(document).trigger('mediafailure.jingle', [error]);
	      });
	    } catch (e) {
	      jsxc.error('GUM failed: ', e);
	      $(document).trigger('mediafailure.jingle');
	    }
	  },

	  /**
	   * Make a snapshot from a video stream and display it.
	   *
	   * @memberOf jsxc.webrtc
	   * @param video Video stream
	   */
	  snapshot : function(video) {
	    if (!video) {
	      jsxc.debug('Missing video element');
	    }

	    $('.jsxc_snapshotbar p').remove();

	    var canvas = $('<canvas/>').css('display', 'none').appendTo('body').attr({
	      width : video.width(), height : video.height()
	    }).get(0);
	    var ctx = canvas.getContext('2d');

	    ctx.drawImage(video[0], 0, 0);
	    var img = $('<img/>');
	    var url = null;

	    try {
	      url = canvas.toDataURL('image/jpeg');
	    } catch (err) {
	      jsxc.warn('Error', err);
	      return;
	    }

	    img[0].src = url;
	    var link = $('<a/>').attr({
	      target : '_blank', href : url
	    });
	    link.append(img);
	    $('.jsxc_snapshotbar').append(link);

	    canvas.remove();
	  },

	  /**
	   * Send file to full jid.
	   *
	   * @memberOf jsxc.webrtc
	   * @param  {string} jid full jid
	   * @param  {file} file
	   * @return {object} session
	   */
	  sendFile : function(jid, file) {

	    jsxc.stats.addEvent("jsxc.webrtc.file.sent");

	    var self = jsxc.webrtc;

	    var sess = self.conn.jingle.manager.createFileTransferSession(jid);

	    sess.on('change:sessionState', function() {
	      jsxc.debug('Session state', sess.state);
	    });
	    sess.on('change:connectionState', function() {
	      jsxc.debug('Connection state', sess.connectionState);
	    });

	    sess.start(file);

	    return sess;
	  },

	  /**
	   * Display received file.
	   *
	   * @memberOf jsxc.webrtc
	   * @param  {object} sess
	   * @param  {File} file
	   * @param  {object} metadata file metadata
	   */
	  onReceivedFile : function(sess, file, metadata) {
	    jsxc.debug('file received', metadata);

	    if (!FileReader) {
	      return;
	    }

	    var reader = new FileReader();
	    var type;

	    if (!metadata.type) {
	      // detect file type via file extension, because XEP-0234 v0.14
	      // does not send any type
	      var ext = metadata.name.replace(/.+\.([a-z0-9]+)$/i, '$1').toLowerCase();

	      switch (ext) {
	        case 'jpg':
	        case 'jpeg':
	        case 'png':
	        case 'gif':
	        case 'svg':
	          type = 'image/' + ext.replace(/^jpg$/, 'jpeg');
	          break;
	        case 'mp3':
	        case 'wav':
	          type = 'audio/' + ext;
	          break;
	        case 'pdf':
	          type = 'application/pdf';
	          break;
	        case 'txt':
	          type = 'text/' + ext;
	          break;
	        default:
	          type = 'application/octet-stream';
	      }
	    } else {
	      type = metadata.type;
	    }

	    reader.onload = function(ev) {
	      // modify element with uid metadata.actualhash

	      jsxc.gui.window.postMessage({
	        _uid : sess.sid + ':msg',
	        bid : jsxc.jidToBid(sess.peerID),
	        direction : jsxc.Message.IN,
	        attachment : {
	          name : metadata.name, type : type, size : metadata.size, data : ev.target.result
	        }
	      });
	    };

	    if (!file.type) {
	      // file type should be handled in lib
	      file = new File([file], metadata.name, {
	        type : type
	      });
	    }

	    reader.readAsDataURL(file);
	  }
	};

	/**
	 * Display window for video call.
	 *
	 * @memberOf jsxc.gui
	 */
	jsxc.gui.showVideoWindow = function(jid) {
	  var self = jsxc.webrtc;

	  // needed to trigger complete.dialog.jsxc
	  jsxc.gui.dialog.close();

	  $('body').append(jsxc.gui.template.get('videoWindow'));

	  // mute own video element to avoid echoes
	  $('#jsxc_webrtc .jsxc_localvideo')[0].muted = true;
	  $('#jsxc_webrtc .jsxc_localvideo')[0].volume = 0;

	  var rv = $('#jsxc_webrtc .jsxc_remotevideo');
	  var lv = $('#jsxc_webrtc .jsxc_localvideo');

	  lv.draggable({
	    containment : "parent"
	  });

	  if (self.localStream) {
	    self.attachMediaStream(lv, self.localStream);
	  }

	  var w_dialog = $('#jsxc_webrtc').width();
	  var w_remote = rv.width();

	  // fit in video
	  if (w_remote > w_dialog) {
	    var scale = w_dialog / w_remote;
	    var new_h = rv.height() * scale;
	    var new_w = w_dialog;
	    var vc = $('#jsxc_webrtc .jsxc_videoContainer');

	    rv.height(new_h);
	    rv.width(new_w);

	    vc.height(new_h);
	    vc.width(new_w);

	    lv.height(lv.height() * scale);
	    lv.width(lv.width() * scale);
	  }

	  if (self.remoteStream) {
	    self.attachMediaStream(rv, self.remoteStream);

	    $('#jsxc_webrtc .jsxc_' +
	        (self.remoteStream.getVideoTracks().length > 0 ? 'remotevideo' : 'noRemoteVideo')).addClass(
	        'jsxc_deviceAvailable');
	  }

	  var win = jsxc.gui.window.open(jsxc.jidToBid(jid));

	  win.find('.slimScrollDiv').resizable('disable');
	  jsxc.gui.window.resize(win, {
	    size : {
	      width : $('#jsxc_webrtc .jsxc_chatarea').width(),
	      height : $('#jsxc_webrtc .jsxc_chatarea').height()
	    }
	  }, true);

	  $('#jsxc_webrtc .jsxc_chatarea ul').append(win.detach());

	  $('#jsxc_webrtc .jsxc_hangUp').click(function() {
	    jsxc.webrtc.hangUp('success');
	  });

	  $('#jsxc_webrtc .jsxc_fullscreen').click(function() {

	    if ($.support.fullscreen) {
	      // Reset position of localvideo
	      $(document).one('disabled.fullscreen', function() {
	        lv.removeAttr('style');
	      });

	      $('#jsxc_webrtc .jsxc_videoContainer').fullscreen();
	    }
	  });

	  $('#jsxc_webrtc .jsxc_videoContainer').click(function() {
	    $('#jsxc_webrtc .jsxc_controlbar').toggleClass('jsxc_visible');
	  });

	  return $('#jsxc_webrtc');
	};

	jsxc.gui.closeVideoWindow = function() {
	  var win = $('#jsxc_webrtc .jsxc_chatarea > ul > li');
	  $('#jsxc_windowList > ul').prepend(win.detach());
	  win.find('.slimScrollDiv').resizable('enable');
	  jsxc.gui.window.resize(win);

	  $('#jsxc_webrtc').remove();
	};

	$.extend(jsxc.CONST, {
	  KEYCODE_ENTER : 13, KEYCODE_ESC : 27
	});

	$(document).ready(function() {
	  if (jsxc.multimediaStreamSystem && jsxc.multimediaStreamSystem === "original") {
	    $(document).on('init.window.jsxc', jsxc.webrtc.initWindow);
	    $(document).on('attached.jsxc', jsxc.webrtc.init);
	    $(document).on('disconnected.jsxc', jsxc.webrtc.onDisconnected);
	    $(document).on('connected.jsxc', jsxc.webrtc.onConnected);
	  }
	});

	/**
	 * Load and save bookmarks according to XEP-0048.
	 *
	 * @namespace jsxc.xmpp.bookmarks
	 */
	jsxc.xmpp.bookmarks = {};

	/**
	 * Determines if server is able to store bookmarks.
	 *
	 * @return {boolean} True: Server supports bookmark storage
	 */
	jsxc.xmpp.bookmarks.remote = function () {

	    // here caps doesn't work properly, issue in progress

	    return jsxc.xmpp.conn.caps && jsxc.xmpp.hasFeatureByJid(jsxc.xmpp.conn.domain, Strophe.NS.PUBSUB + "#publish");
	};

	/**
	 * Load bookmarks from pubsub.
	 *
	 * @memberOf jsxc.xmpp.bookmarks
	 */
	jsxc.xmpp.bookmarks.load = function () {

	    // remote() arent't working correctly.
	    // and bookmarks have to be loaded at every startup from server

	    /**

	     var caps = jsxc.xmpp.conn.caps;
	     var ver = caps._jidVerIndex[jsxc.xmpp.conn.domain];

	     if (!ver || !caps._knownCapabilities[ver]) {
	        // wait until we know server capabilities
	        $(document).on('caps.strophe', function(ev, from) {
	            if (from === jsxc.xmpp.conn.domain) {
	                jsxc.xmpp.bookmarks.load();

	                $(document).off(ev);
	            }
	        });
	    }

	     if (jsxc.xmpp.bookmarks.remote()) {
	        jsxc.xmpp.bookmarks.loadFromRemote();
	    } else {
	        jsxc.xmpp.bookmarks.loadFromLocal();
	    }
	     */

	    jsxc.xmpp.bookmarks.loadFromRemote();
	};

	/**
	 * Load bookmarks from local storage.
	 *
	 * @private
	 */
	jsxc.xmpp.bookmarks.loadFromLocal = function () {
	    jsxc.debug('Load bookmarks from local storage');

	    var bookmarks = jsxc.storage.getUserItem('bookmarks') || [];
	    var bl = jsxc.storage.getUserItem('buddylist') || [];

	    $.each(bookmarks, function () {
	        var room = this;
	        var roomdata = jsxc.storage.getUserItem('buddy', room) || {};

	        bl.push(room);
	        jsxc.gui.roster.add(room);

	        if (roomdata.autojoin) {
	            jsxc.debug('auto join ' + room);
	            jsxc.xmpp.conn.muc.join(room, roomdata.nickname);
	        }
	    });

	    jsxc.storage.setUserItem('buddylist', bl);
	};

	/**
	 * Load bookmarks from remote storage.
	 *
	 * @private
	 */
	jsxc.xmpp.bookmarks.loadFromRemote = function () {
	    jsxc.debug('Load bookmarks from pubsub');

	    var bookmarks = jsxc.xmpp.conn.bookmarks;

	    bookmarks.get(function (stanza) {
	        var bl = jsxc.storage.getUserItem('buddylist');

	        $(stanza).find('conference').each(function () {
	            var conference = $(this);
	            var room = conference.attr('jid');
	            var roomName = conference.attr('name') || room;
	            var autojoin = conference.attr('autojoin') || false;
	            var nickname = conference.find('nick').text();
	            nickname = (nickname.length > 0) ? nickname : Strophe.getNodeFromJid(jsxc.xmpp.conn.jid);

	            if (autojoin === 'true') {
	                autojoin = true;
	            } else if (autojoin === 'false') {
	                autojoin = false;
	            }

	            var data = jsxc.storage.getUserItem('buddy', room) || {};

	            data = $.extend(data, {
	                jid: room,
	                name: roomName,
	                sub: 'both',
	                status: 0,
	                type: 'groupchat',
	                state: jsxc.muc.CONST.ROOMSTATE.INIT,
	                subject: null,
	                bookmarked: true,
	                autojoin: autojoin,
	                nickname: nickname
	            });

	            jsxc.storage.setUserItem('buddy', room, data);

	            bl.push(room);
	            jsxc.gui.roster.add(room);

	            if (autojoin) {
	                jsxc.debug('auto join ' + room);
	                jsxc.xmpp.conn.muc.join(room, nickname);
	            }
	        });

	        jsxc.storage.setUserItem('buddylist', bl);
	    }, function (stanza) {
	        var err = jsxc.xmpp.bookmarks.parseErr(stanza);

	        if (err.reasons[0] === 'item-not-found') {
	            jsxc.debug('create bookmark node');

	            bookmarks.createBookmarksNode();
	        } else {
	            jsxc.debug('[XMPP] Could not create bookmark: ' + err.type, err.reasons);
	        }
	    });
	};

	/**
	 * Parse received error.
	 *
	 * @param  {string} stanza
	 * @return {object} err - The parsed error
	 * @return {string} err.type - XMPP error type
	 * @return {array} err.reasons - Array of error reasons
	 */
	jsxc.xmpp.bookmarks.parseErr = function (stanza) {
	    var error = $(stanza).find('error');
	    var type = error.attr('type');
	    var reasons = error.children().map(function () {
	        return $(this).prop('tagName');
	    });

	    return {
	        type: type,
	        reasons: reasons
	    };
	};

	/**
	 * Deletes the bookmark for the given room and removes it from the roster if soft is false.
	 *
	 * @param  {string} room - room jid
	 * @param  {boolean} [soft=false] - True: leave room in roster
	 */
	jsxc.xmpp.bookmarks.delete = function (room, soft) {

	    if (!soft) {
	        jsxc.gui.roster.purge(room);
	    }

	    // remote doesnt work properly

	    jsxc.xmpp.bookmarks.deleteFromRemote(room, soft);

	    // if (jsxc.xmpp.bookmarks.remote()) {
	    //     jsxc.xmpp.bookmarks.deleteFromRemote(room, soft);
	    // } else {
	    //     jsxc.xmpp.bookmarks.deleteFromLocal(room, soft);
	    // }
	};

	/**
	 * Delete bookmark from remote storage.
	 *
	 * @private
	 * @param  {string} room - room jid
	 * @param  {boolean} [soft=false] - True: leave room in roster
	 */
	jsxc.xmpp.bookmarks.deleteFromRemote = function (room, soft) {
	    var bookmarks = jsxc.xmpp.conn.bookmarks;

	    bookmarks.delete(room, function () {
	        jsxc.debug('Bookmark deleted ' + room);

	        if (soft) {
	            jsxc.gui.roster.getItem(room).removeClass('jsxc_bookmarked');
	            jsxc.storage.updateUserItem('buddy', room, 'bookmarked', false);
	            jsxc.storage.updateUserItem('buddy', room, 'autojoin', false);
	        }
	    }, function (stanza) {
	        var err = jsxc.xmpp.bookmarks.parseErr(stanza);

	        jsxc.debug('[XMPP] Could not delete bookmark: ' + err.type, err.reasons);
	    });
	};

	/**
	 * Delete bookmark from local storage.
	 *
	 * @private
	 * @param  {string} room - room jid
	 * @param  {boolean} [soft=false] - True: leave room in roster
	 */
	jsxc.xmpp.bookmarks.deleteFromLocal = function (room, soft) {
	    var bookmarks = jsxc.storage.getUserItem('bookmarks');
	    var index = bookmarks.indexOf(room);

	    if (index > -1) {
	        bookmarks.splice(index, 1);
	    }

	    jsxc.storage.setUserItem('bookmarks', bookmarks);

	    if (soft) {
	        jsxc.gui.roster.getItem(room).removeClass('jsxc_bookmarked');
	        jsxc.storage.updateUserItem('buddy', room, 'bookmarked', false);
	        jsxc.storage.updateUserItem('buddy', room, 'autojoin', false);
	    }
	};

	/**
	 * Adds or overwrites bookmark for given room.
	 *
	 * @param  {string} room - room jid
	 * @param  {string} alias - room alias
	 * @param  {string} nick - preferred user nickname
	 * @param  {boolean} autojoin - should we join this room after login?
	 */
	jsxc.xmpp.bookmarks.add = function (room, alias, nick, autojoin) {

	    // remote doesn't work properly

	    jsxc.xmpp.bookmarks.addToRemote(room, alias, nick, autojoin);

	    // if (jsxc.xmpp.bookmarks.remote()) {
	    //     jsxc.xmpp.bookmarks.addToRemote(room, alias, nick, autojoin);
	    // } else {
	    //     jsxc.xmpp.bookmarks.addToLocal(room, alias, nick, autojoin);
	    // }
	};

	/**
	 * Adds or overwrites bookmark for given room in remote storage.
	 *
	 * @private
	 * @param  {string} room - room jid
	 * @param  {string} alias - room alias
	 * @param  {string} nick - preferred user nickname
	 * @param  {boolean} autojoin - should we join this room after login?
	 */
	jsxc.xmpp.bookmarks.addToRemote = function (room, alias, nick, autojoin) {
	    var bookmarks = jsxc.xmpp.conn.bookmarks;

	    var success = function () {
	        jsxc.debug('New bookmark created', room);

	        jsxc.gui.roster.getItem(room).addClass('jsxc_bookmarked');
	        jsxc.storage.updateUserItem('buddy', room, 'bookmarked', true);
	        jsxc.storage.updateUserItem('buddy', room, 'autojoin', autojoin);
	        jsxc.storage.updateUserItem('buddy', room, 'nickname', nick);
	    };
	    var error = function () {
	        jsxc.warn('Could not create bookmark', room);
	    };

	    bookmarks.add(room, alias, nick, autojoin, success, error);
	};

	/**
	 * Adds or overwrites bookmark for given room in local storage.
	 *
	 * @private
	 * @param  {string} room - room jid
	 * @param  {string} alias - room alias
	 * @param  {string} nick - preferred user nickname
	 * @param  {boolean} autojoin - should we join this room after login?
	 */
	jsxc.xmpp.bookmarks.addToLocal = function (room, alias, nick, autojoin) {
	    jsxc.gui.roster.getItem(room).addClass('jsxc_bookmarked');
	    jsxc.storage.updateUserItem('buddy', room, 'bookmarked', true);
	    jsxc.storage.updateUserItem('buddy', room, 'autojoin', autojoin);
	    jsxc.storage.updateUserItem('buddy', room, 'nickname', nick);

	    var bookmarks = jsxc.storage.getUserItem('bookmarks') || [];

	    if (bookmarks.indexOf(room) < 0) {
	        bookmarks.push(room);

	        jsxc.storage.setUserItem('bookmarks', bookmarks);
	    }
	};

	/**
	 * Show dialog to edit bookmark.
	 *
	 * @param  {string} room - room jid
	 */
	jsxc.xmpp.bookmarks.showDialog = function (room) {
	    var dialog = jsxc.gui.dialog.open(jsxc.gui.template.get('bookmarkDialog'));
	    var data = jsxc.storage.getUserItem('buddy', room);

	    $('#jsxc_room').val(room);
	    $('#jsxc_nickname').val(data.nickname);

	    $('#jsxc_bookmark').change(function () {
	        if ($(this).prop('checked')) {
	            $('#jsxc_nickname').prop('disabled', false);
	            $('#jsxc_autojoin').prop('disabled', false);
	            $('#jsxc_autojoin').parent('.checkbox').removeClass('disabled');
	        } else {
	            $('#jsxc_nickname').prop('disabled', true);
	            $('#jsxc_autojoin').prop('disabled', true).prop('checked', false);
	            $('#jsxc_autojoin').parent('.checkbox').addClass('disabled');
	        }
	    });

	    $('#jsxc_bookmark').prop('checked', data.bookmarked);
	    $('#jsxc_autojoin').prop('checked', data.autojoin);

	    $('#jsxc_bookmark').change();

	    dialog.find('form').submit(function (ev) {
	        ev.preventDefault();

	        var bookmarked = $('#jsxc_bookmark').prop('checked');
	        var autojoin = $('#jsxc_autojoin').prop('checked');
	        var nickname = $('#jsxc_nickname').val();

	        if (bookmarked) {
	            jsxc.xmpp.bookmarks.add(room, data.name, nickname, autojoin);
	        } else if (data.bookmarked) {
	            // bookmarked === false
	            jsxc.xmpp.bookmarks.delete(room, true);
	        }

	        jsxc.gui.dialog.close();

	        return false;
	    });
	};
	/**
	 * Implements user search (XEP 0055)
	 *
	 *
	 */
	jsxc.xmpp.search = {

	    /**
	     * Where connection is stored
	     *
	     */
	    conn: null,

	    /**
	     * Domain for search. If not set at init{xmpp:{...}} domain will be used
	     *
	     */
	    searchDomain: null,

	    /**
	     * True if user search is available
	     */
	    userSearchAvailable: false,

	    /**
	     * Initialize search functionnalities
	     */
	    init: function () {

	        //console.log("jsxc.lib.xmpp.search.init()");

	        var self = jsxc.xmpp.search;

	        // shortcut
	        self.conn = jsxc.xmpp.conn;

	        // retrieve domain
	        var xmppOpts = jsxc.options.get("xmpp");
	        self.searchDomain = xmppOpts.searchDomain;

	        if(typeof self.searchDomain === "undefined"){
	            self.searchDomain = xmppOpts.domain;
	            jsxc.warn('Search domain not found, domain will be used', xmppOpts.domain);
	        }

	        // first request to know if search is available
	        self.requestForSearchCapabilities().then(function () {
	            //console.log(arguments);
	        });

	        // set user cache
	        self.getUserList();

	    },

	    /**
	     * Return true if user search is available
	     * @returns {boolean}
	     */
	    isUserSearchAvailable: function () {
	        var self = jsxc.xmpp.search;
	        return self.userSearchAvailable;
	    },

	    /**
	     * Cache for ALL users list
	     */
	    userListCache: undefined,

	    /**
	     * Check an array of users and add a field "_is_buddy" to each user.
	     *
	     * <p>/!\ Work directly on the array
	     *
	     * @param userArr
	     * @returns {*}
	     */
	    checkIfBuddies: function (userArr) {

	        // list of buddies to check
	        var buddies = jsxc.storage.getLocaleBuddyListBJID();

	        $.each(userArr, function (i, e) {
	            // check if is a buddy
	            e["_is_buddy"] = buddies.indexOf(jsxc.jidToBid(e.jid)) !== -1;
	        });

	        return userArr;
	    },

	    /**
	     * Return a promise containing all users in an array or an empty array
	     *
	     * <p>Response is stored in cache
	     *
	     * <p>Each entry of the array contains:
	     * mail, jid, name, username, _is_buddy
	     *
	     */
	    getUserList: function () {

	        var self = jsxc.xmpp.search;

	        var defer = $.Deferred();

	        // list is already present, return false promise
	        if (self.userListCache) {

	            // clone array
	            var clone = JSON.parse(JSON.stringify(self.userListCache));

	            // check buddies another time
	            self.checkIfBuddies(clone);

	            // send list of users
	            defer.resolve(clone);

	            // console.log("cached user list");
	            // console.log(self.userListCache.length);

	        }

	        else {
	            self.searchUsers("*").then(
	                // successful
	                function (result) {

	                    // here buddies are checked by search function

	                    self.userListCache = result;
	                    defer.resolve(JSON.parse(JSON.stringify(self.userListCache)));

	                    // console.log("new user list");
	                    // console.log(self.userListCache.length);

	                },

	                // not successful
	                function () {
	                    defer.reject();
	                });
	        }

	        return defer.promise();
	    },

	    /**
	     * Get new user list
	     *
	     * @returns {*}
	     */
	    getFreshUserList: function () {

	        var self = jsxc.xmpp.search;
	        self.userListCache = undefined;

	        return self.getUserList();
	    },

	    /**
	     * Return a promise containing all users corresponding to "terms" in an array or an empty array
	     *
	     * <p>Wildcards "*" are allowed
	     *
	     * <p>Each entry of the array contains:
	     * mail, jid, name, username, _is_buddy
	     *
	     */
	    searchUsers: function (terms) {

	        var self = jsxc.xmpp.search;

	        // iq id for filtering
	        var userListRequest;

	        // send XMPP request to get all users
	        var iq = $iq({
	            type: 'set',
	            to: self.searchDomain
	        })
	            .c('query', {xmlns: 'jabber:iq:search'})
	            .c('x', {xmlns: 'jabber:x:data', type: 'submit'})
	            .c('field', {type: 'hidden', var: 'FORM_TYPE'})
	            .c('value', 'jabber:iq:search').up().up()
	            .c('field', {var: 'search', type: "text-single"})
	            .c('value', terms).up().up()
	            .c('field', {var: 'Username', type: "boolean"})
	            .c('value', '1').up().up()
	            .c('field', {var: 'Name', type: "boolean"})
	            .c('value', '1').up().up();

	        // response in a promise
	        var defer = $.Deferred();

	        if (!self.conn) {
	            jsxc.warn("Search not available: not connected !");

	            var falsePromise = defer.promise();
	            falsePromise.fail("Not connected !");

	            return falsePromise;
	        }

	        // send request after regitered handler
	        userListRequest = self.conn.sendIQ(
	            iq,

	            // successful request
	            function (stanza) {

	                // console.log("userListRequest = self.conn.sendIQ(");
	                // console.log("ok");
	                // console.log($(stanza).get(0));

	                var id = $(stanza).attr('id');

	                // ignore not interesting messages
	                if (id !== userListRequest) {
	                    return true;
	                }

	                // error while retieving users
	                if ($(stanza).find("error").length > 0) {

	                    defer.reject();

	                    // remove handler when finished
	                    return false;
	                }

	                var result = [];

	                // browse items and create object
	                $(stanza).find("item").each(function () {

	                    var r = {};

	                    // browse fields and get values
	                    $(this).find("field").each(function () {
	                        r[$(this).attr("var").toLowerCase()] = $(this).text();
	                    });

	                    result.push(r);

	                });

	                self.checkIfBuddies(result);

	                // send list of item
	                defer.resolve(result);

	            },

	            // error
	            function () {
	                // console.log("userListRequest = self.conn.sendIQ(");
	                // console.log("fail");
	                // console.log($(stanza).get(0));

	                defer.reject();
	            }
	        );

	        // return a promise
	        return defer.promise();
	    },

	    /**
	     * Send request to know if search is available.
	     *
	     * <p>Designed to be called only one time at init.
	     *
	     * <p>If need more, need to be improved with promises
	     *
	     * <p>If search is available isUserSearchAvailable() return true.
	     */
	    requestForSearchCapabilities: function () {

	        var self = jsxc.xmpp.search;

	        // id of the XMPP request for filtering
	        var capabilityRequestId;

	        // request
	        var iq = $iq({
	            type: 'get',
	            to: self.searchDomain
	        }).c('query', {
	            xmlns: 'jabber:iq:search'
	        });

	        // response in a promise
	        var defer = $.Deferred();

	        // send request
	        capabilityRequestId = self.conn.sendIQ(

	            iq,

	            // success
	            function (stanza) {
	                self.userSearchAvailable = $(stanza).find("error").length === 0;

	                defer.resolve(self.userSearchAvailable);
	            },

	            // error
	            function () {
	                self.userSearchAvailable = false;

	                defer.reject(self.userSearchAvailable);
	            }
	        );

	        // return a promise
	        return defer.promise();
	    },


	};

	/**
	 * Initialize user search module. Executed at each connexion.
	 */
	$(document).ready(function () {
	    $(document).on('attached.jsxc', jsxc.xmpp.search.init);
	});


	jsxc.gui.template['aboutDialog'] = '<h3>JavaScript XMPP Chat</h3>\n' +
	'<p>\n' +
	'   <b>Version: </b>{{version}}\n' +
	'   <br /> <a href="http://jsxc.org/" target="_blank">www.jsxc.org</a>\n' +
	'</p>\n' +
	'<p>\n' +
	'   <i>Released under the MIT license</i>\n' +
	'</p>\n' +
	'<p>\n' +
	'   Real-time chat app for {{app_name}} and more.\n' +
	'   <br /> Requires an external <a href="https://xmpp.org/xmpp-software/servers/" target="_blank">XMPP server</a>.\n' +
	'</p>\n' +
	'<p class="jsxc_credits">\n' +
	'   <b>Credits: </b> <a href="http://www.beepzoid.com/old-phones/" target="_blank">David English (Ringtone)</a>,\n' +
	'   <a href="https://soundcloud.com/freefilmandgamemusic/ping-1?in=freefilmandgamemusic/sets/free-notification-sounds-and" target="_blank">CameronMusic (Ping)</a>,\n' +
	'   <a href="http://www.picol.org/">Picol (Fullscreen icon)</a>, <a href="http://www.jabber.org/">Jabber Software Foundation (Jabber lightbulb logo)</a>\n' +
	'</p>\n' +
	'<p class="jsxc_libraries">\n' +
	'   <b>Libraries: </b>\n' +
	'   <$ dep.libraries $>\n' +
	'</p>\n' +
	'\n' +
	'<button class="btn btn-default pull-right jsxc_debuglog">Show debug log</button>\n' +
	'';

	jsxc.gui.template['alert'] = '<h3 data-i18n="Alert"></h3>\n' +
	'<div class="alert alert-info">\n' +
	'   <strong data-i18n="Info"></strong> {{msg}}\n' +
	'</div>\n' +
	'';

	jsxc.gui.template['allowMediaAccess'] = '<p data-i18n="Please_allow_access_to_microphone_and_camera"></p>\n' +
	'';

	jsxc.gui.template['approveDialog'] = '<h3 data-i18n="Subscription_request"></h3>\n' +
	'<p>\n' +
	'   <span data-i18n="You_have_a_request_from"></span> <b class="jsxc_their_jid"></b>.\n' +
	'</p>\n' +
	'\n' +
	'<button class="btn btn-primary jsxc_approve pull-right" data-i18n="Approve"></button>\n' +
	'<button class="btn btn-default jsxc_deny pull-right" data-i18n="Deny"></button>\n' +
	'';

	jsxc.gui.template['authFailDialog'] = '<h3 data-i18n="Login_failed"></h3>\n' +
	'<p data-i18n="Sorry_we_cant_authentikate_"></p>\n' +
	'\n' +
	'<button class="btn btn-primary jsxc_retry pull-right" data-i18n="Continue_without_chat"></button>\n' +
	'<button class="btn btn-default jsxc_cancel pull-right" data-i18n="Retry"></button>\n' +
	'';

	jsxc.gui.template['authenticationDialog'] = '<h3>Verification</h3>\n' +
	'<p data-i18n="Authenticating_a_buddy_helps_"></p>\n' +
	'<div>\n' +
	'   <p data-i18n="[html]How_do_you_want_to_authenticate_your_buddy"></p>\n' +
	'\n' +
	'   <div class="btn-group" role="group">\n' +
	'      <button class="btn btn-default" data-i18n="Manual"></button>\n' +
	'      <button class="btn btn-default" data-i18n="Question"></button>\n' +
	'      <button class="btn btn-default" data-i18n="Secret"></button>\n' +
	'   </div>\n' +
	'</div>\n' +
	'<hr />\n' +
	'<div style="display: none">\n' +
	'   <p data-i18n="To_verify_the_fingerprint_" class="jsxc_explanation"></p>\n' +
	'   <p>\n' +
	'      <strong data-i18n="Your_fingerprint"></strong>\n' +
	'      <br /> <span style="text-transform: uppercase">{{my_priv_fingerprint}}</span>\n' +
	'   </p>\n' +
	'   <p>\n' +
	'      <strong data-i18n="Buddy_fingerprint"></strong>\n' +
	'      <br /> <span style="text-transform: uppercase">{{bid_priv_fingerprint}}</span>\n' +
	'   </p>\n' +
	'   <div class="jsxc_right">\n' +
	'      <button class="btn btn-default jsxc_close" data-i18n="Close"></button>\n' +
	'      <button class="btn btn-primary jsxc_submit" data-i18n="Compared"></button>\n' +
	'   </div>\n' +
	'</div>\n' +
	'<div style="display: none" class="form-horizontal">\n' +
	'   <p data-i18n="To_authenticate_using_a_question_" class="jsxc_explanation"></p>\n' +
	'   <div class="form-group">\n' +
	'      <label class="col-sm-4 control-label" for="jsxc_quest" data-i18n="Question"></label>\n' +
	'      <div class="col-sm-8">\n' +
	'         <input type="text" name="quest" id="jsxc_quest" class="form-control" />\n' +
	'      </div>\n' +
	'   </div>\n' +
	'   <div class="form-group">\n' +
	'      <label class="col-sm-4 control-label" for="jsxc_secret2" data-i18n="Secret"></label>\n' +
	'      <div class="col-sm-8">\n' +
	'         <input type="text" name="secret2" id="jsxc_secret2" class="form-control" />\n' +
	'      </div>\n' +
	'   </div>\n' +
	'   <div class="form-group">\n' +
	'      <div class="col-sm-offset-4 col-sm-8">\n' +
	'         <button class="btn btn-default jsxc_close" data-i18n="Close"></button>\n' +
	'         <button class="btn btn-primary jsxc_submit" data-i18n="Ask"></button>\n' +
	'      </div>\n' +
	'   </div>\n' +
	'</div>\n' +
	'<div style="display: none" class="form-horizontal">\n' +
	'   <p class="jsxc_explanation" data-i18n="To_authenticate_pick_a_secret_"></p>\n' +
	'   <div class="form-group">\n' +
	'      <label class="col-sm-4 control-label" for="jsxc_secret" data-i18n="Secret"></label>\n' +
	'      <div class="col-sm-8">\n' +
	'         <input type="text" name="secret" id="jsxc_secret" class="form-control" />\n' +
	'      </div>\n' +
	'   </div>\n' +
	'   <div class="form-group">\n' +
	'      <div class="col-sm-offset-4 col-sm-8">\n' +
	'         <button class="btn btn-default jsxc_close" data-i18n="Close"></button>\n' +
	'         <button class="btn btn-primary jsxc_submit" data-i18n="Compare"></button>\n' +
	'      </div>\n' +
	'   </div>\n' +
	'</div>\n' +
	'';

	jsxc.gui.template['bookmarkDialog'] = '<h3 data-i18n="Edit_bookmark"></h3>\n' +
	'<form class="form-horizontal">\n' +
	'   <div class="form-group">\n' +
	'      <label class="col-sm-4 control-label" for="jsxc_room" data-i18n="Room"></label>\n' +
	'      <div class="col-sm-8">\n' +
	'         <input type="text" id="jsxc_room" class="form-control" required="required" readonly="readonly" />\n' +
	'      </div>\n' +
	'   </div>\n' +
	'   <div class="form-group">\n' +
	'      <label class="col-sm-4 control-label" for="jsxc_nickname" data-i18n="Nickname"></label>\n' +
	'      <div class="col-sm-8">\n' +
	'         <input type="text" disabled="disabled" required="required" name="nickname" id="jsxc_nickname" class="form-control" />\n' +
	'      </div>\n' +
	'   </div>\n' +
	'   <div class="form-group">\n' +
	'      <div class="col-sm-offset-4 col-sm-8">\n' +
	'         <div class="checkbox">\n' +
	'            <label>\n' +
	'               <input id="jsxc_bookmark" type="checkbox"><span data-i18n="Bookmark"></span>\n' +
	'            </label>\n' +
	'         </div>\n' +
	'      </div>\n' +
	'   </div>\n' +
	'   <div class="form-group">\n' +
	'      <div class="col-sm-offset-4 col-sm-8">\n' +
	'         <div class="checkbox disabled">\n' +
	'            <label>\n' +
	'               <input disabled="disabled" id="jsxc_autojoin" type="checkbox"><span data-i18n="Auto-join"></span>\n' +
	'            </label>\n' +
	'         </div>\n' +
	'      </div>\n' +
	'   </div>\n' +
	'   <div class="form-group">\n' +
	'      <div class="col-sm-offset-4 col-sm-8">\n' +
	'         <button type="button" class="btn btn-default jsxc_close" data-i18n="Close"></button>\n' +
	'         <button type="submit" class="btn btn-primary jsxc_submit" data-i18n="Save"></button>\n' +
	'      </div>\n' +
	'   </div>\n' +
	'</form>\n' +
	'';

	jsxc.gui.template['chatWindow'] = '<li class="jsxc_windowItem">\n' +
	'    <div class="jsxc_window">\n' +
	'        <div class="jsxc_bar">\n' +
	'            <div class="jsxc_avatar"></div>\n' +
	'            <div class="jsxc_tools">\n' +
	'                <div class="jsxc_settings">\n' +
	'                    <div class="jsxc_more"></div>\n' +
	'                    <div class="jsxc_inner jsxc_menu">\n' +
	'                        <ul>\n' +
	'                            <li>\n' +
	'                                <a class="jsxc_openpad" href="#">\n' +
	'                                    <span>Ouvrir un pad</span>\n' +
	'                                </a>\n' +
	'                            </li>\n' +
	'                            <li>\n' +
	'                                <a class="jsxc_verification" href="#">\n' +
	'                                    <span data-i18n="Authentication"></span>\n' +
	'                                </a>\n' +
	'                            </li>\n' +
	'                            <li>\n' +
	'                                <a class="jsxc_clear" href="#">\n' +
	'                                    <span data-i18n="clear_history"></span>\n' +
	'                                </a>\n' +
	'                            </li>\n' +
	'                            <li>\n' +
	'                                <a class="jsxc_sendFile" href="#">\n' +
	'                                    <span data-i18n="Send_file"></span>\n' +
	'                                </a>\n' +
	'                            </li>\n' +
	'                        </ul>\n' +
	'                    </div>\n' +
	'                </div>\n' +
	'                <div class="jsxc_close">×</div>\n' +
	'            </div>\n' +
	'            <div class="jsxc_caption">\n' +
	'                <div class="jsxc_name"/>\n' +
	'                <div class="jsxc_lastmsg">\n' +
	'                    <span class="jsxc_unread"/>\n' +
	'                    <span class="jsxc_text"/>\n' +
	'                </div>\n' +
	'            </div>\n' +
	'        </div>\n' +
	'        <div class="jsxc_fade">\n' +
	'            <div class="jsxc_overlay">\n' +
	'                <div>\n' +
	'                    <div class="jsxc_body"/>\n' +
	'                    <div class="jsxc_close"/>\n' +
	'                </div>\n' +
	'            </div>\n' +
	'            <div class="jsxc_textarea"/>\n' +
	'            <div class="jsxc_emoticons">\n' +
	'                <div class="jsxc_inner">\n' +
	'                    <ul>\n' +
	'                        <li style="clear:both"></li>\n' +
	'                    </ul>\n' +
	'                </div>\n' +
	'            </div>\n' +
	'            <div class="jsxc_transfer jsxc_otr jsxc_disabled"/>\n' +
	'            <input type="text" class="jsxc_textinput" data-i18n="[placeholder]Message"/>\n' +
	'        </div>\n' +
	'    </div>\n' +
	'</li>\n' +
	'';

	jsxc.gui.template['confirmDialog'] = '<p>{{msg}}</p>\n' +
	'\n' +
	'<button class="btn btn-primary jsxc_confirm pull-right" data-i18n="Confirm"></button>\n' +
	'<button class="btn btn-default jsxc_dismiss jsxc_close pull-right" data-i18n="Dismiss"></button>\n' +
	'';

	jsxc.gui.template['contactDialog'] = '<h3 data-i18n="Add_buddy"></h3>\n' +
	'<p class=".jsxc_explanation" data-i18n="Type_in_the_full_username_"></p>\n' +
	'<form class="form-horizontal">\n' +
	'   <div class="form-group">\n' +
	'      <label class="col-sm-4 control-label" for="jsxc_username" data-i18n="Username"></label>\n' +
	'      <div class="col-sm-8">\n' +
	'         <input type="text" name="username" id="jsxc_username" class="form-control" list="jsxc_userlist" pattern="^[^\\x22&\'\\\\/:<>@\\s]+(@[.\\-_\\w]+)?" required="required" />\n' +
	'      </div>\n' +
	'   </div>\n' +
	'   <datalist id="jsxc_userlist"></datalist>\n' +
	'   <div class="form-group">\n' +
	'      <label class="col-sm-4 control-label" for="jsxc_alias" data-i18n="Alias"></label>\n' +
	'      <div class="col-sm-8">\n' +
	'         <input type="text" name="alias" id="jsxc_alias" class="form-control" />\n' +
	'      </div>\n' +
	'   </div>\n' +
	'   <div class="form-group">\n' +
	'      <div class="col-sm-offset-4 col-sm-8">\n' +
	'         <button class="btn btn-default jsxc_close" type="button" data-i18n="Close"></button>\n' +
	'         <button class="btn btn-primary" type="submit" data-i18n="Add"></button>\n' +
	'      </div>\n' +
	'   </div>\n' +
	'</form>\n' +
	'';

	jsxc.gui.template['conversationSelectionDialog'] = '<h3>Sélection de conversation</h3>\n' +
	'<p class="jsxc_maxWidth">Sélectionner une ou plusieurs conversation(s) ci-dessous</p>\n' +
	'\n' +
	'<div id="jsxc_dialogConversationList"></div>\n' +
	'\n' +
	'<button class="btn btn-primary jsxc_confirm pull-right" data-i18n="Confirm"></button>\n' +
	'<button class="btn btn-default jsxc_cancel jsxc_close pull-right" data-i18n="Cancel"></button>\n' +
	'';

	jsxc.gui.template['fingerprintsDialog'] = '<div>\n' +
	'   <p class="jsxc_maxWidth" data-i18n="A_fingerprint_"></p>\n' +
	'   <p>\n' +
	'      <strong data-i18n="Your_fingerprint"></strong>\n' +
	'      <br /> <span style="text-transform: uppercase">{{my_priv_fingerprint}}</span>\n' +
	'   </p>\n' +
	'   <p>\n' +
	'      <strong data-i18n="Buddy_fingerprint"></strong>\n' +
	'      <br /> <span style="text-transform: uppercase">{{bid_priv_fingerprint}}</span>\n' +
	'   </p>\n' +
	'</div>\n' +
	'';

	jsxc.gui.template['incomingCall'] = '<h3 data-i18n="Incoming_call"></h3>\n' +
	'<p>\n' +
	'   <span data-i18n="Do_you_want_to_accept_the_call_from"></span> {{bid_name}}?\n' +
	'</p>\n' +
	'\n' +
	'<button class="btn btn-primary jsxc_accept pull-right" data-i18n="Accept"></button>\n' +
	'<button class="btn btn-default jsxc_reject pull-right" data-i18n="Reject"></button>\n' +
	'';

	jsxc.gui.template['incomingVideoconference'] = '<h3 data-i18n="Incoming_call"></h3>\n' +
	'<p>\n' +
	'   <span>{{bid_name}} vous invite à participer à une vidéo conférence.</span>\n' +
	'</p>\n' +
	'\n' +
	'<button class="btn btn-primary jsxc_accept pull-right" data-i18n="Accept"></button>\n' +
	'<button class="btn btn-default jsxc_reject pull-right" data-i18n="Reject"></button>\n' +
	'';

	jsxc.gui.template['installChromeExtension'] = '<h3>Installer l\'extension Chrome de capture d\'écran</h3>\n' +
	'\n' +
	'<p>Pour pouvoir capturer et partager votre écran suivez attentivement les étapes suivantes.\n' +
	'  <b>Ces opérations ne sont pas nécéssaires pour recevoir le flux d\'un autre écran.</b></p>\n' +
	'\n' +
	'<ol>\n' +
	'  <li>\n' +
	'    Ouvrez cette boite de dialogue dans le navigateur Chrome\n' +
	'  </li>\n' +
	'  <li>\n' +
	'    <a href="https://im.silverpeas.net/screen-capture/chrome-extension.crx">\n' +
	'      Cliquez ici pour télécharger l\'extension\n' +
	'    </a>\n' +
	'    puis enregistrez là dans le dossier "Téléchargement" de votre système\n' +
	'  </li>\n' +
	'  <li>\n' +
	'    <a href="about:blank" target="_blank">\n' +
	'      Cliquez ici pour ouvrir un nouvel onglet\n' +
	'    </a>\n' +
	'  </li>\n' +
	'  <li>\n' +
	'    Puis saisissez dans la barre d\'adresse: <b>chrome://extensions</b>\n' +
	'  </li>\n' +
	'  <li>\n' +
	'    Puis glissez-déposez le fichier "#######.crx" que vous avez téléchargé sur la page de\n' +
	'    paramétrage\n' +
	'  </li>\n' +
	'  <li>\n' +
	'    Acceptez l\'installation de l\'extension. Une fois l\'extension installée, vous pouvez supprimer le\n' +
	'    fichier téléchargé.\n' +
	'  </li>\n' +
	'  <li>\n' +
	'    Enfin rechargez la page en cliquant ci-dessous\n' +
	'  </li>\n' +
	'</ol>\n' +
	'\n' +
	'<div>Remarque: cette procédure est temporaire</div>\n' +
	'\n' +
	'\n' +
	'<button class="btn btn-default pull-right jsxc_closeInstallChromeExtension">Fermer</button>\n' +
	'<button class="btn btn-default pull-right jsxc_reloadInstallChromeExtension">Recharger la page\n' +
	'</button>\n' +
	'';

	jsxc.gui.template['joinChat'] = '<h3 data-i18n="Join_chat"></h3>\n' +
	'<p class=".jsxc_explanation" data-i18n="muc_explanation"></p>\n' +
	'<div class="form-horizontal">\n' +
	'   <div class="form-group">\n' +
	'      <label class="col-sm-4 control-label" for="jsxc_server" data-i18n="Server"></label>\n' +
	'      <div class="col-sm-8">\n' +
	'         <input type="text" name="server" id="jsxc_server" class="form-control" required="required" readonly="readonly" />\n' +
	'      </div>\n' +
	'   </div>\n' +
	'   <div class="form-group">\n' +
	'      <label class="col-sm-4 control-label" for="jsxc_room" data-i18n="Room"></label>\n' +
	'      <div class="col-sm-8">\n' +
	'         <input type="text" name="room" id="jsxc_room" class="form-control" autocomplete="off" list="jsxc_roomlist" required="required" pattern="^[^\\x22&\'\\/:<>@\\s]+" />\n' +
	'      </div>\n' +
	'   </div>\n' +
	'   <p class="jsxc_inputinfo jsxc_waiting jsxc_room" data-i18n="Rooms_are_loaded"></p>\n' +
	'   <datalist id="jsxc_roomlist">\n' +
	'      <p>\n' +
	'         <label for="jsxc_roomlist_select"></label>\n' +
	'         <select id="jsxc_roomlist_select">\n' +
	'            <option></option>\n' +
	'            <option>workaround</option>\n' +
	'         </select>\n' +
	'      </p>\n' +
	'   </datalist>\n' +
	'   <div class="form-group">\n' +
	'      <label class="col-sm-4 control-label" for="jsxc_nickname" data-i18n="Nickname"></label>\n' +
	'      <div class="col-sm-8">\n' +
	'         <input type="text" name="nickname" id="jsxc_nickname" class="form-control" />\n' +
	'      </div>\n' +
	'   </div>\n' +
	'   <div class="form-group">\n' +
	'      <label class="col-sm-4 control-label" for="jsxc_password" data-i18n="Password"></label>\n' +
	'      <div class="col-sm-8">\n' +
	'         <input type="text" name="password" id="jsxc_password" class="form-control" />\n' +
	'      </div>\n' +
	'   </div>\n' +
	'   <div class="form-group jsxc_bookmark">\n' +
	'      <div class="col-sm-offset-4 col-sm-8">\n' +
	'         <div class="checkbox">\n' +
	'            <label>\n' +
	'               <input id="jsxc_bookmark" type="checkbox"><span data-i18n="Bookmark"></span>\n' +
	'            </label>\n' +
	'         </div>\n' +
	'      </div>\n' +
	'   </div>\n' +
	'   <div class="form-group jsxc_bookmark">\n' +
	'      <div class="col-sm-offset-4 col-sm-8">\n' +
	'         <div class="checkbox disabled">\n' +
	'            <label>\n' +
	'               <input disabled="disabled" id="jsxc_autojoin" type="checkbox"><span data-i18n="Auto-join"></span>\n' +
	'            </label>\n' +
	'         </div>\n' +
	'      </div>\n' +
	'   </div>\n' +
	'   <div class="jsxc_msg"></div>\n' +
	'   <div class="form-group">\n' +
	'      <div class="col-sm-offset-4 col-sm-8">\n' +
	'         <span class="jsxc_warning"></span>\n' +
	'         <button class="btn btn-default jsxc_close" data-i18n="Close"></button>\n' +
	'         <button class="btn btn-primary jsxc_continue" data-i18n="Continue"></button>\n' +
	'         <button class="btn btn-success jsxc_join" data-i18n="Join"></button>\n' +
	'      </div>\n' +
	'   </div>\n' +
	'</div>\n' +
	'';

	jsxc.gui.template['joinConversationDialog'] = '<h3>Invitation</h3>\n' +
	'<p>\n' +
	'   <b class="jsxc_buddyName"></b> vous invite à participer à une conversation.\n' +
	'</p>\n' +
	'\n' +
	'<button class="btn btn-primary jsxc_approve pull-right" data-i18n="Approve"></button>\n' +
	'<button class="btn btn-default jsxc_deny pull-right" data-i18n="Deny"></button>\n' +
	'';

	jsxc.gui.template['loginBox'] = '<h3 data-i18n="Login"></h3>\n' +
	'<form class="form-horizontal">\n' +
	'   <div class="form-group">\n' +
	'      <label class="col-sm-4 control-label" for="jsxc_username" data-i18n="Username"></label>\n' +
	'      <div class="col-sm-8">\n' +
	'         <input type="text" name="username" id="jsxc_username" class="form-control" required="required" value="{{my_node}}" />\n' +
	'      </div>\n' +
	'   </div>\n' +
	'   <div class="form-group">\n' +
	'      <label class="col-sm-4 control-label" for="jsxc_password" data-i18n="Password"></label>\n' +
	'      <div class="col-sm-8">\n' +
	'         <input type="password" name="password" required="required" class="form-control" id="jsxc_password" />\n' +
	'      </div>\n' +
	'   </div>\n' +
	'   <div class="jsxc_alert jsxc_alert-warning" data-i18n="Sorry_we_cant_authentikate_"></div>\n' +
	'   <div class="form-group">\n' +
	'      <div class="col-sm-offset-4 col-sm-9">\n' +
	'         <button type="reset" class="btn btn-default jsxc_close" name="clear" data-i18n="Cancel" />\n' +
	'         <button type="submit" class="btn btn-primary" name="commit" data-i18n="[data-jsxc-loading-text]Connecting...;Connect" />\n' +
	'      </div>\n' +
	'   </div>\n' +
	'</form>\n' +
	'';

	jsxc.gui.template['menuConversations'] = '<div id="jsxc_menuConversation">\n' +
	'\n' +
	'  <!-- User selection -->\n' +
	'\n' +
	'  <p class="jsxc_menu_subtitle">Liste de contacts</p>\n' +
	'\n' +
	'  <div id="jsxc_conversationUserList"></div>\n' +
	'\n' +
	'  <div class="jsxc_menuAdvice">Touche \'Control\' pour sélectionner plusieurs utilisateurs</div>\n' +
	'\n' +
	'  <div class="jsxc_actionButton jsxc_refreshBuddyList">Rafraichir la liste</div>\n' +
	'\n' +
	'\n' +
	'  <!--\n' +
	'\n' +
	'  Chat conversation\n' +
	'\n' +
	'  -->\n' +
	'\n' +
	'\n' +
	'\n' +
	'  <div class="jsxc_actionButton jsxc_createConversation">Nouvelle conversation</div>\n' +
	'\n' +
	'  <div class="jsxc_actionButton jsxc_inviteBuddiesOnConversation">\n' +
	'    Inviter dans une conversation existante\n' +
	'  </div>\n' +
	'\n' +
	'  <!--&lt;!&ndash; Conversation form &ndash;&gt;-->\n' +
	'  <!--<div class="jsxc_sideMenuCreateRoomForm">-->\n' +
	'  <!--<input type="text" class="jsxc_inputRoomTitle" placeholder="Titre de la conversation"/>-->\n' +
	'  <!--<input type="text" class="jsxc_inputRoomSubject" placeholder="Sujet"/>-->\n' +
	'  <!--</div>-->\n' +
	'\n' +
	'  <!--<div class="jsxc_roomDialog jsxc_actionButton" >Boite de dialogue "salons"</div>-->\n' +
	'\n' +
	'\n' +
	'  <!--\n' +
	'\n' +
	'  Video calls\n' +
	'\n' +
	'\n' +
	'  -->\n' +
	'\n' +
	'\n' +
	'  <p class="jsxc_menu_subtitle">Appels vidéo</p>\n' +
	'\n' +
	'\n' +
	'  <div class="jsxc_actionButton jsxc_callContacts">Appeler les contacts</div>\n' +
	'  <div class="jsxc_actionButton jsxc_createConference">Créer une conférence</div>\n' +
	'\n' +
	'\n' +
	'  <!--\n' +
	'\n' +
	'  Screen sharing\n' +
	'\n' +
	'  -->\n' +
	'\n' +
	'  <p class="jsxc_menu_subtitle">Partage d\'écran:</p>\n' +
	'\n' +
	'  <div class="jsxc_actionButton jsxc_screenSharing">Partager mon écran</div>\n' +
	'  <div class="jsxc_actionButton jsxc_screenInstallChromeExtension">Installer l\'extension Chrome</div>\n' +
	'\n' +
	'\n' +
	'  <!--\n' +
	'\n' +
	'  Etherpad\n' +
	'\n' +
	'  -->\n' +
	'\n' +
	'  <p class="jsxc_menu_subtitle">Etherpad</p>\n' +
	'\n' +
	'  <div style="margin: 7px">\n' +
	'    Choisissez un nom pour votre pad, et partagez le !<br/>\n' +
	'\n' +
	'    <input id="jsxc_etherpad_name" type="text" placeholder="Nom du pad"/>\n' +
	'\n' +
	'    <input type="text" class="jsxc_etherpad_sharetextfield" readonly/>\n' +
	'    <a href="#" class="jsxc_etherpad_sharelink" target="_blank">&gt;&gt;</a>\n' +
	'\n' +
	'  </div>\n' +
	'\n' +
	'  <div class="jsxc_actionButton jsxc_openpad">Ouvrir un pad</div>\n' +
	'  <div class="jsxc_actionButton notImplementedYet">Liste des pads</div>\n' +
	'\n' +
	'\n' +
	'  <div class="jsxc_sideMenuBottom"></div>\n' +
	'\n' +
	'</div>\n' +
	'';

	jsxc.gui.template['menuSettings'] = '<div id="jsxc_menuSettings">\n' +
	'\n' +
	'  <div class="jsxc_muteNotification jsxc_actionButton" data-i18n="Mute"></div>\n' +
	'\n' +
	'  <div class="jsxc_showNotificationRequestDialog jsxc_actionButton">Activer les notifications de\n' +
	'    bureau\n' +
	'  </div>\n' +
	'\n' +
	'  <div class="jsxc_actionButton notImplementedYet">Interdire les appels vidéos</div>\n' +
	'\n' +
	'  <div class="jsxc_actionButton jsxc_hideOffline" data-i18n="Hide_offline"></div>\n' +
	'\n' +
	'  <div class="jsxc_actionButton jsxc_dialog_settings">Boite de dialogue de réglages</div>\n' +
	'\n' +
	'  <div class="jsxc_actionButton notImplementedYet">Rétablir les réglages par défaut</div>\n' +
	'\n' +
	'  <div class="jsxc_actionButton notImplementedYet">Console XMPP</div>\n' +
	'\n' +
	'  <div class="jsxc_actionButton notImplementedYet">Console d\'événements Jquery</div>\n' +
	'\n' +
	'  <div class="jsxc_actionButton jsxc_about">A propos</div>\n' +
	'\n' +
	'  <div class="jsxc_sideMenuBottom"></div>\n' +
	'\n' +
	'\n' +
	'</div>\n' +
	'';

	jsxc.gui.template['menuWelcome'] = '<div id="jsxc_menuWelcome">\n' +
	'\n' +
	'  <p>\n' +
	'    Recherchez une fonctionnalité à l\'aide du champs ci-dessus ou explorez le menu :)\n' +
	'  </p>\n' +
	'\n' +
	'  <div data-pres="offline" class="jsxc_actionButton jsxc_menu_offline">Se déconnecter</div>\n' +
	'\n' +
	'  <!-- Display notifications -->\n' +
	'\n' +
	'  <p>Notifications: <span class="jsxc_menu_notif_number"></span></p>\n' +
	'  <div id="jsxc_notice">\n' +
	'\n' +
	'    <!-- Notification inserted here -->\n' +
	'    <ul>\n' +
	'\n' +
	'    </ul>\n' +
	'\n' +
	'  </div>\n' +
	'\n' +
	'  <!-- Change status -->\n' +
	'\n' +
	'  <p>Statut:</p>\n' +
	'\n' +
	'  <div class="jsxc_status_buttons">\n' +
	'\n' +
	'    <div data-pres="online" class="jsxc_actionButton jsxc_online" data-i18n="Online"></div>\n' +
	'    <div data-pres="away" class="jsxc_actionButton jsxc_away" data-i18n="Away"></div>\n' +
	'    <div data-pres="dnd" class="jsxc_actionButton jsxc_dnd" data-i18n="dnd"></div>\n' +
	'\n' +
	'  </div>\n' +
	'\n' +
	'  <!-- invite users -->\n' +
	'\n' +
	'  <p>Inviter des utilisateurs:</p>\n' +
	'\n' +
	'  <div id="jsxc_contactsUserList"></div>\n' +
	'\n' +
	'  <div class="jsxc_menuAdvice">Touche \'Control\' pour sélectionner plusieurs utilisateurs</div>\n' +
	'\n' +
	'  <div class="jsxc_addBuddyFromList jsxc_actionButton">Inviter un/des utilisateur(s)</div>\n' +
	'\n' +
	'  <div class="jsxc_removeBuddyFromList jsxc_actionButton">Supprimer un/des contact(s)</div>\n' +
	'\n' +
	'  <div class="jsxc_refreshBuddyList jsxc_actionButton">Rafraichir la liste</div>\n' +
	'\n' +
	'\n' +
	'  <div class="jsxc_sideMenuBottom"></div>\n' +
	'\n' +
	'\n' +
	'</div>';

	jsxc.gui.template['pleaseAccept'] = '<p data-i18n="Please_accept_"></p>\n' +
	'';

	jsxc.gui.template['removeDialog'] = '<h3 data-i18n="Remove_buddy"></h3>\n' +
	'<p class="jsxc_maxWidth" data-i18n="[html]You_are_about_to_remove_"></p>\n' +
	'\n' +
	'<button class="btn btn-primary jsxc_remove pull-right" data-i18n="Remove"></button>\n' +
	'<button class="btn btn-default jsxc_cancel jsxc_close pull-right" data-i18n="Cancel"></button>\n' +
	'';

	jsxc.gui.template['removeManyDialog'] = '<h3>Suppression de contact</h3>\n' +
	'\n' +
	'<p class="jsxc_maxWidth">Vous allez retirer "{{msg}}" de votre liste de contacts.\n' +
	'    Toutes les fenêtres de discussion liées seront fermées.</p>\n' +
	'\n' +
	'<button class="btn btn-primary jsxc_remove pull-right" data-i18n="Remove"></button>\n' +
	'<button class="btn btn-default jsxc_cancel jsxc_close pull-right" data-i18n="Cancel"></button>\n' +
	'';

	jsxc.gui.template['roster'] = '<!-- Side bar with buddy list and menu -->\n' +
	'<div id="jsxc_roster">\n' +
	'\n' +
	'    <!-- Main menu -->\n' +
	'    <div id="jsxc_side_menu">\n' +
	'\n' +
	'        <div id="jsxc_side_menu_search_bar">\n' +
	'\n' +
	'            <input type="text" placeholder="Rechercher" id="jsxc_menu_search_text_field"/>\n' +
	'            <input type="button" id="jsxc_menu_previous_btn" value="<"/>\n' +
	'            <input type="button" id="jsxc_menu_next_btn" value=">"/>\n' +
	'\n' +
	'            <div id="jsxc_menu_feedback">&nbsp;</div>\n' +
	'\n' +
	'        </div>\n' +
	'\n' +
	'        <div id="jsxc_side_menu_content"></div>\n' +
	'\n' +
	'    </div>\n' +
	'\n' +
	'    <!-- buddy list -->\n' +
	'    <ul id="jsxc_buddylist"></ul>\n' +
	'\n' +
	'    <!-- Menu bar on bottom of roster -->\n' +
	'    <div class="jsxc_bottom jsxc_presence jsxc_rosteritem" data-bid="own">\n' +
	'\n' +
	'        <!-- Avatar -->\n' +
	'        <div id="jsxc_avatar" class="jsxc_avatar"/>\n' +
	'\n' +
	'        <div id="jsxc_menu">\n' +
	'\n' +
	'            <!-- Button for menu openning, image added with scss/_jsxc.scss -->\n' +
	'            <span></span>\n' +
	'\n' +
	'        </div>\n' +
	'\n' +
	'        <div class="jsxc_menu_notif_bottom_roster"><span class="jsxc_menu_notif_number"></span></div>\n' +
	'\n' +
	'        <div id="jsxc_presence">\n' +
	'            <span data-i18n="Offline">Offline</span>\n' +
	'            <div class="jsxc_inner">\n' +
	'                <ul>\n' +
	'                    <li data-pres="online" class="jsxc_online" data-i18n="Online"></li>\n' +
	'                    <li data-pres="chat" class="jsxc_chat" data-i18n="Chatty"></li>\n' +
	'                    <li data-pres="away" class="jsxc_away" data-i18n="Away"></li>\n' +
	'                    <li data-pres="xa" class="jsxc_xa" data-i18n="Extended_away"></li>\n' +
	'                    <li data-pres="dnd" class="jsxc_dnd" data-i18n="dnd"></li>\n' +
	'                    <li data-pres="offline" class="jsxc_offline" data-i18n="Offline"></li>\n' +
	'                </ul>\n' +
	'            </div>\n' +
	'        </div>\n' +
	'\n' +
	'    </div>\n' +
	'\n' +
	'    <!-- Barre transparente permettant de replier le menu JSXC -->\n' +
	'    <div id="jsxc_toggleRoster"></div>\n' +
	'\n' +
	'</div>\n' +
	'';

	jsxc.gui.template['rosterBuddy'] = '<li class="jsxc_rosteritem">\n' +
	'  <div class="jsxc_avatar"></div>\n' +
	'  <div class="jsxc_more"/>\n' +
	'  <div class="jsxc_caption">\n' +
	'    <div class="jsxc_name"/>\n' +
	'    <div class="jsxc_lastmsg">\n' +
	'      <span class="jsxc_unread"/>\n' +
	'      <span class="jsxc_text"/>\n' +
	'    </div>\n' +
	'  </div>\n' +
	'  <div class="jsxc_menu">\n' +
	'    <ul>\n' +
	'      <li>\n' +
	'        <a class="jsxc_rename" href="#"><span class="jsxc_icon jsxc_editicon"></span><span data-i18n="rename_buddy"></span></a>\n' +
	'      </li>\n' +
	'      <li>\n' +
	'        <a class="jsxc_vcard" href=""><span class="jsxc_icon jsxc_infoicon"></span><span data-i18n="get_info"></span></a>\n' +
	'      </li>\n' +
	'      <li>\n' +
	'        <a class="jsxc_videocall" href="#"><span class="jsxc_icon jsxc_videoicon"></span><span>Appel vidéo</span></a>\n' +
	'      </li>\n' +
	'      <li>\n' +
	'        <a class="jsxc_delete" href=""><span class="jsxc_icon jsxc_deleteicon"></span><span data-i18n="delete_buddy"></span></a>\n' +
	'      </li>\n' +
	'    </ul>\n' +
	'  </div>\n' +
	'</li>\n' +
	'';

	jsxc.gui.template['rosterMenu'] = '<!-- en cours -->\n' +
	'<h3>Section 1</h3>\n' +
	'<div>\n' +
	'    <p>\n' +
	'        Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer\n' +
	'        ut neque. Vivamus nisi metus, molestie vel, gravida in, condimentum sit\n' +
	'        amet, nunc. Nam a nibh. Donec suscipit eros. Nam mi. Proin viverra leo ut\n' +
	'        odio. Curabitur malesuada. Vestibulum a velit eu ante scelerisque vulputate.\n' +
	'    </p>\n' +
	'</div>\n' +
	'<h3>Section 2</h3>\n' +
	'<div>\n' +
	'    <p>\n' +
	'        Sed non urna. Donec et ante. Phasellus eu ligula. Vestibulum sit amet\n' +
	'        purus. Vivamus hendrerit, dolor at aliquet laoreet, mauris turpis porttitor\n' +
	'        velit, faucibus interdum tellus libero ac justo. Vivamus non quam. In\n' +
	'        suscipit faucibus urna.\n' +
	'    </p>\n' +
	'</div>\n' +
	'<h3>Section 3</h3>\n' +
	'<div>\n' +
	'    <p>\n' +
	'        Nam enim risus, molestie et, porta ac, aliquam ac, risus. Quisque lobortis.\n' +
	'        Phasellus pellentesque purus in massa. Aenean in pede. Phasellus ac libero\n' +
	'        ac tellus pellentesque semper. Sed ac felis. Sed commodo, magna quis\n' +
	'        lacinia ornare, quam ante aliquam nisi, eu iaculis leo purus venenatis dui.\n' +
	'    </p>\n' +
	'    <ul>\n' +
	'        <li>List item one</li>\n' +
	'        <li>List item two</li>\n' +
	'        <li>List item three</li>\n' +
	'    </ul>\n' +
	'</div>\n' +
	'<h3>Section 4</h3>\n' +
	'<div>\n' +
	'    <p>\n' +
	'        Cras dictum. Pellentesque habitant morbi tristique senectus et netus\n' +
	'        et malesuada fames ac turpis egestas. Vestibulum ante ipsum primis in\n' +
	'        faucibus orci luctus et ultrices posuere cubilia Curae; Aenean lacinia\n' +
	'        mauris vel est.\n' +
	'    </p>\n' +
	'    <p>\n' +
	'        Suspendisse eu nisl. Nullam ut libero. Integer dignissim consequat lectus.\n' +
	'        Class aptent taciti sociosqu ad litora torquent per conubia nostra, per\n' +
	'        inceptos himenaeos.\n' +
	'    </p>\n' +
	'</div>\n' +
	'</div>\n' +
	'';

	jsxc.gui.template['selectionDialog'] = '<h3></h3>\n' +
	'<p></p>\n' +
	'\n' +
	'<button class="btn btn-primary pull-right" data-i18n="Confirm"></button>\n' +
	'<button class="btn btn-default pull-right" data-i18n="Dismiss"></button>\n' +
	'';

	jsxc.gui.template['settings'] = '<form class="form-horizontal col-sm-6">\n' +
	'   <fieldset class="jsxc_fieldsetXmpp jsxc_fieldset">\n' +
	'      <h3 data-i18n="Login_options"></h3>\n' +
	'      <p data-i18n="setting-explanation-xmpp"></p>\n' +
	'      <div class="form-group">\n' +
	'         <label class="col-sm-6 control-label" for="xmpp-url" data-i18n="BOSH_url"></label>\n' +
	'         <div class="col-sm-6">\n' +
	'            <input type="text" id="xmpp-url" class="form-control" readonly="readonly" />\n' +
	'         </div>\n' +
	'      </div>\n' +
	'      <div class="form-group">\n' +
	'         <label class="col-sm-6 control-label" for="xmpp-username" data-i18n="Username"></label>\n' +
	'         <div class="col-sm-6">\n' +
	'            <input type="text" id="xmpp-username" class="form-control" />\n' +
	'         </div>\n' +
	'      </div>\n' +
	'      <div class="form-group">\n' +
	'         <label class="col-sm-6 control-label" for="xmpp-domain" data-i18n="Domain"></label>\n' +
	'         <div class="col-sm-6">\n' +
	'            <input type="text" id="xmpp-domain" class="form-control" />\n' +
	'         </div>\n' +
	'      </div>\n' +
	'      <div class="form-group">\n' +
	'         <label class="col-sm-6 control-label" for="xmpp-resource" data-i18n="Resource"></label>\n' +
	'         <div class="col-sm-6">\n' +
	'            <input class="form-control" type="text" id="xmpp-resource" class="form-control" />\n' +
	'         </div>\n' +
	'      </div>\n' +
	'      <div class="form-group">\n' +
	'         <div class="col-sm-offset-6 col-sm-6">\n' +
	'            <button class="btn btn-primary jsxc_continue" type="submit" data-i18n="Save"></button>\n' +
	'         </div>\n' +
	'      </div>\n' +
	'   </fieldset>\n' +
	'</form>\n' +
	'\n' +
	'<form class="form-horizontal col-sm-6">\n' +
	'   <fieldset class="jsxc_fieldsetPriority jsxc_fieldset">\n' +
	'      <h3 data-i18n="Priority"></h3>\n' +
	'      <p data-i18n="setting-explanation-priority"></p>\n' +
	'      <div class="form-group">\n' +
	'         <label class="col-sm-6 control-label" for="priority-online" data-i18n="Online"></label>\n' +
	'         <div class="col-sm-6">\n' +
	'            <input type="number" value="0" id="priority-online" class="form-control" min="-128" max="127" step="1" required="required" />\n' +
	'         </div>\n' +
	'      </div>\n' +
	'      <div class="form-group">\n' +
	'         <label class="col-sm-6 control-label" for="priority-chat" data-i18n="Chatty"></label>\n' +
	'         <div class="col-sm-6">\n' +
	'            <input type="number" value="0" id="priority-chat" class="form-control" min="-128" max="127" step="1" required="required" />\n' +
	'         </div>\n' +
	'      </div>\n' +
	'      <div class="form-group">\n' +
	'         <label class="col-sm-6 control-label" for="priority-away" data-i18n="Away"></label>\n' +
	'         <div class="col-sm-6">\n' +
	'            <input type="number" value="0" id="priority-away" class="form-control" min="-128" max="127" step="1" required="required" />\n' +
	'         </div>\n' +
	'      </div>\n' +
	'      <div class="form-group">\n' +
	'         <label class="col-sm-6 control-label" for="priority-xa" data-i18n="Extended_away"></label>\n' +
	'         <div class="col-sm-6">\n' +
	'            <input type="number" value="0" id="priority-xa" class="form-control" min="-128" max="127" step="1" required="required" />\n' +
	'         </div>\n' +
	'      </div>\n' +
	'      <div class="form-group">\n' +
	'         <label class="col-sm-6 control-label" for="priority-dnd" data-i18n="dnd"></label>\n' +
	'         <div class="col-sm-6">\n' +
	'            <input type="number" value="0" id="priority-dnd" class="form-control" min="-128" max="127" step="1" required="required" />\n' +
	'         </div>\n' +
	'      </div>\n' +
	'      <div class="form-group">\n' +
	'         <div class="col-sm-offset-6 col-sm-6">\n' +
	'            <button class="btn btn-primary jsxc_continue" type="submit" data-i18n="Save"></button>\n' +
	'         </div>\n' +
	'      </div>\n' +
	'   </fieldset>\n' +
	'</form>\n' +
	'\n' +
	'<form class="form-horizontal col-sm-6">\n' +
	'   <fieldset class="jsxc_fieldsetLoginForm jsxc_fieldset">\n' +
	'      <h3 data-i18n="On_login"></h3>\n' +
	'      <p data-i18n="setting-explanation-login"></p>\n' +
	'      <div class="form-group">\n' +
	'         <div class="col-sm-12">\n' +
	'            <div class="checkbox">\n' +
	'               <label>\n' +
	'                  <input type="checkbox" id="loginForm-enable"><span data-i18n="On_login"></span>\n' +
	'               </label>\n' +
	'            </div>\n' +
	'         </div>\n' +
	'      </div>\n' +
	'      <div class="form-group">\n' +
	'         <div class="col-sm-12">\n' +
	'            <button class="btn btn-primary jsxc_continue" type="submit" data-i18n="Save"></button>\n' +
	'         </div>\n' +
	'      </div>\n' +
	'   </fieldset>\n' +
	'</form>\n' +
	'\n' +
	'<form class="form-horizontal col-sm-6" data-onsubmit="xmpp.carbons.refresh">\n' +
	'   <fieldset class="jsxc_fieldsetCarbons jsxc_fieldset">\n' +
	'      <h3 data-i18n="Carbon_copy"></h3>\n' +
	'      <p data-i18n="setting-explanation-carbon"></p>\n' +
	'      <div class="form-group">\n' +
	'         <div class="col-sm-12">\n' +
	'            <div class="checkbox">\n' +
	'               <label>\n' +
	'                  <input type="checkbox" id="carbons-enable"><span data-i18n="Enable"></span>\n' +
	'               </label>\n' +
	'            </div>\n' +
	'         </div>\n' +
	'      </div>\n' +
	'      <div class="form-group">\n' +
	'         <div class="col-sm-12">\n' +
	'            <button class="btn btn-primary jsxc_continue" type="submit" data-i18n="Save"></button>\n' +
	'         </div>\n' +
	'      </div>\n' +
	'   </fieldset>\n' +
	'</form>\n' +
	'';

	jsxc.gui.template['vCard'] = '<h3>\n' +
	'	<span data-i18n="Info_about"></span> <span>{{bid_name}}</span>\n' +
	'</h3>\n' +
	'<ul class="jsxc_vCard"></ul>\n' +
	'<p>\n' +
	'   <img src="{{root}}/img/loading.gif" alt="wait" width="32px" height="32px" /> <span data-i18n="Please_wait"></span>...\n' +
	'</p>\n' +
	'';

	jsxc.gui.template['videoPanel'] = '<div id="jsxc_videoPanel">\n' +
	'\n' +
	'  <div>\n' +
	'    <h3 style="margin: 20px;">Appels vidéo</h3>\n' +
	'  </div>\n' +
	'\n' +
	'  <!-- Side bar with local and remote videos -->\n' +
	'  <div class="jsxc_videoPanelContent">\n' +
	'\n' +
	'\n' +
	'  </div>\n' +
	'\n' +
	'  <!-- toggle video menu -->\n' +
	'  <div id="jsxc_toggleVideoPanel"></div>\n' +
	'\n' +
	'</div>\n' +
	'';

	jsxc.gui.template['videoStreamDialog'] = '<h3 class="jsxc_from_jid"></h3>\n' +
	'\n' +
	'<div>\n' +
	'  <video class="jsxc_fullscreenVideo"></video>\n' +
	'</div>\n' +
	'\n' +
	'<button class="btn btn-default pull-right jsxc_hangUpCall">Terminer l\'appel</button>\n' +
	'<button class="btn btn-default pull-right jsxc_closeVideoDialog">Fermer la fenêtre</button>\n' +
	'';

	jsxc.gui.template['videoWindow'] = '<div id="jsxc_webrtc">\n' +
	'   <div class="jsxc_chatarea">\n' +
	'      <ul></ul>\n' +
	'   </div>\n' +
	'   <div class="jsxc_videoContainer">\n' +
	'      <video class="jsxc_localvideo" autoplay></video>\n' +
	'      <video class="jsxc_remotevideo" autoplay></video>\n' +
	'      <div class="jsxc_status"></div>\n' +
	'      <div class="bubblingG">\n' +
	'         <span id="bubblingG_1"> </span> <span id="bubblingG_2"> </span> <span id="bubblingG_3"> </span>\n' +
	'      </div>\n' +
	'      <div class="jsxc_noRemoteVideo">\n' +
	'         <div>\n' +
	'            <div></div>\n' +
	'            <p data-i18n="No_video_signal"></p>\n' +
	'            <div></div>\n' +
	'         </div>\n' +
	'      </div>\n' +
	'      <div class="jsxc_controlbar jsxc_visible">\n' +
	'         <div>\n' +
	'            <div class="jsxc_hangUp jsxc_videoControl" />\n' +
	'            <div class="jsxc_fullscreen jsxc_videoControl" />\n' +
	'         </div>\n' +
	'      </div>\n' +
	'   </div>\n' +
	'   <div class="jsxc_multi">\n' +
	'      <div class="jsxc_snapshotbar">\n' +
	'         <p>No pictures yet!</p>\n' +
	'      </div>\n' +
	'      <!--<div class="jsxc_chatarea">\n' +
	'                   <ul></ul>\n' +
	'               </div>-->\n' +
	'      <div class="jsxc_infobar"></div>\n' +
	'   </div>\n' +
	'</div>\n' +
	'';

	jsxc.gui.template['waitAlert'] = '<h3>{{msg}}</h3>\n' +
	'\n' +
	'<div class="progress">\n' +
	'   <div class="progress-bar progress-bar-striped active" style="width: 100%" data-i18n="Please_wait">\n' +
	'   </div>\n' +
	'</div>\n' +
	'';

	jsxc.gui.template['windowList'] = '<div id="jsxc_windowList">\n' +
	'   <ul></ul>\n' +
	'</div>\n' +
	'<div id="jsxc_windowListSB">\n' +
	'   <div class="jsxc_scrollLeft jsxc_disabled">&lt;</div>\n' +
	'   <div class="jsxc_scrollRight jsxc_disabled">&gt;</div>\n' +
	'</div>\n' +
	'';

	}(jQuery));

/***/ },
/* 1 */
/***/ function(module, exports) {

	/**
	 * Statsistic module. Create a Stats object, add pairs {id, value},
	 * send data to store it or let Stats do it every XX minutes.
	 *
	 * @param options
	 * @constructor
	 */

	var Stats = function(options) {

	  if (!options || !options.destinationUrl) {
	    throw "You must specify destination";
	  }

	  var defaultOptions = {

	    /**
	     * Destination, without trailing slash
	     */
	    destinationUrl : "http://127.0.0.1:3000",

	    /**
	     * Set true for send data in interval
	     */
	    autosend: false,

	    /**
	     * Interval between auto sent
	     *
	     */
	    interval : 3000, //interval: Math.floor((Math.random() * 14 * 60 * 100) + 8 * 60 * 100),

	    /**
	     * Authorization header
	     */
	    authorization: 'secretkey',

	  };

	  this.options = $.extend(defaultOptions, options);

	  this.options.persistenceUrl = options.destinationUrl + "/persist";
	  this.options.readUrl = options.destinationUrl + "/data";

	  this.buffer = [];

	  // send buffer automatically
	  if (options.autosend === true) {
	    var self = this;
	    setInterval(function() {
	      self.sendDataBuffer();
	    }, options.interval);
	  }

	};

	/**
	 * Add a key / value pair
	 * @param id
	 * @param value
	 */
	Stats.prototype.addEvent = function(event, data) {
	  this.buffer.push({event : event, data : data});
	};

	/**
	 *
	 * @returns {*}
	 */
	Stats.prototype.sendDataBuffer = function() {

	  var self = this;

	  if (Object.keys(self.buffer).length < 1) {
	    // console.log("Empty buffer");
	    return;
	  }

	  var req = {
	    url : self.options.persistenceUrl,
	    type : 'POST',
	    dataType : "json",
	    data : JSON.stringify(self.buffer),
	    headers : {
	      "Authorization" : self.options.authorization,
	      "Content-Type" : "application/json"
	    }
	  };

	  // ajouter entetes si necessaire
	  if (typeof headers !== "undefined") {
	    $.extend(req.headers, headers);
	  }

	  return $.ajax(req)
	      .done(function() {
	        // clear buffer when finished
	        self.buffer = [];
	      })

	      .fail(function(){
	        console.log("Stats: fail sending buffer");
	        console.log(arguments);
	      });
	};


	/**
	 * Return the list of events
	 * @returns {*}
	 */
	Stats.prototype.getEventList = function(){

	  var self = this;

	  var req = {
	    url : self.options.readUrl + "/event/list",
	    type : 'POST',
	    headers : {
	      "Authorization" : self.options.authorization,
	      "Content-Type" : "application/json"
	    }
	  };

	  return $.ajax(req);

	};

	/**
	 * Return an events resume
	 * @returns {*}
	 */
	Stats.prototype.getEventResume = function(){

	  var self = this;

	  var req = {
	    url : self.options.readUrl + "/event/resume",
	    type : 'POST',
	    headers : {
	      "Authorization" : self.options.authorization,
	      "Content-Type" : "application/json"
	    }
	  };

	  return $.ajax(req);

	};

	/**
	 * Return an events resume
	 * @returns {*}
	 */
	Stats.prototype.getEventTimeline = function(){

	  var self = this;

	  var req = {
	    url : self.options.readUrl + "/event/timeline/hours",
	    type : 'POST',
	    headers : {
	      "Authorization" : self.options.authorization,
	      "Content-Type" : "application/json"
	    }
	  };

	  return $.ajax(req);

	};

	/**
	 * Return an events resume
	 * @returns {*}
	 */
	Stats.prototype.getLastEvents = function(){

	  var self = this;

	  var req = {
	    url : self.options.readUrl + "/event/last",
	    type : 'POST',
	    headers : {
	      "Authorization" : self.options.authorization,
	      "Content-Type" : "application/json"
	    }
	  };

	  return $.ajax(req);

	};


	/**
	 * Export module if necesary
	 */
	if(typeof module !== "undefined" && module.exports){
	  module.exports = function(options){
	    return new Stats(options);
	  };
	}




/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
	/*  SHA-1 implementation in JavaScript                  (c) Chris Veness 2002-2014 / MIT Licence  */
	/*                                                                                                */
	/*  - see http://csrc.nist.gov/groups/ST/toolkit/secure_hashing.html                              */
	/*        http://csrc.nist.gov/groups/ST/toolkit/examples.html                                    */
	/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

	/* jshint node:true *//* global define, escape, unescape */
	'use strict';


	/**
	 * SHA-1 hash function reference implementation.
	 *
	 * @namespace
	 */
	var Sha1 = {};


	/**
	 * Generates SHA-1 hash of string.
	 *
	 * @param   {string} msg - (Unicode) string to be hashed.
	 * @returns {string} Hash of msg as hex character string.
	 */
	Sha1.hash = function(msg) {
	    // convert string to UTF-8, as SHA only deals with byte-streams
	    msg = msg.utf8Encode();

	    // constants [§4.2.1]
	    var K = [ 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6 ];

	    // PREPROCESSING

	    msg += String.fromCharCode(0x80);  // add trailing '1' bit (+ 0's padding) to string [§5.1.1]

	    // convert string msg into 512-bit/16-integer blocks arrays of ints [§5.2.1]
	    var l = msg.length/4 + 2; // length (in 32-bit integers) of msg + ‘1’ + appended length
	    var N = Math.ceil(l/16);  // number of 16-integer-blocks required to hold 'l' ints
	    var M = new Array(N);

	    for (var i=0; i<N; i++) {
	        M[i] = new Array(16);
	        for (var j=0; j<16; j++) {  // encode 4 chars per integer, big-endian encoding
	            M[i][j] = (msg.charCodeAt(i*64+j*4)<<24) | (msg.charCodeAt(i*64+j*4+1)<<16) |
	                (msg.charCodeAt(i*64+j*4+2)<<8) | (msg.charCodeAt(i*64+j*4+3));
	        } // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
	    }
	    // add length (in bits) into final pair of 32-bit integers (big-endian) [§5.1.1]
	    // note: most significant word would be (len-1)*8 >>> 32, but since JS converts
	    // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
	    M[N-1][14] = ((msg.length-1)*8) / Math.pow(2, 32); M[N-1][14] = Math.floor(M[N-1][14]);
	    M[N-1][15] = ((msg.length-1)*8) & 0xffffffff;

	    // set initial hash value [§5.3.1]
	    var H0 = 0x67452301;
	    var H1 = 0xefcdab89;
	    var H2 = 0x98badcfe;
	    var H3 = 0x10325476;
	    var H4 = 0xc3d2e1f0;

	    // HASH COMPUTATION [§6.1.2]

	    var W = new Array(80); var a, b, c, d, e;
	    for (var i=0; i<N; i++) {

	        // 1 - prepare message schedule 'W'
	        for (var t=0;  t<16; t++) W[t] = M[i][t];
	        for (var t=16; t<80; t++) W[t] = Sha1.ROTL(W[t-3] ^ W[t-8] ^ W[t-14] ^ W[t-16], 1);

	        // 2 - initialise five working variables a, b, c, d, e with previous hash value
	        a = H0; b = H1; c = H2; d = H3; e = H4;

	        // 3 - main loop
	        for (var t=0; t<80; t++) {
	            var s = Math.floor(t/20); // seq for blocks of 'f' functions and 'K' constants
	            var T = (Sha1.ROTL(a,5) + Sha1.f(s,b,c,d) + e + K[s] + W[t]) & 0xffffffff;
	            e = d;
	            d = c;
	            c = Sha1.ROTL(b, 30);
	            b = a;
	            a = T;
	        }

	        // 4 - compute the new intermediate hash value (note 'addition modulo 2^32')
	        H0 = (H0+a) & 0xffffffff;
	        H1 = (H1+b) & 0xffffffff;
	        H2 = (H2+c) & 0xffffffff;
	        H3 = (H3+d) & 0xffffffff;
	        H4 = (H4+e) & 0xffffffff;
	    }

	    return Sha1.toHexStr(H0) + Sha1.toHexStr(H1) + Sha1.toHexStr(H2) +
	        Sha1.toHexStr(H3) + Sha1.toHexStr(H4);
	};


	/**
	 * Function 'f' [§4.1.1].
	 * @private
	 */
	Sha1.f = function(s, x, y, z)  {
	    switch (s) {
	        case 0: return (x & y) ^ (~x & z);           // Ch()
	        case 1: return  x ^ y  ^  z;                 // Parity()
	        case 2: return (x & y) ^ (x & z) ^ (y & z);  // Maj()
	        case 3: return  x ^ y  ^  z;                 // Parity()
	    }
	};

	/**
	 * Rotates left (circular left shift) value x by n positions [§3.2.5].
	 * @private
	 */
	Sha1.ROTL = function(x, n) {
	    return (x<<n) | (x>>>(32-n));
	};


	/**
	 * Hexadecimal representation of a number.
	 * @private
	 */
	Sha1.toHexStr = function(n) {
	    // note can't use toString(16) as it is implementation-dependant,
	    // and in IE returns signed numbers when used on full words
	    var s="", v;
	    for (var i=7; i>=0; i--) { v = (n>>>(i*4)) & 0xf; s += v.toString(16); }
	    return s;
	};


	/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


	/** Extend String object with method to encode multi-byte string to utf8
	 *  - monsur.hossa.in/2012/07/20/utf-8-in-javascript.html */
	if (typeof String.prototype.utf8Encode == 'undefined') {
	    String.prototype.utf8Encode = function() {
	        return unescape( encodeURIComponent( this ) );
	    };
	}

	/** Extend String object with method to decode utf8 string to multi-byte */
	if (typeof String.prototype.utf8Decode == 'undefined') {
	    String.prototype.utf8Decode = function() {
	        try {
	            return decodeURIComponent( escape( this ) );
	        } catch (e) {
	            return this; // invalid UTF-8? return as-is
	        }
	    };
	}


	/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
	if (typeof module != 'undefined' && module.exports) module.exports = Sha1; // CommonJs export
	if (true) !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() { return Sha1; }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)); // AMD

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	// i18next, v1.7.7
	// Copyright (c)2014 Jan Mühlemann (jamuhl).
	// Distributed under MIT license
	// http://i18next.com
	(function (root, factory) {
	    if (true) {

	        module.exports = factory();

	    } else if (typeof define === 'function' && define.amd) {

	        define([], factory);

	    } 
	}(this, function () {

	    // add indexOf to non ECMA-262 standard compliant browsers
	    if (!Array.prototype.indexOf) {
	        Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
	            "use strict";
	            if (this == null) {
	                throw new TypeError();
	            }
	            var t = Object(this);
	            var len = t.length >>> 0;
	            if (len === 0) {
	                return -1;
	            }
	            var n = 0;
	            if (arguments.length > 0) {
	                n = Number(arguments[1]);
	                if (n != n) { // shortcut for verifying if it's NaN
	                    n = 0;
	                } else if (n != 0 && n != Infinity && n != -Infinity) {
	                    n = (n > 0 || -1) * Math.floor(Math.abs(n));
	                }
	            }
	            if (n >= len) {
	                return -1;
	            }
	            var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
	            for (; k < len; k++) {
	                if (k in t && t[k] === searchElement) {
	                    return k;
	                }
	            }
	            return -1;
	        }
	    }
	    
	    // add lastIndexOf to non ECMA-262 standard compliant browsers
	    if (!Array.prototype.lastIndexOf) {
	        Array.prototype.lastIndexOf = function(searchElement /*, fromIndex*/) {
	            "use strict";
	            if (this == null) {
	                throw new TypeError();
	            }
	            var t = Object(this);
	            var len = t.length >>> 0;
	            if (len === 0) {
	                return -1;
	            }
	            var n = len;
	            if (arguments.length > 1) {
	                n = Number(arguments[1]);
	                if (n != n) {
	                    n = 0;
	                } else if (n != 0 && n != (1 / 0) && n != -(1 / 0)) {
	                    n = (n > 0 || -1) * Math.floor(Math.abs(n));
	                }
	            }
	            var k = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n);
	            for (; k >= 0; k--) {
	                if (k in t && t[k] === searchElement) {
	                    return k;
	                }
	            }
	            return -1;
	        };
	    }
	    
	    // Add string trim for IE8.
	    if (typeof String.prototype.trim !== 'function') {
	        String.prototype.trim = function() {
	            return this.replace(/^\s+|\s+$/g, ''); 
	        }
	    }

	    var $ = undefined
	        , i18n = {}
	        , resStore = {}
	        , currentLng
	        , replacementCounter = 0
	        , languages = []
	        , initialized = false
	        , sync = {};

	    sync = {
	    
	        load: function(lngs, options, cb) {
	            if (options.useLocalStorage) {
	                sync._loadLocal(lngs, options, function(err, store) {
	                    var missingLngs = [];
	                    for (var i = 0, len = lngs.length; i < len; i++) {
	                        if (!store[lngs[i]]) missingLngs.push(lngs[i]);
	                    }
	    
	                    if (missingLngs.length > 0) {
	                        sync._fetch(missingLngs, options, function(err, fetched) {
	                            f.extend(store, fetched);
	                            sync._storeLocal(fetched);
	    
	                            cb(null, store);
	                        });
	                    } else {
	                        cb(null, store);
	                    }
	                });
	            } else {
	                sync._fetch(lngs, options, function(err, store){
	                    cb(null, store);
	                });
	            }
	        },
	    
	        _loadLocal: function(lngs, options, cb) {
	            var store = {}
	              , nowMS = new Date().getTime();
	    
	            if(window.localStorage) {
	    
	                var todo = lngs.length;
	    
	                f.each(lngs, function(key, lng) {
	                    var local = window.localStorage.getItem('res_' + lng);
	    
	                    if (local) {
	                        local = JSON.parse(local);
	    
	                        if (local.i18nStamp && local.i18nStamp + options.localStorageExpirationTime > nowMS) {
	                            store[lng] = local;
	                        }
	                    }
	    
	                    todo--; // wait for all done befor callback
	                    if (todo === 0) cb(null, store);
	                });
	            }
	        },
	    
	        _storeLocal: function(store) {
	            if(window.localStorage) {
	                for (var m in store) {
	                    store[m].i18nStamp = new Date().getTime();
	                    f.localStorage.setItem('res_' + m, JSON.stringify(store[m]));
	                }
	            }
	            return;
	        },
	    
	        _fetch: function(lngs, options, cb) {
	            var ns = options.ns
	              , store = {};
	            
	            if (!options.dynamicLoad) {
	                var todo = ns.namespaces.length * lngs.length
	                  , errors;
	    
	                // load each file individual
	                f.each(ns.namespaces, function(nsIndex, nsValue) {
	                    f.each(lngs, function(lngIndex, lngValue) {
	                        
	                        // Call this once our translation has returned.
	                        var loadComplete = function(err, data) {
	                            if (err) {
	                                errors = errors || [];
	                                errors.push(err);
	                            }
	                            store[lngValue] = store[lngValue] || {};
	                            store[lngValue][nsValue] = data;
	    
	                            todo--; // wait for all done befor callback
	                            if (todo === 0) cb(errors, store);
	                        };
	                        
	                        if(typeof options.customLoad == 'function'){
	                            // Use the specified custom callback.
	                            options.customLoad(lngValue, nsValue, options, loadComplete);
	                        } else {
	                            //~ // Use our inbuilt sync.
	                            sync._fetchOne(lngValue, nsValue, options, loadComplete);
	                        }
	                    });
	                });
	            } else {
	                // Call this once our translation has returned.
	                var loadComplete = function(err, data) {
	                    cb(null, data);
	                };
	    
	                if(typeof options.customLoad == 'function'){
	                    // Use the specified custom callback.
	                    options.customLoad(lngs, ns.namespaces, options, loadComplete);
	                } else {
	                    var url = applyReplacement(options.resGetPath, { lng: lngs.join('+'), ns: ns.namespaces.join('+') });
	                    // load all needed stuff once
	                    f.ajax({
	                        url: url,
	                        success: function(data, status, xhr) {
	                            f.log('loaded: ' + url);
	                            loadComplete(null, data);
	                        },
	                        error : function(xhr, status, error) {
	                            f.log('failed loading: ' + url);
	                            loadComplete('failed loading resource.json error: ' + error);
	                        },
	                        dataType: "json",
	                        async : options.getAsync
	                    });
	                }    
	            }
	        },
	    
	        _fetchOne: function(lng, ns, options, done) {
	            var url = applyReplacement(options.resGetPath, { lng: lng, ns: ns });
	            f.ajax({
	                url: url,
	                success: function(data, status, xhr) {
	                    f.log('loaded: ' + url);
	                    done(null, data);
	                },
	                error : function(xhr, status, error) {
	                    if ((status && status == 200) || (xhr && xhr.status && xhr.status == 200)) {
	                        // file loaded but invalid json, stop waste time !
	                        f.error('There is a typo in: ' + url);
	                    } else if ((status && status == 404) || (xhr && xhr.status && xhr.status == 404)) {
	                        f.log('Does not exist: ' + url);
	                    } else {
	                        var theStatus = status ? status : ((xhr && xhr.status) ? xhr.status : null);
	                        f.log(theStatus + ' when loading ' + url);
	                    }
	                    
	                    done(error, {});
	                },
	                dataType: "json",
	                async : options.getAsync
	            });
	        },
	    
	        postMissing: function(lng, ns, key, defaultValue, lngs) {
	            var payload = {};
	            payload[key] = defaultValue;
	    
	            var urls = [];
	    
	            if (o.sendMissingTo === 'fallback' && o.fallbackLng[0] !== false) {
	                for (var i = 0; i < o.fallbackLng.length; i++) {
	                    urls.push({lng: o.fallbackLng[i], url: applyReplacement(o.resPostPath, { lng: o.fallbackLng[i], ns: ns })});
	                }
	            } else if (o.sendMissingTo === 'current' || (o.sendMissingTo === 'fallback' && o.fallbackLng[0] === false) ) {
	                urls.push({lng: lng, url: applyReplacement(o.resPostPath, { lng: lng, ns: ns })});
	            } else if (o.sendMissingTo === 'all') {
	                for (var i = 0, l = lngs.length; i < l; i++) {
	                    urls.push({lng: lngs[i], url: applyReplacement(o.resPostPath, { lng: lngs[i], ns: ns })});
	                }
	            }
	    
	            for (var y = 0, len = urls.length; y < len; y++) {
	                var item = urls[y];
	                f.ajax({
	                    url: item.url,
	                    type: o.sendType,
	                    data: payload,
	                    success: function(data, status, xhr) {
	                        f.log('posted missing key \'' + key + '\' to: ' + item.url);
	    
	                        // add key to resStore
	                        var keys = key.split('.');
	                        var x = 0;
	                        var value = resStore[item.lng][ns];
	                        while (keys[x]) {
	                            if (x === keys.length - 1) {
	                                value = value[keys[x]] = defaultValue;
	                            } else {
	                                value = value[keys[x]] = value[keys[x]] || {};
	                            }
	                            x++;
	                        }
	                    },
	                    error : function(xhr, status, error) {
	                        f.log('failed posting missing key \'' + key + '\' to: ' + item.url);
	                    },
	                    dataType: "json",
	                    async : o.postAsync
	                });
	            }
	        },
	    
	        reload: reload
	    };
	    // defaults
	    var o = {
	        lng: undefined,
	        load: 'all',
	        preload: [],
	        lowerCaseLng: false,
	        returnObjectTrees: false,
	        fallbackLng: ['dev'],
	        fallbackNS: [],
	        detectLngQS: 'setLng',
	        detectLngFromLocalStorage: false,
	        ns: 'translation',
	        fallbackOnNull: true,
	        fallbackOnEmpty: false,
	        fallbackToDefaultNS: false,
	        nsseparator: ':',
	        keyseparator: '.',
	        selectorAttr: 'data-i18n',
	        debug: false,
	        
	        resGetPath: 'locales/__lng__/__ns__.json',
	        resPostPath: 'locales/add/__lng__/__ns__',
	    
	        getAsync: true,
	        postAsync: true,
	    
	        resStore: undefined,
	        useLocalStorage: false,
	        localStorageExpirationTime: 7*24*60*60*1000,
	    
	        dynamicLoad: false,
	        sendMissing: false,
	        sendMissingTo: 'fallback', // current | all
	        sendType: 'POST',
	    
	        interpolationPrefix: '__',
	        interpolationSuffix: '__',
	        defaultVariables: false,
	        reusePrefix: '$t(',
	        reuseSuffix: ')',
	        pluralSuffix: '_plural',
	        pluralNotFound: ['plural_not_found', Math.random()].join(''),
	        contextNotFound: ['context_not_found', Math.random()].join(''),
	        escapeInterpolation: false,
	        indefiniteSuffix: '_indefinite',
	        indefiniteNotFound: ['indefinite_not_found', Math.random()].join(''),
	    
	        setJqueryExt: true,
	        defaultValueFromContent: true,
	        useDataAttrOptions: false,
	        cookieExpirationTime: undefined,
	        useCookie: true,
	        cookieName: 'i18next',
	        cookieDomain: undefined,
	    
	        objectTreeKeyHandler: undefined,
	        postProcess: undefined,
	        parseMissingKey: undefined,
	        missingKeyHandler: sync.postMissing,
	    
	        shortcutFunction: 'sprintf' // or: defaultValue
	    };
	    function _extend(target, source) {
	        if (!source || typeof source === 'function') {
	            return target;
	        }
	    
	        for (var attr in source) { target[attr] = source[attr]; }
	        return target;
	    }
	    
	    function _deepExtend(target, source) {
	        for (var prop in source)
	            if (prop in target)
	                _deepExtend(target[prop], source[prop]);
	            else
	                target[prop] = source[prop];
	        return target;
	    }
	    
	    function _each(object, callback, args) {
	        var name, i = 0,
	            length = object.length,
	            isObj = length === undefined || Object.prototype.toString.apply(object) !== '[object Array]' || typeof object === "function";
	    
	        if (args) {
	            if (isObj) {
	                for (name in object) {
	                    if (callback.apply(object[name], args) === false) {
	                        break;
	                    }
	                }
	            } else {
	                for ( ; i < length; ) {
	                    if (callback.apply(object[i++], args) === false) {
	                        break;
	                    }
	                }
	            }
	    
	        // A special, fast, case for the most common use of each
	        } else {
	            if (isObj) {
	                for (name in object) {
	                    if (callback.call(object[name], name, object[name]) === false) {
	                        break;
	                    }
	                }
	            } else {
	                for ( ; i < length; ) {
	                    if (callback.call(object[i], i, object[i++]) === false) {
	                        break;
	                    }
	                }
	            }
	        }
	    
	        return object;
	    }
	    
	    var _entityMap = {
	        "&": "&amp;",
	        "<": "&lt;",
	        ">": "&gt;",
	        '"': '&quot;',
	        "'": '&#39;',
	        "/": '&#x2F;'
	    };
	    
	    function _escape(data) {
	        if (typeof data === 'string') {
	            return data.replace(/[&<>"'\/]/g, function (s) {
	                return _entityMap[s];
	            });
	        }else{
	            return data;
	        }
	    }
	    
	    function _ajax(options) {
	    
	        // v0.5.0 of https://github.com/goloroden/http.js
	        var getXhr = function (callback) {
	            // Use the native XHR object if the browser supports it.
	            if (window.XMLHttpRequest) {
	                return callback(null, new XMLHttpRequest());
	            } else if (window.ActiveXObject) {
	                // In Internet Explorer check for ActiveX versions of the XHR object.
	                try {
	                    return callback(null, new ActiveXObject("Msxml2.XMLHTTP"));
	                } catch (e) {
	                    return callback(null, new ActiveXObject("Microsoft.XMLHTTP"));
	                }
	            }
	    
	            // If no XHR support was found, throw an error.
	            return callback(new Error());
	        };
	    
	        var encodeUsingUrlEncoding = function (data) {
	            if(typeof data === 'string') {
	                return data;
	            }
	    
	            var result = [];
	            for(var dataItem in data) {
	                if(data.hasOwnProperty(dataItem)) {
	                    result.push(encodeURIComponent(dataItem) + '=' + encodeURIComponent(data[dataItem]));
	                }
	            }
	    
	            return result.join('&');
	        };
	    
	        var utf8 = function (text) {
	            text = text.replace(/\r\n/g, '\n');
	            var result = '';
	    
	            for(var i = 0; i < text.length; i++) {
	                var c = text.charCodeAt(i);
	    
	                if(c < 128) {
	                        result += String.fromCharCode(c);
	                } else if((c > 127) && (c < 2048)) {
	                        result += String.fromCharCode((c >> 6) | 192);
	                        result += String.fromCharCode((c & 63) | 128);
	                } else {
	                        result += String.fromCharCode((c >> 12) | 224);
	                        result += String.fromCharCode(((c >> 6) & 63) | 128);
	                        result += String.fromCharCode((c & 63) | 128);
	                }
	            }
	    
	            return result;
	        };
	    
	        var base64 = function (text) {
	            var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	    
	            text = utf8(text);
	            var result = '',
	                    chr1, chr2, chr3,
	                    enc1, enc2, enc3, enc4,
	                    i = 0;
	    
	            do {
	                chr1 = text.charCodeAt(i++);
	                chr2 = text.charCodeAt(i++);
	                chr3 = text.charCodeAt(i++);
	    
	                enc1 = chr1 >> 2;
	                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
	                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
	                enc4 = chr3 & 63;
	    
	                if(isNaN(chr2)) {
	                    enc3 = enc4 = 64;
	                } else if(isNaN(chr3)) {
	                    enc4 = 64;
	                }
	    
	                result +=
	                    keyStr.charAt(enc1) +
	                    keyStr.charAt(enc2) +
	                    keyStr.charAt(enc3) +
	                    keyStr.charAt(enc4);
	                chr1 = chr2 = chr3 = '';
	                enc1 = enc2 = enc3 = enc4 = '';
	            } while(i < text.length);
	    
	            return result;
	        };
	    
	        var mergeHeaders = function () {
	            // Use the first header object as base.
	            var result = arguments[0];
	    
	            // Iterate through the remaining header objects and add them.
	            for(var i = 1; i < arguments.length; i++) {
	                var currentHeaders = arguments[i];
	                for(var header in currentHeaders) {
	                    if(currentHeaders.hasOwnProperty(header)) {
	                        result[header] = currentHeaders[header];
	                    }
	                }
	            }
	    
	            // Return the merged headers.
	            return result;
	        };
	    
	        var ajax = function (method, url, options, callback) {
	            // Adjust parameters.
	            if(typeof options === 'function') {
	                callback = options;
	                options = {};
	            }
	    
	            // Set default parameter values.
	            options.cache = options.cache || false;
	            options.data = options.data || {};
	            options.headers = options.headers || {};
	            options.jsonp = options.jsonp || false;
	            options.async = options.async === undefined ? true : options.async;
	    
	            // Merge the various header objects.
	            var headers = mergeHeaders({
	                'accept': '*/*',
	                'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
	            }, ajax.headers, options.headers);
	    
	            // Encode the data according to the content-type.
	            var payload;
	            if (headers['content-type'] === 'application/json') {
	                payload = JSON.stringify(options.data);
	            } else {
	                payload = encodeUsingUrlEncoding(options.data);
	            }
	    
	            // Specially prepare GET requests: Setup the query string, handle caching and make a JSONP call
	            // if neccessary.
	            if(method === 'GET') {
	                // Setup the query string.
	                var queryString = [];
	                if(payload) {
	                    queryString.push(payload);
	                    payload = null;
	                }
	    
	                // Handle caching.
	                if(!options.cache) {
	                    queryString.push('_=' + (new Date()).getTime());
	                }
	    
	                // If neccessary prepare the query string for a JSONP call.
	                if(options.jsonp) {
	                    queryString.push('callback=' + options.jsonp);
	                    queryString.push('jsonp=' + options.jsonp);
	                }
	    
	                // Merge the query string and attach it to the url.
	                queryString = queryString.join('&');
	                if (queryString.length > 1) {
	                    if (url.indexOf('?') > -1) {
	                        url += '&' + queryString;
	                    } else {
	                        url += '?' + queryString;
	                    }
	                }
	    
	                // Make a JSONP call if neccessary.
	                if(options.jsonp) {
	                    var head = document.getElementsByTagName('head')[0];
	                    var script = document.createElement('script');
	                    script.type = 'text/javascript';
	                    script.src = url;
	                    head.appendChild(script);
	                    return;
	                }
	            }
	    
	            // Since we got here, it is no JSONP request, so make a normal XHR request.
	            getXhr(function (err, xhr) {
	                if(err) return callback(err);
	    
	                // Open the request.
	                xhr.open(method, url, options.async);
	    
	                // Set the request headers.
	                for(var header in headers) {
	                    if(headers.hasOwnProperty(header)) {
	                        xhr.setRequestHeader(header, headers[header]);
	                    }
	                }
	    
	                // Handle the request events.
	                xhr.onreadystatechange = function () {
	                    if(xhr.readyState === 4) {
	                        var data = xhr.responseText || '';
	    
	                        // If no callback is given, return.
	                        if(!callback) {
	                            return;
	                        }
	    
	                        // Return an object that provides access to the data as text and JSON.
	                        callback(xhr.status, {
	                            text: function () {
	                                return data;
	                            },
	    
	                            json: function () {
	                                try {
	                                    return JSON.parse(data)
	                                } catch (e) {
	                                    f.error('Can not parse JSON. URL: ' + url);
	                                    return {};
	                                }
	                            }
	                        });
	                    }
	                };
	    
	                // Actually send the XHR request.
	                xhr.send(payload);
	            });
	        };
	    
	        // Define the external interface.
	        var http = {
	            authBasic: function (username, password) {
	                ajax.headers['Authorization'] = 'Basic ' + base64(username + ':' + password);
	            },
	    
	            connect: function (url, options, callback) {
	                return ajax('CONNECT', url, options, callback);
	            },
	    
	            del: function (url, options, callback) {
	                return ajax('DELETE', url, options, callback);
	            },
	    
	            get: function (url, options, callback) {
	                return ajax('GET', url, options, callback);
	            },
	    
	            head: function (url, options, callback) {
	                return ajax('HEAD', url, options, callback);
	            },
	    
	            headers: function (headers) {
	                ajax.headers = headers || {};
	            },
	    
	            isAllowed: function (url, verb, callback) {
	                this.options(url, function (status, data) {
	                    callback(data.text().indexOf(verb) !== -1);
	                });
	            },
	    
	            options: function (url, options, callback) {
	                return ajax('OPTIONS', url, options, callback);
	            },
	    
	            patch: function (url, options, callback) {
	                return ajax('PATCH', url, options, callback);
	            },
	    
	            post: function (url, options, callback) {
	                return ajax('POST', url, options, callback);
	            },
	    
	            put: function (url, options, callback) {
	                return ajax('PUT', url, options, callback);
	            },
	    
	            trace: function (url, options, callback) {
	                return ajax('TRACE', url, options, callback);
	            }
	        };
	    
	    
	        var methode = options.type ? options.type.toLowerCase() : 'get';
	    
	        http[methode](options.url, options, function (status, data) {
	            // file: protocol always gives status code 0, so check for data
	            if (status === 200 || (status === 0 && data.text())) {
	                options.success(data.json(), status, null);
	            } else {
	                options.error(data.text(), status, null);
	            }
	        });
	    }
	    
	    var _cookie = {
	        create: function(name,value,minutes,domain) {
	            var expires;
	            if (minutes) {
	                var date = new Date();
	                date.setTime(date.getTime()+(minutes*60*1000));
	                expires = "; expires="+date.toGMTString();
	            }
	            else expires = "";
	            domain = (domain)? "domain="+domain+";" : "";
	            document.cookie = name+"="+value+expires+";"+domain+"path=/";
	        },
	    
	        read: function(name) {
	            var nameEQ = name + "=";
	            var ca = document.cookie.split(';');
	            for(var i=0;i < ca.length;i++) {
	                var c = ca[i];
	                while (c.charAt(0)==' ') c = c.substring(1,c.length);
	                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
	            }
	            return null;
	        },
	    
	        remove: function(name) {
	            this.create(name,"",-1);
	        }
	    };
	    
	    var cookie_noop = {
	        create: function(name,value,minutes,domain) {},
	        read: function(name) { return null; },
	        remove: function(name) {}
	    };
	    
	    
	    
	    // move dependent functions to a container so that
	    // they can be overriden easier in no jquery environment (node.js)
	    var f = {
	        extend: $ ? $.extend : _extend,
	        deepExtend: _deepExtend,
	        each: $ ? $.each : _each,
	        ajax: $ ? $.ajax : (typeof document !== 'undefined' ? _ajax : function() {}),
	        cookie: typeof document !== 'undefined' ? _cookie : cookie_noop,
	        detectLanguage: detectLanguage,
	        escape: _escape,
	        log: function(str) {
	            if (o.debug && typeof console !== "undefined") console.log(str);
	        },
	        error: function(str) {
	            if (typeof console !== "undefined") console.error(str);
	        },
	        getCountyIndexOfLng: function(lng) {
	            var lng_index = 0;
	            if (lng === 'nb-NO' || lng === 'nn-NO' || lng === 'nb-no' || lng === 'nn-no') lng_index = 1;
	            return lng_index;
	        },
	        toLanguages: function(lng) {
	            var log = this.log;
	    
	            function applyCase(l) {
	                var ret = l;
	    
	                if (typeof l === 'string' && l.indexOf('-') > -1) {
	                    var parts = l.split('-');
	    
	                    ret = o.lowerCaseLng ?
	                        parts[0].toLowerCase() +  '-' + parts[1].toLowerCase() :
	                        parts[0].toLowerCase() +  '-' + parts[1].toUpperCase();
	                } else {
	                    ret = o.lowerCaseLng ? l.toLowerCase() : l;
	                }
	    
	                return ret;
	            }
	    
	            var languages = [];
	            var whitelist = o.lngWhitelist || false;
	            var addLanguage = function(language){
	              //reject langs not whitelisted
	              if(!whitelist || whitelist.indexOf(language) > -1){
	                languages.push(language);
	              }else{
	                log('rejecting non-whitelisted language: ' + language);
	              }
	            };
	            if (typeof lng === 'string' && lng.indexOf('-') > -1) {
	                var parts = lng.split('-');
	    
	                if (o.load !== 'unspecific') addLanguage(applyCase(lng));
	                if (o.load !== 'current') addLanguage(applyCase(parts[this.getCountyIndexOfLng(lng)]));
	            } else {
	                addLanguage(applyCase(lng));
	            }
	    
	            for (var i = 0; i < o.fallbackLng.length; i++) {
	                if (languages.indexOf(o.fallbackLng[i]) === -1 && o.fallbackLng[i]) languages.push(applyCase(o.fallbackLng[i]));
	            }
	            return languages;
	        },
	        regexEscape: function(str) {
	            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	        },
	        regexReplacementEscape: function(strOrFn) {
	            if (typeof strOrFn === 'string') {
	                return strOrFn.replace(/\$/g, "$$$$");
	            } else {
	                return strOrFn;
	            }
	        },
	        localStorage: {
	            setItem: function(key, value) {
	                if (window.localStorage) {
	                    try {
	                        window.localStorage.setItem(key, value);
	                    } catch (e) {
	                        f.log('failed to set value for key "' + key + '" to localStorage.');
	                    }
	                }
	            }
	        }
	    };
	    function init(options, cb) {
	        
	        if (typeof options === 'function') {
	            cb = options;
	            options = {};
	        }
	        options = options || {};
	        
	        // override defaults with passed in options
	        f.extend(o, options);
	        delete o.fixLng; /* passed in each time */
	    
	        // override functions: .log(), .detectLanguage(), etc
	        if (o.functions) {
	            delete o.functions;
	            f.extend(f, options.functions);
	        }
	    
	        // create namespace object if namespace is passed in as string
	        if (typeof o.ns == 'string') {
	            o.ns = { namespaces: [o.ns], defaultNs: o.ns};
	        }
	    
	        // fallback namespaces
	        if (typeof o.fallbackNS == 'string') {
	            o.fallbackNS = [o.fallbackNS];
	        }
	    
	        // fallback languages
	        if (typeof o.fallbackLng == 'string' || typeof o.fallbackLng == 'boolean') {
	            o.fallbackLng = [o.fallbackLng];
	        }
	    
	        // escape prefix/suffix
	        o.interpolationPrefixEscaped = f.regexEscape(o.interpolationPrefix);
	        o.interpolationSuffixEscaped = f.regexEscape(o.interpolationSuffix);
	    
	        if (!o.lng) o.lng = f.detectLanguage();
	    
	        languages = f.toLanguages(o.lng);
	        currentLng = languages[0];
	        f.log('currentLng set to: ' + currentLng);
	    
	        if (o.useCookie && f.cookie.read(o.cookieName) !== currentLng){ //cookie is unset or invalid
	            f.cookie.create(o.cookieName, currentLng, o.cookieExpirationTime, o.cookieDomain);
	        }
	        if (o.detectLngFromLocalStorage && typeof document !== 'undefined' && window.localStorage) {
	            f.localStorage.setItem('i18next_lng', currentLng);
	        }
	    
	        var lngTranslate = translate;
	        if (options.fixLng) {
	            lngTranslate = function(key, options) {
	                options = options || {};
	                options.lng = options.lng || lngTranslate.lng;
	                return translate(key, options);
	            };
	            lngTranslate.lng = currentLng;
	        }
	    
	        pluralExtensions.setCurrentLng(currentLng);
	    
	        // add JQuery extensions
	        if ($ && o.setJqueryExt) addJqueryFunct();
	    
	        // jQuery deferred
	        var deferred;
	        if ($ && $.Deferred) {
	            deferred = $.Deferred();
	        }
	    
	        // return immidiatly if res are passed in
	        if (o.resStore) {
	            resStore = o.resStore;
	            initialized = true;
	            if (cb) cb(lngTranslate);
	            if (deferred) deferred.resolve(lngTranslate);
	            if (deferred) return deferred.promise();
	            return;
	        }
	    
	        // languages to load
	        var lngsToLoad = f.toLanguages(o.lng);
	        if (typeof o.preload === 'string') o.preload = [o.preload];
	        for (var i = 0, l = o.preload.length; i < l; i++) {
	            var pres = f.toLanguages(o.preload[i]);
	            for (var y = 0, len = pres.length; y < len; y++) {
	                if (lngsToLoad.indexOf(pres[y]) < 0) {
	                    lngsToLoad.push(pres[y]);
	                }
	            }
	        }
	    
	        // else load them
	        i18n.sync.load(lngsToLoad, o, function(err, store) {
	            resStore = store;
	            initialized = true;
	    
	            if (cb) cb(lngTranslate);
	            if (deferred) deferred.resolve(lngTranslate);
	        });
	    
	        if (deferred) return deferred.promise();
	    }
	    function preload(lngs, cb) {
	        if (typeof lngs === 'string') lngs = [lngs];
	        for (var i = 0, l = lngs.length; i < l; i++) {
	            if (o.preload.indexOf(lngs[i]) < 0) {
	                o.preload.push(lngs[i]);
	            }
	        }
	        return init(cb);
	    }
	    
	    function addResourceBundle(lng, ns, resources, deep) {
	        if (typeof ns !== 'string') {
	            resources = ns;
	            ns = o.ns.defaultNs;
	        } else if (o.ns.namespaces.indexOf(ns) < 0) {
	            o.ns.namespaces.push(ns);
	        }
	    
	        resStore[lng] = resStore[lng] || {};
	        resStore[lng][ns] = resStore[lng][ns] || {};
	    
	        if (deep) {
	            f.deepExtend(resStore[lng][ns], resources);
	        } else {
	            f.extend(resStore[lng][ns], resources);
	        }
	    }
	    
	    function hasResourceBundle(lng, ns) {
	        if (typeof ns !== 'string') {
	            ns = o.ns.defaultNs;
	        }
	    
	        resStore[lng] = resStore[lng] || {};
	        var res = resStore[lng][ns] || {};
	    
	        var hasValues = false;
	        for(var prop in res) {
	            if (res.hasOwnProperty(prop)) {
	                hasValues = true;
	            }
	        }
	    
	        return hasValues;
	    }
	    
	    function removeResourceBundle(lng, ns) {
	        if (typeof ns !== 'string') {
	            ns = o.ns.defaultNs;
	        }
	    
	        resStore[lng] = resStore[lng] || {};
	        resStore[lng][ns] = {};
	    }
	    
	    function addResource(lng, ns, key, value) {
	        if (typeof ns !== 'string') {
	            resource = ns;
	            ns = o.ns.defaultNs;
	        } else if (o.ns.namespaces.indexOf(ns) < 0) {
	            o.ns.namespaces.push(ns);
	        }
	    
	        resStore[lng] = resStore[lng] || {};
	        resStore[lng][ns] = resStore[lng][ns] || {};
	    
	        var keys = key.split(o.keyseparator);
	        var x = 0;
	        var node = resStore[lng][ns];
	        var origRef = node;
	    
	        while (keys[x]) {
	            if (x == keys.length - 1)
	                node[keys[x]] = value;
	            else {
	                if (node[keys[x]] == null)
	                    node[keys[x]] = {};
	    
	                node = node[keys[x]];
	            }
	            x++;
	        }
	    }
	    
	    function addResources(lng, ns, resources) {
	        if (typeof ns !== 'string') {
	            resource = ns;
	            ns = o.ns.defaultNs;
	        } else if (o.ns.namespaces.indexOf(ns) < 0) {
	            o.ns.namespaces.push(ns);
	        }
	    
	        for (var m in resources) {
	            if (typeof resources[m] === 'string') addResource(lng, ns, m, resources[m]);
	        }
	    }
	    
	    function setDefaultNamespace(ns) {
	        o.ns.defaultNs = ns;
	    }
	    
	    function loadNamespace(namespace, cb) {
	        loadNamespaces([namespace], cb);
	    }
	    
	    function loadNamespaces(namespaces, cb) {
	        var opts = {
	            dynamicLoad: o.dynamicLoad,
	            resGetPath: o.resGetPath,
	            getAsync: o.getAsync,
	            customLoad: o.customLoad,
	            ns: { namespaces: namespaces, defaultNs: ''} /* new namespaces to load */
	        };
	    
	        // languages to load
	        var lngsToLoad = f.toLanguages(o.lng);
	        if (typeof o.preload === 'string') o.preload = [o.preload];
	        for (var i = 0, l = o.preload.length; i < l; i++) {
	            var pres = f.toLanguages(o.preload[i]);
	            for (var y = 0, len = pres.length; y < len; y++) {
	                if (lngsToLoad.indexOf(pres[y]) < 0) {
	                    lngsToLoad.push(pres[y]);
	                }
	            }
	        }
	    
	        // check if we have to load
	        var lngNeedLoad = [];
	        for (var a = 0, lenA = lngsToLoad.length; a < lenA; a++) {
	            var needLoad = false;
	            var resSet = resStore[lngsToLoad[a]];
	            if (resSet) {
	                for (var b = 0, lenB = namespaces.length; b < lenB; b++) {
	                    if (!resSet[namespaces[b]]) needLoad = true;
	                }
	            } else {
	                needLoad = true;
	            }
	    
	            if (needLoad) lngNeedLoad.push(lngsToLoad[a]);
	        }
	    
	        if (lngNeedLoad.length) {
	            i18n.sync._fetch(lngNeedLoad, opts, function(err, store) {
	                var todo = namespaces.length * lngNeedLoad.length;
	    
	                // load each file individual
	                f.each(namespaces, function(nsIndex, nsValue) {
	    
	                    // append namespace to namespace array
	                    if (o.ns.namespaces.indexOf(nsValue) < 0) {
	                        o.ns.namespaces.push(nsValue);
	                    }
	    
	                    f.each(lngNeedLoad, function(lngIndex, lngValue) {
	                        resStore[lngValue] = resStore[lngValue] || {};
	                        resStore[lngValue][nsValue] = store[lngValue][nsValue];
	    
	                        todo--; // wait for all done befor callback
	                        if (todo === 0 && cb) {
	                            if (o.useLocalStorage) i18n.sync._storeLocal(resStore);
	                            cb();
	                        }
	                    });
	                });
	            });
	        } else {
	            if (cb) cb();
	        }
	    }
	    
	    function setLng(lng, options, cb) {
	        if (typeof options === 'function') {
	            cb = options;
	            options = {};
	        } else if (!options) {
	            options = {};
	        }
	    
	        options.lng = lng;
	        return init(options, cb);
	    }
	    
	    function lng() {
	        return currentLng;
	    }
	    
	    function reload(cb) {
	        resStore = {};
	        setLng(currentLng, cb);
	    }
	    function addJqueryFunct() {
	        // $.t shortcut
	        $.t = $.t || translate;
	    
	        function parse(ele, key, options) {
	            if (key.length === 0) return;
	    
	            var attr = 'text';
	    
	            if (key.indexOf('[') === 0) {
	                var parts = key.split(']');
	                key = parts[1];
	                attr = parts[0].substr(1, parts[0].length-1);
	            }
	    
	            if (key.indexOf(';') === key.length-1) {
	                key = key.substr(0, key.length-2);
	            }
	    
	            var optionsToUse;
	            if (attr === 'html') {
	                optionsToUse = o.defaultValueFromContent ? $.extend({ defaultValue: ele.html() }, options) : options;
	                ele.html($.t(key, optionsToUse));
	            } else if (attr === 'text') {
	                optionsToUse = o.defaultValueFromContent ? $.extend({ defaultValue: ele.text() }, options) : options;
	                ele.text($.t(key, optionsToUse));
	            } else if (attr === 'prepend') {
	                optionsToUse = o.defaultValueFromContent ? $.extend({ defaultValue: ele.html() }, options) : options;
	                ele.prepend($.t(key, optionsToUse));
	            } else if (attr === 'append') {
	                optionsToUse = o.defaultValueFromContent ? $.extend({ defaultValue: ele.html() }, options) : options;
	                ele.append($.t(key, optionsToUse));
	            } else if (attr.indexOf("data-") === 0) {
	                var dataAttr = attr.substr(("data-").length);
	                optionsToUse = o.defaultValueFromContent ? $.extend({ defaultValue: ele.data(dataAttr) }, options) : options;
	                var translated = $.t(key, optionsToUse);
	                //we change into the data cache
	                ele.data(dataAttr, translated);
	                //we change into the dom
	                ele.attr(attr, translated);
	            } else {
	                optionsToUse = o.defaultValueFromContent ? $.extend({ defaultValue: ele.attr(attr) }, options) : options;
	                ele.attr(attr, $.t(key, optionsToUse));
	            }
	        }
	    
	        function localize(ele, options) {
	            var key = ele.attr(o.selectorAttr);
	            if (!key && typeof key !== 'undefined' && key !== false) key = ele.text() || ele.val();
	            if (!key) return;
	    
	            var target = ele
	              , targetSelector = ele.data("i18n-target");
	            if (targetSelector) {
	                target = ele.find(targetSelector) || ele;
	            }
	    
	            if (!options && o.useDataAttrOptions === true) {
	                options = ele.data("i18n-options");
	            }
	            options = options || {};
	    
	            if (key.indexOf(';') >= 0) {
	                var keys = key.split(';');
	    
	                $.each(keys, function(m, k) {
	                    if (k !== '') parse(target, k, options);
	                });
	    
	            } else {
	                parse(target, key, options);
	            }
	    
	            if (o.useDataAttrOptions === true) ele.data("i18n-options", options);
	        }
	    
	        // fn
	        $.fn.i18n = function (options) {
	            return this.each(function() {
	                // localize element itself
	                localize($(this), options);
	    
	                // localize childs
	                var elements =  $(this).find('[' + o.selectorAttr + ']');
	                elements.each(function() { 
	                    localize($(this), options);
	                });
	            });
	        };
	    }
	    function applyReplacement(str, replacementHash, nestedKey, options) {
	        if (!str) return str;
	    
	        options = options || replacementHash; // first call uses replacement hash combined with options
	        if (str.indexOf(options.interpolationPrefix || o.interpolationPrefix) < 0) return str;
	    
	        var prefix = options.interpolationPrefix ? f.regexEscape(options.interpolationPrefix) : o.interpolationPrefixEscaped
	          , suffix = options.interpolationSuffix ? f.regexEscape(options.interpolationSuffix) : o.interpolationSuffixEscaped
	          , unEscapingSuffix = 'HTML'+suffix;
	    
	        var hash = replacementHash.replace && typeof replacementHash.replace === 'object' ? replacementHash.replace : replacementHash;
	        f.each(hash, function(key, value) {
	            var nextKey = nestedKey ? nestedKey + o.keyseparator + key : key;
	            if (typeof value === 'object' && value !== null) {
	                str = applyReplacement(str, value, nextKey, options);
	            } else {
	                if (options.escapeInterpolation || o.escapeInterpolation) {
	                    str = str.replace(new RegExp([prefix, nextKey, unEscapingSuffix].join(''), 'g'), f.regexReplacementEscape(value));
	                    str = str.replace(new RegExp([prefix, nextKey, suffix].join(''), 'g'), f.regexReplacementEscape(f.escape(value)));
	                } else {
	                    str = str.replace(new RegExp([prefix, nextKey, suffix].join(''), 'g'), f.regexReplacementEscape(value));
	                }
	                // str = options.escapeInterpolation;
	            }
	        });
	        return str;
	    }
	    
	    // append it to functions
	    f.applyReplacement = applyReplacement;
	    
	    function applyReuse(translated, options) {
	        var comma = ',';
	        var options_open = '{';
	        var options_close = '}';
	    
	        var opts = f.extend({}, options);
	        delete opts.postProcess;
	    
	        while (translated.indexOf(o.reusePrefix) != -1) {
	            replacementCounter++;
	            if (replacementCounter > o.maxRecursion) { break; } // safety net for too much recursion
	            var index_of_opening = translated.lastIndexOf(o.reusePrefix);
	            var index_of_end_of_closing = translated.indexOf(o.reuseSuffix, index_of_opening) + o.reuseSuffix.length;
	            var token = translated.substring(index_of_opening, index_of_end_of_closing);
	            var token_without_symbols = token.replace(o.reusePrefix, '').replace(o.reuseSuffix, '');
	    
	            if (index_of_end_of_closing <= index_of_opening) {
	                f.error('there is an missing closing in following translation value', translated);
	                return '';
	            }
	    
	            if (token_without_symbols.indexOf(comma) != -1) {
	                var index_of_token_end_of_closing = token_without_symbols.indexOf(comma);
	                if (token_without_symbols.indexOf(options_open, index_of_token_end_of_closing) != -1 && token_without_symbols.indexOf(options_close, index_of_token_end_of_closing) != -1) {
	                    var index_of_opts_opening = token_without_symbols.indexOf(options_open, index_of_token_end_of_closing);
	                    var index_of_opts_end_of_closing = token_without_symbols.indexOf(options_close, index_of_opts_opening) + options_close.length;
	                    try {
	                        opts = f.extend(opts, JSON.parse(token_without_symbols.substring(index_of_opts_opening, index_of_opts_end_of_closing)));
	                        token_without_symbols = token_without_symbols.substring(0, index_of_token_end_of_closing);
	                    } catch (e) {
	                    }
	                }
	            }
	    
	            var translated_token = _translate(token_without_symbols, opts);
	            translated = translated.replace(token, f.regexReplacementEscape(translated_token));
	        }
	        return translated;
	    }
	    
	    function hasContext(options) {
	        return (options.context && (typeof options.context == 'string' || typeof options.context == 'number'));
	    }
	    
	    function needsPlural(options, lng) {
	        return (options.count !== undefined && typeof options.count != 'string'/* && pluralExtensions.needsPlural(lng, options.count)*/);
	    }
	    
	    function needsIndefiniteArticle(options) {
	        return (options.indefinite_article !== undefined && typeof options.indefinite_article != 'string' && options.indefinite_article);
	    }
	    
	    function exists(key, options) {
	        options = options || {};
	    
	        var notFound = _getDefaultValue(key, options)
	            , found = _find(key, options);
	    
	        return found !== undefined || found === notFound;
	    }
	    
	    function translate(key, options) {
	        options = options || {};
	    
	        if (!initialized) {
	            f.log('i18next not finished initialization. you might have called t function before loading resources finished.')
	            return options.defaultValue || '';
	        };
	        replacementCounter = 0;
	        return _translate.apply(null, arguments);
	    }
	    
	    function _getDefaultValue(key, options) {
	        return (options.defaultValue !== undefined) ? options.defaultValue : key;
	    }
	    
	    function _injectSprintfProcessor() {
	    
	        var values = [];
	    
	        // mh: build array from second argument onwards
	        for (var i = 1; i < arguments.length; i++) {
	            values.push(arguments[i]);
	        }
	    
	        return {
	            postProcess: 'sprintf',
	            sprintf:     values
	        };
	    }
	    
	    function _translate(potentialKeys, options) {
	        if (options && typeof options !== 'object') {
	            if (o.shortcutFunction === 'sprintf') {
	                // mh: gettext like sprintf syntax found, automatically create sprintf processor
	                options = _injectSprintfProcessor.apply(null, arguments);
	            } else if (o.shortcutFunction === 'defaultValue') {
	                options = {
	                    defaultValue: options
	                }
	            }
	        } else {
	            options = options || {};
	        }
	    
	        if (typeof o.defaultVariables === 'object') {
	            options = f.extend({}, o.defaultVariables, options);
	        }
	    
	        if (potentialKeys === undefined || potentialKeys === null || potentialKeys === '') return '';
	    
	        if (typeof potentialKeys === 'string') {
	            potentialKeys = [potentialKeys];
	        }
	    
	        var key = potentialKeys[0];
	    
	        if (potentialKeys.length > 1) {
	            for (var i = 0; i < potentialKeys.length; i++) {
	                key = potentialKeys[i];
	                if (exists(key, options)) {
	                    break;
	                }
	            }
	        }
	    
	        var notFound = _getDefaultValue(key, options)
	            , found = _find(key, options)
	            , lngs = options.lng ? f.toLanguages(options.lng, options.fallbackLng) : languages
	            , ns = options.ns || o.ns.defaultNs
	            , parts;
	    
	        // split ns and key
	        if (key.indexOf(o.nsseparator) > -1) {
	            parts = key.split(o.nsseparator);
	            ns = parts[0];
	            key = parts[1];
	        }
	    
	        if (found === undefined && o.sendMissing && typeof o.missingKeyHandler === 'function') {
	            if (options.lng) {
	                o.missingKeyHandler(lngs[0], ns, key, notFound, lngs);
	            } else {
	                o.missingKeyHandler(o.lng, ns, key, notFound, lngs);
	            }
	        }
	    
	        var postProcessor = options.postProcess || o.postProcess;
	        if (found !== undefined && postProcessor) {
	            if (postProcessors[postProcessor]) {
	                found = postProcessors[postProcessor](found, key, options);
	            }
	        }
	    
	        // process notFound if function exists
	        var splitNotFound = notFound;
	        if (notFound.indexOf(o.nsseparator) > -1) {
	            parts = notFound.split(o.nsseparator);
	            splitNotFound = parts[1];
	        }
	        if (splitNotFound === key && o.parseMissingKey) {
	            notFound = o.parseMissingKey(notFound);
	        }
	    
	        if (found === undefined) {
	            notFound = applyReplacement(notFound, options);
	            notFound = applyReuse(notFound, options);
	    
	            if (postProcessor && postProcessors[postProcessor]) {
	                var val = _getDefaultValue(key, options);
	                found = postProcessors[postProcessor](val, key, options);
	            }
	        }
	    
	        return (found !== undefined) ? found : notFound;
	    }
	    
	    function _find(key, options) {
	        options = options || {};
	    
	        var optionWithoutCount, translated
	            , notFound = _getDefaultValue(key, options)
	            , lngs = languages;
	    
	        if (!resStore) { return notFound; } // no resStore to translate from
	    
	        // CI mode
	        if (lngs[0].toLowerCase() === 'cimode') return notFound;
	    
	        // passed in lng
	        if (options.lngs) lngs = options.lngs;
	        if (options.lng) {
	            lngs = f.toLanguages(options.lng, options.fallbackLng);
	    
	            if (!resStore[lngs[0]]) {
	                var oldAsync = o.getAsync;
	                o.getAsync = false;
	    
	                i18n.sync.load(lngs, o, function(err, store) {
	                    f.extend(resStore, store);
	                    o.getAsync = oldAsync;
	                });
	            }
	        }
	    
	        var ns = options.ns || o.ns.defaultNs;
	        if (key.indexOf(o.nsseparator) > -1) {
	            var parts = key.split(o.nsseparator);
	            ns = parts[0];
	            key = parts[1];
	        }
	    
	        if (hasContext(options)) {
	            optionWithoutCount = f.extend({}, options);
	            delete optionWithoutCount.context;
	            optionWithoutCount.defaultValue = o.contextNotFound;
	    
	            var contextKey = ns + o.nsseparator + key + '_' + options.context;
	    
	            translated = translate(contextKey, optionWithoutCount);
	            if (translated != o.contextNotFound) {
	                return applyReplacement(translated, { context: options.context }); // apply replacement for context only
	            } // else continue translation with original/nonContext key
	        }
	    
	        if (needsPlural(options, lngs[0])) {
	            optionWithoutCount = f.extend({ lngs: [lngs[0]]}, options);
	            delete optionWithoutCount.count;
	            delete optionWithoutCount.lng;
	            optionWithoutCount.defaultValue = o.pluralNotFound;
	    
	            var pluralKey;
	            if (!pluralExtensions.needsPlural(lngs[0], options.count)) {
	                pluralKey = ns + o.nsseparator + key;
	            } else {
	                pluralKey = ns + o.nsseparator + key + o.pluralSuffix;
	                var pluralExtension = pluralExtensions.get(lngs[0], options.count);
	                if (pluralExtension >= 0) {
	                    pluralKey = pluralKey + '_' + pluralExtension;
	                } else if (pluralExtension === 1) {
	                    pluralKey = ns + o.nsseparator + key; // singular
	                }
	            }
	    
	            translated = translate(pluralKey, optionWithoutCount);
	    
	            if (translated != o.pluralNotFound) {
	                return applyReplacement(translated, {
	                    count: options.count,
	                    interpolationPrefix: options.interpolationPrefix,
	                    interpolationSuffix: options.interpolationSuffix
	                }); // apply replacement for count only
	            } else if (lngs.length > 1) {
	                // remove failed lng
	                var clone = lngs.slice();
	                clone.shift();
	                options = f.extend(options, { lngs: clone });
	                delete options.lng;
	                // retry with fallbacks
	                translated = translate(ns + o.nsseparator + key, options);
	                if (translated != o.pluralNotFound) return translated;
	            } else {
	                return translated;
	            }
	        }
	    
	        if (needsIndefiniteArticle(options)) {
	            var optionsWithoutIndef = f.extend({}, options);
	            delete optionsWithoutIndef.indefinite_article;
	            optionsWithoutIndef.defaultValue = o.indefiniteNotFound;
	            // If we don't have a count, we want the indefinite, if we do have a count, and needsPlural is false
	            var indefiniteKey = ns + o.nsseparator + key + (((options.count && !needsPlural(options, lngs[0])) || !options.count) ? o.indefiniteSuffix : "");
	            translated = translate(indefiniteKey, optionsWithoutIndef);
	            if (translated != o.indefiniteNotFound) {
	                return translated;
	            }
	        }
	    
	        var found;
	        var keys = key.split(o.keyseparator);
	        for (var i = 0, len = lngs.length; i < len; i++ ) {
	            if (found !== undefined) break;
	    
	            var l = lngs[i];
	    
	            var x = 0;
	            var value = resStore[l] && resStore[l][ns];
	            while (keys[x]) {
	                value = value && value[keys[x]];
	                x++;
	            }
	            if (value !== undefined) {
	                var valueType = Object.prototype.toString.apply(value);
	                if (typeof value === 'string') {
	                    value = applyReplacement(value, options);
	                    value = applyReuse(value, options);
	                } else if (valueType === '[object Array]' && !o.returnObjectTrees && !options.returnObjectTrees) {
	                    value = value.join('\n');
	                    value = applyReplacement(value, options);
	                    value = applyReuse(value, options);
	                } else if (value === null && o.fallbackOnNull === true) {
	                    value = undefined;
	                } else if (value !== null) {
	                    if (!o.returnObjectTrees && !options.returnObjectTrees) {
	                        if (o.objectTreeKeyHandler && typeof o.objectTreeKeyHandler == 'function') {
	                            value = o.objectTreeKeyHandler(key, value, l, ns, options);
	                        } else {
	                            value = 'key \'' + ns + ':' + key + ' (' + l + ')\' ' +
	                                'returned an object instead of string.';
	                            f.log(value);
	                        }
	                    } else if (valueType !== '[object Number]' && valueType !== '[object Function]' && valueType !== '[object RegExp]') {
	                        var copy = (valueType === '[object Array]') ? [] : {}; // apply child translation on a copy
	                        f.each(value, function(m) {
	                            copy[m] = _translate(ns + o.nsseparator + key + o.keyseparator + m, options);
	                        });
	                        value = copy;
	                    }
	                }
	    
	                if (typeof value === 'string' && value.trim() === '' && o.fallbackOnEmpty === true)
	                    value = undefined;
	    
	                found = value;
	            }
	        }
	    
	        if (found === undefined && !options.isFallbackLookup && (o.fallbackToDefaultNS === true || (o.fallbackNS && o.fallbackNS.length > 0))) {
	            // set flag for fallback lookup - avoid recursion
	            options.isFallbackLookup = true;
	    
	            if (o.fallbackNS.length) {
	    
	                for (var y = 0, lenY = o.fallbackNS.length; y < lenY; y++) {
	                    found = _find(o.fallbackNS[y] + o.nsseparator + key, options);
	    
	                    if (found || (found==="" && o.fallbackOnEmpty === false)) {
	                        /* compare value without namespace */
	                        var foundValue = found.indexOf(o.nsseparator) > -1 ? found.split(o.nsseparator)[1] : found
	                          , notFoundValue = notFound.indexOf(o.nsseparator) > -1 ? notFound.split(o.nsseparator)[1] : notFound;
	    
	                        if (foundValue !== notFoundValue) break;
	                    }
	                }
	            } else {
	                found = _find(key, options); // fallback to default NS
	            }
	            options.isFallbackLookup = false;
	        }
	    
	        return found;
	    }
	    function detectLanguage() {
	        var detectedLng;
	        var whitelist = o.lngWhitelist || [];
	        var userLngChoices = [];
	    
	        // get from qs
	        var qsParm = [];
	        if (typeof window !== 'undefined') {
	            (function() {
	                var query = window.location.search.substring(1);
	                var params = query.split('&');
	                for (var i=0; i<params.length; i++) {
	                    var pos = params[i].indexOf('=');
	                    if (pos > 0) {
	                        var key = params[i].substring(0,pos);
	                        if (key == o.detectLngQS) {
	                            userLngChoices.push(params[i].substring(pos+1));
	                        }
	                    }
	                }
	            })();
	        }
	    
	        // get from cookie
	        if (o.useCookie && typeof document !== 'undefined') {
	            var c = f.cookie.read(o.cookieName);
	            if (c) userLngChoices.push(c);
	        }
	    
	        // get from localStorage
	        if (o.detectLngFromLocalStorage && typeof window !== 'undefined' && window.localStorage) {
	            userLngChoices.push(window.localStorage.getItem('i18next_lng'));
	        }
	    
	        // get from navigator
	        if (typeof navigator !== 'undefined') {
	            if (navigator.languages) { // chrome only; not an array, so can't use .push.apply instead of iterating
	                for (var i=0;i<navigator.languages.length;i++) {
	                    userLngChoices.push(navigator.languages[i]);
	                }
	            }
	            if (navigator.userLanguage) {
	                userLngChoices.push(navigator.userLanguage);
	            }
	            if (navigator.language) {
	                userLngChoices.push(navigator.language);
	            }
	        }
	    
	        (function() {
	            for (var i=0;i<userLngChoices.length;i++) {
	                var lng = userLngChoices[i];
	    
	                if (lng.indexOf('-') > -1) {
	                    var parts = lng.split('-');
	                    lng = o.lowerCaseLng ?
	                        parts[0].toLowerCase() +  '-' + parts[1].toLowerCase() :
	                        parts[0].toLowerCase() +  '-' + parts[1].toUpperCase();
	                }
	    
	                if (whitelist.length === 0 || whitelist.indexOf(lng) > -1) {
	                    detectedLng = lng;
	                    break;
	                }
	            }
	        })();
	    
	        //fallback
	        if (!detectedLng){
	          detectedLng = o.fallbackLng[0];
	        }
	        
	        return detectedLng;
	    }
	    // definition http://translate.sourceforge.net/wiki/l10n/pluralforms
	    
	    /* [code, name, numbers, pluralsType] */
	    var _rules = [
	        ["ach", "Acholi", [1,2], 1],
	        ["af", "Afrikaans",[1,2], 2],
	        ["ak", "Akan", [1,2], 1],
	        ["am", "Amharic", [1,2], 1],
	        ["an", "Aragonese",[1,2], 2],
	        ["ar", "Arabic", [0,1,2,3,11,100],5],
	        ["arn", "Mapudungun",[1,2], 1],
	        ["ast", "Asturian", [1,2], 2],
	        ["ay", "Aymará", [1], 3],
	        ["az", "Azerbaijani",[1,2],2],
	        ["be", "Belarusian",[1,2,5],4],
	        ["bg", "Bulgarian",[1,2], 2],
	        ["bn", "Bengali", [1,2], 2],
	        ["bo", "Tibetan", [1], 3],
	        ["br", "Breton", [1,2], 1],
	        ["bs", "Bosnian", [1,2,5],4],
	        ["ca", "Catalan", [1,2], 2],
	        ["cgg", "Chiga", [1], 3],
	        ["cs", "Czech", [1,2,5],6],
	        ["csb", "Kashubian",[1,2,5],7],
	        ["cy", "Welsh", [1,2,3,8],8],
	        ["da", "Danish", [1,2], 2],
	        ["de", "German", [1,2], 2],
	        ["dev", "Development Fallback", [1,2], 2],
	        ["dz", "Dzongkha", [1], 3],
	        ["el", "Greek", [1,2], 2],
	        ["en", "English", [1,2], 2],
	        ["eo", "Esperanto",[1,2], 2],
	        ["es", "Spanish", [1,2], 2],
	        ["es_ar","Argentinean Spanish", [1,2], 2],
	        ["et", "Estonian", [1,2], 2],
	        ["eu", "Basque", [1,2], 2],
	        ["fa", "Persian", [1], 3],
	        ["fi", "Finnish", [1,2], 2],
	        ["fil", "Filipino", [1,2], 1],
	        ["fo", "Faroese", [1,2], 2],
	        ["fr", "French", [1,2], 9],
	        ["fur", "Friulian", [1,2], 2],
	        ["fy", "Frisian", [1,2], 2],
	        ["ga", "Irish", [1,2,3,7,11],10],
	        ["gd", "Scottish Gaelic",[1,2,3,20],11],
	        ["gl", "Galician", [1,2], 2],
	        ["gu", "Gujarati", [1,2], 2],
	        ["gun", "Gun", [1,2], 1],
	        ["ha", "Hausa", [1,2], 2],
	        ["he", "Hebrew", [1,2], 2],
	        ["hi", "Hindi", [1,2], 2],
	        ["hr", "Croatian", [1,2,5],4],
	        ["hu", "Hungarian",[1,2], 2],
	        ["hy", "Armenian", [1,2], 2],
	        ["ia", "Interlingua",[1,2],2],
	        ["id", "Indonesian",[1], 3],
	        ["is", "Icelandic",[1,2], 12],
	        ["it", "Italian", [1,2], 2],
	        ["ja", "Japanese", [1], 3],
	        ["jbo", "Lojban", [1], 3],
	        ["jv", "Javanese", [0,1], 13],
	        ["ka", "Georgian", [1], 3],
	        ["kk", "Kazakh", [1], 3],
	        ["km", "Khmer", [1], 3],
	        ["kn", "Kannada", [1,2], 2],
	        ["ko", "Korean", [1], 3],
	        ["ku", "Kurdish", [1,2], 2],
	        ["kw", "Cornish", [1,2,3,4],14],
	        ["ky", "Kyrgyz", [1], 3],
	        ["lb", "Letzeburgesch",[1,2],2],
	        ["ln", "Lingala", [1,2], 1],
	        ["lo", "Lao", [1], 3],
	        ["lt", "Lithuanian",[1,2,10],15],
	        ["lv", "Latvian", [1,2,0],16],
	        ["mai", "Maithili", [1,2], 2],
	        ["mfe", "Mauritian Creole",[1,2],1],
	        ["mg", "Malagasy", [1,2], 1],
	        ["mi", "Maori", [1,2], 1],
	        ["mk", "Macedonian",[1,2],17],
	        ["ml", "Malayalam",[1,2], 2],
	        ["mn", "Mongolian",[1,2], 2],
	        ["mnk", "Mandinka", [0,1,2],18],
	        ["mr", "Marathi", [1,2], 2],
	        ["ms", "Malay", [1], 3],
	        ["mt", "Maltese", [1,2,11,20],19],
	        ["nah", "Nahuatl", [1,2], 2],
	        ["nap", "Neapolitan",[1,2], 2],
	        ["nb", "Norwegian Bokmal",[1,2],2],
	        ["ne", "Nepali", [1,2], 2],
	        ["nl", "Dutch", [1,2], 2],
	        ["nn", "Norwegian Nynorsk",[1,2],2],
	        ["no", "Norwegian",[1,2], 2],
	        ["nso", "Northern Sotho",[1,2],2],
	        ["oc", "Occitan", [1,2], 1],
	        ["or", "Oriya", [2,1], 2],
	        ["pa", "Punjabi", [1,2], 2],
	        ["pap", "Papiamento",[1,2], 2],
	        ["pl", "Polish", [1,2,5],7],
	        ["pms", "Piemontese",[1,2], 2],
	        ["ps", "Pashto", [1,2], 2],
	        ["pt", "Portuguese",[1,2], 2],
	        ["pt_br","Brazilian Portuguese",[1,2], 2],
	        ["rm", "Romansh", [1,2], 2],
	        ["ro", "Romanian", [1,2,20],20],
	        ["ru", "Russian", [1,2,5],4],
	        ["sah", "Yakut", [1], 3],
	        ["sco", "Scots", [1,2], 2],
	        ["se", "Northern Sami",[1,2], 2],
	        ["si", "Sinhala", [1,2], 2],
	        ["sk", "Slovak", [1,2,5],6],
	        ["sl", "Slovenian",[5,1,2,3],21],
	        ["so", "Somali", [1,2], 2],
	        ["son", "Songhay", [1,2], 2],
	        ["sq", "Albanian", [1,2], 2],
	        ["sr", "Serbian", [1,2,5],4],
	        ["su", "Sundanese",[1], 3],
	        ["sv", "Swedish", [1,2], 2],
	        ["sw", "Swahili", [1,2], 2],
	        ["ta", "Tamil", [1,2], 2],
	        ["te", "Telugu", [1,2], 2],
	        ["tg", "Tajik", [1,2], 1],
	        ["th", "Thai", [1], 3],
	        ["ti", "Tigrinya", [1,2], 1],
	        ["tk", "Turkmen", [1,2], 2],
	        ["tr", "Turkish", [1,2], 1],
	        ["tt", "Tatar", [1], 3],
	        ["ug", "Uyghur", [1], 3],
	        ["uk", "Ukrainian",[1,2,5],4],
	        ["ur", "Urdu", [1,2], 2],
	        ["uz", "Uzbek", [1,2], 1],
	        ["vi", "Vietnamese",[1], 3],
	        ["wa", "Walloon", [1,2], 1],
	        ["wo", "Wolof", [1], 3],
	        ["yo", "Yoruba", [1,2], 2],
	        ["zh", "Chinese", [1], 3]
	    ];
	    
	    var _rulesPluralsTypes = {
	        1: function(n) {return Number(n > 1);},
	        2: function(n) {return Number(n != 1);},
	        3: function(n) {return 0;},
	        4: function(n) {return Number(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);},
	        5: function(n) {return Number(n===0 ? 0 : n==1 ? 1 : n==2 ? 2 : n%100>=3 && n%100<=10 ? 3 : n%100>=11 ? 4 : 5);},
	        6: function(n) {return Number((n==1) ? 0 : (n>=2 && n<=4) ? 1 : 2);},
	        7: function(n) {return Number(n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);},
	        8: function(n) {return Number((n==1) ? 0 : (n==2) ? 1 : (n != 8 && n != 11) ? 2 : 3);},
	        9: function(n) {return Number(n >= 2);},
	        10: function(n) {return Number(n==1 ? 0 : n==2 ? 1 : n<7 ? 2 : n<11 ? 3 : 4) ;},
	        11: function(n) {return Number((n==1 || n==11) ? 0 : (n==2 || n==12) ? 1 : (n > 2 && n < 20) ? 2 : 3);},
	        12: function(n) {return Number(n%10!=1 || n%100==11);},
	        13: function(n) {return Number(n !== 0);},
	        14: function(n) {return Number((n==1) ? 0 : (n==2) ? 1 : (n == 3) ? 2 : 3);},
	        15: function(n) {return Number(n%10==1 && n%100!=11 ? 0 : n%10>=2 && (n%100<10 || n%100>=20) ? 1 : 2);},
	        16: function(n) {return Number(n%10==1 && n%100!=11 ? 0 : n !== 0 ? 1 : 2);},
	        17: function(n) {return Number(n==1 || n%10==1 ? 0 : 1);},
	        18: function(n) {return Number(0 ? 0 : n==1 ? 1 : 2);},
	        19: function(n) {return Number(n==1 ? 0 : n===0 || ( n%100>1 && n%100<11) ? 1 : (n%100>10 && n%100<20 ) ? 2 : 3);},
	        20: function(n) {return Number(n==1 ? 0 : (n===0 || (n%100 > 0 && n%100 < 20)) ? 1 : 2);},
	        21: function(n) {return Number(n%100==1 ? 1 : n%100==2 ? 2 : n%100==3 || n%100==4 ? 3 : 0); }
	    };
	    
	    var pluralExtensions = {
	    
	        rules: (function () {
	            var l, rules = {};
	            for (l=_rules.length; l-- ;) {
	                rules[_rules[l][0]] = {
	                    name: _rules[l][1],
	                    numbers: _rules[l][2],
	                    plurals: _rulesPluralsTypes[_rules[l][3]]
	                }
	            }
	            return rules;
	        }()),
	    
	        // you can add your own pluralExtensions
	        addRule: function(lng, obj) {
	            pluralExtensions.rules[lng] = obj;
	        },
	    
	        setCurrentLng: function(lng) {
	            if (!pluralExtensions.currentRule || pluralExtensions.currentRule.lng !== lng) {
	                var parts = lng.split('-');
	    
	                pluralExtensions.currentRule = {
	                    lng: lng,
	                    rule: pluralExtensions.rules[parts[0]]
	                };
	            }
	        },
	    
	        needsPlural: function(lng, count) {
	            var parts = lng.split('-');
	    
	            var ext;
	            if (pluralExtensions.currentRule && pluralExtensions.currentRule.lng === lng) {
	                ext = pluralExtensions.currentRule.rule; 
	            } else {
	                ext = pluralExtensions.rules[parts[f.getCountyIndexOfLng(lng)]];
	            }
	    
	            if (ext && ext.numbers.length <= 1) {
	                return false;
	            } else {
	                return this.get(lng, count) !== 1;
	            }
	        },
	    
	        get: function(lng, count) {
	            var parts = lng.split('-');
	    
	            function getResult(l, c) {
	                var ext;
	                if (pluralExtensions.currentRule && pluralExtensions.currentRule.lng === lng) {
	                    ext = pluralExtensions.currentRule.rule; 
	                } else {
	                    ext = pluralExtensions.rules[l];
	                }
	                if (ext) {
	                    var i;
	                    if (ext.noAbs) {
	                        i = ext.plurals(c);
	                    } else {
	                        i = ext.plurals(Math.abs(c));
	                    }
	                    
	                    var number = ext.numbers[i];
	                    if (ext.numbers.length === 2 && ext.numbers[0] === 1) {
	                        if (number === 2) { 
	                            number = -1; // regular plural
	                        } else if (number === 1) {
	                            number = 1; // singular
	                        }
	                    }//console.log(count + '-' + number);
	                    return number;
	                } else {
	                    return c === 1 ? '1' : '-1';
	                }
	            }
	                        
	            return getResult(parts[f.getCountyIndexOfLng(lng)], count);
	        }
	    
	    };
	    var postProcessors = {};
	    var addPostProcessor = function(name, fc) {
	        postProcessors[name] = fc;
	    };
	    // sprintf support
	    var sprintf = (function() {
	        function get_type(variable) {
	            return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
	        }
	        function str_repeat(input, multiplier) {
	            for (var output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */}
	            return output.join('');
	        }
	    
	        var str_format = function() {
	            if (!str_format.cache.hasOwnProperty(arguments[0])) {
	                str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
	            }
	            return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
	        };
	    
	        str_format.format = function(parse_tree, argv) {
	            var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
	            for (i = 0; i < tree_length; i++) {
	                node_type = get_type(parse_tree[i]);
	                if (node_type === 'string') {
	                    output.push(parse_tree[i]);
	                }
	                else if (node_type === 'array') {
	                    match = parse_tree[i]; // convenience purposes only
	                    if (match[2]) { // keyword argument
	                        arg = argv[cursor];
	                        for (k = 0; k < match[2].length; k++) {
	                            if (!arg.hasOwnProperty(match[2][k])) {
	                                throw(sprintf('[sprintf] property "%s" does not exist', match[2][k]));
	                            }
	                            arg = arg[match[2][k]];
	                        }
	                    }
	                    else if (match[1]) { // positional argument (explicit)
	                        arg = argv[match[1]];
	                    }
	                    else { // positional argument (implicit)
	                        arg = argv[cursor++];
	                    }
	    
	                    if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
	                        throw(sprintf('[sprintf] expecting number but found %s', get_type(arg)));
	                    }
	                    switch (match[8]) {
	                        case 'b': arg = arg.toString(2); break;
	                        case 'c': arg = String.fromCharCode(arg); break;
	                        case 'd': arg = parseInt(arg, 10); break;
	                        case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
	                        case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;
	                        case 'o': arg = arg.toString(8); break;
	                        case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
	                        case 'u': arg = Math.abs(arg); break;
	                        case 'x': arg = arg.toString(16); break;
	                        case 'X': arg = arg.toString(16).toUpperCase(); break;
	                    }
	                    arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);
	                    pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
	                    pad_length = match[6] - String(arg).length;
	                    pad = match[6] ? str_repeat(pad_character, pad_length) : '';
	                    output.push(match[5] ? arg + pad : pad + arg);
	                }
	            }
	            return output.join('');
	        };
	    
	        str_format.cache = {};
	    
	        str_format.parse = function(fmt) {
	            var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
	            while (_fmt) {
	                if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
	                    parse_tree.push(match[0]);
	                }
	                else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
	                    parse_tree.push('%');
	                }
	                else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
	                    if (match[2]) {
	                        arg_names |= 1;
	                        var field_list = [], replacement_field = match[2], field_match = [];
	                        if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
	                            field_list.push(field_match[1]);
	                            while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
	                                if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
	                                    field_list.push(field_match[1]);
	                                }
	                                else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
	                                    field_list.push(field_match[1]);
	                                }
	                                else {
	                                    throw('[sprintf] huh?');
	                                }
	                            }
	                        }
	                        else {
	                            throw('[sprintf] huh?');
	                        }
	                        match[2] = field_list;
	                    }
	                    else {
	                        arg_names |= 2;
	                    }
	                    if (arg_names === 3) {
	                        throw('[sprintf] mixing positional and named placeholders is not (yet) supported');
	                    }
	                    parse_tree.push(match);
	                }
	                else {
	                    throw('[sprintf] huh?');
	                }
	                _fmt = _fmt.substring(match[0].length);
	            }
	            return parse_tree;
	        };
	    
	        return str_format;
	    })();
	    
	    var vsprintf = function(fmt, argv) {
	        argv.unshift(fmt);
	        return sprintf.apply(null, argv);
	    };
	    
	    addPostProcessor("sprintf", function(val, key, opts) {
	        if (!opts.sprintf) return val;
	    
	        if (Object.prototype.toString.apply(opts.sprintf) === '[object Array]') {
	            return vsprintf(val, opts.sprintf);
	        } else if (typeof opts.sprintf === 'object') {
	            return sprintf(val, opts.sprintf);
	        }
	    
	        return val;
	    });
	    // public api interface
	    i18n.init = init;
	    i18n.setLng = setLng;
	    i18n.preload = preload;
	    i18n.addResourceBundle = addResourceBundle;
	    i18n.hasResourceBundle = hasResourceBundle;
	    i18n.addResource = addResource;
	    i18n.addResources = addResources;
	    i18n.removeResourceBundle = removeResourceBundle;
	    i18n.loadNamespace = loadNamespace;
	    i18n.loadNamespaces = loadNamespaces;
	    i18n.setDefaultNamespace = setDefaultNamespace;
	    i18n.t = translate;
	    i18n.translate = translate;
	    i18n.exists = exists;
	    i18n.detectLanguage = f.detectLanguage;
	    i18n.pluralExtensions = pluralExtensions;
	    i18n.sync = sync;
	    i18n.functions = f;
	    i18n.lng = lng;
	    i18n.addPostProcessor = addPostProcessor;
	    i18n.options = o;
	        
	    return i18n; 

	}));

/***/ }
/******/ ]);