/*
 * conversifier
 * choice-based conversations for versifier
 */


function update_display() {
	// redefines the function in versifier.js, so make sure this one does everything that one does!

	describe_room();
	show_holding();
	show_inventory();
	show_holding();
	show_score();
	animate_heights();

	draw_conversation(Game.talking_to);

}


Game.talking_to = '';

Game.always.push(function() {

	if(Game.talking_to && (/* current_verb != 'talk' || */ !in_scope(Game.talking_to) )) {
		Game.talking_to = '';
	}

	if(!Game.talking_to) {
		hide_conversation();
	}

	do_conversation();
});
/*
Game.before.push(
	function(verb, noun) {
		if(verb=='depart' || verb=='enter' || verb=='climb') { //anything that can change your location
			hide_conversation();
		}
	}
);*/

function do_conversation() {
	if(!Game.talking_to) {
		hide_conversation();
	} else {
		draw_conversation(Game.talking_to);
	}
}

function draw_conversation(npc) {

	if(!npc) {
		hide_conversation();
		return;
	}

	var html = "";
	if(Game.things[npc].image) {
		html = '<img src="' + Game.things[npc].image + '" height="183" width="174" class="npc" />';
	}

	html += "Talking to: " + Game.things[npc].description + "\n";

	var conversifier = get_conversifier(npc);
	if(conversifier.says && Object.keys(conversifier.says).length) {
		html += "<br/>Say:";
		for(var subject in conversifier.says) {
			if(conversifier.says[subject]) {
				html += " " + draw_button( subject.split('_').join(' '), "talk('" + npc + "', 'say', '" + replaceAll(subject, "'", "\\'") + "')" );
			}
		}
	}

	if(conversifier.asks && Object.keys(conversifier.asks).length) {
		html += "<br/>\nAsk about:";
		for(var subject in conversifier.asks) {
			if(conversifier.asks[subject]) {
				html += " " + draw_button( subject.split('_').join(' '), "talk('" + npc + "', 'ask', '" + replaceAll(subject, "'", "\\'") + "')" );
			}
		}
	}

	if(conversifier.tells && Object.keys(conversifier.tells).length) {
		html += "<br/>\nTell about:";
		for(var subject in conversifier.tells) {
			if(conversifier.tells[subject]) {
				html += " " + draw_button( subject.split('_').join(' '), "talk('" + npc + "', 'tell', '" + replaceAll(subject, "'", "\\'") + "')" );
			}
		}
	}

	html += '<br/>\n';
	html += draw_button("end conversation", "end_conversation('" + npc + "')");
	$('#conversation').html(html);
	show_conversation();
}

function show_conversation() {
	$('#conversation').slideDown(300);
}

function hide_conversation() {
	$('#conversation').slideUp(300);
	Game.talking_to = ''; // end without showing the npc's end_conversation message
}

function get_conversifier(npc) {
	//console.log('getting conversifier for ' + npc);
	 if(typeof Game.things[npc].conversifier === 'function') {
		 // allows data to be stored outside the Game object where it won't bloat savefile size
		 return Game.things[npc].conversifier();
	 } else {
		 return Game.things[npc].conversifier;
	 }
}

function start_conversation(npc) {
	Game.talking_to = npc;
	do_conversation();
	var conversifier = get_conversifier(npc);

	if(conversifier==null) {
		do_verb('talk', 'npc', true);
	};

	if(conversifier.start_conversation) {
		if(typeof conversifier.start_conversation === 'function') {
			conversifier.start_conversation();
		} else {
			say(conversifier.start_conversation);
		}
	}

	if(is_landscape()) {
		$('#right_column').stop().animate({scrollTop: 0});
	};
}

function talk(npc, sayAskTell, subject) {
	dim_old_messages();

	var promptText = sayAskTell + ' ' + (sayAskTell=='say' ? '' : (name(npc) + ' about ')) + subject.split('_').join(' ').toLowerCase();

	say('\n<span class="prompt">&gt; ' + promptText + '</span>');

	var response = get_conversifier(npc)[sayAskTell + 's'][subject];
	if(typeof response === 'function') {
		response();
	} else {
		say(response);
	}

	do_alwayses();
	update_display();
}

function end_conversation() {
	if(!Game.talking_to) {
		hide_conversation();
		update_display();
		return;
	}
	var conversifier = get_conversifier(Game.talking_to);
	if(conversifier.end_conversation) {
		dim_old_messages();
		say('\n<span class="prompt">&gt; end conversation</span>');
		if(typeof conversifier.end_conversation === 'function') {
			conversifier.end_conversation();
		} else {
			say(conversifier.end_conversation);
		}
	}
	Game.talking_to = '';
	hide_conversation();
	update_display();
}
