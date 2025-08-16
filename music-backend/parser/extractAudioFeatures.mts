import { TrackWithData } from "./dataTypes.mts"

export function extractAudioFeatures(tracksData: TrackWithData[]) {
    if (!tracksData || tracksData.length === 0) {
        return {
        danceability: null,
        valence: null,
        acousticness: null,
        tempo: null
        };
    }
    
    let danceability = 0, valence = 0, acousticness = 0, tempo = 0;
    let validTracks = 0;
    
    tracksData.forEach(track => {
        if (track.data?.highlevel) {
        const highLevel = track.data.highlevel;
        
        if (highLevel.danceability?.probability) {
            danceability += highLevel.danceability.probability;
        }
        if (highLevel.mood_happy?.all?.Happy) {
            valence += highLevel.mood_happy.all.Happy;
        }
        if (highLevel.mood_acoustic?.all?.Acoustic) {
            acousticness += highLevel.mood_acoustic.all.Acoustic;
        }
        if (track.data.metadata?.tags?.bpm) {
            tempo += parseInt(track.data.metadata.tags.bpm[0]) || 0;
        }
        validTracks++;
        }
    });
    
    if (validTracks === 0) {
        return { danceability: null, valence: null, acousticness: null, tempo: null };
    }
    
    return {
        danceability: danceability / validTracks,
        valence: valence / validTracks,
        acousticness: acousticness / validTracks,
        tempo: tempo / validTracks
    };
}