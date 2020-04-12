import { Component, OnInit } from '@angular/core';
import { ShamirsSecretService } from '../services/shamirs-secret.service';

@Component({
  selector: 'app-secret-sharing',
  templateUrl: './secret-sharing.component.html',
  styleUrls: ['./secret-sharing.component.css']
})
export class SecretSharingComponent implements OnInit {

  constructor(private shamirs: ShamirsSecretService) { }

  ngOnInit() {
    this.f();
  }

  f = () => console.log(this.shamirs.shamirsSecrets(3, 5));
}
