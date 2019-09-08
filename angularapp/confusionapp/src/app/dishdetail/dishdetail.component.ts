import { Component, OnInit,Input,ViewChild ,Inject} from '@angular/core';
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
  dishcopy: Dish;
  errMess: string;
  
  CommentForm : FormGroup;
  @ViewChild('commentform') CommentFormDirective;
  comment : {
    author ;
    rating  ;
    comment;
    date;
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

  constructor(private dishService: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private cf : FormBuilder,

    @Inject('BaseURL') private BaseURL
    ) { 
      this.createFromComment();
      
    }

    ngOnInit() {
      // const id = this.route.snapshot.params['id'];
      //  this.dishservice.getDish(id).subscribe(dish => this.dish = dish);
      
       this.dishService.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
      this.route.params
      .pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
      .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); },
        errmess => this.errMess = <any>errmess );
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
      this.comment = this.CommentForm.value;
      this.comment = {
        rating: +this.comment.rating,
        comment: this.comment.comment,
        author: this.comment.author,
        date:  new Date().toLocaleDateString()
      };
      this.dishcopy.comments.push(this.comment);
    this.dishService.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
      errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });

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
