import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as Animations from './animations';

@Component({
    selector: 'pbc-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    animations: [
        Animations.slideInAnimations,
    ]
})
export class AppComponent {
    title = 'PokemonBattleCompanion';

    // For route animations.
    public prepareRoute(outlet: RouterOutlet) {
        return outlet?.activatedRouteData?.['animation'];
    }
}
