import { Component, OnInit,ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Feedback, ContactType } from '../shared/feedback';
import { flyInOut} from '../animations/app.animation';
import {FeedbackService} from '../services/feedback.service';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
    animations: [
      flyInOut(),
    ]
})
export class ContactComponent implements OnInit {
  
  @ViewChild('fform') feedbackFormDirective;

  feedbackForm: FormGroup;
  feedback: Feedback;
  feedbackcopy :Feedback; //to store the copy of the form in casse the submission fails
  contactType = ContactType;
  errmess:string; //to display the error message 
  FormHidden : boolean; // to denote the state of the form
  success:boolean; // to dentode the success of the form submission
  
  constructor(private feedbackService : FeedbackService,
    private fb: FormBuilder) {
    this.createForm();
  }

  ngOnInit() {
  }

  createForm() {
    this.feedbackForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
      lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
      telnum: ['', [Validators.required, Validators.pattern] ],
      email: ['', [Validators.required, Validators.email] ],
      agree: false,
      contacttype: 'None',
      message: ''
    });

    this.feedbackForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  onValueChanged(data?: any) {
    if (!this.feedbackForm) { return; }
    const form = this.feedbackForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }
  
  formErrors = {
    'firstname': '',
    'lastname': '',
    'telnum': '',
    'email': ''
  };

  validationMessages = {
    'firstname': {
      'required':      'First Name is required.',
      'minlength':     'First Name must be at least 2 characters long.',
      'maxlength':     'FirstName cannot be more than 25 characters long.'
    },
    'lastname': {
      'required':      'Last Name is required.',
      'minlength':     'Last Name must be at least 2 characters long.',
      'maxlength':     'Last Name cannot be more than 25 characters long.'
    },
    'telnum': {
      'required':      'Tel. number is required.',
      'pattern':       'Tel. number must contain only numbers.'
    },
    'email': {
      'required':      'Email is required.',
      'email':         'Email not in valid format.'
    },
  };

  onSubmit() {
    this.feedback = this.feedbackForm.value;
    this.feedbackcopy=this.feedback;
    console.log(this.feedback);
    this.feedbackForm.reset({
      firstname: '',
      lastname: '',
      telnum: '',
      email: '',
      agree: false,
      contacttype: 'None',
      message: ''
    });
    this.FormHidden=true;
    // calling the put method to push data to the server
    this.feedbackService.submitFeedback(this.feedbackcopy)
    .subscribe(feedback => {this.feedback=feedback, 
                            this.feedbackcopy=feedback,
                            this.success=true;
                             }, 
      errmess => { this.errmess =errmess,
                    this.feedback=null;
                    this.feedbackcopy=null;
                  this.success=false ///if error occured success is false
                });
      setTimeout(()=>{
                      if(this.success == true ) //checking if error occred or not 
                      {//if no error then only execute the following
                        // making success false to hide the spinner 
                        this.success=false;
                        // display the form again after 5 secs
                        this.FormHidden=false;               
                        // reset the form again after 5 secs
                        this.feedbackFormDirective.resetForm();
                      }
                    },5000);  
    
  }

}
