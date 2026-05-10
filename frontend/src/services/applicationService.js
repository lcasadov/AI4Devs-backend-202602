import axios from 'axios';

const API_BASE_URL = 'http://localhost:3010';

export const moveStage = async (candidateId, applicationId, newInterviewStepId) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/candidates/${candidateId}/stage`,
            { applicationId, newInterviewStepId },
        );
        return response.data;
    } catch (error) {
        const message = error.response?.data?.error || error.message;
        throw new Error(`Error moving candidate ${candidateId} stage: ${message}`);
    }
};
