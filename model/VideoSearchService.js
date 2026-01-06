class VideoSearchService {
    constructor(api) {
        this.api = api;       
    }

    async searchYoutube(query,maxResults){
        try {
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&type=video&q=${encodeURIComponent(query)}&key=${this.api}`;

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erreur YouTube: ${response.statusText}`);
            }

            const data = await response.json();
            
            return data;

        } catch (error) {
            console.error("Erreur serveur:", error);
            return false;
        }
    }
}

module.exports = VideoSearchService;