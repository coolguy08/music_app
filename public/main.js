
function isloading(flag)
{
    if(flag)
    {
        document.querySelector('#play_pause').className='hide';
        document.querySelector('#loader').className='loader';
    }
    else
    {
        document.querySelector('#play_pause').className='';
        document.querySelector('#loader').className='' ;
    }
}
//variables
var audio,term,songimg,title,by,song_status,year,lang,seeker

audio=new Audio();

var pointer=0;

const baseurl=window.location.href;
addEventListener('keypress',key);
//var audio=document.querySelector('audio');
var stack=[];

function intialize()
{
     term=document.getElementById('term').value;
     loading=document.getElementById('msg');
     songimg=document.getElementById('song_img');
     title=document.getElementById('title');
     by=document.getElementById('by');
     song_status=document.getElementById('song_status');
     year=document.getElementById('year');
     lang=document.getElementById('lang');
     seeker=document.getElementById('seeker');
     
}

intialize();

async function check_storage()
{
    if(localStorage.song)
     {
         const data=JSON.parse(localStorage.song);
         display(data);
         
         audio.src=data.url;
         audio.currentTime=data.currenttime;
         document.getElementById('song').className='';
         seeker.value=audio.currentTime;


     document.getElementById('current').innerHTML=new Date(audio.currentTime*1000).toISOString().substr(14, 5)
     document.getElementById('duration').innerHTML=new Date(audio.duration?audio.duration*1000:237*1000).toISOString().substr(14, 5)
     
    
     stack=await get(`${baseurl}songs?artistid=${localStorage.getItem('artist_id')}`); 
    
    }
}
check_storage();


function set_song(data)//store the current song to localstorage
{
    localStorage.setItem('song',JSON.stringify(data));
}

function key(e)
{
    if(e.code=='Enter')
    {
        search();
    }
   
   
}

function play_pause()
{

    if(localStorage.song==undefined)
    {
        alert('Search for a Song First');
        return;
    }
if(audio.paused)
{
    audio.play();
}
else{
    audio.pause();
}


}




function display(data)
{ 
   
   
  document.querySelector('title').innerText=data.title;
  songimg.src=data.image.replace('https','http');
  title.innerHTML=data.title;
  by.innerHTML=data.by;
  year.innerHTML=data.year;
  lang.innerHTML=data.language;



}

async function search()
{
    
    intialize();
    console.log(term);

     term==''?alert('Please Enter Search term'):
     //loading a loader
     isloading(true);

     const data=await get(`${baseurl}song?q=${term}`);

     
     const display_data={
         image:data.details.songs[0].image,
         title:data.details.songs[0].title,
         by:data.details.songs[0].header_desc,
         year:data.details.songs[0].year,
         language:data.details.songs[0].language,
     }
     
    display(display_data);
    display_data.url=data.url;
    set_song(display_data);

    audio.src=data.url;
    audio.play();
    
    //to unhide the display
    document.getElementById('song').className='';
    
    isloading(false);
    
    //to reset the field
    document.getElementById('term').value='';
    document.querySelector('#title').focus();
    
    //the artist whose song to play next
    const artist_id=data.details.songs[0].more_info.artistMap.primary_artists[0].perma_url.split('/').slice(-1)[0];
    
    localStorage.setItem('artist_id',artist_id);
    stack=await get(`${baseurl}songs?artistid=${artist_id}`);

   
    




}


async function playnext()
{
   if(stack.length==0)
   {
       alert("Song List Empty\nSearch a song");
       return;
   }
    
    pointer=(pointer%(stack.length-1))+1;
      
    var song=stack[pointer];

    //intialize(); 

    isloading(true);
        
    
       if(!song.url)
       {
        const data=await get(`${baseurl}get_song_by_eurl?eurl=${song.eurl}&id=${song.id}`);
        stack[pointer].url=data.url;
        song=stack[pointer];
       }
      
            
        
      const display_data={
        image:song.image,
        title:song.title,
        by:song.by,
        year:song.year,
        language:song.lang,
    }
    
        display(display_data);
        display_data.url=song.url;
        set_song(display_data);
        audio.src=song.url;

        audio.play();
        
        //to unhide display
        document.getElementById('song').className='';
        
    
        isloading(false);
        
        //to reset term
        document.getElementById('term').value='';
        document.querySelector('#title').focus();
        
  
    
     

}

async function playprev()
{  if(stack.length==0)
    {
        alert("Song List Empty\nSearch a song");
        return;
    }
    
    pointer?pointer=pointer-1:pointer=stack.length-1;
    
    var song=stack[pointer];

    //intialize(); 

    isloading(true);

        
    if(!song.url)
    {
     const data=await get(`${baseurl}get_song_by_eurl?eurl=${song.eurl}`);
     stack[pointer].url=data.url;

    }
            
        
      const display_data={
        image:song.image,
        title:song.title,
        by:song.by,
        year:song.year,
        language:song.lang,
    }
    
        display(display_data);
        audio.src=song.url?song.url:data.url;
        audio.play();
        
        //to unhide display
        document.getElementById('song').className='';
        
    
        isloading(false);
        
        //to reset term
        document.getElementById('term').value='';
        document.querySelector('#title').focus();
        
  
    
    

}



async function get(url)
{
    try{
        const response=await fetch(url).then(data=>data.json());
        return response;
    }
    catch(err)
    {
        throw Error(err);
    }
    
}
document.body.appendChild(audio);

audio.onpause=()=>{
    songimg.style="animation-play-state:paused"
    song_status.className='fa fa-play fa-lg';
}


audio.onplay=()=>{
    //when song start playing add the meta data
    navigator.mediaSession.metadata = new MediaMetadata({
        title:document.getElementById('title').textContent,
        artist: document.getElementById('by').textContent,
        //album: 'The Ultimate Collection (Remastered)',
        artwork: [
         
          { src: document.getElementById('song_img').src, sizes: '512x512', type: 'image/png' },
        ]
      });

    songimg.style="animation-play-state:play"
    song_status.className='fa fa-pause fa-lg';
    
}


seeker.oninput=(e)=>{
audio.currentTime=e.target.value;
}

//code to check for buffering
let slowInternetTimeout = null;

// audio.addEventListener('loadstart', function () {
//     //show buffering
//     isloading(true);
// });
audio.addEventListener('waiting', () => {

    slowInternetTimeout = setTimeout(() => {
    //show buffering
    isloading(true);
});

});

audio.addEventListener('playing', () => {
if(slowInternetTimeout != null){
    clearTimeout(slowInternetTimeout);
    slowInternetTimeout = null;
    //continue playing
    isloading(false);
    audio.play();
    }
    
});






audio.onended=()=>{
 playnext();
}

audio.ontimeupdate=()=>{
    
    songimg.style="animation-play-state:play";
    seeker.max=audio.duration; 
    //song_status.className='fa fa-pause fa-lg';
    //console.log(Math.round(audio.duration-audio.currentTime));
    
    const cur_song=JSON.parse(localStorage.getItem('song'));
    cur_song.currenttime=audio.currentTime;
    localStorage.setItem('song',JSON.stringify(cur_song));

   
   


seeker.value=audio.currentTime;


document.getElementById('current').innerHTML=new Date(audio.currentTime*1000).toISOString().substr(14, 5)

document.getElementById('duration').innerHTML=new Date(audio.duration?audio.duration*1000:237*1000).toISOString().substr(14, 5)


}



if ('mediaSession' in navigator){
    navigator.mediaSession.metadata = new MediaMetadata({
      title:document.getElementById('title').textContent,
      artist: document.getElementById('by').textContent,
      artwork: [
       
        { src: document.getElementById('song_img').src, sizes: '512x512', type: 'image/png' },
      ]
    });
  
    navigator.mediaSession.setActionHandler('play', function() { play_pause();});
    navigator.mediaSession.setActionHandler('pause', function() { play_pause();});
   
    navigator.mediaSession.setActionHandler('previoustrack', function() { playprev(); });
    navigator.mediaSession.setActionHandler('nexttrack', function() { playnext();});
    
  }


