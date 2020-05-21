import url from 'url';
import express from 'express';
import AppConfig from '../config/app';
import { isEmptyObject } from '../util/validator';
import { ParsedUrlQuery } from 'querystring';
import { adminGuard } from '../middleware/auth-middleware';

export const UserRouter = express.Router();

const userService = AppConfig.userService;

UserRouter.get('', adminGuard, async (req, resp) => {

    try {

        let reqURL = url.parse(req.url, true);
 
        if(!isEmptyObject<ParsedUrlQuery>(reqURL.query)) {
            let payload = await userService.getUserByUniqueKey({...reqURL.query});
            resp.status(200).json(payload);
        } else {
            let payload = await userService.getAllUsers();
            resp.status(200).json(payload);
        }

    } catch (e) {
        resp.status(e.statusCode).json(e);
    }

});

UserRouter.get('/:id', async (req, resp) => {
    const id = +req.params.id;
    try {
        let payload = await userService.getUserById(id);
        return resp.status(200).json(payload);
    } catch (e) {
        return resp.status(e.statusCode).json(e);
    }
});

UserRouter.post('', async (req, resp) => {
    try {
        console.log('made it 1');
        
        let newUser = await userService.addNewUser(req.body);
        console.log('made it 2');
        return resp.status(201).json(newUser);
    } catch (e) {
        console.log('made it 3');
        return resp.status(e.statusCode).json(e);
    }

});

UserRouter.put('', async (req,resp) => {
    try{
        await userService.updateUser(req.body);
        return resp.status(204);
    } catch (e) {
        return resp.status(e.statusCode).json(e);
    }
});

UserRouter.delete('/:id', async (req,resp) => {
    try{
        let id = +req.params.id
        await userService.deleteById(id);
        return resp.status(204);
    }catch (e){
        return resp.status(e.statusCode).json(e);
    }
})

