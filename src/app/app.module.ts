import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DamageMultipliersComponent } from './damage-multipliers/damage-multipliers.component';
import { TypeChartComponent } from './type-chart/type-chart.component';
import { GenerationPickerComponent } from './generation-picker/generation-picker.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { PokemonDetailsComponent } from './pokemon-details/pokemon-details.component';

const routes = [
    // Define your routes here
    {
        path: '',
        component: MainMenuComponent,
        children: [
            {
                path: 'weaknesses',
                component: PokemonDetailsComponent,
            },
            {
                path: 'typechart',
                component: TypeChartComponent,
            },
        ],
    },
    { path: '**', component: MainMenuComponent } // wildcard path if the path doesn't match anything
];

@NgModule({
    declarations: [
        AppComponent,
        PokemonDetailsComponent,
        DamageMultipliersComponent,
        TypeChartComponent,
        GenerationPickerComponent,
        MainMenuComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        RouterModule.forRoot(routes), // Use RouterModule.forRoot here
        FormsModule,
        ReactiveFormsModule,
        NgbModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
