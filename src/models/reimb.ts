export class Reimb {
    id: number;
    amount: number;
    submitted: Date;
    resolved: Date;
    description: string;
    author_id: string;
    resolver_id: string;
    reimb_status: string;
    reimb_type: string;

    constructor(id:number, amount:number, submitted: Date, resolved: Date, description: string, 
        author_id: string, resolver_id: string, reimb_status: string, reimb_type: string ){
            this.id = id;
            this.amount = amount;
            this.submitted = submitted;
            this.resolved = resolved;
            this.description = resolver_id;
            this.author_id = author_id;
            this.resolver_id = resolver_id;
            this.reimb_status = reimb_status;
            this.reimb_type = reimb_type;
        }

}