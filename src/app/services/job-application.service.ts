import { JobApplication } from './../../models/JobApplication';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Job } from 'src/models/Job';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class JobApplicationService {

  constructor(private http: HttpClient) { }

  jobs: Job[] = [{ id: 100, title: "Senior Software Engineer" },
  { id: 102, title: "Lead" }, { id: 103, title: "Module Lead" }, { id: 104, title: "Software Engineer" }, { id: 104, title: "Trainee Software Engineer" }];

  technologies: string[] = ["C#", "C++", "C", "Java", "Go", "Android", ".Net", "Python", "Django", "PHP", "Joomla", "ASP.NET"];


  getCurrentJobOpenings(): Observable<Job[]> {
    return this.http.get<Job[]>('https://localhost:7079/JobApplication/GetJobOpenings');
  }

  getTechnology(a: string): Observable<string[]> {
    return this.http.get<string[]>(`https://localhost:7079/JobApplication/GetTechnology?term=${a}`);
  }

  getJobApplicationList(): Observable<JobApplication[]> {
    return this.http.get<JobApplication[]>('https://localhost:7079/JobApplication/GetJobApplications');
  }

  saveJobApplication(data: JobApplication) {
    return this.http.post<JobApplication>('https://localhost:7079/JobApplication/Save', data);
  }

  uploadFile(fileToUpload: any): Observable<any> {
    return this.http.post<{ fileName: string }>('https://localhost:7079/JobApplication/UploadFile', fileToUpload);
  }

}
