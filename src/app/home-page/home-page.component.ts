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
    latitude: '',
    longitude: '',
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
        this.formInfo.latitude = this.currentLatitude
        this.formInfo.longitude = this.currentLongitude
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

    // Invalid keyword input
    if(this.formInfo.keyword == null){
      this.keywordInvalid = true;
      return
    }

    if(this.formInfo.from == 'Other'){
      if(this.formInfo.fromLocation == ''){
        // Invalid location input when choose other
        this.locationInvalid = true;
        return
      }
      else{
        // Request google map api
        var googleGeoApiBaseUrl = "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyDRm6eke0AgBCdf-4QGRrYOhktzb4y8Jos&address="
        googleGeoApiBaseUrl += this.formInfo.fromLocation
        fetch(googleGeoApiBaseUrl)
          .then(resGeoData => resGeoData.json())
          .then(resGeoData => {
            console.log("google map location: ", resGeoData)
            this.formInfo.latitude = resGeoData["results"][0]["geometry"]["location"]["lat"]
            this.formInfo.longitude = resGeoData["results"][0]["geometry"]["location"]["lng"]
            console.log("form info: (other location)", this.formInfo)
            this.requestBackend()
          })
      }
    }
    else{
      this.requestBackend()
    }
  }

  requestBackend(){
    var backendUrl = "http://127.0.0.1:8080/?"
    backendUrl += "keyword=" + this.formInfo.keyword
    backendUrl += "&category=" + this.formInfo.category
    backendUrl += "&distance=" + this.formInfo.distance
    backendUrl += "&distanceUnit=" + this.formInfo.distanceUnit
    backendUrl += "&from=" + this.formInfo.from
    backendUrl += "&fromLocation=" + this.formInfo.fromLocation
    backendUrl += "&latitude=" + this.formInfo.latitude
    backendUrl += "&longitude=" + this.formInfo.longitude
    console.log("form info:", this.formInfo)
    this.http.get(backendUrl).subscribe(response =>
      {
        console.log(response);
      });
  }
}
