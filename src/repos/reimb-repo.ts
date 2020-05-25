import { CrudRepository } from "./crud-repo";
import { Reimb } from "../models/reimb";
import { PoolClient } from "pg";
import { connectionPool } from "..";
import { mapReimbResultSet } from "../util/result-set-mapper";
import { InternalServerError } from "../errors/errors";
import { User } from "../models/user";

export class ReimbRepository  {
    baseQuery = `
        select 
            er.reimb_id,
            er.amount,
            er.submitted,
            er.resolved,
            er.description,
            eu.username as author,
            eu2.username as resolver,
            rs.reimb_status as reimb_status,
            rt.reimb_type as reimb_type
        from 
            ers_reimbursements as er
        left join 
            ers_users eu on er.author_id = eu.user_id 
        left join 
            ers_users eu2 on eu2.user_id = er.resolver_id 
        left join 
            ers_reimb_statuses as rs on er.reimb_status_id = rs.reimb_status_id
        left join 
            ers_reimb_types  as rt on er.reimb_type_id = rt.reimb_type_id

    `;

    /**
     * Gets all reimbursements for the database
     */
    async getAll(): Promise<Reimb[]> {
        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `${this.baseQuery}`;
            let rs = await client.query(sql);
           // console.log(rs)
            return rs.rows.map(mapReimbResultSet);
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    }
    /**
     * Gets all reimburments where the author is = 
     * @param username 
     */
    async getAllByUsername(username :string): Promise<Reimb[]> {
        let client: PoolClient;


        try {
            client = await connectionPool.connect();
            let sql = `${this.baseQuery} where er.author_id = (select user_id from ers_users where username = $1)`;
            let rs = await client.query(sql, [username]);


            return rs.rows.map(mapReimbResultSet);
        } catch (e) {
            

            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    }

    /**
     * Gets the reimbursment with reimb_id =
     * @param id 
     */
    async getById(id:number): Promise<Reimb> {
        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `${this.baseQuery} where er.reimb_id = $1`;
            let rs = await client.query(sql, [id]);
            return 
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    }

    /**
     * Adds reimb to the database with the data
     * @param newReimb amount, submitted, description, author_id, reimb_status_id, and reim_type_id where
     * @param user user_id = author_id
     */
    async save(newReimb: Reimb, user: User): Promise<Reimb> {
            
        let client: PoolClient;

        
        try {
            client = await connectionPool.connect();
            let authorId = await (await client.query(`select user_id from ers_users where username = $1;`,[user.username])).rows[0].user_id;
            console.log(authorId);
            
            let reimbTypeId = (await client.query(`select reimb_type_id from ers_reimb_types where reimb_type = $1;`,[newReimb.reimb_type])).rows[0].id;            
            console.log(reimbTypeId);
            
            let sql = `
            insert into ers_reimbursements ( amount, submitted, description, author_id, reimb_status_id, reimb_type_id) 
            values ($1, CURRENT_TIMESTAMP, $2, $3, 1, $4) returning reimb_id;
            `;

            
            let rs = await client.query(sql, [ newReimb.amount,  newReimb.description, authorId, reimbTypeId ]);
            
            newReimb.reimb_id = rs.rows[0].id;
            
            return newReimb;

        } catch (e) {
            console.log(e);
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    
    }

    /**
     * AdUpdatesds reimb in the database with the data
     * @param newReimb amount, submitted, description, author_id, reimb_status_id, and reim_type_id where reimb_id=id and
     * @param user user_id = author_id
     */
    async update(updatedReimb: Reimb, user: User): Promise<boolean> {
        console.log('repo update');
        
        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `
            update ers_reimbursements 
            set amount = $1, 
                submitted = CURRENT_TIMESTAMP, 
                description = $2,   
                reimb_type_id = (select reimb_type_id from ers_reimb_type where reimb_type =$3)
            where reimb_id = $4`;
            let rs = await client.query(sql, [updatedReimb.amount, updatedReimb.description, updatedReimb.reimb_type, updatedReimb.reimb_id ]);
            console.log(rs);
            
            return true;
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    
    }

    /**
     * Updates reimb 
     * @param approvedReimb reimb_status_id, resolved, resolver_id where reimb_id = id and 
     * @param user user_id = resolver_id
     */
    async approve(approvedReimb: Reimb, user: User): Promise<boolean> {
        console.log('approve repo');
        console.log(approvedReimb);
        console.log(user);
        
        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            Date.now()
            let sql = `
            update ers_reimbursements 
            set reimb_status_id = (select reimb_status_id from ers_reimb_statuses where reimb_status =$1), 
                resolver_id = $2, 
                resolved =  CURRENT_TIMESTAMP
            where reimb_id = $3`;
            let rs = await client.query(sql, [approvedReimb.reimb_status, user.user_id, approvedReimb.reimb_id]);
            return true;
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    
    }

    /**
     * Delets reimb from database where
     * @param id =reimb_id
     */
    async deleteById(id: number): Promise<boolean> {

        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `delete from ers_reimbursements where reimb_id =$1`;
            let rs = await client.query(sql, [id]);
            return true;
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }

    }

}