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
  options: string[] = [];  // keyword auto-complete content
  keywordControl = new FormControl();

  public noEvents:boolean = false
  public showEvents:boolean = false
 
  public eventsContent:any
  public showDetails:boolean = false

  navChosen = 1;  // Nav bar choice
  public detailContent = {
    ArtistTeam: '',
    Venue: '',
    VenueId: '',
    Time: '',
    Category: '',
    PriceRange: '',
    TicketStatus: '',
    BuyTicketAt: '',
    SeatMap: '',
    Name: '',
  }

 public venueDetailContent = {
   Address: '',
   City: '',
   PhoneNumber: '',
   OpenHours: '',
   GeneralRule: '',
   ChildRule: '',
 }

 public twitterApi = "https://twitter.com/intent/tweet?text="

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

    var categorySearch = this.formInfo.category
    if(categorySearch == ''){
      categorySearch = "All"
    }

    var distanceSearch = this.formInfo.distance
    if(distanceSearch == ''){
      distanceSearch = "10"
    }

    var distanceUnitSearch = this.formInfo.distance
    if(distanceUnitSearch == ''){
      distanceUnitSearch = "miles"
    }

    backendUrl += "keyword=" + this.formInfo.keyword
    backendUrl += "&category=" + categorySearch
    backendUrl += "&distance=" + distanceSearch
    backendUrl += "&distanceUnit=" + distanceUnitSearch
    backendUrl += "&from=" + this.formInfo.from
    backendUrl += "&fromLocation=" + this.formInfo.fromLocation
    backendUrl += "&latitude=" + latitude
    backendUrl += "&longitude=" + longitude
    console.log("backendUrl:", backendUrl)

    fetch(backendUrl)
    .then(response => response.json())
    .then(response => {
      console.log("events: ", response)
      if(response.page.totalElements == 0){
        console.log("No Events")
        this.noEvents = true
      }
      else{
        this.eventsContent = response._embedded.events.sort(this.sortFunction)
        this.showEvents = true
        console.log('eventsContent: ', this.eventsContent)
      }
    })
  }

  getDetails(index:number){
    
    console.log("index: ", this.eventsContent[index])

    var Venue = ''
    var VenueId = ''
    if(this.eventsContent[index].hasOwnProperty('_embedded') && 
        this.eventsContent[index]._embedded.hasOwnProperty('venues') &&
        this.eventsContent[index]._embedded.venues.length != 0){
          Venue = this.eventsContent[index]._embedded.venues[0].name
          VenueId = this.eventsContent[index]._embedded.venues[0].id
        }
    if(Venue != ''){
      this.detailContent.Venue = Venue
    }
    if(VenueId != ''){
      this.detailContent.VenueId = VenueId

      // Search for venue details
      var searchVenueDetailsBackendUrl = "http://127.0.0.1:8080/venueDetail?"
      searchVenueDetailsBackendUrl += "id=" + this.detailContent.VenueId
      fetch(searchVenueDetailsBackendUrl)
      .then(response => response.json())
      .then(response => {
        console.log("venue details: ", response)

        if(response.hasOwnProperty('venues') && 
          response.venues.length > 0){
            // Address
            if(response.venues[0].hasOwnProperty('address')){
              if(response.venues[0].address.hasOwnProperty('line1')){
                this.venueDetailContent.Address = response.venues[0].address.line1
              }
            }

            // City
            if(response.venues[0].hasOwnProperty('city')){
              if(response.venues[0].city.hasOwnProperty('name')){
                this.venueDetailContent.City = response.venues[0].city.name
              }
            }

            if(response.venues[0].hasOwnProperty('state')){
              if(response.venues[0].city.hasOwnProperty('name')){
                this.venueDetailContent.City += ', ' + response.venues[0].state.name
              }
            }

            if(response.venues[0].hasOwnProperty('boxOfficeInfo')){
              // Phone Number
              if(response.venues[0].boxOfficeInfo.hasOwnProperty('phoneNumberDetail')){
                this.venueDetailContent.PhoneNumber = response.venues[0].boxOfficeInfo.phoneNumberDetail
              }

              // Open hours
              if(response.venues[0].boxOfficeInfo.hasOwnProperty('openHoursDetail')){
                this.venueDetailContent.OpenHours = response.venues[0].boxOfficeInfo.openHoursDetail
              }
            }

            if(response.venues[0].hasOwnProperty('generalInfo')){
              // General Rule
              if(response.venues[0].generalInfo.hasOwnProperty('generalRule')){
                this.venueDetailContent.GeneralRule = response.venues[0].generalInfo.generalRule
              }

              // Child Rule
              if(response.venues[0].generalInfo.hasOwnProperty('childlRule')){
                this.venueDetailContent.ChildRule = response.venues[0].generalInfo.childlRule
              }
            }

          console.log("this.venueDetailContent", this.venueDetailContent)

            

        }
      })
    }

    // Event name
    this.detailContent['Name'] = this.eventsContent[index].name
    

    var ArtistTeam = ''
    if(this.eventsContent[index].hasOwnProperty('_embedded') && 
        this.eventsContent[index]._embedded.hasOwnProperty('attractions')){
      for(var i = 0; i < this.eventsContent[index]._embedded.attractions.length; ++i){
        ArtistTeam += this.eventsContent[index]._embedded.attractions[i].name 
        if(i != this.eventsContent[index]._embedded.attractions.length - 1){
          ArtistTeam += ' | '
        }
      }
    }
    if(ArtistTeam != ''){
      this.detailContent['ArtistTeam'] = ArtistTeam
    }
    
    

    var Time = ''
    if(this.eventsContent[index].hasOwnProperty('dates') && 
        this.eventsContent[index].dates.hasOwnProperty('start') &&
        this.eventsContent[index].dates.start.hasOwnProperty('localDate')){
          Time = this.eventsContent[index].dates.start.localDate
        }
    if(Time != ''){
      this.detailContent.Time = Time
    }

    var Category = ''
    var categoryContent = []
    if(this.eventsContent[index].hasOwnProperty('classifications')){
      if(this.eventsContent[index].classifications[0].hasOwnProperty('subGenre')){
        categoryContent.push(this.eventsContent[index].classifications[0].subGenre.name)
      }
      if(this.eventsContent[index].classifications[0].hasOwnProperty('genre')){
        categoryContent.push(this.eventsContent[index].classifications[0].genre.name)
      }
      if(this.eventsContent[index].classifications[0].hasOwnProperty('segment')){
        categoryContent.push(this.eventsContent[index].classifications[0].segment.name)
      }
      if(this.eventsContent[index].classifications[0].hasOwnProperty('subType')){
        categoryContent.push(this.eventsContent[index].classifications[0].subType.name)
      }
      if(this.eventsContent[index].classifications[0].hasOwnProperty('type')){
        categoryContent.push(this.eventsContent[index].classifications[0].type.name)
      }

      for(var i = 0; i < categoryContent.length; ++i){
        Category += categoryContent[i]
        if(i != categoryContent.length - 1){
          Category += ' | '
        }
      }
    }
    if(Category != ''){
      this.detailContent.Category = Category
    }
    
    var PriceRange = ''
    if(this.eventsContent[index].hasOwnProperty('priceRanges')){
      PriceRange += this.eventsContent[index].priceRanges[0].min + '-' + this.eventsContent[index].priceRanges[0].max + ' USD'
    }
    if(PriceRange != ''){
      this.detailContent.PriceRange = PriceRange
    }

    var TicketStatus = ''
    if(this.eventsContent[index].hasOwnProperty('dates') && 
        this.eventsContent[index].dates.hasOwnProperty('status') &&
        this.eventsContent[index].dates.status.hasOwnProperty('code')){
      TicketStatus += this.eventsContent[index].dates.status.code
    }
    if(TicketStatus != ''){
      this.detailContent.TicketStatus = TicketStatus
    }

    var BuyTicketAt = ''
    if(this.eventsContent[index].hasOwnProperty('url')){
        BuyTicketAt += this.eventsContent[index].url
    }
    if(BuyTicketAt != ''){
      this.detailContent.BuyTicketAt = BuyTicketAt
    }

    // Seat Map
    var SeatMap = ''
    if(this.eventsContent[index].hasOwnProperty('seatmap') && 
      this.eventsContent[index].seatmap.hasOwnProperty('staticUrl')){
        SeatMap += this.eventsContent[index].url
    }
    if(SeatMap != ''){
      this.detailContent.SeatMap = SeatMap
    }
    console.log("this.detailContent", this.detailContent)
    console.log("this.detailContent.VenueId: ", this.detailContent.VenueId)

    // Twitter
    this.twitterApi += "Check out " + this.detailContent.Name + 
                      " located at " + this.detailContent.Venue +
                      ". &hashtags=CSCI571EventSearch"

    console.log("twitter api:", this.twitterApi)
    

  }
// google map key AIzaSyDRm6eke0AgBCdf-4QGRrYOhktzb4y8Jos
  
  setFavorite(index:number){

  }

  // Sort events in ascending order of “date” column
  sortFunction(x:any,y:any)
  {
    var dateX = new Date(x.dates.start.localDate)
    var xTimestamp = dateX.getTime()
    var dateY = new Date(y.dates.start.localDate)
    var yTimestamp = dateY.getTime()
    return xTimestamp - yTimestamp
  }
}
