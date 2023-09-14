import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'pbc-main-menu',
    templateUrl: './main-menu.component.html',
    styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit {

    constructor(private _router: Router) { }

    ngOnInit(): void {
    }

    public onAppClicked(appName: string): void {
        this._router.navigate([`${appName}`])
    }
}

