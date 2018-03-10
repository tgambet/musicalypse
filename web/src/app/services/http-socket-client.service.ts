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

@Injectable()
export class HttpSocketClientService implements OnDestroy {

  constructor(private httpClient: HttpClient) { }

  private socket: Subject<string>;

  private id = 0;

  private static getSocketUrl() {
    let socketUrl = '';
    socketUrl += window.location.protocol === 'http:' ? 'ws://' : 'wss://';
    socketUrl += window.location.hostname;
    if (environment.production) {
      if (window.location.port) {
        socketUrl += ':' + window.location.port;
      }
    } else {
      socketUrl += ':' + environment.httpPort;
    }
    socketUrl += '/socket';
    return socketUrl;
  }

  private static getAPIUrl(path: string) {
    let url = '';
    url += window.location.protocol + '//' + window.location.hostname;
    if (environment.production) {
      if (window.location.port) {
        url += ':' + window.location.port;
      }
    } else {
      url += ':' + environment.httpPort;
    }
    url += path;
    return url;
  }

  getSocket(): Subject<Object> {
    if (!this.socket) {
      this.socket = webSocket(HttpSocketClientService.getSocketUrl());
      this.socket.subscribe(
        (next) => {},
        (error) => this.closeSocket(),
        () => this.closeSocket()
      );
    }
    return this.socket;
  }

  closeSocket(): void {
    if (this.socket) {
      this.socket.unsubscribe();
    }
    this.socket = null;
  }

  isSocketOpen(): boolean {
    return this.socket != null;
  }

  send(message: any): void {
    this.getSocket().next(JSON.stringify(message));
  }

  ngOnDestroy(): void {
    this.closeSocket();
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
      return this.httpClient.post(HttpSocketClientService.getAPIUrl(path), entity);
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
