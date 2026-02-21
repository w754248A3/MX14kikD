

export const CHANNEL_NAME = "streaming_decryption_player_Y1jOT5kf";

export const VIRTUAL_URL_PATH = "/streaming_decryption_player/virtual-video.mp4";

export interface VIRTUAL_URL_SEARCH {
    t:string;
    id:string;
    d:boolean;
}

export interface DATA {
    type:"VIDEO_FILE_DATA"|"READY_TO_PLAY"|"LOG_MESSAGE";
    file:File
    virtualUrl:VIRTUAL_URL_SEARCH
    message:string
}