const BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || '';

async function request(path, options = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  });
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) {
      const msg = data.error || res.statusText;
      throw new Error(msg);
    }
    return data;
  }
  if (!res.ok) {
    throw new Error(res.statusText || 'Request failed');
  }
  return res;
}

export async function translateText(text, targetLanguage) {
  return request('/api/translate', {
    method: 'POST',
    body: JSON.stringify({ text, targetLanguage }),
  });
}

export async function processSpeechAudio(formData) {
  return request('/api/speech/process', {
    method: 'POST',
    body: formData,
  });
}

export async function processSpeechBase64(audioBase64, mimeType, targetLanguage) {
  return request('/api/speech/process', {
    method: 'POST',
    body: JSON.stringify({
      audioBase64,
      mimeType,
      ...(targetLanguage ? { targetLanguage } : {}),
    }),
  });
}

/** Returns parsed JSON with audioBase64 when using format=json */
export async function speakText(text, language, format = 'json') {
  return request(`/api/tts/speak?format=${encodeURIComponent(format)}`, {
    method: 'POST',
    body: JSON.stringify({ text, language, format }),
  });
}

export async function aiChat(messages) {
  return request('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ messages }),
  });
}
