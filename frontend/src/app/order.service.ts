import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Order } from './model';

@Injectable()

export class RsvpService {
    // httpOptions = {
    //     headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    //   };



    constructor(private http: HttpClient){ }

    async getAllRsvp(id): Promise<Order[]> {
        const params = new HttpParams().set('id', `${id}`);

        const res = await this.http.get<any>('http://localhost:3000/order/total', {params})
            .toPromise()
        console.log(res.results);
        
        return res.results as Order[]
    }
}