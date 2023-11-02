const Follow = require("../models/follow");

const followUserId = async (identityUserId) => {
  try {
    //Sacar info de seguimiento
    let following = await Follow.find({ "user": identityUserId })
      .select({ "followed": 1, "_id": 0 })
      .exec();
    let followers = await Follow.find({ "followed": identityUserId })
      .select({ "user": 1, "_id": 0 })
      .exec();
    //Procesar array de identificadores
    let followingClean = [];

    following.forEach((follow) => {
      followingClean.push(follow.followed);
    });

    let followersClean = [];

    followers.forEach((follow) => {
      followersClean.push(follow.user);
    });
    return {
      following: followingClean,
      followers: followersClean,
    };
  } catch (error) {
    return {};
  }
};

const followThisUser = async (identityUserId, profileUserId) => {
    let following = await Follow.findOne({"user":identityUserId,})
                            //Se comprueba si yo lo sigo a el
    .select({"_id":0})
    let follower = await Follow.findOne({"followed":profileUserId,})
    .select({"_id":0})
    
    return{
        following,
        follower
    }
  };

module.exports = {
  followUserId,
  followThisUser,
};
