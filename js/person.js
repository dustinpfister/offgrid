/*
 *    person.js for offgrid
 *    Copyright 2017 by Dustin Pfister (GPL-3.0)
 *
 */

var Person = (function () {

    var status = {},

    text = {},

    //  update eatTotal for all nutrients
    updateEats = function () {

        var nutrientName;

        // first set all eat totals to zero
        for (nutrientName in status.nutrient) {

            status.nutrient[nutrientName].eatTotal = 0;

        }

        // loop over all item counts in status.consumed, and update totals
        status.consumed.forEach(function (itemCount) {

            var item = Stuff.getItemById(itemCount.id),
            total;

            console.log('updaing eatTotals for ' + item.desc);

            for (nutrientName in status.nutrient) {

                if (nutrientName in item.uptakes) {

                    console.log(item.id + ' has ' + nutrientName);
                    total = item.uptakes[nutrientName].amount * itemCount.count;
                    status.nutrient[nutrientName].eatTotal += total;

                }

            }

        });

        console.log(status);

    },

    // the public API
    api = function () {

        return status;

    };

    api.load = function (personObj) {

        // if an object
        if (typeof personObj === 'object') {

            // copy in the object
            status = JSON.parse(JSON.stringify(personObj));

        } else {

            // else assume a string is given, and it is JSON

            status = JSON.parse(personObj);

        }

        // update eats totals
        updateEats();

    };

    api.eat = function (foodObj) {

        foodObj.uptakes.forEach(function (uptake) {

            status.nutrient[uptake.nutrient].grams += uptake.grams;

        });

    };

    api.updateState = function (days) {

        var nutrientName,
        nutrient,
        preSec;

        for (nutrientName in status.nutrient) {

            nutrient = status.nutrient[nutrientName];
            //nutrient.grams -= nutrient.lossRate * days;

            nutrient.grams = nutrient.startGrams + nutrient.eatTotal - nutrient.lossRate * days;

            if (nutrient.grams < 0) {

                nutrient.grams = 0;

            }

        }

    };

    // the Phaser state object that is to be added in main
    api.phaserState = {

        create : function () {

            // what to create for person state
            console.log('I am ready to rock!');

            text['money'] = game.add.bitmapText(10, 10, 'zelda', '', 10);
            text['time'] = game.add.bitmapText(180, 10, 'zelda', '', 9);
            text['protein'] = game.add.bitmapText(10, 30, 'zelda', '', 10);
            text['carbs'] = game.add.bitmapText(10, 50, 'zelda', '', 10);

        },

        // update for person state
        update : function () {

            // what to update on each tick for the person state
            var now = new Date(),
            time = now - status.lastUpdate;

            // update main
            main.update();
            //updateState(main());

            /*
            if (time >= 100) {

            updateState(time);

            }
             */

            text['money'].text = 'money: ' + Budget().bal.toFixed(2);
            text['protein'].text = 'Protein : ' + status.nutrient.protein.grams.toFixed(2);
            text['carbs'].text = 'Carbs : ' + status.nutrient.carbs.grams.toFixed(2);
            text['time'].text = 'T : ' + main().t.toFixed(2) + ' Day : ' + main().d + ' Month: ' + main().m;

        }

    };

    return api;

}
    ());

// hard coded person status.
Person.load(JSON.stringify({

        weight : 140,
        nutrient : {

            protein : {

                grams : 10,
                eatTotal : 0,
                startGrams : 10,
                maxGrams : 120,
                lossRate : 60 // loss of grams per game day

            },

            carbs : {

                grams : 40,
                eatTotal : 0,
                startGrams : 150,
                maxGrams : 600,
                lossRate : 300

            }

        },

        consumed : [

            // back beans
            {

                id : 'f_0',
                count : 3

            },

            // apples
            {
                id : 'f_1',
                count : 1

            }

        ]

    }));
