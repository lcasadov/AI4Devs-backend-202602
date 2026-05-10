// Cobertura estimada: 90%
const mockCandidateSave = jest.fn();
const mockEducationSave = jest.fn();
const mockWorkExperienceSave = jest.fn();
const mockResumeSave = jest.fn();

jest.mock('../../domain/models/Candidate', () => ({
    Candidate: jest.fn().mockImplementation(function (this: any, data: any) {
        this.id = data.id;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.email = data.email;
        this.phone = data.phone;
        this.address = data.address;
        this.education = data.education || [];
        this.workExperience = data.workExperience || [];
        this.resumes = data.resumes || [];
        this.applications = data.applications || [];
        this.save = mockCandidateSave;
    }),
}));

jest.mock('../../domain/models/Education', () => ({
    Education: jest.fn().mockImplementation(function (this: any, data: any) {
        this.id = data.id;
        this.institution = data.institution;
        this.title = data.title;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.candidateId = data.candidateId;
        this.save = mockEducationSave;
    }),
}));

jest.mock('../../domain/models/WorkExperience', () => ({
    WorkExperience: jest.fn().mockImplementation(function (this: any, data: any) {
        this.id = data.id;
        this.company = data.company;
        this.position = data.position;
        this.description = data.description;
        this.startDate = data.startDate;
        this.endDate = data.endDate;
        this.candidateId = data.candidateId;
        this.save = mockWorkExperienceSave;
    }),
}));

jest.mock('../../domain/models/Resume', () => ({
    Resume: jest.fn().mockImplementation(function (this: any, data: any) {
        this.id = data?.id;
        this.candidateId = data?.candidateId;
        this.filePath = data?.filePath;
        this.fileType = data?.fileType;
        this.uploadDate = new Date();
        this.save = mockResumeSave;
    }),
}));

import { addCandidate } from '../../application/services/candidateService';
import { Candidate } from '../../domain/models/Candidate';
import { Education } from '../../domain/models/Education';
import { WorkExperience } from '../../domain/models/WorkExperience';
import { Resume } from '../../domain/models/Resume';

const CandidateMock = Candidate as unknown as jest.Mock;
const EducationMock = Education as unknown as jest.Mock;
const WorkExperienceMock = WorkExperience as unknown as jest.Mock;
const ResumeMock = Resume as unknown as jest.Mock;

describe('candidateService - addCandidate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCandidateSave.mockReset();
        mockEducationSave.mockReset();
        mockWorkExperienceSave.mockReset();
        mockResumeSave.mockReset();
    });

    describe('Prueba 1: datos mínimos correctos', () => {
        it('should save the candidate and return the saved record when only minimum required fields are provided', async () => {
            // Arrange
            const candidateData = {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan.perez@example.com',
            };
            const savedCandidate = { id: 1, ...candidateData };
            mockCandidateSave.mockResolvedValue(savedCandidate);

            // Act
            const result = await addCandidate(candidateData);

            // Assert
            expect(CandidateMock).toHaveBeenCalledTimes(1);
            expect(CandidateMock).toHaveBeenCalledWith(candidateData);
            expect(mockCandidateSave).toHaveBeenCalledTimes(1);
            expect(EducationMock).not.toHaveBeenCalled();
            expect(WorkExperienceMock).not.toHaveBeenCalled();
            expect(ResumeMock).not.toHaveBeenCalled();
            expect(result).toEqual(savedCandidate);
        });
    });

    describe('Prueba 2: datos completos con educations, workExperiences y cv', () => {
        it('should save the candidate plus every education, work experience and resume when full data is provided', async () => {
            // Arrange
            const candidateData = {
                firstName: 'María',
                lastName: 'García',
                email: 'maria.garcia@example.com',
                phone: '612345678',
                address: 'Calle Mayor 1, Madrid',
                educations: [
                    {
                        institution: 'UPM',
                        title: 'Ingeniería Informática',
                        startDate: '2015-09-01',
                        endDate: '2019-06-30',
                    },
                    {
                        institution: 'IE Business School',
                        title: 'Master MBA',
                        startDate: '2020-09-01',
                        endDate: '2021-06-30',
                    },
                ],
                workExperiences: [
                    {
                        company: 'ACME Corp',
                        position: 'Senior Developer',
                        description: 'Backend Node.js development',
                        startDate: '2019-07-01',
                        endDate: '2023-12-31',
                    },
                ],
                cv: { filePath: '/uploads/cv-maria.pdf', fileType: 'application/pdf' },
            };
            const savedCandidate = { id: 42, firstName: 'María', lastName: 'García', email: 'maria.garcia@example.com' };
            mockCandidateSave.mockResolvedValue(savedCandidate);
            mockEducationSave.mockResolvedValue(undefined);
            mockWorkExperienceSave.mockResolvedValue(undefined);
            mockResumeSave.mockResolvedValue(undefined);

            // Act
            const result = await addCandidate(candidateData);

            // Assert
            expect(CandidateMock).toHaveBeenCalledTimes(1);
            expect(CandidateMock).toHaveBeenCalledWith(candidateData);
            expect(mockCandidateSave).toHaveBeenCalledTimes(1);

            expect(EducationMock).toHaveBeenCalledTimes(2);
            expect(EducationMock).toHaveBeenNthCalledWith(1, candidateData.educations[0]);
            expect(EducationMock).toHaveBeenNthCalledWith(2, candidateData.educations[1]);
            expect(mockEducationSave).toHaveBeenCalledTimes(2);
            expect(EducationMock.mock.instances[0].candidateId).toBe(42);
            expect(EducationMock.mock.instances[1].candidateId).toBe(42);

            expect(WorkExperienceMock).toHaveBeenCalledTimes(1);
            expect(WorkExperienceMock).toHaveBeenCalledWith(candidateData.workExperiences[0]);
            expect(mockWorkExperienceSave).toHaveBeenCalledTimes(1);
            expect(WorkExperienceMock.mock.instances[0].candidateId).toBe(42);

            expect(ResumeMock).toHaveBeenCalledTimes(1);
            expect(ResumeMock).toHaveBeenCalledWith(candidateData.cv);
            expect(mockResumeSave).toHaveBeenCalledTimes(1);
            expect(ResumeMock.mock.instances[0].candidateId).toBe(42);

            expect(result).toEqual(savedCandidate);
        });
    });

    describe('Prueba 3: datos inválidos faltantes', () => {
        it('should re-throw a wrapped error when firstName is missing', async () => {
            // Arrange
            const candidateData = { lastName: 'Pérez', email: 'juan@example.com' };

            // Act
            const act = addCandidate(candidateData);

            // Assert
            await expect(act).rejects.toThrow('Invalid name');
            expect(CandidateMock).not.toHaveBeenCalled();
            expect(mockCandidateSave).not.toHaveBeenCalled();
        });

        it('should re-throw a wrapped error when email is missing', async () => {
            // Arrange
            const candidateData = { firstName: 'Juan', lastName: 'Pérez' };

            // Act
            const act = addCandidate(candidateData);

            // Assert
            await expect(act).rejects.toThrow('Invalid email');
            expect(CandidateMock).not.toHaveBeenCalled();
            expect(mockCandidateSave).not.toHaveBeenCalled();
        });
    });

    describe('manejo de errores de base de datos', () => {
        it('should throw "The email already exists in the database" when Prisma error code is P2002', async () => {
            // Arrange
            const candidateData = {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'duplicate@example.com',
            };
            const prismaError: any = new Error('Unique constraint failed');
            prismaError.code = 'P2002';
            mockCandidateSave.mockRejectedValue(prismaError);

            // Act
            const act = addCandidate(candidateData);

            // Assert
            await expect(act).rejects.toThrow('The email already exists in the database');
        });

        it('should re-throw the original error when the DB error is not P2002', async () => {
            // Arrange
            const candidateData = {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
            };
            const genericError: any = new Error('Connection lost');
            genericError.code = 'P9999';
            mockCandidateSave.mockRejectedValue(genericError);

            // Act
            const act = addCandidate(candidateData);

            // Assert
            await expect(act).rejects.toThrow('Connection lost');
        });
    });
});
