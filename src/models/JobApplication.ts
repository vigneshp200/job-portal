export class JobApplication {
    constructor(
        public id: number,
        public firstName: string,
        public lastName: string,
        public email: string,
        public contact: string,
        public company: string,
        public interestedJobs: number[],
        public currentCtc: number,
        public technologies: string[],
        public aboutProject: string,
        public fileName: string,
        public interestedJobsResponse: string[]
    ) { }
}