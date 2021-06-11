import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  public formInfo: any = {
    keyword: '',
    category: '',
    distance: '',
    distanceUnit: '',
    from: '',
    fromLocation: '',

  }

  constructor() { }

  ngOnInit() {
    this.formInfo.from = 'Here' // Set the default choice of 'from' is "Here".
  }

  getChange(val: string) {
    console.log(val);
    this.formInfo.category = val;
    　　
  }
  clearForm(){
    this.formInfo.keyword = ''
    this.formInfo.category = ''
    this.formInfo.distance = ''
    this.formInfo.distanceUnit = ''
    this.formInfo.from = 'Here'
    this.formInfo.fromLocation = ''
    console.log("clear finished")
  }
  doSubmit() {
    console.log(this.formInfo);
  }

}
