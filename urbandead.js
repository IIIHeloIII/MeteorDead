CharacterList = new Meteor.Collection('characters');

function GetLocationKey(x,y){
    return "x"+x+"y"+y;
}

var locationArray = [
    {name: "loc1", x:1, y:1},{name: "loc2", x:2, y:1},{name: "loc3", x:3, y:1},{name: "loc4", x:4, y:1},{name: "loc5", x:5, y:1},
    {name: "loc6", x:1, y:2},{name: "loc7", x:2, y:2},{name: "loc8", x:3, y:2},{name: "loc9", x:4, y:2},{name: "loc10", x:5, y:2},
    {name: "loc11", x:1, y:3},{name: "loc12", x:2, y:3}, {name: "loc13", x:3, y:3},{name: "loc14", x:4, y:3}, {name: "loc15", x:5, y:3}];

if (Meteor.isClient) {
    window.GameData = {};
    window.GameData.charName = "Helo";
    window.GameData.Locations = {};
    window.GameData.Locations.locationArray = locationArray;

    Meteor.startup(function(){
        Session.setDefault('charName', "Helo");
    });

    Template.miniMap.locations = function () {
        var character = CharacterList.findOne({charName: Session.get('charName')});
        var x = character.x;
        var y = character.y;

        var locationHashTable = [];

        for(var i = 0; i < locationArray.length; i++){
            locationHashTable[GetLocationKey(window.GameData.Locations.locationArray[i].x, window.GameData.Locations.locationArray[i].y)] = window.GameData.Locations.locationArray[i];
        }

        var otherChars = CharacterList.find({x: {$lte: x+1}, x:{$gte: x-1}, y: {$lte: y+1}, y:{$gte: y-1}}).fetch();

        var GetChars = function(charList, x, y){
            var returnList = [];
            for (var i = 0; i < charList.length; i++) {
                if(charList[i].x == x && charList[i].y == y){
                    returnList.push(charList[i]);
                    console.log(charList[i]);
                }
            }
            return returnList;
        }

        return {
                surroundingLocations: [
                    {locInf: locationHashTable[GetLocationKey(x-1,y-1)], chars: GetChars(otherChars, x-1, y-1)},
                    {locInf: locationHashTable[GetLocationKey(x,y-1)],   chars: GetChars(otherChars, x, y-1)},
                    {locInf: locationHashTable[GetLocationKey(x+1,y-1)], chars: GetChars(otherChars, x+1, y-1)},
                    {locInf: locationHashTable[GetLocationKey(x-1,y)],   chars: GetChars(otherChars, x-1, y)},
                    {locInf: locationHashTable[GetLocationKey(x,y)],     chars: GetChars(otherChars, x, y)},
                    {locInf: locationHashTable[GetLocationKey(x+1,y)],   chars: GetChars(otherChars, x+1, y)},
                    {locInf: locationHashTable[GetLocationKey(x-1,y+1)], chars: GetChars(otherChars, x-1, y+1)},
                    {locInf: locationHashTable[GetLocationKey(x,y+1)],   chars: GetChars(otherChars, x, y+1)},
                    {locInf: locationHashTable[GetLocationKey(x+1,y+1)], chars: GetChars(otherChars, x+1, y+1)} ]
        };
    };

    Template.charData.character = function () {
        return CharacterList.findOne({charName: Session.get('charName')});
    }

    Template.miniMap.events({
        'click .MiniMapTile': function () {
            Meteor.call('moveToCoordinates', {charName: Session.get('charName'), x:this.locInf.x, y:this.locInf.y});
            console.log(this);
        }
    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        if(CharacterList.findOne({charName: "Helo"}) == null){
            CharacterList.insert({charName: "Helo", x: 2, y: 2});
        }
    });

  Meteor.methods({
    'moveToCoordinates': function(args){
        if(args.x != undefined && args.y != undefined && args.charName != undefined){
            var char = CharacterList.findOne({charName: args.charName});
            if( args.x >= char.x-1 && args.x <= char.x+1 &&
                args.y >= char.y-1 && args.y <= char.y+1 ){
                var query = {charName: args.charName};
                var update = {$set: {x: args.x, y: args.y}};
                CharacterList.update(query, update);
            }
        }
    },
    'createCharacter': function(args){
        if(args.charName != undefined){
            var char = CharacterList.findOne({charName: args.charName});
            if(char == undefined)
                CharacterList.insert({charName: args.charName, x: 2, y: 2});
        }
    }
});
}
