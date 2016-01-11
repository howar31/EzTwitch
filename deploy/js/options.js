(function () {
	"use strict";

	var background;
	var txt_TwitchIDInput;
	var chk_Notification_val;
	var chk_vPopout_val;
	var chk_cPopout_val;
	var chk_oldPopout_val;
	var num_PSH_val;
	var num_PSW_val;
	var num_PCH_val;
	var num_PCW_val;

	function save() {
		localStorage.OptionTwitchID = txt_TwitchIDInput.value;	
		localStorage.showNotifications = chk_Notification_val.checked;		
		localStorage.OptionvPopout = chk_vPopout_val.checked;
		localStorage.OptioncPopout = chk_cPopout_val.checked;
		localStorage.OptionoldPopout = chk_oldPopout_val.checked;
		localStorage.OptionPSH = num_PSH_val.value;
		localStorage.OptionPSW = num_PSW_val.value;
		localStorage.OptionPCH = num_PCH_val.value;
		localStorage.OptionPCW = num_PCW_val.value;

//		var msg_saved = document.getElementById("msg_saved");
//		msg_saved.style.opacity = 1;
		var msgs_saved = document.getElementsByClassName("msg_saved");
		for (var i=0; i < msgs_saved.length; i++) {
			msgs_saved[i].style.opacity = 1;
		}

		setTimeout(function () {
//			msg_saved.style.opacity = 0;
			for (var i=0; i < msgs_saved.length; i++) {
				msgs_saved[i].style.opacity = 0;
			}
			chrome.extension.getBackgroundPage().updateData();
		}, 1500);
	}

	function checkEnter(e) {
		if (!e) e = window.event;
		var keyCode = e.keyCode || e.which;
		if (keyCode == '13'){
			save();
			return false;
		}
	}
	
	function init() {
		background = chrome.extension.getBackgroundPage();
		background.localizeHtmlPage(document.getElementsByTagName('html'));

		var OptionTwitchID = localStorage.OptionTwitchID;
		txt_TwitchIDInput = document.getElementById("txt_TwitchID");
		if (OptionTwitchID) {
			txt_TwitchIDInput.value = OptionTwitchID;
		}
		
		chk_Notification_val = document.getElementById("chk_Notification");
		var showNotifications = (localStorage.showNotifications === "true");
		if (showNotifications) {
			chk_Notification_val.checked = true;
		}

		chk_vPopout_val = document.getElementById("chk_vPopout");
		var OptionvPopout = (localStorage.OptionvPopout === "true");
		if (OptionvPopout) {
			chk_vPopout_val.checked = true;
		}
		chk_cPopout_val = document.getElementById("chk_cPopout");
		var OptioncPopout = (localStorage.OptioncPopout === "true");
		if (OptioncPopout) {
			chk_cPopout_val.checked = true;
		}
		chk_oldPopout_val = document.getElementById("chk_oldPopout");
		var OptionoldPopout = (localStorage.OptionoldPopout === "true");
		if (OptionoldPopout) {
			chk_oldPopout_val.checked = true;
		}

		num_PSW_val = document.getElementById("num_PSW");
		var OptionPSW = localStorage.OptionPSW;
		num_PSW_val.value = (OptionPSW) ? OptionPSW : 1028;
		num_PSH_val = document.getElementById("num_PSH");
		var OptionPSH = localStorage.OptionPSH;
		num_PSH_val.value = (OptionPSH) ? OptionPSH : 600;
		document.getElementById("PSDefault").onclick = function() {
			num_PSW_val.value = 1028;
			num_PSH_val.value = 600;
		}

		num_PCW_val = document.getElementById("num_PCW");
		var OptionPCW = localStorage.OptionPCW;
		num_PCW_val.value = (OptionPCW) ? OptionPCW : 400;
		num_PCH_val = document.getElementById("num_PCH");
		var OptionPCH = localStorage.OptionPCH;
		num_PCH_val.value = (OptionPCH) ? OptionPCH : 600;
		document.getElementById("PCDefault").onclick = function() {
			num_PCW_val.value = 400;
			num_PCH_val.value = 600;
		}

		var btns_save = document.getElementsByClassName("btn_save");
		for (var i=0; i < btns_save.length; i++) {
			btns_save[i].onclick = save;
		}
//		document.getElementById("btn_save").onclick = save;
		document.getElementById("txt_TwitchID").onkeypress = checkEnter;

		$(".option_title").click(function(){
			$(this).next(".option_content").slideToggle();
		});
	}

	init();
}());