(function () {
	"use strict";

	var var_StreamLimit = 100;
	var var_AJAXTimeout = 1000 * 30;
	var var_RefreshInterval = 1000 * 30;
	var var_FetchURL = "https://api.twitch.tv/helix/users/follows?from_id={0}&limit=" + var_StreamLimit + "&offset={1}";
	var offset = 0;
	var lastAjaxRequest;
	var intervalId;
	var streams;
	var channels;
	var popup;
	var oldStreams;
	var OptionTwitchID;
	var OptionvPopout;
	var OptioncPopout;
	var OptionvPanel;
	var OptioncPanel;
	var OptionPSH;
	var OptionPSW;
	var OptionPCH;
	var OptionPCW;
	var OptionPnSH;
	var OptionPnSW;
	var OptionPnCH;
	var OptionPnCW;
	var pendingNotifications = {};

	function updateBadge(text, color) {
		chrome.browserAction.setBadgeBackgroundColor({color: color});
		chrome.browserAction.setBadgeText({"text": text});
	}

	function onStorageUpdate(e) {
		if (e.key === "OptionTwitchID") {
			OptionTwitchID = e.newValue;
		}
	}

	function getStreams() {
		return streams;
	}

	function setPopup(p) {
		popup = p;
	}

	function openStream(theID, opmode) {
		// Open Mode: vtab, vpopout, vpanel, cpopout, cpanel or default
		opmode = (typeof opmode === 'undefined') ? 'default' : opmode;

		// Open video in popout
		if ((localStorage.OptionvPopout === "true" && opmode == "default") || opmode == "vpopout") {
			if (localStorage.OptionoldPopout === "true") {
				if (localStorage.OptionHTML5Popout === "true") {
					var url = "http://www.twitch.tv/" + theID + "/popout?html5";
				} else {
					var url = "http://www.twitch.tv/" + theID + "/popout";
				}
			} else {
				if (localStorage.OptionHTML5Popout === "true") {
					var url = "http://player.twitch.tv/?channel=" + theID + "&html5";
				} else {
					var url = "http://player.twitch.tv/?channel=" + theID;
				}
			}
			chrome.windows.create({
				url: url,
				width: parseInt(localStorage["OptionPSW"]),
				height: parseInt(localStorage["OptionPSH"]),
				type: "popup",
				focused: true
			});
		}
		// Open video in panel
		if ((localStorage.OptionvPanel === "true" && opmode == "default") || opmode == "vpanel") {
			if (localStorage.OptionoldPopout === "true") {
				if (localStorage.OptionHTML5Popout === "true") {
					var url = "http://www.twitch.tv/" + theID + "/popout?html5";
				} else {
					var url = "http://www.twitch.tv/" + theID + "/popout";
				}
			} else {
				if (localStorage.OptionHTML5Popout === "true") {
					var url = "http://player.twitch.tv/?channel=" + theID + "&html5";
				} else {
					var url = "http://player.twitch.tv/?channel=" + theID;
				}
			}
			chrome.windows.create({
				url: url,
				width: parseInt(localStorage["OptionPnSW"]),
				height: parseInt(localStorage["OptionPnSH"]),
				type: "panel",
				focused: true
			});
		}
		// Open video in tab
		if ((localStorage.OptionvPopout != "true" && localStorage.OptionvPanel != "true" && opmode == "default") || opmode == "vtab") {
			if (localStorage.OptionHTML5Popout === "true") {
				var url = "http://www.twitch.tv/" + theID + "?html5";
			} else {
				var url = "http://www.twitch.tv/" + theID;
			}
			chrome.tabs.create({url: url});
		}

		// Open chat in popout
		if ((localStorage.OptioncPopout === "true" && opmode == "default") || opmode == "cpopout") {
			var url = "https://www.twitch.tv/popout/" + theID + "/chat";
			chrome.windows.create({
				url: url,
				width: parseInt(localStorage["OptionPCW"]),
				height: parseInt(localStorage["OptionPCH"]),
				type: "popup",
				focused: true
			});
		}
		// Open chat in panel
		if ((localStorage.OptioncPanel === "true" && opmode == "default") || opmode == "cpanel") {
			var url = "https://www.twitch.tv/popout/" + theID + "/chat";
			chrome.windows.create({
				url: url,
				width: parseInt(localStorage["OptionPnCW"]),
				height: parseInt(localStorage["OptionPnCH"]),
				type: "panel",
				focused: true
			});
		}
	}

	function getNewStreams() {
		if (!oldStreams) {
			return false;
		}

		var hash = {};
		var newStreams = [];

		for (var i = 0; i < oldStreams.length; i++) {
			hash[oldStreams[i].to_name] = true;
		}

		for (var i = 0; i < streams.length; i++) {
			if (!hash.hasOwnProperty(streams[i].to_name)) {
				newStreams.push(streams[i]);
			}
		}

		return newStreams;
	}

	function UniqueObjectInArray(array, predicate) {
		const result = [];
		const map = new Map();
		for (const item of array) {
			var id = predicate(item);
			if (!map.has(id)) {
				map.set(id, true);    // set any value to Map
				result.push(item);
			}
		}
		return result;
	}

	function loadStreamSuccess(TwitchJSON) {
		lastAjaxRequest = null;
		oldStreams = streams;
		streams = UniqueObjectInArray(TwitchJSON.data, item => item.user_id);

		var newStreams = getNewStreams();
		var dateStr = new Date().toUTCString();

		if (newStreams.length) {
			if ((localStorage.showNotifications === "true")) {
				for (var i = 0; i < newStreams.length; i++) {

					var xhr = [];
					for (var i = 0; i < newStreams.length; i++) {
						var options = {
							type: "basic",
							title: newStreams[i].channel.display_name,
							message: "is playing " + newStreams[i].game,
							contextMessage: newStreams[i].channel.url
						};
						var listeners = {
								onButtonClicked: function(btnIdx) {
										if (btnIdx === 0) {
										} else if (btnIdx === 1) {
										}
								},
								onClicked: function(notifId) {
										openStream(notifId);
								},
								onClosed: function(byUser) {
								}
						};

						(function (i, url, options, listeners, cname){
							xhr[i] = new XMLHttpRequest();
							xhr[i].open("GET", url, true);
							xhr[i].responseType = "blob";
							xhr[i].onreadystatechange = function() {
								if (xhr[i].readyState == 4 && xhr[i].status == 200) {
									options.iconUrl = window.URL.createObjectURL(xhr[i].response);
									createNotification(options, listeners, cname);
								}
							}
							xhr[i].send(null);
						})(i, newStreams[i].channel.logo, options, listeners, newStreams[i].channel.name);
					}

				}
			}
		}

		var len = streams.length;
		var badgeColor = [100, 65, 165, 255];
		var badgeText = String(len);

		updateBadge(badgeText, badgeColor);

		if (popup) {
			popup.updatePopup();
		}

		channels = null;
	}

	function createNotification(details, listeners, notifId) {
			(notifId !== undefined) || (notifId = "");
			chrome.notifications.create(notifId, details, function(id) {
					if (pendingNotifications[id] !== undefined) {
					}

					pendingNotifications[id] = {
							listeners: listeners
					};
			});
	}
	function destroyNotification(notifId, callback) {
			if (pendingNotifications[notifId] !== undefined) {
					delete(pendingNotifications[notifId]);
			}
			chrome.notifications.clear(notifId, function(wasCleared) {
					callback && callback(wasCleared);
			});
	}
	chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
			if (pendingNotifications[notifId] !== undefined) {
					var handler = pendingNotifications[notifId].listeners.onButtonClicked;
					destroyNotification(notifId, handler(btnIdx));
			}
	});
	chrome.notifications.onClicked.addListener(function(notifId) {
			if (pendingNotifications[notifId] !== undefined) {
					var handler = pendingNotifications[notifId].listeners.onClicked;
					destroyNotification(notifId, handler(notifId));
			}
	});
	chrome.notifications.onClosed.addListener(function(notifId, byUser) {
			if (pendingNotifications[notifId] !== undefined) {
					var handler = pendingNotifications[notifId].listeners.onClosed;
					destroyNotification(notifId, handler(byUser));
			}
	});

	function loadStreamFailed(XMLHttpRequest, textStatus, errorThrown) {
		lastAjaxRequest = null;
		console.error("loadStreamFailed: " + XMLHttpRequest.responseText + " | " + new Date().toString());
		console.error("XMLHttpRequest:", XMLHttpRequest);
		console.error("textStatus:", textStatus);
		console.error("errorThrown:", errorThrown);
	}

	function onloadIDFailed(XMLHttpRequest, textStatus, errorThrown) {
		lastAjaxRequest = null;
		console.error("onloadIDFailed: " + XMLHttpRequest.responseText + " | " + new Date().toString());
		console.error("XMLHttpRequest:", XMLHttpRequest);
		console.error("textStatus:", textStatus);
		console.error("errorThrown:", errorThrown);
	}

	function loadStream() {
		var loginNameParams = [];

		for (var i = 0; i < channels.length; i++) {
			var channel = channels[i];
			loginNameParams.push(channel.to_id);
		}
		
		var streamUrl = "https://api.twitch.tv/helix/streams?user_id=" + encodeURI(loginNameParams.join("&user_id="));

		lastAjaxRequest = $.ajax({
			type: "GET",
			timeout: var_AJAXTimeout,
			cache: false,
			dataType: "json",
			url: streamUrl,
			headers: {
				'Client-ID': 'cxrpeni38u3xeguyfx639noobhpklo8'
			}
		});

		lastAjaxRequest.done(loadStreamSuccess);
		lastAjaxRequest.fail(loadStreamFailed);
	}

	function loadID () {
		var idUrl = "https://api.twitch.tv/helix/users?login=" + encodeURI(OptionTwitchID);

		$.ajax({
			type: "GET",
			timeout: var_AJAXTimeout,
			dataType: "json",
			url: idUrl,
			headers: {
				'Client-ID': 'cxrpeni38u3xeguyfx639noobhpklo8'
			},
			cache: false
		}).done(function(idJSON) {
			
			var fetchUrl = var_FetchURL.replace("{0}", idJSON.data[0].id).replace("{1}", offset);

			lastAjaxRequest = $.ajax({
				type: "GET",
				timeout: var_AJAXTimeout,
				dataType: "json",
				url: fetchUrl,
				headers: {
					'Client-ID': 'cxrpeni38u3xeguyfx639noobhpklo8'
				},
				cache: false
			});
	
			lastAjaxRequest.done(onloadID);
			lastAjaxRequest.fail(onloadIDFailed);
		});
	};

	function onloadID(TwitchJSON) {
		lastAjaxRequest = null;

		offset += var_StreamLimit - 1;

		var tmp = TwitchJSON.data;

		channels = channels.concat(tmp);

		if (tmp.length > 0 && channels.length < TwitchJSON.total) {
			loadID();
		} else {
			loadStream();
		}
	}

	function localizeHtmlPage (objects) {
		// Localize by replacing __MSG_***__ meta tags
		for (var j = 0; j < objects.length; j++)
		{
			var obj = objects[j];

			var valStrH = obj.innerHTML.toString();
			var valNewH = valStrH.replace(/__MSG_(\w+)__/g, function(match, v1)
			{
				return v1 ? chrome.i18n.getMessage(v1) : "";
			});

			if(valNewH != valStrH)
			{
				obj.innerHTML = valNewH;
			}
		}
	}

	function updateData () {
		if (!OptionTwitchID) {
			updateBadge("", [0, 0, 0, 0]);
			return;
		}

		if (intervalId) {
			window.clearTimeout(intervalId);
		}

		if (lastAjaxRequest) {
			lastAjaxRequest.abort();
			lastAjaxRequest = null;
		}

		intervalId = window.setTimeout(onInterval, var_RefreshInterval);

		offset = 0;

		channels = [];
		loadID();
	};

	function Test (arg, arg2) {
		console.log("--- Test Start ---");
		console.log("--- Test End ---");
	}

	function onInterval() {
		updateData();
	}

	function init() {
		updateBadge("", [0, 0, 0, 0]);

		OptionTwitchID = localStorage["OptionTwitchID"];
		window.addEventListener("storage", onStorageUpdate);

		updateData();
	}

	window.setPopup = setPopup;
	window.getStreams = getStreams;
	window.updateData = updateData;
	window.Test = Test;
	window.openStream = openStream;
	window.localizeHtmlPage = localizeHtmlPage;

	init();
}());