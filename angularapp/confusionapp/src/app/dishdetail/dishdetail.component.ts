import { Component, OnInit,Input,ViewChild } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup,Validators, } from '@angular/forms';


@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})

export class DishdetailComponent implements OnInit {
 
  dishIds: string[];
  prev: string;
  next: string;
  dish: Dish;
  
  
  CommentForm : FormGroup;
  @ViewChild('commentform') CommentFormDirective;
  cfVariable : {
    author :'';
    rating : '' ;
    comment: '';
   };

   commentFormErrors ={
    'author' :'',
    'rating' : '' ,
    'comment': '',
   } ;

   validationMessages = {
    'author': {
      'required':      'Author Name is required.',
      'minlength':     'Author Name must be at least 2 characters long.',
      'maxlength':     'Author Name cannot be more than 25 characters long.'
    },
    'comment': {
      'required':      'Comment  is required.',
      'minlength':     'Comment must be at least 2 characters long.',
      
    },
  };

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private cf : FormBuilder
    ) { 
      this.createFromComment();
      
    }

    ngOnInit() {
      // const id = this.route.snapshot.params['id'];
      //  this.dishservice.getDish(id).subscribe(dish => this.dish = dish);
      
       this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
      this.route.params.pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
      .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); });
    }

  createFromComment()
  {
    this.CommentForm = this.cf.group({
      author : ['', [Validators.required,Validators.minLength(2),Validators.maxLength(25)] ],
      rating :['', Validators.required ] ,
      comment :['', [Validators.required, Validators.minLength(2)] ]
    });

    this.CommentForm.valueChanges
    .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  onValueChanged(data?: any) {
      
      if (!this.CommentForm) { return; }
      const form = this.CommentForm;
      
      for (const field in this.commentFormErrors) {
        
        if (this.commentFormErrors.hasOwnProperty(field)) {
        
          // clear previous error message (if any)
          this.commentFormErrors[field] = '';
          const control = form.get(field);
          if (control && control.dirty && !control.valid) {
        
            const messages = this.validationMessages[field];
            
            for (const key in control.errors) {
        
              if (control.errors.hasOwnProperty(key)) {
                this.commentFormErrors[field] += messages[key] + ' ';
                
              }
            }
          }
        }
      }
    }


    onSubmit() {
      this.cfVariable = this.CommentForm.value;
      this.dish.comments.push({
        rating: +this.cfVariable.rating,
        comment: this.cfVariable.comment,
        author: this.cfVariable.author,
        date:  new Date().toLocaleDateString()
      });
      this.CommentFormDirective.resetForm();
    }

  
  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

}
