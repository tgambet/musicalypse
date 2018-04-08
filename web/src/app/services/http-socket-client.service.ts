import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {webSocket} from 'rxjs/observable/dom/webSocket';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/concat';
import * as _ from 'lodash';

@Injectable()
export class HttpSocketClientService implements OnDestroy {

  constructor(private httpClient: HttpClient) { }

  public id = 0;

  private socketOpened = false;

  private socket: Subject<Object> = webSocket({
    url: HttpSocketClientService.getSocketUrl(),
    openObserver: {
      next: (val: Event) => this.socketOpened = true
    },
    closeObserver: {
      next: (val: CloseEvent) => this.socketOpened = false
    }
  });

  private socketObs: Observable<SocketMessage> = this.socket.publish().refCount() as Observable<SocketMessage>;

  private static getSocketUrl() {
    let socketUrl = '';
    if (environment.electron) {
      socketUrl += 'ws://localhost:' + environment.httpPort;
    } else {
      socketUrl += window.location.protocol === 'http:' ? 'ws://' : 'wss://';
      socketUrl += window.location.hostname;
      if (environment.production) {
        if (window.location.port) {
          socketUrl += ':' + window.location.port;
        }
      } else {
        socketUrl += ':' + environment.httpPort;
      }
    }
    socketUrl += '/socket';
    return socketUrl;
  }

  private static getAPIUrl(path: string) {
    let url = '';
    if (environment.electron) {
      url += 'http://localhost:' + environment.httpPort;
    } else {
      url += window.location.protocol + '//' + window.location.hostname;
      if (environment.production) {
        if (window.location.port) {
          url += ':' + window.location.port;
        }
      } else {
        url += ':' + environment.httpPort;
      }
    }
    url += path;
    return url;
  }

  getSocket(): Observable<SocketMessage> {
    return this.socketObs;
  }

  // openSocket(): Observable<Object> {
  //   if (!this.socket) {
  //     this.socket = webSocket(HttpSocketClientService.getSocketUrl()); // publish().refCount()
  //     this.socket.subscribe(
  //       () => {},
  //       (error) => this.closeSocket(),
  //       () => this.closeSocket()
  //     );
  //   }
  //   return this.socket;
  // }
  //
  // closeSocket(): void {
  //   if (this.socket) {
  //     this.socket.unsubscribe();
  //   }
  //   this.socket = null;
  // }

  isSocketOpen(): boolean {
    // return this.socket != null;
    return this.socketOpened;
  }

  send(message: any): void {
    // if (!this.socket) { throw new Error('Unable to send on a closed socket: ' + message); }
    this.socket.next(JSON.stringify(message));
  }

  ngOnDestroy(): void {
    this.socket.unsubscribe();
  }

  get(path: string): Observable<Object> {
    if (!this.socket) {
      return this.httpClient.get(HttpSocketClientService.getAPIUrl(path));
    } else {
      const request: HttpRequest = {
        method: 'HttpRequest',
        entity: {
          method: 'GET',
          url: HttpSocketClientService.getAPIUrl(path)
        },
        id: this.id++
      };
      return this.sendRequest(request);
    }
  }

  post(path: string, entity: Object): Observable<Object> {
    if (!this.socket) {
      return this.httpClient.post(
        HttpSocketClientService.getAPIUrl(path),
        JSON.stringify(entity),
        { headers: {'Content-Type': 'application/json'}}
      );
    } else {
      const request: HttpRequest = {
        method: 'HttpRequest',
        entity: {
          method: 'POST',
          url: HttpSocketClientService.getAPIUrl(path),
          entity: entity
        },
        id: this.id++
      };
      return this.sendRequest(request);
    }
  }

  postFiles(path: string, files: File[]): Observable<Object> {
    const filesObs: Observable<Object>[] =
      _.map(files, file => this.postFile(path, file).map(event => ({event: event, file: file })));

    // const acknowledgment = Observable.create(observer => {
    //   observer.next({ event: { type: 10 }});
    //   observer.complete();
    //   return () => {};
    // });

    return _.reduce(filesObs, (obs1: Observable<Object>, obs2) => obs1.concat(obs2));

  }

  postFile(path: string, file: File): Observable<Object> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.httpClient.post(
      HttpSocketClientService.getAPIUrl(path),
      formData,
      {reportProgress: true, observe: 'events'}
    );
  }

  _delete(path: string): Observable<Object> {
    if (!this.socket) {
      return this.httpClient.delete(
        HttpSocketClientService.getAPIUrl(path)/*,
        { headers: {'Content-Type': 'application/json'}}*/
      );
    } else {
      const request: HttpRequest = {
        method: 'HttpRequest',
        entity: {
          method: 'DELETE',
          url: HttpSocketClientService.getAPIUrl(path),
        },
        id: this.id++
      };
      return this.sendRequest(request);
    }
  }


  private sendRequest(request: HttpRequest): Observable<Object> {
    const expectResponse =
      this.getSocket()
        .filter((r: HttpResponse) => r.method === 'HttpResponse' && r.id === request.id)
        .map((r: HttpResponse) => {
          const status = r.entity.status;
          const statusText = r.entity.statusText;
          const entity = r.entity.entity;
          if (status >= 400) {
            throw new HttpErrorResponse({error: entity, status: status, statusText: statusText, url: request.entity.url});
          }
          return entity;
        })
        .take(1);
    const sendRequest = Observable.create(observer => {
      this.send(request);
      observer.complete();
      return () => {};
    });
    return sendRequest.concat(expectResponse);
  }

}

export interface SocketMessage {
  id: number;
  method: string;
  entity: any;
}

export interface HttpRequest {
  method: string;
  id: number;
  entity: {
    method: string,
    url: string,
    entity?: Object
  };
}

export interface HttpResponse {
  method: string;
  id: number;
  entity: {
    status: number,
    statusText: string,
    entity: Object
  };
}
