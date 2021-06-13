import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  
  constructor(public http: HttpClient) { }
  
  public formInfo: any = {
    keyword: '',
    category: '',
    distance: '',
    distanceUnit: '',
    from: '',
    fromLocation: '',
  }
  public keywordInvalid:boolean = false
  public locationInvalid:boolean = false

  public getCurrentLocation = false
  public currentLatitude:String = ''
  public currentLongitude:String = ''

  // Keyword auto-complete
  options: string[] = ['One', 'Two', 'Three', 'five'];  // keyword auto-complete content
  keywordControl = new FormControl();

  ngOnInit() {
    this.formInfo.from = 'Here';  // Set the default choice of 'from' is "Here".

    // Get current location
    var geoUrl = "https://ipinfo.io/?token=c4eba8a0a82929";
    fetch(geoUrl)
      .then(resGeoData => resGeoData.json())
      .then(resGeoData => {
        var location = resGeoData.loc;
        this.currentLatitude = location.substring(0, location.indexOf(','))
        this.currentLongitude = location.substring(location.indexOf(',') + 1, location.length)
        if(this.currentLatitude != '' && this.currentLongitude != ''){
          this.getCurrentLocation = true;
        }
      })
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

    this.keywordInvalid = false
    this.locationInvalid = false
    console.log("clear finished")
  }
  doSubmit() {
    this.formInfo.keyword = this.keywordControl.value;
    console.log(this.formInfo.keyword)

    // Invalid keyword input
    if(this.formInfo.keyword == null){
      this.keywordInvalid = true;
    }

    // Invalid location input when choose other
    if(this.formInfo.from == 'Other' && this.formInfo.fromLocation == ''){
      this.locationInvalid = true;
    }

    console.log(this.keywordInvalid);
    var url = "http://127.0.0.1:8080/?"
    url += "keyword=" + this.formInfo.keyword
    url += "&category=" + this.formInfo.category
    url += "&distance=" + this.formInfo.distance
    url += "&distanceUnit=" + this.formInfo.distanceUnit
    url += "&from=" + this.formInfo.from
    url += "&fromLocation=" + this.formInfo.fromLocation

    this.http.get(url).subscribe(response =>
      {
        console.log(response);
      });
  }

}
