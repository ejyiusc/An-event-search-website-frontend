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
  //////// Data
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
  public latitude:String

  // Keyword auto-complete
  options: string[] = ['One', 'Two', 'Three', 'five'];  // keyword auto-complete content
  keywordControl = new FormControl();

  ////////////////

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
    
    // When inputed keyword changes, request backend to auto-complete
    this.keywordControl.valueChanges.subscribe(realTimeKeyword => {
      console.log('realTimeKeyword: ', realTimeKeyword)
      this.requestBackendToAutoComplete(realTimeKeyword)
    })
  }

  getChange(val: string) {
    console.log(val);
    this.formInfo.category = val;
    　　
  }

  clearForm(){
    this.keywordControl = new FormControl();
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
            var latitude = resGeoData["results"][0]["geometry"]["location"]["lat"]
            var longitude = resGeoData["results"][0]["geometry"]["location"]["lng"]
            console.log("form info: (other location)", this.formInfo)
            this.requestBackendToSearch(latitude, longitude)
          })
      }
    }
    else{
      this.requestBackendToSearch(this.currentLatitude, this.currentLongitude)
    }
  }

  requestBackendToAutoComplete(keyword:String){
    var backendUrl = "http://127.0.0.1:8080/autocomplete?"
    backendUrl += "keyword=" + keyword
    console.log("Auto-complete backendUrl:", backendUrl)
    fetch(backendUrl)
      .then(resAutoCompleteData => resAutoCompleteData.json())
      .then(resAutoCompleteData => {
        console.log(resAutoCompleteData.attractions)
        var autoCompleteContent = []
        for(var i = 0; i < resAutoCompleteData.attractions.length; ++i){
          autoCompleteContent.push(resAutoCompleteData.attractions[i].name)
        }
        this.options = autoCompleteContent
      })
  }

  requestBackendToSearch(latitude:String, longitude:String){
    var backendUrl = "http://127.0.0.1:8080/?"
    backendUrl += "keyword=" + this.formInfo.keyword
    backendUrl += "&category=" + this.formInfo.category
    backendUrl += "&distance=" + this.formInfo.distance
    backendUrl += "&distanceUnit=" + this.formInfo.distanceUnit
    backendUrl += "&from=" + this.formInfo.from
    backendUrl += "&fromLocation=" + this.formInfo.fromLocation
    backendUrl += "&latitude=" + latitude
    backendUrl += "&longitude=" + longitude
    console.log("backendUrl:", backendUrl)
    this.http.get(backendUrl).subscribe(response =>
      {
        console.log(response);
      });
  }
}
