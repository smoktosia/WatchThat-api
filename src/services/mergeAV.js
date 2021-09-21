// merge audio and video

import cp from 'child_process'
import ffmpeg from 'ffmpeg'

const merge = ([video, audio], res) => {

    if(!video || !audio) return res.status(500).json({err: 'internal_error'})

    const ffmpegProcess = cp.spawn(ffmpeg, [
        // Remove ffmpeg's console spamming
        '-loglevel', '0', '-hide_banner',
        '-i', 'pipe:4',
        '-i', 'pipe:5',
        '-reconnect', '1',
        '-reconnect_streamed', '1',
        '-reconnect_delay_max', '4',
        // Rescale the video
        '-vf', 'scale=1980:1080',
        // Choose some fancy codes
        '-c:v', 'libx265', '-x265-params', 'log-level=0',
        '-c:a', 'flac',
        // Define output container
        '-f', 'matroska', 'pipe:6',
    ], {
        windowsHide: true,
        stdio: [
            /* Standard: stdin, stdout, stderr */
            'inherit', 'inherit', 'inherit',
            /* Custom: pipe:4, pipe:5, pipe:6 */
             'pipe', 'pipe', 'pipe',
        ]
    })

    audio.pipe(ffmpegProcess.stdio[4])
    video.pipe(ffmpegProcess.stdio[5])

    ffmpegProcess.stdio[6].pipe(res)

}

export default merge