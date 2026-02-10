

export const CHANNEL_NAME = "streaming_decryption_player_Y1jOT5kf";

export interface DATA {
    type:"VIDEO_FILE_DATA"|"READY_TO_PLAY"|"LOG_MESSAGE";
    file:File
    virtualUrl:string
    message:string
}