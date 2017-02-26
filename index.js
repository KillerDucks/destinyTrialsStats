const needle = require('needle');
var fs = require('fs');

//Vars
let characters = [];

//Options
let quiet = false;
let APIKey = "";

class destinyTrialsStats {
  constructor(opts){
    if(opts['apikey'] == "" | opts['apikey'] == undefined){
      console.log("You need a Steam API key to use this libary");
      process.exit(0);
    } else {
      APIKey = opts['apikey'];
    }
  }

  makePost(gamerTag = "TacticalNexus4", type = "getTrials", chars = "0" , cb){
    var options = {
        headers: {
          'X-API-Key': APIKey
        }
      }

    switch (type) {
      case "getBungAcc":
        needle.get('https://www.bungie.net/Platform/User/SearchUsers/?q=' + gamerTag, options, function(err, resp){
          if(err) throw err;
          cb(resp.body);
        });
        break;

      case "getDestAcc":
        needle.get('https://www.bungie.net/platform/User/GetBungieAccount/'+ gamerTag + '/254/', options, function(err, resp){
          if(err) throw err;
          cb(resp.body);
        });
        break;

      case "getTrials":
        needle.get('https://www.bungie.net/platform/Destiny/Stats/1/' + gamerTag + '/' + chars + '/?modes=TrialsOfOsiris', options, function(err, resp){
          if(err) throw err;
          cb(resp.body);
        });
        break;

    }

  }

  getMyTrialsKD(gt, cb){
    this.getDestMemberID(gt, (mID) =>{
      for(let i in characters){
        this.makePost(mID, undefined, characters[i] ,function(data){
          cb(data['Response']['trialsOfOsiris']['allTime']['killsDeathsRatio']['basic']['displayValue']);
        });
      }
    });
  }

  getBungMemberID(gt, cb){
    this.makePost(gt, "getBungAcc", "3" ,(data) =>{
      for(let i in data){
        if(data['Response'][0]['xboxDisplayName'] == gt){
          cb(data['Response'][0]['membershipId']);
          break;
        }
      }
    });
  }

  getDestMemberID(gt, cb){
    /**
      This will use the getBungMemberID to get the initial ID then we pass it through to this function using the Callback,
      we will pull the Destiny membership ID and all the players characters a put that into an array
    **/
    this.getBungMemberID(gt, (bID) =>{
      this.makePost(bID, "getDestAcc", "3" ,(data) =>{
        //Push the character ID's to the characters Array
        for(let i in data['Response']['destinyAccounts'][0]['characters']){
          characters.push(data['Response']['destinyAccounts'][0]['characters'][i]['characterId']);
        }
        //Return Destiny ID
        cb(data['Response']['destinyAccounts'][0]['userInfo']['membershipId']);
      });
    });
  }

}

module.exports = destinyTrialsStats;
