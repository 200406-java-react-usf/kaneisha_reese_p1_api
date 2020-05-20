export class Principal {

    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email:string;
    role: string;

    constructor(id: number, un: string, fn:string, ln:string, email:string,  role: string) {
        this.id = id;
        this.username = un;
        this.firstName=fn;
        this.lastName=ln;
        this.email=email;
        this.role = role;
    }
}