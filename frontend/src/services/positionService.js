import axios from 'axios';

const API_BASE_URL = 'http://localhost:3010';

export const getPositions = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/positions`);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.error || error.message;
        throw new Error(`Error fetching positions: ${message}`);
    }
};

export const getCandidatesByPosition = async (positionId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/positions/${positionId}/candidates`);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.error || error.message;
        throw new Error(`Error fetching candidates for position ${positionId}: ${message}`);
    }
};

export const getInterviewSteps = async (positionId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/positions/${positionId}/interviewSteps`);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.error || error.message;
        throw new Error(`Error fetching interview steps for position ${positionId}: ${message}`);
    }
};
