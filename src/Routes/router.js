import { Router } from 'express';
import fs from 'fs'

const router = new Router()

router.get('/video/random', (req, res) => {
    res.status(200).json({url: 'https://vwaw720.cda.pl/WEtAVLYPgc0cvqxwhLsfVg/1631306581/lq6622bf3c7f78dd4c7fc1ee17e8be7d89.mp4'})
})

export default router