// Cobertura estimada: 95%
const mockWorkExperienceCreate = jest.fn();
const mockWorkExperienceUpdate = jest.fn();

jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        workExperience: {
            create: mockWorkExperienceCreate,
            update: mockWorkExperienceUpdate,
        },
    })),
    Prisma: {},
}));

import { WorkExperience } from '../../domain/models/WorkExperience';

describe('WorkExperience model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should assign every field correctly when full data is provided', () => {
            // Arrange
            const data = {
                id: 8,
                company: 'ACME',
                position: 'Senior Developer',
                description: 'Backend Node.js development',
                startDate: '2019-07-01',
                endDate: '2023-12-31',
                candidateId: 5,
            };

            // Act
            const exp = new WorkExperience(data);

            // Assert
            expect(exp.id).toBe(8);
            expect(exp.company).toBe('ACME');
            expect(exp.position).toBe('Senior Developer');
            expect(exp.description).toBe('Backend Node.js development');
            expect(exp.startDate).toEqual(new Date('2019-07-01'));
            expect(exp.endDate).toEqual(new Date('2023-12-31'));
            expect(exp.candidateId).toBe(5);
        });

        it('should leave endDate undefined when not provided', () => {
            // Arrange
            const data = {
                company: 'ACME',
                position: 'Dev',
                startDate: '2019-07-01',
            };

            // Act
            const exp = new WorkExperience(data);

            // Assert
            expect(exp.endDate).toBeUndefined();
        });
    });

    describe('save()', () => {
        it('should call prisma.workExperience.create when there is no id', async () => {
            // Arrange
            const exp = new WorkExperience({
                company: 'ACME',
                position: 'Dev',
                description: 'Backend',
                startDate: '2019-07-01',
                endDate: '2023-12-31',
                candidateId: 5,
            });
            const expectedRecord = { id: 9 };
            mockWorkExperienceCreate.mockResolvedValue(expectedRecord);

            // Act
            const result = await exp.save();

            // Assert
            expect(mockWorkExperienceCreate).toHaveBeenCalledTimes(1);
            expect(mockWorkExperienceCreate).toHaveBeenCalledWith({
                data: {
                    company: 'ACME',
                    position: 'Dev',
                    description: 'Backend',
                    startDate: new Date('2019-07-01'),
                    endDate: new Date('2023-12-31'),
                    candidateId: 5,
                },
            });
            expect(mockWorkExperienceUpdate).not.toHaveBeenCalled();
            expect(result).toEqual(expectedRecord);
        });

        it('should call prisma.workExperience.update when an id is provided', async () => {
            // Arrange
            const exp = new WorkExperience({
                id: 33,
                company: 'ACME',
                position: 'Dev',
                startDate: '2019-07-01',
                candidateId: 5,
            });
            const expectedRecord = { id: 33 };
            mockWorkExperienceUpdate.mockResolvedValue(expectedRecord);

            // Act
            const result = await exp.save();

            // Assert
            expect(mockWorkExperienceUpdate).toHaveBeenCalledTimes(1);
            expect(mockWorkExperienceUpdate).toHaveBeenCalledWith({
                where: { id: 33 },
                data: expect.objectContaining({
                    company: 'ACME',
                    position: 'Dev',
                    candidateId: 5,
                }),
            });
            expect(mockWorkExperienceCreate).not.toHaveBeenCalled();
            expect(result).toEqual(expectedRecord);
        });
    });
});
