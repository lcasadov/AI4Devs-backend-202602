// Cobertura estimada: 90%
const mockResumeCreate = jest.fn();

jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        resume: {
            create: mockResumeCreate,
        },
    })),
    Prisma: {},
}));

import { Resume } from '../../domain/models/Resume';

describe('Resume model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should assign every field and set uploadDate to a Date instance', () => {
            // Arrange
            const data = {
                id: 1,
                candidateId: 3,
                filePath: '/uploads/cv.pdf',
                fileType: 'application/pdf',
            };

            // Act
            const resume = new Resume(data);

            // Assert
            expect(resume.id).toBe(1);
            expect(resume.candidateId).toBe(3);
            expect(resume.filePath).toBe('/uploads/cv.pdf');
            expect(resume.fileType).toBe('application/pdf');
            expect(resume.uploadDate).toBeInstanceOf(Date);
        });

        it('should accept undefined data without throwing', () => {
            // Arrange
            const data: any = undefined;

            // Act
            const resume = new Resume(data);

            // Assert
            expect(resume.uploadDate).toBeInstanceOf(Date);
            expect(resume.filePath).toBeUndefined();
            expect(resume.fileType).toBeUndefined();
        });
    });

    describe('save()', () => {
        it('should call prisma.resume.create with the proper payload when no id is set', async () => {
            // Arrange
            const resume = new Resume({
                candidateId: 7,
                filePath: '/uploads/cv-juan.pdf',
                fileType: 'application/pdf',
            });
            const created = {
                id: 100,
                candidateId: 7,
                filePath: '/uploads/cv-juan.pdf',
                fileType: 'application/pdf',
                uploadDate: new Date(),
            };
            mockResumeCreate.mockResolvedValue(created);

            // Act
            const result = await resume.save();

            // Assert
            expect(mockResumeCreate).toHaveBeenCalledTimes(1);
            expect(mockResumeCreate).toHaveBeenCalledWith({
                data: {
                    candidateId: 7,
                    filePath: '/uploads/cv-juan.pdf',
                    fileType: 'application/pdf',
                    uploadDate: resume.uploadDate,
                },
            });
            expect(result).toBeInstanceOf(Resume);
            expect(result.filePath).toBe('/uploads/cv-juan.pdf');
        });

        it('should throw when trying to save an existing resume (id present)', async () => {
            // Arrange
            const resume = new Resume({
                id: 5,
                candidateId: 7,
                filePath: '/uploads/cv.pdf',
                fileType: 'application/pdf',
            });

            // Act
            const act = resume.save();

            // Assert
            await expect(act).rejects.toThrow(
                'No se permite la actualización de un currículum existente.',
            );
            expect(mockResumeCreate).not.toHaveBeenCalled();
        });
    });
});
