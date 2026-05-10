// Cobertura estimada: 90%
const mockCandidateCreate = jest.fn();
const mockCandidateUpdate = jest.fn();
const mockCandidateFindUnique = jest.fn();
const mockEducationCreate = jest.fn();
const mockEducationUpdate = jest.fn();
const mockWorkExperienceCreate = jest.fn();
const mockWorkExperienceUpdate = jest.fn();
const mockResumeCreate = jest.fn();
const mockApplicationCreate = jest.fn();
const mockApplicationUpdate = jest.fn();
const mockApplicationFindUnique = jest.fn();

jest.mock('@prisma/client', () => {
    class PrismaClientInitializationError extends Error {
        constructor(message: string) {
            super(message);
            this.name = 'PrismaClientInitializationError';
        }
    }
    return {
        PrismaClient: jest.fn().mockImplementation(() => ({
            candidate: {
                create: mockCandidateCreate,
                update: mockCandidateUpdate,
                findUnique: mockCandidateFindUnique,
            },
            education: {
                create: mockEducationCreate,
                update: mockEducationUpdate,
            },
            workExperience: {
                create: mockWorkExperienceCreate,
                update: mockWorkExperienceUpdate,
            },
            resume: {
                create: mockResumeCreate,
            },
            application: {
                create: mockApplicationCreate,
                update: mockApplicationUpdate,
                findUnique: mockApplicationFindUnique,
            },
        })),
        Prisma: {
            PrismaClientInitializationError,
        },
    };
});

import { Candidate } from '../../domain/models/Candidate';
import { Education } from '../../domain/models/Education';
import { WorkExperience } from '../../domain/models/WorkExperience';
import { Resume } from '../../domain/models/Resume';

describe('Candidate model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should assign every provided field correctly', () => {
            // Arrange
            const data = {
                id: 1,
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
                phone: '612345678',
                address: 'Calle Falsa 123',
                education: [],
                workExperience: [],
                resumes: [],
                applications: [],
            };

            // Act
            const candidate = new Candidate(data);

            // Assert
            expect(candidate).toMatchObject({
                id: 1,
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
                phone: '612345678',
                address: 'Calle Falsa 123',
            });
            expect(candidate.education).toEqual([]);
            expect(candidate.workExperience).toEqual([]);
            expect(candidate.resumes).toEqual([]);
            expect(candidate.applications).toEqual([]);
        });

        it('should default array fields to empty arrays when not provided', () => {
            // Arrange
            const data = {
                firstName: 'Ana',
                lastName: 'López',
                email: 'ana@example.com',
            };

            // Act
            const candidate = new Candidate(data);

            // Assert
            expect(candidate.education).toEqual([]);
            expect(candidate.workExperience).toEqual([]);
            expect(candidate.resumes).toEqual([]);
            expect(candidate.applications).toEqual([]);
        });
    });

    describe('save() - CREATE (no id)', () => {
        it('should call prisma.candidate.create with minimum data', async () => {
            // Arrange
            const candidate = new Candidate({
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
            });
            const expectedRecord = { id: 99, firstName: 'Juan', lastName: 'Pérez', email: 'juan@example.com' };
            mockCandidateCreate.mockResolvedValue(expectedRecord);

            // Act
            const result = await candidate.save();

            // Assert
            expect(mockCandidateCreate).toHaveBeenCalledTimes(1);
            expect(mockCandidateCreate).toHaveBeenCalledWith({
                data: {
                    firstName: 'Juan',
                    lastName: 'Pérez',
                    email: 'juan@example.com',
                },
            });
            expect(result).toEqual(expectedRecord);
        });

        it('should include nested educations on create when education list is non-empty', async () => {
            // Arrange
            const candidate = new Candidate({
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
            });
            candidate.education = [
                new Education({
                    institution: 'UPM',
                    title: 'Ingeniería',
                    startDate: '2015-09-01',
                    endDate: '2019-06-30',
                }),
            ];
            mockCandidateCreate.mockResolvedValue({ id: 1 });

            // Act
            await candidate.save();

            // Assert
            expect(mockCandidateCreate).toHaveBeenCalledTimes(1);
            const arg = mockCandidateCreate.mock.calls[0][0];
            expect(arg.data.educations).toBeDefined();
            expect(arg.data.educations.create).toHaveLength(1);
            expect(arg.data.educations.create[0]).toMatchObject({
                institution: 'UPM',
                title: 'Ingeniería',
            });
        });

        it('should include nested workExperiences on create when list is non-empty', async () => {
            // Arrange
            const candidate = new Candidate({
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
            });
            candidate.workExperience = [
                new WorkExperience({
                    company: 'ACME',
                    position: 'Dev',
                    description: 'Backend',
                    startDate: '2019-07-01',
                }),
            ];
            mockCandidateCreate.mockResolvedValue({ id: 2 });

            // Act
            await candidate.save();

            // Assert
            const arg = mockCandidateCreate.mock.calls[0][0];
            expect(arg.data.workExperiences).toBeDefined();
            expect(arg.data.workExperiences.create).toHaveLength(1);
            expect(arg.data.workExperiences.create[0]).toMatchObject({
                company: 'ACME',
                position: 'Dev',
                description: 'Backend',
            });
        });

        it('should include nested resumes on create when list is non-empty', async () => {
            // Arrange
            const candidate = new Candidate({
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
            });
            candidate.resumes = [
                new Resume({ filePath: '/tmp/cv.pdf', fileType: 'application/pdf' }),
            ];
            mockCandidateCreate.mockResolvedValue({ id: 3 });

            // Act
            await candidate.save();

            // Assert
            const arg = mockCandidateCreate.mock.calls[0][0];
            expect(arg.data.resumes).toBeDefined();
            expect(arg.data.resumes.create).toHaveLength(1);
            expect(arg.data.resumes.create[0]).toMatchObject({
                filePath: '/tmp/cv.pdf',
                fileType: 'application/pdf',
            });
        });
    });

    describe('save() - UPDATE (with id)', () => {
        it('should call prisma.candidate.update when id is set', async () => {
            // Arrange
            const candidate = new Candidate({
                id: 7,
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
            });
            const expectedRecord = { id: 7, firstName: 'Juan' };
            mockCandidateUpdate.mockResolvedValue(expectedRecord);

            // Act
            const result = await candidate.save();

            // Assert
            expect(mockCandidateUpdate).toHaveBeenCalledTimes(1);
            expect(mockCandidateUpdate).toHaveBeenCalledWith({
                where: { id: 7 },
                data: {
                    firstName: 'Juan',
                    lastName: 'Pérez',
                    email: 'juan@example.com',
                },
            });
            expect(result).toEqual(expectedRecord);
        });

        it('should throw a friendly error when prisma update fails with P2025', async () => {
            // Arrange
            const candidate = new Candidate({
                id: 999,
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
            });
            const prismaError: any = new Error('Record to update not found');
            prismaError.code = 'P2025';
            mockCandidateUpdate.mockRejectedValue(prismaError);

            // Act
            const act = candidate.save();

            // Assert
            await expect(act).rejects.toThrow(
                'No se pudo encontrar el registro del candidato con el ID proporcionado.',
            );
        });
    });

    describe('findOne()', () => {
        it('should return a Candidate instance when the id exists', async () => {
            // Arrange
            const dbRecord = {
                id: 5,
                firstName: 'Ana',
                lastName: 'López',
                email: 'ana@example.com',
                phone: '612000000',
                address: null,
                educations: [],
                workExperiences: [],
                resumes: [],
                applications: [],
            };
            mockCandidateFindUnique.mockResolvedValue(dbRecord);

            // Act
            const result = await Candidate.findOne(5);

            // Assert
            expect(mockCandidateFindUnique).toHaveBeenCalledTimes(1);
            expect(mockCandidateFindUnique).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: 5 } }),
            );
            expect(result).toBeInstanceOf(Candidate);
            expect(result?.firstName).toBe('Ana');
        });

        it('should return null when the id does not exist', async () => {
            // Arrange
            mockCandidateFindUnique.mockResolvedValue(null);

            // Act
            const result = await Candidate.findOne(404);

            // Assert
            expect(mockCandidateFindUnique).toHaveBeenCalledTimes(1);
            expect(result).toBeNull();
        });
    });
});
