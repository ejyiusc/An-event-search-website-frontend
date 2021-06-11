import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  public formInfo: any = {
    keyword: '',
    category: ''
  }

  constructor() { }

  ngOnInit(): void {
  }

  getChange(val: string) {
    console.log(val);
    this.formInfo.category = val;
    　　
  }
  doSubmit() {
    console.log(this.formInfo);
  }

}
