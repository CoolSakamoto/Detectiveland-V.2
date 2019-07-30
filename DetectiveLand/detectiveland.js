/*
 *
 * DETECTIVELAND
 * (c) by Robin Johnson - robindouglasjohnson@gmail.com - @rdouglasjohnson
 * Copy and distribute freely in unmodified form, preserving this licence.
 * No commercial use without permission of the author.
 *
 */



Game = {

	id: "TLM",
	title: "Detectiveland",
	author: "Robin Johnson",

	hero_location: 'my_office',

	score: 0,
	max_score: 4,

	alignment: 0,

	score_percentage: false,

	game_over: false,
	turn_number: 0,
	game_time: 600, // game starts at 10:00 a.m.

	intro: "Another working day begins for Lanson Rose, private investigator. " +
	"I got three clients waiting outside my office, and beyond that, a town full of creeps, clowns, mobsters " +
	"and, if you know where to look, the occasional honest citizen. When trouble is your business, you're " +
	"rarely short of work in New Losago.\n\n",

	inventory: ["money"],
	held: "",

	rooms: {},
	things: {},
	vars: {
		open_cases: [],
		failed_cases: [],
		closed_cases: [],
		taxi_destinations: [["my office", "maine_and_3rd"], ["police department", "nebraska_and_4th"], ["hospital", "ohio_and_3rd"]]
	},
	fuses: {
		loading_coffins: {}
	},

	options: {},

	before: [],
	always: [],

	initialise: function() {
		set_wexlers_apt_no();
		set_donnas_house_no();
		set_macdonalds_house_no();
	},

	startingMusic: 'saxloopmusic',
};
On_hold = [];
Rules = [];
Looks = {};
currentMusic = Game.startingMusic;

male_pronouns =   ["he",   "him",  "his",   "his",    "himself"];
female_pronouns = ["she",  "her",  "her",   "hers",   "herself"];
neuter_pronouns = ["it",   "it",   "its",   "its",    "itself" ];
plural_pronouns = ["they", "them", "their", "theirs", "themselves"];
nb_pronouns =     ["they", "them", "their", "theirs", "themself"];

Game.always.push(
	function() {
		Game.turn_number++;
		Game.game_time++;
		atmospheric_message();
		navigation_message();
		do_room_music();
		//update_case_name();
	}
);
/*
function update_case_name() {
	if(Game.vars.case_open) {
		$('#title').html(Game.vars.case_open);
	} else {
		$('#title').html("No case open");
	}
}
*/
function atmospheric_message() {

	var loc = hero_location();

	if(loc.is_streets && Game.just_moved && !pick(100)) {
		var n = pickOne([1,5,10,25]);
		say("I find a " + (n==1?"penny":n==5?"nickel":n==10?"dime":"quarter") + " on the sidewalk.");
		get_money(0.01*n);

		return;
	}

	if(!pick(4)) {

		var messages = [];
		if(loc.is_streets) {
			// Anywhere in streets

			if(!loc.is_princeley_heights) {

				// Outside Princeley Heights only
				messages.push("An automobile rumbles by.");
				messages.push("A cop car races by with its siren wailing.");
				messages.push("A delivery truck rumbles by.");

				if(!loc.is_westside) {

					// Downtown only
					messages.push("A girl clatters past on a bicycle.");
					messages.push("A boy clatters past on a bicycle.");
				}
			}
			if(loc.is_westside) {
				// Westside only
				messages.push("I hear a gunshot in the distance.");
				messages.push("A girl clatters past on a cheap bicycle.");
				messages.push("A boy clatters past on a cheap bicycle.");
				messages.push("A meat wagon races by with its siren wailing.");
			}
			if(loc.is_princeley_heights) {
				// Princeley Heights only
				messages.push("A Rolls Royce glides past.");
				messages.push("A Chrysler glides past.");
				messages.push("A Bentley glides past.");
				messages.push("A girl clatters past on an expensive bicycle.");
				messages.push("A boy clatters past on an expensive bicycle.");
			}
		} else if(loc.is_mountains) {
			messages.push("An eagle soars overhead.");
			messages.push("Crickets chirp in the grass.");
			messages.push("I see a lizard scuttle under a rock.");
		}


		if(messages.length) {
			say(pickOne(messages));
		}

	}


}

function navigation_message() {
	if(hero_location().is_princeley_heights && !Game.vars.visited_princeley_heights) {
		say("This is the where the swells live. " +
		    "I feel like maybe I should wipe my feet before entering this part of the city.");
		Game.vars.visited_princeley_heights = true;
	}
	else if(hero_location().is_westside && !Game.vars.visited_westside) {
		say("As I step into West New Losago, I grit my teeth and start watching my back a little closer. This ain't the fanciest part of town.");
		Game.vars.visited_westside = true;
	}
}

/* generate street grid
 *
 * The city of New Losago has five streets running east-west, and seven avenues running north-south,
 * the seventh of which is called Princeley Boulevard and is too posh to be called by an ordinal number
 */
var street_names = ['Kentucky', 'Louisiana', 'Maine', 'Nebraska', 'Ohio']
for (var stNum = 0; stNum<=4; ++stNum) {
	for(var ave = 1; ave<=7; ++ave) {
		var corner_name = street_names[stNum] + ' Street and ' + nth_ave(ave) + ' Avenue';
		if(ave == 7) { corner_name = street_names[stNum] + ' Street and Princeley Boulevard'; }

		var is_westside = false;
		var is_princeley_heights = false;
		if(ave <= 2) {
			corner_name += ', in the Westside.';
			is_westside = true;
		} else if(ave >= 6) {
			corner_name += ', in Princeley Heights.';
			is_princeley_heights = true;
		} else {
			corner_name += '.';
		}

		var room = {
			description: "I'm at " + corner_name,
			music: "bassloopmusic",
			directions: {},
			is_streets: true,
		}
		if(is_westside) {
			room.is_westside = true;
		}
		if(is_princeley_heights) {
			room.is_princeley_heights = true;
		}

		if(stNum > 0) {
			room.directions.north = corner_int_name(stNum - 1, ave);
		}
		if(ave < 7) {
			room.directions.east = corner_int_name(stNum, ave + 1);
		}
		if(stNum < 4) {
			room.directions.south = corner_int_name(stNum + 1, ave);
		}
		if(ave > 1) {
			room.directions.west = corner_int_name(stNum, ave - 1);
		}

		Game.rooms[corner_int_name(stNum, ave)] = room;
	}
}
function nth_ave(n) { // for n = 1 to 7th only!
	if(n == 7) {
		return('Princeley');
	} else {
		return '' + n + (n==1 ? 'st' : n==2 ? 'nd' : n==3 ? 'rd' : 'th');
	}
}
function corner_int_name(st, ave) {
	return (street_names[st] + '_and_' + nth_ave(ave)).toLowerCase();
}
function random_intersection() {
	return corner_int_name(pick(5), 1+pick(7));
}

// put "fancy houses" all down 6th Avenue, and "mansions"  all down Princeley Boulevard
for(var i=0; i<4; ++i) {
	Game.things['fancy_houses_' + i] = {
		description: "fancy houses",
		location: street_names[i].toLowerCase() + '_and_6th',
	}
	Game.things['mansions_' + i] = {
		description: "mansions",
		location: street_names[i].toLowerCase() + '_and_princeley',
	}
}


Game.things.poster = {
	name: 'yard sign',
	description: 'yard sign',
	location: 'maine_and_6th',
	active_verbs: ["look"],
};
add_rule('before', 'look', 'poster', function() {
	say('The yard sign shows the face of a serious-looking, fifty-something man, above the caption: "Keep America safe! Re-elect George Manhattan Brinkman for US Senate."');
	Game.things.poster.seen = true;
	return true;
});


Game.rooms.my_office = {
	description: "I'm in my office.",
	indoors: true,
	music: "saxloopmusic",

	directions: {
		out: 'office_building',
	},

};

Game.things.office_door_inside = {
	location: 'my_office',
	description: 'door reading "EVITCETED ETAVIRP"',
};

Game.things.filing_cabinet = {
	description: "filing cabinet",
	location: 'my_office',
	active_verbs: ["open"],
	contents: ["revolver", /* "bullets", */ "watch", "flashlight"],
};

Game.things.revolver = {
	portable: true,
	value: 0.50,
	active_when_carried: ["fire"],
	//bullets: 6,
	/* always: function() {
		Game.things.revolver.description = "revolver (" + Game.things.revolver.bullets + " bullet" +
		 (Game.things.revolver.bullets==1 ? "" : "s") + " loaded)";
		set_active('revolver', 'load', (in_scope('bullets') && !Game.things.revolver.bullets));
	}, */
	/* before: {
		fire: function() {
			return fire_revolver();
		},
	} */
};
add_rule('before', 'fire', 'revolver', function() {
	say("I pull the trigger. A small flame briefly appears at the end of the barrel.");
	hide('revolver');
	give_hero('lighter');
	return true;
});
Game.things.lighter = {
	description: "gun-shaped novelty lighter",
	portable: true,
	value: 0.50,
	active_when_carried: ["light"],
};
add_rule('before', 'light', 'lighter', function() {
	say("I pull the trigger. A small flame briefly appears at the end of the barrel.");
	return true;
});

/* function load_revolver() {
	Game.things.revolver.bullets = 6;
	say("Ok, it's loaded.");
	return true;
} */
/*
Game.things.bullets = {
	is_plural: true,
	portable: true,
	description: "box of bullets",
}; */

/*
Game.things.whiskey = {
	description: "flask of whiskey",
	indefinite: "a flask of whiskey",
	portable: true,
	active_when_carried: ["drink"],
	before: {
		drink: function() {
			return drink_whiskey();
		}
	}
};
*/


Game.things.watch = {
	description: "wristwatch",
	portable: true,
	value: 20,
	wearable: true,
	active_when_carried: ["look"],
};
add_rule('before', 'look', 'watch', function() {
	say("It's " + game_time_str() + ".");
	return true;
});

function game_time() {
	return (Game.game_time % (24 * 60));
}
function game_time_str() {
	var t = game_time();
	var pm = false;
	if(t >= (12*60)) {
		t -= (12*60);
		pm = true;
	}
	var h = Math.floor(t/60);
	var m = t % 60;
	if(h==0) h = 12;
	if(m < 10) m = '0' + m;
	return h + ':' + m + ' ' + (pm ? 'PM' : 'AM');
}

Game.things.flashlight = {
	portable: true,
	value: 1,
	always: function() {
		set_active('flashlight', 'light', carried('flashlight') && !Game.things.flashlight.is_lit);
		set_active('flashlight', 'unlight', carried('flashlight') && Game.things.flashlight.is_lit);
	},
}

Game.things.murphy_bed = {
	description: "bookcase",
	location: "my_office",
	stowed: true,
	discovered: false,
};
add_rule('before', 'fold', 'murphy_bed', function() {
	say("I give the Murphy bed a kick and it folds up against the wall, neatly disguising itself as a bookcase.");
	Game.things.murphy_bed.description = "bookcase";
	Game.things.murphy_bed.name = "bookcase";
	Game.things.murphy_bed.stowed = true;
	deactivate_verb('murphy_bed', 'fold');
	deactivate_verb('murphy_bed', 'sleep');
	activate_verb('murphy_bed', 'pull');
	return true;
});

add_rule('before', 'pull', 'murphy_bed', function() {
	say("I give the bookcase a yank and it pops out from the wall, turning neatly into my foldaway Murphy bed.");
	if(Game.things.book.on_bookcase) {
		say("The book falls onto the floor.");
		Game.things.book.on_bookcase = false;
		Game.things.book.description = 'book titled "1001 Detectiving Tips"';
	}
	return unfold_murphy_bed();
});

function unfold_murphy_bed() { // not a rule!
	Game.things.murphy_bed.description = "Murphy bed";
	Game.things.murphy_bed.name = "murphy bed";
	Game.things.murphy_bed.stowed = false;
	activate_verb('murphy_bed', 'fold');
	activate_verb('murphy_bed', 'sleep');
	deactivate_verb('murphy_bed', 'pull');
	return true;
}

Game.things.photograph_of_ruby = {
	name: "photograph",
	description: "photograph of Ruby",
	portable: true,
	value: 0,
	active_when_carried: ["look"],
};
add_rule('before', 'look', 'photograph_of_ruby', function() {
	say("That's my sweetheart, Ruby. She's a doctor down at the city hospital. Ruby's an angel, " +
	    "plus she fixes me up on the quiet whenever my work takes a nasty turn.");
	Game.things.photograph_of_ruby.seen = true;
	return true;
});

Game.things.book = {
	description: 'book titled "1001 Detectiving Tips" (on bookcase)',
	location: 'my_office',
	portable: true,
	value: 0.5,
	on_bookcase: true,
	active_when_carried: ["read"],
};
add_rule('before', 'take', 'book', function() {
	Game.things.book.description = 'book titled "1001 Detectiving Tips"';
	if(Game.hero_location == 'my_office' && Game.things.murphy_bed.stowed && Game.things.book.on_bookcase) {
		Game.things.book.on_bookcase = false;
		say("As I take it from the shelf, the bookcase pops out from the wall, turning neatly into my foldaway Murphy bed."); // +
		//  (Game.things.murphy_bed.discovered ? "" : " Yeah, I live here too. Rent's high in this city, \
		//   and it's not like I'm ever off work.")
		//);
		if(location_of('mrs_macdonald')=='my_office' && !Game.things.mrs_macdonald.misunderstood) {
			say('"Oh dear," says ' + the_thing('mrs_macdonald') + '. "I hope you haven\'t misunderstood the situation."');
			Game.things.mrs_macdonald.misunderstood = true;
		}
		if(!Game.things.murphy_bed.discovered) {
			say("A photograph flutters out from under the pillow.");
			put('photograph_of_ruby', 'my_office');
			Game.vars.found_photo = true;
		}
		Game.things.murphy_bed.discovered = true;
		unfold_murphy_bed();
		give_hero('book');
		return true;
	}
	return false;
});

add_rule('before', 'read', 'book', function() {
	// give context-sensitive hint

	var hint = '';

	if(!is_lit(Game.hero_location)) {
		say("It's too dark to read!");
		return true;
	}

	var loc = hero_location();
	if(Game.hero_location=='my_office' || Game.hero_location=='office_building') {
		hint = "YOUR OFFICE. It's important to maintain a professional image, so make sure your office " +
		       "has tobacco-stained walls, a door with a glass panel with your name on so it reads " +
		       "backwards from the inside, and ideally a faint smell of bad liquor. Rent\'s high, so " +
		       "save spondoolies by living there too. You can get a Murphy bed that folds up into a bookcase &ndash; " +
		       "way classier than a mattress under your desk, and the dames love it. Or the guys. " +
		       "Whatever gums your shoe.";
	} else if(in_scope('tony')) {
		hint = "PIZZA CHEFS. These are some of the most important birds in existence, keeping gumshoes like you fed and nourished. \
		        Be nice to them.";
	} else if(in_scope('mrs_macdonald')) {
		hint = "DAMES. Prone to walk into your office and demand you find missing husbands. Nine times outta ten, \
		        when you find him, the dame don't wanna know.";
	} else if(in_scope('brinkman')) {
		hint = "CORRUPT SENATORS. These guys hang out in shady basements wearing overcoats and fedoras. They can be dangerous people to \
			cross, so watch it.";
	} else if(in_scope('gianni')) {
		hint = "GOONS. Often hang around in pairs, which will consist of a talkative skinny guy and " +
		       "a big dumb muscly guy. They can be quick to anger.";
	} else if(Game.hero_location == 'speakeasy' || Game.hero_location == 'funeral_directors' || Game.hero_location == 'speakeasy_office'|| Game.hero_location == 'louisiana_and_3rd') {
		hint = "SPEAKEASIES. Illicit drinking joints. A crucial part of the American economy since Prohibition came in. "
		       "Frequented by drunkards, strumpets, gangsters and musicians, " +
		       "sometimes all the same people. They usually disguise themselves as some innocuous business. If you look " +
		       "like the law, it can be dead hard to get in. You may have to think inside the box.";
	} else if(Game.hero_location == 'hospital_ward' || Game.hero_location == location_of('hospital')) {
		hint = "HOSPITALS. You're liable to end up here more than a few times in your career. Try not to " +
		       "let it get to you. They'll patch you up and bill you for what they can.";
	} else if(loc.is_cardicci_house || Game.hero_location=='cardicci_lawn' || Game.hero_location=='cardicci_backlawn') {
		hint = "MOBSTERS' MANSIONS. If you're casing out a mobster's mansion, try not to make too much " +
		       "noise. They ain't heavy sleepers. Soft footwear is recommended.";
	} else if(Game.hero_location=='swamp' || in_scope('still')) {
		hint = "MOONSHINERS. These folks live in the mountains and possess the arcane secret of " +
		       "mixing booze out of whatever they can grow. In this era of Prohibition, their products " +
		       "are valued by bootleggers for resale to city speakeasies.";
	} else if(Game.hero_location=='trail') {
		hint = "RURAL AREAS. These are really not the jurisdiction of the hardboiled detective. " +
		       "Areas between lousy crime-infested cities exist only to separate one lousy " +
		       "crime-infested city from the next. Prepare yourself before interacting with any " +
		       "rural people &ndash; they may be unsettlingly friendly.";
	} else if(Game.hero_location=='law_firm'||in_scope('law_firm')) {
		hint = "LAW FIRMS. Stuffy outfits with which you'll occasionally need to deal. May be populated " +
		       "by uptight lawyers and frustrated secretaries on low wages who quietly hate each other.";
	} else if(Game.hero_location=='police_department'||in_scope('police_department')||Game.hero_location=='cell'||in_scope('garroway')||in_scope('lieutenant')) {
		hint = "COPS. At the time of going to press, the going rate for bribing a police officer is " +
		       "ten smackers. They can be useful &ndash; but never turn your back on 'em.";
	} else if(Game.hero_location=='taxi' || in_scope('taxi')) {
		hint = "TAXIS. Save on shoe leather by getting yellow cabs to your snooping spots. You'll need mazuma, though.";
	} else if(hero_location().is_sewer) {
		hint = "SEWERS. Occasionally a dirty job will lead to you having to sneak through these. If you do so without a map, you\'re \
			liable to get lost. If you need to get out, just head upwards.";
	} else if(hero_location().is_college) {
		hint = "COLLEGES. These are the hotspots of intellectualism where the brightest young minds of the age congregate \
			to wear stupid clothes, drink, and sleep through a few lectures. College kids are impressionable and prone to fads. \
			They generally respect avoid the professors, who they are mortally afraid might teach them something.";
	} else if(hero_location().is_distain_house) {
		hint = "OLD HOUSES. These are full of dust, creaky doors and &ndash; sometimes &ndash; old treasures. Check underneath, \
			because nine times out of ten there's a network of secret tunnels.";
	} else if(hero_location().is_tunnel) {
		hint = "ABANDONED MINE TUNNELS. These can be a handy way to get around, especially if there's an old minecart handy. Keep \
			your eyes peeled for signs of underhand activity, as they're often used by criminal types.";
	} else if(Game.hero_location=='fishing_boat') {
		hint = "BOATS. Detectives are more at home on dry land, but now and then your investigations might take you onto a boat. \
			Try not to fall out. At a pinch, they can be a quick way to leave town in an emergency.";
	} else if(in_scope('corpse')) {
		hint = "CORPSES. If you find one of these, be careful, especially if it's one of your former clients. \
			You're likely to end up getting framed.";
	} else if(Game.hero_location=='pawn_shop') {
		hint = "PAWN SHOPS. These can be a source of moolah for the hard-up detective. You can always get your stuff back if you \
			need it.";
	}


	if(hint) {
		say("I flip through the book, and an entry catches my eye:");
		say('"' + hint + '"');
	} else {
		say("I flip through the book but I can't find anything relevant.");
	}

	return true;
});

add_rule('before', 'drop', 'book', function() {
	if(Game.hero_location == 'my_office' && Game.things.murphy_bed.stowed) {
		take_away('book');
		put('book', 'my_office');
		say("Ok. I put it on the bookcase.");
		Game.things.book.on_bookcase = true;
		Game.things.book.description = 'book titled "1001 Detectiving Tips" (on bookcase)';
		return true;
	}

	return false;
});

/*
 * Mrs Macdonald, the dame
 */

Game.things.mrs_macdonald = {
	name: "dame",
	description: "flustered dame",
	location: 'office_building',
	is_alive: true,
	pronouns: female_pronouns,
	active_verbs: ["talk"],
	met_name: "Mrs Macdonald",
	met_description: "Mrs Macdonald",

	conversifier: function() {
		return conv_mrs_macdonald();
	},
	image: "res/img/mrs_macdonald.png",
	image_height: "183",
	image_width: "175",
	always: function() {
		do_mrs_macdonald();
		check_finale('mrs_macdonald');
	}
};
function do_mrs_macdonald() {
	if(in_scope('mrs_macdonald') && hero_location().is_macdonald_house && !Game.things.mrs_macdonald.said_house) {
		say('"Why, come in, Mr Rose," says Mrs Macdonald drily. "Show yourself around."');
		Game.things.mrs_macdonald.said_house = true;
	}
}
add_rule('before', 'talk', 'mrs_macdonald', function() {

	if(location_of('mrs_macdonald')=='office_building' && (location_of('wexler')=='my_office' || location_of('marcus')=='my_office')) {
		if(!Game.things.mrs_macdonald.met) {
			say('"How do you, Miss..."');
			say('"Mrs Macdonald," she answers smoothly.')
			meet('mrs_macdonald');

			say('"I have a client in my office right now," I tell her. "If you\'d care to wait, \
				I\'ll be with you as soon as I can."');
		} else {
			say('"Sorry for the wait, Mrs Macdonald," I tell her. "I got someone in my office right now. \
				I\'ll be with you as soon as I can."');
		}
		return true;
	}

	return false;
});
function conv_mrs_macdonald() {
	var conv = {};
	var office_occupied = location_of('wexler')=='my_office' || location_of('marcus')=='my_office';

	if(location_of('mrs_macdonald')=='office_building') {
		conv.start_conversation = function() {
			if(Game.things.mrs_macdonald.met) {
				say('"Step into my office, Mrs Macdonald," I tell her. She steps in, and I follow.');
			} else {
				say('"Step into my office, Miss..."');
				say('"Mrs Macdonald," she says smoothly. She steps in, and I follow.');
				meet('mrs_macdonald');
			}
			put('mrs_macdonald', 'my_office');
			put_hero('my_office', true);

			open_case('The Big Pickle');

			say('"It\'s my husband," says the dame. "He\'s been missing five days now. Please find him, Mr Rose. \
			     I\'ve heard you\'re the &ndash; well, I\'ve heard you\'re a detective."');
		}
	} else {
		conv.start_conversation = "Mrs Macdonald looks at me with eyes that don\'t give anything away.";
	}

	conv.asks = {};

	if(case_open("The Big Pickle")) {
		conv.asks.husband = function() {
			say('"Tell me a little about your husband," I say.');
			say('"He\'s Professor Gilbert Macdonald," she says. "You know, the food scientist. Runs a lab at Corndale College. \
				 We\'ve been married six years. I last saw him when he left for work five days ago."');
			Game.things.mrs_macdonald.mentioned_husband = true;
			add_taxi_destination('Corndale College', location_of('college_campus'));
		};

		if(!hero_location().is_macdonald_house) {
			conv.asks.home = function() {
				say('"Where do you and ' + (Game.things.mrs_macdonald.mentioned_husband ? 'the Professor' : 'your husband') + ' live?" I ask.');
				say('"In Princeley Heights," she says. "By Louisiana street.' +
					(Game.things.notepaper.got ? '"' : (give_hero('notepaper'), Game.things.notepaper.got = true, ' Here," she says. \
					She takes out a sheet of notepaper and a fountain pen, writes an address, and hands me the paper.')));
			};
		}

		conv.asks["another woman"] = function() {
			say('"Please don\'t take this the wrong way," I say, "but the usual reason, when a husband goes missing &ndash;"');
			say('Mrs Macdonald shakes her head. "Not Gilbert. He wouldn\'t do that to me. Besides, no other woman would have him."');
		};

		if(Game.vars.discovered_mrs_m_science) {
			conv.asks.science = function() {
				var txt = '';
				if(held('science_notebook') && Game.things.science_notebook.read) {
					txt = 'I wave the scientific notebook in front of Mrs Macdonald.';
				} else {
					txt = '"Forgive me, but I took a peep at your drawers," I tell her.';
				}
				say(txt + ' "Been taking an interest in the Professor\'s work, have you?"');
				say('She glares. "I guess you may as well know &ndash; he\'s no scientist. Barely knows the difference between a monoglyceride and a phospholipid. \
					 The college board gave him the job as a courtesy because his old man  \
					 funded the place. He gets a lab to sit in and do crossword puzzles. I can tell you\'ve been wondering \
					 why I married him &ndash; that\'s why. Those antiques would never employ a woman scientist, so I get to \
					 do my research and publish it under his name. What difference does it make, anyway?"');
				say('"I don\'t know," I say. "Not much of a chemist myself. What are you working on, anyway?"')

				Game.vars.confronted_mrs_m_science = true;

				if(Game.things.mrs_macdonald.admitted_about_hamburger) {
					say('"The hamburger," she says. "I suppose Gilbert\'s disappearance might have something to do with it."');
				} else {
					say('"Never you mind," she snaps. "It\'s not relevant."');
				}

			};
		} else if(Game.things.mrs_macdonald.mentioned_husband) {
			conv.asks["her husband's work"] = function() {
				say('"Can you tell me any more regarding your husband\'s work at Corndale?" I say to her.');
				say('"He\'s worked there for twenty years, since long before I met him," she tells me. "For the last three years, he\'s been working on a top secret project. \
					 He never told me anything about it. Just kept saying he was on to something big."');
			};
		}

		if(Game.vars.found_hamburger) {
			conv.asks.sandwich = function() {

				if(held('hamburger')) {
					say('"What can you tell me about this?" I ask, holding out ' + the_thing('hamburger') + ".")
				} else if(Game.things.hamburger.asked_once) {
					say('"Let\'s try again," I say. "What is ' + (held('hamburger') ? 'this' : ((carried('hamburger') ? 'this' : 'that') + ' weird sandwich') ) + '?"');
				} else {
					say('"What do you call that weird round sandwich I saw in your refrigerator?" I ask.');
				}

				// her answer depends on Game.vars.discovered_mrs_m_science
				if(!Game.vars.confronted_mrs_m_science) {
					say('"I\'ve no idea," she says with a flutter of her eyes. "Some piece of science my husband\'s working on, perhaps."');
					Game.things.hamburger.asked_once = true;
				} else {
					say('"All right," she says coolly. "It\'s called a hamburger. A revolutionary advancement in \
						  culinary technology! One cow can be ground up into eight thousand of these. They can be cooked in forty-five seconds, \
						  and eaten in less." Her eyes flash. "We are about to enter a new era, Mr Rose &ndash; the era of fast food! \
						  Stuffy restaurant meals will be a thing of the past! No more lounging around making idle chat with your friends \
						  while you wait for your supper. No more obsequious waiters, no more pretentious menus! Just get in, eat your \
						  damn hamburger and get out!"');
					Game.things.mrs_macdonald.admitted_about_hamburger = true;
					Game.vars.done_hamburger_speech = true;
					Game.things.hamburger.name = "hamburger";
					Game.things.hamburger.description = Game.things.hamburger.bitten ? "hamburger (partly eaten)" : "hamburger";
					say('"I see," I say. "And was everybody as thrilled about this \'fast food\' revolution as you?"');
					say('"Well, no," she says. "Gilbert got some hate mail. Chefs, restaurateurs, food snobs. Jealous." She stops. \
						 "You don\'t think that might have something to do with his disappearance?"');
					Game.things.mrs_macdonald.mentioned_hatemail = true;
				}

			}

			if(Game.things.mrs_macdonald.mentioned_hatemail) {
				conv.asks["hate mail"] = function() {
					say('"This hate mail," I say. "You coulda mentioned it earlier. I\'d be interested to read it."');
					say('"He said he just left it in his pigeonhole at work," she replies.' + (Game.things.mailbox_key.given ? '' :
						' "Here, I\'ll give you a key." \
						 She rummages in her d&eacute;colletage, pulls out a small mailbox key, and hands it to me.'));
					give_hero('mailbox_key');
					Game.things.mailbox_key.given = true;
				};
			}
		}


		if(at('my_office')) {
			conv.asks.money = function() {
				say('"Now, my fees..." I begin.');
				if(!Game.things.mrs_macdonald.paid_100) {
					say('"A hundred now, and a hundred when you finish," says ' + the_thing('mrs_macdonald') + ', handing me a crisp bill.');
					say('That\'s twice what I would have taken. I try not to let her see that.');
					get_money(100);
					Game.things.mrs_macdonald.paid_100 = true;
				} else {
					say('"I though we\'d agreed about that," she says.');
				}
			};
		};
	}

	if(case_closed('The Big Pickle') && !Game.things.mrs_macdonald.settled) {
		conv.asks.money = function() {
			say('"My fee..." I begin.');
			if(Game.things.mrs_macdonald.paid_100) {
				say('"Here\'s your other hundred," says Mrs Macdonald. "Goodbye, Mr Rose, and thanks."');
				get_money(100);
			} else {
				say('"Here\'s a hundred and fifty," says Mrs Macdonald. "Goodbye, Mr Rose, and thanks."');
				get_money(150);
			}
			Game.things.mrs_macdonald.settled = true;
		}
	}

	conv.end_conversation = function() {
		say("Mrs Macdonald gives a sardonic smile.");
	}

	return conv;
}

Game.things.mailbox_key = {
	name: "key",
	description: "mailbox key",
	portable: true,
	value: 0.25,
};

Game.always.push(function() {
	mrs_m_wander();
});
function mrs_m_wander() {
	// have Mrs Macdonald wander around her own house

	if(num_cases_closed() == 3 && !case_open("A Twisty Little Murder")) {
		return;
	}

	if(Game.talking_to == 'mrs_macdonald' || Game.things.mrs_macdonald.keep_still) {
		Game.things.mrs_macdonald.keep_still = false;
		return;
	}

	var mrs_m_loc = location_of('mrs_macdonald');

	if(mrs_m_loc!='' && Game.rooms[mrs_m_loc].is_macdonald_house && !pick(4)) {

		// choose a random direction that leads to another is_macdonald_house location

		var moves = [];
		for(direction in Game.rooms[mrs_m_loc].directions) {
			var dest = Game.rooms[mrs_m_loc].directions[direction];
			if(Game.rooms[dest].is_macdonald_house) {
				moves.push([direction, dest]);
			}
		}

		//console.log('moves is ' + moves.join(','));

		var move = pickOne(moves);

		//console.log('move is ' + move);

		if(mrs_m_loc==Game.hero_location) {
			say("Mrs Macdonald walks " + move[0] + ".");
		}
		put('mrs_macdonald', move[1]);
		if(move[1]==Game.hero_location) {
			say("Mrs Macdonald arrives from " + the_opposite_dir(move[0]) + ".");
		}

	}

};

Game.things.notepaper = {
	description: "sheet of notepaper",
	portable: true,
	value: 0,
	active_when_carried: ["read"],
	before: {
		read: function() {
			return set_notepaper_writing();
		},
	},
}
function set_notepaper_writing() {
	Game.things.notepaper.writing = "Professor and Mrs G. R. Macdonald\n" +
	                                          Game.vars.macdonalds_house_no + " Princeley Blvd (at Louisiana Street)\n\
											  Princeley Heights, New Losago";
	reveal_macdonald_house();
	return false;
}


Game.things.office_building = {
	name: "office",
	description: "office building",
	location: 'maine_and_3rd',
	active_verbs: ["enter"],
	enter_to: 'office_building',
};
Game.rooms.office_building = {
	description: "I'm in a dimly lit office building.",
	music: 'saxloopmusic',
	indoors: true,
	directions: {
		out: 'maine_and_3rd',
	}
};
Game.things.office_door_outside = {
	location: 'office_building',
	name: "office door",
	description: 'door reading "PRIVATE DETECTIVE"',
	active_verbs: ["enter"],
	enter_to: 'my_office'
};


Game.rooms.maine_and_3rd.always = function() {
	has_payphone();
};

function has_payphone(taxi_stop) {
	put('payphone', Game.hero_location);
};

/* On_hold.push(function() {
	activate_if_held('payphone', 'call_taxi', 'money');
}); */

Game.things.wexler = {
	description: "rat-faced man",
	is_alive: true,
	pronouns: male_pronouns,
	name: "rat-face",
	location: "office_building",
	active_verbs: ["talk"],
	before: {
		talk: function() {
			return talk_wexler();
		}
	},
	conversifier: function() {
		return conv_wexler();
	},
	image: "res/img/wexler.png",
	image_height: "183",
	image_width: "175",
	always: function() {
		check_finale('wexler');
	}
};
Game.always.push(function() {
	move_clients();
});
function move_clients() {
	var awayFromOffice = (Game.hero_location != 'my_office' &&
	                      Game.hero_location != 'office_building' &&
	                      Game.hero_location != location_of('office_building'));

	if(!awayFromOffice) {
		return;
	}

	if(!Game.vars.moved_wexler && location_of('wexler')=='my_office') {
		set_fuse('wexler_home', 8);
		put('note_from_wexler', 'my_office');
		Game.vars.moved_wexler = true;
	}

	if(!Game.vars.moved_mrs_macdonald && location_of('mrs_macdonald')=='my_office') {
		hide('mrs_macdonald');
		set_fuse('mrs_macdonald_home', 10);
		if(!Game.things.notepaper.got) {
			put('notepaper', 'my_office');
		}
		Game.vars.moved_mrs_macdonald = true;
	}

	if(!Game.vars.moved_marcus && location_of('marcus')=='my_office') {
		hide('marcus');
		set_fuse('marcus_home', 6);
		put('business_card', 'my_office');
	}
}

Game.fuses.wexler_home = {
	explode: function() {
		put('wexler', 'wexlers_apartment');
		if(Game.hero_location == 'wexlers_apartment') { // can't happen!
			console.log('Wexler came home but hero was already there?');
			say('The door opens and Wexler walks in. "There might be a bug," he says, lowering his voice.');
		} else if(Game.hero_location == 'apartment_building_k2') {
			say('Wexler walks in from outside, unlocks the door to ' + (in_scope('wexlers_apartment') ? 'his apartment' : 'one of the apartments') +
				' and enters, shutting the door behind him.');
			reveal_wexlers_apartment();
		} else if(Game.hero_location == 'kentucky_and_2nd') {
			say('Wexler arrives from the south, gives me a nervous look, and walks into the apartment building.');
		}
	},
};

Game.things.business_card = {
	name: "business card",
	description: "business card",
	portable: true,
	active_when_carried: ["read"],
	writing: "Marcus Q Distain\n\
			The Old House\n\
			Nebraska Street and Second Avenue, New Losago",
};
Game.fuses.marcus_home = {
	explode: function() {

		put('marcus', 'distain_study');
		if(Game.hero_location == 'distain_study') {
			say("I hear the creak of the front door, then Marcus Q Distain walks into the room.");
		} else if(Game.hero_location=='distain_hallway') {
			say("The front door creaks open. Marcus Q Distain enters the house, gives me a gawp of recognition, then hurries west.");
		} else if(Game.hero_location=='nebraska_and_2nd') {
			say("Marcus Q Distain walks up from the east, gives me a gawk of recognition, then carefully pushes open the front door of the \
				dilapidated house and walks inside.")
		} else if(hero_location().is_distain_house) {
			say("I hear the front door creak open and shut, and footsteps " +
				((Game.hero_location=='distain_ladder_bottom' || Game.hero_location=='cellar') ? 'above me' : 'in the hall') + ".");
		}
	},
}

Game.fuses.mrs_macdonald_home = {
	explode: function() {
		put('mrs_macdonald', 'macdonald_parlor');
		if(Game.hero_location == 'macdonald_foyer') {
			say('The front door opens and Mrs Macdonald comes in. She gives me a resigned look, and walks north.');
		} else if(Game.hero_location == 'macdonald_parlor') {
			say('I hear the front door open, and a moment later Mrs Macdonald walks into the room. She gives me a resigned look.' );
		} else if (hero_location().is_macdonald_house) {
			say('I hear the front door open, and the clicking of a woman\'s footsteps ' +
				(Game.hero_location=='macdonald_kitchen' ? 'in the parlor' : 'downstairs') + '.');
		} else if(Game.hero_location == 'louisiana_and_princeley') {
			if(!in_scope('taxi')) {
				put('taxi', 'louisiana_and_princeley');
				say('A yellow cab pulls up.');
			} else {
				say('The cabs pulls up by the sidewalk.');
			}
			if(!in_scope('macdonald_house')) {
				say('Mrs Macdonald gets out of the taxi, gives me a resigned look, and walks into one of the houses.');
				reveal_macdonald_house();
			} else {
				say('Mrs Macdonald gets out of the taxi, gives me a resigned look, and walks into her house.');
			}
		}
	}
};

Game.things.note_from_wexler = {
	name: "note",
	description: "note from Wexler",
	portable: true,
	value: 0,
	active_when_carried: ["read"],
	writing: "Mr Rose &ndash;</p><p>\"Thanks for taking on my case. When you\'re done, come see me at my place &ndash; Apt. #APT_NO#, Kentucky & 2nd, West New Losago.</p><p>\"Wexler.",
}
add_rule('after', 'read', 'note_from_wexler', function() {
	if(!is_lit(Game.hero_location)) {
		return true;
	}
	reveal_wexlers_apartment();
})
function set_wexlers_apt_no() {
	if(!Game.vars.wexlers_apt_no) {
		var n = 200 + pick(100);;
		Game.vars.wexlers_apt_no = n;
		Game.things.note_from_wexler.writing = Game.things.note_from_wexler.writing.replace('#APT_NO#', n);
		Game.things.wexlers_apartment.description = "apartment " + n;
	}
}

enter_from('apartment_building_k2', 'kentucky_and_2nd');
Game.things.apartment_building_k2.name = "apartments";
Game.things.apartment_building_k2.description = "shoddy apartment building";

Game.rooms.apartment_building_k2 = {
	description: "I'm in a shoddy apartment building.",
	indoors: true,
	directions: {
		out: "kentucky_and_2nd",
	},
};
Game.things.apartments_k2 = {
	description: "apartments",
	location: "apartment_building_k2",
};
Game.things.wexlers_apartment = {
	name: "apartment",
	description: "apartment ",
	active_verbs: ["enter"],
	before: {
		enter: function() {
			return knock_wexler();
		}
	},
	enter_to: "wexlers_apartment",
};
function knock_wexler() {
	if(location_of('wexler')=='wexlers_apartment') {
		if(num_cases_closed()==3 && !case_open("A Twisty Little Murder")) {
			say("I knock on the apartment door. There'\s no answer, but the door\'s ajar. I let myself in.");
			put_hero('wexlers_apartment');
			return true;
		} else {
			say("I knock on the apartment door. Wexler answers, and ushers me in.");
			put_hero('wexlers_apartment');
			return true;
		}
	} else {
		say("I knock on the apartment door, but there's no answer, and it\'s locked.");
		return true;
	}
}
Game.rooms.wexlers_apartment = {
	indoors: true,
	description: "I'm in a cheap-looking, sparsely furnished apartment.",
	directions: {
		out: 'apartment_building_k2',
	},
};
function reveal_wexlers_apartment() {
	put('wexlers_apartment', 'apartment_building_k2');
	add_taxi_destination("Wexler's apartment", "kentucky_and_2nd");
}

function talk_wexler() {
	if(location_of('wexler')=='office_building') {

		if(location_of('mrs_macdonald')=='my_office' || location_of('marcus')=='my_office') {
			say('"I got someone in my office right now," I tell him, "but if you\'d care to wait, I\'ll be with you as soon as I can."');
			hide_conversation();
			return true;
		}

		say('"Step into my office and we\'ll talk," I tell the rat-faced man. He adjusts his tie and nervously walks in.');
		put('wexler', 'my_office');
		say('I follow him in, and close the door.');

		open_case('Speakeasy Street');

		put_hero('my_office', true);
		return false;
	}

	return false;
}

function conv_wexler() {

	var conv = {};
	conv.end_conversation = "Wexler nods and shuts up.";

	conv.asks = {}

	conv.start_conversation = function() {

		if(!Game.things.wexler.introduced) {
			Game.things.wexler.name = 'Wexler';
			Game.things.wexler.description = 'Wexler';
			Game.things.wexler.proper_name = true;
			Game.things.wexler.introduced = true;
			say('"What can I do for you?" I ask the guy.');
			say('"Mr Rose," he squeaks, "my name is Wexler. My employer would very much like to speak with you. There\'s a somethin\' needs lookin\' into, ' +
			 'see, and let\'s say they don\'t want to go through the official channels on this one."');
		} else {
			say('Wexler\'s ratty face twitches in my direction.');
			if(Game.vars.failed_cases.indexOf("Speakeasy Street")!=-1) {
				say('"Mr Rose," he says, "will you reopen my case?"');
			}
		}
	};

	if(Game.vars.failed_cases.indexOf("Speakeasy Street")!=-1) {
		conv.says = {
			yes: function() {
				say('"Sure," I tell him. "I ain\'t lettin\' a minor setback stop me gettin\' to the bottom of this."');
				open_case('Speakeasy Street');
				say('"Thank you, Mr Rose," says Wexler with a toothy smile.');
			},
			no: function() {
				say('"No way," I tell him.');
				say('Wexler looks disappointed. "Well, if you change your mind, you know where to find me."');
				hide_conversation();
			},
		};
		return conv;
	}

	if(Game.vars.closed_cases.indexOf("Speakeasy Street")!=-1) {

		conv.asks.money = function() {

			say('"Well, Mr Wexler, I got to the bottom of that little supply problem," I say.');

			if(Game.things.wexler.paid_100) {
				say('"Uh, yeah," says Wexler slowly. "I already paid you. I\'m grateful."');
			} else if(Game.things.maryjoloubelle.gone) {
				say('"Yeah, I heard," says Wexler bitterly. "Now the Mozart of moonshine is off ' +
				    'followin\' her heart, an\' we all gotta drink that possum punch till Prohibition ' +
				    'is over. Thanks for nothin\'. No win, no dough."');
				say('I can\'t really argue. Sometimes you just gotta take the ethical victory. It don\'t pay the rent, but it does feel kinda good.');

			} else if(Game.things.wexler.paid_50) {
				say('"I heard," says Wexler. "Well done, Mr Rose. Here\'s your other fifty."');
				say('I pocket the bill. "Pleasure doin\' business," I tell him.');
				get_money(50);
				Game.things.wexler.paid_100 = true;

				hide_conversation();
			} else {
				say('"I heard," says Wexler. "Well done, Mr Rose. Here\'s fifty dollars."');
				say('"He hands over a grubby bill. It\'s not much of a fee &ndash; guess I ought to have ' +
				    'negotiated up front &ndash; but he don\'t look like a man who can afford much more. ' +
				    'I pocket the bill and thank him.');
				get_money(50);
				Game.things.wexler.paid_100 = true;

				hide_conversation();
			}
		}

		return conv;

	}

	if(!Game.things.wexler.said_employer) {
		conv.asks.employer = function() {
			say('"Your employer?" I ask.');
		 	say('"These guys," says Wexler, and gives me a handbill.');
		 	give_hero('handbill');
		 	Game.things.wexler.said_employer = true;
	 	};
 	} else {
	 	conv.asks.employer = '"The, er, funeral directors on Louisiana and 3rd. Tell \'em I sent you."';
 	}

 	if(case_open('Speakeasy Street')) {
	 	conv.asks.money = function() {
		 	if(!Game.things.wexler.paid_50) {
			 	say('"Now," I say. "About my rates..."');
			 	say('"Fifty now, and fifty when you finish the job," he says.');
			 	say('It\'s acceptable, so I accept.');
			 	get_money(50);
			 	Game.things.wexler.paid_50 = true;
		 	} else {
			 	say('"I already gave you fifty," says Wexler. "No more till you finish."');
		 	};
	 	}
 	}

	return conv;
}

Game.things.handbill = {
	portable: true,
	value: 0,
	active_when_carried: ["read"],
	before: {
		read: function() {
			return read_handbill();
		}
	}
}
function read_handbill() {
	if(!is_lit(Game.hero_location)) {
		say("It's too dark to read!");
		return true;
	}

	say("It's a handbill for a funeral directors on Louisiana and 3rd. The blurb reads:");
	say("\"We know that losing a loved one can");
	say("have difficult consequences and be");
	say("hard to deal with. It can get our");
	say("spirits down. That's why all of us");
	say("at Marlotte &amp; Jenkins will do");
	say("our very best for you. Come in and");
	say("speak to us and we'll make it");
	say("easy.\"");
	Game.things.handbill.read = true;

	add_taxi_destination('funeral directors', 'louisiana_and_3rd');

	if(!Game.things.wexler.gave_billhint && location_of('wexler')==Game.hero_location) {
		say('"Your employer is a funeral director?" I ask Wexler. "What\'s so hush-hush about that?"');
		say('Wexler\'s mouth twitches. "Just read the first word on every line," he says.');
		Game.things.wexler.gave_billhint = true;
	}

	return true;
}


Game.rooms.maine_and_4th.always = function() {
	Game.things.tony.building_pizza = false;
}

enter_from('italian_restaurant', 'maine_and_4th');
Game.things.italian_restaurant.is_taxi_destination = true;
Game.things.italian_restaurant.name = "Italian restaurant";
Game.things.italian_restaurant.description = "Italian restaurant";
Game.rooms.italian_restaurant = {
	description: "I'm in an Italian restaurant.",
	music: "italianmusic",
	indoors: true,
	directions: {
		out: 'maine_and_4th',
	},
	before: {
		depart: function(dir) {
			if(dir=='out' && in_scope('professor_macdonald')) {
				say('The Professor grabs me. "Don\'t leave me alone with that maniac!" he pleads.');
				return true;
			}
			return false;
		}
	}
};
Game.things.restaurant_tables = {
	name: "tables",
	description: "tables",
	location: "italian_restaurant",
}
Game.things.restaurant_chairs = {
	name: "chairs",
	description: "chairs",
	location: "italian_restaurant",
}

Game.things.tony = {
	description: "pizza chef",
	name: "chef",
	met_name: "Tony",
	met_description: "Tony Pepperoni",
	is_alive: true,
	location: 'italian_restaurant',
	pronouns: male_pronouns,
	active_verbs: ["talk", "buy_pizza"],
	reacts: function(thing) {
		tony_sees(thing);
	},
	image: "res/img/tony.png",
	image_height: "183",
	image_width: "175",
	conversifier: function() {
		return conv_tony();
	}
};
function conv_tony() {
	var conv = {
		start_conversation: function() {
			say('"What can I do for you, signore?" says ' + the_thing('tony') + ' brightly.');
		},
		asks: {},
	};

	if(Game.things.tony.building_pizza) {
		conv.says = {};

		['artichoke', 'beef', 'black olives', 'chicken', 'corn', 'eggplant', 'garlic', 'green bell pepper', 'green olives',
		 'ham', 'hot sauce', 'chilies', 'mushrooms', 'onion', 'oregano', 'pineapple', 'red bell pepper', 'shrimp', 'spicy salami',
		 'spinach'
		].forEach(function(topping) {
			conv.says[topping] = eval("f = function(){ add_topping('" + topping + "'); }"); // yuck
		});

		conv.end_conversation = function() {
			say('"You wait ten minutes, signore!" says ' + the_thing('tony') + ', and disappears into the kitchen.');
			hide('tony');
			Game.things.tony.building_pizza = false;
			set_fuse('pizza_cooking', 10);
		}

		return conv;
	}

	conv.asks.himself = function() {
		say('"Tell me about yourself," I say to the guy.');
		say('"My name is Tony Pepperoni," says ' + the_thing('tony') + '. "I am born in Italy. Alla my life I dream of running a restaurant. \
		     But everyone in Italy is a better cook than Tony! So I move to America."');
		meet('tony');
	};

	return conv;
}
function add_topping(topping) {

	if(Game.things.pizza.toppings.indexOf(topping)!=-1) {
		say('"But you already gotta one of those," says ' + the_thing('tony') + '. "Choose another!"');
		return;
	}

	Game.things.pizza.toppings.push(topping);
	if(Game.things.pizza.toppings.length < 3) {
		if(is_spicy(topping)) {
			if(Game.things.pizza.toppings.length == 2 && is_spicy(Game.things.pizza.toppings[0])) {
				say('"Aha, you really like the spice!" says ' + the_thing('tony') + '. "I make it extra spicy for you. What else?"');
			} else {
				say('"You like the spice, eh?" says ' + the_thing('tony') + '. "Tony no like the spice myself, but I it make for you. \
				What else?"');
			}
		} else {
			say(pickOne([
				'"Excellent choice, signore," says ' + the_thing('tony') + '. "What else?"',
				'"Delicioso!" says ' + the_thing('tony') + '. And?"',
				'"A personal favourite!" says ' + the_thing('tony') + '. What else?"',
			]));
		}
	} else {
		// pizza finished building;
		say('"You wait ten minutes, signore!" says ' + the_thing('tony') + ', and disappears into the kitchen.');
		Game.things.tony.building_pizza = false;
		hide('tony');
		Game.talking_to = '';
		hide_conversation();
		set_fuse('pizza_cooking', 10);

	}
}
function is_spicy(topping) {
	return topping=='hot sauce' || topping=='chilies' || topping=='spicy salami';
}
function pizza_spiciness() {
	var spiciness = 0;
	for(var i=0; i<Game.things.pizza.toppings.length; ++i) {
		if(is_spicy(Game.things.pizza.toppings[i])) {
			++spiciness;
		}
	}
	return spiciness;
}

Game.things.utility_closet = {
	location: "italian_restaurant",
	active_verbs: ["open"],
};
add_rule('before', 'open', 'utility_closet', function() {
	if(in_scope('tony')) {
		say('"Hey!" cries ' + the_thing('tony') + '. "What\'s the matter, you gotta no respect? You stay outta Tony\'s closet!"');
		return true;
	} else if(!held('iron_key')) {
		say("It's locked.");
		return true;
	} else if(Game.vars.rescued_professor) {
		say("It's empty.");
		return true;
	}

	say('The iron key fits in the lock, and the door swings open.');
    // professor falls out!
    say('Out falls a white-haired old man, gagged with a table napkin and bound around the wrists and ankles with strong spaghetti. \
         Professor Macdonald, I presume.');

    put('professor_macdonald', 'italian_restaurant');
    Game.vars.rescued_professor = true;

	return true;
});

Game.things.professor_macdonald = {
	name: "Professor Macdonald",
	description: "Professor Macdonald",
	is_alive: true,
	proper_name: true,
	pronouns: male_pronouns,
	image: "res/img/professor.png",
	image_height: "183",
	image_width: "175",
	tied_up: true,

	active_verbs: ["untie"],
	always: function() {
		do_professor();
	},

	conversifier: function() {
		return conv_professor();
	}
};
function do_professor() {
	if(Game.things.professor_macdonald.tied_up) {
		if(!pick(2)) {
			say(pickOne([
				"Professor Macdonald struggles.",
				"Professor Macdonald makes a muffled plea for assistance.",
				"Professor Macdonald tries unsuccessfully to get his gag off."
			]));
		}
	}
};
add_rule('before', 'untie', 'professor_macdonald', function() {
	say('I remove the napkin and the spaghetti from the Professor.');
	Game.things.professor_macdonald.tied_up = false;
	put('napkin', Game.hero_location);
	put('spaghetti', Game.hero_location);

	deactivate_verb('professor_macdonald', 'untie');
	activate_verb('professor_macdonald', 'talk');
	return true;
});

function conv_professor() {
	var conv = {};

	conv.start_conversation = 'The Professor looks at me. "My wife sent you, I assume? She never could mind her own business."';

	conv.end_conversation = 'The Professor smiles grimly.';

	conv.asks = {};

	if(!Game.things.professor_macdonald.said_what_happened) {
		conv.asks["what happened"] = function() {
			say('"That chef came to my work and grabbed me," says the Professor. "I can only conclude that \
				 he\'s bothered by some of the research my w&ndash; I mean, I\'m conducting. I managed to grab \
				 that key from his pocket and stuff it in my mailbox as he dragged me out."');
			Game.things.professor_macdonald.said_what_happened = true;
		};

		return conv;
	}

	conv.asks.chef = function() {
		say('"How are we going to get away from that chef?" I say.');
		if(!Game.vars.hamburger_gag) {
			say('"He\'ll be out of that kitchen when he\'s finished making your meal," says the Professor. \
			    "We have a few minutes to act."');
			say('"Thank goodness he\'s not cooking hamburgers," I say.');
			say('"Maybe you could set some sort of trap," says the Professor.');
			Game.vars.hamburger_gag = true;
		} else {
			say('"He\'ll be out of that kitchen any minute. Maybe you could set some sort of trap," says the Professor.');
		}
	}

	return conv;
}

Game.things.napkin = {
	portable: true,
	value: 0,
};
Game.things.spaghetti = {
	portable: true,
	value: 0,
	active_when_carried: ["eat"],
	always: function() {
		do_spaghetti();
	}
};
function do_spaghetti() {
	set_active('spaghetti', 'tie', carried('spaghetti') && Game.hero_location == 'italian_restaurant');
}
add_rule('before', 'tie', 'spaghetti', function() {
	say("I tie the spaghetti between the legs of two tables.");
	put('spaghetti', 'italian_restaurant');
	Game.things.spaghetti.portable = false;
	deactivate_verb('spaghetti', 'take');
	Game.things.spaghetti.description = "spaghetti (tied between table legs)";
	Game.things.spaghetti.tied = true;
	return true;
});

Game.fuses.pizza_cooking = {
	burn: function() {

		var alltoppings = Game.things.pizza.toppings.slice();
		alltoppings.push('cheese');
		alltoppings.push('tomatoes');
		var topping = pickOne(alltoppings);

		if(Game.hero_location == 'italian_restaurant' && Game.fuses.pizza_cooking.time < 10) {
			say(pickOne(['From the kitchen, I hear ' + the_thing('tony') + ' singing an Italian anthem.',
			             'I hear a sizzle from the kitchen.',
						 'The smell of ' + topping + ' wafts in from the kitchen.',
						 'From the kitchen, I hear the chop-chop-chop of ' + the_thing('tony') + ' cutting vegetables.',
						 'From the kitchen, I hear the bubble of a boiling saucepan.',
						 'From the kitchen, I hear the creak of a refrigerator door opening.']));
		}
	},
	explode: function() {
		put('tony', 'italian_restaurant');
		if(Game.hero_location == 'italian_restaurant') {

			if(!Game.things.spaghetti.tied) {

				// todo: handle if professor is released

				say(the_thing('tony', true) + ' emerges from the kitchen and serves me a yummy smelling pizza.');
				say('"Sorry about the wait, signore," he says, "but good food takes time."');
				give_hero('pizza');

			} else {
				// spaghetti tripwire trap is armed!

				say(the_thing('tony', true) + ' emerges from the kitchen, carrying a yummy smelling pizza.');
				say('"Sorry about the wait, si-" he begins, then trips over the spaghetti. As he flails to catch his \
				    balance, he pivots around, then falls to the floor on his back.');
				say('The pizza in his hands goes flying, arcs, and falls slice by slice into his gaping mouth.');

				var spiciness = pizza_spiciness();
				if(spiciness == 0) {
					say("He gulps it down happily, gets to his feet and, looking furious, pulls out a rolling pin and \
					     clonks me on the head.");
					say('"Now," I hear his voice say, "I put Signore Professor back in the closet, and you forget, yes?"');
					say("Everything goes black.");
					reset_tony();
					hero_injured();
				} else if(spiciness < 3) {
					say("He sputters and turns " + ((spiciness==1) ? 'slightly' : 'rather') + " pink, but manages to \
					     gulp it down. Furiously, he gets to his feet, pulls out a rolling pin and clonks me on the head.");
					say('"Now," I hear his voice say, "I put Signore Professor back in the closet, and you forget, yes?"');
					say("Everything goes black.");
					reset_tony();
					hero_injured();
				} else {
					say("As he attempts to gulp it down, his eyes widen and his face turns bright red.");
					say('While he lies there, flailing and coughing, I leap on him and pin him down.');
					say('"Go get the cops," I tell the Professor.');

					close_case("The Big Pickle");
					Game.game_time += 15;
					say('Lieutenant Miles arrives, takes a couple of statements, gets us outside, ropes off the restaurant \
					     and drags ' + the_thing('tony') + ' away in handcuffs.');
					say('I guess I should go find Mrs Macdonald and see about getting ' +
						(Game.things.mrs_macdonald.paid_100 ? 'the rest of ' : '') + 'my fee.');
					put_hero(location_of('italian_restaurant'));
					Game.things.italian_restaurant.description = "Italian restaurant (closed)";
					deactivate_verb('italian_restaurant', 'enter');
					for(var thing in Game.things) {
						if(thing != 'spaghetti' && thing != 'napkin' && thing != 'pizza' &&
						   location_of(thing)=='italian_restaurant' && Game.things[thing].portable) {
						   put(thing, 'police_department');
						}
					}
				}

			}


		} else {
			put('pizza', 'italian_restaurant');
		}
	},
}

function reset_tony() {
	put('tony', 'italian_restaurant');
	hide('professor_macdonald');
	hide('napkin');
	hide('spaghetti');
	Game.things.spaghetti.portable = true;
	Game.things.spaghetti.tied = false;
    Game.vars.rescued_professor = false;
	Game.things.spaghetti.description = "spaghetti";
	activate_verb('spaghetti', 'take');
	Game.things.professor_macdonald.tied_up = true;
	deactivate_verb('professor_macdonald', 'talk');
	activate_verb('professor_macdonald', 'untie');
};


Game.things.pizza = {
	portable: true,
	value: 0,
	description: "pizza",
	active_verbs: ["eat"],
	toppings: [],
};
add_rule('before', 'eat', 'pizza', function() {
	take_away('pizza');
	var spiciness = pizza_spiciness();
	say([
		"Delicious!",
		"Delicious, and a little spicy.",
		"I eat the pizza. It's a bit too spicy for my taste.",
		"I eat the pizza. My face turns bright red &ndash; it's ridiculously spicy.",
	][spiciness]);
	return true;
});


enter_from('college_campus', 'ohio_and_5th');
Game.things.college_campus.name = 'campus';
Game.things.college_campus.always = function() {
	add_taxi_destination('Corndale College', location_of('college_campus'));
};

Game.rooms.college_campus = {
	description: "I'm at the north end of a college campus.",
	directions: {
		north: 'ohio_and_5th',
		south: 'college_campus_south',
	},
	before: {
		depart: function(direction) {
			if(direction=='south') {
				return check_students();
			} else {
				return false;
			}
		}
	},
	is_college: true,
	//music: 'stringsloopmusic',
};
Game.things.college_sign = {
	name: "sign",
	description: "sign",
//	location: location_of("college_campus"),
	active_verbs: ["read"],
	writing: "CORNDALE COLLEGE\n\
	          Te in labyrinthum itinera parum torquere",
};

function a_student(caps) {
	var txt = (caps ? 'A ' : 'a ') + (pick(2)? pickOne(["rich-looking ", "well-dressed ", "dapper "]):'') +
	          pickOne(["graduate student", "freshman", "sophomore", "senior"]);
	if(pick(2)) {
		txt += ' with ' + pickOne(["slicked back hair", "a bow tie", "a check jacket", "a crimson jersey", "a striped necktie"]);
	}
	return txt;
}

enter_from('dorm', 'college_campus');
Game.things.dorm.description = "dorm building";

add_rule('before', 'enter', 'dorm', function() {
	return check_students();
});

function check_students() {
	if(in_scope('students')) {

		if(worn('tweed_jacket')) {

			if(held('pipe') && Game.things.pipe.alight) {
				say('The students get out of my way respectfully.');
				put_hero('college_campus_south');
				return true;
			}

			say(a_student(true) + ' blocks my way. "No way, old man," he says with a soapy smile. \
				"I can tell you\'re not a real professor. Those guys all smoke like chimneys' +
				(held('pipe') ? ', and that pipe isn\'t even lit' : '') + '."');
			return true;
		}

		say(a_student(true) + ' blocks my way. "No way, old man," he says with a soapy smile. \
		    "Only the brightest young minds of our generation are allowed in here."');
		return true;
	}

	return false;
}

Game.things.dorm_window = {
	name: "window",
	description: "open window on 2nd floor",
	location: "college_campus",
};

Game.things.flagpole = {
	description: "white-painted flagpole",
	location: "college_campus",
	active_verbs: ["climb"],
	climb_to: 'top_of_flagpole',
}
On_hold.push(function() {
	activate_if_held('flagpole', 'apply_turpentine', 'turpentine');
});
add_rule('before', 'apply_turpentine', 'flagpole', function() {
	if(Game.things.flagpole.paintstripped) {
		say("I already got all the paint off.");
		return true;
	};

	say("I rub some turpentine into the flagpole. The white paint runs off, leaving a rough wooden surface.");
	Game.things.flagpole.description = "rough wooden flagpole";
	Game.things.flagpole.paintstripped = true;
	return true;
});
add_rule('before', 'climb', 'flagpole', function() {
	if(worn('houseshoes')) {
		say("I can\'t climb anything while wearing these goofy houseshoes!");
		return true;
	};

	if(Game.things.flagpole.paintstripped) {
		say("The rough wood is perfect for climbing.");
		return false;
	}

	if(!Game.things.driving_gloves.worn) {
		say("I try to climb the pole, but the paint's too slippery.");
		if(in_scope('students')) {
			say("The college students laugh.");
		}
		return true;
	} else {
		say('The driving gloves help me get a good grip.');
		return false;
	}
});

Game.rooms.top_of_flagpole = {
	description: "I'm up a flagpole on a college campus.",
	directions: {
		down: "college_campus",
	},
	always: function() {
		things_fall_from_flagpole();
		do_fad();
	},
	is_college: true,
};
function things_fall_from_flagpole() {
	for(var thing in Game.things) {
		if(location_of(thing)=='top_of_flagpole' && Game.things[thing].portable) {
			say(the_thing(thing, true) + ' falls to the ground.');
			put(thing, location_of('flagpole'));
		};
	}
}
Game.things.dorms_top = {
	name: "dorms",
	description: "dorms",
	location: "top_of_flagpole",
};
Game.things.open_window_top = {
	name: "window",
	description: "open dorm window on 2nd floor",
	location: "top_of_flagpole",
	active_verbs: ["enter"],
	before: {
		enter: function() {
			return enter_dorm_window();
		}
	},
};
function enter_dorm_window() {
	say("It's too far to reach from here.");
	return true;
}

function do_fad() {
	if(!Game.vars.done_fad) {

		say("I make it to the top of the flagpole and sit down to get my breath.")
		say("The eyes of the college students below goggle up at me.");
		say('"Gee whiz," says ' + a_student() + '. "That bird\'s sitting on a flagpole. He\'s invented a new craze!"');
		say(a_student(true) + ' runs out to the phone booth on the street and dials. "Hey Shipwreck, it\'s your cousin, Marvin Kelly," he says. \
		    "You know that new pointless fad you\'re looking for? Well, listen to this..."');
		say('"Let\'s ALL find flagpoles to sit on," puts in ' + a_student() + '.');
		say('The college students disperse, whooping cheerfully.');

		hide('students');
		Game.vars.done_fad = true;
	}
}


Game.things.students = {
	description: "college students",
	is_alive: true,
	is_plural: true,
	location: "college_campus",
	active_verbs: ["talk"],
	conversifier: function() {
		return conv_students();
	},
	image: "res/img/college-students.png",
	image_height: "183",
	image_width: "175",
};
function conv_students() {

	var conv = {};

	conv.start_conversation = function() {
		say(a_student(true) + ' looks at me disdainfully. "What do you want, grandpa?"');
	}

	conv.asks = {
		college: function() {
			say('"How are you finding it here at Corndale?" I ask.');
			say('"Swell, I guess," says ' + a_student() + '. "Only..." he looks sheepish. "There are no girls."');
			if(!Game.vars.college_gender_note) {
				say("I look along the line of clean young male faces. He's right. This ain't one of those progressive colleges.");
				Game.vars.college_gender_note = true;
			}
		}
	}

	if(case_open("The Big Pickle")) {
		conv.asks["Professor Macdonald"] = function() {
			say('"Any of you boys know a Professor Macdonald who works here?" I ask.')
			say('"I take his food science class, but he hasn\'t been in this week," says ' + a_student() + '. \
			     "Arrogant old guy. Kept telling us we may as well not bother taking notes, because his research \
				 was about to make the whole subject obsolete anyway."');
		};
	}

	conv.end_conversation = "The college students go back to chatting amongst themselves.";

	return conv;
}


Game.rooms.college_campus_south = {
	description: "I'm at the south end of a college campus.",
	directions: {
		north: 'college_campus',
	},
	is_college: true,
}

// enter_from('arts_building', 'college_campus_south');
enter_from('science_building', 'college_campus_south');

/* Game.rooms.arts_building = {
	description: "I'm in an arts building.",
	indoors: true,
	directions: {
		out: 'college_campus_south',
	},
	//music: 'stringsloopmusic',
}; */
Game.rooms.science_building = {
	description: "I'm in the lobby of a science building.",
	indoors: true,
	directions: {
		west: 'science_corridor',
		out: 'college_campus_south',
	},
	is_college: true,
	//music: 'stringsloopmusic',
};
/*
Game.things.department_secretary = {
	description: "department secretary (behind desk)",
	is_alive: true,
	pronouns: male_pronouns,
	active_verbs: ["talk"],
} */

Game.things.science_mailboxes = {
	name: "mailboxes",
	description: "row of staff mailboxes",
	location: "science_building",
}
Game.things.professors_mailbox = {
	name: "mailbox",
	description: "Professor Macdonald's mailbox",
	active_verbs: ["open"],
	contents: ["hate_mail", "italian_menu"], // crossword
};
Game.always.push(function() {
	do_professors_mailbox();
});
function do_professors_mailbox() {
	if(case_open("The Big Pickle")) {
		put('professors_mailbox', location_of('science_mailboxes'));
	} else {
		hide('professors_mailbox');
	}
}
add_rule('before', 'open', 'professors_mailbox', function() {
	if(Game.things.professors_mailbox.unlocked) {
		return false;
	}
	if(!held('mailbox_key')) {
		say("It's locked.");
		return true;
	} else {
		say("The key fits, and the mailbox opens.");
		Game.things.professors_mailbox.unlocked = true;
		return false;
	}
});

Game.things.hate_mail = {
	portable: true,
	value: 0,
	description: "wad of hate mail",
	active_when_carried: ["read"],
}
add_rule('before', 'read', 'hate_mail', function() {
	say('This is a bunch of hate mail addressed to Professor Macdonald of Corndale College. \
	     I pick out a note written in ' + pickOne(['childish handwriting', 'neat capitals', 'crayon', 'letters cut out of magazines']) + '.');
	Game.things.hate_mail.writing = construct_hate_mail();
	return false;
});

function construct_hate_mail() {
	var txt = 'Dear ';

 	txt += pickOne(['Professor', 'Professor Macdonald', 'so-called Professor', 'Lunkhead', 'Idiot', 'Jerk', 'Professor Poophead']) + ', ';

	txt += pickOne(['your \'fast food\' will be the slow death of my business. ',
	                'I hope you choke on your own hamburger. ',
					'your research is an abomination. There are some things mankind was not meant to cook. ']);

	txt += pickOne(['Sincerely', 'Faithfully', 'Screw you', 'With no love']) + ', ';
	txt += pickOne(['?', 'a concerned business owner.', 'Disgusted of New Losago.'])

	return txt;
}
Game.things.italian_menu = {
	name: "menu",
	description: "crumpled restaurant menu",
	active_when_carried: ["read"],
	portable: true,
};
add_rule('before', 'read', 'italian_menu', function() {
	if(!Game.things.italian_menu.uncrumpled) {
		say('I uncrumple the menu to read it. As I do so, an iron key falls out and clatters to the floor.');
		put('iron_key', Game.hero_location);
		Game.things.italian_menu.description = "restaurant menu";
		Game.things.italian_menu.uncrumpled = true;
	};
	say('This is the menu of the Italian restaurant on Maine and 4th, specializing in something called pizza. Looks quite appetizing.');
	add_taxi_destination('Italian restaurant', 'maine_and_4th');
	return true;
});
/*
Game.things.crossword = {
	description: "crumpled newspaper page",
	name: "newspaper",
	portable: true,
	value: 0,
	active_when_carried: ["read"],
	always: function() {
		set_active('crossword', 'show', in_scope('mrs_macdonald'));
	}
};
add_rule('before', 'show', 'crossword', function() {
	say("(to Mrs Macdonald)");
	say('"That\s odd," says Mrs Macdonald. "It\'s not like Gilbert to leave a clue undone. It must be a message." \
	    She pauses, but not for very long. "Maine," she says. "Four down. Maine. Huh."');
	return true;
	Game.things.mrs_macdonald.keep_still = true;
});
add_rule('before', 'read', 'crossword', function() {
	var txt = "This is a page torn out of a newspaper, dated the day that Professor Macdonald went missing. "
	if(!Game.things.crossword.unscrewed) {
		say(txt + "It's been torn off and screwed up, as though it was shoved into the mailbox in a hurry, maybe during a struggle. \
		           I flatten it out.");
		Game.things.crossword.unscrewed = true;
		Game.things.crossword.description = "torn newspaper page";
		say("As I do so, an iron key falls out of the crumples and clatters to the floor.");
		put('iron_key', Game.hero_location);
		txt = '';
	}
	say(txt + "The page consists mainly of a crossword puzzle, all filled out in untidy capitals, except for one clue which has been left unsolved:");
	say('"4 down. Important eastern state (5 letters)"'); // points to Maine and 4th, location of the Italian restaurant.

	return true;
}); */

Game.things.iron_key = {
	name: "iron key",
	description: "iron key",
	portable: true,
	value: 0.25,
};


Game.things.science_faculty_photos = {
	name: 'photographs',
	description: "faculty photographs (on wall)",
	location: 'science_building',
	name: "faculty photos",
	active_verbs: ["look"],
};
add_rule('before', 'look', 'science_faculty_photos', function() {
	var txt = 'A row of tweedy old white men with stern academic faces peer down at me from the wall.';
	if(case_open('The Big Pickle')) {
		txt += ' One of them, pretty much indistinguishable from the others, is labeled "G. Macdonald, Professor Emeritus of Food Science. ';
		if(!Game.things.macdonald_lab.room_number) {
			set_professors_room_number();
		}
		txt += 'Laboratory ' + Game.things.macdonald_lab.room_number + '."';
	}
	say(txt);
	return true;
});
function set_professors_room_number() {
	var roomnumber = (1 + pick(10)).toString() + pickOne(['A','B','C','D']);
	Game.things.macdonald_lab.room_number = roomnumber;
	Game.things.macdonald_lab.name = "lab " + roomnumber;
	Game.things.macdonald_lab.description = "Laboratory " + roomnumber;
	put('macdonald_lab', 'science_corridor');
}

Game.rooms.science_corridor = {
	description: "I'm in a long corridor smelling of formaldehyde.",
	indoors: true,
	directions: {
		east: "science_building",
	},
	is_college: true,
}
Game.things.labs = {
	description: "laboratories",
	location: "science_corridor",
}
Game.things.macdonald_lab = {
	active_verbs: ["enter"],
	enter_to: 'macdonald_lab',
};
Game.rooms.macdonald_lab = {
	indoors: true,
	description: "I'm in a trashed laboratory.",
	directions: {
		out: "science_corridor",
	},
	is_college: true,
};
Game.things.glassware = {
	description: "smashed glassware",
	location: "macdonald_lab",
};
Game.things.broken_belljar = {
	description: "broken belljar labeled PROTOTYPE 1",
	name: "broken belljar",
	portable: true,
	value: 0,
}
add_rule('before', 'take', 'broken_belljar', function() {
	if(!worn('driving_gloves')) {
		say("Ow! I cut myself trying to pick up the broken belljar.");
		put('broken_belljar', Game.hero_location);
		return false;
	}
	return true;
});
Game.things.chalkboard = {
	description: "cracked chalkboard",
	location: "macdonald_lab",
	active_verbs: ["read"],
};
add_rule('before', 'read', 'chalkboard', function() {
	say('The chalkboard has been snapped in two. One of the halves &ndash; the top, I think &ndash; has been scuffed out in whatever \
	     struggle took place here. In a bottom corner of the other half is chalked, in an untidy hand: "Prototype 1 blew up. \
		 Prototype 2 taken home for further study."');
	return true;
});



Game.rooms.dorm = {
	indoors: true,
	description: "I'm in a college dorm.",
	directions: {
		up: 'dorm_2nd_floor',
		out: 'college_campus',
	},
	is_college: true,
};
Game.things.bunk_beds = {
	name: "bunk beds",
	description: "bunk beds",
	location: "dorm",
};
Game.things.mess = {
	location: "dorm",
}
Game.rooms.dorm_2nd_floor = {
	description: "I'm on the second floor of a college dorm.",
	directions: {
		down: 'dorm',
	},
	is_college: true,
};
Game.things.bunk_beds_2 = {
	name: "bunk beds",
	description: "bunk beds",
	location: "dorm_2nd_floor",
};
Game.things.mess_2 = {
	name: "mess",
	description: "mess",
	location: "dorm_2nd_floor",
}
/*
Game.things.spencer = {
	alive: true,
	pronouns: male_pronouns,
	description: "graduate student (asleep in bunk)",
	met_name: 'spencer',
	met_description: "Spencer Briggsborough",
	active_verbs: ["wake"],
	location: 'dorm',
};
add_rule('before', 'wake', 'spencer', function() {
	say("I give the guy a shake. He starts mumbling, opens his eyes, and drags himself out of bed.");
	Game.things.spencer.description = "graduate student",
	activate_verb('spencer', 'talk');
	return true;
}); */




enter_from('funeral_directors', 'louisiana_and_3rd');
Game.things.funeral_directors.description = "funeral director's office";
Game.things.funeral_directors.always = function() {
	add_taxi_destination('funeral directors', 'louisiana_and_3rd');
};
Game.rooms.funeral_directors = {
	indoors: true,
	description: "I'm in a funeral director's office.",
	//music: 'stringsloopmusic',
	directions: {
		out: 'louisiana_and_3rd',
		down: 'speakeasy',
	},
	before: {
		depart: function(dir) {
			return depart_funeraldirectors(dir);
		}
	}
};
function depart_funeraldirectors(dir) {
	if(dir=='down' && in_scope('funeral_clerk') && !Game.vars.allowed_in_speakeasy) {
		say('The clerk stops me. "I can\'t let you go down there, mister," she says.');
		return true;
	}
	return false;
}
Game.things.funeral_stairs = {
	name: "stairs",
	description: "stairs leading down",
	location: "funeral_directors",
};

Game.things.funeral_clerk = {
	name: "clerk",
	description: "clerk (behind counter)",
	location: "funeral_directors",
	is_alive: true,
	pronouns: female_pronouns,
	active_verbs: ["talk"],
	conversifier: function() {
		return conv_funeral_clerk();
	},
	image: "res/img/clerk.png",
	image_height: "183",
	image_width: "175",
};
function conv_funeral_clerk() {
	var conv = { tells: {}, asks: {} };
	conv.start_conversation = 'The girl looks up at me with a bored expression.';

	conv.asks.funerals = function() {
		say('"So, you do funerals?" I ask.');
		say('"Uh... sure," says the girl. "When someone dies, we bury \'em. Or organize someone else ' +
		    'burying them, maybe? I mean, that\'s what we\'re all about here. Funerals. Sure."');
	};
	if(case_open('Speakeasy Street')) {
		conv.tells.Wexler = function() {
			say('"Someone sent me," I explain. "A Mr Wexler."');
		 	say('The girl\'s eyes roll. "Not that guy. Sweet on me. I send him on a few errands ' +
		 	    'and he thinks he works here. I\'m sorry if he\'s wasted your time."');
		}
	}
	if(location_of('hearse')=='louisiana_and_3rd') {
		conv.asks.coffins = function() {
			say('"I couldn\'t help noticing," I say, "there was a hell of a load of coffins in ' +
		        'that hearse out there."');
			say('"They\'re fulla dead people, of course," says the girl. "For the funerals!"');
		}
	}

	if(Game.rooms.speakeasy.visited && !Game.vars.allowed_in_speakeasy) {
		conv.tells.speakeasy = function() {
			say('"Look, doll, I know there\'s a speakeasy down there," I tell her. "I been there. Don\'t worry, I ain\'t the law."');
			say('The girl looks nervous. "If you was a cop you wouldn\'t be allowed to say that, right? Well, I guess, down you go."');
			Game.vars.allowed_in_speakeasy = true;
		}
	}


	conv.end_conversation = 'The girl goes back to doing nothing.';

	return conv;
};

Game.rooms.speakeasy = {
	description: "I'm in a swinging speakeasy.",
	indoors: true,
	music: 'swingmusic',
	directions: {
		up: 'funeral_directors',
	},
	always: function() {
		do_speakeasy();
	}
};
function do_speakeasy() {
	Game.rooms.speakeasy.visited = true;
	if(location_of('vivienne')=='speakeasy_office' && Game.things.vivienne.met) {
		say('Vivienne walks out from the back office.');
		put('vivienne', 'speakeasy');
	}
}
Game.things.bar = {
	location: "speakeasy",
	active_verbs: ["get_drink"],
}
Game.things.tumbler = {
	portable: true,
	value: 0.25,
	description: "empty tumbler",
}

enter_from('speakeasy_office', 'speakeasy');
Game.things.speakeasy_office.name = "office";
Game.things.speakeasy_office.description = "back office";
Game.rooms.speakeasy_office = {
	description: "I'm in a small office.",
	music: 'swingmusic',
	directions: {
		out: "speakeasy",
	},
	indoors: true,
	//music: 'swingmusic',
},
Game.things.viviennes_desk = {
	name: "desk",
	description: "desk with drawers",
	location: "speakeasy_office",
	active_verbs: ["open"],
	before: {
		open: function() {
			return check_open_vivs_desk();
		},
	},
	contents: ["hearse_keys"],
};
function check_open_vivs_desk() {
	if(in_scope('vivienne')) {
		say("Not with the dame standing right there.");
		return true;
	}
	Game.vars.found_keys = true;
	return false;
}
Game.things.hearse_keys = {
	description: "set of car keys",
	portable: true,
	value: 1,
};

Game.things.vivienne = {
	name: "bartender",
	description: "bartender",
	met_name: "Vivienne",
	met_description: "Vivienne",
	is_alive: true,
	pronouns: female_pronouns,
	location: "speakeasy",
	active_verbs: ["talk"],
	conversifier: function() {
		return conv_vivienne();
	},
	image: "res/img/vivienne.png",
	image_height: "183",
	image_width: "175",
}
function conv_vivienne() {
	var conv = { };
	// todo: default conversation stuff when "Speakeasy Street" isn't the open case

	conv.start_conversation = function() {
		if(!Game.things.vivienne.met) {
			meet('vivienne');
			say('"I ain\'t the bartender, I\'m the owner, Vivienne," says the dame. "Now, although it wasn\'t that rodent\'s ' +
			    'place to get you involved, it does so happen there\'s a matter you might help us with. If you\'ve sampled our ' +
			    'wares, you may have noticed that the booze is awful."');
			if(Game.things.booze.tasted) {
				say('"It\'s not bad," I say kindly. And I\'m telling the truth &ndash; it\'s not bad, it\'s terrible.');
			} else {
				say('"It can\'t be that bad," I said. "At least, not worse than most of what you can find these days."');
			}
			say('"Well, she says, "it wasn\'t bad last month. In fact I prided myself on servin\' the best drop a hooch in ' +
			    'New Losago. I wanna know what\'s goin\' on, and I want my good booze back."');
		} else if(case_open('Speakeasy Street')) {
			say('Vivienne looks at me. "Sorted out my supply problem yet?"')
		} else {
			say('Vivienne looks at me.');
		}
	}

	conv.asks = {
		business: function() {
			say('"And how\'s a dame like you get into the speakeasy business?" I ask.');
			say('"Daddy was a funeral director. A real one. I inherited the business the day Prohibition got signed into law, ' +
			    'and I didn\'t want a career luggin\' stiffs around."');
		}
	}
	if(case_open('Speakeasy Street')) {

		conv.asks.suppliers = function() {
			say('"Who supplies you with the booze?" I ask her.');
			say('"Those two goons, Gianni and Luigi, bring it over," says Vivienne. "I think they work for some rich dame over in ' +
			    'Princeley Heights."');
		},
		conv.asks.hearse = function() {
			say('"So," I ask her, "whose idea was the hearse?"');
			if(Game.things.vivienne.looked_for_keys) {
				say('"That came with the business," she says. "It seemed like a good way to smuggle the booze in, so I gave the boys the keys."')
			} else {
				Game.things.vivienne.looked_for_keys = true;
				say('"That came with the business," she says. "It seemed like a good way to smuggle the booze in, so I gave the boys the keys. Hold on, I got a ' +
			    ' spare set somewhere..."');
				if(location_of('hearse_keys')==location_of('vivienne')) {
					say('She picks up the car keys and hands them to me.');
					give_hero('hearse_keys');
				} else if(location_of('vivienne')=='speakeasy_office') {
					say("She opens a drawer and rifles through the desk for a moment.");
				} else {
					say("She pops into the back office, and emerges a moment later.");
				}
				if(!Game.vars.found_keys || (location_of('vivienne')=='speakeasy' && location_of('hearse_keys')=='speakeasy_office')) {
					say('"Here they are," she says, and hands me a set of car keys.');
					give_hero('hearse_keys');
					Game.vars.found_keys = true;
					Game.things.viviennes_desk.contents = [];
				} else {
					say('"Funny," she says. "I can\'t seem to find them."');
				}
			}
		}
	}

	conv.end_conversation = function() {
		if(location_of('vivienne')=='speakeasy_office') {
			say('"Good luck, Mr Rose," says Vivienne, and walks out into the main bar.');
			put('vivienne', 'speakeasy');
		} else {
			say('"Good luck, Mr Rose," says Vivienne.');
		}
	}

	return conv;
}

Game.things.snakefingers = {
	name: "trumpet player",
	description: "trumpet player (on stage)",
	active_verbs: ["talk"],
	met_name: "Snake Fingers",
	met_description: '"Snake Fingers" Jackson',
	is_alive: true,
	pronouns: male_pronouns,
	before: {
		talk: function() {
			talk: return talk_snakefingers();
		}
	},
	performing: true,
	location: "speakeasy",
	conversifier: function() {
		return conv_snakefingers();
	},
	always: function() {
		do_snakefingers();
	},
	image: "res/img/snake_fingers.png",
	image_height: "183",
	image_width: "175",
}
function do_snakefingers() {
	if(!Game.things.vivienne.met) {
		return;
	}

	if(!pick(4) && Game.things.snakefingers.performing && !(Game.fuses.snakefingers.time > 0)) {
		say(the_thing('snakefingers', true) + " finishes his number, smiles at the applause, gets down off the stage and heads to the bar.");
		snakefingers_to_bar();
		set_fuse('snakefingers', 2);
	}
	if(!pick(3) && Game.things.snakefingers.met && (Game.talking_to!='snakefingers') && !Game.things.snakefingers.performing && !(Game.fuses.snakefingers.time > 0)) {
		say(the_thing('snakefingers', true) + " gets back on stage and starts playing his trumpet beautifully.");
		snakefingers_to_stage();
		set_fuse('snakefingers', 2);
	}
};
function talk_snakefingers() {
	if(Game.things.snakefingers.performing) {
		say("Not while he's performing.");
		return true;
	}
	return false;
}
function conv_snakefingers() {
	var conv = { asks: {}, };

	conv.start_conversation = function() {
		say(the_thing('snakefingers', true) + " " + (in_scope('vivienne') ? "orders" : "pours himself") + " a highball from the bar, then turns to me.");
		if(!Game.things.snakefingers.met) {
			say('"They call me \'Snake Fingers\' Jackson," he says. "How\'s things?"');
			meet('snakefingers');
			Game.things.snakefingers.description = '"Snake Fingers" Jackson (at bar)';
		} else {
			say('"How\'s things?" he says.');
		};
	};

	conv.asks.trumpet = function() {
		say('"That\'s some noise you make with that thing," I tell him, with a nod to the horn in his right hand.');
		say('"Thanks," he says. "Learned it from Lizard Hips Morton, who learned it from Soapy Franklin, who was taught by Sponge Cake Jones himself."');
	};

	conv.asks.speakeasy = function() {
		say('"What do you know about this place?" I ask.');
		say('"I been comin\' here a while," he says, taking a sip of his drink' +
		    (Game.vars.good_booze ? '.' : ' and making a sour face. "Drinks sure used to be better."'));
	};

	conv.asks.booze = function() {
		say('"It\'s very... interesting liquor they serve here," I say. "Any idea where it comes from?"');
		say('"Sure," he says. "Rich white family over in Princeley Heights. Got the bootlegging business sewn up in this town. ' +
		    'Hired me to play at some big wedding on their lawn last year.' +
		    (Game.things.snakefingers.gave_address ? (' And I remember the address too &ndash; ' + Game.vars.donnas_house_no + ' Princeley Boulevard."')
		                                           : ' Here, I\'ll give you the address."'));
		if(!Game.things.snakefingers.gave_address) {
			say("He pulls out a scrap of paper, scribbles an address on it, and gives it to me.");
			give_hero('address_paper');
			Game.things.snakefingers.gave_address = true;
		}

	};

	conv.end_conversation = function() {
		say("Snake Fingers tips his trilby, drains his highball, gets back on stage, and starts tootling again, to general approval from the drunkards.");
		snakefingers_to_stage();
	};

	return conv;
};
function snakefingers_to_stage() {
	Game.things.snakefingers.description = '"Snake Fingers" Jackson (on stage)'; // always met by this time
	Game.things.snakefingers.performing = true;
}
function snakefingers_to_bar() {
	Game.things.snakefingers.description = Game.things.snakefingers.met ? '"Snake Fingers" Jackson (at bar)' : "trumpet player (at bar)";
	Game.things.snakefingers.performing = false;
}

Game.things.address_paper = {
	name: "paper",
	description: "scrap of paper",
	active_when_carried: ["read"],
	before: {
		read: function() {
			return set_cardiccis_address_writing();
		}
	}
}
function set_cardiccis_address_writing() {
	Game.things.address_paper.writing = Game.vars.donnas_house_no + " Princeley Blvd (at Nebraska St)";
	reveal_donnas_house();
	return false;
}

Game.things.drunks = {
	is_alive: true,
	is_plural: true,
	pronouns: plural_pronouns,
	location: "speakeasy",
	active_verbs: ["talk"],
	before: {
		talk: function() {
			return talk_drunks();
		},
	},
}
function talk_drunks() {
	say("I'd never understand them anyway.");
	return true;
}


Game.things.hearse = {
	description: "parked hearse with its back open",
	enter_to: "inside_hearse",
	before: {
		enter: function() {
			return enter_hearse();
		}
	}
};
On_hold.push(function() {
	activate_if_held('hearse', 'enter', 'hearse_keys');
});
function enter_hearse() {
	say("The car keys fit the door. I check nobody's looking, and slip inside.");
	put_hero('inside_hearse');
	return true;
}
Game.rooms.inside_hearse = {
//	indoors: true,
	description: "I'm in a hearse, parked at Louisiana and 3rd.",
	directions: {
		out: "louisiana_and_3rd",
	}
};
Game.things.hearse_controls = {
	description: "steering wheel",
	location: "inside_hearse",
	active_verbs: ["drive"],
	before: {
		drive: function() {
			return drive_hearse();
		},
	},
};
Game.things.hearse_glove_compartment = {
	name: "glove compartment",
	description: "glove compartment",
	location: "inside_hearse",
	active_verbs: ["open"],
	contents: ["driving_gloves", "receipt"],
};
function drive_hearse() {
	say("Nah. Kinda hard to renew a P.I. licence with a car theft record.");
	return true;
}
Game.things.driving_gloves = {
	name: "gloves",
	portable: true,
	value: 2,
	is_plural: true,
	wearable: true,
};
Game.things.receipt = {
	portable: true,
	value: 0,
	active_when_carried: ["read"],
	writing: "<u>Cawmill\'s Lumberyard, Ohio &amp; 1st, West New Losago</u></p><p>700 pine coffins: $4,900</p><p>Payable by cash or check",
};
add_rule('after', 'read', 'receipt', function() {
	if(is_lit(Game.hero_location)) {
		add_taxi_destination("lumberyard", location_of('lumberyard'));
	}
});

Game.things.coffins = {
	description: "big stack of coffins (in hearse)",
	always: function() {
		Game.things.coffins.seen = true;
		set_active('coffins', 'open', !Game.things.coffins.open);
		set_active('coffins', 'close', Game.things.coffins.open);
		set_active('coffins', 'get_in', Game.things.coffins.open);
	},
	before: {
		open: function() {
			return open_coffin();
		},
		close: function() {
			say("Ok, it's closed.");
			return close_coffin();
		},
		get_in: function() {
			return get_in_coffin();
		}
	}
}
function get_in_coffin() {
	if(in_scope('gianni')) {
		say("Not with these two goons around.");
	} else if(Game.things.booze.in_coffin) {
		say("I can't fit with the booze in there.");
	} else if(carried('booze')) {
		say("I can't fit while carrying all this booze.");
	} else {
		say("I climb inside and pull the lid shut over me.");
		Game.things.coffins.open = false;
		put_hero('in_coffin');
	}
	return true;
};
Game.rooms.in_coffin = {
	description: "I'm in a coffin.",
//	indoors: true,
	dark: true,
	before: {
		drop: function(thing) {
			say("There's no room to put stuff down in here.");
			return true;
		},
	},
};
Game.things.coffin_lid = {
	description: "underside of lid",
	location: "in_coffin",
	active_verbs: ["read", "push"],
	before: {
		push: function() {
			say("I push the lid open and get out.");
			put_hero(location_of('coffins'), true);
			Game.things.coffins.open = true;
			if(location_of('coffins')=='louisiana_and_3rd' && in_scope('gianni')) {
				say('Gianni and Luigi looks at me in amazement.');
				say('"Well, well," says Gianni. "That private dick\'s been snoopin\' in our affairs. That makes me very sad, Luigi. That make you very sad?"');
				say('Luigi, being the strong and silent type, prefers to express his sadness by socking me in the face.');
				caught_by_goons();
			}
			return true;
		},
	},
	writing: "Buried alive? Sue! Visit J Epsom Esq., Attorney at Law, Maine St &amp; 5th Ave, New Losago.",
};
add_rule('after', 'read', 'coffin_lid', function() {
	add_taxi_destination('law firm', location_of('law_firm'));
});
function open_coffin() {
	if(Game.hero_location=='inside_hearse') {
		say('I check some of the coffins, but they\'re all empty now.');
		return true;
	}
	if(in_scope('gianni')) {
		say("Not with these two goons around.");
	} else {
		say("I open one of the coffins.")
		Game.things.coffins.open = true;
		Game.things.coffins.description = "big stack of coffins (one is open)";
		deactivate_verb('coffins', 'open');
		activate_verb('coffins', 'close');
		if(Game.things.booze.in_coffin) {
			say("Inside is a large cache of booze in glass bottles.");
			Game.things.booze.description = "bottles of booze (in coffin)";
			put('booze', location_of('coffins'));
		}
	}
	return true;
}
function close_coffin() {
	Game.things.coffins.description = "big stack of coffins (in hearse)";
	Game.things.coffins.open = false;
	if(Game.things.booze.in_coffin) {
		hide('booze');
	}
	return true;
}

Game.things.booze = {
	description: "bottles of booze (in coffin)",
	in_coffin: true,
	portable: true,
	value: 0,
	illegal: true,
	active_when_carried: ["drink"],
	before: {
		drink: function() {
			return drink_booze();
		},
		take: function () {
			return take_booze();
		}
	},
	always: function() {
		set_active('booze', 'put_in_coffin', carried('booze') && in_scope('coffins') && Game.things.coffins.open);
		if(Game.things.booze.in_coffin) {
			Game.things.booze.description = "bottles of booze (in coffin)";
		} else {
			Game.things.booze.description = "bottles of booze";
		}
	},
};
function take_booze() {

	if(in_scope('lumber_workers') && Game.things.lumber_workers.drunk) {
		say("No way am I getting it back off these guys.");
		//Game.things.booze.portable = false;
		//deactivate_verb('booze', 'take');
		return true;
	}

	Game.things.booze.description = "bottles of booze";
	Game.things.booze.in_coffin = false;
	return false;
}
function drink_booze() {
	var t = game_time();
	var meal;
	if(t < 15*60) { meal = 'Lunchtime'; }
	else if(t < 21*60) { meal = 'Dinner time'; }
	else if(t < 10*60 && t > 5*60) { meal = 'Breakfast time'; }

	if(meal) {
		say(meal + " already?");
	}
	say("I take a gulp from one of the bottles. Inferior moonshine that tastes like it's been brewed up by some hillbilly out of barleycorn and dead possums " +
	 "in a rain barrel. Now that ain't always a bad thing, but this particular stuff is disgusting.");
	if(!Game.rooms.speakeasy.visited) {
		say("Anyhow, I'm not gonna get through the lot. There must be my own weight in booze here.");
	}
	Game.things.booze.tasted = true;

	return true;
}

Game.things.gianni = {
	is_alive: true,
	pronouns: male_pronouns,
	name: "skinny fella",
	description: "skinny fella",
	active_verbs: ["talk"],
	before: {
		talk: function() {
			return talk_gianni();
		},
	},
	conversifier: function() {
		return conv_gianni();
	},
	image: "res/img/gianni.png",
	image_height: "183",
	image_width: "175",
}
function talk_gianni() {
	if(case_open("A Twisty Little Murder")) {
		say("Gianni\'s not in the mood to talk.");
		return true;
	}
	if(Game.vars.goons_looking_for_booze) {
		say('"Actually, we\'re kinda busy right now," says ' + the_thing('gianni') + '.');
		return true;
	}
	return false;
}
Game.things.luigi = {
	is_alive: true,
	pronouns: male_pronouns,
	name: "big fella",
	description: "big fella",
	active_verbs: ["talk"],
}
add_rule('after', 'talk', 'luigi', function() { talk_luigi() });
function conv_gianni() {
	var conv = { asks: {} };

	conv.start_conversation = function() {
		if(!Game.things.gianni.met) {
			say('"The name\'s Gianni," says the skinny fella.');
			Game.things.gianni.met = true;
			Game.things.gianni.name = 'Gianni';
			Game.things.gianni.description = 'Skinny Gianni';
			Game.things.gianni.proper_name = true;
		} else {
			say('"What\'s up?" asks Gianni.');
		}
	}

	conv.asks[name('luigi')] = function() {
		say('"Excuse my brother Luigi," says Gianni. "He\'s a little slow. When we were kids back ' +
		'in Sicily, he got shot in the head by &ndash; er, by a horse."');
		Game.things.luigi.name = "Luigi";
		Game.things.luigi.description = "Big Luigi";
		Game.things.luigi.met = true;
		Game.things.luigi.proper_name = true;
	}

	conv.asks.coffins = function() {
		if(!Game.things.gianni.asked_coffins) {
			say('I nod at the coffins. "What\'s that, a party booking?"');
			say('"Oh, all those?" says Gianni. "Ha, yeah, I guess business is good today! Come on, Luigi, we got stiffs to shift."');
			Game.things.luigi.name = "Luigi";
			Game.things.luigi.description = "Big Luigi";
			Game.things.luigi.met = true;
			Game.things.luigi.proper_name = true;

			Game.vars.speakeasy_loading = true;
			Game.talking_to = '';
			hide_conversation();
			Game.things.gianni.asked_coffins = true;
			Game.fuses.loading_coffins.time = 0;
		} else {
			say('"No, really," I say. "If that many people had died all at once, I\'m fairly sure I\'d ' +
			    'have heard about it.');
			say('"No, really," insists Gianni, "It\'s nothin\' to worry about. Just a big pile a ' +
			    'corpses. Would you mind lettin\' us do our jobs? Come on, Luigi."');
			Game.things.luigi.name = "Luigi";
			Game.things.luigi.description = "Big Luigi";
			Game.things.luigi.met = true;
			Game.things.luigi.proper_name = true;

			Game.vars.speakeasy_loading = true;
			Game.fuses.loading_coffins.time = 0;
			Game.talking_to = '';
			hide_conversation();
		}
	}

	conv.end_conversation = "Gianni gives me a nod.";

	return conv;
}

function talk_luigi() {
	if(in_scope('gianni') && !case_open("A Twisty Little Murder")) {
		say('"Luigi don\'t say much," says ' + the_thing('gianni') + '.');
		Game.things.luigi.name = "Luigi";
		Game.things.luigi.description = "Big Luigi";
		Game.things.luigi.met = true;
		Game.things.luigi.proper_name = true;
	}
}

Game.always.push(function() {
	if(!Game.vars.loading_finished) {
		do_coffin_carrying();
	}
});
function do_coffin_carrying() {

	if(Game.vars.goons_looking_for_booze) {

		if(location_of('booze')==location_of('gianni')) {

			// goons pick up the booze and take it back to Louisiana and 3rd
			if(in_scope('gianni')) {
				say('"Hey Luigi," says Gianni. "That looks like our booze. Mystery solved. Get it, would ya?"');
				say('Luigi picks up the booze, and the pair of them swagger off.');
				Game.vars.goons_looking_for_booze = false;
			} else if(Game.hero_location == 'louisiana_and_3rd') {
				say('Gianni and Luigi arrive, Luigi laden with bottles of booze.');
				say('"Lucky we found this stuff lyin\' on the sidewalk," says Gianni. "The Donna would be ticked off if we lost it."');
			} else if(Game.hero_location == 'in_coffin') {
				say("I hear two guys' footsteps approaching, and the sound of clinking glass.");
				say('"Lucky we found this stuff lyin\' on the sidewalk," I hear Gianni say. "The Donna would be ticked off if &ndash;"');
			}
			hide('booze');
			put('luigi', 'louisiana_and_3rd');
			put('gianni', 'louisiana_and_3rd');

			// goons put the booze back in the coffin - bad news if you're in it!
			if(Game.hero_location == 'in_coffin') {
				say('Luigi lifts the lid of the coffin. He and Gianni stare down at me. I tumble out. The game\'s up.');
				say('"Well, well," says Gianni. "Some people don\'t got no respect. That makes me sad. That make you sad, Luigi?"');
				say('Luigi, not being a man for emotional scenes, prefers to express his sadness by socking me in the face.');
				put_hero('louisiana_and_3rd');
				caught_by_goons();
				return;
			} else {
				if(Game.hero_location=='louisiana_and_3rd') {
					if(Game.things.coffins.open) {
						say("Luigi puts the booze back in the coffin and closes the lid.");
					} else {
						say("Luigi lifts the lid of the coffin, puts the booze back inside, and closes it.");
					}
				}
				Game.things.booze.in_coffin = true;
				close_coffin();
				Game.vars.goons_looking_for_booze = false;
			}


		} else if(carried('booze') && in_scope('gianni')) {

			// goons catch hero with the booze & it goes badly
			say('"Hey Luigi," says Gianni. "That guy\'s got our booze. That makes me very sad. That make you very sad, Luigi?"');
			say('Luigi, not being one for emotional scenes, prefers to express his sadness by socking me in the face.');
			caught_by_goons();
			return;

		} else {
			// goons carry on walking round the block
			if(in_scope('gianni')) {
				if(location_of('gianni')=='louisiana_and_3rd') {
					say('"C\'mon, Luigi," says Gianni. "Let\'s check round the block."');
				} else {
					say('"C\'mon, Luigi," says Gianni. "It\'s gotta be round here somewhere."');
				}
			}
			var dir;
			var dest;
			var loc = location_of('gianni');
			if(loc=='louisiana_and_3rd') {
				dir = 'north';
				dest = 'kentucky_and_3rd'
			} else if(loc=='kentucky_and_3rd') {
				dir = 'east';
				dest = 'kentucky_and_4th';
			} else if(loc=='kentucky_and_4th') {
				dir = 'south';
				dest = 'louisiana_and_4th';
			} else if(loc=='louisiana_and_4th') {
				dir = 'west';
				dest = 'louisiana_and_3rd';
			} else {
				console.log("How did Luigi and Gianni get to " + location_of('gianni') + "?");
				dir = 'away';
				dest = 'louisiana_and_3rd';
			}
			if(in_scope('gianni')) {
				say("The two of them walk " + dir + ".");
			}
			put('gianni', dest);
			put('luigi', dest);
			if(Game.hero_location == dest) {
				say("Gianni and Luigi arrive from the " + opposite_dir(dir) + '.');
			} else if(Game.hero_location == 'in_coffin' && dest == 'louisiana_and_3rd') {
				say("I hear two guys' footsteps approaching.");
				say('"Too bad we didn\'t find it, Luigi," says the voice of Gianni. "We\'ll just tell the Donna you got thirsty, I guess."');
			}

			if(dest=='louisiana_and_3rd') {
				if(!Game.things.coffins.open) {
					Game.vars.goons_looking_for_booze = false;
				}
			}

		}

	};

	if(!Game.vars.goons_looking_for_booze && Game.vars.speakeasy_loading
	   && !(Game.talking_to == 'gianni')) {

		var luigi_and_gianni = the_thing('gianni', true) + ' and ' + the_thing('luigi');

		if(location_of('gianni') == 'louisiana_and_3rd' && !Game.fuses.loading_coffins.time && !Game.things.coffins.open) {
			if(Game.hero_location == 'louisiana_and_3rd') {
				if(!Game.things.booze.in_coffin) {
					say('Gianni and Luigi start to lift one of the coffins.');
					say('"Hey, this is too light," says Gianni. "Shall we take a look inside?"');
					say('Luigi lifts the lid of the coffin. They stare at its lack of contents.');
					if(carried('booze')) {
						say('Then Luigi notices the large number of bottles of booze I happen to be carrying.');
						say('"Now look here," says Gianni. "Some people got no respect. That makes me very sad. Does it make you sad, Luigi?"');
						say('Luigi, being a man of few words, prefers to express his sadness by socking me in the face.');
						caught_by_goons();
						return;
					} else {
						say('"It appears some bozo\'s burglarized our booze," says Gianni. "C\'mon, Luigi, let\'s go find it."');
						Game.vars.goons_looking_for_booze = true;
						return;
					}
				} else {
					say( luigi_and_gianni + ' lift up one of the coffins between them. It makes a noise like clinking glass. They carry it into the funeral director\'s office.');
				}
			} else if(Game.hero_location == 'funeral_directors') {
				say( luigi_and_gianni + ' come in, lugging a coffin between them.');
				say('"Just put it downstairs with the others, boys," says the clerk.');
				say('The guys carry the coffin down the stairs, with a faint noise of clinking glass.');
			} else if(Game.hero_location == 'speakeasy') {
				say( luigi_and_gianni + ' come down the stairs carrying a coffin, and lay it down behind the bar.');
				say(the_thing(vivienne, true) + ' opens it, takes out some bottles of cheap liquor, and adds them to the shelves.');
			} else if(Game.hero_location == 'in_coffin') {
				if(carried('booze') || Game.things.booze.in_coffin) {
					say('I feel the coffin being lifted. "Somethin\'s wrong," comes the voice of Gianni. "This shouldn\'t be so heavy. Shall we have a look inside, Luigi?"');
					say('Luigi lifts the coffin lid.');
					say('"What the &ndash;" says Gianni. "They gave us one with a stiff in it."');
					say('Luigi shakes his head, and prods me with a finger the size of a ten-dollar stoagie. The game\'s up. I tumble out.');
					put_hero('louisiana_and_3rd');
					Game.things.coffins.open = true;
					say('"Now look here," says Gianni. "Some people got no respect. That makes me very sad. Does it make you sad, Luigi?"');
					say('Luigi, being a man of few words, prefers to express his sadness by socking me in the face.');
					caught_by_goons();
					return;
				} else {
					// You got into the speakeasy

					say("I feel the coffin being lifted and carried... down a flight of stairs... and lowered to the floor.");
					say('A lady bartender lifts the lid and I climb out. Suddenly, a lot of eyes are on me.');
					say('"Do you mind telling me what you were doing in my supply of illicit b&ndash;" begins the bartender. "I mean &ndash; wow, this one\'s still alive! ' +
					    'Everybody, cancel the funeral, we\'ve had a miracle!"');
					say('"Relax," I say. "I ain\'t a flatfoot. My name is Lanson Rose, and I was led to believe that someone here ' +
					    'might want to speak with me."');
					say('"Let me guess," says the bartender with a frown. "Little guy talk to you, looks like a rat? Fine, since you\'re here, ' +
					    'let\'s see if you\'re any use. We\'ll talk in my office. Boys, that\'ll be all for now."');
					say('Gianni and Luigi pick up the empty coffin and leave. The bartender walks into the back office, beckoning me to follow.');

					hide('gianni');
					hide('luigi');
					Game.things.hearse.description = "parked hearse";
					Game.things.coffins.description = "big stack of coffins";
					put('coffins', 'inside_hearse');
					//hide('booze');

					put('vivienne', 'speakeasy_office');

					put_hero("speakeasy");
					set_fuse('snakefingers', 3);
					do_room_music();

					return;

				}
			}

			put('luigi', 'speakeasy');
			put('gianni', 'speakeasy');
			set_fuse('loading_coffins', 5);
		} else if(location_of('gianni') == 'speakeasy' && !Game.fuses.loading_coffins.time) {
			if(Game.hero_location == 'speakeasy') {
				say(luigi_and_gianni + ' go upstairs.');
			} else if(Game.hero_location == 'funeral_directors') {
				say(luigi_and_gianni + ' come up the stairs and walk outside.');
			} else if(Game.hero_location == 'louisiana_and_3rd') {
				say(luigi_and_gianni + ' walk out of the funeral director\'s office.');
			} else if(Game.hero_location == 'in_coffin') {
				say("I hear two guys' footsteps approaching.");
			}

			put('luigi', 'louisiana_and_3rd');
			put('gianni', 'louisiana_and_3rd');

			if(Game.things.coffins.open || location_of('booze')=='louisiana_and_3rd') {
				if(Game.hero_location=='louisiana_and_3rd') {
					if(Game.things.coffins.open) {
						if(Game.things.booze.in_coffin) {
							say('"Hey," says Gianni, seeing the open coffin. "Some bozo\'s been snoopin\' in our booze. That makes me very sad, Luigi. Very sad."');
						} else {
							say('"Hey," says Gianni, seeing the open, empty coffin. "Some bozo\'s burglarized our booze. That makes me very sad, Luigi. Very sad."');
						}
						if(carried('booze')) {
							say('He looks at me, and notices the several bottles of booze I happen to be carrying.');
							say('"Oh dear," he adds. "Some people just got no respect for other people\'s property. What do you think of that, Luigi?"');
							say('Luigi, being a man of few words, prefers to express his opinion by socking me in the face.');
							caught_by_goons();
						} else if(Game.things.booze.in_coffin) {
							say('He inspects the contents of the coffin. "At least all the, er &ndash; dead bodies still seem to be there," he says, with a guilty glance in my direction.');
							say('Luigi closes the coffin lid.');
							close_coffin();
						} else if(location_of('booze')=='louisiana_and_3rd') {
							say('"Huh," he adds, noticing the booze on the ground. "Well, maybe it just fell out, I guess."');
							say('Luigi picks up the booze, puts it back in the coffin, and closes the lid.');
							close_coffin();
							Game.things.booze.in_coffin = true;
							hide('booze');
							Game.things.booze.description = "bottles of booze (in coffin)";
						} else {
							Game.vars.goons_looking_for_booze = true;
						}
					} else { // booze is on ground
						say('"Hey," says Gianni, seeing the booze on the ground. "That shouldn\'t oughtta be lyin\' there."');
						say("Luigi picks up the booze and puts it back in the coffin.");
						Game.things.booze.in_coffin = true;
					}
				} else {
					if(location_of('booze')=='louisiana_and_3rd') {

						if(Game.hero_location=='in_coffin') {
							say('Through the lid, I hear Gianni\'s voice: "Hey, what\'s our booze doin\' down there? Open this coffin, Luigi."');
							say('Luigi opens the coffin. The game\'s up. I tumble out.');
							say('"Huh," says Gianni. "Some guys got no respect. That makes me very sad. That make you very sad, Luigi?"');
							say('Luigi, being a man of few words, prefers to express his sadness by socking me in the face.');
							Game.things.coffins.open = true;
							put_hero('louisiana_and_3rd', true);
							caught_by_goons();
						}

						// the guys put the booze back in the coffin, close it, and quietly carry on
						Game.things.booze.in_coffin = true;
						Game.things.booze.description = "bottles of booze (in coffin)";
						close_coffin();
					} else {
						Game.vars.goons_looking_for_booze = true;
						//console.log("The goons are looking for the booze");
					}
				}
			}

			set_fuse('loading_coffins', 5);
		}

	}
}

Game.fuses.snakefingers = {
	explode: function() {
		if(Game.hero_location == 'speakeasy') {
			say(the_thing('snakefingers', true) + " finishes his number, smiles at the applause, gets down off the stage and heads to the bar.");
		}
		snakefingers_to_bar();
	}
};

function caught_by_goons() {
	if(in_scope('hearse')) {
		say('Everything goes black.');
	}
	Game.vars.goons_looking_for_booze = false;
	hide('booze');
	Game.things.booze.in_coffin = true;
	close_coffin();
	put('gianni', 'louisiana_and_3rd');
	put('luigi', 'louisiana_and_3rd');

	hero_injured();

//	fail_case();
}

enter_from('lumberyard', 'ohio_and_1st');
Game.things.lumberyard.is_taxi_destination = true;
Game.rooms.lumberyard = {
	description: "I'm in a lumberyard.",
	directions: {
		out: 'ohio_and_1st',
	},
};
Game.things.cawmill = {
	name: "owner",
	description: "lumberyard owner",
	met_name: "Cawmill",
	met_description: "Mr Cawmill",
	location: "lumberyard",
	is_alive: true,
	pronouns: male_pronouns,
	active_verbs: ["talk"],
	conversifier: function() {
		return conv_cawmill();
	},
	image: "res/img/cawmill.png",
	image_height: "183",
	image_width: "175",
};
Game.always.push(function() {
	move_cawmill();
});
function move_cawmill() {
	if(Game.talking_to != 'cawmill' && !pick(3)) {
		if(location_of('cawmill')=='lumberyard') {
			if(in_scope('cawmill')) {
				say(the_thing('cawmill', true) + " walks into the workshop.");
			}
			put('cawmill', 'workshop');
			if(in_scope('cawmill')) {
				say(the_thing('cawmill', true) + " walks in.");
			}
		} else {
			if(in_scope('cawmill')) {
				say(the_thing('cawmill', true) + " walks out to the yard.");
			}
			put('cawmill', 'lumberyard');
			if(in_scope('cawmill')) {
				say(the_thing('cawmill', true) + " walks out from the workshop.");
			}
		}
	}
}
function conv_cawmill() {
	var conv = { asks: {}, };

	conv.start_conversation = function() {
		if(Game.things.cawmill.met) {
			say('"Whaddya want?" says Cawmill.');
		} else {
			say('"The name\'s Cawmill," he says, taking the fat cigar out of his mouth. "But my friends call me Mr Cawmill."');
			meet('cawmill');
		}
	};

	conv.asks.lumberyard = function() {
		say('"Nice place you got here," I say.');
		say('"Built the business from scratch myself," says Cawmill between cigar puffs. "Pulled myself up by my own bootstraps, and a small loan of ten grand from my father."');
	}

	if(case_open('Speakeasy Street') && Game.things.receipt.read) {
		conv.asks.coffins = function() {
			say('"I\'m interested in an order you met recently," I say. "For 700 coffins. Ring any bells?"');
			say('"I don\'t discuss my accounts with strangers," says Cawmill. "You wanna nose through my books, go get a real cop, bring a warrant."');
			Game.things.cawmill.mentioned_warrant = true;
		};
	}

	if(Game.things.lumber_workers.seen) {
		conv.asks.workers = function() {
			say('"Your workers don\'t seem as happy with the business as you do," I point out.');
			say('"Those lunkheads? They ain\'t supposed to be happy," he chuckles. "You wouldn\'t understand, ' +
			    'not bein\' an employer yourself. If your workers are happy, you ain\'t got real power ' +
			    'over \'em."');
		};
	}

	conv.end_conversation = '"If you\'ll excuse me," says Cawmill, "I got work to supervise."';

	return conv;
}

enter_from('workshop', 'lumberyard');
Game.rooms.workshop = {
	description: "I'm in a lumber workshop.",
	indoors: true,
	directions: {
		out: 'lumberyard',
	},
};
Game.things.machinery = {
	location: 'workshop',
};
Game.things.workbenches = {
	location: 'workshop',
};
Game.things.lumber_workers = {
	name: "workers",
	description: "miserable-looking workers",
	location: "workshop",
	is_alive: true,
	is_plural: true,
	pronouns: plural_pronouns,
	active_verbs: ["talk"],
	conversifier: function() {
		return conv_lumberers();
	},
	before: {
		talk: function() {
			return talk_lumberers();
		}
	},
	always: function() {
		do_lumberers();
	},
	image: "res/img/workers.png",
	image_height: "183",
	image_width: "175",
};
function talk_lumberers() {
	if(Game.things.lumber_workers.drunk) {
		say("They're too happy to take any notice.");
		return true;
	}
	return false;
}
function do_lumberers() {
	Game.things.lumber_workers.seen = true;
	if(!Game.things.lumber_workers.drunk) {

		if(location_of('booze')==location_of('lumber_workers')) {
			say('"Hey," says ' + a_worker() + '. "We got free booze!"');
			say('All the workers immediately down their tools and run over to the booze.');
			if(Game.talking_to == 'lumber_workers') {
				hide_conversation();
			}
			Game.things.lumber_workers.drunk = true;
			Game.things.lumber_workers.description = "happy workers drinking";
		} else {
			var piece_of_wood = pickOne(["piece of wood", "beam", "plank of wood", "wooden pole", "log"]);
			say(a_worker(true) +
			    pickOne([
			             " cuts a " + piece_of_wood + " in half.",
			             " sands a " + piece_of_wood + " down on a noisy machine.",
			             " drills a hole in a " + piece_of_wood + ".",
			             " hammers a nail into a " + piece_of_wood + ".",
			             " nails two " + piece_of_wood + "s together.",
			             " carries a " + piece_of_wood + " from one machine to another.",
			             " puts a " + piece_of_wood + " into a chipper.",
			    ])
			);
		}

	}

	if(Game.things.lumber_workers.drunk) {

		say(a_worker(true) +
		    pickOne([
		    	" takes a swig from one of the bottles.",
		    	" drinks from a booze bottle and passes it around.",
		    	" sings a drinking song.",
		    ])
		);

		if(in_scope('cawmill')) {
			say(the_thing('cawmill', true) + ' ' + pickOne(["stares", "gapes", "sputters"]) + '. "' +
			    pickOne(["What the hell's all this?", "What's the meaning of this?", "Get back to work!"]) +
			    '" he ' + pickOne(["shouts", "bellows", "yells"]) + ". The workers ignore him.");
		}

	}

}

function conv_lumberers() {
	var conv = { asks: {} };

	conv.start_conversation = "The workers do their best to listen while continuing to work.";

	conv.asks.work = function() {
		say('"How\'s the work?" I ask ' + a_worker() + '.');
		if(in_scope('cawmill')) {
			say('"It\'s... great," replies the worker quickly, with a nervous glance towards ' +
			    the_thing('cawmill') + '. "Mr Cawmill is fair to us, and not at all horrible."');
		} else {
			say('The worker spits. "It sucks. The hours are long, my back\'s killin\' me, ' +
			     'no pension, no insurance, no fun. Not even a water cooler, an\' the ' +
			     'thirstiest work I ever done."');
		}
	};

	conv.asks.Cawmill = function() {
		say('"So what do you think of your boss?" I ask the workers.');
		if(in_scope('cawmill')) {
			say("There is a general murmur of unconvincing approval. " + the_thing('cawmill', true) + " beams.");
		} else {
			say(a_worker(true) + ' spits on the floor. "He treats us like dirt. But it\'s not like we can afford to quit."');
		}
	};

	if(Game.things.receipt.read) {
		conv.asks.coffins = function() {
			say('"Any of you guys remember an order for 700 coffins recently?" I ask the floor.');
			if(in_scope('cawmill')) {
				say("No one says a word.");
			} else {
				say(a_worker(true) + ' answers. "Yeah, I remember. Mr Cawmill had us workin\' double time at half pay. \
				Never told us who they was for."');
				meet('cawmill');
			}
		};
	};

	conv.end_conversation = '"I\'ll let you get on with your work," I tell them.';

	return conv;
}

function a_worker(caps) {
	var txt = caps ? "A" : "a";
	if(pick(2)) { txt += pickOne([" young", "n old"]); }
	if(pick(2)) { txt += pickOne(["", " oil-covered", " skinny", " lanky", " emaciated", " bony"]); }
	txt += pickOne([" woman", " man"]);
	if(pick(2)) { txt += pickOne([" in coveralls", " in a flat cap", " in dirty clothes"]); }
	return txt;
}

Game.things.oilcan = {
	portable: true,
	value: 1,
	location: "workshop",
};
Game.things.wood_saw = {
	portable: true,
	value: 2,
	name: "saw",
	location: "workshop",
}

Game.things.lumberyard_accounts = {
	name: "account book",
	description: "account book",
	portable: true,
	location: "workshop",
	value: 0,
	active_when_carried: ["read"],
	before: {
		take: function() {
			return take_account_book();
		},
		read: function() {
			return read_account_book();
		}
	}
}
function set_donnas_house_no() {
	if(!Game.vars.donnas_house_no) {
		Game.vars.donnas_house_no = 1300 + pick(10);
	}
};
function set_macdonalds_house_no() {
	if(!Game.vars.macdonalds_house_no) {
		Game.vars.macdonalds_house_no = 1100 + pick(20);
	}
}

function read_account_book() {
	if(!Game.things.coffins.seen) {
		say("I flip through the account book, but I don't find anything I can make sense of.");
	} else {
		say("I notice an entry for 700 pine coffins, ordered two weeks ago by a Ms D Cardicci of " +
		     Game.vars.donnas_house_no + " Princeley Boulevard at Nebraska Street.");
		reveal_donnas_house();
	}
	return true;
}
function reveal_donnas_house() {
	add_taxi_destination(Game.vars.donnas_house_no + ' Princeley', 'nebraska_and_princeley');
	Game.things.cardicci_mansion.description = Game.vars.donnas_house_no + " Princeley";
	put('cardicci_mansion', 'nebraska_and_princeley');
}

function reveal_macdonald_house() {
	add_taxi_destination('Macdonald house', 'louisiana_and_princeley');
	put('macdonald_house', 'louisiana_and_princeley');
}

function take_account_book() {
	if(Game.vars.warrant_served) {
		return false;
	}

	if(in_scope('cawmill')) {
		say('"Hey!" shouts ' + the_thing('cawmill') + '. "That\'s private stuff. Get outta here!"');
		return true;
	}
	if(!Game.things.lumber_workers.drunk && in_scope('lumber_workers')) {
		say('One of the workers, ' + a_worker() + ', sees me going for the account book, and stops me.' +
		    '"I don\'t think Mr Cawmill would want you doin\' that."');
		meet('cawmill');
		return true;
	}
	give_hero('lumberyard_accounts');
	say("I slyly pick up the accounts book. The workers are too preoccupied with drinking to notice.");
	return true;
}

Game.things.cardicci_mansion = {
	name: "mansion",
	// description and location set elsewhere
	active_verbs: ["enter"],
	before: {
		enter: function() {
			return enter_cardicci_mansion();
		}
	},
	enter_to: "cardicci_lawn",
};
function enter_cardicci_mansion() {
	if(Game.vars.cardicci_gates_open) {
		return false;
	}

	say("The gate's locked.");
	put('cardicci_gate', 'nebraska_and_princeley');
	return true;
}
Game.things.cardicci_gate = {
	name: "gate",
	description: "locked iron gate",
	active_verbs: ["climb"],
	before: {
		climb: function() {
			return climb_cardicci_gate()
		},
	},
}
function climb_cardicci_gate() {
	if(worn('houseshoes')) {
		say("I can\'t climb anything while wearing these goofy houseshoes!");
		return true;
	};
	say("The bars are wide enough apart to get a foothold. I climb over...");
	var dest = 'nebraska_and_princeley';
	if(Game.hero_location == dest) {
		dest = 'cardicci_lawn';
	}
	put('cardicci_gate', dest);
	put_hero(dest);
	return true;
}

Game.rooms.cardicci_lawn = {
	description: "I'm on a front lawn before an opulent mansion.",
	music: "italianmusic",
}
Game.things.italian_flag = {
	description: "Italian flag",
	location: "cardicci_lawn",
}

Game.things.horses = {
	description: "grazing horses",
	is_alive: true,
	is_plural: true,
	pronouns: plural_pronouns,
	location: "cardicci_lawn",
	active_verbs: ["pet"], // "ride"],
	before: {
		pet: function() {
			return pet_horses();
		},
//		ride: function() {
//			return ride_horses(),
//		},
	},
	always: function() {
		do_horses();
	}
}
function horse_colour() {
	return pickOne(["brown", "black", "white", "gray"]);
}
function pet_horses() {
	say("I pet the nose of a " + horse_colour() + " horse. " +
	    "It gives a quiet " + pickOne(["whicker", "whinny"]) + ".");
	return true;
}
function do_horses() {
	if(!pick(4)) {
		say("A " + horse_colour() + " horse looks at me, then carries on nibbling grass.");
	}
}

enter_from('stable', 'cardicci_lawn');
Game.rooms.stable = {
	indoors: true,
	description: "I'm in a stable.",
	directions: {
		out: 'cardicci_lawn',
	},
	music: "italianmusic",
};
Game.things.tarpaulin = {
	portable: true,
	location: "stable",
	value: 1,
	before: {
		throw: function() {
			return throw_tarp();
		},
		take: function() {
			return take_tarp();
		},
	},
	always: function() {
		set_active("tarpaulin", "throw", carried("tarpaulin") && in_scope("birdcage"));
	}
}
add_rule('after', 'take', 'tarpaulin', function() { reveal_hay() });
function throw_tarp() {
	say('<span class="prompt">(over birdcage)</span>');
	say("I throw the tarpaulin over the birdcage. That seems to calm down its occupant.");
	hide('birdcage');
	put('tarpaulin', Game.hero_location);
	Game.things.tarpaulin.description = "tarpaulin (covering birdcage)";
	Game.things.tarpaulin.on_birdcage = true;
	return true;
}
function take_tarp() {
	if(Game.things.tarpaulin.on_birdcage) {
		Game.things.tarpaulin.description = "tarpaulin";
		Game.things.tarpaulin.on_birdcage = false;
		put('birdcage', Game.hero_location);
		set_fuse('birdcage', 3);
	}
	return false;
}

function reveal_hay() {
	if(!Game.things.hay.found) {
		say("Under the tarpaulin is a small bale of hay.");
		put("hay", Game.hero_location);
		Game.things.hay.found = true;
	}
}
Game.things.hay = {
	portable: true,
	description: "small bale of hay",
	is_soft: true,
	value: 0,
	before: {
		take: function() {
			return take_hay();
		}
	}
};
function take_hay() {
	if(Game.things.china.fallen_on == 'hay') {
		smash_china(false, true);
		return true;
	} else if(Game.things.sculpture.fallen_on == 'hay') {
		say("It's stuck under the remains of the sculpture.");
		//Game.things.hay.portable = false;
		//deactivate_verb('hay', 'take');
		return true;
	}
	return false;
}

/* function ride_horses() {

} */

Game.things.cardicci_house = {
	name: "mansion",
	description: "mansion",
	location: "cardicci_lawn",
	active_verbs: ["enter"],
	before: {
		enter: function() {
			return enter_cardicci_house();
		}
	},
	enter_to: "cardicci_foyer",
}
function enter_cardicci_house() {
	if(!Game.things.cardicci_house.used_front_door) {
		say("The door's not locked, so it doesn't count as burglary, right? I sneak in.");
		Game.things.cardicci_house.used_front_door = true;
		put_hero('cardicci_foyer');
		return true;
	};
	return false;
}

Game.rooms.cardicci_foyer = {
	description: "I'm in the foyer of an opulent mansion.",
	directions: {
		out: "cardicci_lawn",
		up: "cardicci_bedroom",
		south: "cardicci_frontroom",
	},
	indoors: true,
	music: "italianmusic",
	always: function() {
		do_snoring();
	},
	is_cardicci_house: true,
};
function do_snoring() {
	if(!Game.rooms.cardicci_foyer.visited || !pick(3)) {
		Game.rooms.cardicci_foyer.visited = true;
		say("I hear snoring from upstairs.");
	}
};
Game.things.cardicci_photographs = {
	name: "photographs",
	description: "photographs (on wall)",
	location: "cardicci_foyer",
	active_verbs: ["look"],
	before: {
		look: function() {
			return look_cardicci_photographs();
		},
	}
};


function look_cardicci_photographs() {
	if(!Game.things.cardicci_photographs.seen) {
		say("They look like the usual rich-people family portraits, centered around an ageing lady and " +
		    "a couple of sons, taken at various times over the last twenty years. " +
		    "There's something familiar about...");
		say("My heart just about stops. That lady? I seen her mugshots pulled out in relation to a dozen murder cases, " +
		    "but there's never been enough evidence to put her away. That's Donna Cardicci. And if this is her house, " +
		    "and I'm caught tresspassing in it, I'm a dead man.");
		meet('donna_cardicci');
		say("The boys are familiar too. A skinny one and a big one. They're a little younger, " +
		    "but sure enough, that's those two goons from the funeral directors" +
		    (Game.things.gianni.met && Game.things.luigi.met ? ", Gianni and Luigi." : "."));
		Game.things.cardicci_photographs.seen = true;
	} else {
		say("That's Donna Cardicci the crime boss, and her sons" +
		    (Game.things.gianni.met && Game.things.luigi.met ? " Gianni and Luigi." : "."));
	}
	return true;
};
Game.things.houseshoes = {
	description: "pair of soft houseshoes",
	portable: true,
	value: 2,
	location: "cardicci_foyer",
	wearable: true,
//	active_when_carried: ["wear"],
	is_plural: true,
};
Game.always.push(function() {
	check_houseshoes();
});
Game.rooms.cardicci_bedroom = {
	description: "I'm in a bedroom.",
	indoors: true,
	directions: {
		down: "cardicci_foyer",
	},
	music: "italianmusic",
	is_cardicci_house: true,
};


Game.things.donnas_bed = {
	name: "bed",
	description: "four-poster bed",
	location: "cardicci_bedroom",
};
Game.things.donnas_washstand = {
	name: "washstand",
	description: "washstand",
	location: "cardicci_bedroom",
};

Game.things.donnas_bureau = {
	name: "bureau",
	description: "mahogany bureau",
	location: "cardicci_bedroom",
	active_verbs: ["open"],
	contents: ["sheet", "pillow"],
	before: {
		open: function() {
			return open_bureau();
		}
	},
};
On_hold.push(function() {
	set_active('donnas_bureau', 'oil', held('oilcan') && !Game.things.donnas_bureau.oiled);
});

function open_bureau() {
	if(!Game.things.donnas_bureau.oiled) {
		say("The drawer tugs open with a loud scraping noise.");
		make_noise();
		return true;
	} else {
		say("The drawer glides open smoothly.");
		return false;
	}
};

Game.things.sheet = {
	description: "clean sheet",
	portable: true,
	value: 2,
	always: function() {
		set_active("sheet", "throw", carried('sheet') && in_scope('birdcage'));
	},
	before: {
		throw: function() {
			return throw_sheet();
		},
		take: function() {
			return take_sheet();
		}
	}
}
function throw_sheet() {
	say('<span class="prompt">(over birdcage)</span>');
	say("I throw the sheet over the birdcage. That seems to calm down its occupant.");
	hide('birdcage');
	put('sheet', Game.hero_location);
	Game.things.sheet.description = "clean sheet (covering birdcage)";
	Game.things.sheet.on_birdcage = true;
	return true;
}
function take_sheet() {
	if(Game.things.sheet.on_birdcage) {
		Game.things.sheet.description = "clean sheet";
		Game.things.sheet.on_birdcage = false;
		put('birdcage', Game.hero_location);
		set_fuse('birdcage', 3);
	}
	return false;
}

Game.things.pillow = {
	description: "feather pillow",
	portable: true,
	value: 2,
	before: {
		take: function() {
			return take_pillow();
		}
	}
}
function take_pillow() {
	if(Game.things.china.fallen_on == 'pillow') {
		smash_china(false, true);
		return true;
	} else if(Game.things.sculpture.fallen_on == 'pillow') {
		say("It's stuck under the remains of the sculpture.");
		Game.things.pillow.portable = false;
		deactivate_verb('pillow', 'take');
		return true;
	}
	return false;
}

Game.things.donna_cardicci = {
	is_alive: true,
	location: "cardicci_bedroom",
	pronouns: female_pronouns,
	description: "old Italian lady (asleep)",
	met_name: "Donna Cardicci (asleep)",
	always: function() {
		do_donnas_name();
	},
};
function do_donnas_name() {
	Game.things.donna_cardicci.name = Game.things.donna_cardicci.met ? "Donna Cardicci" : "old Italian lady";
	Game.things.donna_cardicci.description = Game.things.donna_cardicci.name;
	if(location_of('donna_cardicci')=='cardicci_bedroom') {
		Game.things.donna_cardicci.description += ' (asleep)';
	}
}
function wake_donna() {
	Game.things.donna_cardicci.description = Game.things.donna_cardicci.description.replace(' (asleep)', '');
}
function sleep_donna() {
	if(Game.things.donna_cardicci.description.indexOf('(asleep)') != -1) {
		Game.things.donna_cardicci.description += ' (asleep)';
	}
}

Game.rooms.cardicci_frontroom = {
	description: "I'm in a lavish front room.",
	indoors: true,
	directions: {
		north: "cardicci_foyer",
		east: "cardicci_backroom",
	},
	is_cardicci_house: true,
	music: "italianmusic",
	before: {
		depart: function(dir) {
			return depart_cardicci_frontroom(dir);
		}
	},
	after: {
		arrive: function() {
			set_fuse('birdcage', 3);
		},
		depart: function() {
			stop_fuse('birdcage');
		},
	},
};
function depart_cardicci_frontroom(dir) {
	if(Game.things.china.fallen_on || dir != 'east') {
		return false;
	}

	if(!Game.things.sheet.on_birdcage && !Game.things.tarpaulin.on_birdcage) {
		say("As I walk past the parakeet, it emits a mighty SQUAAAAWK!!");
		make_noise();
		return true;
	}

	if(!smash_china()) {
		return false;
	}
	return true;
}
Game.things.birdcage = {
	name: "bird", // so "the bird jumps"
	is_alive: true,
	description: "parakeet in birdcage",
	location: "cardicci_frontroom",
};
Game.fuses.birdcage = {
	burn: function() {
		do_bird();
	},
	explode: function() {
		bird_squawks();
	},
};
function do_bird() {
	if(in_scope('birdcage')) {
		var n = Game.fuses.birdcage.time;
		say("The parakeet " +
		    ["opens its beak", "opens its beak", "puffs its chest out", "ruffles its feathers", "looks at me"][n] + ".");
	}
}
function bird_squawks() {
	if(in_scope('birdcage')) {
		say("The parakeet emits a mighty SQUAAAAWK!!");
		make_noise();
	}
}

Game.things.cardicci_shelves = {
	name: "shelves",
	description: "rickety shelves",
	location: "cardicci_frontroom",
}
Game.things.china = {
	name: "china",
	description: "8-piece china tea set (on shelves)",
	num_pieces: 8,
	location: "cardicci_frontroom",
	portable: true,
	value: 50,
	before: {
		take: function() {
			smash_china(true);
			return true;
		}
	}
}
function smash_china(taken, taking_fallenon) {

	var txt = "";
	if(taken) {
		txt = "As I try to pick up the china, it slips from my fingers...";
	} else if(taking_fallenon) {
		txt = "As I pick up " + the_thing(Game.things.china.fallen_on) + ", the china goes flying...";
		give_hero(Game.things.china.fallen_on);
		Game.things.china.fallen_on = "";
	} else {
		txt = "As I walk past the shelves, they wobble, and the china comes crashing down..."
	}

	var softthing = '';
	if(location_of('pillow')=='cardicci_frontroom') {
		softthing = 'pillow';
	} else if(location_of('hay')=='cardicci_frontroom') {
		softthing = 'hay';
	}
	if(softthing == '') {
		say(txt);
		say("SMAAAAAASH!!!");
		make_noise();
		var n = Game.things.china.num_pieces *= 2;
		if(!in_scope('china')) {
			// (PC has been sent to hospital, so assume Donna Cardicci put the china back on the shelves
			// and went back to bed.)
			Game.things.china.description = n + "-piece china tea set (on shelves)";
			return true;
		} else {
			Game.things.china.description = "broken shards";
			return false;
		}

	} else {
		say(txt + " and lands softly on " + the_thing(softthing) + ".");
		Game.things.china.description = Game.things.china.description.replace(" (on shelves", " (on " + name(softthing));
		Game.things.china.fallen_on = softthing;
		Game.things.china.portable = true;
		if(!taken && !taking_fallenon) {
			put_hero('cardicci_backroom');
		}
		return true;
	}
}

Game.rooms.cardicci_backroom = {
	description: "I'm in a back room done up in the art-deco style.",
	is_cardicci_house: true,
	indoors: true,
	music: "italianmusic",
	directions: {
		west: "cardicci_frontroom",
	}
};
Game.things.cardicci_backdoor = {
	name: "door",
	description: "back door",
	location: "cardicci_backroom",
	active_verbs: ["exit"],
	exit_to: "cardicci_backlawn",
	music: "italianmusic",
	before: {
		exit: function() {
			return use_cardicci_backdoor();
		}
	}
};
function use_cardicci_backdoor() {
	if(Game.things.sculpture.fallen_on) {
		return false;
	}

	if(topple_sculpture()) {
		return true;
	}

	put_hero('cardicci_backlawn');
	return true;
};

Game.rooms.cardicci_backlawn = {
	description: "I'm on a back lawn.",
	music: "italianmusic",
};
Game.things.hedge = {
	description: "hawthorn hedge with hole in",
	location: "cardicci_backlawn",
	active_verbs: ["enter"],
	enter_to: "trail",
};
Game.things.hedge2 = {
	name: "hedge",
	description: Game.things.hedge.description,
	location: "trail",
	active_verbs: ["enter"],
	enter_to: "cardicci_backlawn",
}

Game.rooms.trail = {
	description: "I'm on a trail winding through a hillside.",
	directions: {
		east: "swamp",
	},
	music: "banjomusic",
	is_mountains: true,
};

Game.rooms.swamp = {
	description: "I'm in a swampy hollow.",
	directions: {
		west: "trail",
	},
	music: "banjomusic",
	is_mountains: true,
	always: function() {
		Game.rooms.swamp.visited = true;
	}
};

Game.things.still = {
	description: "copper moonshine still",
	location: "swamp",
};

Game.things.granpappy = {
	description: "old hillbilly",
	name: "hillbilly",
	met_name: "Granpappy",
	met_description: "Granpappy Clunkett",
	is_alive: true,
	pronouns: male_pronouns,
	location: 'swamp',
	active_verbs: ["talk"],
	conversifier: function() {
		return conv_granpa();
	},
	image: "res/img/granpappy.png",
	image_height: "183",
	image_width: "175",
};
function conv_granpa() {

	var conv = { asks: {}, };

	conv.start_conversation = function() {
		if(!Game.things.granpappy.met) {
			say('"Hey there, trav\'ler," says the old man. "Granpappy Clunkett\'s the name. ' +
			    '"What c\'n I do for you?"');
			meet('granpappy');
		} else {
			say('"Hey there, trav\'ler," says Granpappy.');
		}

	}

	conv.asks.still = function() {
		say('"That\'s a fascinating machine you got there," I say.');
		var txt = '"Yessir," says the old man. "My pappy made it hissel\' outta ' +
		    'fryin\' pans an\' tractor parts. Makes the best gulp a mountain dew this side a the ' +
		    'Mississippi, if ya know how to use it.';


		if(Game.things.still.got_mug) {
			txt += ' \'Course, it was m\'granddaughter that was the expert," he adds with a downward glance.';
			say(txt);
			Game.things.granpappy.mentioned_granddaughter = true;
		} else {
			say(txt + (!Game.things.still.got_mug ? ' Here, take a taste."' : '"'));
			if(!Game.things.still.got_mug) {
				say('He takes a tin mug out of his overalls, draws off a measure of brownish liquid from the still, ' +
				    'and hands it to me.');
				give_hero('mug');
				Game.things.still.got_mug = true;
			}
		}
	}

	var cardiccis = Game.things.donna_cardicci.met ? 'Cardiccis' : 'bootleggers';
	conv.asks[cardiccis] = function() {
		say('"You acquainted with two city guys?" I ask. "A skinny fella, and a big fella that don\'t ' +
		    'talk much?' +
		    (Game.things.cardicci_photographs.seen ? ' And maybe an old Italian lady?"' : '"'));
		say('"Why yes," says the old man after a pause. "They come here an\' buy my liquor." His eyes ' +
		    'narrow. "Unless you\'re the revenooers, in which case they says to tell you I ain\'t never ' +
		    'seen \'em."');
	}

	if(Game.things.granpappy.mentioned_granddaughter) {
		conv.asks.granddaughter = function() {
			say('"So where\'s your granddaughter now?" I ask.');
			say('"Aw, Mary Jo Lou Belle got some high-falutin city job," says Granpappy. ' +
			    '"Some fancy Fifth Avenue law firm in New Losago. Tragic waste a talent. I mean I ain\'t impartial, ' +
			    'but she mus\' be the greatest moonshiner this side a the Rockies. Brings tears ' +
			    'to m\'eyes to remember her liquor, jes\' like it used to do when I drank it."');
		}
	}

	conv.end_conversation = 'Granpappy gives me a gummy smile. "Ya\'ll come back now, ya hear?"';

	return conv;
};
Game.things.mug = {
	portable: true,
	value: 1,
	description: "tin mug of moonshine",
	always: function() {
		set_active('mug', 'drink', carried('mug') && Game.things.mug.full);
	},
	before: {
		drink: function() {
			return drink_mug();
		}
	},
	full: true,
};
function drink_mug() {
	if(!Game.things.mug.full) {
		say("It's empty.");
		return true;
	}

	say("I steel myself and neck the contents of the mug." +
	    (in_scope('granpappy') ? "" : " Yeesh, that\'s absolutely revolting."));

	if(in_scope('granpappy')) {
		say('"Whew," I say when my vision clears. "That\'s..."');
		say('"I know," says ' + the_thing('granpappy') + ' sadly. "I do m\'best, but it always comes ' +
		    'out tastin\' a rotten armadillas. \'Course, it was m\'granddaughter was the expert."');
		say('He takes back the empty mug with an apologetic smile.');
		take_away('mug');
		Game.things.granpappy.mentioned_granddaughter = true;
	}

	delete Game.things.mug.full;
	Game.things.mug.tasted = true;
	Game.things.mug.description = "tin mug";

	return true;
}

Game.things.cardicci_backdoor_outside = {
	name: "mansion",
	description: "back door of mansion",
	active_verbs: ["enter"],
	enter_to: "cardicci_backroom",
	location: "cardicci_backlawn",
};

Game.things.piano = {
	description: "grand piano",
	location: "cardicci_backroom",
	active_verbs: ["play"],
	before: {
		play: function() {
			return play_piano();
		},
	},
}
function play_piano() {
	say('I bash out one of my favorite ragtime hits.' + (location_of('donna_cardicci')=='cardicci_bedroom' ? ' Boy, am I dumb.' : ""));
	make_noise();
	return true;
}
Game.things.sculpture = {
	location: "cardicci_backroom",
	description: "big sculpture made of cowbells, crash cymbals and old car horns",
	always: function() {
		if(!Game.things.sculpture.seen) {
			say("Some people got the strangest notions about decor.");
			Game.things.sculpture.seen = true;
		}
	}
}

function topple_sculpture() {
	var txt = "As I open the door, a draft of cold air rushes in. The sculpture wavers, then collapses...";
	var soft_thing = '';
	if(location_of('hay')=='cardicci_backroom') {
		soft_thing = 'hay';
	} else if(location_of('pillow')=='cardicci_backroom') {
		soft_thing = 'pillow';
	}
	if(soft_thing=='') {
		txt += ' and comes down right on top of the grand piano. The lid snaps in two, several strings ' +
		       'snap at once, and there is a violent, deafening, and rather avant-garde explosion.';
		say(txt);
		make_noise();
		if(!in_scope('piano')) {
			Game.things.piano.description = "brand new grand piano";
			return true;
		} else {
			Game.things.piano.description = "wrecked piano";
			return false;
		}
	} else {
		txt += ' and lands softly on ' + the_thing(soft_thing) + ".";
		say(txt);
		Game.things.sculpture.description = "broken sculpture of cowbells, crash cymbals and old car horns";
		Game.things.sculpture.fallen_on = soft_thing;
		put(soft_thing, 'cardicci_backroom');
		Game.things[soft_thing].description += ' (under sculpture)';
		return false;
	}
};


function check_houseshoes() {
	if(Game.hero_location != 'cardicci_foyer' && hero_location().is_cardicci_house &&
	   !Game.things.houseshoes.worn) {
		say("I step on a loose floorboard. CREEEEEAK!");
		make_noise();
	}
}

function make_noise() {
	if(hero_location().is_cardicci_house && Game.hero_location != 'cardicci_foyer') {
		wake_donna();
		if(in_scope('donna_cardicci')) {
			say((Game.things.donna_cardicci.met ? "Donna Cardicci" : "The old Italian lady") +
			" wakes up, pulls a Dellinger from under her mattress, and fires.");
		} else {
			say((Game.things.donna_cardicci.met ? "Donna Cardicci" : "An old Italian lady") +
			" bursts into the room with a Derringer in her hands, and fires.");
		}
		hero_injured('shot');
		put('cardicci_gate', 'nebraska_and_princeley');
		if(Game.things.houseshoes.worn) {
			Game.things.houseshoes.worn = false;
			deactivate_verb('houseshoes', 'remove');
		}
		take_away('houseshoes');
		put('houseshoes', 'cardicci_foyer');
		sleep_donna();
	}
}


enter_from('law_firm', 'maine_and_5th');
Game.things.law_firm.is_taxi_destination = true;
Game.rooms.law_firm = {
	description: "I'm in the office of a fancy law firm.",
	//music: 'saxloopmusic',
	indoors: true,
	directions: {
		out: 'maine_and_5th',
	}
};

Game.things.inbox = {
	description: "inbox (on desk)",
	active_verbs: ["search"],
	location: "law_firm",
	before: {
		search: function() {
			return search_inbox();
		},
	},
};
function search_inbox() {
	var txt = "I " + (in_scope('epsom') || in_scope('maryjoloubelle') ? "wait until nobody's looking and " : "") +
	          "quickly flick through the papers in the inbox. ";
	if(!Game.rooms.swamp.visited) {
		say(txt + "Humdrum stuff: a divorce claim, " +
		    "a patent application, a condemnation order. Nothing that catches my eye.");
	} else if(!Game.vars.found_order) {
		say(txt + "Something catches my eye: " +
		    "a condemnation order for a tiny hamlet southeast of the city called Swampy Hollow. I pull it out.")
		give_hero('condemnation_order');
		Game.vars.found_order = true;
	} else {
		say(txt + "Humdrum stuff: a divorce claim, a patent application. Nothing that catches my eye.");
	}

	return true;
}


Game.things.condemnation_order = {
	name: "condemnation order",
	description: "condemnation order",
	portable: true,
	value: 0,
	active_when_carried: ["read"],
	always: function() {
		set_active('condemnation_order', 'show', carried('condemnation_order') && in_scope('maryjoloubelle') && Game.things.maryjoloubelle.met);
	},
	before: {
		read: function() {
			return read_order();
		},
		show: function() {
			return show_order();
		},
	},
};
function read_order() {

	say("This is an order for the compulsory sale to the state of some land southeast of New Losago " +
	    "known as \"Swampy Hollow\", and the demolition of all structures built on it. The sale " +
	    "price don\'t look exactly fair, either. It\'s signed by the state governor and witnessed " +
	    "by " + (Game.things.brinkman.met ? "" : "a ") + "Senator Brinkman.");

	Game.things.condemnation_order.read = true;

	return true;
}
function show_order() {
	say("(to Mary Jo Lou Belle)");
	say('"Take a look at this," I say to the girl. "Swampy Hollow. Ain\'t that where your folks hail from?"');
	if(!Game.things.maryjoloubelle.shown_order) {
		say('Mary Jo Lou Belle takes the paper, reads it, then angrily waves it at ' + the_thing('epsom') + '.');
		say('"What\'s this?\" she demands. "You\'re helpin\' someone demolish my home swamp?"');
		say('"Oh, is that where you\'re from?" says ' + the_thing('epsom') + '. "Well, you\'ve moved on from there, haven\'t you? ' +
		    'You can live in a proper apartment in the city, eat real food instead of roadkill..."');
		say('"That\'s it!" she says. "I quit!"');
		say("She throws the paper to the floor and storms out of the office.");

		put('condemnation_order', Game.hero_location);
		put('maryjoloubelle', location_of('law_firm'));
		Game.things.maryjoloubelle.shown_order = true;
	} else {
		say('"Aggravatin\', ain\'t it?" says Mary Jo Lou Belle. "There was me workin\' for that legal varmint, an\' all along ' +
		    'he was fixin\' to knock my Granpappy\'s house down."');
	}
	return true;
};



Game.things.epsom = {
	name: "lawyer",
	description: "pinstriped lawyer",
	met_name: "Mr Epsom",
	met_description: "J Epsom Esq.",
	location: "law_firm",
	active_verbs: ["talk"],
	conversifier: function() {
		return conv_epsom();
	},
	is_alive: true,
	pronouns: male_pronouns,
	anger: 0,
	image: "res/img/epsom.png",
	image_height: "183",
	image_width: "175",
};
function conv_epsom() {
	var conv = { tells: {}, asks: {} };

	conv.start_conversation = function() {
		if(!Game.things.epsom.met) {
			say('"I am J Epsom, Esquire," says the lawyer. "How do you do?"');
			say('"Lanson Rose, private investigator," I say.');
			meet('epsom');
		} else {
			say('"How do you do, Mr Rose?" says Mr Epsom.');
		}
	};

	conv.asks.firm = function() {
		say('"How\'s lawyering these days?" I ask the guy.');
		say('"Oh, you know," he says. "As long as people don\'t all start getting along, ' +
		    'there\'ll always be plenty of work for us."');
	};

	var maryjo = Game.things.maryjoloubelle.met ? "Mary Jo Lou Belle" : "secretary";
	conv.asks[maryjo] = function() {
		say('"Where did you find your secretary?" I ask him.');
		say('"She walked in and asked for a job. I\'m a generous man, she shows excellent organisational ' +
		    'skills, and she didn\'t seem to have a clue what an acceptable salary was.' + (
				in_scope('maryjoloubelle') ? ' Did you, dear?" ' +
					'he adds, with a patronising smile in ' + the_thing('maryjoloubelle') + '\'s direction.' :
					'"'
				)
			);
	};

	if(Game.things.maryjoloubelle.threatened && !Game.things.maryjoloubelle.shown_order) {
		conv.tells.moonshine = function() {
			say('"Would it interest you to know," I say, "that your secretary ' +
			    (in_scope('maryjoloubelle') ? 'over there ' : '') + ' previously worked ' +
			    'as a moonshine maker in some swamp in the mountains?"');
			say('"Come now, Mr Rose," says Mr Epsom with a thin smile. "You and I know Prohibition ' +
			    'is a sham. Everyone carries on drinking, everyone is well aware of it, but the ' +
			    'police can now arrest whomever they choose. Which of course does not include pillars ' +
			    'of the status quo like ourselves. Miss Clunkett is an excellent secretary and I am ' +
			    'willing to overlook her employment history."');
		};
	}

	conv.end_conversation = 'Mr Epsom gives me a stiff handshake.';

	return conv;
}


Game.things.maryjoloubelle = {
	name: "secretary",
	description: "redheaded secretary",
	met_name: "Mary Jo Lou Belle",
	met_description: "Mary Jo Lou Belle",
	active_verbs: ["talk"],
	location: "law_firm",
	conversifier: function() {
		return conv_maryjo();
	},
	pronouns: female_pronouns,
	is_alive: true,
	anger: 0,
	image: "res/img/maryjo.png",
	image_height: "183",
	image_width: "175",
};

function conv_maryjo() {
	var conv = { asks: {} };

	if(location_of('maryjoloubelle')==location_of('law_firm')) {

		conv.start_conversation = function() {
			say('Mary Jo Lou Belle looks at me with a scowl. "I suppose you\'re gonna say I should go back to my folks," she says.');
		}

		conv.says = {
			"go home" : function() {
				say('"It\'d be a selfless service," I tell her. "If what I hear\'s true, you\'re the ' +
				    'Mozart of moonshine. The Beethoven of booze. The, er, Liszt of liquor." I run out of composers. "Plus, your granpappy\'s gonna need a hand to defend the ' +
				    'place when the bulldozers come."');
				say('"I guess you\'re right," she says simply.');
				say('Her gaze meets mine for a moment, then she walks away.');
				put('maryjoloubelle', 'swamp');

				Game.vars.good_booze = true;

				close_case('Speakeasy Street');
			},

			"don't go home" : function() {
				say('"You don\'t have to do anything you don\'t want to do, kid," I tell her. "You\'ve tried moonshining and ' +
				    'you\'ve tried legal secretarying. There\'s a million other things to try out there. You ever thought of being a ' +
				    'private detective, for example?"');
				say('"Maybe not that," says the girl. "But I got places I wanna see. Plus," she adds with a smile, "I stole ' +
				    'fifty grand off that creep." She pats her handbag, looks at me for a moment, and walks out of my life.');
				hide('maryjoloubelle');
				Game.things.maryjoloubelle.gone = true;

				close_case('Speakeasy Street');
			},
		};

		conv.end_conversation = 'Mary Jo Lou Belle looks down at the sidewalk and sighs.'

		return conv;
	}


	conv.start_conversation = function() {
		say(the_thing('maryjoloubelle', true) + ' gives me a forced smile. "Welcome to the law offices of J Epsom Esquire," she says. ' +
		   '"' + (Game.things.maryjoloubelle.met ? '' : 'My name is Mary Jo Lou Belle, ') +
		   'I\'m Mr Epsom\'s secretary. How may I help you?"');
		meet('maryjoloubelle');
	};

	conv.work = function() {
		say('"How you finding the work here, Mary Jo Lou Belle?" I ask her.');
		say('"I only been here a few weeks," she says. "It ain\'t bad, and there\'s plenty of dough comin\' in. '+
	        'Which is odd, because we don\'t seem to have many clients.' + (in_scope('epsom') ? '..' : '') + '"');
		if(in_scope('epsom')) {
			say(the_thing('epsom', true) + ', thinking I can\'t see, clears his throat, glares at her and drags a ' +
			    'finger across his mouth in the universal gesture for "shut your yap".');
		};
    }

    conv["Mr Epsom"] = function() {
	    say((in_scope('epsom') ? 'Mr Epsom don\'t look like he\'s listening. ' : '') +
	        '"What can you tell me about this Mr Epsom?" I ask.');
	    say('"Oh, he\'s an expert lawyer," she says. "Law degree from Corndale, twenty years in the business, ' +
	        'hasn\'t taken a day off sick in his career."');
    };

    if(Game.things.granpappy.mentioned_granddaughter) {
	    conv.asks.Granpappy = function() {
			say('"Would you happen to be related to a Mr Granpappy Clunkett?"');
			say('"Why yes," says Mary Lou Jo Belle. "He\'s my Granpappy. I miss him, but times is a-movin\' on, an\' I can\'t ' +
			    'stay in the family business forever."');
	    };

	    conv.asks.moonshine = function() {
		    var txt = in_scope('epsom') ? 'I lower my voice and lean in. ' : '';
		    say(txt + '"Now if I were to inform Mr Epsom about your previous occupation, do you think you\'d keep this job?"');
		    say('Mary Lou Jo Belle snorts. "Go ahead. Mr Epsom likes a drink as much as anyone else."');
		    Game.things.maryjoloubelle.threatened = true;
	    };
    }

	conv.end_conversation = 'Mary Jo Lou Belle gives me the fake smile again.';

	return conv;
};





Game.things.police_department = {
	location: 'nebraska_and_4th',
	active_verbs: ["enter"],
	enter_to: 'police_department',
	description: "police department",
	is_taxi_destination: true,
};
Game.rooms.nebraska_and_4th.always = function() {
	has_payphone();
};

Game.rooms.police_department = {
	description: "I'm at the front desk of a police department.",
	//music: "saxloopmusic",
	indoors: true,
	directions: {
		out: 'nebraska_and_4th',
	},
};
Game.things.cell_door = {
	name: "door",
	description: "cell door",
	location: "police_department",
	active_verbs: ["enter"],
	before: {
		enter: function() {
			say("It\'s locked.");
			return true;
		},
	},
	enter_to: "cell",
};
Game.rooms.cell = {
	description: "I'm in a stinking cell.",
	directions: {
		out: "police_department",
	},
	before: {
		depart: function(dir) {
			return leave_cell();
		},
	},
	indoors: true,
};
Game.things.bucket = {
	portable: true,
	value: 1,
	location: "cell",
};
function leave_cell() {
	if(location_of('lieutenant')=='cell') {
		say('Lieutenant Miles unlocks the door for me.');
		hide('lieutenant');
		put_hero('police_department');
		return true;
	}

	return false;
};


Game.things.garroway = {
	description: "Officer Garroway",
	is_alive: true,
	pronouns: male_pronouns,
	location: "police_department",
	active_verbs: ["talk"],
	always: function() {
		do_garroway();
	},
	before: {
		bribe: function() {
			return bribe_garroway();
		},
	},
	conversifier: function() {
		return conv_garroway();
	},
	bribes: 0,
	image: "res/img/garroway.png",
	image_height: "183",
	image_width: "175",
};
function do_garroway() {
	Game.things.garroway.description = (location_of('garroway')=='cop_car' ? "Officer Garroway (in driver's seat)" : "Officer Garroway")
};
On_hold.push(function() {
	activate_if_held('garroway', 'bribe', 'money');
});
function bribe_garroway() {
	if(!Game.things.money.left) {
		say("I haven't got any money.");
	} else if(Game.things.money.left < 10) {
		say('I proffer Officer Garroway my pocket change.');
		say('"Bribery is a serious offence," he tells me. "You\'ll need more than that to get me interested."');
	} else {
		pay(10);
		say('I show Officer Garroway a nice picture of Mr Hamilton. He accepts the bill without smiling.');
		say('"Your donation will be useful, citizen," he says. "Now, what were we talkin\' about?"');
		Game.things.garroway.bribes++;
	}
	return true;
};
function conv_garroway() {

	var conv = { tells: {}, asks: {} };

	conv.start_conversation = 'Officer Garroway gives me an unfriendly stare.'
	conv.end_conversation = 'Officer Garroway\'s gaze goes back into the distance.';

	if(case_open("A Twisty Little Murder") && !Game.vars.chase_started) {
		conv.tells[Game.things[Game.vars.murder_victim].description] = function() {
			say('"Officer," I say, "I have to report a murder."');
			say('Garroway nods. "Step in here, please." He ushers me into a porcelain-tiled cell, and has me sit at a desk. "Wait one moment."');
			put_hero('cell', true);
			say('&nbsp;');
			say('He returns a few minutes later and another man follows him in &ndash; ' +
				(Game.things.brinkman.met ? 'Senator George Manhattan Brinkman' : 'the man in the overcoat, from the spy basement') + '.');
			say('"Seen this guy before?" he asks.');
			say('"Yeah," I begin. "He was in this creepy basement &ndash;"');
			say('"I wasn\'t talkin\' to you," snaps Garroway. "Seen this guy before, Senator Brinkman?"');
			say('The ' + (Game.things.brinkman.met ? 'senator' : 'overcoat guy') + ' nods. "That\'s him. Put a bullet in poor ' +
				Game.things[Game.vars.murder_victim].description + '\'s back at pointblank range."');
			stopAllMusic();
			die('Garroway slams his hands onto the desk in front of me. "You\'re going away for a long time, Rose."',
				"I\'ve been stitched up");
		}
		return conv;
	}

	if(Game.vars.chase_started) {
		conv.tells["Senator Brinkman"] = function() {
			say('Garroway stares while I tell him all about Senator Brinkman and his plans.');
			if(!Game.things.garroway.bribes) {
				say('"Supposing I could help you," says Garroway. "What would be in it for me?"');
			} else {
				say('"Well," says Garroway, "since you\'ve shown support for this department in the past... here, let me do you a favor." \
					He pulls a pair of handcuffs from his belt and slaps them on me, then opens the cell door and \
					bundles me inside.');
				put_hero('cell', true);
				say('Out in the foyer, I hear the scuffle of Italian boots, and Garroway\'s voice: "That man in there is under arrest for \
					attendin\' a place a sale of intoxicatin\' liquor. He\'s in the custody of the New Losago police department. \
					Now beat it."');
				say('&nbsp;');
				put('garroway', 'cell');
				say('"Your senator friend won\'t be a problem much longer," says Garroway as he brings me my food a few days later. \
					"Some scandal about a hillbilly and an octopus, or somethin\'. Should be safe to let you out in a week."');
				stopAllMusic();
				Game.score++; show_score();
				playMusic("stringsloopmusic");
				die('I thank him, and tuck into my bread and soup. Hey, at least I\'m getting free meals. That\'s more than I get paid \
					for some jobs.', 'Ending 2 of 3');
			}
		};
	}

	if(!case_open('A Twisty Little Murder') && (Game.things.handbill.read || Game.rooms.speakeasy.visited)) {
		conv.tells.speakeasy = function() {
			say('"I\'ve something to report," I tell Garroway. "A speakeasy, on Louisiana and 3rd."');
			say('Garroway hesitates. "You mean you confess to frequentizin\' a place a sale of intoxicatin\' liquor? You\'re pinched, buster!"');
			hero_arrested('speakeasy');
		};
	}

	if(case_open("Speakeasy Street") && location_of('garroway')=='police_department' && Game.things.cawmill.mentioned_warrant && !Game.vars.warrant_served) {
		conv.asks.warrant = function() {
			say('"So there\'s this lumberyard in the Westside," I tell him, "and I\'m sure ' +
			    'there\'s something goin\' on. Owner won\'t play ball. Any chance of a warrant?"');

			if(!Game.things.garroway.bribes) {
				say('"Sure," says Garroway. "I got nothin\' better to do than traipse around after every ' +
				    'private dick who gets suspicions about some poor businessholder. That was sarcasm," ' +
				    'he explains.');
			} else {
				Game.things.garroway.bribes--;
				say('Officer Garroway grabs a piece of paper from under his desk.');
				say('"Meet me out front," he says. "I\'ll bring a car around." He disappears through the ' +
				    'back office.');

				put('garroway', 'cop_car');
				put('cop_car', location_of('police_department'));
				set_fuse('cawmill_warrant', 20);
			}
		}

	}

	return conv;

};

Game.fuses.cawmill_warrant = {
	burn: function() {
		if(location_of('cop_car')==location_of('police_department')) {
			if(!Game.things.cop_car.honk) {
				Game.things.cop_car.honk = true;
			} else if(in_scope('cop_car')) {
				say("Officer Garroway honks the horn of the cop car.");
			}
		} else if(!in_scope('garroway')) {
			say('Officer Garroway follows me.');
			put('garroway', Game.hero_location);
		} else if(Game.fuses.cawmill_warrant.time <= 5 && in_scope('garroway')) {
			say('Officer Garroway looks annoyed. "I swear, if we don\'t find this Cawmill bird in the ' +
			    'next ' + in_words(Game.fuses.cawmill_warrant.time) + ' minutes, I\'m gonna arrest ' +
			    'you for wastin\' police time," he says.');
		} else {
			if(in_scope('garroway') && !in_scope('cawmill') && (Game.fuses.cawmill_warrant.time % 3 == 0)) {
				say('"You gonna take me to this Cawmill character or not?" says Garroway.');
			}
		}

		if(in_scope('garroway') && in_scope('cawmill')) {
			say('"Mr Cawmill," says Officer Garroway, waving a piece of paper, "I got a warrant ' +
			    'to seize and inspect your company accounts. Hand \'em over."');
			say('Mr Cawmill looks like a masher who\'s just been hit in the face with a whistle. ' +
			    'He grudgingly ' + (in_scope('lumberyard_accounts') ? 'picks up the account book' :
			    'marches into the workshop, returns with the account book,' ) + ' and hands it to ' +
			    'Officer Garroway, who hands it to me.');
			give_hero('lumberyard_accounts');
			say('"Stay outta trouble," says Officer Garroway, and leaves.' +
			    (Game.hero_location=='lumberyard' ? ' I hear the cop car starting up.' : ''));
			hide('cop_car');
			Game.vars.warrant_served = true;
			put('garroway', 'police_department');
			stop_fuse('cawmill_warrant');
		};
	},

	explode: function() {

		// one more chance
		Game.fuses.cawmill_warrant.burn();
		if(Game.vars.warrant_served) {
			return;
		}

		if(in_scope('garroway')) {
			if(in_scope('cawmill')) {
				set_fuse('cawmill_warrant', 2);
			} else {
				say('Officer Garroway runs out of patience. "Wastin\' of the time of an officer ' +
				    'of the law is a serious offence," he says, and arrests me.');
				hero_arrested();
			}

		}

	},
};

Game.things.lieutenant = {
	description: "Lieutentant Miles",
	is_alive: true,
	pronouns: male_pronouns,
	proper_name: true,
	active_verbs: ["talk"],
	conversifier: function() {
		return conv_lieutenant();
	},
	image: "res/img/lieutenant.png",
	image_height: "183",
	image_width: "175",

};
function conv_lieutenant() {
	var conv = { asks: {}, says: {}, }

	conv.asks.work = function() {
		say('"How\'s the cop business these days?" I ask.');
		say('"Oh, you know," says the Lieutenant. "I got a city full of crooks to keep an eye on, and more than one or two \
		     right here in the department."');
	}

	return conv;
}

Game.things.cop_car = {
	name: "cop car",
	description: "cop car",
	list_last: true,
	active_verbs: ["enter"],
	enter_to: "cop_car",
	always: function() {
		do_cop_car();
	},
	after: {
		enter: function() {
			enter_copcar();
		},
	},
};
function do_cop_car() {
	Game.rooms.cop_car.directions = {
		out: location_of('cop_car'),
	}
	if(!Game.things.cop_car.seen) {
		say('Officer Garroway pulls up in a cop car and winds down the window. "Get in!" he yells.');
		Game.things.cop_car.seen = true;
	}
};
Game.rooms.cop_car = {
	description: "I'm in a cop car, in the passenger seat.",
	after: {
		exit: function() {
			exit_copcar();
		}
	},
};
function enter_copcar() {
	if(location_of('cop_car')==location_of('police_department') && location_of('garroway')=='cop_car') {
		say("Officer Garroway starts the car, turns on the blues, and drives down 4th Avenue " +
		    "then west along Ohio Street at terrifying speed.");
		Game.game_time += 2;
		say("He parks outside the lumberyard.");
		put('cop_car', location_of('lumberyard'));
		Game.rooms.cop_car.directions = {
			out: location_of('cop_car'),
		};
	}
};
function exit_copcar() {
	if(location_of('cop_car')==location_of('lumberyard') && location_of('garroway')=='cop_car') {
		say("Officer Garroway gets out of the cop car.");
		put('garroway', Game.hero_location);
	}
};

Game.things.hospital = {
	location: 'ohio_and_3rd',
	active_verbs: ["enter"],
	enter_to: 'hospital_ward',
	is_taxi_destination: true,
}
Game.rooms.hospital_ward = {
	description: "I'm in a hospital ward.",
	directions: {
		out: 'ohio_and_3rd',
	},
	indoors: true,
	//music: 'stringsloopmusic',
};

Game.rooms.ohio_and_3rd.always = function() {
	has_payphone();
};

Game.things.ruby = {
	description: "Ruby",
	proper_name: true,
	is_alive: true,
	pronouns: female_pronouns,
	location: "hospital_ward",
	active_verbs: ["talk"],
	before: {
		talk: function() {
			return check_ruby_mood();
		}
	},
	conversifier: function() {
		return conv_ruby();
	},
	image: "res/img/ruby.png",
	image_height: "183",
	image_width: "175",
}
Game.fuses.ruby_badmood = {};
function check_ruby_mood() {
	if(Game.fuses.ruby_badmood.time > 0) {
		say("Ruby's not in the mood to talk.");
		return true;
	};
	return false;
}
function conv_ruby() {

	var conv = { says: {}, asks: {}, };

	if(Game.vars.chase_started) {
		conv.start_conversation = '"What is it this time?" says Ruby.';
		conv.end_conversation = 'Ruby rolls her eyes.';
	} else {
		conv.start_conversation = 'Ruby looks at me fondly. "Hey, Lanson," she says.';
		conv.end_conversation = 'Ruby smiles at me.';
	}

/*	if(false) { // (case_open("Speakeasy Street") && Game.vars.hero_injured) {

		conv.start_conversation = function() {

			say('"Lanson," says Ruby. "That was a bad one. You keep gettin\' injured like this, ' +
		        'someday you\'re gonna get hurt. I worry. Please, for me &ndash; will you drop this case?"');
		};

		conv.says = {
			yes: function() {
				say('"For you?" I say. "All right, Ruby. I\'m droppin\' the case. Some things are just more important than booze."');
				say('"Lanson," she says adoringly, "you say the most romanticest things."');
				say("I give her a kiss, and note how I never promised not to <u>re</u>open the case.");
				hide_conversation();
				fail_case('Speakeasy Street');
				Game.vars.hero_injured = false;
			},
			no: function() {
				say('"Ruby," I say, "if I don\'t fix this thing, who will? I ain\'t droppin\' the case."');
				say('Ruby looks upset. "Jeez, Lanson. Fine. Go solve your damn case. ' +
				    'Just don\'t come cryin\' to me when you ' +
					pickOne([
						"end up in a river with your feet in a concrete block",
						"wake up some day with a horse's head in your bed",
						"get run down by some crazed mobster",
					]) +
					'."');
				hide_conversation();
				set_fuse('ruby_badmood', 25 + pick(10));
				Game.vars.hero_injured = false;
			},

		};

	} else */
	// default conversation, when not injured
	if(!Game.vars.chase_started) {
		conv.asks.work = function() {
			say('"How\'s work?" I ask.');
			say('"The usual," she says. "A few drunks, fights, industrial accidents. Nothing exciting."');
		};
	}
	if(!Game.things.ruby.engaged && !Game.vars.chase_started) {
		conv.asks.relationship = function() {
			say('"Ruby," I ask gently, "where do you think things are going, between us?"');
			say('She sighs. "You know I\'d like to take it further. Get married, get a place together. But we can\'t afford it, Lanson. \
				 We\'d need at least a couple thousand in savings. They pay me about a third of what the male doctors get, and you\'re a \
				 struggling P.I. I know it\'s what you love doing, but I wish..." \
				 she goes silent.');
		};
	}

	conv.says = {};

	if(Game.vars.chase_started) {
		conv.says["help me"] = function()  {
			say('"Ruby," I tell her, "I\'m on the run from a corrupt senator and a couple of Italian mobsters. You gotta help."');
			if(!Game.things.ruby.engaged) {
				say('Ruby looks angry. "Not this time, Lanson. It\'s always one thing or another with you. \'Ruby, can you lend me \
					ten dollars?\' \'Ruby, can you sew up my face?\' \'Ruby, I\'m on the run from Italian gangsters, what you gonna \
					do about it?\' You never think about what I want. Enough is enough."');
			} else {

				say('Ruby hesitates. "Do you trust me, Lanson?" I nod frantically.');
				say('"Good." She picks up a large pair of forceps and smacks me across the face. As I fall down, I hear the scuffle of \
				Italian leather shoes, and Ruby\'s best angry-doctor voice rising above it: "Gentlemen, that is MY patient and he is NOT fit to \
				have visitors!"');
				say('&nbsp;')
				say('"We\'re almost rid of them, sweetheart," says Ruby a few days later. \
				"Your friend Senator Brinkman was in the newspaper today. Some scandal about forcing people off their land to build a \
				hamburger joint, whatever that is. He\'ll be out of a job soon. You just gotta lie low in there another week or two."');
				hero_location().music = "swingmusic";
				Game.score++;
				show_score();
				do_room_music();
				die('She blows me a kiss through the window of the iron lung, turns out the light, and goes home.',
					'Ending 3 of 3');

			}
		}
	} else if(!Game.things.ruby.engaged && Game.things.money.left >= 2000) {
			conv.says["will you marry me"] = function() {
			say('I go down on one knee and pop the question.');
			say('Ruby almost laughs. "Lanson! You know we can\'t afford it. You haven\'t got &ndash;"');
			say('I make sure no one else is looking, and I flash her a glimpse at the contents of my wallet.');
			say('She gasps. "Where did you &ndash;"');
			say('"It\'s legit, " I assure her. "We got savings now."');
			say('"In that case &ndash; yes!"');
			say('We kiss for a while. "Now go back to your big case, Mr Private Investigator," she tells me with a wink.');
			Game.things.ruby.engaged = true;
		}
	}

	return conv;
}

function hero_injured(method) {
	// todo: take away some money

	say("&nbsp;");

	if(method=='shot') {
		Game.game_time += 300 + pick(120); // 5 to 7 hours
		say("I wake up in a hospital ward with a new scar.");
	} else {
		Game.game_time += (90 + pick(60)); // 1.5 to 2.5 hours
		say("I wake up a couple hours later in a hospital ward with a sore head.");
	}

	if(!Game.things.photograph_of_ruby.seen && !Game.things.ruby.introduced) {
		say('My sweetheart, Ruby, stands over me. She\'s one of the doctors here.');
		Game.things.ruby.introduced = true;
	}

	stop_fuse('ruby_badmood');
	Game.vars.hero_injured = true;
	put_hero('hospital_ward', true);

	if(method=='shot') {
		say('"You\'re lucky as well as stupid," says Ruby. "That bullet missed your ' +
		    pickOne(['heart', 'spine']) + ' by about a tenth of an inch."');
	}

}

function hero_arrested(crime) {

	hide('cop_car');
	stop_fuse('cawmill_warrant');
	put('garroway', 'police_department');

	put_hero('cell', true);
	put('lieutenant', 'cell');
	Game.game_time += 55 + pick(10);
	say("&nbsp;");
	say("An hour of processing, fingerprinting and testing the fifth amendment later, I'm in a cell.");
	say('Lieutenant Miles walks in.');

	var txt = '';
	if(crime=='speakeasy') {
		txt = "What were you thinking, reporting that speakeasy? Half the department drinks there,";
	} else {
		txt = "Can't keep away from trouble, can you?";
	}

	if(Game.things.garroway.bribes) {
		Game.things.garroway.bribes--;
		say('"' + txt + '" he says. "Fortunately, Officer Garroway seems to be in a good mood with you. ' +
		    'Don\'t tell me why. You\'re free to go."');
	} else if(pay(10)) {
		say('"' + txt + '" he says. "I managed to sweeten the boys in uniform for you, but they\'d appreciate a contribution to the ' +
		    'petty cash fund."');
		say('I hand over ten simoleons.');
	} else if(Game.things.money.left) {
		say('"' + txt + '" he says. "I managed to sweeten the boys in uniform for you, but they\'d appreciate a contribution to the ' +
		    'petty cash fund."');
		say('I hand over my cash. "Guess I\'m walking home," I tell him.');
		Game.things.money.left = 0;
	} else {
		say('"' + txt + '" he says. "I managed to sweeten the boys in uniform for you. Try to keep your nose clean in future."');
	}
}

function lieutenant_arrives() {
	say("Lieutenant Miles walks in.");
	put('lieutenant', police_cell());

}


Game.things.macdonald_house = {
	description: "Macdonald house",
	active_verbs: ["enter"],
	before: {
		enter: function() {
			return enter_macdonald_house();
		}
	},
	enter_to: "macdonald_foyer",
}
function enter_macdonald_house() {
	if(!Game.vars.entered_macdonald_house) {
		say("The door's unlocked. I let myself in.");
		put_hero('macdonald_foyer');
		Game.vars.entered_macdonald_house = true;
		return true;
	} else {
		return false;
	}
}
Game.rooms.macdonald_foyer = {
	description: "I'm in the foyer of a nice house.",
	directions: {
		north: "macdonald_parlor",
		up: "macdonald_landing",
		out: "louisiana_and_princeley",
	},
	is_macdonald_house: true,
	indoors: true,
};
Game.things.macdonald_stairs = {
	name: "stairs",
	description: "carpeted staircase",
	location: "macdonald_foyer",
};

Game.rooms.macdonald_parlor = {
	description: "I'm in a spacious parlor.",
	indoors: true,
	directions: {
		south: "macdonald_foyer",
		east: "macdonald_kitchen",
	},
	is_macdonald_house: true,
};
Game.things.macdonald_armchair = {
	name: "armchair",
	description: "armchair",
	location: "macdonald_parlor",
};
Game.things.radio = {
	name: "radio",
	description: "radio set",
	location: "macdonald_parlor",
	active_verbs: ["tune"],
	// todo: listen
};

Game.rooms.macdonald_kitchen = {
	description: "I'm in a huge kitchen.",
	directions: {
		west: "macdonald_parlor",
	},
	indoors: true,
	is_macdonald_house: true,
};
Game.things.stove = {
	description: "cooking stove",
	location: "macdonald_kitchen",
};
Game.things.refrigerator  = {
	location: "macdonald_kitchen",
	active_verbs: ["open"],
	contents: ["belljar"],
};
Game.things.belljar = {
	portable: true,
	value: 2,
	description: 'belljar labeled "PROTOTYPE 2"',
	active_verbs: ["open"],
	contents: ["hamburger"],
};
add_rule('before', 'open', 'belljar', function() {
	Game.vars.found_hamburger = true;
	return false;
});

Game.things.hamburger = {
	portable: true,
	value: 0,
	name: "sandwich",
	description: 'weird round sandwich',
	edible: true,
	active_when_carried: ["eat"],
};
add_rule('before', 'eat', 'hamburger', function() {
	say("I take a bite out of " + the_thing('hamburger') + ". The bread's dry, and the meat inside tastes a bit off &ndash; \
	     I don't mean bad, but inaccurate, like somebody tried to explain the taste of a steak to a person who'd never had one. \
		 It's soft and very easy to eat.");
		 if(!Game.things.hamburger.bitten) {
			Game.things.hamburger.description += ' (partly eaten)';
			Game.things.hamburger.bitten = true;
		 }
	return true;
});


Game.things.kitchen_cupboard = {
	description: "kitchen cupboard",
	name: "cupboard",
	location: "macdonald_kitchen",
	active_verbs: ["open"],
	contents: ["turpentine"],
};
Game.things.turpentine = {
	description: "can of turpentine",
	portable: true,
	value: 1,
	active_verbs: ["read"],
	writing: "Handy Hank's Oil of Turpentine. Useful for thinning or stripping paint. Warning: TOXIC!",
};

Game.rooms.macdonald_landing = {
	description: "I'm on an upstairs landing.",
	directions: {
		north: "professors_bedroom",
		south: "mrs_macdonalds_bedroom",
		down: "macdonald_foyer",
	},
	indoors: true,
	is_macdonald_house: true,
};
Game.rooms.professors_bedroom = {
	description: "I'm in a dusty bedroom.",
	directions: {
		south: "macdonald_landing",
	},
	indoors: true,
	is_macdonald_house: true,
};
Game.things.professors_bed = {
	description: "single bed",
	location: "professors_bedroom",
};
Game.things.professors_wardrobe = {
	name: "wardrobe",
	description: "mahogany wardrobe",
	location: "professors_bedroom",
	active_verbs: ["open"],
	contents: ["tweed_jacket"],
};
Game.things.professors_desk = {
	name: "desk",
	description: "workdesk with drawers",
	location: "professors_bedroom",
	active_verbs: ["open"],
	contents: ["pipe", "tobacco", "crossword_book"],
}
Game.things.bust_of_louis_pasteur = {
	name: "bust",
	description: "bust of Louis Pasteur (on desk)",
	location: "professors_bedroom",
};
Game.things.crossword_book = {
	description: "crossword puzzle book",
	name: "crossword book",
	portable: true,
	value: 0,
	active_when_carried: ["read"],
};
add_rule('before', 'read', 'crossword_book', function() {
	if(!is_lit(Game.hero_location)) {
		say("It's too dark to read!");
		return true;
	}

	say("This is a slim volume containing page after page of black and white grids. All of them have been completely filled in \
	     with untidy capital letters.");
	return true;
});

Game.things.pipe = {
	description: "tobacco pipe",
	portable: true,
	value: 2,
	always: function() {
		do_pipe();
	},
};
Game.things.tobacco = {
	description: "pouch of tobacco",
	portable: true,
	value: 0.5,
};
On_hold.push(function() {
	set_active('pipe', 'fill', held('pipe') && in_scope('tobacco') && !Game.things.pipe.alight && !Game.things.pipe.filled);
	set_active('pipe', 'light', held('pipe') && carried('lighter') && !Game.things.pipe.alight && Game.things.pipe.filled);
	set_active('tobacco', 'put_in_pipe', held('tobacco') && in_scope('pipe') && !Game.things.pipe.alight && !Game.things.pipe.filled);
});
function do_pipe() {
	if(Game.things.pipe.alight && !held('pipe')) {
		say((carried('pipe') ? "My" : "The") + " pipe goes out.");
		delete Game.things.pipe.alight;
		Game.things.pipe.description = "tobacco pipe";
	}
	set_active('pipe', 'unlight', Game.things.pipe.alight);

	if(held('pipe') && Game.things.pipe.alight && !pick(3)) {
		say('Cherry-smelling tobacco smoke rises from the pipe in my hand.')
	}
}
add_rule('before', 'fill', 'pipe', function() {
	say("I take a pinch of tobacco from the pouch and stuff it into the bowl of the pipe.");
	Game.things.pipe.filled = true;
	Game.things.pipe.description = "tobacco pipe (filled)";
	return true;
});
add_rule('before', 'light', 'pipe', function() {
	if(!Game.things.pipe.filled) {
		say("There's no tobacco in the pipe.");
	} else {
		say("I light the pipe with my lighter and start puffing.");
		say("I must say, this feels sophisticated as hell.");
		delete Game.things.pipe.filled;
		Game.things.pipe.alight = true;
		Game.things.pipe.description = "tobacco pipe (lit)";
	}
	return true;
});
add_rule('before', 'unlight', 'pipe', function() {
	say("I tamp the pipe out with my thumb.");
	delete Game.things.pipe.alight;
	Game.things.pipe.description = "tobacco pipe";
});

Game.things.tweed_jacket = {
	description: "tweed jacket with elbow patches",
	portable: true,
	wearable: true,
	value: 5,
};

Game.rooms.mrs_macdonalds_bedroom = {
	description: "I'm in a neat bedroom.",
	directions: {
		north: "macdonald_landing",
	},
	indoors: true,
	is_macdonald_house: true,
};
Game.things.mrs_macdonalds_bed = {
	name: "bed",
	description: "single bed",
	location: "mrs_macdonalds_bedroom",
};
Game.things.vanity_table = {
	name: "vanity table",
	description: "vanity table with drawers",
	location: "mrs_macdonalds_bedroom",
	active_verbs: ["open"],
	contents: ["periodic_table", "scientific_journal", "science_notebook"],
};
add_rule('before', 'open', 'vanity_table', function() {
	Game.vars.discovered_mrs_m_science = true;
	return false;
});

Game.things.mrs_macdonalds_wardrobe = {
	name: "wardrobe",
	description: "pine wardrobe",
	location: "mrs_macdonalds_bedroom",
	active_verbs: ["open"],
	contents: ["cocktail_dress"],
};
Game.things.cocktail_dress = {
	portable: true,
	wearable: true,
	value: 10,
};
add_rule('before', 'wear', 'cocktail_dress', function() {
	say("It's not really my color.");
	return true;
});
Game.things.periodic_table = {
	name: "periodic table",
	description: "periodic table of the elements",
	portable: true,
	value: 0.25,
	active_verbs: ["read"],
};
add_rule('before', 'read', 'periodic_table', function() {
	if(!is_lit(Game.hero_location)) {
		say("It's too dark to read!");
		return true;
	}

	say("There's antimony, arsenic, aluminum, selenium, and hydrogen, and oxygen, and nitrogen, and rhenium...");
	return true;
});
Game.things.scientific_journal = {
	portable: true,
	value: 0.25,
	name: "journal",
	description: "scientific journal",
	active_when_carried: ["read"],
	before: {
		read: function() {
			return read_journal();
		},
	}
};
Game.things.science_notebook = {
	portable: true,
	value: 0,
	name: "notebook",
	description: "handwritten notebook",
	active_when_carried: ["read"],
	before: {
		read: function() {
			return read_notebook();
		}
	}
};
function read_notebook() {

	// note: you must have read Mrs Macdonald's notepaper to get this far,
	// because that's how the address of the house is revealed

	say("The notebook is full of handwritten calculations and chemical formulas that I can't make head nor tail of. \
	     There are enough exclamation marks and circled bits that it must be something exciting, to the right people anyway. \
		 And the handwriting &ndash; that's Mrs Macdonald\'s, same as on the notepaper she wrote her address on.");

	return true;
}

function read_journal() {
	say('It\'s this quarter\'s issue of the "American Journal of Food Chemistry". I flip to one of the articles, but it\'s way above my level.');
	return true;
};



Game.things.marcus = {
	name: "pale young man",
	description: "pale young man",
	met_name: "Marcus",
	met_description: "Marcus Q Distain",
	location: "office_building",
	is_alive: true,
	pronouns: male_pronouns,
	active_verbs: ["talk"],
	image: "res/img/marcus.png",
	image_height: "183",
	image_width: "175",
	conversifier: function() {
		return conv_marcus();
	},
	always: function() {
		check_finale('marcus');
	},
}
add_rule('before', 'talk', 'marcus', function() {
	if(location_of('marcus')=='office_building' && (
		location_of('mrs_macdonald')=='my_office' || location_of('wexler')=='my_office'
	)) {
		say('"I have a client in my office at the moment," I tell the guy, "but I\'ll be with you as soon as possible."');
		say('He looks at me with goggling eyes. "I\'ll wait," he says.');
		return true;
	}
	return false;
});
function conv_marcus() {

	var conv = {};

	conv.end_conversation = "The man stares at me with his bulbous eyes."

	conv.start_conversation = function() {

		if(!case_open("A Study in Squid")) {

			say('"Step into my office, Mr..."');
			say('"Distain," he tells me. "Marcus Q Distain." He walks inside, and I follow.');
			meet('marcus');
			put('marcus', 'my_office');
			put_hero('my_office', true);

			open_case("A Study in Squid");
			say('"Tell me what this is about," I say.');
			say('"You may have heard of me," says Marcus Q Distain, taking out a handkerchief and wiping his palms. \
				"I am something of a writer. I specialize in short horror novels. My recent \'Giant Space Prawns Sleep Beneath \
				 the North Pole\' won the Incredible Stories scientific fiction award."');
			say('"I\'m... not much of a reader," I tell him. "Why is it that you need my services?"');
			say('"My aunt died two months ago," says the guy, "and I inherited her old house on Second Avenue. I moved in there as it seemed \
				 a suitably atmospheric place to work on my new book. But at night I hear strange noises from downstairs, moans and \
				 squelches, and I\'m sure that yesterday morning I found the furniture moved. At night, I\'ve been seeing vivid images \
				 of squirming tentacles and..."');
			Game.things.marcus.mentioned_aunt = true;
			say('"You know I\'m a P.I. and not a ghost-hunter, right?" I say.');
			// say('"Well, that\'s not all, Mr Rose. Some pearls went missing."');
			say('"Please, Mr Rose."');
			say('I mull it over. "I\'ll take a look, Mr Distain."');
		} else {
			say("Marcus looks at me with his goggly eyes.");
		}
	}

	conv.asks = {};
	if(case_open('A Study in Squid')) {
		conv.asks.house = function() {

			if(hero_location().is_distain_house) {
				say('"What can you tell me about this house?" I ask.');
				say('"Oh, it has a fascinating history," says the guy, mopping a drop of sweat from his forehead. "It was built during the great \
					 New Losago Silver Rush, and rumors are that ten miners were left to suffocate in a collapsed tunnel on the land. \
					 There\'s a pre-Columbian campground under the kitchen garden, and suspected witches were executed \
					 there by Puritan settlers, and during the Civil War the house was used as a field hospital \
					 for creepy orphans with unfinished business in the mortal world. Like I said, atmospheric."');
			} else {
				say('"This house you inherited," I say. "Can you tell me &ndash;"');
				say('"Oh, it has a fascinating history," says the guy, mopping a drop of sweat from his forehead. "It was built during the great \
					 New Losago Silver Rush, and rumors are that ten miners were left to suffocate in a collapsed tunnel on the land. \
					 There\'s a pre-Columbian campground under the kitchen garden, and suspected witches were executed \
					 there by Puritan settlers. During the Civil War the house was used as a field hospital \
					 for creepy orphans with unfinished business in the mortal world, and &ndash;"');
				Game.things.marcus.explained_house = true;
				say('"&ndash; where it is?" I continue, raising my voice a little.');
				say('"Ah," he says. "Second Avenue and Nebraska Street.' +
					(Game.hero_location=='my_office' ? ' One block south and one block west of here.' : '') +
					'"'
				);
				add_taxi_destination('Distain house', 'nebraska_and_2nd');
			}
		}
	/*	conv.asks.pearls = function() {
			say('"These pearls," I say. "Where were they, and when did you realize they were missing?"');
			say('"Well, that is to say &ndash; I didn\'t exactly know where they were, or ever see them. But I\'m quite sure Aunt Aconita \
				had them. She used to boast about it. They didn\'t turn up in her will, or I\'d have contested it, which means she\'s \
				tried to sneak them away from me. I want them back."');
			say('"I\'ll see what I can find," I say.');
		}; */
		conv.asks.aunt = function() {
			say('"Tell me about your late aunt," I prompt the guy.' + (Game.things.marcus.explained_house ? ' "Briefly."' : ''));
			say('"Aunt Aconita was... not the generous sort," says Distain thoughtfully. "We never had much of a relationship. In my childhood \
				 I didn\'t see her often &ndash; she worked fishing boats in the Pacific, wasn\'t on land much of the time, and rarely visited \
				 us out in New England. When I did see her, well, \
				 I\'m sure she didn\'t like me. Perhaps that\'s why she left me ' + (hero_location().is_distain_house ? 'this' : 'that') +
				 ' liability of a house," he muses.');
			Game.vars.aconita_mentioned = true;
		};

		if(Game.vars.read_about_treasure) {
			conv.asks["treasure"] = function() {
				say('"Mr Distain," I say, "I have reason to believe your aunt may have hidden some money in this house. Do you know anything \
					about that?"');
				say('Distain shakes his head. "That\'s just the sort of thing the old rat would lie about, just so she can keep being annoying \
					from the next life. I\'ve searched every square inch inside this house, and there\'s nothing of value. I have to conclude \
					it\'s what we writers call a red herring."');
			};
		}

		conv.asks.money = function() {
			if(!Game.things.marcus.paid_50) {
				say('"I\'ll charge fifty dollars now, and fifty when I get to the bottom of it," I tell him.');
				say('"That\'s fine," he says. "I just got an advance on a story, you know." He digs in the inside pocket of his jacket and pulls out a $50 bill.');
				get_money(50);
				Game.things.marcus.paid_50 = true;
			} else {
				say('"I already paid you, sir," he says with an awkward expression.')
			}
		};

		if(Game.vars.seen_tunnel) {
			conv.asks.tunnel = function() {
				say('"You know there\'s an old tunnel under this house?" I say.');
				say('"Yes, so I\'ve been told," says Marcus. "It\'s from the old silver mine. I guess they used it to move the ore straight out \
				to the city docks."');
			};
		}

		conv.tells = {};
		if(Game.vars.learned_about_smuggling) {
			conv.tells.smuggling = function() {
				say('"I may have gotten to the bottom of your mystery, Mr Disdain," I tell him. "It seems those old tunnels under your house are \
					being used to illegally smuggle squid."');
				say('Distain looks nonplussed. "Why?" he says?');
				if(!Game.vars.learned_about_invisible_ink) {
					say('"I\'m afraid I don\'t know why."');
					say('"Then find out, Mr Rose," he snaps back. "I am a storyteller! To me, an incomplete story is like an itch \
						I can never scratch. No ' + (Game.things.marcus.paid_50 ? 'more ' : '') + 'money till you can tell me what the big deal \
						is with these contraband cephalopods."');
					Game.things.marcus.demanded_explanation = true;
				} else {
					say('"Their ink, apparently. Makes a good invisible ink for the cloak-and-dagger guys in national security." I tell him \
						all about the tunnels, the secret basement, the ' + (Game.things.brinkman.met ? 'senator' : 'guy in the overcoat') + '.');
					marcus_happy();
				}
			}

		}
		if(Game.things.marcus.demanded_explanation && Game.vars.learned_about_invisible_ink) {
			conv.tells["invisible ink"] = function() {
				say('"I found out what the squids are for," I say. I tell him all about the invisible ink, the secret basement, the tunnels, \
					the ' + (Game.things.brinkman.met ? 'senator' : 'guy in the overcoat') + '.');
				marcus_happy();
			}
		}


	/*	if(!Game.things.marcus.got_pearls && Game.things.bag_of_pearls.looked) {
			conv.tells.pearls = function() {
				say('"Mr Distain," I tell him, "I found your aunt\'s pearls."');
				if(carried('bag_of_pearls')) {
					say('"Is that them?" he says, with eyes wider than usual, and snatches them from me.');
					take_away('bag_of_pearls');
					Game.things.marcus.got_pearls = true;
				}

				say('"Good," he replies curtly. "Hand them over."');
			};
		} */
	}

	return conv;
}
function marcus_happy() {
	if(case_closed('A Study in Squid')) {
		say('"You already told me all this, Mr Rose," says Marcus Q Distain. "Here\'s a tip from a professional: if you want to get \
			paid twice for the same story, wait a year and swap a few words around."');
	} else {
		close_case('A Study in Squid');
		var outstanding = (Game.things.marcus.paid_50 ? 60 : 110);
		say('Marcus Q Distain\'s eyes widen, an impressive feat.\n\
			"Fascinating!" he says. "Squid! Spies! Secret tunnels! This story has it \
			all. I may base my next-but-one book on it. Well, thank you, Mr Rose. I\'ll let them keep smuggling, of course &ndash; and now I\'ll be \
			able to listen to those strange noises at night knowing I\'m doing my part for the country. Can\'t let America fall to the commies \
			for the sake of a few stupid squids, eh? Here\'s your money, Mr Rose, plus a tip." He hands over $' + outstanding + '.');
		get_money(outstanding);
		say('Another satisifed client. I guess I should get on with some other cases.');
	}
}



Game.things.dilapidated_house = {
	location: "nebraska_and_2nd",
	active_verbs: ["enter"],
	name: "house",
	description: "dilapidated house",
};
add_rule('before', 'enter', 'dilapidated_house', function() {
	if(!(case_open("A Study in Squid") || case_closed("A Study in Squid"))) {
		say("I got no business snooping in there right now.");
		return true;
	}

	if(!Game.things.dilapidated_house.doorknob_gone) {
		say("I try the doorknob, and it comes off in my hand. I push the door and it opens reluctantly.");
		give_hero('doorknob');
		Game.things.dilapidated_house.doorknob_gone = true;
	} else {
		say("The door has no doorknob. I push it heavily and it opens.");
	}
	put_hero('distain_hallway');
	return true;
});
Game.things.doorknob = {
	description: "broken doorknob",
	portable: true,
	value: 2000,
};

Game.rooms.distain_dining_room = {
	indoors: true,
	is_distain_house: true,
	description: "I'm in an oblong dining-room.",
	directions: {
		west: "distain_hallway",
	},
};
Game.things.distain_dining_table = {
	description: "long dining table",
	location: "distain_dining_room",
};
Game.things.chandelier = {
	description: "chandelier",
};

Game.rooms.distain_hallway_north = {
	indoors: true,
	is_distain_house: true,
	description: "I'm at the north end of a long hallway.",
	directions: {
		south: "distain_hallway",
	},
};
Game.things.distain_hook = {
	name: "hook",
	description: "rusty iron hook (on wall)",
	location: "distain_hallway_north",
}
Game.things.crowbar = {
	portable: true,
	value: 2,
	location: "distain_hallway_north",
};
Game.things.oil_lamp = {
	name: "lamp",
	description: "old-fashioned oil lamp (hanging on hook)",
	portable: true,
	value: 2,
	location: "distain_hallway_north",
	always: function() {
		set_active('oil_lamp', 'light', carried('oil_lamp') && !Game.things.oil_lamp.is_lit);
		set_active('oil_lamp', 'unlight', carried('oil_lamp') && Game.things.oil_lamp.is_lit);
	},
};
add_rule('after', 'take', 'oil_lamp', function() {
	Game.things.oil_lamp.description = "old-fashioned oil lamp";
});

Game.rooms.distain_hallway = {
	indoors: true,
	is_distain_house: true,
	description: "I'm in a long hallway with strangely shaped tiles.",
	directions: {
		north: 'distain_hallway_north',
		east: 'distain_dining_room',
		west: 'distain_study',
		out: 'nebraska_and_2nd', // todo: make the door one-way, so you have to find another way out?
	},
};
Game.things.floor_panel = {
	name: "panel",
	description: "panel in floor (closed)",
	location: "distain_hallway",
	active_verbs: ["open"],
};
add_rule('before', 'open', 'floor_panel', function() {
	say("There's no obvious way to do that.");
	deactivate_verb('floor_panel', 'open');
	return true;
});
Game.things.distain_ladder = {
	name: "ladder",
	description: "ladder leading down",
	// no location - it gets put there when the panel opens
	active_verbs: ["descend"],
	descend_to: "distain_ladder_bottom",
};
Game.rooms.distain_ladder_bottom = {
	dark: true,
	is_distain_house: true,
	indoors: true,
	description: "I'm at the bottom of a ladder, in a tiny, dank basement room.",
	directions: {
		up: "distain_hallway", // "up", NOT "climb ladder" to get out, so you can get out if it's dark!
	},
};

Game.things.cellar_door = {
	description: "cellar door",
	location: "distain_ladder_bottom",
	active_verbs: ["enter"],
	enter_to: "cellar",
};

Game.rooms.cellar = {
	indoors: true,
	is_distain_house: true,
	directions: {
		out: 'distain_ladder_bottom',
	},
	description: "I'm in a bare cellar.",
};
Game.things.planks = {
	description: "planks nailed over a hole in the wall",
	location: "cellar",
};
On_hold.push(function() {
	do_planks();
});

function do_planks() {
	set_active('planks', 'remove', held('crowbar'));
	set_active('planks', 'saw', held('wood_saw'));
};
add_rule('before', 'remove', 'planks', function() {
	return remove_planks();
});
add_rule('before', 'saw', 'planks', function() {
	return remove_planks();
});
function remove_planks() {
	if(held('crowbar')) {
		say("I pry the planks off the wall, revealing a hole in the wall just big enough to squeeze through.");
		hide('planks');
		put('hole', 'cellar');
		put('hole_tunnelside', 'tunnel_n2');
	} else if(held('wood_saw')) {
		say("I saw through the planks, revealing a hole in the wall just big enough to squeeze through.");
		hide('planks');
		put('hole', 'cellar');
		put('hole_tunnelside', 'tunnel_n2');
		put('sawdust', 'cellar');
	} else {
		// shouldn't happen!
		console.log('Tried to remove planks without crowbar or saw?');
		say("I'm not holding anything I can remove the planks with.");
		return true;
	}
	return true;
}
Game.things.sawdust = {
};
Game.things.hole = {
	description: "hole in wall",
	active_verbs: ["enter"],
	enter_to: "tunnel_n2",
};

Game.rooms.tunnel_n2 = {
	description: "I'm in an old tunnel.",
	indoors: true,
	dark: true,
	is_tunnel: true,
	directions: {
		east: "sewerend_house",
		northwest: "tunnel_m1",
	},
	always: function() {
		check_visited_tunnel();
	},
}
function check_visited_tunnel() {
	if(in_scope('hole_tunnelside')) {
		Game.vars.seen_tunnel = true;
	}
}
Game.things.hole_tunnelside = {
	name: "hole",
	description: "hole in wall",
	active_verbs: ["enter"],
	enter_to: "cellar",
	/* location: "tunnel_n2" // gets put there when you open it from the other side */
};
Game.things.rails_n2 = {
	name: "rails",
	description: "rusty rails running northwest",
	location: "tunnel_n2",
};
Game.things.bumper_n2 = {
	name: "bumper",
	description: "old railway bumper",
	location: "tunnel_n2",
};
Game.things.inkpuddle = {
	name: "puddle",
	description: "puddle of ink",
	location: "sewer_junction",
}


Game.rooms.tunnel_m1 = {
	description: "I'm at a slight bend in an old tunnel.",
	indoors: true,
	dark: true,
	is_tunnel: true,
	directions: {
		north: "tunnel_l1",
		southeast: "tunnel_n2"
	},
};
Game.things.rails_m1 = {
	name: "rails",
	description: "rusty rails running north to southeast",
	location: "tunnel_m1",
};
Game.things.minecart = {
	name: "minecart",
	description: "ancient minecart (on rails)",
	location: "tunnel_m1",
	active_verbs: ["ride"],
};
add_rule('before', 'ride', 'minecart', function() {
	var direction;
	if(location_of('minecart') == 'tunnel_l1') {
		direction = 'southward';
	} else if(location_of('minecart') == 'tunnel_m1') {
		direction = 'northward';
	} else {
		direction = 'northwestward';
	}
	say("The wood of the cart groans as I climb uncertainly in. My weight shifts it, and the cart moves. \
		It speeds up, rockets " + direction + " along the rails, and collides with a spine-shaking smack against an old bumper. \
		I fall out onto the track. Oof!");
	if(location_of('minecart') == 'tunnel_l1') {
		put_hero('tunnel_n2', true);
		put('minecart', 'tunnel_n2');
	} else {
		put_hero('tunnel_l1', true);
		put('minecart', 'tunnel_l1');
	}

	if(Game.vars.chase_started && direction=='southward') {
		say('I think I shook off the Cardiccis &ndash; at least for a few more minutes.')
		set_fuse('chase_ending', 12);
	}

	return true;
});

Game.rooms.tunnel_l1 = {
	description: "I\'m at the end of an old tunnel.",
	indoors: true,
	dark: true,
	is_tunnel: true,
	directions: {
		south: "tunnel_m1",
	},
};
Game.things.rails_l1 = {
	name: "rails",
	description: "rusty rails running south",
	location: "tunnel_l1",
};
Game.things.bumper_l1 = {
	name: "bumper",
	description: "old railway bumper",
	location: "tunnel_l1",
};

Game.things.closed_manhole_inside = {
	name: "manhole",
	description: "closed manhole above me",
	location: "tunnel_l1",
	active_verbs: ["open"],
	before: {
		open: function() {
			say("The tunnel ceiling is low enough to give it a shove... but it\'s no good. The manhole won't open from this side.");
			deactivate_verb('closed_manhole_inside', 'open');
			return true;
		}
	}
}
Game.things.open_manhole_inside = {
	name: "manhole",
	description: "open manhole above me",
};

// it MUST be possible to get out of the sewers without a light source (i.e. using only directions, not "enter hole", "climb ladder" etc)
// (n.b. it IS possible to get into the sewers without a light, if you bring one to the cellar, light it, then put it down)
Game.rooms.sewerend_house = {
	description: "I'm in a stinking sewer.",
	indoors: true,
	dark: true,
	is_sewer: true,
	directions: {
		east: "sewer_maze",
		west: "tunnel_n2"
	},
};
Game.always.push(function() {
	do_sewer();
});
Game.things.inkpuddle_sewerend = {
	name: "puddle",
	description: "puddle of ink",
	location: "sewerend_house",
};
Game.things.warning_sign = {
	name: "sign",
	description: "warning sign on wall",
	location: "sewerend_house",
	active_verbs: ["read"],
	writing: "New Losago Department of Sanitation</p>\
			  <p>DANGEROUS AREA</p>\
			  <p>No unauthorized personnel"
}


function do_sewer() {
	if(!hero_location().is_sewer) {
		return;
	}

	if(Game.hero_location == 'sewerend_house' || Game.hero_location == 'sewerend_cityhall') {
		Game.last_sewer_end_visited = Game.hero_location;
	}

	if(is_lit(Game.hero_location)) {
		if(!pick(3)) {
			say(pickOne([
				"Something drips from above.",
				"I nearly stepped in something. Yuch!",
				"I almost gag from the stench.",
			]));
		}
	} else {
		say(pickOne([
			"I hear dripping nearby.",
			"It smells disgusting in here.",
			"I think I stepped in something. Yuch!",
		]));
	}
}

Game.rooms.sewer_junction = {
	indoors: true,
	dark: true,
	is_sewer: true,
	description: "I'm in a maze of stinking sewers, all alike.",
	directions: {
		north: "sewer_maze",
		east: "sewer_maze",
		south: "sewer_maze",
		west: "sewer_maze",
		up: "maine_and_3rd",
	},
	before: {
		depart: function(dir) {
			leave_sewer(dir);
		},
	}
};
Game.rooms.sewer_maze = {
	indoors: true,
	dark: true,
	is_sewer: true,
	description: "I'm in a stinking maze of sewers, all alike.",
	directions: {
		north: "sewer_junction",
		east: "sewer_junction",
		south: "sewer_junction",
		west: "sewer_junction",
		up: "maine_and_3rd",
	},
	before: {
		depart: function(dir) {
			leave_sewer(dir);
		}
	}
};
Game.things.tentacle = {
	portable: true,
	value: 3,
	description: "disembodied tentacle",
	location: "sewer_maze",
}; /*
add_rule('after', 'take', 'tentacle', function() {
	if(!Game.things.tentacle.released_combo) {
		say("As I pick up the tentacle, the end of it unfurls lifelessly, releasing a small torn slip of white paper which wafts to the floor.");
		put('combo_paper', Game.hero_location);
		Game.things.tentacle.released_combo = true;
	}
});
Game.things.combo_paper = {
	name: "slip of paper",
	description: "torn slip of paper",
	active_when_carried: ["read"],
	portable: true,
	value: 0,
};
add_rule('before', 'read', 'combo_paper', function() {
	if(!Game.things.safe.combination) {
		set_safe_combo();
	}
});
function set_safe_combo() {
	var combo = (100000 + pick(900000)).toString();
	Game.things.safe.combination = combo;
	Game.things.combo_paper.writing = combo;
} */

function leave_sewer(dir) {
	if(dir != 'up') {
		return false;
	}

	// dump hero at a random street square
	Game.rooms[Game.hero_location].directions.up = random_intersection();
	say("I climb a metal ladder up a twisting passage, and emerge from a small manhole which closes invisibly under me.");
	//console.log('emerging from sewer at ' + Game.rooms[Game.hero_location].directions.up); // + intersection);
	Game.suppress_ok = true;
	return false;


	// doesn't work!
	say("I climb a metal ladder up a twisting passage, and emerge from a small manhole which closes invisibly under me.");
	//var intersection = random_intersection();
	//console.log('emerging from sewer at random intersection'); // + intersection);
	put_hero(random_intersection());
	return true;
}



Game.rooms.sewerend_cityhall = {
	dark: true,
	is_sewer: true,
	indoors: true,
	description: "I'm at the north end of a sewer.",
	directions: {
		south: "sewer_junction",
	}
};
Game.things.north_planks = {
	name: "planks",
	description: "planks nailed over a hole in the wall",
	location: "sewerend_cityhall",
};
On_hold.push(function() {
	do_north_planks();
});

function do_north_planks() {
	set_active('north_planks', 'remove', held('crowbar'));
	set_active('north_planks', 'saw', held('wood_saw'));
};
add_rule('before', 'remove', 'north_planks', function() {
	return remove_north_planks();
});
add_rule('before', 'saw', 'planks', function() {
	return remove_north_planks();
});
function remove_north_planks() {
	if(held('crowbar')) {
		say("I pry the planks off the wall, revealing a hole in the wall just big enough to squeeze through.");
		hide('north_planks');
		put('north_hole', 'sewerend_cityhall');
	} else if(held('wood_saw')) {
		say("I saw through the planks, revealing a hole in the wall just big enough to squeeze through.");
		hide('north_planks');
		put('north_hole', 'sewerend_cityhall');
		put('sawdust2', 'sewerend_cityhall');
	} else {
		// shouldn't happen!
		console.log('Tried to remove north planks without crowbar or saw?');
		say("I'm not holding anything I can remove the planks with.");
		return true;
	}
	return true;
}
Game.things.sawdust2 = {
	name: "sawdust",
	description: "sawdust",
};

Game.things.north_hole = {
	name: "hole",
	description: "hole in wall",
	active_verbs: ["enter"],
	enter_to: "spy_basement",
};
Game.things.spy_basement_hole = {
	name: "hole",
	description: "hole in wall",
	indoors: true,
	location: "spy_basement",
	active_verbs: ["enter"],
	enter_to: "sewerend_cityhall",
}


Game.rooms.spy_basement = {
	indoors: true,
	description: "I'm in a large basement room with an aquarium along one wall.",
	always: function() {
		do_basement();
	}
};
function do_basement() {
	if(!pick(3)) {
		say(pickOne([
			"I hear bubbling from the aquarium.",
			"In the corner of my eye, I see a dark shape move at the back of the aquarium.",
			"I hear a hissing from the aquarium.",
		]));
	}
}


Game.things.aquarium = {
	location: "spy_basement",
	active_verbs: ["look"],
};
add_rule('before', 'look', 'aquarium', function() {
	say("I move over to the aquarium, and keep as still as possible.");
	txt = '';
	if(!Game.things.aquarium.looked) {
		txt = "It takes me a minute, but I realize this isn't the whole aquarium. This is just a window onto an enormous tank extending a way \
			above this room and a longer way below it. ";
			Game.things.aquarium.looked = true;
	}
	say(txt + "As I watch, a great sucker-covered tentacle flits across the foreground, and I make out the shape of a monstrous, many-armed form \
		propelling itself through the water, before it vanishes back into the murk.");
	if(!Game.things.brinkman.arrived_in_basement) {
		say('"The gargantuan squid. A true wonder of nature," says a voice behind me. I turn, and I\'m face to face with a fifty-something man in \
			a business suit and a neat overcoat.');
		put('brinkman', 'spy_basement');
		Game.things.brinkman.arrived_in_basement = true;
	}
	return true;
});


Game.things.brinkman = {
	is_alive: true,
	pronouns: male_pronouns,
	name: "man",
	active_verbs: ["talk"],
	description: "guy in an overcoat",
	met_name: "Brinkman",
	met_description: "Senator Brinkman",
	conversifier: function() {
		if(case_open("A Twisty Little Murder")) {
			return conv_brinkman_atlm();
		} else {
			return conv_brinkman();
		}
	},
	image: "res/img/brinkman.png",
	image_height: "183",
	image_width: "175",
};

function conv_brinkman() {
	var conv = {};

	conv.asks = {};

	conv.start_conversation = function() {
		say('"How\'s business, Mr Rose?" asks ' + the_thing('brinkman') + '.');
	};

	if(!Game.things.brinkman.met) {
		conv.asks.himself = function() {
			say('I square up to the guy. "Who are you, and how do you know my name?"');
			say('"Come now, Mr Rose," says the guy. "Don\'t you have an interest in politics?"');
			if(Game.things.poster.seen) {
				say('I\'ve seen his face somewhere before &ndash; I remember. A poster.');
				say('"You\'re a senator," I say.');
				say('The senator nods. "George Manhattan Brinkman. And as for how I know you, well, it\'s part of my job to know things \
					about people. And for them not to know how I know."');
			} else {
				say('"I just vote for whoever\'s doing the least to fight crime," I say. "That\'s my livelihood, you know."');
				say('"Well, let me introduce myself. George Manhattan Brinkman. I happen to be a US Senator. And as for how I know you, well, \
				it\'s part of my job to know things about people. And for them not to know how I know."');
			}
			meet('brinkman');
		}
	}

	if(Game.hero_location=='spy_basement') {
		conv.asks.room = function() {
			say('"What is this place?" I ask the guy.');
			say('"Nowhere," he replies sharply. "This room doesn\'t exist, and you and I are not having this conversation, Mr Rose. \
			Any rumors you may hear about a secret intelligence base below the New Losago City Hall are entirely unfounded. \
			You understand me," he adds, but it\'s not a question.');
		};
	}

	if(case_open("A Study in Squid")) {
		conv.asks.squid = function() {
			say('"What can you tell me about this, uh, gigantic squid?" I ask.');
			say('"Gargantuan," he corrects me. "Reclusive animal. Lives in the mid-Pacific at almost inaccessible depths, \
				somewhere near Tangaroa. Apex predator, feeds on large fish, small whales, and the occasional unlucky sailor. Amazing creature. \
				I wouldn\'t get too attached to this one, though. We\'re harvesting him tomorrow."');
			say('"Harvesting him? For his meat?"');
			say(the_thing('brinkman', true) + ' shakes his head. "They taste about as disgusting as they look. But what they\'re useful \
				for is their ink."');
			Game.things.brinkman.mentioned_ink = true;
		};

		if(Game.things.brinkman.mentioned_ink) {
			conv.asks.ink = function() {
				say('"What\'s so important about the ink?" I say.');
				say('"Oh, it\'s very special ink," says the ' + (Game.things.brinkman.met ? 'guy' : 'senator') + '. They live so far down under the ocean, there\'s practically no light. So it\'s invisible, see?"');
				if(Game.hero_location=='spy_basement') {
					say('He pulls a sheet of blank paper from an inside pocket of his overcoat. "The next few decades are going to be very \
						interesting, Mr Rose. As you may be aware, this country has its \
						enemies. The Russians, the Germans, the Japanese, and even subversive \
						elements right here in America. We all need to keep secrets from each other. So our guys pass around papers written in the invisible ink of the gargantuan squid. Looks blank - until you put it under one of these. It\'s called an ultraviolet lamp."');
					Game.things.uv_lamp.description = "ultraviolet lamp (on desk) (lit)";
					Game.things.uv_lamp.is_lit = true;
					deactivate_verb('uv_lamp', 'light');
					activate_verb('uv_lamp', 'unlight');
					say('He places the paper under the strange-looking lamp' + (!Game.things.uv_lamp.is_lit ? ' and flicks the switch' : '') + '. \
						A bright purple glow emanates from the bulb. On the paper in the man\'s hand, I can just make out the outline of a building \
						and the words \"COMMIE HQ\" before he folds it lengthwise and puts it back in his pocket.');
					say('"Impressive," I say. "But is it worth wiping out a species for?"');
					say('"It\'s them or us, Mr Rose."');
				};
				Game.vars.learned_about_invisible_ink = true;
			};
		}
	}

	conv.end_conversation = function() {
		say('"Thanks for your time, ' + (Game.things.brinkman.met ? 'senator' : 'sir') + '," I tell him.');
	}

	return conv;
}

Game.things.uv_lamp = {
	name: "lamp",
	description: "strange-looking lamp (on desk)",
	location: "spy_basement",
	active_verbs: ["light"],
	always: function() {
		set_active('flashlight', 'light', !Game.things.uv_lamp.is_lit);
		set_active('flashlight', 'unlight', Game.things.uv_lamp.is_lit);
	},
}
add_rule('after', 'light', 'uv_lamp', function() {
	say("A bright purple glow emanates from the bulb, bathing the room in an odd light.");
});
add_rule('after', 'unlight', 'uv_lamp', function() {
	say("The light in here seems more normal now.");
});




Game.rooms.distain_study = {
	indoors: true,
	description: "I'm in a wood-paneled study.",
	is_distain_house: true,
	directions: {
		east: 'distain_hallway',
	},
}
Game.things.writing_desk = {
	description: "writing desk",
	location: "distain_study",
};
Game.things.typewriter = {
	description: "typewriter (on desk)",
	location: "distain_study",
	active_verbs: ["type"],
};
add_rule('before', 'type', 'typewriter', function() {
	say("I punch a few keys. Clickety-click click click. DING!");
	if(!Game.things.typewriter.got_paper) {
		say("The barrel spins and spits out a sheet of blank paper, which flutters to the floor.");
		put('blank_paper', Game.hero_location);
		Game.things.typewriter.got_paper = true;
	};
	return true;
});
Game.things.blank_paper = {
	name: "typewriter paper",
	portable: true,
	active_when_carried: ["read"],
	description: "sheet of typewriter paper",
}
add_rule('before', 'read', 'blank_paper', function() {
	if(in_scope('uv_lamp') && Game.things.uv_lamp.is_lit) {
		say('By the purple light, I can make out cursive handwriting on the paper:');
		say('"Dear Skipper,</p><p>\
			\"Well, the doctors have told me I\'ve got a few months. I could spend them with you, \
			but if I\'m going to be alone for eternity, I may as well start getting used to it. There\'s parts \
			of the world I haven\'t seen, mostly inland, so I\'m going trekking for a while and I may be some \
			time. I\'ve left my house to my nephew Marcus, and pulled strings to make sure he keeps it, so you can \
			carry on using the tunnels. He\'ll be too dumb to notice.</p><p>\
			"Now, Skipper, I\'ve never been one for expressing my emotions freely, but the years that \
			you and I spent together, well, they were nice, I guess. I saved up a bit of wealth over the decades, \
			but a priest told me you can\'t take it with you, which came as a bit of a shock, so I suppose \
			you can have it. I hid some treasure in the house.</p><p>\
			"See you when I see you,</p><p>\
			"Ackie."');
		Game.vars.read_about_treasure = true;
	} else {
		say("It seems to be blank.");
	}
	Game.things.blank_paper.read = true;
	return true;
});

Game.things.statuette = {
	description: "statuette of a raven (on desk)",
	location: "distain_study",
	portable: true,
	value: 0.5,
};
add_rule('after', 'take', 'statuette', function() {
	Game.things.statuette.description = "statuette of a raven";
	if(!Game.things.floor_panel.open) {
		say("As I lift the raven, I hear a grinding noise from outside the room.");
		Game.things.floor_panel.open = true;
		Game.things.floor_panel.description = "panel in floor (open)";
		deactivate_verb('floor_panel', 'open');
		put('distain_ladder', 'distain_hallway');
	}
});
Game.things.letter_to_distain = {
	name: "letter",
	description: "letter to Marcus Q Distain",
	writing: "Dear Mr Distain,</p>\
	<p>\"Thank you for submitting your short story 'The Man Who Explored A Creepy Tunnel For Hours And Hours And \
	Then Something Happened That Was Too Terrible To Describe'.</p>\
	<p>\"The story is several times longer than it needs to be, mainly because of your habit of prefacing every noun \
	with two or three 'spooky' adjectives. You seem to believe that long words are all you need to create atmosphere; in particular, \
	the word 'Cyclopean' appears over 200 times in your story. The piece has no plot to speak of, and \
	the coded (and not-so-coded) racism is a bit much, even for this era.</p>\
	<p>\"In short, this is just the sort of thing we at 'Grotesque Tales' are looking for. I enclose a handsome advance royalty check, and look \
	forward to receiving more of your work.</p>\
	<p>\"Sincerely,</p>\
	<p>FINLAY KNUCKLESWORTH</p>\
	<p>Editor, 'Grotesque Tales'</p>\
	<p>Louisiana Street &amp; 5th Avenue, New Losago",
	active_when_carried: ["read"],
	portable: true,
	location: "distain_study",
};
add_rule('after', 'read', 'letter_to_distain', function() {
	add_taxi_destination("publishers' offices", location_of('publishers_offices'));
});


Game.things.city_hall = {
	location: "louisiana_and_4th",
	description: "City Hall",
//	active_verbs: ["enter"],
	enter_to: "city_hall_foyer",
};

Game.rooms.city_hall_foyer = {
	directions: {
		out: "louisiana_and_4th",
	},
	description: "I'm in the ornately decorated foyer of New Losago's City Hall.",
	indoors: true,
};

Game.things.ocean = {
	description: "ocean stretching away to the west",
};

Game.always.push(function() {
	do_ocean();
});
function do_ocean() {
	if(hero_location().by_ocean) {
		put('ocean', Game.hero_location);
	}
}
for(var st=0; st<=4; ++st) {
	Game.rooms[corner_int_name(st, 1)].by_ocean = true;
}

Game.rooms.dockyard = {
	description: "I'm in the New Losago dockyard.",
	by_ocean: true,
	directions: {
		east: "louisiana_and_1st",
	},
	before: {
		depart: function() {
			return check_leave_dockyard();
		}
	}
};
add_rule('before', 'enter', 'fishing_boat', function() {
	return check_leave_dockyard();
});
add_rule('before', 'enter', 'manhole', function() {
	return check_leave_dockyard();
});
function check_leave_dockyard() {
	if(in_scope('brinkman') && !Game.vars.chase_started) {
		say('"Oh, you\'re not going anywhere," says Brinkman.');
		return true;
	} else {
		return false;
	}
}
enter_from("dockyard", "louisiana_and_1st");
/* add_rule('before', 'enter', 'dockyard', function() {
	if(!case_open("A Study in Squid")) {
		say("The docks aren't open at the moment.");
		return true;
	}
}); */

Game.things.containers = {
	description: "shipping containers",
	location: "dockyard",
};
Game.rooms.fishing_boat = {
	description: "I'm on a fishing boat moored at the city docks.",
	directions: {
		out: 'dockyard',
	},
	by_ocean: true,
	always: function() {
		check_boat_ending();
	},
};
Game.things.fishing_boat = {
	name: "boat",
	active_verbs: ["enter"],
	enter_to: "fishing_boat",
	// not at docks - gets put there when case is opened
};

function check_boat_ending() {
	if(Game.vars.chase_started) {
		Game.talking_to = 'sailor';
		say('I run onto the boat at full speed. The sailor gets to her feet. "Hold it there, landlubber," she says. "What are you in such a \
			hurry about?"');
		show_conversation();
	}
}


/*
add_rule('before', 'open', 'safe', function() {
	if(Game.things.safe.ever_opened) {
		say('I enter the combination again, and the safe swings open.');
		return true;
	};
	if(!Game.things.combo_paper.read) {
		var combo = (100000 + pick(900000)).toString();
		say('For the hell of it, I try a random combination: "' + combo + '"');
		if(combo == Game.things.safe.combination) {
			say('By some astonishing coincidence, I got it right. The safe swings open.');
			Game.things.safe.ever_opened = true;
			return false;
		} else {
			say("But by a cruel stroke of bad luck, it doesn't work.");
			return true;
		}
	} else {
		say('The number I saw on that brown paper was a nice number: ' + Game.things.safe.combination + '. I try that.');
		say('Wow, it worked! The safe swings open.');
		Game.things.safe.ever_opened = true;
		return false;
	}
}); */
/*
Game.things.ships_log = {
	portable: true,
	description: "ship's log",
	name: "ship's log",
	active_when_carried: ["read"],
};

add_rule('before', 'read', 'ships_log', function() {
	say("I flip the book open to the most recently filled in page. It reads, in the wavy penmanship of a drunken sailor:")
	say('"Secret cephalopod-smuggling mission, day 36. We found a shoal of gargantuan squid near Tangaroa and are heading back to port \
	    with a breeding pair. Fishing and trading of the gargantuan squid are banned, but the tunnels Aconita told us about will allow us to \
		get them to our clients without attention. The perfect crime! I just hope nobody finds this log I\'m writing about it."');
	Game.vars.aconita_mentioned = true;
	return true;
});
*/

Game.things.sailor = {
	location: "fishing_boat",
	is_alive: "true",
	gender: "female",
	description: "old sailor",
	pronouns: female_pronouns,
	conversifier: function() {
		return conv_sailor();
	},
	active_verbs: ["talk"],
	always: function() {
		do_sailor();
	},
	image: "res/img/sailor.png",
	image_height: "183",
	image_width: "175",
};
function do_sailor() {
	if(!Game.things.sailor.met) {
		say('An old sailor sits cross-legged on the deck. "What you doin\' on my boat?" she slurs.');
		Game.things.sailor.met = true;
	}
}
function conv_sailor() {
	var conv = {};

	if(Game.vars.chase_started) {
		conv = {
			says: {
				"help me": function() {
					say('"You gotta help me," I tell her. "I\'m being pursued by a corrupt senator and two Italian mobsters."');
					say('The sailor beams. "Now this is a situation I\'m familiar with."');
					say('I\'ve never seen anyone so old work so fast. She\'s got the gangplank drawn, the anchor weighed and \
						the ship chugging out to sea before Brinkman and his goons can get off dry land.');
					say('&nbsp;');

					say('"There\'s plenty places to go," the sailor tells me later. "Tropical islands with palm-fringed \
					beaches. Drug havens with corrupt governments and friendly smugglers. Grumbling colonies with power vacuums. You \
					think about it, and I\'ll drop you off wherever you want. Resourceful person can always find a way to make it in this world."');
					//end_conversation();
					if(carried('photograph_of_ruby')) {
						hold('photograph_of_ruby');
					}
					Game.score++;
					show_score();
					/*stopAllMusic();
					playMusic("banjomusic"); */
					hero_location().music = "banjomusic";
					do_room_music();
					die('I lean on the railing and watch the familiar city skyline recede over the horizon. I\'ll find a way back, some day.',
						'Ending 1 of 3');
				}
			}
		}
		return conv;
	}

	conv.start_conversation = "The sailor looks up at me with unfocused eyes.";

	conv.asks = {
		boat: function() {
			say('"Nice boat," I say.');
			say('"She\'s called the Prawn Marie Rose," says the sailor with pride. "Ninety years in the water. Been to every shore of every \
				country on the globe. Done the full circle three times. Me and my partner had some great times on here, back in the day."');
			Game.things.sailor.mentioned_partner = true;
		},
	};

	if(Game.things.sailor.mentioned_partner) {
		conv.asks.partner = function() {
			say('"Where\'s your partner now?" I ask.');
			say('The old sailor\'s eyes mist up. "Aconita passed away a few months back. I been running the operation without her, \
				\'cause it\'s what she woulda wanted, but it ain\'t the same."');
			Game.things.sailor.mentioned_aconita = true;
		};
	}

	if(Game.things.sailor.mentioned_aconita) {
		conv.asks["Marcus Q Distain"] = function() {
			say('"This Aconita," I say. "Would she maybe be related to a Marcus Q Distain? Horror writer, goggly eyes?"');
			say('"That\'s her no-good nephew," says the sailor with a humph. "She left him a house in town because she knew he\'d never \
				do it up. He\'d probably think it was atmospheric or whatever. Then we could keep on usin\' the tunnels to &ndash;" she appears to \
				remember herself. "Hey, why you askin\' so many questions anyway?"');
		};
		Game.things.sailor.mentioned_tunnels = true;
	}

	conv.asks.ink = function() {
		say('"What\'s this puddle of ink doing here?" I ask.');
		say('"That\'s ink from a gargantuan squid," says the sailor. "They squirt it all over the place. Well, no sayin\' you heard it from me, \
			but there\'s a demand, a very lucrative demand for those creatures from... certain powerful men. \
			They wouldn\'t say what they want \'em for. But they\'re a protected species, see, so let\'s just say we can\'t \
			stroll through customs with a crateful."');
		Game.vars.learned_about_smuggling = true;
	};

	if(Game.things.sailor.mentioned_tunnels) {
		conv.asks.tunnels = function() {
			say('"You mentioned tunnels," I say.');
			if(!Game.things.map.got) {
				say('"Did I?" says the sailor. "Musta had a reason to tell you... there\'s the old mine railroad, that\'s easy. \
				Then there\'s the sewers. You\'ll get lost without a map, though. Aw, hell, you look trustworthy. Here you go."');
				say('She takes a map out of a pocket and hands it to me.');
				give_hero('map');
				Game.things.map.got = true;
			} else {
				say('"Sure," says the sailor. "There\'s the old mine railroad, that\'s easy. Then there\'s the sewers. You\'ll get lost without \
					a map, though. Hope you\'ve still got the one I gave you!"');
			}
		}
	};

	conv.tells = {};

	if(Game.vars.read_about_treasure) {
		conv.tells.letter = function() {
			if(carried('blank_paper')) {
				say('"Aconita called you Skipper, didn\'t she?" I say. "She wrote you a letter. Here." I hand over the typewriter paper.');
				take_away('blank_paper');
				say('The old sailor stares at the blank page.');
				say('"It\'s in invisible ink, I\'m afraid," I tell her. "It says she loved the years you spent together."');
			} else {
				say('"Aconita called you Skipper, didn\'t she?" I say. "She wrote you a letter. I don\'t have it with me, but you wouldn\'t \
					be able to read it anyway. It\'s written in squid. I sort of accidentally read it, so I can tell you what it says. She \
					loved the years you spent together."');
			}
			say('The sailor smiles. "Ackie wouldn\'t say that."');
			say('"All right. She said they were kinda nice."');
			say('"That\'s her."');
			say('"She also said she left you some treasure, and &ndash;"');
			say('"Ah, keep it, if you can find it," says the sailor. "I wouldn\'t have long to spend it anyway. Ackie wasn\'t one for \
				dealing in cash, by the way, so whatever it is, you\'ll probably have to pawn it. Go to Takahashi\'s shop on Second. \
				He won\'t rip you off."');
		};
	};

/*	if(Game.vars.read_about_treasure && !Game.things.doorknob.value_known) {
	} */

	conv.end_conversation = '"See you when I see you," says the sailor.';

	return conv;
}

Game.things.map = {
	description: "map of sewer system",
	portable: true,
	active_when_carried: ["read"],
}
add_rule('before', 'read', 'map', function() {
	if(!hero_location().is_sewer) {
		say('Yep, this looks easy enough. As long as I\'ve got this to look at, I reckon I could find my way through the city sewers no problem.');
	} else {
		if(next_sewer_end=='sewerend_cityhall') {
			say('Aha, so I go thisaway, then thattaway, left a ways, right a ways, along a ways, and here I am.');
		} else {
			say('Aha, so I go along a ways, left a ways, right a ways, then thattaway, then thisaway, and here I am.');
		}
		put_hero(next_sewer_end());
	}
	return true;
});

Game.last_sewer_end_visited = 'sewerend_house';
function next_sewer_end() {
		return Game.last_sewer_end_visited == 'sewerend_house' ? 'sewerend_cityhall' : 'sewerend_house';
}

Game.things.boat_inkpuddle = {
	name: "puddle",
	description: "puddle of ink",
	location: "fishing_boat",
};

Game.things.manhole = {
	name: "manhole",
	location: "dockyard",
	active_verbs: ["open"],
	enter_to: "tunnel_l1",
};
add_rule('before', 'open', 'manhole', function() {
	if(!held('crowbar')) {
		say("I can\'t get a grip on the cover with my fingers.");
		return true;
	} else {
		say("Ok. I manage to pry it open with the crowbar.");
		Game.things.manhole.description = "open manhole",
		deactivate_verb('manhole', 'open');
		activate_verb('manhole', 'enter');
		Game.rooms.tunnel_l1.directions.up = 'dockyard';
		hide('closed_manhole_inside');
		put('open_manhole_inside', 'tunnel_l1');
		return true;
	}
});
/* add_rule('before', 'enter', 'manhole', function() {
		if(!(carried('oil_lamp') || carried('flashlight'))) {
		say("It looks pretty dark down there. I don't think I should go in without some sort of light, or I'd never get out.");
		return true;
	} else {
		return false;
	}
}); */

Game.things.publishers_offices = {
    name: "publishers' offices",
	description: "publishers' offices",
	location: "louisiana_and_5th",
	active_verbs: ["enter"],
	enter_to: "publishers_offices",
	is_taxi_destination: true,
};
Game.rooms.publishers_offices = {
	description: "I'm in the swanky offices of a publishing company.",
	directions: {
		out: "louisiana_and_5th",
	},
	indoors: true,
};

/*
enter_from('storeroom', 'publishers_offices');
Game.rooms.storeroom = {
	description: "I'm in a poky storeroom.",
	directions: {
		out: "publishers_offices",
	},
};

Game.things.safe = {
	description: "safe with six-digit combination lock",
	location: "storeroom",
	active_verbs: ["open"],
	contents: ["bag_of_pearls"],
};
Game.things.bag_of_pearls = {
	description: "small cloth bag",
	name: "bag",
	active_when_carried: ["open"],
	value: 75000,
};
add_rule('before', 'open', 'bag_of_pearls', function() {
	if(!Game.things.bag_of_pearls.looked) {
		say("I open the cloth bag and peep inside. It contains about a dozen little iridescent white balls &ndash; pearls. There must be a hundred \
			 grand\'s worth here.")
		Game.things.bag_of_pearls.looked = true;
	} else {
		say("I open the cloth bag and peep inside. Yep, they\'re still there &ndash; a dozen white pearls. \
		Probably worth a hundred thousand dollars.");
	}
	return true;
});
*/

Game.things.publisher_reception_desk  = {
	name: "desk",
	description: "reception desk",
};
Game.things.publisher_receptionist = {
	name: "receptionist",
	description: "receptionist",
	is_alive: true,
	pronouns: female_pronouns,
	location: 'publishers_offices',
	active_verbs: ["talk"],
	conversifier: function() {
		return conv_receptionist();
	},
	image: "res/img/receptionist.png",
	image_height: "183",
	image_width: "175",
};
function conv_receptionist() {
	var conv = {};
	conv.start_conversation = function() {
		"The receptionist smiles up at me from behind her desk.";
		if(!case_open("A Study in Squid") || !Game.things.letter_to_distain.read) {
			say("\"I'm sorry, sir, but I don't believe you have an appointment,\" she says.");
			hide_conversation();
		}
	}
	conv.end_conversation = "The receptionist smiles again, and goes back to shuffling some papers.";

	conv.asks = {};
	if(case_open("A Study in Squid") && Game.things.letter_to_distain.read) {
		conv.asks["Finlay Knucklesworth"] = function() {
			say('"I\'m here to see Mr Knucklesworth," I say.');
			if(in_scope('knucklesworth')) {
				say('The receptionist looks blank. "He\'s standing right here!" she says.')
			} else {
				say('The receptionist looks unconvinced. "Do you have an appointment?"');
				say('"Yes," I answer, a little too quickly.');
				say('She gets up and knocks on a door to a side office. It opens, and a tall middle-aged guy \
				emerges. "This man says he\'s here to see you," the dame tells him, and sits back down.');
				put('knucklesworth', 'publishers_offices');
				hide_conversation();
			}
		}
		conv.asks["Marcus Q Distain"] = function() {
			say('"I\'m doing some work for one of your firm\'s authors," I tell the receptionist. "Marcus Q Distain. Do you know him?"');
			say('"Gee, there are so many," she says. She pauses. "Wait... the space prawns guy? Yeah, I seen him in here. Odd sort. \
			     Mr Knucklesworth seems to have taken a liking to him."');
		}
	}

	return conv;
}

Game.things.knucklesworth = {
	proper_name: true,
	description: "Finlay Knuckesworth",
	is_alive: true,
	pronouns: male_pronouns,
	active_verbs: ['talk'],
	conversifier: function() {
		return conv_knucklesworth();
	},
	image: "res/img/knucklesworth.png",
	image_height: "183",
	image_width: "175",
};
function conv_knucklesworth() {
	var conv = {};


	conv.start_conversation = 'The publisher looks me up and down. "I\'m a busy man, but I\'ll give you five minutes," he snaps. "What do you want?"';

	conv.asks = {
		'Marcus Q Distain' : function() {
			say('"I\'m interested in your professional relationship with Marcus Q Distain," I say.');
			say('"Whatever trouble he\'s in, I\'ve got nothing to do with it," says Mr Knucklesworth briskly. \
			     "The late Miss Aconita Distain &ndash; his aunt, I believe &ndash; bequeathed this firm a large sum of money on \
				  condition that we publish his terrible stories. She was keen for him to move into her old house in this city, \
				  so it wouldn\'t get bought up and renovated, or whatever. I\'m sure you\'ll find I\'ve acted within the law at all \
				  times."');
			Game.vars.aconita_mentioned = true;
		},
	};

	conv.end_conversation = function() {
		say('"You\'ve wasted enough of my time," says Mr Knucklesworth, and walks back into his office.');
		hide('knucklesworth');
	}

	return conv;
}
Game.always.push(function() {
	if(!in_scope('knucklesworth')) {
		hide('knucklesworth');
	}
});


enter_from('pawn_shop', 'maine_and_2nd');
Game.things.pawn_shop.is_taxi_destination = true;
Game.rooms.pawn_shop = {
	description: "I'm in a seedy-looking pawn shop.",
	indoors: true,
	directions: {
		out: "maine_and_2nd",
	}
};

On_hold.push(function() {
	do_pawnables();
});
Game.always.push(function() {
	do_pawnables();
});
function do_pawnables() {
	for(var thing in Game.things) {
		if(thing != 'money') {
			set_active(thing, 'unpawn', location_of(thing)=='pawn_shop' && Game.things[thing].pawned);
			if(location_of(thing)=='pawn_shop' && Game.things[thing].pawned) {
				deactivate_verb(thing, 'take');
			}
			set_active(thing, 'pawn', Game.hero_location=='pawn_shop' && held(thing));
		}
	}
}
Game.things.pawn_counter = {
	name: "counter",
	description: "marble counter",
	location: "pawn_shop",
}
Game.things.pawn_shelves = {
	name: "shelves",
	description: "dusty shelves (behind counter)",
	location: "pawn_shop",
};

Game.things.mr_takahashi = {
	name: "Mr Takahashi",
	description: "Mr Takahashi",
	is_alive: true,
	pronouns: male_pronouns,
	location: "pawn_shop",
	active_verbs: ["talk"],
	image: "res/img/takahashi.png",
	image_height: "183",
	image_width: "175",
	conversifier: function() {
		return conv_takahashi();
	}
}
function conv_takahashi() {
	var conv = {};

	var anything_pawned = false;
	for(var thing in Game.things) {
		if(Game.things[thing].pawned) {
			anything_pawned = true;
			break;
		}
	}

	conv.start_conversation = function() {
		say('"How are you today, Mr Rose?" says the pawnbroker, smiling. "Brought anything ' + (anything_pawned ? 'else ' : '') +
			'for me?' + (anything_pawned ? ' Or maybe you\'re here to get some of your stuff back?' : '') + '"');
	}
	conv.asks = {};
	conv.asks.pawning = function() {
		say('"Oh, you know how it works, Mr Rose," says Mr Takahashi. "Just hold something up, and if it\'s worth anything, maybe I\'ll take it."');
	}

	conv.end_conversation = '"Come back any time," says Mr Takahashi.'

	return conv;
}

function pawn(thing) {
	if(Game.talking_to != 'mr_takahashi') {
		Game.talking_to = 'mr_takahashi';
		show_conversation();
	}

	say('I show ' + the_thing(thing) + ' to Mr Takahashi.');
	if(Game.things[thing].illegal) {
		say('Mr Takahashi looks unimpressed. "I do not deal in illegal contraband, Mr Rose," he says.')
	} else if(!Game.things[thing].value) {
		say('Mr Takahashi takes one look at ' + the_thing(thing) + '. "That\'s worth nothing," he says through a stifled laugh.');
	} else {
		var value = ('Mr Takahashi looks at ' + the_thing(thing) + '.');

		if(thing=='doorknob') {
			say('Mr Takahashi looks taken aback. "This is solid silver, Mr Rose. And not just any silver. \
			New Losago Silver Rush silver &ndash; thought to have all been destroyed in the bimetallism gang wars of the 1890s. \
			I\'ll give you $' + Game.things.doorknob.value + ' for it."');
			Game.things.doorknob.value_known = true;
		} else if(thing=='statuette') { // red herring
			say('Mr Takahashi looks at the statuette in wonder and says "This is made of papier mach&eacute;, Mr Rose. I guess I could give \
				you 50 cents for it. Here."');
		} else {
			say('"' +
				pickOne(['Well', 'Hmmm', 'Let me see']) +
				pickOne([',', '...']) + '" he says. "I ' + pickOne(['suppose', 'guess', 'think']) + ' I' + pickOne(['\'ll', ' can', ' could']) +
				' give you' + pickOne(['', ', say,', ', oh,']) + ' ' +
				get_price(thing) + ' for ' + pronoun(thing, 1) + '."'
			);
		}

		say('He takes ' + the_thing(thing) + ' and hands over the cash.');
		if(!Game.vars.done_pawn) {
			say('"Come back and get it any time, as long as you have the money."');
			Game.vars.done_pawn = true;
		}
		take_away(thing);
		put(thing, 'pawn_shop');
		Game.things[thing].description += ' (on shelf)';
		Game.things[thing].pawned = true;
		get_money(Game.things[thing].value);
	}
}
function unpawn(thing) {
	if(Game.talking_to != 'mr_takahashi') {
		Game.talking_to = 'mr_takahashi';
		show_conversation();
	}
	var price = Game.things[thing].value;
	var priceStr = get_price(thing);
	if(pay(price)) {
		say('I give Mr Takahashi ' + priceStr + ' and point to ' + the_thing(thing) + '. He grudgingly takes ' +
			pronoun(thing, 1) + ' off the shelf and hands it back to me.');
		give_hero(thing);
		if(Game.things[thing].description.indexOf(' (on shelf)')!=-1) {
			Game.things[thing].description = Game.things[thing].description.substring(0, Game.things[thing].description.indexOf(' (on shelf)'));
		}
		delete Game.things[thing].pawned;
	} else {
		say('Mr Takahashi shakes his head. "' + capitalise(get_price(thing)) + '!"');
		say('Drat. I haven\'t got it on me.');
	}
}


/**************************** utilities *******************************/

function enter_from(inside, outside) {
	// quick way of creating a thing that is a building representing the room of the same name
	// e.g. enter_from('church', 'village')
	Game.things[inside] = {
		description: inside.split('_').join(' '),
		active_verbs: ["enter"],
		enter_to: inside,
		location: outside
	}
}

function in_words(n) { // for 0 <= n <= 20; otherwise just return a string containing the number
	if(n >= 21) {
		return '' + n;
	} else {
		return ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
			'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'][n];
	}
}

function capitalise(str) { // capitalise first letter
	if(str.length == 0) {
		return '';
	} else if(str.length == 1) {
		return str.toUpperCase();
	} else {
		return str.charAt(0).toUpperCase() + str.substring(1);
	}
}

function get_price(thing) {
	var price;
	if(!Game.things[thing].value) {
		price = 0;
	} else {
		price = parseFloat(Game.things[thing].value, 10);
	}

	if(price < 1) {
		return Math.round(100 * price) + ' cents';
	} else if(price == Math.floor(price)) {
		if(price > 20) {
			return '$' + price;
		} else {
			return in_words(price) + ' dollar' + (price==1 ? '' : 's');
		}
	} else {
		if(price > 20) {
			return '$' + price.toFixed(2);
		} else {
			var dollars = Math.floor(price);
			var cents = Math.round(100 * (price - dollars));
			return in_words(dollars) + s(dollars) + ' and ' + in_words(cents) + s(cents);
		}
	}
}
function s(n) {
	return (n==1 ? '' : 's');
}

function resolve(txt) {
	// take a string with [ options | choices ] like this in it, and [pick | choose | etc] each one. No nesting.

	if(txt.indexOf('[') == -1) {
		return txt;
	}

	var txtBeforeBracket = txt.substring(0, txt.indexOf('['));
	var bracketContents = txt.substring(1 + txt.indexOf('['), txt.indexOf(']'));
	var txtAfterBracket = txt.substring(txt.indexOf(']'));

	return txtBeforeBracket +
	       pickOne(bracketContents.split('|')) +
	       (txtAfterBracket.length ? resolve(txtAfterBracket.substring(1)) : '');
}

function sayr(txt) {
	say(resolve(txt));
}



function do_room_music(force) {
	if(force || (hero_location().music &&
	   hero_location().music != currentMusic)) {
		currentMusic = hero_location().music;
		if(music_on()) {
			stopAllMusic();
			playMusic(currentMusic);
		}
	}
}

// musics
bassloopmusic = new Audio('res/sound/bass_loop.mp3');
bassloopmusic.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);

saxloopmusic = new Audio('res/sound/sax_loop.mp3');
saxloopmusic.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);

italianmusic = new Audio('res/sound/italian.mp3');
italianmusic.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);

swingmusic = new Audio('res/sound/groovy_swing.mp3');
swingmusic.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);
banjomusic = new Audio('res/sound/banjo_loop.mp3');
banjomusic.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);
spookymusic = new Audio('res/sound/spooky_loop.mp3');
spookymusic.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);
stringsloopmusic = new Audio('res/sound/strings_loop.mp3');
stringsloopmusic.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);
// todo: piano loop

musics = ['saxloopmusic', 'bassloopmusic', 'italianmusic', 'swingmusic', 'banjomusic', 'spookymusic', 'stringsloopmusic'];

// sound effects for spending and receiving money
cashregister = new Audio('res/sound/cash_register.mp3');
coinsnoise = new Audio('res/sound/coins.mp3');

$(document).ready(function() {
	if(music_on()) {
		saxloopmusic.play();
	}
	//$('#title').html("No case open");

});

function stopAllMusic() {
	musics.forEach(function(music) {
		eval(music).pause();
	});
}

function playMusic(music) {
	eval(music).currentTime = 0;
	eval(music).play();
}

function open_case(case_name) {

	if(Game.vars.failed_cases.indexOf(case_name)!= -1) {
		say('\n<u>Case reopened: ' + case_name.toUpperCase() + '</u>');
	} else {
		say('\n<u>Case opened: ' + case_name.toUpperCase() + '</u>');
	}
	//Game.vars.case_open = case_name;
	//$('#title').html(case_name);

	removeFrom(Game.vars.failed_cases, case_name);

	Game.vars.open_cases.push(case_name);

	if(case_name == "Speakeasy Street" && !Game.rooms.speakeasy.visited) {
		put('hearse', 'louisiana_and_3rd');
		put('coffins', 'louisiana_and_3rd');
		put('gianni', 'louisiana_and_3rd');
		put('luigi', 'louisiana_and_3rd');
	}

	else if(case_name == "A Study in Squid") {
		put('fishing_boat', 'dockyard');
	}
}
function case_open(case_name) {
	return Game.vars.open_cases.indexOf(case_name) != -1;
}

function case_closed(case_name) {
	return Game.vars.closed_cases.indexOf(case_name) != -1;
}

function num_cases_closed() {
	var n = 0;
	if(case_closed("A Study in Squid")) { ++n; }
	if(case_closed("The Big Pickle")) { ++n; }
	if(case_closed("Speakeasy Street")) { ++n; }
	if(case_closed("A Twisty Little Murder")) { ++n; }
	return n;
}

// this is called when a case is closed permanently
function close_case(case_name) {
	say('&nbsp;');
	say('<u>Case closed: ' + case_name.toUpperCase() + '</u>');

	Game.score++;
	Game.vars.closed_cases.push(case_name);
	removeFrom(Game.vars.open_cases, case_name);

	if(case_name=='Speakeasy Street') {
		if(Game.things.maryjoloubelle.gone) {
			say("Well, the booze isn't getting any better, at least not until someone puts up " +
			    "enough bribe money to get Prohibition repealed. But I found out what was going on, " +
			    "so I guess I did the detectiving all right. Something tells me Mr Wexler won\'t be \
				happy, though. Hope the girl does enough with her life to make it worth it.");
		} else {
			say("Some people just got callings, whether they like 'em or not. Detectives gotta detect, " +
			    "and moonshiners gotta moonshine. The good booze will be flowing again shortly, " +
			    "and a city with good booze is a city with good times. And who knows, maybe soon someone " +
			    "will put up enough bribe money to get Prohibition repealed, and the girl can follow " +
			    "her heart then.");
		}
		say("I guess I should go find Wexler and see about getting " +
			(Game.things.wexler.paid_50 ? 'the rest of ' : '') + "my fee.");
	}


}

function fail_case(case_name) {
	say('<u>Case failed: ' + case_name.toUpperCase() + '</u>');

	if(!Game.vars.failed_cases) {
		Game.vars.failed_cases = [];
	}

	Game.vars.failed_cases.push(case_name);
	removeFrom(Game.vars.open_cases, case_name);

	if(case_name=='Speakeasy Street') {
		hide('gianni');
		hide('luigi');
		hide('hearse');
		hide('coffins');
		put('note_from_wexler', 'my_office');
		put('wexler', 'wexlers_apartment');
	}

	// todo: end the game if you failed all 3 cases

	//delete Game.vars.case_open;
	//$('#title').html("No case open");

	say('I guess I should get back to my office and see what else I got to do.');

}

function check_finale(victim) {
	if(case_open("A Twisty Little Murder")) {
		return;
	}
	if(num_cases_closed() == 3 ||
		(victim=='marcus' && Game.vars.learned_about_invisible_ink && case_closed('The Big Pickle') && case_closed('Speakeasy Street'))) {
		// go!
		hide(victim);
		if(victim=='marcus') {
			say('Uh oh.');
			close_case("A Study in Squid");
			say('But it looks like I just got a new case...');
		} else {
			say('Uh oh. Looks like I just got a new case...');
		}
		open_case("A Twisty Little Murder");
		Game.vars.murder_victim = victim;
		put('corpse', Game.hero_location);
		put('blood_puddle', Game.hero_location);
		say('Lying on the floor, face down in a puddle of blood, is ' +
			Game.things[victim].description + '.');
		Game.things.corpse.description = Game.things[victim].description + "'s corpse";
	}
}

Game.things.corpse = {
	name: "corpse",
	active_verbs: ["search"],
}
Game.things.blood_puddle = {
	name: "blood",
	description: "puddle of blood"
}
add_rule('before', 'search', 'corpse', function() {
	say("I lean down and take a look. Bullet between the shoulderblades. No valuables on " + pronoun(Game.vars.murder_victim, 1) + ".");

	if(!Game.vars.chase_started) {
		say("&nbsp;");
		say("A guy walks through the door with a gun in his hand. It\'s " +
			(Game.things.brinkman.met ? "Senator Brinkman" : "the guy in the overcoat, from the spy basement") + ".");
		var senator_guy = (Game.things.brinkman.met ? 'senator' : 'overcoat guy');
		say('"Oh dear, Mr Rose," he says. "Looks like you lost your temper and murdered this poor ' +
			(Game.vars.murder_victim=='mrs_macdonald' ? 'lady' : 'man') + '." He snaps the fingers of his non-gun hand. "Goons!"');
		say('Two other men walk into the room: Gianni and Luigi Cardicci. The ' + senator_guy +
			' gives Gianni a nod, and he socks me in the stomach. Luigi gets behind me and shoves a cloth bag over my head. Someone lifts \
			me, bundles me into a car...');
		say('&nbsp;');
		Game.game_time += 30;

		say('It\'s a half hour later and I\'m in the New Losago dockyard. The ' + senator_guy + ' is here, flanked \
			by Gianni and Luigi, each holding a Tommy-gun.');
		say('"He\'s waking up, Senator Brinkman," says Gianni.');
		if(!Game.things.brinkman.met) {
			say('Huh &ndash; a senator. I knew I\'d seen his face somewhere.');
			meet('brinkman');
		};
		put_hero('dockyard', true);

		put('brinkman', 'dockyard');
		put('gianni', 'dockyard');
		put('luigi', 'dockyard');

		put('minecart', 'tunnel_l1');
		// let's not make the player rely on having left the minecart at L1 themselves - they had no way to know this scene was coming.
	}

	return true;
});
function conv_brinkman_atlm() {
	var conv = {};

	conv.start_conversation = function() {
		say('The senator\'s forehead wrinkles as he looks at me. "Well, Mr Rose. Here we are."');
	}

	conv.asks = {
		"what's going on" : function() {
			say('"What\'s going on?" I say.')
			say('"Quit playing dumb," says Senator Brinkman. "My people have seen what you\'ve been up to. I know you were \
				sniffing round the science buliding at Corndale College. I know you visited Swampy Hollow. I know \
				you know the truth about the gargantuan squid. And I know," he concludes with emphasis, "that you were an intimate \
				associate of ' + Game.things[Game.vars.murder_victim].description + '."');
			Game.things.brinkman.mentioned_all = true;
		},
	};

	conv.asks[Game.things[Game.vars.murder_victim].description] = function() {
		say('"What did ' + Game.things[Game.vars.murder_victim].description + ' do to end up like ' +
			pronoun(Game.vars.murder_victim, 0) + ' did?" I ask.');
		say('"Nice try, Mr Rose," the senator sneers. "We know the two of you were on to us."');
	};

	if(Game.things.brinkman.mentioned_all) {
		conv.asks["Corndale College"] = function() {
			say('"I\'m sorry," I say. "What was that about Corndale College?"');
			say('"I said quit playing dumb!" the guy fumes. "We know you\'re not as stupid as you pretend to be. Just like you know Corndale College \
				is where we were perfecting the science for turning invisible ink into invisible EXPLODING ink!"');
			Game.things.brinkman.mentioned_exploding_ink = true;
		}

		conv.asks["Swampy Hollow"] = function() {
			say('"What\'s Swampy Hollow got to do with this?"');
			say('"Like you don\'t know!" the senator cries. "We were hijacking the city\'s moonshine supply \
				and filling some of the booze bottles with squid ink, to be sent to the college for processing. That way \
				if our people get seen, they got a foolproof cover story. No one cares about college fraternity boys getting \
				drunk. You also deduced that I\'d cosigned an order for the Clunketts\' land to be sold off and developed into a \
				fast food restaurant, so we could shut them up and send them packing when we were done. It was the perfect front &ndash; \
				and you and your friend were about to blow it wide open!"');
		}

		conv.asks["gargantuan squid"] = function() {
			say('"What truth about the gargantuan squid would this be?" I asked.')
			say('The senator scoffs. "I knew you weren\'t buying that baloney about the invisible ink. I should\'ve come up with \
				something better. Spy memos, seriously? Hell, we share half our intelligence with the enemy anyway. \
				But you knew it\'s what we can turn the invisible ink INTO that\'s valuable."');
		}
	};

	if(Game.things.brinkman.mentioned_exploding_ink) {
		conv.asks["exploding ink"] = function() {
			say('"Let me see if I got this... you\'re trying to make invisible, exploding ink?" I ask.')
			say('"We\'re nearly there!" he says, his voice rising in pitch and volume. "As soon as we find the stable formula, \
				we can carry out our plan."');
		}
		Game.things.brinkman.mentioned_plan = true;
	};

	if(Game.things.brinkman.mentioned_plan) {
		conv.asks.plan = function() {
			say('"Your plan?"');
			say('"Our plan, Mr Rose, as you very well know!" He\'s practically cackling now. "With invisible exploding ink, we will possess \
				the ultimate weapon. We\'ll send undetectable incendiary letters to high-profile politicians and business leaders all across \
				Europe, and they\'ll blame it on communists or anarchists or whoever. The world\'s already-dwindling imperial powers \
				will be politically and financially destabilized for a generation. With luck, they\'ll even have another war. Leaving the way \
				clear for a new American century. GET HIM, BOYS!"');
			start_chase();
		}
	}

	conv.end_conversation = function() {
		say('"Really?" says Brinkman. "You don\'t want the customary expositional talk before I have my guys shoot you? \
			Fine. GET HIM, BOYS!"');
		start_chase();
	}

	return conv;
}

function start_chase() {
	Game.vars.chase_started = true;
	hide_conversation();
	say('As the Cardicci brothers\' hands move to their guns, the world slows down. I got maybe five seconds to start running.');
	set_fuse('chase_ending', 3);
};
Game.always.push(function() {
	if(Game.vars.chase_started && Game.fuses.chase_ending.time < 2 && in_scope('gianni')) {
		explode_fuse('chase_ending');
	}
});
Game.fuses.chase_ending = {
	explode: function() {
		if(in_scope('gianni')) {
			die('The Cardicci brothers let rip with their Tommy-guns.');
		} else {
			put('gianni', Game.hero_location);
			put('luigi', Game.hero_location);
			die('The Cardicci brothers catch up with me, and let rip with their Tommy-guns.');
			stopAllMusic();
		}
	}
}


/*
 * misc. payphones
 */

var phonefunc = function() {
	has_payphone();
}
// quite a lot in downtown
Game.rooms.louisiana_and_4th.always = phonefunc;
Game.rooms.kentucky_and_3rd.always = phonefunc;
Game.rooms.kentucky_and_5th.always = phonefunc;
Game.rooms.maine_and_5th.always = phonefunc;
Game.rooms.ohio_and_5th.always = phonefunc;

// a couple in Westside
Game.rooms.kentucky_and_1st.always = phonefunc;
Game.rooms.ohio_and_1st.always = phonefunc;

// none in Princeley Heights: residential area & everyone is rich enough to have a phone at home

Game.things.payphone = { // comes last
	name: "phone booth",
	description: "phone booth",
	active_verbs: ["call_taxi"],
};


/*
 * The taxi
 * Allows the hero to travel quickly between locations
 */

Game.things.taxi = {
	description: "yellow cab",
	active_verbs: ["hail"],
	list_last: true,
	before: {
		hail: function() {
			return hail_taxi();
		}
	}
};

function hail_taxi() {
	if(!carried('money')) {
		say('The cabbie drives past without stopping.');
		hide('taxi');
		return true;
	};

	say('The cab stops and I get in.'); // The cabbie snarls, "Where ya wanna go?"');
	put_hero('taxi', true);
	set_fuse('taxi', 4);
	return true;
}
Game.fuses.taxi = {
	explode: function() { /*
		if(Game.hero_location != 'taxi') {
			console.log("can't kick hero out of taxi when they're not in it!");
			return;
		}
		if(Game.talking_to=='cabbie') {
			set_fuse('taxi', 1);
		} else {
			say('"No timewasters!" yells the cabbie, and kicks me out.');
			put_hero(Game.things.taxi.location);
			stop_fuse('taxi');
			say("The yellow cab drives off.");
			hide('taxi');
		}
		*/
	},
};
Game.rooms.taxi = {
	directions: {},
	description: "I'm in the back of a yellow cab.",
	always: function() {
		Game.rooms.taxi.directions.out = location_of('taxi');
	},
	before: {
		depart: function(direction) {
			say("The cabbie shakes " + pronoun('cabbie', 2) + " head and drives off.");
			stop_fuse('taxi');
			hide('taxi');
		},
		drop: function(thing) {
			say("Best not leave my stuff lying in taxis.");
			return true;
		}
	},
	after: {
		arrive: function() {
			start_conversation('cabbie');
		}
	}
}
Game.things.cabbie = {
	location: 'taxi',
	description: "surly cabbie",
	is_alive: true,
	startle: function() {
		say('"Not in MY cab," yells the cabbie, and kicks me out.');
		put_hero(location_of('taxi'));
		stop_fuse('taxi');
		hide('taxi');
	},
	active_verbs: ["talk"],
	conversifier: function() {
		return conv_taxi();
	},
	image: "res/img/taxi.png",
	image_height: "183",
	image_width: "175",
}
function set_cabbie_gender() {
	Game.things.cabbie.pronouns = pick(2) ? male_pronouns : female_pronouns;
}

function conv_taxi() {
	var conv = { says: {}, };

	conv.start_conversation = 'The cabbie snarls, "Where ya wanna go?"';

	for(var i=0; i<Game.vars.taxi_destinations.length; ++i) {
		var dest = Game.vars.taxi_destinations[i];
		conv.says[ dest[0] ] = eval("f = function(){ taxi_to('" + dest[1] + "'); }"); // yuck
	}

	conv.end_conversation = 'The cabbie shakes ' + pronoun('cabbie', 2) + ' head.';

	return conv;
}

Game.always.push(function() {
	do_taxi();
});
function do_taxi() {
	if(Game.hero_location == 'taxi') {
		return;
	}

	for(var thing in Game.things) {
		if(Game.things[thing].location==Game.hero_location && Game.things[thing].is_taxi_destination) {
			add_taxi_destination(name(thing), location_of(thing));
		}
	}

	if(location_of('taxi') != Game.hero_location) {
		hide('taxi');
	}

	if(!pick(2) && location_of('taxi') == Game.hero_location && !Game.fuses.taxi_stays.time) {
		hide('taxi');
		say("The yellow cab drives off.");
		return;
	} else if(!pick(4) && hero_location().is_streets && location_of('taxi') != Game.hero_location) {
		put('taxi', Game.hero_location);
		say("A yellow cab comes into view.");
		set_cabbie_gender();
	}
}
Game.fuses.taxi_stays = {};
function taxi_to(destination) {
	if(destination == location_of('taxi')) {
		say('"You\'re already there, dum-dum," says the cabbie.');
		say(pronoun('cabbie', 0, true) + " kicks me out and drives off.");
		put_hero(destination);
		stop_fuse('taxi');
		hide('taxi');
		return;
	}

	if(!pay(1)) {
		say("I don\'t have enough money for the fare.");
		return;
	}

	Game.game_time += 10;
	say("The cab pulls up. I pay the fare and get out.");
	stop_fuse('taxi');
	put('taxi', destination);
	put_hero(destination);


	if(roomdesc_in_scroller()) {
		describe_room_in_scroller();
	}

}

function add_taxi_destination(name, location) {
	var alreadythere = false;
	Game.vars.taxi_destinations.forEach(function(dest) {
		if(dest[0]==name) {
			alreadythere = true;
		}
	});
	if(!alreadythere) {
		Game.vars.taxi_destinations.push([name, location]);
	}
}
function rename_taxi_destination(oldname, newname) {
	var newdests = [];
	Game.vars.taxi_destinations.forEach(function(dest) {
		if(dest[0]==oldname) {
			newdests.push([newname, dest[1]]);
		} else {
			newdests.push(dest);
		}
	});
}

function opposite_dir(dir) {
	return ['north', 'east', 'south', 'west', 'up', 'down', 'in', 'out', 'somewhere'][
	       ['south', 'west', 'north', 'east', 'down', 'up', 'out', 'in', 'away'].indexOf(dir)]
}

function the_dir(dir) {
	return ['the north', 'the east', 'the south', 'the west', 'upstairs', 'downstairs', 'inside', 'outside', 'somewhere'][
	       ['north',     'east',     'south',     'west',     'up',       'down',       'in',     'out',     'away'].indexOf(dir)];
}

function the_opposite_dir(dir) {
	return the_dir(opposite_dir(dir));
}

// set the whole of Distain house and sewer system to "spooky"
for(var room in Game.rooms) {
	if(Game.rooms[room].is_distain_house) {
		Game.rooms[room].spooky = true;
	}
}

// set music to "bassloopmusic" for all rooms that don't have one specified
for(var room in Game.rooms) {
	if(!Game.rooms[room].music) {
		Game.rooms[room].music =
			Game.rooms[room].spooky ? "spookymusic" :
			(Game.rooms[room].is_sewer || Game.rooms[room].is_tunnel) ? "stringsloopmusic" :
			Game.rooms[room].indoors ? "saxloopmusic" :
			"bassloopmusic";
	}
}

function meet(npc) {
	Game.things[npc].met = true;
	Game.things[npc].name = Game.things[npc].met_name;
	Game.things[npc].description = (Game.things[npc].met_description ? Game.things[npc].met_description : Game.things[npc].met_name);
	Game.things[npc].proper_name = true;
}


// money
Game.things.money = {
	portable: true,
	description: "money ($10.00)",
	left: 10,
	before: {
		drop: function() {
			return drop_money();
		}
	},
};
function drop_money() {
	say("That wouldn\'t be a wise move in this town.");
	return true;
};

function pay(dollars) {
	if(Game.things.money.left >= dollars) {
		Game.things.money.left -= dollars;
		Game.things.money.description = "money ($" + Game.things.money.left.toFixed(2) + ")";
		if(typing_sound()) {
			coinsnoise.play();
		}
		return true;
	} else {
		return false;
	}
}
function get_money(dollars) {

	Game.things.money.left += dollars;
	Game.things.money.description = "money ($" + Game.things.money.left.toFixed(2) + ")";

	if(typing_sound()) {
		cashregister.play();
	}
}


// activate look for everything with a Looks entry. This should be all the things!
for(var thing in Game.things) {
	if(Looks[thing]) {
		activate_verb(thing, 'look');
	}
}

// move metacommands buttons on resize

$(window).resize(function() {
	move_metacommands();
	animate_heights();
});

$(document).ready(function() {
	move_metacommands();
});

function move_metacommands() {
	if(is_landscape()) {
		$("#save_load_container").detach().appendTo('#left-column');
		$("#save_load_container").css('margin-top', '');
	} else {
		$("#save_load_container").detach().appendTo('#savefix'); // '#right-column');
		$("#save_load_container").css('margin-top', '20px');
	}
}


// overrides show_score() in versifier.js
function show_score() {
	document.getElementById('score').innerHTML =
	 (Game.score_percentage ? (Math.round((Game.score / Game.max_score) * 100) + '%') :
	 	(Game.score + '/' + Game.max_score)
	 ) +
	(is_landscape() ? ' &nbsp;&nbsp; $' + Game.things.money.left.toFixed(2) : '' );
}

function add_minutes(n) {
	Game.game_time += n;
}
// todo: walking around streets should take longer


function hide_splash() {
	$('#splashscreen').fadeOut();
	do_room_music(true);
}
