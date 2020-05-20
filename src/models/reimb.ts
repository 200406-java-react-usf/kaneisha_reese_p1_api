export class Reimb {
    reimb_id: number;
    amount: number;
    submitted: Date;
    resolved: Date;
    description: string;
    author: string;
    resolver: string;
    reimb_status: string;
    reimb_type: string;

    constructor(reimb_id:number, amount:number, submitted: Date, resolved: Date, description: string, 
        author: string, resolver: string, reimb_status: string, reimb_type: string ){
            this.reimb_id = reimb_id;
            this.amount = amount;
            this.submitted = submitted;
            this.resolved = resolved;
            this.description = description;
            this.author = author;
            this.resolver = resolver;
            this.reimb_status = reimb_status;
            this.reimb_type = reimb_type;
        }

}