//TODO 
// fix CORS
// make it look better

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

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function loadShipsData(repos){
    return (await fetch("https://ships.hackclub.com/api/v1/ysws_entries")
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })).filter(entry=>{
        return repos.includes(entry.code_url)
    })
}

async function refreshProjectData(projectIDs){
    let promises=projectIDs.map(projectID=>{
        return [projectID,
            fetch("https://siege.hackclub.com/api/public-beta/project/"+projectID)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
        ]
    })
    projectsData={time:Date.now()}
    console.log(promises)
    for(promise of promises){
        projectsData[promise[0]]=await promise[1]
        console.log(projectsData)
    }
    console.log("before return"+projectsData)
    return projectsData
}

const forattedUserStatuses={
    "working":"Working&#x1F9D1&#x200D&#x1F4BB",
    "banned":"Banned&#x26D4",
    "out":"Out&#x1F622",
    "approved":"Approved&#x1F389",
    "new":"New&#x1F476",
    "fufilled":"fufilled&#x1F4BB"
}

async function loadSiegeProjects(data){
    const siegeProjects=document.getElementById("siegeProjects")
    siegeProjects.style.display='grid'
    document.getElementById("username").innerHTML=data.name
    document.getElementById("userStatus").innerHTML="Status: "+forattedUserStatuses[data.status]
    document.getElementById("coins").innerHTML=data.coins
    document.getElementById("userInfo").style.display="flex"
    // refresh siege data
    let siegeProjectData=JSON.parse(localStorage.getItem("SiegeProjectData"))
    if(siegeProjectData==null || Date.now()>siegeProjectData.time+1800000){
        projectIds=data.projects.map(project=>{return project.id})
        siegeProjectData=(await refreshProjectData(projectIds))
        localStorage.setItem("SiegeProjectData",JSON.stringify(siegeProjectData))
    }
    delete siegeProjectData.time
    console.log(siegeProjectData)

    let shipsData=JSON.parse(localStorage.getItem("shipsData"))
    let shipsDataPromise
    if(shipsData==null || Date.now()>shipsData.time+1800000){
        console.log("loading new Ships data")
        // console.log(Object.values(siegeProjectData).map(project=>{return project.repo_url}))
        shipsDataPromise=loadShipsData(Object.values(siegeProjectData).map(project=>{return project.repo_url}))
    }else{
        shipsData=shipsData.data
    }
    let projectBoxes=[]
    for (projectIdx in data.projects){
        let project=data.projects[projectIdx]

        const projectBox=document.createElement("div")
        projectBox.classList.add('projectBox')
        projectBox.innerHTML=
        `
        <h3>${project.name}</h3>
        <p>${project.week_badge_text}</p>
        <p>${siegeProjectData[project.id].description}</p>
        <p>Status: ${capitalizeFirstLetter(project.status)}</p>
        <div>
            <a href="${siegeProjectData[project.id].demo_url}">Demo</a>
            <a href="${siegeProjectData[project.id].repo_url}">Repo</a>
        </div>
        `
        siegeProjects.appendChild(projectBox)
        projectBoxes.push({box:projectBox,projectID:project.id})
    }
    
    if (shipsDataPromise!=null){
        shipsData=await shipsDataPromise
        console.log('shipsData')
        console.log(shipsData)
        localStorage.setItem("shipsData",JSON.stringify({data:shipsData,time:Date.now()}))
    }
    // use data from ships
    let mainWeeksApproved=0
    for(projectBox of projectBoxes){
        let projectApproved=shipsData.some(ship=>{return ship.code_url == siegeProjectData[projectBox.projectID].repo_url})

        let weekNumber=parseInt(siegeProjectData[projectBox.projectID].week_badge_text.slice(5))
        if(weekNumber>4 && weekNumber<=14 && projectApproved)mainWeeksApproved++
        projectBox.box.innerHTML+=`<p>Approved: ${projectApproved}</p>`
    }
    if (data.status=="working"){
        let approvedInfo=document.createElement("p")
        approvedInfo.innerText=mainWeeksApproved+"/10 main weeks approved"
        document.getElementById("userInfo").appendChild(approvedInfo)
    }
}

function loadSiegeStuff(){
    let storedData=JSON.parse(localStorage.getItem("SiegeUserData"))
    if (storedData==null || Date.now()>storedData.time+1800000){
        // fetch new data
        fetch(siegeUserApiUrl+slackID)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                localStorage.setItem("SiegeUserData",JSON.stringify({time:Date.now(), data:data}))
                loadSiegeProjects(data)
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }else{
    // use cached data
        console.log('using cached')
        loadSiegeProjects(storedData.data)
    }
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
