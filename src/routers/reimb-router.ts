import url from 'url';
import express from 'express';
import AppConfig from '../config/app';
import { adminGuard } from '../middleware/auth-middleware';

export const ReimbRouter = express.Router();

const reimbService = AppConfig.reimbService;

ReimbRouter.get('',  async (req, resp) =>{
    console.log('made it here reimbs 1');
    try {
        let payload = await reimbService.getAllReimbs();
        console.log('made it here 2');
        console.log(payload)
        resp.status(200).json(payload);
    } catch (e) {
        resp.status(e.statusCode).json(e);
    }
});

ReimbRouter.get('/:id',  async (req, resp) => {
    const id = +req.params.id;
    try {
        let payload = await reimbService.getReimbById(id);
        return resp.status(200).json(payload);
    } catch (e) {
        return resp.status(e.statusCode).json(e);
    }
});

ReimbRouter.get('/:username',  async (req, resp) => {
    console.log('made it here')
    console.log(req.params);
    
    const username = req.params.username;
    try {
        let payload = await reimbService.getReimbsByUser(username);
        return resp.status(200).json(payload);
    } catch (e) {
        return resp.status(e.statusCode).json(e);
    }
});

ReimbRouter.post('',  async (req, resp) =>{
    console.log('POST REQUEST RECIEVED AT /reimbs');
    console.log(req.body);
    let newReimb = req.body.newReimb;
    let user=req.body.user;
    try{
        newReimb = await reimbService.addReimb(newReimb, user);
    }catch (e) {
        return resp.status(e.statusCode).json(e)
    }
});


ReimbRouter.put('', async (req,resp) => {
    try{
        await reimbService.updateReimb(req.body);
        return resp.status(204);
    } catch (e) {
        return resp.status(e.statusCode).json(e);
    }
});

ReimbRouter.delete('/:id', async (req,resp) => {
    try{
        let id = +req.params.id
        await reimbService.deleteById(id);
        return resp.status(204);
    }catch (e){
        return resp.status(e.statusCode).json(e);
    }
})