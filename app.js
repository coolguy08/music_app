const express=require('express');
const fetch=require('node-fetch');
const extract=require('./util/extract')
const decode=require('./util/encode');
const app=express();
const cors=require('cors');


app.use(express.static(__dirname + '/public'));
app.use(cors());

const cache={

}

app.get('/song',async (req,res)=>{

    //const endpoint='https://www.jiosaavn.com/api.php'+req.params.endpoint;
    //console.log(req.query)
    const endpoint=`https://www.jiosaavn.com/api.php?__call=autocomplete.get&query=${req.query.q}&_format=json`;
    console.log(endpoint);
     try{
      var response=await fetch(endpoint).then(data=>data.text());

      //console.log(extract(response));
  
      const data=JSON.parse(extract(response));
      const id=getsongid(data.songs.data[0].url);

      if(cache[id])//checking cache data
      {
        res.json(JSON.parse(cache[id]));
        return;
      }

      const song_full_details=await getsongurl(id); 
      const url=await redirected_url(song_full_details.auth_data.auth_url);
      cache[id]=JSON.stringify({'url':url,'details':song_full_details.details});
      res.json({'url':url,'details':song_full_details.details});


    }
    catch(err)
    {
      console.log(err);
    }
   
})


app.get('/get_song_by_eurl',async(req,res)=>{//get song by encrypted url
  // console.log(req.query.eurl)
  const media_url=decode(req.query.eurl);
  if(cache[id])
  {
    const data=JSON.parse(cache[id]);
    res.json({'url':data.url});
    return;
  }
  // console.log(media_url);
  geturl=`https://www.jiosaavn.com/api.php?__call=song.generateAuthToken&url=${media_url}&bitrate=160&api_version=4&_format=json&ctx=wap6dot0&_marker=0
  `

  const authurldata=await fetch(geturl).then(data=>data.text());
  const auth_data=JSON.parse(extract(authurldata));

  //console.log(auth_data);
  const url=await redirected_url(auth_data.auth_url);
  res.json({'url':url});


})

app.get('/songs',async (req,res)=>{

const response=await fetch(`https://www.jiosaavn.com/api.php?__call=webapi.get&token=${req.query.artistid}&type=artist&p=&n_song=25&n_album=25&sub_type=songs&more=true&category=&sort_order=&includeMetaTags=0&ctx=wap6dot0&api_version=4&_format=json&_marker=0`).then(data=>data.text());

const data=JSON.parse(extract(response));
const songs=[]

for(var i=0;i<data.topSongs.length;i++)
{//console.log(data.topSongs[i]);
  temp={
    
    id:getsongid(data.topSongs[i].perma_url),
    image:data.topSongs[i].image,
    eurl:data.topSongs[i].more_info.encrypted_media_url,
    title:data.topSongs[i].title,
    year:data.topSongs[i].year,
    lang:data.topSongs[i].language,
    by:data.topSongs[i].header_desc
  }
  songs.push(temp);
}
res.json(songs);

})

app.get('/albums',async (req,res)=>{

  const response=await fetch('https://www.jiosaavn.com/api.php?__call=content.getAlbums&api_version=4&_format=json&_marker=0&n=100&p=1&ctx=wap6dot0').then(data=>data.text());
  const data=JSON.parse(extract(response));
  //console.log(data);
  const albums=[];

  for(var i=0;i<data.length;i++)
  {
    
    var temp=data[i];
    albums.push(getalbumid(temp.perma_url));
  }

  res.send(albums);
  


})



function getalbumid(album)
{
  return album.split('/').slice(-1)[0];
}
function getsongid(song)
{
var id=song.split('/').slice(-1);
return id+'_';

}

async function getsongurl(id)
{
  
  const endpoint=`https://www.jiosaavn.com/api.php?__call=webapi.get&api_version=4&_format=json&_marker=0&ctx=wap6dot0&token=${id}&type=song`  
  console.log(endpoint);
  const response=await fetch(endpoint).then(data=>data.text());

  const song_details_data=JSON.parse(extract(response));
  
  const media_url=decode(song_details_data.songs[0].more_info.encrypted_media_url)
  geturl=`https://www.jiosaavn.com/api.php?__call=song.generateAuthToken&url=${media_url}&bitrate=160&api_version=4&_format=json&ctx=wap6dot0&_marker=0
  `

  const authurldata=await fetch(geturl).then(data=>data.text());
  const auth_data=JSON.parse(extract(authurldata));
  return {auth_data:auth_data,details:song_details_data};


}  

async function redirected_url(data_url)
{
  try{
      const d=await fetch(data_url);
      return d.url;
  }
  catch(err)
  {
    console.log(err);
  }


}





app.listen(process.env.PORT || 3001,()=>console.log(`running on ${process.env.PORT || 3001}`));