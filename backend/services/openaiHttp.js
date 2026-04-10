import axios from 'axios';
import { config, assertOpenAIConfigured } from '../config/env.js';

export function createOpenAIClient() {
  assertOpenAIConfigured();
  return axios.create({
    baseURL: config.openaiBaseUrl,
    headers: {
      Authorization: `Bearer ${config.openaiApiKey}`,
    },
    timeout: 120000,
  });
}
