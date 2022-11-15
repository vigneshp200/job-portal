import { CandidateData } from './../../models/CandidateData';
import { JobApplication } from './../../models/JobApplication';
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { JobApplicationService } from '../services/job-application.service';
import { Job } from 'src/models/Job';
import { COMMA, R } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, of } from 'rxjs';
import { map, startWith, switchMap, filter } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-application-form',
  templateUrl: './application-form.component.html',
  styleUrls: ['./application-form.component.scss']
})
export class ApplicationFormComponent implements OnInit {

  jobApplicationForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    contact: new FormControl('', [Validators.required, Validators.pattern(new RegExp(/^(\+\d{1,3}[- ]?)?\d{10}$/))]),
    company: new FormControl('', [Validators.required]),
    interestedJobs: new FormControl('', [Validators.required]),
    currentCtc: new FormControl('', [Validators.required, Validators.max(999999999999999)]),
    technologies: new FormControl(''),
    aboutProject: new FormControl('', [Validators.required]),
    fileName: new FormControl(''),
  });

  externalService: JobApplicationService;
  showFileUploadError = false;
  showFileUploadState = false;
  showFormLoadState = false;
  jobs: Job[] = [];
  jobApplications: JobApplication[] = [];
  tableData: CandidateData[] = [];
  dataSource: any;
  displayedColumns: string[] = ['id', 'first', 'last', 'position'];


  separatorKeysCodes: number[] = [COMMA];
  filteredTechnologies: Observable<string[]>;
  selectedTechnology: string[] = [];

  // @ts-expect-error: Let's ignore a compile error here 
  @ViewChild('technologyInput') technologyInput: ElementRef<HTMLInputElement>;
  // @ts-expect-error: Let's ignore a compile error here 
  @ViewChild('fileInput') fileInput: ElementRef;
  // @ts-expect-error: Let's ignore a compile error here 
  @ViewChild('paginator') paginator: MatPaginator;

  constructor(private jobApplicationService: JobApplicationService) {
    this.externalService = jobApplicationService;

    // @ts-expect-error: Let's ignore a compile error here 
    this.filteredTechnologies = this.technologies.valueChanges.pipe(
      switchMap((tech) => tech ? this.externalService.getTechnology(tech) : of([])),
      map(suggestions => suggestions.filter(item => !this.selectedTechnology.includes(item)))
    );
  }

  ngOnInit(): void {
    this.externalService.getCurrentJobOpenings().subscribe(currentJobs => {
      this.jobs = currentJobs;
    });

    this.externalService.getJobApplicationList().subscribe(applications => {
      this.jobApplications = applications;
      this.tableData = applications.map((value: JobApplication) => {

        return {
          id: value.id,
          first: value.firstName,
          last: value.lastName,
          position: value?.interestedJobsResponse?.join(",")
        } as CandidateData
      });
      this.dataSource = new MatTableDataSource<CandidateData>(this.tableData);
      this.dataSource.paginator = this.paginator;
    });
  }

  get firstName() { return this.jobApplicationForm.get("firstName") }
  get lastName() { return this.jobApplicationForm.get("lastName") }
  get email() { return this.jobApplicationForm.get("email") }
  get contact() { return this.jobApplicationForm.get("contact") }
  get company() { return this.jobApplicationForm.get("company") }
  get currentCtc() { return this.jobApplicationForm.get("currentCtc") }
  get interestedJobs() { return this.jobApplicationForm.get("interestedJobs") }
  get aboutProject() { return this.jobApplicationForm.get("aboutProject") }
  get technologies() { return this.jobApplicationForm.get("technologies") }
  get fileName() { return this.jobApplicationForm.get("fileName") }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our tech
    if (value) {
      this.selectedTechnology.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();


    this.technologies?.setValue(null);
  }

  remove(tech: string): void {
    const index = this.selectedTechnology.indexOf(tech);

    if (index >= 0) {
      this.selectedTechnology.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedTechnology.push(event.option.viewValue);
    this.technologyInput.nativeElement.value = '';
    this.technologies?.setValue(null);
  }

  validateForm() {
    return (this.jobApplicationForm.valid && this.selectedTechnology.length && this.fileName?.getRawValue() && true) || false;
  }

  handleFileInput(event: any) {
    (event?.target as HTMLInputElement)?.files?.item(0);
    if ((event?.target as HTMLInputElement)?.files?.item(0)) {
      this.showFileUploadState = true;

      this.externalService.uploadFile((event?.target as HTMLInputElement)?.files?.item(0)).subscribe(r => {
        this.fileName?.setValue(r?.fileName);
        console.log(r?.fileName);
        
        this.showFileUploadState = false;
      })
    } else {
      this.fileName?.setValue("");
    }
  }

  Submit() {
    this.technologies?.setValue(this.selectedTechnology as any);
    this.contact?.setValue(this.contact?.getRawValue() + "");

    console.log(this.jobApplicationForm.getRawValue());
    console.log(this.selectedTechnology);
    this.showFormLoadState = true;
    this.externalService.saveJobApplication(this.jobApplicationForm.getRawValue() as any).subscribe(r => {
      let positons = this.jobs.filter(item => r.interestedJobs.indexOf(item.id) != -1).map(t => t.title).join("^");
      let newObject: CandidateData = { id: r.id, first: r.firstName, last: r.lastName, position: positons } as CandidateData;
      this.tableData = [newObject, ...this.tableData];
      this.dataSource = new MatTableDataSource<CandidateData>(this.tableData);
      this.resetForm();
    })
  }

  resetForm() {
    this.jobApplicationForm.reset();
    Object.keys(this.jobApplicationForm.controls).forEach(key => {
      this?.jobApplicationForm?.get(key)?.setErrors(null);
    });

    this.fileInput.nativeElement.value = "";
    this.selectedTechnology = [];
    this.showFormLoadState = false;
  }

  cancel() {
    this.resetForm();
  }  
}
