import { Component, OnDestroy, OnInit } from "@angular/core";

@Component({
  selector: 'pbc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy{
  title = 'PokemonBattleCompanion';

  constructor() {}

  ngOnInit(){}

  ngOnDestroy() {}
}
