import { User } from '../models/user';
import { CrudRepository } from './crud-repo';
import {
    NotImplementedError, 
    ResourceNotFoundError, 
    ResourcePersistenceError,
    InternalServerError
} from '../errors/errors';
import { PoolClient } from 'pg';
import { connectionPool } from '..';
import { mapUserResultSet } from '../util/result-set-mapper';

export class UserRepository implements CrudRepository<User> {

    baseQuery = `
        select
            eu.user_id, 
            eu.username, 
            eu.password, 
            eu.first_name,
            eu.last_name,
            eu.email,
            ur.role_name as role_name
        from ers_users eu
        join ers_user_roles ur
        on eu.user_role_id = ur.role_id 
        where status = true
    `;

    async getAll(): Promise<User[]> {

        let client: PoolClient;

        try { 
            client = await connectionPool.connect();
            let sql = `${this.baseQuery}`;
            let rs = await client.query(sql); // rs = ResultSet
            return rs.rows.map(mapUserResultSet);
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    
    }

    async getById(id: number): Promise<User> {
        console.log('made it here 1')
        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `${this.baseQuery} and eu.user_id = $1`;
            let rs = await client.query(sql, [id]);
            console.log('made it here 2')
            console.log(mapUserResultSet(rs.rows[0]));
            return mapUserResultSet(rs.rows[0]);
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    

    }

    async getUserByUniqueKey(key: string, val: string): Promise<User> {

        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `${this.baseQuery} and eu.${key} = $1`;
            let rs = await client.query(sql, [val]);
            return mapUserResultSet(rs.rows[0]);
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
        
    
    }

    async getUserByCredentials(un: string, pw: string) {
        
        let client: PoolClient;

        try {
            client = await connectionPool.connect();
            let sql = `${this.baseQuery} and eu.username = $1 and eu.password = $2;`;
            let rs = await client.query(sql, [un, pw]);
            
            return mapUserResultSet(rs.rows[0]);
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    
    }

    async save(newUser: User): Promise<User> {

        let client: PoolClient;
        let roleId: number;


        try {
            client = await connectionPool.connect();

            
            
            let sql = `
                insert into ers_users (username, password, first_name, last_name, email) 
                values ($1, $2, $3, $4, $5) returning user_id;
            `;

            let rs = await client.query(sql, [newUser.username, newUser.password, newUser.firstName, newUser.lastName, newUser.email]);
            
            newUser.user_id = rs.rows[0].user_id;
            
            return newUser;

        } catch (e) {
            console.log(e);
            throw new InternalServerError();
        } finally {
            client && client.release();
        }
    
    }

    async update(updatedUser: User): Promise<boolean> {
        
        let client: PoolClient;
       

        try {
            client = await connectionPool.connect();

            let roleId = (await client.query('select role_id from ers_user_roles where role_name = $1', [updatedUser.role])).rows[0].id;
            let sql = `update ers_users eu  set username = $1, "password" = $2,  first_name =$3, last_name =$4, user_role_id =$7 
            where eu.ers_user_id = $8 and eu.ers_email = $6;
            `;
            let rs = await client.query(sql, [updatedUser.username, updatedUser.password, updatedUser.firstName, updatedUser.lastName, updatedUser.email, roleId, updatedUser.user_id]);
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
            let sql = `update ers_users eu set status = false 
            where eu.user_id = $1; `;
            await client.query(sql, [id]);
            return true;
        } catch (e) {
            throw new InternalServerError();
        } finally {
            client && client.release();
        }

    }



}
