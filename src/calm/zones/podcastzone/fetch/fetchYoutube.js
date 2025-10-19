export const fetchPodcasts = async (videoIds) => {
    const API_KEY = "AIzaSyBMS99bEnkWbuHnTbTi08nDRv8iaDVxFKo";
    const ids = videoIds.join(","); // comma-separated list
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${ids}&key=${API_KEY}`
    );
    const data = await res.json();
  
    return data.items.map((item) => ({
      videoId: item.id,
      thumbnail: item.snippet.thumbnails.high.url,
      duration: item.contentDetails.duration, 
    }));
  };
  

  
  