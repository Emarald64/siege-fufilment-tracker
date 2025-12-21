var slackID="U0785D5VDEK"
const siegeUserApiUrl="https://siege.hackclub.com/api/public-beta/user/"


function getSiegeUserData(){
    return fetch(siegeUserApiUrl+slackID)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        return data
      })
      .catch(error => {
        console.error('Error:', error);
      });
}

async function getSiegeUserDataOrCached(forceRefresh=false){
    let storedData=localStorage.getItem("SiegeUserData")
    if (forceRefresh || storedData==null || Date.now()>storedData.time+1800000){
        // get new data
        let newData=await (getSiegeUserData())
        console.log("type:"+typeof newData)
        localStorage.setItem("SiegeUserData",JSON.stringify({time:Date.now(), data:newData}))
        return newData
    }else{
        // use cached data
        console.log('using cached')
        return storedData.data
    }
}

console.log(getSiegeUserDataOrCached(true))