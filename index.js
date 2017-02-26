const needle = require('needle');
var fs = require('fs');

//Vars
let characters = [];

//Options
let quiet = false;

class destinyTrialsStats {
  makePost(gamerTag = "TacticalNexus4", type = "getTrials" ,cb){
    var options = {
        headers: {
          'X-API-Key': '1d7e2d7bb0db43618efa3993660282ae'
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
        needle.get('https://www.bungie.net/platform/Destiny/Stats/1/4611686018452351232/2305843009326756237/?modes=TrialsOfOsiris', options, function(err, resp){
          if(err) throw err;
          cb(resp.body);
        });
        break;

    }

  }

  getMyKD(gt, char, cb){
    this.getMemberID(gt, (mID) =>{
      this.makePost(mID, undefined, function(data){
        cb(data['Response']['trialsOfOsiris']['allTime']['killsDeathsRatio']);
      });
    });
  }

  getBungMemberID(gt, cb){
    this.makePost(gt, "getBungAcc", (data) =>{
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
      this.makePost(bID, "getDestAcc", (data) =>{
        //Push the character ID's to the characters Array
        for(let i in data){
          console.log(data['Response']['destinyAccounts'][0]['characters'][0]);
        }
        //Return Destiny ID
        //cb(data['Response']['destinyAccounts'][0]['userInfo']);
      });
    });
  }

}

module.exports = destinyTrialsStats;
