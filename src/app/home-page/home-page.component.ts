import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import {animate, state, style, transition, trigger, keyframes} from '@angular/animations';
import { MymodalComponent } from './mymodal/mymodal.component';

@Component({
  selector: 'home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
  animations: [
    trigger('heroState', [
        state('false', style({  // show
            position:'relative', 
            left: '0%',
        })),
        state('true', style({   // hidden
            position:'relative', 
            left: '-120%',
        })),
        transition('false => true', [  // show -> hidden
               animate('0.5s', keyframes([
                style({position:'relative', left: '0%', offset: 0}),
                style({position:'relative', left: '-120%', offset: 0.8})
               ]))
              ]),     
              
        transition('true => false', [   // hidden -> show
          animate('0.5s', keyframes([
           style({position:'relative', left: '-120%', offset: 0}),
           style({position:'relative', left: '0%', offset: 0.8})
          ]))
         ]),
    ]),
    trigger('rightState', [
      state('false', style({  // show
          position:'relative', 
          left: '0%',
      })),
      state('true', style({   // hidden
          position:'relative', 
          left: '120%',
      })),
      transition('false => true', [  // show -> hidden
             animate('0.5s', keyframes([
              style({position:'relative', left: '0%', offset: 0}),
              style({position:'relative', left: '120%', offset: 1})
             ]))
            ]),     
            
      transition('true => false', [   // hidden -> show
        animate('0.5s', keyframes([
         style({position:'relative', left: '120%', offset: 0}),
         style({position:'relative', left: '0%', offset: 1})
        ]))
       ]),
  ]),
  ],
})
export class HomePageComponent implements OnInit {
  
  constructor(public http: HttpClient) { }
  //////// Data
  show:boolean = true

  public goChild:string = 'hellooooo'  //seat map url

  state = false;   // hidden = true
  changeState() {
    this.state = !this.state;
  }

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
 
  public eventsContent:any = []
  public showDetails:boolean = false
  ResultsFavorites = 1; //Result or Favorite
  navChosen = 1;  // Nav bar choice

  // Nav bar 1
  currentEventsContentForDetails:any  // The details part displays which event content
  public detailContent = {
    ArtistTeam: '',
    ArtistTeamList: [''],
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

  // Nav bar 2
  artistContentList:any = []

  // Nav bar 3
  public venueDetailContent = {
    Address: '',
    City: '',
    PhoneNumber: '',
    OpenHours: '',
    GeneralRule: '',
    ChildRule: '',
  }

  public twitterApi = "https://twitter.com/intent/tweet?text="
  spotifyArtistList:any = []
  spotifyArtist:any = {}
 
  // Favorite
  favoriteContent:any = []
  favoriteTemp:any = {}
  favoriteEventsContentForFrontend:any = []

  lat = 40
  lng = 74

  serviceError = false

  // display flags
  // events table
  public noEvents:boolean = false
  public showEvents:boolean = false
  // progress bar
  showProgressBarSearchingEvents = false 
  showProgressBarLoadingDetails = false 
  progress = 10
  // details block
  showDetailsBlock = false
  // favorite
  showFavorite = false
  // Seat map
  showModal = false

  noArtists = false
  noFavorite = false

  // animation
  resultTableAnimation = ''
  detailAnimation = 'true'
  favoriteAnimation = false
  

  ////////////////


  ngOnInit() {
    console.log("this.detailAnimation", this.detailAnimation)
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
      this.keywordInvalid = false
      this.requestBackendToAutoComplete(realTimeKeyword)
    })
  }

  getChange(val: string) {
    console.log(val);
    this.formInfo.category = val;
    　　
  }

  clearForm(){
    this.keywordControl.reset('');
    this.formInfo.category = ''
    this.formInfo.distance = ''
    this.formInfo.distanceUnit = ''
    this.formInfo.from = 'Here'
    this.formInfo.fromLocation = ''

    this.serviceError = false

    this.keywordInvalid = false
    this.locationInvalid = false
    this.noEvents = false

    this.showEvents = false
    this.showDetailsBlock = false

    this.ResultsFavorites = 1

    this.detailAnimation = 'true'

    console.log("clear finished")
    console.log(this.currentEventsContentForDetails)
  }
  clearLocationInput(){
    this.formInfo.fromLocation == ''
  }
  checkForm(){
    this.keywordInvalid = false;
    this.locationInvalid = false;

    // Invalid keyword input
    this.formInfo.keyword = this.keywordControl.value
    console.log("this.formInfo.keyword", this.formInfo.keyword)
    if(this.formInfo.keyword == null || this.formInfo.keyword ==''){
      this.keywordInvalid = true;
    }
    else{
      for(let char of this.formInfo.keyword){
        if(char != ' '){
          break
        }
        this.keywordInvalid = true;
      }
    }

    console.log("this.formInfo.from", this.formInfo.from)

    if(this.formInfo.from == 'Other'){
      if(this.formInfo.fromLocation == ''){
        // Invalid location input when choose other
        this.locationInvalid = true;
      }
      else{
        for(let char of this.formInfo.fromLocation){
          if(char != ' '){
            break
          }
          this.locationInvalid = true;
        }
      }    
    }
  }

  doSubmit() {
    // display progress bar
    this.showProgressBarSearchingEvents = true

    // get keyword
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

    // progress bar forwards
    this.progress = 30
  }

  requestBackendToAutoComplete(keyword:String){
    var backendUrl = "https://nodejs-9991.wl.r.appspot.com/autocomplete?"
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
    this.eventsContent = []

    var backendUrl = "https://nodejs-9991.wl.r.appspot.com/?"
    // var backendUrl = "http://127.0.0.1:8080/?"

    var categorySearch = this.formInfo.category
    if(categorySearch == ''){
      categorySearch = "All"
    }

    var distanceSearch = this.formInfo.distance
    if(distanceSearch == ''){
      distanceSearch = "10"
    }

    var distanceUnitSearch = this.formInfo.distanceUnit
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

    // progress bar forwards
    this.progress = 50

    fetch(backendUrl)
    .then(response => response.json())
    .then(response => {
      console.log("events: ", response)
      // progress bar forwards
      this.progress = 70
      if(response.page.totalElements == 0){
        console.log("No Events")
        // progress bar forwards
        this.progress = 100
        this.showProgressBarSearchingEvents = false
        this.progress = 0
        // show no events
        this.showEvents = true
        this.noEvents = true
      }
      else{
        // progress bar forwards
        this.progress = 100
        this.showProgressBarSearchingEvents = false
        this.progress = 0
        // show event table
        this.resultTableAnimation = 'false'
        this.showEvents = true

        var eventsContentList = response._embedded.events.sort(this.sortFunction)
        console.log("eventsContentList", eventsContentList, eventsContentList.length)

        this.getFavorite()

        for(var index = 0; index < eventsContentList.length; ++index){
          var eventsContent = eventsContentList[index]

          var Category = ''
          var categoryContent = []
          if(eventsContent.hasOwnProperty('classifications')){
            if(eventsContent.classifications[0].hasOwnProperty('subGenre') && eventsContent.classifications[0].subGenre.name != 'Undefined'){
              categoryContent.push(eventsContent.classifications[0].subGenre.name)
            }
            if(eventsContent.classifications[0].hasOwnProperty('genre') && eventsContent.classifications[0].genre.name != 'Undefined'){
              categoryContent.push(eventsContent.classifications[0].genre.name)
            }
            if(eventsContent.classifications[0].hasOwnProperty('segment') && eventsContent.classifications[0].segment.name != 'Undefined'){
              categoryContent.push(eventsContent.classifications[0].segment.name)
            }
            if(eventsContent.classifications[0].hasOwnProperty('subType') && eventsContent.classifications[0].subType.name != 'Undefined'){
              categoryContent.push(eventsContent.classifications[0].subType.name)
            }
            if(eventsContent.classifications[0].hasOwnProperty('type') && eventsContent.classifications[0].type.name != 'Undefined'){
              categoryContent.push(eventsContent.classifications[0].type.name)
            }
      
            for(var i = 0; i < categoryContent.length; ++i){
              Category += categoryContent[i]
              if(i != categoryContent.length - 1){
                Category += ' | '
              }
            }
          }
          eventsContent.Category = Category
          eventsContent.Favorite = false

          for(var j = 0; j < this.favoriteEventsContentForFrontend.length; ++j){
            if(eventsContent.name == this.favoriteEventsContentForFrontend[j].name){
              eventsContent.Favorite = true
            }
          }
                  
          this.eventsContent.push(eventsContent)
          console.log('this.eventsContent: ', this.eventsContent)

        }
      }
    })
    .catch((err) =>{
      console.error('error occurs',err);// server error
      this.serviceError = true
     })
  }

  getDetails(index:number){
    // progress bar
    this.progress = 10
    this.showProgressBarLoadingDetails = true
    this.showEvents = false

    this.currentEventsContentForDetails = this.eventsContent[index] // The details part displays which event content
    this.getDetailsContent(this.eventsContent[index])
    this.resultTableAnimation = 'true'
  }

  getDetailsContent(eventsContent:any){
    
    console.log("index: ", eventsContent)

    this.lat = parseFloat(eventsContent._embedded.venues[0].location.latitude)
    this.lng = parseFloat(eventsContent._embedded.venues[0].location.longitude)
    console.log("lat lng for map", this.lat, this.lng)

    this.detailContent = {
      ArtistTeam: '',
      ArtistTeamList: [''],
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

    var Venue = ''
    var VenueId = ''
    if(eventsContent.hasOwnProperty('_embedded') && 
        eventsContent._embedded.hasOwnProperty('venues') &&
        eventsContent._embedded.venues.length != 0){
          Venue = eventsContent._embedded.venues[0].name
          VenueId = eventsContent._embedded.venues[0].id
        }
    if(Venue != ''){
      this.detailContent.Venue = Venue
    }
    if(VenueId != ''){
      this.detailContent.VenueId = VenueId

      // Search for venue details
      var searchVenueDetailsBackendUrl = "https://nodejs-9991.wl.r.appspot.com/venueDetail?"
      // var searchVenueDetailsBackendUrl = "http://127.0.0.1:8080/venueDetail?"
      searchVenueDetailsBackendUrl += "keyword=" + this.detailContent.Venue
      console.log("searchVenueDetailsBackendUrl", searchVenueDetailsBackendUrl)
      fetch(searchVenueDetailsBackendUrl)
      .then(response => response.json())
      .then(response => {
        console.log("venue details: ", response)

        this.venueDetailContent = {
          Address: '',
          City: '',
          PhoneNumber: '',
          OpenHours: '',
          GeneralRule: '',
          ChildRule: '',
        }
        this.artistContentList = []

        if(response.hasOwnProperty('venues') && 
          response.venues.length > 0){
            for(var k = 0; k < response.venues.length; ++k){
              if(response.venues[k].name != this.detailContent.Venue){
                continue
              }
              // Address
              if(response.venues[k].hasOwnProperty('address')){
                if(response.venues[k].address.hasOwnProperty('line1')){
                  this.venueDetailContent.Address = response.venues[k].address.line1
                }
              }

              // City
              if(response.venues[k].hasOwnProperty('city')){
                if(response.venues[k].city.hasOwnProperty('name')){
                  this.venueDetailContent.City = response.venues[k].city.name
                }
              }

              if(response.venues[k].hasOwnProperty('state')){
                if(response.venues[k].city.hasOwnProperty('name')){
                  this.venueDetailContent.City += ', ' + response.venues[k].state.name
                }
              }

              if(response.venues[k].hasOwnProperty('boxOfficeInfo')){
                // Phone Number
                if(response.venues[k].boxOfficeInfo.hasOwnProperty('phoneNumberDetail')){
                  this.venueDetailContent.PhoneNumber = response.venues[k].boxOfficeInfo.phoneNumberDetail
                }

                // Open hours
                if(response.venues[k].boxOfficeInfo.hasOwnProperty('openHoursDetail')){
                  this.venueDetailContent.OpenHours = response.venues[k].boxOfficeInfo.openHoursDetail
                }
              }

              if(response.venues[k].hasOwnProperty('generalInfo')){
                // General Rule
                if(response.venues[k].generalInfo.hasOwnProperty('generalRule')){
                  this.venueDetailContent.GeneralRule = response.venues[k].generalInfo.generalRule
                }

                // Child Rule
                if(response.venues[k].generalInfo.hasOwnProperty('childRule')){
                  this.venueDetailContent.ChildRule = response.venues[k].generalInfo.childRule
                }
              }
              console.log("this.venueDetailContent", this.venueDetailContent)
            }
        }

        this.detailAnimation = 'false'
        console.log("this.detailAnimation", this.detailAnimation)
      })
    }

    // progress bar
    this.progress = 30

    // Event name
    this.detailContent['Name'] = eventsContent.name

    var ArtistTeam = ''
    this.detailContent.ArtistTeamList = []
    if(eventsContent.hasOwnProperty('_embedded') && 
        eventsContent._embedded.hasOwnProperty('attractions')){
      for(var i = 0; i < eventsContent._embedded.attractions.length; ++i){
        ArtistTeam += eventsContent._embedded.attractions[i].name
        this.detailContent.ArtistTeamList.push(eventsContent._embedded.attractions[i].name)
        if(i != eventsContent._embedded.attractions.length - 1){
          ArtistTeam += ' | '
        }
      }
    }
    console.log("this.detailContent.ArtistTeamList", this.detailContent.ArtistTeamList)

    if(ArtistTeam != ''){
      this.detailContent['ArtistTeam'] = ArtistTeam
    }
    
    // Time
    var Time = ''
    if(eventsContent.hasOwnProperty('dates') && 
        eventsContent.dates.hasOwnProperty('start') &&
        eventsContent.dates.start.hasOwnProperty('localDate')){
          Time = eventsContent.dates.start.localDate
        }
    if(Time != ''){
      this.detailContent.Time = Time
    }

    var Category = ''
    var categoryContent = []
    if(eventsContent.hasOwnProperty('classifications')){
      if(eventsContent.classifications[0].hasOwnProperty('subGenre') && eventsContent.classifications[0].subGenre.name != 'Undefined'){
        categoryContent.push(eventsContent.classifications[0].subGenre.name)
      }
      if(eventsContent.classifications[0].hasOwnProperty('genre') && eventsContent.classifications[0].genre.name != 'Undefined'){
        categoryContent.push(eventsContent.classifications[0].genre.name)
      }
      if(eventsContent.classifications[0].hasOwnProperty('segment') && eventsContent.classifications[0].segment.name != 'Undefined'){
        categoryContent.push(eventsContent.classifications[0].segment.name)
      }
      if(eventsContent.classifications[0].hasOwnProperty('subType') && eventsContent.classifications[0].subType.name != 'Undefined'){
        categoryContent.push(eventsContent.classifications[0].subType.name)
      }
      if(eventsContent.classifications[0].hasOwnProperty('type') && eventsContent.classifications[0].type.name != 'Undefined'){
        categoryContent.push(eventsContent.classifications[0].type.name)
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
    if(eventsContent.hasOwnProperty('priceRanges')){
      PriceRange += eventsContent.priceRanges[0].min + '-' + eventsContent.priceRanges[0].max + ' USD'
    }
    if(PriceRange != ''){
      this.detailContent.PriceRange = PriceRange
    }

    var TicketStatus = ''
    if(eventsContent.hasOwnProperty('dates') && 
        eventsContent.dates.hasOwnProperty('status') &&
        eventsContent.dates.status.hasOwnProperty('code')){
      TicketStatus += eventsContent.dates.status.code
    }
    if(TicketStatus != ''){
      this.detailContent.TicketStatus = TicketStatus
    }

    var BuyTicketAt = ''
    if(eventsContent.hasOwnProperty('url')){
        BuyTicketAt += eventsContent.url
    }
    if(BuyTicketAt != ''){
      this.detailContent.BuyTicketAt = BuyTicketAt
    }

    // Seat Map
    var SeatMap = ''
    if(eventsContent.hasOwnProperty('seatmap') && 
      eventsContent.seatmap.hasOwnProperty('staticUrl')){
        SeatMap += eventsContent.seatmap.staticUrl
        this.goChild = SeatMap
    }
    if(SeatMap != ''){
      this.detailContent.SeatMap = SeatMap
    }
    console.log("this.detailContent", this.detailContent)
    console.log("this.detailContent.VenueId: ", this.detailContent.VenueId)

    // progress bar
    this.progress = 60

    // Twitter
    this.twitterApi = "https://twitter.com/intent/tweet?text=Check out " + this.detailContent.Name + 
                      " located at " + this.detailContent.Venue +
                      ". &hashtags=CSCI571EventSearch"

    console.log("twitter api:", this.twitterApi)

    // Request backend to call Spotify api
    var searchVenueDetailsBackendUrl = "https://nodejs-9991.wl.r.appspot.com/spotify?"
    // var searchVenueDetailsBackendUrl = "http://127.0.0.1:8080/spotify?"
    this.spotifyArtistList = []
    if(this.detailContent.ArtistTeamList.length == 0){
      // progress bar
      this.progress = 100
      this.showProgressBarLoadingDetails = false
      this.progress = 0
      // show detail table
      this.showEvents = false
      this.showDetailsBlock = true

    }
    else{
      for(var i = 0; i < this.detailContent.ArtistTeamList.length; ++i){
      var searchArtistUrl = searchVenueDetailsBackendUrl + "artist=" + this.detailContent.ArtistTeamList[i]
      fetch(searchArtistUrl)
      .then(response => response.json())
      .then(response => {
        console.log("spotify: ", response)
        // progress bar
        this.progress = 70

        this.spotifyArtistList.push(response)
        console.log("this.spotifyArtistList: ", this.spotifyArtistList)
        if(this.spotifyArtistList.length == this.detailContent.ArtistTeamList.length){
          console.log("artist complete", this.spotifyArtistList)
          this.dealArtistData(Category)
        }

        // progress bar
        this.progress = 100
        this.showProgressBarLoadingDetails = false
        this.progress = 0
        // show detail table
        this.showEvents = false
        this.showDetailsBlock = true

      })
    }
    }
    
  }
  
  dealArtistData(Category:String){
    console.log("deal artist data func")
    this.artistContentList = []
    var artistContent:any = []
    // this.detailContent.ArtistTeamList.splice(0, 1)
    for(var i = 0; i < this.spotifyArtistList.length; ++i){
      if(this.spotifyArtistList[i].hasOwnProperty('artists') && this.spotifyArtistList[i].artists.hasOwnProperty('items')){
        for(var j = 0; j < this.spotifyArtistList[i].artists.items.length; ++j){
          var artistName = this.spotifyArtistList[i].artists.items[j].name
          // console.log("artist name: ", artistName)
          for(var k = 0; k < this.detailContent.ArtistTeamList.length; ++k){
            console.log("name to match: ", k, this.detailContent.ArtistTeamList[k])
            
            // Match
            if(artistName == this.detailContent.ArtistTeamList[k]){  
              console.log("match")
              this.detailContent.ArtistTeamList.splice(k, 1)
              artistContent.push({Name:artistName,
                                  Followers: this.spotifyArtistList[i].artists.items[j].followers.total,
                                  Popularity: this.spotifyArtistList[i].artists.items[j].popularity,
                                  CheckAt: this.spotifyArtistList[i].artists.items[j].external_urls.spotify,
                                  NoDetails:false
                                })
              break
            }
          }
        }
      } 
    }
    console.log("**this.detailContent.ArtistTeamList", this.detailContent.ArtistTeamList, Category)
    if(this.detailContent.ArtistTeamList.length != 0 && 
      (Category.indexOf('Music') != -1 || Category.indexOf('Arts & Theatre') != -1)){
      for(var m = 0; m < this.detailContent.ArtistTeamList.length; ++m){
        artistContent.push({Name: this.detailContent.ArtistTeamList[m],
                            NoDetails: true})
      }
    }
    this.artistContentList = artistContent
    console.log("deal artist data: ", this.artistContentList)
  }

  clearFavorite(){
    localStorage.removeItem('favorite')
  }

  clickResult(){
    // this.favoriteAnimation = true  // hide favorite
    // this.resultTableAnimation = 'false'  // show result
    this.goBackToList()
  }

  getFavorite(){
    this.goBackToList()

    this.showFavorite = true
    var favoriteContent = localStorage.getItem('favorite');  // get local storage
    if(favoriteContent == null){  // if no favorite in local storage
      favoriteContent = '[]'
    }
    var favoriteList = JSON.parse(favoriteContent)  // change from string to list
    if(favoriteList[0] == null){
      favoriteList.splice(0,1)
    }
    this.favoriteEventsContentForFrontend = favoriteList
    console.log("this.favoriteEventsContentForFrontend", this.favoriteEventsContentForFrontend)
  }

  getDetailsFavorite(index:number){
    // progress bar
    this.progress = 50
    this.showProgressBarLoadingDetails = true
    this.showFavorite = false

    console.log('this.favoriteEventsContentForFrontend[index]', this.favoriteEventsContentForFrontend[index])
    this.currentEventsContentForDetails = this.favoriteEventsContentForFrontend[index]
    this.getDetailsContent(this.favoriteEventsContentForFrontend[index])
    this.favoriteAnimation = true
    
  }

  deleteFavorite(index:number, alreadyGetDetail:boolean){
    var eventToDelete = this.favoriteEventsContentForFrontend[index]
    this.favoriteEventsContentForFrontend.splice(index,1)   // delete from favorite table
    // set local storage
    localStorage.setItem('favorite', JSON.stringify(this.favoriteEventsContentForFrontend))

    console.log("eventToDelete", eventToDelete)
    for(var j = 0; j < this.eventsContent.length; ++j){
      if(eventToDelete.name == this.eventsContent[j].name &&
        eventToDelete.dates.start.localDate == this.eventsContent[j].dates.start.localDate){
          console.log("this.eventsContent[j]", this.eventsContent[j], j)
          this.eventsContent[j].Favorite = false
          break
        }
    }

  }

  setFavorite(index:number, alreadyGetDetail:boolean){
    console.log("setFavorite:", index, alreadyGetDetail)
    var favoriteContent = localStorage.getItem('favorite');  // get local storage
    if(favoriteContent == null){  // if no favorite in local storage
      favoriteContent = '[]'
    }
    var favoriteList = JSON.parse(favoriteContent)  // change from string to list
    console.log("previous favoriteList", favoriteList)

    if(index != -1){
      if(this.ResultsFavorites == 1){
        if(this.eventsContent[index].Favorite == true){
          this.eventsContent[index].Favorite = false
        }
        else{
          this.eventsContent[index].Favorite = true
        }
        this.currentEventsContentForDetails = this.eventsContent[index]
      }
      else if(this.ResultsFavorites == 2){
        this.currentEventsContentForDetails = this.favoriteEventsContentForFrontend[index]
      }
    }
    else{
      if(this.currentEventsContentForDetails.Favorite == true){
        this.currentEventsContentForDetails.Favorite = false

        for(var j = 0; j < this.eventsContent.length; ++j){
          if(this.currentEventsContentForDetails.name == this.eventsContent[j].name &&
            this.currentEventsContentForDetails.dates.start.localDate == this.eventsContent[j].dates.start.localDate){
              console.log("this.eventsContent[j]", this.eventsContent[j], j)
              this.eventsContent[j].Favorite = false
              break
            }
        }
      }
      else{
        this.currentEventsContentForDetails.Favorite = true
      }
    }
    
    console.log("this.currentEventsContentForDetails", this.currentEventsContentForDetails)
    var deleteFlag = false
    for(var i = 0; i < favoriteList.length; ++i){
      if(favoriteList[i] != null && 
        favoriteList[i].hasOwnProperty('name') && 
        favoriteList[i].name == this.currentEventsContentForDetails.name && 
        favoriteList[i].dates.start.localDate == this.currentEventsContentForDetails.dates.start.localDate){
        // delete from favorite list
        favoriteList.splice(i,1)
        deleteFlag = true
        console.log("delete favorite")
        break
      }
    }

    // add 
    if(deleteFlag == false){
      console.log("add favorite")
      // add to favorite
      favoriteList.push(this.currentEventsContentForDetails)
    }
    this.favoriteEventsContentForFrontend = favoriteList

    console.log("this.favoriteEventsContentForFrontend", this.favoriteEventsContentForFrontend)
    // set local storage
    localStorage.setItem('favorite', JSON.stringify(favoriteList))    
  }

  goBackToList(){
    this.showDetailsBlock = false
    this.showEvents = true
    this.showFavorite = true

    // animation
    this.resultTableAnimation = 'false'  // show result table
    this.detailAnimation = 'true'  // hide detail
    console.log("this.detailAnimation", this.detailAnimation)
    this.favoriteAnimation = false
  }

  goToDetails(){
    this.showDetailsBlock = true
    this.showEvents = false
    this.showFavorite = false

    // animation
    this.resultTableAnimation = 'true'  // hide result table
    this.detailAnimation = 'false'  // show detail
    console.log("this.detailAnimation", this.detailAnimation)
    this.favoriteAnimation = true

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
