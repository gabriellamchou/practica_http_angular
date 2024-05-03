import { HttpClient, HttpEventType, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject, map, catchError, throwError, tap } from "rxjs";
import { Post } from "./post.model";

@Injectable({
    providedIn: 'root'
})
export class PostsService {
    private serverUrl = 'https://ng-back-5c5b0-default-rtdb.europe-west1.firebasedatabase.app/';
    error = new Subject<string>();

    constructor(private http: HttpClient) { }

    createAndStorePost(title: string, content: string) {
        const postData: Post = { title: title, content: content }
        this.http
            .post<{ name: string }>(
                this.serverUrl + 'posts.json',
                postData,
                {
                    observe: 'response'
                }
            )
            .subscribe({
                next: (responseData) => {
                    console.log(responseData);
                },
                error: (e) => {
                    this.error.next(e.message);
                }
            });
    }

    fetchPosts() {
        let searchParams = new HttpParams();
        searchParams = searchParams.append('print', 'pretty');
        searchParams = searchParams.append('custom', 'key');
        return this.http
            .get<{ [key: string]: Post }>(
                this.serverUrl + 'posts.json',
                {
                    headers: new HttpHeaders({"Custom-Header" : 'Hello'}),
                    params: searchParams
                }
            )
            .pipe(
                map((responseData) => {
                    const postsArray: Post[] = [];
                    for (const key in responseData) {
                        if (responseData.hasOwnProperty(key)) {
                            postsArray.push({ ...responseData[key as keyof Object], id: key });
                        }
                    }
                    return postsArray;
                }),
                // catchError(errorRes => {
                //     return throwError(() => {errorRes});
                // })
            );
    }

    clearPosts() {
        return this.http
            .delete(
                this.serverUrl + 'posts.json',
                {
                    observe: 'events',
                    responseType: 'json'
                }
            ).pipe(tap(event => {
                console.log(event);
                if (event.type === HttpEventType.Response) {
                    console.log(event.body);
                }
            }));
    }
}