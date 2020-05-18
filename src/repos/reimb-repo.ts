import { CrudRepository } from "./crud-repo";
import { Reimb } from "../models/reimb";
import { PoolClient } from "pg";
import { connectionPool } from "..";
import { mapReimbResultSet } from "../util/result-set-mapper";
import { InternalServerError } from "../errors/errors";

export class ReimbRepository implements CrudRepository<Reimb> {
    baseQuery = `
        select 
            er.reimb_id,
            er.amount,
            er.submitted,
            er.resolved,
            er.description,
            eu.ers_username as author,
            eu.ers_username as resolver,
            rs.reimb_status as reimb_status,
            rt.reimb_type as reimb_type
        from ers_reimbursements er
        join ers_user eu on er.author_id = eu.ers_user_id,
        join eu on er.resolver_id = eu.ers_user_id,
        join ers_reimb_statuses rs on er.reimb_status_id = rs.reimb_status_id,
       

    `;

    async getAll(): Promise<Reimb[]> {
        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `${this.baseQuery}`;
            let rs = await client.query(sql);
            return rs.rows.map(mapReimbResultSet);
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    }

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

    async save(newReimb: Reimb): Promise<Reimb> {
            
        let client: PoolClient;

        try {
            client = await connectionPool.connect();

            let authorId = (await client.query(`select ers_user_id from ers_users where username = $1;`[newReimb.author])).rows[0].id;
            let reimbStatusId = (await client.query(`select reimb_status_id from ers_reimb_statuses where reimb_status = $1;`[newReimb.reimb_status])).rows[0].id;
            let reimbTypeId = (await client.query(`select reimb_type_id from ers_reimb_types where reimb_type = $1;`[newReimb.reimb_type])).rows[0].id;            
            let sql = `
                insert into ers_reimbursements (reimb_id, amount, submitted, description, author_id, reimb_status_id, reimb_type_id) 
                values ($1, $2, $3, $4, $5, 1, $6) returning ers_reimb_id
            `;

            let rs = await client.query(sql, [newReimb.id, newReimb.amount, newReimb.submitted, newReimb.description, authorId, reimbStatusId, reimbTypeId ]);
            
            newReimb.id = rs.rows[0].id;
            
            return newReimb;

        } catch (e) {
            console.log(e);
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    
    }

    async update(updatedReimb: Reimb): Promise<boolean> {
        
        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `update ers_reimbursements 
                set reimb_id = $1, amount=$2, submitted=$3, description=$4, author_id = $5, reimb_status_id=$6, reimb_type_id=$7) `;
            let rs = await client.query(sql, []);
            return true;
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    
    }

    async deleteById(id: number): Promise<boolean> {

        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = ``;
            let rs = await client.query(sql, []);
            return true;
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }

    }

}