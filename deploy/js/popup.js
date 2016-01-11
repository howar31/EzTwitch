(function () {
	"use strict";
	
	var background;
	var OptionTwitchID;
	
	function onOptionsClick(e) {
		chrome.tabs.create({"url": "options.html"});
	}
	
	function onRefreshClick(e) {
		$("#btn_refresh").text(chrome.i18n.getMessage("refreshing"));
		background.updateData();
	}
		
	function sortGames(streams) {
		var tmpHash = {};

		for (var i = 0; i < streams.length; i++) {
			var channel = streams[i].channel;
			var game = streams[i].game;
			
			if (!game) {
				game = streams[i].category;
			}
			
			if (!tmpHash[game]) {
				tmpHash[game] = [];
			}
			
			tmpHash[game].push(streams[i]);
		}
		var key;
		var sortable = [];
		for (key in tmpHash) {
			if (tmpHash.hasOwnProperty(key)) {
				sortable.push([key, tmpHash[key]]);
			}
		}
		
		sortable.sort(
			function (x, y) {
				var a = x[0].toUpperCase();
				var b = y[0].toUpperCase();
				
				if (a > b) { return 1; }				
				if (a < b) { return -1; }				
				return 0;
			}
		);
		
		return sortable;
	}
	
	function onChannelClick(e) {
		e.preventDefault();
		background.openStream($(this).attr("data-name"));
	}
	
	function onGameTitleClick(e) {
		e.preventDefault();
		
		var url = "http://www.twitch.tv/directory/game/" + $(this).attr("data-name");
		chrome.tabs.create({"url": url});
	}
	
	function updatePopup() {
		var streams = background.getStreams();
		var len = (streams) ? streams.length : 0;
		
		$(".stream_entry").unbind("click");
		$("#stream_list").empty();
		
		if (!len) {
			$("#msg_nostream").show();
			return;
		} else {
			$("#msg_nostream").hide();
		}
	
		var sortedStreams = sortGames(streams);
		var listHTML = "";
		var category;
		var categoryName;

		for (var j = 0; j < sortedStreams.length; j++) {
			category = sortedStreams[j];
			categoryName = category[0];
			
			listHTML += "<div class='stream_game'><div class='stream_game_title' title='" + chrome.i18n.getMessage("stream_game_title") + "' data-name='" + encodeURIComponent(categoryName) + "'>" + categoryName + "</div>";
			
			var gameStreams = category[1];

			for (var i = 0; i < gameStreams.length; i++) {
				listHTML += "<div class='stream_entry' data-url='" + escape(gameStreams[i].channel.url) + "' data-name='" + gameStreams[i].channel.name + "'><div class='stream_entry_name' title='" + gameStreams[i].channel.name + "'>" + gameStreams[i].channel.display_name + "</div><div class='stream_entry_status' title='" + gameStreams[i].channel.status + "'>" + gameStreams[i].channel.status + "</div><div class='stream_entry_viewers' title='" + chrome.i18n.getMessage("stream_entry_viewers") + "'>" + gameStreams[i].viewers + "</div></a></div>";
			}
			
			listHTML += "</div>";
		}

		$("#stream_list").append(listHTML);		
		$(".stream_entry").bind("click", onChannelClick);		
		$(".stream_game_title").bind("click", onGameTitleClick);		
		$("#btn_refresh").text(chrome.i18n.getMessage("btn_refresh"));
	}
	
	$(document).ready(function () {
		background = chrome.extension.getBackgroundPage();
		OptionTwitchID = localStorage.OptionTwitchID;

		background.localizeHtmlPage(document.getElementsByTagName('html'));
		background.setPopup(window);
	
		$("#stream_list").empty();
		$("#msg_nostream").hide();
		$("#msg_intro").hide();
		$("#msg_refresh").hide();
		$(".btn_options").bind("click", onOptionsClick);
		$("#btn_refresh").bind("click", onRefreshClick);

		if (!OptionTwitchID) {
			$("#msg_intro").show();
			return;
		}
		
		updatePopup();

		setTimeout(function () {
			$("#btn_refresh").blur();
		}, 200);
	});

	window.updatePopup = updatePopup;
}());