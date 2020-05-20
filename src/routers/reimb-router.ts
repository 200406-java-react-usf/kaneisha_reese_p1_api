import url from 'url';
import express from 'express';
import AppConfig from '../config/app';
import { adminGuard } from '../middleware/auth-middleware';
import { isEmptyObject } from '../util/validator';
import { ParsedUrlQuery } from 'querystring';

export const ReimbRouter = express.Router();

const reimbService = AppConfig.reimbService;

ReimbRouter.get('', adminGuard, async (req, resp) =>{
    try {
        let payload = await reimbService.getAllReimbs();
        resp.status(200).json(payload);
    } catch (e) {
        resp.status(e.statusCode).json(e);
    }
});

ReimbRouter.get('/:id', async (req, resp) => {
    const id = +req.params.id;
    try {
        let payload = await reimbService.getReimbById(id);
        return resp.status(200).json(payload);
    } catch (e) {
        return resp.status(e.statusCode).json(e);
    }
});