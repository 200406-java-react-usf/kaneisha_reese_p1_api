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

    async getAll(): Promise<Reimb[]> {
        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `${this.baseQuery}`;
            let rs = await client.query(sql);
            console.log(rs)
            return rs.rows.map(mapReimbResultSet);
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    }

    async getAllByUsername(username :string): Promise<Reimb[]> {
        let client: PoolClient;

        console.log('made it here 5');

        try {
            client = await connectionPool.connect();
            let sql = `${this.baseQuery} where er.author_id = (select user_id from ers_users where username = $1)`;
            let rs = await client.query(sql, [username]);
            console.log('made it here 6');

            return rs.rows.map(mapReimbResultSet);
        } catch (e) {
            console.log('made it here 7');

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

    async save(newReimb: Reimb, user: User): Promise<Reimb> {
            
        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let authorId = (await client.query(`select user_id from ers_users where username = $1;`[user.username])).rows[0].user_id;
            let reimbStatusId = (await client.query(`select reimb_status_id from ers_reimb_statuses where reimb_status = $1;`[newReimb.reimb_status])).rows[0].id;
            let reimbTypeId = (await client.query(`select reimb_type_id from ers_reimb_types where reimb_type = $1;`[newReimb.reimb_type])).rows[0].id;            
            let sql = `
                insert into ers_reimbursements ( amount, submitted, description, author_id, reimb_status_id, reimb_type_id) 
                values ($1, CURRENT_TIME, $3, $4, 1, $5) returning ers_reimb_id
            `;

            let rs = await client.query(sql, [ newReimb.amount, this.currentTime(), newReimb.description, authorId, reimbStatusId, reimbTypeId ]);
            
            newReimb.reimb_id = rs.rows[0].id;
            
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
                set amount=$1, submitted=$2, description=$3,  reimb_type_id=(select reimb_status_id from ers_reimb_types where reimb_type =$4)) `;
            let rs = await client.query(sql, [updatedReimb.amount, this.currentTime(), updatedReimb.description, updatedReimb.reimb_type ]);
            return true;
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    
    }

    async approve(approvedReimb: Reimb, user: User): Promise<boolean> {
        
        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            Date.now()
            let sql = `update ers_reimbursements 
                set reimb_status_id = (select reimb_status_id from ers_reimb_statuses where reimb_status =$1),
                set resolver_id = $2,
                set  resolved = $3`;
            let rs = await client.query(sql, [approvedReimb.reimb_status, user.user_id, this.currentTime()]);
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
            let sql = `delete from ers_reimbursements where reimb_id =$1`;
            let rs = await client.query(sql, [id]);
            return true;
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }

    }

    currentTime(){
        var d = new Date();
        d = new Date(d.getTime() - 3000000);
        return d;
    }

}