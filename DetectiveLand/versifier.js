/*
 *
 * A keyboardless text adventure engine
 * Version 1.1, 2016
 * Copy and distribute freely, preserving this licence.
 *
 */

function update_display() {

	// if using conversifier.js, this is not the update_display() that gets used!

	describe_room();
	show_holding();
	show_inventory();
	show_holding();
	show_score();
	animate_heights();
}

function show_score() {
	document.getElementById('score').innerHTML =
//	 (is_landscape() ? ("Moves: " + Game.turn_number + " Score: " ) : "") +
	 (Game.score_percentage ? (Math.round((Game.score / Game.max_score) * 100) + '%') : (Game.score + '/' + Game.max_score));
}

function get_point_for(gamevar) {
	// give the player a point, then set a variable to true so that they can only get this point once
	if(!Game.vars[gamevar]) {
		Game.vars[gamevar] = true;
		Game.score++;
		return true;
	} else {
		return false;
	}
}

function describe_room() {

	var html = '';

	var lit = is_lit(Game.hero_location);

	if(lit) {
		html += Game.rooms[Game.hero_location].description;
	} else {
		html += "It's dark.";
	}
	html += '<br/>';

	var exitOrder = ['north', 'northeast', 'east', 'southeast',
	                 'south', 'southwest', 'west', 'northwest',
	                 'up', 'down', 'in', 'out'];

	var exits = [];
	exitOrder.forEach(function(dir) {
		if(Game.rooms[Game.hero_location].directions[dir]) {
			//exits.push('<a onclick="go(\'' + dir + '\')" href="javascript:void(0);">' + dir + '</a>');
			exits.push(draw_button(dir, "go('" + dir + "')"));
		}
		/* else push an unavailable exit marker of same width? */
	});

/*	for(var key in Game.rooms[Game.hero_location].directions) {
		exits.push('<a onclick="go(\'' + key + '\')" href="javascript:void(0);">' + key + '</a>');
	} */
	if(exits.length) {

		html += 'Exits: ' + exits.join(' ') + '<br/>';
	}

	if(Game.rooms[Game.hero_location].active_verbs && Game.rooms[Game.hero_location].active_verbs.length) {

		if(Game.rooms[Game.hero_location].actions_name) {
			html += Game.rooms[Game.hero_location].actions_name + ': ';
		} else {
			html += "Actions: "
		}
		html += list_verbs(Game.hero_location, true) + '<br/>';
	}

	/* 	document.getElementById('also_see').innerHTML = html;


	show_can_also_see();
}

function show_can_also_see() {
	var html = '<br/>';
	var lit = is_lit(Game.hero_location); */

	var things_here = [];

	// rooms that are e.g. buildings can be listed in with the things if they have the 'enter_from' property
	/* actually this opens a can of worms by allowing a room (not a thing) to be the object of the verb)
	for(var room in Game.rooms) {
		if(Game.rooms[room].enter_from == Game.hero_location) {
			things_here.push(room + ' [<a onClick="do_verb(\'enter\', \'' + room + '\')" href="javascript:void(0)">enter</a>]');
		}
	}
	 */

	// alive things come first...
	for(var key in Game.things) {
		if(Game.things[key].location == Game.hero_location && Game.things[key].is_alive && !Game.things[key].list_last) {
			var this_thing = Game.things[key].description + ' ' + list_verbs(key);
			things_here.push(this_thing);
		}
	}

	// ... then non-portable non-alive things
	for(var key in Game.things) {
		if(Game.things[key].location == Game.hero_location && !Game.things[key].is_alive &&
		   !Game.things[key].portable && !Game.things[key].list_last) {
			var this_thing = Game.things[key].description + ' ' + list_verbs(key);
			things_here.push(this_thing);
		}
	}
	// then portable non-alive things
	for(var key in Game.things) {
		if(Game.things[key].location == Game.hero_location && Game.things[key].portable
		   && !Game.things[key].is_alive && !Game.things[key].list_last) {
			var this_thing = Game.things[key].description + ' ' + list_verbs(key);
			things_here.push(this_thing);
		}
	}
	// then anything with list_last
	for(var key in Game.things) {
		if(Game.things[key].location == Game.hero_location && Game.things[key].list_last) {
			var this_thing = Game.things[key].description + ' ' + list_verbs(key);
			things_here.push(this_thing);
		}
	}

	if(lit && things_here.length) {
		html += 'I can also see:\n<ul>';
		things_here.forEach(function(description) {
			html += '\n<li>' + description + '</li>';
		})
		html += '</ul>\n';
	}

	html += '<div class="wait"><button type="button" onClick="do_verb(\'wait\', \'\')">wait</button></div>';

	document.getElementById('room_description').innerHTML = html;

}

function describe_room_in_scroller() {
	if(Game.suppress_room_message) {
		Game.suppress_room_message = false;
		return;
	}

	if(is_lit(Game.hero_location)) {

		if(!Game.rooms[Game.hero_location].description) {
			console.log("room '" + Game.hero_location + "' has no description");
		}

		say(Game.rooms[Game.hero_location].description);

		if(listobj_in_scroller() && !Game.suppress_room_message) {
			var things_here = [];

			// same order as in scroller!
			// alive things first
			for(var thing in Game.things) {
				if(Game.things[thing].is_alive && Game.things[thing].location == Game.hero_location && !Game.things[thing].list_last) {
					things_here.push(Game.things[thing].description);
				}
			}
			// then non-portable non-alive things
			for(var thing in Game.things) {
				if(!Game.things[thing].is_alive && !Game.things[thing].portable &&
				   Game.things[thing].location == Game.hero_location && !Game.things[thing].list_last) {
					things_here.push(Game.things[thing].description);
				}
			}
			// then portable non-alive things
			for(var thing in Game.things) {
				if(!Game.things[thing].is_alive && Game.things[thing].portable &&
				   Game.things[thing].location == Game.hero_location && !Game.things[thing].list_last) {
					things_here.push(Game.things[thing].description);
				}
			}
			// then anything with list_last
			for(var thing in Game.things) {
				if(Game.things[thing].list_last && Game.things[thing].location == Game.hero_location) {
					things_here.push(Game.things[thing].description);
				}
			}

			if(things_here.length) {
				say("I can also see:<br/> <ul class=\"room_contents_in_scroller\"><li>" + things_here.join('</li><li>') + '</li></ul>');
			}
		}

	} else {
		say("It's dark.");
	}
};

function draw_button(display_text, script) {
	return '<button type="button" onClick="' + script + '">' + display_text + '</button>';
}

function show_holding() {
	var html = '';
	if(Game.held) {
		//var itemHtml = Game.things[Game.held].description + ' ' + list_verbs(Game.held);
		html = "I'm holding:\n<ul><li>" + Game.things[Game.held].description + ' ' + list_verbs(Game.held) + '</li></ul>';
	}

	// also show worn things in here
	var worn = [];
	for(var thing in Game.things) {
		if(Game.things[thing].worn) {
			worn.push(Game.things[thing].description + ' ' + list_verbs(thing));
		}
	}
	if(worn.length) {
		html += "\nI'm wearing:\n<ul><li>" + worn.join('</li>\n<li>') + "</li></ul>";
	}

	document.getElementById('holding').innerHTML = html;
}

function show_inventory() {
	var html = "I'm " + (Game.held ? "also " : "") + "carrying:\n"; //<ul><li>";
	var carried = [];
	Game.inventory.forEach(function(thing) {
		if(!held(thing) && !Game.things[thing].worn) {
			// var itemHtml = Game.things[thing].description + ' ' + list_verbs(thing);
			var itemHtml = draw_button(Game.things[thing].description, "hold('" + thing + "')");
			carried.push(itemHtml);
		}
	});
	if(carried.length) {
		html += carried.join(' '); //('</li>\n<li>');
	} else {
		html = ''; // html += 'nothing';
	}
	//html += '</li></ul>';

	document.getElementById('inventory').innerHTML = html;
}


function hold(thing) {

	if(Game.held) {
		unhold(true);
	}

	removeFrom(Game.inventory, thing);
	Game.held = thing;
	do_onholds();
	update_display();
}

function unhold(dont_update) {
	if(!Game.held) {
		return;
	}

	Game.inventory.unshift(Game.held);
	Game.held = '';
	do_onholds();
	if(!dont_update) {
		update_display();
	}
}


function say(txt) {
	if(GAME_OVER) { return; }

	$('#scroller').append('<p><span class="new_message">' + replaceAll(txt, '\n', '<br/>') + '</span></p>');
	//document.getElementById('scroller').innerHTML += '<br/><span class="new_message">' + replaceAll(txt, '\n', '<br/>') + '</span>';

	//document.getElementById('scroller').scrollTop = document.getElementById('scroller').scrollHeight;

	//typing sound
	if(typing_sound()) {
		document.getElementById('typing_audio').play();
		stopTyping = setTimeout(function() { document.getElementById('typing_audio').pause(); }, 2000);
	}


	// animated scroll
	$('#scroller').stop().animate({scrollTop: $('#scroller').prop("scrollHeight")}, 500);

}
function say_if_lit(txt, darktxt) {
	if(is_lit(Game.hero_location)) {
		say(txt);
	} else if(darktxt) {
		say(darktxt);
	}
}

function dim_old_messages() {
	$('#scroller span.prompt').addClass('old_prompt');
	$('#scroller span.new_message').removeClass('new_message').addClass('old_message');
}

function die(message, deathMessage) {
	say(message);
	if(!deathMessage) { deathMessage = "I am dead"; }
	say("*** " + deathMessage + " ***");
	//say('(<a onclick="restart_game()" href="javascript:void(0)">restart game</a>)');
	say("(" + draw_button("restart game", "confirm_restart()") + ")");

	for(var fuse in Game.fuses) {
		stop_fuse(fuse);
	}

	update_display();
	GAME_OVER = true;
}

function replaceAll(txt, find, replace) {
	return txt.split(find).join(replace);
}


function add_rule(when, verb, object, func) {
	Rules.push({ when: when, verb: verb, object: object, func: func });
}
function before(verb, object, func) {
	add_rule('before', verb, object, func);
}
function before(verb, object, func) {
	add_rule('after', verb, object, func);
}
function find_rule(when, verb, object) {
	for(var i=0; i<Rules.length; ++i) {
		var rule = Rules[i];
		if(rule.when==when && rule.verb==verb && rule.object==object) {
			return rule;
		}
	}
	return null;
}


current_verb = '';

function go(direction) {

	Game.just_moved = false;

	if(GAME_OVER) {
		return;
	}

	push_undo_state(direction);
	current_verb = 'go';

	var oldloc = Game.hero_location;

	dim_old_messages();
	say('\n<span class="prompt">&gt; ' + direction + '</span>');

	var instead = false;

	if(Game.before) {
		Game.before.forEach(function(before) {
			var thisInstead = before('depart');
			if(thisInstead) instead = true;
		});
	}

	if(!instead) {
		if(Game.rooms[Game.hero_location].before) {
			if(Game.rooms[Game.hero_location].before.depart) {
				instead = Game.rooms[Game.hero_location].before.depart(direction);
			}
		}
	}

	if(!instead && !GAME_OVER) {
		if(Game.suppress_ok) {
			delete Game.suppress_ok;
		} else {
			say('Ok');
		}

		Game.hero_location = Game.rooms[Game.hero_location].directions[direction];
	}

	var newroom = Game.hero_location;
	if(newroom != oldloc && roomdesc_in_scroller()) {
		describe_room_in_scroller();
	}

	if(newroom != oldloc) {
		Game.just_moved = true;
	}

	if(!instead) {
		if(Game.rooms[oldloc].after && Game.rooms[oldloc].after.depart) {
			Game.rooms[oldloc].after.depart(direction);
		}

		if(Game.rooms[Game.hero_location].after && Game.rooms[Game.hero_location].after.arrive) {
			Game.rooms[Game.hero_location].after.arrive();
		}
	}
	if(!GAME_OVER) {
		do_fuses();
		do_alwayses();
	}

	if(Game.hero_location != newroom && roomdesc_in_scroller()) {
		describe_room_in_scroller();
	}

	//describe_room();
	update_display();


}

function roomdesc_in_scroller() {
	return $('#roomdesc_always').prop('checked') || ($('#roomdesc_landscape').prop('checked') && is_landscape());
}
function listobj_in_scroller() {
	return $('#listobj_always').prop('checked') || ($('#listobj_landscape').prop('checked') && is_landscape());
}

function typing_sound() {
	//try {
	//	return localStorage.getItem(Game.id + 'typing_sound')=='1';
	//} catch(e) {
		return $('#typing_sound').prop('checked');
	//}
}
function verbose() {
	return $('#verbose').prop('checked')
}
function music_on() {
	return $('#music').prop('checked');
}


function do_verb(verb, thing, not_a_turn) {

	Game.just_moved = false;

	if(GAME_OVER) {
		return;
	}

	if(!Verbs[verb]) {
		console.log("tried to do nonexistent verb '" + verb + "' (to " + thing + ")");
	}

	var phrasing;
	if(Verbs[verb] && Verbs[verb].phrasing) {
		phrasing = Verbs[verb].phrasing(thing);
	} else if(Verbs[verb] && Verbs[verb].intransitive) {
		phrasing = display_verb(verb);
	} else {

		phrasing = display_verb(verb);

		if(thing && Game.things[thing].preposition && Game.things[thing].preposition[verb]) {
			phrasing += ' ' + Game.things[thing].preposition[verb];
		}

		phrasing += ' ' + name(thing);
	}

	if(!not_a_turn) {
		// not_a_turn is used e.g. when one command redirects to another
		// (like "fire pistol" to "shoot werewolf" if the werewolf is resent)
		// so undo state isn't pushed and alwayses don't happen (e.g. time doesn't pass) for the "shoot werewolf"
		// - they'll happen for the "fire pistol", which is what the player 'typed'
		dim_old_messages();
		say('\n<span class="prompt">&gt; ' + phrasing + '</span>');
		push_undo_state(phrasing);
		current_verb = verb;
	}

	var oldroom = Game.hero_location;

	var instead = false;

	if(Game.before) {
		Game.before.forEach(function(func) {
			var thisInstead = func(verb, thing);
			if(thisInstead) instead = true;
		});
	}

	if(!instead) {
		if(Game.rooms[Game.hero_location].before[verb]) {
			instead = Game.rooms[Game.hero_location].before[verb](thing);
		}
	}

	if(!instead) {
		var rule = find_rule('before', verb, thing);
		if(rule) {
			instead = rule.func();
		} else if(thing && Game.things[thing].before) {
			if(Game.things[thing].before[verb]) {
				instead = Game.things[thing].before[verb]();
			}
		}
	}

	if(!instead) {
		if(Verbs[verb].func) {
			Verbs[verb].func(thing);
		} else {
			say("I don't know how to " + verb + " that."); // shouldn't happen!
		}
	}

	var newroom = Game.hero_location
	if(newroom != oldroom && roomdesc_in_scroller()) {
		describe_room_in_scroller();
	}

	if(newroom != oldroom) {
		Game.just_moved = true;
	}

	if(!instead) {
		if(Game.rooms[Game.hero_location].after) {
			for(var after_verb in Game.rooms[Game.hero_location].after) {
				if(after_verb == verb) {
					Game.rooms[Game.hero_location].after[after_verb](thing);
				}
			}
		}

		var rule = find_rule('after', verb, thing);
		if(rule) {
			rule.func();
		} else if(thing && Game.things[thing].after) {
			if(Game.things[thing].after[verb]) {
				Game.things[thing].after[verb]();
			}
		}
	}

	if(!not_a_turn) {
		do_fuses();
		do_alwayses();
	}

	// todo: check other alwayses

	if(Game.hero_location != newroom && roomdesc_in_scroller()) {

		describe_room_in_scroller();
	}

	update_display();

}

function do_alwayses() {

	if(Game.always) {
		for(var func in Game.always) {
			Game.always[func]();
		}
	}

	if(Game.rooms[Game.hero_location].always) {
		Game.rooms[Game.hero_location].always();
	};

	for(var thing in Game.things) {
		if(in_scope(thing) && Game.things[thing].always) {
			// console.log('doing always for ' + thing);
			Game.things[thing].always();
		}
	}

	for(var thing in Game.things) {
		if(Game.things[thing].active_when_carried) {
			Game.things[thing].active_when_carried.forEach(function(verb) {
				set_active(thing, verb, carried(thing));
			});
		}
	}

	do_onholds();
}

function do_onholds() {
	On_hold.forEach(function(onhold) {
		onhold();
	});
}

function do_fuses() {
	for(var fuse in Game.fuses) {
		if(Game.fuses[fuse].time > 0) {
			Game.fuses[fuse].time = Game.fuses[fuse].time - 1;
//			console.log(fuse + ' fires in ' + Game.fuses[fuse].time);
		}
		var time = Game.fuses[fuse].time;
		if (time == 0) {
			// fuses don't need to have an explode, or a burn
			if(Game.fuses[fuse].explode) {
				Game.fuses[fuse].explode();
				Game.fuses[fuse].time = -1;
			}
		} else if(time > 0 && Game.fuses[fuse].burn) {
			Game.fuses[fuse].burn();
		}

	}
}

function set_fuse(fuse, time) {
	//console.log("setting fuse '" + fuse + "' to " + time);
	if(!Game.fuses[fuse]) {
		Game.fuses[fuse] = {};
	}
	Game.fuses[fuse].time = time;
}

function stop_fuse(fuse) {
	//console.log('stopping fuse "' + fuse + '"');
	if(Game.fuses[fuse]) {
		Game.fuses[fuse].time = -1; // doesn't explode
	}
}

function explode_fuse(fuse) {
	Game.fuses[fuse].time = 0;
	Game.fuses[fuse].explode();
}

function list_verbs(thing, is_room) {

	var things_or_rooms = is_room ? 'rooms' : 'things';

	var snippets = [];

	for(var verb in Verbs) {
		//console.log('looking at ' + verb + ' for ' + things_or_rooms + '.' + thing)
		if(Game[things_or_rooms][thing].active_verbs.indexOf(verb) != -1) {
			// snippets.push('<a onClick="do_verb(\'' + verb + '\',\'' + thing + '\')" href="javascript:void(0)">' + display_verb(verb) + '</a>');
			snippets.push(draw_button(display_verb(verb), "do_verb('" + verb + "','" + thing + "')"));
		}
	}

	// allow things to have active_verbs that don't appear in Verbs
	// (in this case the thing MUST catch the verb with a 'before', and return true)
	Game[things_or_rooms][thing].active_verbs.forEach(function(verb) {
		if(!Verbs[verb]) {
			// snippets.push('<a onClick="do_verb(\'' + verb + '\',\'' + thing + '\')" href="javascript:void(0)">' + display_verb(verb) + '</a>');
			snippets.push(draw_button(display_verb(verb), "do_verb('" + verb + "','" + thing + "')"));
		}
	});


	if(snippets.length) {
		return snippets.join(' ');
	} else return '';

}

function display_verb(verb) {
	if(Verbs[verb] && Verbs[verb].display) {
		return Verbs[verb].display;
	} else {
		return verb;
	}
}

function activate_verb(thing, verb) {
	// console.log('activating ' + verb + ' for ' + thing);

	if(!Game.things[thing].active_verbs) {
		Game.things[thing].active_verbs = [];
	}
	if(Game.things[thing].active_verbs.indexOf(verb) == -1) {
		Game.things[thing].active_verbs.push(verb);
	}

}

function activate_room_verb(room, verb) {
	//console.log('activating ' + verb + ' for room ' + room);

	if(!Game.rooms[room].active_verbs) {
		Game.rooms[room].active_verbs = [];
	}
	if(Game.rooms[room].active_verbs.indexOf(verb) == -1) {
		Game.rooms[room].active_verbs.push(verb);
	}

}

function deactivate_verb(thing, verb) {
	//console.log('deactivating ' + verb + ' for ' + thing);
	if(!Game.things[thing]) {
		console.log('tried to deactivate "' + verb + '" for nonexistent thing "' + thing + '"');
	}
	removeFrom(Game.things[thing].active_verbs, verb);
}

function deactivate_room_verb(room, verb) {
	//console.log('deactivating ' + verb + ' for room ' + room);

	removeFrom(Game.rooms[room].active_verbs, verb);
}

function deactivate_all(thing) {
	//console.log('deactivating all verbs for ' + thing);
	Game.things[thing].active_verbs = [];
}

function set_active(thing, verb, bool) {
	if(bool) {
		activate_verb(thing, verb);
	} else {
		deactivate_verb(thing, verb);
	}
}

function activate_if_held(thing, verb, tool) {
	if(held(tool)) {
		activate_verb(thing, verb);
	} else {
		deactivate_verb(thing, verb);
	}
}

function removeFrom(array, item) {
	for(var i=array.length - 1; i >= 0; --i) {
		if(array[i]==item) {
			array.splice(i, 1);
		}
	}
}

var INITIAL_GAME = {};
var PLAYED = false;
var GAME_OVER = false;

function initialise() {
	if(!PLAYED) {
		INITIAL_GAME = JSONfn.stringify(Game);
		PLAYED = true;
	}

	document.title = Game.title;
	document.getElementById('title').innerHTML = Game.title;

	if(Game.initialise) {
		Game.initialise();
	}

	for(var thing in Game.things) {
		if(typeof Game.things[thing].active_verbs === 'undefined') {
			Game.things[thing].active_verbs = [];
		}

		if(typeof Game.things[thing].active_when_carried === 'undefined') {
			Game.things[thing].active_when_carried = [];
		}

		if(Game.things[thing].portable) {
			set_active(thing, 'take', !carried(thing));
			set_active(thing, 'drop', carried(thing));
		}


		if(Game.things[thing].active_when_carried) {
			Game.things[thing].active_when_carried.forEach(function(verb) {
				set_active(thing, verb, carried(thing));
			});
		}

		if(!Game.things[thing].description) {
			Game.things[thing].description = replaceAll(thing, '_', ' ');
		}


		if(Game.things[thing].initialise) {
			Game.things[thing].initialise();
		}
	}

	for(var room in Game.rooms) {
		if(typeof Game.rooms[room].directions === 'undefined') {
			Game.rooms[room].directions = {};
		}

		if(typeof Game.rooms[room].before === 'undefined') {
			Game.rooms[room].before = {};
		}
		if(typeof Game.rooms[room].after === 'undefined') {
			Game.rooms[room].after = {};
		}

		if(Game.rooms[room].initialise) {
			Game.rooms[room].initialise();
		}
	}

	say(Game.intro);

	if(is_landscape()) {
		say("<u>" + Game.title.toUpperCase() + (Game.author ? ", by " + Game.author + "</u>" : ""));
	}
	//say('For instructions, touch: <a href="javascript:void(0)" onClick="instructions()">instructions</a>\n');
	say("For instructions, touch: " + draw_button("instructions", "instructions()") + "\n");

	restore_checkboxes();
	if(roomdesc_in_scroller()) {
		describe_room_in_scroller();
	}

	set_heights();



	//do_alwayses();

}

function confirm_restart() {
	if(GAME_OVER || confirm("Really restart this story?")) {
		restart_game();
	}
}

function restart_game() {
	GAME_OVER = false;
	Game = JSONfn.parse(INITIAL_GAME);
	document.getElementById('scroller').innerHTML = '';
	initialise();
	//describe_room();
	update_display();
	set_heights();
}



function is_lit(room) {

	if(!Game.rooms[room]) {
		console.log("tried to check lit status of nonexistent room '" + room + "'");
	}

	if(!Game.rooms[room].dark) {
		return true;
	}

	for(var thing in Game.things) {
		if(Game.things[thing].is_lit && (
		    (Game.things[thing].location == room) ||
		    (Game.hero_location == room && carried(thing))
		   )
		  ) {
			  return true;
		}
	}

	return false;
}

function uncarry(thing) {
	if(held(thing)) {
		unhold(true);
	}
	if(Game.things[thing].wearable) {
		deactivate_verb(thing, 'wear');
	}
	removeFrom(Game.inventory, thing);
}

function give_hero(thing, sneak) { // if SNEAK is true, put the thing in the inventory, not the PC's hands (i.e. carrying not held)
	if(!carried(thing)) {

		if(sneak) {
			Game.inventory.unshift(thing);
		} else {
			hold(thing);
		}
	}
	Game.things[thing].location = '';
	activate_verb(thing, 'drop');
	deactivate_verb(thing, 'take');
	if(Game.things[thing].wearable) {
		activate_verb(thing, 'wear');
	}
}

function take_away(thing) {
	uncarry(thing);
	deactivate_verb(thing, 'drop');
	if(Game.things[thing].portable) {
		activate_verb(thing, 'take');
	}
}

function put(thing, location) {

	//console.log('putting ' + thing + ' in ' + (location ? location : '(nowhere)' ));

	if(!Game.things[thing]) {
		console.log("Tried to put nonexistent thing '" + thing + "' in " + location);
	}
	if(!Game.rooms[location] && location != '') {
		console.log("Tried to put " + thing + " in nonexistent room '" + location + "'");
	}

	take_away(thing);
	Game.things[thing].location = location;
	deactivate_verb(thing, 'drop');
	if(Game.things[thing].portable) {
		activate_verb(thing, 'take');
	}
}

function hide(thing) {
	put(thing, '');
}

function name(thing) {
	//return thing;
	if(!thing) { return '' };

	if(!Game.things[thing]) {
		console.log("tried to get name of nonexistent thing '" + thing + "'");
	}

	if(Game.things[thing].name) {
		return Game.things[thing].name;
	} else {
		return replaceAll(thing, '_', ' ');
	}
}

function singular(thing) {
	if(Game.things[thing].singular) {
		return Game.things[thing].singular;
	} else {
		return name(thing);
	}
}

function the_thing(thing, caps) {
	if(!Game.things[thing]) {
		console.log("Tried to call the_thing() for nonexistent thing '" + thing + "'");
	}
	if(Game.things[thing].proper_name) {
		return capitalise(name(thing));
	} else {
		return (caps ? "The " : "the ") + name(thing);
	}
}

function capitalise(str) {
	if(str == '') {
		return ''
	} else {
		return str.substring(0,1).toUpperCase() + str.substring(1);
	}
}

function location_of(thing) {
	if(!Game.things[thing]) {
		console.log("tried to get location of nonexistent thing '" + thing + "'");
	}
	return Game.things[thing].location;
}

function hero_location() {
	if(!Game.rooms[Game.hero_location]) {
		console.log("hero is in nonexistent location '" + Game.hero_location + "'");
	}
	return Game.rooms[Game.hero_location];
}

function at(room) {
	return Game.hero_location == room;
}

function put_hero(room, suppress_message) {
	if(!Game.rooms[room]) {
		console.log('tried to put hero at nonexistent location "' + room + '"');
	} else {
		//console.log('putting hero at ' + room);
	}
	Game.hero_location = room;
	if(suppress_message) {
		Game.suppress_room_message = true;
	}
	do_room_music();
}

function held(thing) {
	return Game.held == thing;
}

function held_thing() {
	return Game.things[Game.held];
}

function carried(thing) {
	if(!Game.things[thing]) {
		console.log("Tried to check carried status of nonexistent thing '" + thing + "'");
	}
	return (Game.held == thing) || Game.inventory.indexOf(thing) != -1;
}

function worn(thing) {
	if(!Game.things[thing]) {
		console.log("Tried to check worn status of nonexistent thing '" + thing + "'");
	}
	return Game.things[thing].worn;
}

function in_scope(thing) {
	return carried(thing) || Game.things[thing].location == Game.hero_location;
}

function visible(thing) {
	return carried(thing) || (Game.things[thing].location == Game.hero_location && is_lit(Game.hero_location));
}

function pronoun(thing, n, caps) {
	var pronoun = '';
	if(Game.things[thing].pronouns) {
		pronoun = Game.things[thing].pronouns[n];
	} else if(Game.things[thing].is_plural) {
		pronoun = ["they", "them", "their", "theirs"][n];
	} else {
		pronoun = ["it", "it", "its", "its"][n];
	}
	return caps ? capitalise(pronoun) : pronoun;
}

function s(thing) {
	if(Game.things[thing].is_plural) {
		return "";
	} else {
		return "s";
	}
}

function pick(n) { // random number 0 to n-1
	return Math.floor(n * Math.random());
}

function pickOne(arr) { // random element of an array
	return arr[pick(arr.length)];
}



/*
 * Undo
 */


Undo_states = [];
Undo_states.length = 20; // number of UNDO states to keep in memory
clear_undo_stack();
function clear_undo_stack() {
	for(var i=0; i < Undo_states.length; ++i) {
		Undo_states[i] = '';
	}
}
function push_undo_state(command)
{
	for(var i = Undo_states.length - 1; i > 0; --i)
		Undo_states[i] = Undo_states[i - 1];

	Game.undo_message = command;
	Undo_states[0] = JSONfn.stringify(Game);
}
function pop_undo_state()
{
	var old_state = Undo_states[0];
	for(var i = 0; i < Undo_states.length - 1; ++i) {
		Undo_states[i] = Undo_states[i + 1];
	}
	Undo_states[Undo_states.length - 1] = '';

	return old_state;
}
function undo() {

	say('\n<span class="prompt">&gt; undo</span>');

	var popped_state = pop_undo_state();
	if(popped_state == '') {
		say("Can't undo, sorry");
		return;
	}

	GAME_OVER = false;

	Game = JSONfn.parse(popped_state);
	do_onholds();
	update_display();
	say('Undone "' + Game.undo_message + '"');

	do_room_music(true);
}



/*
 *  Load and save games
 */

function save_game() {

	if(GAME_OVER) {
		// document.getElementById('scroller').innerHTML += ("<br/>You can't save, because the game is over<br/>\
		//     Try undoing, restoring or restarting");
		return;
	}

	var game_name = prompt("Enter a name for your saved game", Game.title);

	if(!game_name) {
		say("\n<span class=\"prompt\">&gt; save</span>\nCancelled");
		return;
	}
	game_name = game_name.toUpperCase();
	game_name = game_name.split("'").join("");
	game_name = game_name.split('"').join("");
	game_name = game_name.split('\n').join("");
	game_name = game_name.split('\r').join("");
	game_name = game_name.split('\t').join("");
	game_name = game_name.split('\\').join("");

	if(!game_name.split(" ").join("")) { // spaces are allowed, but not ONLY spaces
		say("Please use a more sensible name");
		return;
	}

	say('\n<span class="prompt">&gt; save ' + game_name + '</span>');

	try {
		localStorage.setItem(Game.id + '_' + game_name, JSONfn.stringify(Game));
		say("Game saved as '" + game_name + "'");
	} catch(e) {
		say("Couldn't save game, sorry");
	}

}

function load_game(game_name) {
	say('\n<span class="prompt">&gt; restore</span>');

	GAME_OVER = false;
	Game = JSONfn.parse(localStorage.getItem(Game.id + '_' + game_name));
	$('#saved_games').fadeOut();
	$('#room_description').html('');
	say("Game restored from '" + game_name + "'");
	clear_undo_stack();
	do_onholds();
	update_display();
	do_room_music(true);
}

function delete_game(game_name) {
	if(confirm("Really delete game '" + game_name + "'?")) {
		localStorage.removeItem(Game.id + '_' + game_name);
		$('#saved_games').fadeOut();
		say('\n<span class="prompt">&gt; delete ' + game_name + '</span>');
		say("Saved game '" + game_name + "' deleted");
	}
}

function goto_loader() {
	var html = 'Restore saved game<br/><br/>';

	var i=0;
	for(var key in localStorage) {

		if(key.indexOf(Game.id + '_')==0) {
			++i;

			game_name = key.substring(1 + Game.id.length);

			// html += '<a onClick="load_game(\'' + game_name + '\')" href="javascript:void(0)">' + game_name + '</a> ' +
			//  '[<a onClick="delete_game(\'' + game_name + '\')" href="javascript:void(0)">delete</a>]<br/>';
			html += draw_button(game_name, "load_game('" + game_name + "')") +
			        draw_button("delete", "delete_game('" + game_name + "')") + "<br/>\n";
		}
	}
	if(!i) {
		html += 'No saved games found.<br/>';
	}

	//html += '<br/>[<a onClick="remove_loader()" href="javascript:void(0)">cancel</a>]';
	html += "<br/>" + draw_button("cancel", "remove_loader()");

	$('#saved_games').html(html);
	$('#saved_games').fadeIn();

}

function remove_loader() {
	$('#saved_games').fadeOut();
}


/*
 * JSONfn utility
 * allows an object structure including functions to be stringified/parsed like JSON
 * (so that the whole Game object can be stashed in local storage/undo history)
 */
var JSONfn;
if (!JSONfn) {
    JSONfn = {};
}

(function () {
  JSONfn.stringify = function(obj) {
    return JSON.stringify(obj,function(key, value){
            return (typeof value === 'function' ) ? value.toString() : value;
        });
  }

  JSONfn.parse = function(str) {
    return JSON.parse(str,function(key, value){
        if(typeof value != 'string') return value;
        return ( value.substring(0,8) == 'function') ? eval('('+value+')') : value;
    });
  }
}());


/*
 * display options
 */

function show_options() {
	$('#options').fadeIn();
}
function hide_options() {
	$('#options').fadeOut();
}

function show_credits() {
	$('#credits').fadeIn();
}
function hide_credits() {
	$('#credits').fadeOut();
}


$(document).ready(function() {

	$('#listobj_always').change(function() {
		var checked = $('#listobj_always').prop('checked');
		$('#listobj_landscape').prop('checked', !checked);
		$('#listobj_never').prop('checked', !checked);
		if(checked) {
			localStorage.setItem(Game.id + 'options_listobj', 'always');
		}
		if(checked && !$('#roomdesc_always').prop('checked')) {
			$('#roomdesc_always').prop('checked', true);
			$('#roomdesc_always').trigger('change');
		}
	});
	$('#listobj_landscape').change(function() {
		var checked = $('#listobj_landscape').prop('checked');
		$('#listobj_always').prop('checked', !checked);
		$('#listobj_never').prop('checked', !checked);
		if(checked) {
			localStorage.setItem(Game.id + 'options_listobj', 'landscape');
		}
		if(checked && $('#roomdesc_never').prop('checked')) {
			$('#roomdesc_landscape').prop('checked', true);
			$('#roomdesc_landscape').trigger('change');
		}
	});
	$('#listobj_never').change(function() {
		var checked = $('#listobj_never').prop('checked');
		$('#listobj_landscape').prop('checked', !checked);
		$('#listobj_always').prop('checked', !checked);
		if(checked) {
			localStorage.setItem(Game.id + 'options_listobj', 'never');
		}
	});
	$('#roomdesc_always').change(function() {
		var checked = $('#roomdesc_always').prop('checked');
		$('#roomdesc_landscape').prop('checked', !checked);
		$('#roomdesc_never').prop('checked', !checked);
		if(checked) {
			localStorage.setItem(Game.id + 'options_roomdesc', 'always');
		}
	});
	$('#roomdesc_landscape').change(function() {
		var checked = $('#roomdesc_landscape').prop('checked');
		$('#roomdesc_always').prop('checked', !checked);
		$('#roomdesc_never').prop('checked', !checked);
		if(checked) {
			localStorage.setItem(Game.id + 'options_roomdesc', 'landscape');
		}
		if(checked && $('#listobj_always').prop('checked')) {
			$('#listobj_landscape').prop('checked', true);
			$('#listobj_landscape').trigger('change');
		}
	});
	$('#roomdesc_never').change(function() {
		var checked = $('#roomdesc_never').prop('checked');
		$('#roomdesc_landscape').prop('checked', !checked);
		$('#roomdesc_always').prop('checked', !checked);
		if(checked) {
			localStorage.setItem(Game.id + 'options_roomdesc', 'never');
		}
		if(checked && !$('#listobj_never').prop('checked')) {
			$('#listobj_never').prop('checked', true);
			$('#listobj_never').trigger('change');
		}
	});

	$('#verbose').change(function() {
		var checked = $('#verbose').prop('checked');
		$('#noverbose').prop('checked', !checked);
		localStorage.setItem(Game.id + 'option_verbose', checked?1:0);
	});
	$('#noverbose').change(function() {
		var checked = $('#noverbose').prop('checked');
		$('#verbose').prop('checked', !checked);
		localStorage.setItem(Game.id + 'option_verbose', checked?0:1);
	});

	$('#typing_sound').change(function() {
		var checked = $('#typing_sound').prop('checked');
		if(!checked) {
			document.getElementById('typing_audio').pause();
		}
		localStorage.setItem(Game.id + 'typing_sound', checked?1:0);
	});
	$('#music').change(function() {
		var checked = $('#music').prop('checked');
		if(!checked) {
			stopAllMusic();
		} else {
			playMusic(currentMusic);
		}
		localStorage.setItem(Game.id + 'music', checked?1:0);
	});

	if(!localStorage.getItem(Game.id + 'typing_sound')) {
		change_font();
		change_sounds();
	}


});


function change_font_size(n) { // if n==1, make bigger; if n==-1, make smaller; if n==0, reset
	var min_size = 10;
	var default_size = 12;

	var set_to = default_size;

	if(n != 0) {
		var font_size_px = parseFloat( $('body').css('font-size') );
		var font_size_pt = Math.round( font_size_px * (72/96) );
		set_to = font_size_pt + n;
	}

	$('body').css('font-size', set_to + 'pt');

	localStorage.setItem(Game.id + 'options_fontsize', set_to);

	update_display();
}

function change_font() {
	var font = $('#font_select').val();
	$('body').css('font-family', font + ', ' + font + '_ie');

	localStorage.setItem(Game.id + 'options_font', font);

	update_display();
}
function change_sounds() {
	var musicp = $('#music').prop('checked');
}

function restore_display_options() {

	try {

		var font = localStorage.getItem(Game.id + 'options_font');
		var size = localStorage.getItem(Game.id + 'options_fontsize');

		$('body').css({
			'font-family': font + ', ' + font + '_ie',
			'font-size': size + 'pt'
		});

		//$('#font_select option[value="' + font + '"]').prop('selected', 'selected')

		$('#font_select').val(font);
		// StackOverflow insists that works, but it's not working for me on all browsers, so:
		$('#font_select option[val="' + font + '"]').attr('selected', 'selected');

		update_display();
	} catch(e) {
	}
}
$(document).ready(function() {

	try {
		if(localStorage.getItem(Game.id + 'options_font')) {
			restore_display_options();
		}
	} catch(e) {
		// localStorage not working

		say("\nCould not access local storage. Saving and restoring games may not work.");
		$('body').css({ 'font-family' : 'typewriter', 'font-size' : '12pt' });
		// could not restore settings

	}

	restore_checkboxes();
});

function restore_checkboxes() {
	try {
		var listobj = localStorage.getItem(Game.id + 'options_listobj');
		if(listobj=='always') {
			$('#listobj_always').prop('checked', true);
			$('#listobj_always').trigger('change');
		} else if(listobj == 'landscape') {
			$('#listobj_landscape').prop('checked', true);
			$('#listobj_landscape').trigger('change');
		} else if(listobj == 'never') {
			$('#listobj_never').prop('checked', true);
			$('#listobj_never').trigger('change');
		}
		var roomdesc = localStorage.getItem(Game.id + 'options_roomdesc');
		if(roomdesc=='always') {
			$('#roomdesc_always').prop('checked', true);
			$('#roomdesc_always').trigger('change');
		} else if(roomdesc == 'landscape') {
			$('#roomdesc_landscape').prop('checked', true);
			$('#roomdesc_landscape').trigger('change');
		} else if(roomdesc == 'never') {
			$('#roomdesc_never').prop('checked', true);
			$('#roomdesc_never').trigger('change');
		}

		var verbose = localStorage.getItem(Game.id + 'option_verbose')=='1';
		$('#verbose').prop('checked', verbose);
		$('#noverbose').prop('checked', !verbose);

		if(!localStorage.getItem(Game.id + 'typing_sound')) {
			localStorage.setItem(Game.id + 'typing_sound', "1");
		}
		if(!localStorage.getItem(Game.id + 'music')) {
			localStorage.setItem(Game.id + 'music', "1");
		}

		var typingSound = localStorage.getItem(Game.id + 'typing_sound')=='1';
		$('#typing_sound').prop('checked', typingSound);
		$('#typing_sound').trigger('change');

		var musicp = localStorage.getItem(Game.id + 'music')=='1';
		$('#music').prop('checked', musicp);
		$('#music').trigger('change');

/*		if(localStorage.getItem(Game.id + 'typing_sound') != null) {
			var typing_sound = localStorage.getItem(Game.id + 'typing_sound')=='1';
			$('#typing_sound').prop('checked', typing_sound);
			var music = localStorage.getItem(Game.id + 'music')=='1';
			$('#music').prop('checked', music);
		} */


	} catch(e) {
		// could not restore settings
	}

}

// detect if landscape
function is_landscape() {
	return (window.innerWidth >= window.innerHeight); // >? >=?
	//return (window.innerWidth >= 800);
}


var room_description_height = $('#room_description').height();
var inventory_height = $('#inventory').height();

function animate_heights() {
	animate_room_description_height();
	animate_holding_height();
	animate_inventory_height();
}

function animate_inventory_height() {
	$('#inventory_container').stop().animate({height: $('#inventory').outerHeight()}, 300);
	set_heights();
}
function animate_holding_height() {
	$('#holding_container').stop().animate({height: $('#holding').outerHeight()}, 300);
}
function animate_room_description_height() {
	$('#room_description_container').stop().animate({height: $('#room_description').outerHeight()}, 300);
}

function set_heights() { // no animation
	$('#room_description_container').height($('#room_description').outerHeight());
	$('#holding_container').height($('#holding').outerHeight());
	$('#inventory_container').height($('#inventory').outerHeight());
}

/*
 * User instructions
 */
function instructions() {
	dim_old_messages();
	say('\n<span class="prompt">&gt; instructions</span>');
	say("This is a keyboardless text adventure game. You are taking part in an interactive story - \
	    I will tell you what is going on in this pane. In the panes " + (
	      is_landscape() ? "on the right (or below this one, for portrait screens)" :
	      "below this one (or to the right, for landscape screens)"
	    ) + ", I'll tell you where I am, what I can see, and what I\'m carrying. To give me an instruction, \
	    click or touch one of the <button type=\"button\">buttons</button> there &ndash; either a direction telling \
	    me where to go, or an action applying to something I can see. Click an item in the \"I'm carrying\" list \
		to hold that item, which may make more actions available. Have fun, and happy adventuring!");
}

/* set_heights() doesn't work at first, I don't know why!
 */
$(document).ready(function() {
	setTimeout(set_heights, 200);
});



function join_with_and(words) {
	if(!words.length) {
		return '';
	}

	if(words.length == 1) {
		return words[0];
	}

	if(words.length == 2) {
		return words[0] + ', and ' + words[1];
	}

	return words[0] + ', ' + join_with_and(words.slice(1));
}


$(document).ready(function() {
	setTimeout(animate_heights, 500);
	//setInterval(set_heights, 10000);
});
