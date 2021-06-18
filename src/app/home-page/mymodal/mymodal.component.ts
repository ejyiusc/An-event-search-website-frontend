import { Component, OnInit, Input} from '@angular/core';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-mymodal',
  templateUrl: './mymodal.component.html',
  styleUrls: ['./mymodal.component.css'],
  providers: [NgbModalConfig, NgbModal]
})
export class MymodalComponent implements OnInit {
  

  constructor(config: NgbModalConfig, private modalService: NgbModal) {
    // customize default values of modals used by this component tree
    config.backdrop = 'static';
    config.keyboard = false;
  }
  @Input() fromParentData:any
  @Input() Data:any

  ngOnInit() {
  }

  open(content:any) {
    this.modalService.open(content);
    console.log(this.fromParentData, this.Data)
  }

}
