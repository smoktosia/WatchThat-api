import { Router } from 'express';
import got from 'got'

import youtubedl from 'youtube-dl-exec'

import merge from '../services/mergeAV';

const router = new Router()

// functions
const headRequest = async url => {
    const headResponse = await got.head(url)

    const
        size        = headResponse.headers['content-length'],
        contentType = headResponse.headers['content-type']

    return { size, contentType }
}

const compareTypes = contentType => contentType && ['video/mp4'].includes(contentType.split(';')[0])

// routes

router.get('/extract', async (req, res) => {

    try {

        let url = req.query.url

        if(!url) throw Error('no_url')

        url = decodeURIComponent(url)

        console.log(new URL(url).hostname)

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
                const title = ytdl[0].trim()

                // remove title from array
                ytdl.shift()

                // get first url (temp)
                url = ytdl[0]
                console.log(ytdl.join('\n\n'))

                // check one more time for video
                var { size, contentType } = await headRequest(url)

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

    } catch(err) {
        console.log(err)
        return res.status(400).json({err: 'invalid_query'})

    }

})

// const supportedDomains = [
//     'youtube.com', 'vimeo.com', 'twitch.tv'
// ]

router.get('/stream', async (req, res) => {
    let url     = req.query.url
    const range   = req.headers.range

    // let url = 'https://www.youtube.com/watch?v=AQx_KMoCgJU'

    if(!range) return res.status(400).send('Requires Range header')
    if(!url || url === 'null') return res.status(400).send({err: 'invalid_url'})

    try {

        url = decodeURIComponent(url)

        const { size, contentType } = await headRequest(url)

        if(!compareTypes(contentType))
            throw Error('invalid_url')
            // return res.status(400).json({err: 'invalid_url'})

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

        // write head with headers and 206 status (partial content)
        res.writeHead(206, headers)

        // create video read stream for this particular chunk
        const stream = got.stream(url, {
            headers: {
                'Range': `bytes=${start}-${end}`,
            }
        })

        stream.pipe(res)

    } catch(err) {

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


export default router