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

// function getSiegeUserData(){
//     return fetch(siegeUserApiUrl+slackID)
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         return response.json();
//     })
//     .then(data => {
//         return data
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });
// }

// async function getSiegeUserDataOrCached(forceRefresh=false){
//     let storedData=JSON.parse(localStorage.getItem("SiegeUserData"))
//     if (forceRefresh || storedData==null || Date.now()>storedData.time+1800000){
//         // get new data
//         fetch(siegeUserApiUrl+slackID)
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error('Network response was not ok');
//                 }
//                 return response.json();
//             })
//             .then(data => {
//                 return data
//             })
//             .catch(error => {
//                 console.error('Error:', error);
//             });
//         localStorage.setItem("SiegeUserData",JSON.stringify({time:Date.now(), data:newData}))
//         return newData
//     }else{
//     // use cached data
//         console.log('using cached')
//         return storedData.data
//     }
// }


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
    for(promiseIdx in promises){
        let promise=promises[promiseIdx]
        projectsData[promise[0]]=await promise[1]
        console.log(projectsData)
    }
    console.log("before return"+projectsData)
    return projectsData
}

async function loadSiegeProjects(data){
    console.log(data.id)
    const siegeProjects=document.getElementById("siegeProjects")
    siegeProjects.style.display='grid'
    let storedData=JSON.parse(localStorage.getItem("SiegeProjectData"))
    if(true||storedData==null || Date.now()>storedData.time+1800000){
        projectIds=data.projects.map(project=>{return project.id})
        // for(projectIdx in data.projects){
        //     projectIds.push(data.projects[projectIdx].id)
        // }
        console.log(projectIds)
        storedData=(await refreshProjectData(projectIds))
        console.log(storedData)
        localStorage.setItem("SiegeProjectData",JSON.stringify(storedData))
    }
    for (projectIdx in data.projects){
        let project=data.projects[projectIdx]

        const projectBox=document.createElement("div")
        projectBox.classList.add('projectBox')
        projectBox.innerHTML=
        `
        <h3>${project.name}</h3>
        <p>${project.week_badge_text}</p>
        <p>${storedData[project.id].description}</p>
        <p>Status: ${project.status}</p>
        `
        siegeProjects.appendChild(projectBox)
    }
}

function loadSiegeStuff(){
    let storedData=JSON.parse(localStorage.getItem("SiegeUserData"))
    if (storedData==null || Date.now()>storedData.time+1800000){
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
