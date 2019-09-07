import { Injectable,Inject } from '@angular/core';
import { Observable,of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Leader } from '../shared/leader';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { baseURL } from '../shared/baseurl';

@Injectable({
  providedIn: 'root'
})
export class LeaderService {

  constructor(  private http: HttpClient) { }
 
  getLeaders(): Observable<Leader[]>{
    return this.http.get<Leader[]>(baseURL + 'LEADERS');
  }

  getLeader(id: string): Observable<Leader> {
    return this.http.get<Leader>(baseURL + 'LEADERS/' + id);
  }

  getFeaturedLeader() : Observable<Leader>{
    return this.http.get<Leader[]>(baseURL + 'LEADERS?featured=true').pipe(map(leaders => leaders[0]));
  }
}
