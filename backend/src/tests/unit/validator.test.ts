// Cobertura estimada: 95%
import { validateCandidateData } from '../../application/validator';

describe('validator', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('validateCandidateData - validateName (firstName/lastName)', () => {
        it('should throw "Invalid name" when firstName is missing', () => {
            // Arrange
            const data = { lastName: 'Pérez', email: 'juan@example.com' };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).toThrow('Invalid name');
        });

        it('should throw "Invalid name" when firstName has only one character', () => {
            // Arrange
            const data = { firstName: 'A', lastName: 'Pérez', email: 'juan@example.com' };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).toThrow('Invalid name');
        });

        it('should throw "Invalid name" when firstName contains invalid characters', () => {
            // Arrange
            const data = { firstName: 'Juan123', lastName: 'Pérez', email: 'juan@example.com' };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).toThrow('Invalid name');
        });

        it('should throw "Invalid name" when firstName exceeds 100 characters', () => {
            // Arrange
            const longName = 'A'.repeat(101);
            const data = { firstName: longName, lastName: 'Pérez', email: 'juan@example.com' };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).toThrow('Invalid name');
        });

        it('should throw "Invalid name" when lastName is missing', () => {
            // Arrange
            const data = { firstName: 'Juan', email: 'juan@example.com' };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).toThrow('Invalid name');
        });

        it('should accept names with accented characters and spaces', () => {
            // Arrange
            const data = { firstName: 'José María', lastName: 'Núñez', email: 'jose@example.com' };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).not.toThrow();
        });
    });

    describe('validateCandidateData - validateEmail', () => {
        it('should throw "Invalid email" when email is missing', () => {
            // Arrange
            const data = { firstName: 'Juan', lastName: 'Pérez' };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).toThrow('Invalid email');
        });

        it('should throw "Invalid email" when email has no @', () => {
            // Arrange
            const data = { firstName: 'Juan', lastName: 'Pérez', email: 'invalid-email' };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).toThrow('Invalid email');
        });

        it('should throw "Invalid email" when email has no TLD', () => {
            // Arrange
            const data = { firstName: 'Juan', lastName: 'Pérez', email: 'juan@example' };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).toThrow('Invalid email');
        });

        it('should accept a properly formatted email', () => {
            // Arrange
            const data = { firstName: 'Juan', lastName: 'Pérez', email: 'juan.perez+tag@sub.example.com' };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).not.toThrow();
        });
    });

    describe('validateCandidateData - validatePhone', () => {
        it('should NOT throw when phone is empty (optional)', () => {
            // Arrange
            const data = { firstName: 'Juan', lastName: 'Pérez', email: 'juan@example.com', phone: '' };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).not.toThrow();
        });

        it('should throw "Invalid phone" when phone does not start with 6, 7 or 9', () => {
            // Arrange
            const data = { firstName: 'Juan', lastName: 'Pérez', email: 'juan@example.com', phone: '512345678' };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).toThrow('Invalid phone');
        });

        it('should throw "Invalid phone" when phone has fewer than 9 digits', () => {
            // Arrange
            const data = { firstName: 'Juan', lastName: 'Pérez', email: 'juan@example.com', phone: '61234567' };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).toThrow('Invalid phone');
        });

        it('should accept a valid Spanish phone starting with 6', () => {
            // Arrange
            const data = { firstName: 'Juan', lastName: 'Pérez', email: 'juan@example.com', phone: '612345678' };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).not.toThrow();
        });
    });

    describe('validateCandidateData - validateAddress', () => {
        it('should throw "Invalid address" when address exceeds 100 chars', () => {
            // Arrange
            const data = {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
                address: 'A'.repeat(101),
            };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).toThrow('Invalid address');
        });

        it('should accept an address of exactly 100 characters', () => {
            // Arrange
            const data = {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
                address: 'A'.repeat(100),
            };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).not.toThrow();
        });
    });

    describe('validateCandidateData - validateEducation', () => {
        it('should throw "Invalid institution" when institution is missing', () => {
            // Arrange
            const data = {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
                educations: [{ title: 'Ingeniería', startDate: '2020-09-01' }],
            };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).toThrow('Invalid institution');
        });

        it('should throw "Invalid title" when title is missing in education', () => {
            // Arrange
            const data = {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
                educations: [{ institution: 'UPM', startDate: '2020-09-01' }],
            };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).toThrow('Invalid title');
        });

        it('should throw "Invalid date" when startDate has wrong format', () => {
            // Arrange
            const data = {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
                educations: [{ institution: 'UPM', title: 'Ingeniería', startDate: '01-09-2020' }],
            };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).toThrow('Invalid date');
        });

        it('should throw "Invalid end date" when endDate has wrong format', () => {
            // Arrange
            const data = {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
                educations: [
                    { institution: 'UPM', title: 'Ingeniería', startDate: '2020-09-01', endDate: '2024/06/30' },
                ],
            };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).toThrow('Invalid end date');
        });

        it('should accept valid education without endDate', () => {
            // Arrange
            const data = {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
                educations: [{ institution: 'UPM', title: 'Ingeniería', startDate: '2020-09-01' }],
            };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).not.toThrow();
        });
    });

    describe('validateCandidateData - validateExperience', () => {
        it('should throw "Invalid company" when company is missing', () => {
            // Arrange
            const data = {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
                workExperiences: [{ position: 'Dev', startDate: '2021-01-01' }],
            };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).toThrow('Invalid company');
        });

        it('should throw "Invalid position" when position is missing', () => {
            // Arrange
            const data = {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
                workExperiences: [{ company: 'ACME', startDate: '2021-01-01' }],
            };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).toThrow('Invalid position');
        });

        it('should throw "Invalid description" when description exceeds 200 chars', () => {
            // Arrange
            const data = {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
                workExperiences: [
                    {
                        company: 'ACME',
                        position: 'Dev',
                        description: 'D'.repeat(201),
                        startDate: '2021-01-01',
                    },
                ],
            };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).toThrow('Invalid description');
        });

        it('should throw "Invalid date" when startDate is malformed', () => {
            // Arrange
            const data = {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
                workExperiences: [{ company: 'ACME', position: 'Dev', startDate: 'not-a-date' }],
            };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).toThrow('Invalid date');
        });

        it('should throw "Invalid end date" when endDate is malformed', () => {
            // Arrange
            const data = {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
                workExperiences: [
                    { company: 'ACME', position: 'Dev', startDate: '2021-01-01', endDate: '31-12-2022' },
                ],
            };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).toThrow('Invalid end date');
        });

        it('should accept a valid experience entry', () => {
            // Arrange
            const data = {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
                workExperiences: [
                    {
                        company: 'ACME',
                        position: 'Dev',
                        description: 'Backend developer',
                        startDate: '2021-01-01',
                        endDate: '2022-12-31',
                    },
                ],
            };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).not.toThrow();
        });
    });

    describe('validateCandidateData - validateCV', () => {
        it('should throw "Invalid CV data" when cv is missing filePath', () => {
            // Arrange
            const data = {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
                cv: { fileType: 'application/pdf' },
            };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).toThrow('Invalid CV data');
        });

        it('should throw "Invalid CV data" when cv is missing fileType', () => {
            // Arrange
            const data = {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
                cv: { filePath: '/tmp/cv.pdf' },
            };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).toThrow('Invalid CV data');
        });

        it('should accept a valid cv object with filePath and fileType', () => {
            // Arrange
            const data = {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
                cv: { filePath: '/tmp/cv.pdf', fileType: 'application/pdf' },
            };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).not.toThrow();
        });

        it('should NOT validate cv when cv is an empty object', () => {
            // Arrange
            const data = {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan@example.com',
                cv: {},
            };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).not.toThrow();
        });
    });

    describe('validateCandidateData - 3 escenarios principales', () => {
        it('Prueba 1: should pass when only minimum required fields are provided', () => {
            // Arrange
            const data = {
                firstName: 'Juan',
                lastName: 'Pérez',
                email: 'juan.perez@example.com',
            };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).not.toThrow();
        });

        it('Prueba 2: should pass when all fields including educations, workExperiences and cv are provided', () => {
            // Arrange
            const data = {
                firstName: 'María',
                lastName: 'García',
                email: 'maria.garcia@example.com',
                phone: '612345678',
                address: 'Calle Mayor 1, Madrid',
                educations: [
                    {
                        institution: 'Universidad Politécnica de Madrid',
                        title: 'Ingeniería Informática',
                        startDate: '2015-09-01',
                        endDate: '2019-06-30',
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

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).not.toThrow();
        });

        it('Prueba 3: should throw when mandatory fields are missing (no firstName)', () => {
            // Arrange
            const data = { lastName: 'García', email: 'maria@example.com' };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).toThrow('Invalid name');
        });

        it('Prueba 3 (variant): should throw when email is missing', () => {
            // Arrange
            const data = { firstName: 'María', lastName: 'García' };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).toThrow('Invalid email');
        });

        it('should skip validation when id is provided (edit mode)', () => {
            // Arrange
            const data = { id: 42 };

            // Act
            const act = () => validateCandidateData(data);

            // Assert
            expect(act).not.toThrow();
        });
    });
});
