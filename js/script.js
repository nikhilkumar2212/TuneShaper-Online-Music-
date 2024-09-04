console.log("hey")
let currentsong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
    if(isNaN(seconds) || seconds < 0 ){
        return "00:00";
    }
    // Calculate the minutes
    const minutes = Math.floor(seconds / 60);

    // Calculate the remaining seconds
    const remainingSeconds = Math.floor(seconds % 60);

    // Format minutes and seconds as two digits
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    // Return the formatted time
    return `${formattedMinutes}:${formattedSeconds}`;
}

//fetching all songs and return an array of songs
async function getsongs(folder){
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
        
    }

//show all song in the playlist
let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
songUL.innerHTML = ""
for(const song of songs){
    songUL.innerHTML = songUL.innerHTML + `<li> 
     <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                            <div class = "songname">${song.replaceAll("%20", " ")}</div>
                            <div>-Nikhil</div>
                            </div>
                            <div class="playnow">
                                play now 
                                <img class="invert" src="img/play.svg" alt="">
                            </div>
    
    </li>`;
}

//attach an event listener to each song
Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e=>{
    e.addEventListener("click", element=>{
        PlayMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        play.src = "img/pause.svg"
    })
})
return songs
}


const PlayMusic = (track, pause = false)=>{
    currentsong.src =`/${currFolder}/` + track
if(!pause){
    currentsong.play()
}
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = `00:00 / 00:00`
}

async function displayAlbums(){
    console.log("displaying album")
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardCotainer = document.querySelector(".cardcontainer")
   let array =  Array.from(anchors)
   for(let index = 0; index < array.length; index++){
    const e = array[index];
        if(e.href.includes("/songs")){
           let folder = e.href.split("/").slice(-2)[0]
           // Get the metadata of the folder
           let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
           let response = await a.json();
            cardCotainer.innerHTML = cardCotainer.innerHTML + `
                              <div data-folder="${folder}" class="card rounded" >
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="58" height="58"
                                fill="#3be477">
                                <circle cx="12" cy="12" r="10" />
                                <path
                                    d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z"
                                    fill="#000000" />
                            </svg>
                        </div>
                        <img class="rounded" src="/songs/${folder}/cover.jpeg"
                            alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>
            `
        }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            play.src = "img/pause.svg"
            PlayMusic(songs[0])
        })
    })
   
}
//main function start here


async function main(){
await getsongs("songs/recommended");
PlayMusic(songs[0], true)

//display all the albums on the page 
await displayAlbums();


play.addEventListener("click", ()=>{
    if(currentsong.paused){
        currentsong.play()
        play.src = "img/pause.svg"
    }
    else{
        currentsong.pause()
        play.src = "img/play.svg"
    }
})
//event listner to update time 
currentsong.addEventListener("timeupdate", ()=>{
    document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration)}`
    document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration)*100 + "%" ;
})
//add an event listner to seekbar
document.querySelector(".seekbar").addEventListener("click", e=>{
    let percent = (e.offsetX / e.target.getBoundingClientRect().width)* 100
    document.querySelector(".circle").style.left = percent + "%"
    currentsong.currentTime = (currentsong.duration * percent)/100
})

// add eventlistener to hamburger
document.querySelector(".hamburger").addEventListener("click", e=>{
    document.querySelector(".left").style.left = "0"
})
//add eventlistner to close the hamburder
document.querySelector(".close").addEventListener("click", e=>{
    document.querySelector(".left").style.left = "-100%"
})
//add eventlistner to previous button
previous.addEventListener("click", e=>{
    e.console.log("previous clicked")
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
    if((index-1) >= 0){
         play.src = "img/pause.svg"
    PlayMusic(songs[index - 1])
    }

}) 
//add an eventlistner to next button 
next.addEventListener("click", e=>{
 let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
 if(index+1 < songs.length){
    play.src = "img/pause.svg"
PlayMusic(songs[index + 1])
 }
}) 
//add an event to volume
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change" , (e)=>{
    console.log(e.target.value)
    currentsong.volume = (e.target.value)/100
})
//ad event listner to mute the track
document.querySelector(".volume>img").addEventListener("click",e=>{
    if(e.target.src.includes("volume.svg")){
        e.target.src = e.target.src.replace("volume.svg","mute.svg")
        currentsong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
        e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
        currentsong.volume = .5;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 50;

    }
})
 //load the playlist whenever card is clicked


}


main();