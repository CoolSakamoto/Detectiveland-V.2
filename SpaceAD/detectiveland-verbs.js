/*
 *
 * DETECTIVELAND
 * Verbs file
 * (c) by Robin Johnson - robindouglasjohnson@gmail.com - twitter.com/@rdouglasjohnson
 * Copy and distribute freely in unmodified form, preserving this licence.
 * No commercial use without permission of the author.
 *
 */


Verbs = {

	// take, drop and look come first, in that order
	take: {
		deactivate_when_carried: true,

		func: function(thing) {
			//Game.things[thing].carried = true;
			Game.things[thing].location = '';

			hold(thing);

			//activate_verb(thing, 'drop');

			if(Game.things[thing].wearable) {
				activate_verb(thing, 'wear');
			}

			for(var verb in Verbs) {
				if(Verbs[verb].activate_when_carried) {
					activate_verb(thing, verb);
				}
				if(Game.things[thing].active_when_carried) {
					if(Game.things[thing].active_when_carried.indexOf(verb) != -1) {
						activate_verb(thing, verb);
					}
				}
				if(Verbs[verb].deactivate_when_carried) {
					deactivate_verb(thing, verb);
				}
			}

			//Game.inventory.unshift(thing);

			say('Taken');
		}
	},

	drop: {
		activate_when_carried: true,
		deactivate_when_dropped: true,

		func: function(thing) {
			if(thing==Game.held) {
				unhold(true);
			}
			Game.things[thing].carried = false;
			Game.things[thing].location = Game.hero_location;

			if(Game.things[thing].portable) {
				activate_verb(thing, 'take');
			}

			//console.log('active_verbs are ' + Game.things[thing].active_verbs.join(','));
			var active_verbs = Game.things[thing].active_verbs;
			for(var i=active_verbs.length-1; i>=0; --i) {
				var verb = active_verbs[i];
				if(Verbs[verb] && Verbs[verb].deactivate_when_dropped ||
				   Game.things[thing].active_when_carried.indexOf(verb) != -1) {
					//console.log('it has deactivate_when_dropped');
					deactivate_verb(thing, verb);
				}
			}

			removeFrom(Game.inventory, thing);

			say('Dropped');
		}

	},

	look: {
		//display: "&#x1F50D;", // magnifying glass symbol
		phrasing: function(thing) {
			return "look at " + name(thing);
		},
		func: function(thing) {
			/* if(Looks[thing]) {
				if(typeof Looks[thing] === 'function') {
					Looks[thing]();
				} else {
					say(Looks[thing]);
				}
			} else */ if(Game.things[thing].longdesc) {
				say(Game.things[thing].longdesc);
			} else {
				say("I see nothing special.");
			}
		}
	},

	wear: {
		deactivate_when_dropped: true,

		func: function(thing) {
			unhold();
			Game.things[thing].worn = true;
			deactivate_verb(thing, 'drop');
			deactivate_verb(thing, 'wear');
			activate_verb(thing, 'remove');
			//Game.things[thing].description += " (I'm wearing " + pronoun(thing, 1) + ")";
			say("Ok, I'm wearing " + pronoun(thing, 1) + ".");
		}

	},

	remove: {
		func: function(thing) {
			Game.things[thing].worn = false;
			activate_verb(thing, 'drop');
			activate_verb(thing, 'wear'); // assume it's wearable, else how are you removing it?
			deactivate_verb(thing, 'remove');
			hold(thing);

			/*if(Game.things[thing].description.indexOf(" (I'm wearing"	) != -1) {
				Game.things[thing].description =
				 Game.things[thing].description.substring(0, Game.things[thing].description.indexOf(" (I'm wearing"));
			}*/
			say("Ok, I've taken " + pronoun(thing, 1) + " off.");
		}
	},

	read: {
		func: function(thing) {

			if(!is_lit(Game.hero_location)) {
				say("It's too dark to read!");
			} else {
				say(pronoun(thing, 0, true) + " read" + s(thing) + ":");
				say('"' + Game.things[thing].writing + '"');
				Game.things[thing].read = true;
			}
		}
	},

	light: {
		deactivate_when_dropped: true,
		func: function(thing) {
			Game.things[thing].is_lit = true;
			Game.things[thing].description += " (lit)";
			deactivate_verb(thing, 'light');
			activate_verb(thing, 'unlight');
			say("Ok, it's lit.");
		}
	},

	unlight: {
		deactivate_when_dropped: true,
		func: function(thing) {
			Game.things[thing].is_lit = false;
			var ixof = Game.things[thing].description.indexOf(" (lit)");
			if(ixof != -1) {
				Game.things[thing].description = Game.things[thing].description.substring(0, ixof);
			}
			deactivate_verb(thing, 'unlight');
			activate_verb(thing, 'light');
			say("Ok, I've put it out.");
		}
	},

	open: {
		phrasing: function(thing) {
			if(thing=='coffins') {
				return "open coffin"; // singular
			} else {
				return "open " + name(thing);
			}
		},
		func: function(thing) {
			//console.log('Game.things[thing].contents is ' + Game.things[thing].contents);
			if(!Game.things[thing].contents.length) {
				say("There's nothing inside.");
			} else {
				var l = Game.things[thing].contents.length;
				say((l==1 ? "Something falls" : "Some things fall") + " out.");

				Game.things[thing].contents.forEach(function(thing) {
					put(thing, Game.hero_location);
				});

				Game.things[thing].contents = [];
			}

		}
	},

	close: {
		phrasing: function(thing) {
			if(thing=='coffins') {
				return "close coffin";
			} else {
				return "close " + name(thing);
			}
		},
		func: function(thing) {
			say("Ok, it's closed.");
			Game.things[thing].open = false;
		}
	},

	move: {
		func: function(thing) {
			say("Nothing happens.");
		}
	},

	enter: {
		func: function(thing) {
			say("Ok");
			Game.hero_location = Game.things[thing].enter_to;
		}
	},

	exit: {
		phrasing: function(thing) {
			return "exit through " + name(thing);
		},
		func: function(thing) {
			say("Ok");
			Game.hero_location = Game.things[thing].exit_to;
		}
	},

	climb: {
		phrasing: function(thing) {
			if(thing=='open_manhole_inside') {
				return 'climb through manhole';
			} else {
				return 'climb ' + name(thing);
			}
		},
		func: function(thing) {
			if(worn('houseshoes')) {
				say("I can\'t climb anything while wearing these goofy houseshoes!");
				return;
			};

			say("Up I go...");
			Game.hero_location = Game.things[thing].climb_to;
		}
	},

	descend: {
		func: function(thing) {
			say("Down I go...");
			Game.hero_location = Game.things[thing].descend_to;
		}
	},

	drink: {
		func: function(thing) {
			say("Glug, glug...");
			take_away(thing);
		}
	},

	talk: {
		phrasing: function(thing) {
			return "talk to " + name(thing);
		},
		func: function(thing) {

			if(Game.talking_to == thing) {
				say("I'm already talking to " + the_thing(thing) + ".");
				return;
			}

			if(Game.talking_to != thing) {
				hide_conversation();
			}

			if(Game.things[thing].conversifier) {
				start_conversation(thing);
			} else if(Game.things[thing].says) {
				say(Game.things[thing].says);
			} else {
				say(the_thing(thing, true) + " doesn't say much.");
			}
		}
	},

	give: {
		func: function(thing) {
			for(var recipient in Game.things) {
				if(in_scope(recipient) && Game.things[recipient].receive) {
					if(Game.things[recipient].receive(thing)) {
						return;
					}
				}
			}
			// didn't find anyone to give it to
			say("The thought of giving away " + the_thing(thing) + " crosses my mind, but I'd rather keep it.");
		}
	},

	play: {},


	wait: {
		intransitive: true,
		func: function(thing) {
			say("Time passes...");
		}
	},

	fill: {},

	put_in_pipe: {
		display: "put in pipe",
		phrasing: function(thing) {
			return 'put ' + name(thing) + ' in pipe';
		},
		func: function(thing) {
			do_verb('fill', 'pipe', true);
		}
	},

	pray: {
		intransitive: true,
		func: function() {
			say("I mutter a few awkward words of prayer.");
		}
	},

	swat: {},

	feed: {
		func: function(thing) {
			say("I don't know what to feed " + pronoun(thing, 1) + ".");
		}
	},

	pick: {
		func: function(thing) {
			say("I can't pick " + the_thing(thing) + ".");
		}
	},

	dig: {
		intransitive: true,
		func: function(thing) {
			say("Dig, dig...");
			if(Game.rooms[Game.hero_location].buried) {
				var n = Game.rooms[Game.hero_location].buried.length;
				Game.rooms[Game.hero_location].buried.forEach(function(thing) {
					put(thing, Game.hero_location);
				});
				Game.rooms[Game.hero_location].buried = [];
				if(n==0) {
					say("I didn't find anything.");
				} else if(n==1) {
					say("I found something!");
				} else {
					say("I found something!");
				}
			} else {
				say("I didn't find anything.");
			}
		}
	},

	show: {
		func: function(thing) {
			// find an NPC
			var found_npc = false;
			for(var npc in Game.things) {
				if(Game.things[npc].is_alive && location_of(npc) == Game.hero_location) {
					if(!found_npc) {
						say("I show " + the_thing(thing) + " to " + the_thing(npc) + ".");
					} else {
						say("Then I show " + pronoun(thing, 1) + " to " + the_thing(npc) + ".");
					}
					if(Game.things[npc].reacts) {
						Game.things[npc].reacts(thing);
					} else {
						say(the_thing(npc, true) + " take" + s(npc) + " no notice.");
					}
					found_npc = true;
				}
			}
			if(!found_npc) {
				say("I don't know who to show " + pronoun(thing, 1) + " to.");
			}
		}
	},

	load: {},

	shoot: {
		func: function(thing) {
			say("I take a shot at " + the_thing(thing) + ". BANG! I missed.");
		}
	},

	fire: {
		func: function(thing) {
			if(thing == 'revolver') {
				if(!Game.things.revolver.bullets) {
					say("Click!");
					return;
				}

				for(var target in Game.things) {
					if(Game.things[target].location == Game.hero_location && Game.things[target].active_verbs.indexOf('shoot')!=-1) {
						//
						// don't just arbitrarily allow shooting of anything with is_alive this way:
						// it's more trouble than it's worth to have believable reactions.
						//
						//say("(at " + target + ")");
						do_verb('shoot', target, true);
						return;
					}
				}
				// didn't find anything to shoot
				say("BANG!");
				Game.things.revolver.bullets--;
				// there should be SOME reaction though.
				for(var npc in Game.things) {
					if(Game.things[npc].location == Game.hero_location && Game.things[npc].is_alive) {
						if(Game.things[npc].startle) {
							Game.things[npc].startle();
						} else {
							say(the_thing(npc, true) + " jump" + s(npc) + ".");
						}
					};
				}
				make_noise();
			}
		}
	},

	throw: {
		func: function(thing) {
			say("Ok");
			do_verb('drop', thing, true);
			//put(thing, Game.hero_location);
		}
	},

	eat: {
		func: function(thing) {
			say("Delicious!");
			take_away(thing);
		}
	},

	fold: {},

	pull: {
		func: function(thing) {
			say("Pulling " + the_thing(thing) + " has no effect.");
		}
	},

	sleep: {
		intransitive: true,
		func: function() {
			var t = game_time();
			if(t > 3 * 60 && t < 6 * 60) {
				say("I been awake so long already, I may as well pull an all-nighter.");
			} else if(t >= 6 * 60 && t < (22*60)) {
				say("Bit early, ain't it?");
			} else {
				say("I settle down for some shut-eye.");
				Game.game_time += (8 * 60);
				say("The noises of the city wake me up.");
			}
		}
	},

	buy_pizza: {
		display: "buy pizza",
		intransitive: true,
		func: function() {
			if(in_scope('pizza')) {
				say("Maybe I should finish the one I got first.");
			} else if(!pay(1.50)) {
				say("Great idea, but I don't have enough cash on me.");
			} else {
				Game.time += 20;

				Game.things.tony.building_pizza = true;
				Game.things.pizza.toppings = [];

				if(Game.talking_to != 'tony') {
					Game.talking_to = 'tony';
					draw_conversation('tony');
				}

				say('I pay ' + the_thing('tony') + ' a dollar fifty. "I\'d like to order a pizza," I say.');
				say('The man\'s eyes light up. "Certainly, signore!" he says. "You get cheese, tomato, \
				    and up to three extra toppings! Whatta you want?"');


			}
		},
	},

	hail: {
		func: function() {
			say("I can't hail that.");
		}
	},
	// taxi verbs
	go_my_office: {
		intransitive: true,
		display: "my office",
		func: function() {
			taxi_to('mean_and_8th');
		}
	},
	go_college: {
		intransitive: true,
		display: "college",
		func: function() {
			taxi_to('riverside_and_4th');
		}
	},
	go_pizza_joint: {
		intransitive: true,
		display: "pizza joint",
		func: function() {
			taxi_to('mean_and_9th');
		}
	},

	put_in_coffin: {
		display: "put in coffin",
		phrasing: function(thing) {
			return "put " + name(thing) + " in coffin";
		},

		func: function(thing) {
			if(!in_scope('coffins')) { // shouldn't happen!
				say("I can't see a coffin here!");
				return;
			}

			if(Game.things.booze.in_coffin) {
				say("Nothing else will fit in the coffin.");
			}

			// todo: allow things other than booze to go in the coffin
			say("I put " + the_thing(thing) + " back in the coffin.");
			take_away(thing);
			put(thing, location_of('coffins'));
			Game.things[thing].description += " (in coffin)";

			Game.things[thing].in_coffin = true;
		}
	},

	get_in: {
		display: "get in",
		func: function(thing) {
			say("I can't get in that.");
		}
	},

	call_taxi: {
		display: "call taxi",
		intransitive: true,
		func: function() {
			if(in_scope('taxi')) {
				say("But there's a yellow cab right here!");
				set_fuse('taxi_stays', 2);
				return;
			}
			if(pay(0.05)) {
				say("I put a nickel in the slot and dial for a yellow cab. A minute later, one drives up.");
				set_fuse('taxi_stays', 2);
				put('taxi', Game.hero_location);
				set_cabbie_gender();
			} else {
				say("I haven't got a nickel for the call.");
			}
		},
	},

	push: {
		func: function(thing) {
			say("That doesn't achieve anything.");
		}
	},

	oil: {
		func: function(thing) {
			say("I apply a liberal squirt of oil to " + the_thing(thing) + ".");
			Game.things[thing].oiled = true;
		}
	},

	drive: { intransitive: true, },
	pet: {},
	ride: {
		func: function(thing) {
			say("That's not something I can ride.");
		}
	},
	bribe: {},

	get_drink: {
		intransitive: true,
		display: "get drink",
		func: function(thing) {
			var txt = '';
			if(in_scope('vivienne')) {
				if(pay(0.5)) {
					txt = "I pay Vivienne half a dollar for a tumbler of murky fluid.";
				} else {
					say("I don\'t have enough money.");
					return;
				}
			} else {
				txt = "Nobody's serving, so I pour myself a tumbler of murky fluid.";
			}

			give_hero('tumbler');

			txt += ' I gulp it down in one.';
			Game.things.booze.tasted = true;
			if(Game.vars.good_booze) {
				say(txt + ' It tastes sublime.');
			} else {
				say(txt + ' It tastes of swamps, chlorine and dead rodents &ndash; and not in a good way.');
			}
		}
	},

	search: {
		func: function() {
			say("I don't find anything.");
		},
	},

	apply_turpentine: {
		display: "apply turpentine",
		phrasing: function(thing) {
			return "apply turpentine to " + name(thing);
		},
		func: function() {
			say("That would be pointless.");
		},
	},

	wake: {
		func: function(thing) {
			if(!Game.things[thing].asleep) {
				say(the_thing(thing, true) + " isn't asleep!");
			} else {
				say(the_thing(thing, true) + " won't wake up.");
			}
		}
	},

	tie: {
		func: function(thing) {
			say("I can't tie that.");
		}
	},

	untie: {
		func: function(thing) {
			if(Game.things[thing].tied_up) {
				say("I untie " + the_thing(thing) + ".");
			} else {
				say(the_thing(thing, true) + " isn't tied up!");
			}
		}
	},

	type: {
		intransitive: true,
		func: function() {
			say('Clickety-click click click. DING!');
		}
	},

	pawn: {
		func: function(thing) {
			pawn(thing);
		}
	},
	unpawn: {
		func: function(thing) {
			unpawn(thing);
		}
	},

	saw: {},

	tune: {
		func: function(thing) {
			say("I tune the radio to a different station.");
			var currentMusic = Game.rooms.macdonald_parlor.music;
			var newMusic;
			var n = 0;
			for(var i=0; i< musics.length; ++i) {
				if(musics[i]==currentMusic) {
					n = i + 1;
					break;
				}
			}
			if(n >= musics.length) { n = 0; }
			newMusic = musics[n];
			for(var room in Game.rooms) {
				if(Game.rooms[room].is_macdonald_house) {
					Game.rooms[room].music = newMusic;
				}
			}
			do_room_music(true);
		}
	}
}
