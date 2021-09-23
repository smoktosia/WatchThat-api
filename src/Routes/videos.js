import { Router } from 'express';
import got from 'got'

import youtubedl from 'youtube-dl-exec'
import isURL from 'validator/es/lib/isURL'
import { URL } from 'url'

import v_settings from '../settings/video.json'

const router = new Router()

// functions
const headRequest = async url => {
    const headResponse = await got.head(url)

    const
        size        = headResponse.headers['content-length'],
        contentType = headResponse.headers['content-type']

    return { size, contentType }
}

const compareTypes = contentType => contentType && v_settings.supported_types.includes(contentType.split(';')[0])

const getStats = async (url, range) => {
    const { size, contentType } = await headRequest(url)

    if(!compareTypes(contentType))
        throw Error('invalid_url')

    // parse range
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ''))
    const end = Math.min(start + CHUNK_SIZE, size - 1)

    // create headers
    const contentLength = end - start + 1
    const headers = {
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength,
        'Content-Type': contentType
    }

    return [ headers, start, end ]
}

// routes

router.get('/extract', async (req, res) => {

    try {

        let url = req.query.url

        if(!url || !isURL(url)) throw Error('no_url')

        url = decodeURIComponent(url)

        const parsedURL = new URL(url)

        if(v_settings.skip_ytdl.includes(parsedURL.hostname)) {
            return res.status(200).json({url, indirect: true})
        }

        var { size, contentType } = await headRequest(url)

        // check is video
        if(!compareTypes(contentType)) {

            try {

                let ytdl = await youtubedl(url, {
                    getUrl: true,
                    getTitle: true,
                    skipDownload: true
                })

                ytdl = ytdl.split(/\r|\n/)

                // get title
                let title
                if(ytdl.length > 1 && !isURL(ytdl[0])) {
                    title = ytdl[0].trim()

                    // remove title from array
                    ytdl.shift()
                }

                url = ytdl

                // check one more time for video
                var { size, contentType } = await headRequest(url[0])

                console.log(contentType, size)

                if(!compareTypes(contentType))
                    return res.status(400).json({err: 'invalid_url'})

                // is good
                return res.status(200).json({ url, title })

            } catch(err) {
                console.log(err)
                return res.status(500).json({err: 'internal_err'})
            }

        }

        console.log(contentType, size)

        return res.status(200).json({url})

    } catch(err) {
        console.log(err)
        return res.status(400).json({err: 'invalid_query'})

    }

})

router.get('/stream', async (req, res) => {
    let url = req.query.url

    const range = req.headers.range

    // let url = 'https://www.youtube.com/watch?v=AQx_KMoCgJU'

    if(!range)
        return res.status(400).json({err: 'Requires Range header'})
    if(!url || !isURL(url))
        return res.status(400).json({err: 'invalid_url'})

    try {
        url = decodeURIComponent(url)

        const [ headers, start, end ] = await getStats(url, range)

        // create video read stream for this particular chunk
        const stream = got.stream(url, {
            headers: {
                'Range': `bytes=${start}-${end}`,
            }
        })

        res.writeHead(206, headers)

        stream.pipe(res)


    } catch(err) {

        console.log(err)

        if(err.name === 'TypeError')
            return res.status(400).json({err: 'invalid_request'})

        if(err.message === 'invalid_url') {
            return res.status(400).json({err: 'invalid_url'})
        }

        else
        {
            console.log(err)
            res.status(500).json({err: 'internal_err'})
        }
    }

})

// router.get('/stream/merge', async (req, res) => {

//     let
//         video = req.query.video,
//         audio = req.query.audio

//     const range = req.headers.range

//     if(!range)
//         return res.status(400).json({err: 'Requires Range header'})

//     if(!isURL(audio) || !isURL(video))
//         return res.status(400).json({err: 'invalid_urls'})

//     try {

//         video = decodeURIComponent(video)
//         audio = decodeURIComponent(audio)

//         const [ headers, start, end ] = await getStats(video, range)
//         const [ aHeaders, aStart, aEnd ] = await getStats(audio, range)

//         const videoStream = got.stream(video, {
//             headers: {
//                 'Range': `bytes=${start}-${end}`
//             }
//         })

//         const audioStream = got.stream(audio, {
//             headers: {
//                 'Range': `bytes=0-1048576`
//                 // 'Range': `bytes=${aStart}-${aEnd}`
//             }
//         })

//         res.writeHead(206, headers)

//         mergeAV(videoStream, audioStream, res)

//     } catch(err) {
//         console.log(err)

//         return res.status(400).send('a')
//     }

// })


export default router