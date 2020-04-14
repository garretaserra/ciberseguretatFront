import { Component, OnInit } from '@angular/core';
import { IPoint } from 'src/app/models/ipoint';
import { ShamirsSecretService } from 'src/app/services/shamirs-secret.service';

@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.css']
})
export class GeneratorComponent implements OnInit {
  points: IPoint<string>[];
  t: string;
  n: string;
  cardId;

  constructor(private shamirs: ShamirsSecretService) { }

  ngOnInit() {
  }

  getPoints = () => {
    const _t: number = Number(this.t);
    const _n: number = Number(this.n);
    this.points = this.shamirs.getPoints(_n, _t, this.shamirs.getModulus());
  }

  copy = (point: IPoint<string>) => {
    const val: string = `${point.x},${point.y}`;
    const selBox = document.createElement('textarea');
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    alert(`Copied!`);
    }
}
