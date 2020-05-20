import { isValidId, isValidStrings, isValidObject, isPropertyOf, isEmptyObject } from "../util/validator";
import { 
    BadRequestError, 
    ResourceNotFoundError, 
    NotImplementedError, 
    ResourcePersistenceError, 
    AuthenticationError 
} from "../errors/errors";
import { ReimbRepository } from "../repos/reimb-repo";
import { Reimb } from "../models/reimb";

export class ReimbService {
    constructor (private reimbRepo: ReimbRepository){
        this.reimbRepo = reimbRepo;
    }

    async getAllReimbs(): Promise<Reimb[]> {
        console.log('made it here 3');
        let reimbs = await this.reimbRepo.getAll();

        console.log('made it here 4');
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

    async newReimb(updatedReimb: Reimb): Promise<Reimb> {
        try {
            if (!isValidObject(updatedReimb)){
                throw new BadRequestError();
            }
             return await this.reimbRepo.save(updatedReimb);
        } catch (e) {
            throw e;
        }
    }

    async updateReimb(updatedReimb: Reimb): Promise<boolean> {
        try {
            if (!isValidObject(updatedReimb)){
                throw new BadRequestError();
            }
             return await this.reimbRepo.update(updatedReimb);
        } catch (e) {
            throw e;
        }
    }

    async approveReimb(updatedReimb: Reimb): Promise<boolean> {
        try {
            if (!isValidObject(updatedReimb)){
                throw new BadRequestError();
            }
             return await this.reimbRepo.update(updatedReimb);
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