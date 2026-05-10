// Cobertura estimada: 95%
const mockEducationCreate = jest.fn();
const mockEducationUpdate = jest.fn();

jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        education: {
            create: mockEducationCreate,
            update: mockEducationUpdate,
        },
    })),
    Prisma: {},
}));

import { Education } from '../../domain/models/Education';

describe('Education model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should assign every field correctly when full data is provided', () => {
            // Arrange
            const data = {
                id: 10,
                institution: 'UPM',
                title: 'Ingeniería',
                startDate: '2015-09-01',
                endDate: '2019-06-30',
                candidateId: 3,
            };

            // Act
            const education = new Education(data);

            // Assert
            expect(education.id).toBe(10);
            expect(education.institution).toBe('UPM');
            expect(education.title).toBe('Ingeniería');
            expect(education.startDate).toEqual(new Date('2015-09-01'));
            expect(education.endDate).toEqual(new Date('2019-06-30'));
            expect(education.candidateId).toBe(3);
        });

        it('should leave endDate as undefined when not provided', () => {
            // Arrange
            const data = {
                institution: 'UPM',
                title: 'Ingeniería',
                startDate: '2015-09-01',
            };

            // Act
            const education = new Education(data);

            // Assert
            expect(education.endDate).toBeUndefined();
        });
    });

    describe('save()', () => {
        it('should call prisma.education.create when there is no id', async () => {
            // Arrange
            const education = new Education({
                institution: 'UPM',
                title: 'Ingeniería',
                startDate: '2015-09-01',
                endDate: '2019-06-30',
                candidateId: 3,
            });
            const expectedRecord = { id: 11 };
            mockEducationCreate.mockResolvedValue(expectedRecord);

            // Act
            const result = await education.save();

            // Assert
            expect(mockEducationCreate).toHaveBeenCalledTimes(1);
            expect(mockEducationCreate).toHaveBeenCalledWith({
                data: {
                    institution: 'UPM',
                    title: 'Ingeniería',
                    startDate: new Date('2015-09-01'),
                    endDate: new Date('2019-06-30'),
                    candidateId: 3,
                },
            });
            expect(mockEducationUpdate).not.toHaveBeenCalled();
            expect(result).toEqual(expectedRecord);
        });

        it('should call prisma.education.update when an id is provided', async () => {
            // Arrange
            const education = new Education({
                id: 22,
                institution: 'UPM',
                title: 'Ingeniería',
                startDate: '2015-09-01',
                candidateId: 3,
            });
            const expectedRecord = { id: 22 };
            mockEducationUpdate.mockResolvedValue(expectedRecord);

            // Act
            const result = await education.save();

            // Assert
            expect(mockEducationUpdate).toHaveBeenCalledTimes(1);
            expect(mockEducationUpdate).toHaveBeenCalledWith({
                where: { id: 22 },
                data: expect.objectContaining({
                    institution: 'UPM',
                    title: 'Ingeniería',
                    candidateId: 3,
                }),
            });
            expect(mockEducationCreate).not.toHaveBeenCalled();
            expect(result).toEqual(expectedRecord);
        });
    });
});
