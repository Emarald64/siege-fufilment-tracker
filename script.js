var slackID="U0785D5VDEK"
const siegeUserApiUrl="https://siege.hackclub.com/api/public-beta/user/"

function setSlackID(value){
    console.log("set slack id to: "+value)
    if (value){
        slackID=value
        localStorage.setItem("slackID",slackID)
        console.log('removed id asker after input')
        document.getElementById("slackIDGetter").remove()
        loadSiegeStuff()
    }
}

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
    let storedData=JSON.parse(localStorage.getItem("SiegeUserData"))
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

function loadSiegeStuff(){
    getSiegeUserDataOrCached()
        .then(data=>{
            console.log(data)
            console.log(data.id)
            const siegeProjects=document.getElementById("siegeProjects")
            siegeProjects.style.display='grid'
            for (projectIdx in data.projects){
                let project=data.projects[projectIdx]
                const projectBox=document.createElement("div")
                projectBox.classList.add('projectBox')
                projectBox.innerHTML=
                `
                <h3>${project.name}</h3>
                `
                siegeProjects.appendChild(projectBox)
            }
        })
}

function onload(){
    slackID=localStorage.getItem("slackID")
    if (slackID){
        //dont ask if id is known
        console.log('removed id asker')
        document.getElementById("slackIDGetter").remove()
        loadSiegeStuff()
    }
}
