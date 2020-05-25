import { isValidId, isValidStrings, isValidObject, isPropertyOf, isEmptyObject } from "../util/validator";
import { 
    BadRequestError, 
    ResourceNotFoundError, 
    NotImplementedError, 
    ResourcePersistenceError, 
    AuthenticationError, 
    AuthorizationError
} from "../errors/errors";
import { ReimbRepository } from "../repos/reimb-repo";
import { Reimb } from "../models/reimb";
import { User } from "../models/user";

export class ReimbService {
    constructor (private reimbRepo: ReimbRepository){
        this.reimbRepo = reimbRepo;
    }

    /**
     * Get all reimbs 
     */
    async getAllReimbs(): Promise<Reimb[]> {

        let reimbs = await this.reimbRepo.getAll();

        if (reimbs.length == 0) {
            throw new ResourceNotFoundError();
        }
        return reimbs;
    }

    async getReimbById(id: number): Promise<Reimb> {
        //validate id is a number
        if (!isValidId(id)) {
            throw new BadRequestError();
        }
        //call repo method
        let reimb = await this.reimbRepo.getById(id);
        //check if repo method returned a valid reimb
        if (isEmptyObject(reimb)){
            throw new ResourceNotFoundError();
        }
        return reimb;
    }

    async getReimbsByUser(username: string): Promise<Reimb[]> {
        //validate id is a number
        if (!isValidStrings(username)) {
            throw new BadRequestError();
        }
        //call repo method
        let reimbs = await this.reimbRepo.getAllByUsername(username);
        //check if repo method returned a valid reimb
        if (isEmptyObject(reimbs)){
            throw new ResourceNotFoundError();
        }
        return reimbs;
    }

    async addReimb(newReimb: Reimb, user: User): Promise<Reimb> {

        try {
            if (!isValidObject(newReimb) || !isValidObject(user)){
                throw new BadRequestError();
            }
            
             return await this.reimbRepo.save(newReimb, user);
        } catch (e) {
            throw e;
        }
    }

    async updateReimb(updatedReimb: Reimb, user: User): Promise<boolean> {
        try {
            console.log(updatedReimb);
            console.log(user.role);
            if (!isValidObject(user) ){
                console.log('throw error')
                throw new BadRequestError();
            }
            if(updatedReimb.author===user.username){
                return await this.reimbRepo.update(updatedReimb, user)
            }
            else if (user.role==='manager'){
                return await this.reimbRepo.approve(updatedReimb, user)
            } else {
                throw new AuthorizationError;
            }
                
                
            // } else {
            //     console.log('update');
                
            //     return await this.reimbRepo.update(updatedReimb,user);
            // }
        } catch (e) {
            throw e;
        }
    }

    async deleteById(id: number): Promise<boolean> {
        try{
            if(!isValidId(id)){
                throw new BadRequestError();
            }
            return await this.reimbRepo.deleteById(id);
        } catch(e){
            throw e;
        }
    }
}