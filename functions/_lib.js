export const TOTAL_QUESTIONS = 40;

// Extracted from the answer indices in the supplied Grade 4 Unit 1 HTML question bank.
export const ANSWER_KEY = [2, 0, 2, 1, 3, 0, 0, 1, 2, 1, 2, 1, 0, 3, 0, 2, 1, 1, 3, 2, 1, 0, 2, 1, 3, 0, 2, 3, 1, 2, 0, 3, 1, 2, 1, 3, 2, 0, 2, 2];

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

export function normalizeName(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

export function validTeacherPassword(password, env) {
  return Boolean(env.TEACHER_PASSWORD) && typeof password === 'string' && password === env.TEACHER_PASSWORD;
}

export function calculateResult(rawAnswers) {
  const input = Array.isArray(rawAnswers) ? rawAnswers : [];
  const selectedByQuestion = new Map();
  for (const item of input) {
    const questionId = Number(item?.questionId);
    const selectedOptionIndex = Number(item?.selectedOptionIndex);
    if (Number.isInteger(questionId) && questionId >= 1 && questionId <= TOTAL_QUESTIONS &&
        Number.isInteger(selectedOptionIndex) && selectedOptionIndex >= 0 && selectedOptionIndex <= 3) {
      selectedByQuestion.set(questionId, selectedOptionIndex);
    }
  }

  let score = 0;
  const normalizedAnswers = [];
  const mistakeIds = [];
  for (let questionId = 1; questionId <= TOTAL_QUESTIONS; questionId++) {
    const selectedOptionIndex = selectedByQuestion.has(questionId) ? selectedByQuestion.get(questionId) : null;
    const isCorrect = selectedOptionIndex !== null && selectedOptionIndex === ANSWER_KEY[questionId - 1];
    if (isCorrect) score++;
    if (!isCorrect) mistakeIds.push(questionId);
    normalizedAnswers.push({ questionId, selectedOptionIndex, isCorrect });
  }
  return { score, total: TOTAL_QUESTIONS, percentage: Math.round(score / TOTAL_QUESTIONS * 100), answers: normalizedAnswers, mistakeIds };
}

export async function getThreshold(env) {
  const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?1').bind('cert_threshold').first();
  const value = Number(row?.value);
  return Number.isFinite(value) && value >= 50 && value <= 100 ? value : 95;
}

function toLog(row, attemptNumber) {
  return {
    id: row.id,
    name: row.name,
    timestamp: row.timestamp,
    score: Number(row.score),
    total: Number(row.total),
    percentage: Number(row.percentage),
    attemptNumber
  };
}

export function buildDashboard(rows, threshold) {
  // Assign attempts oldest-to-newest, then display newest first.
  const chronological = [...rows].sort((a, b) => Number(a.created_at_ms) - Number(b.created_at_ms));
  const counters = new Map();
  const logsWithTimes = chronological.map((row) => {
    const key = normalizeName(row.name).toLocaleLowerCase('ar');
    const attemptNumber = (counters.get(key) || 0) + 1;
    counters.set(key, attemptNumber);
    return { log: toLog(row, attemptNumber), createdAtMs: Number(row.created_at_ms) };
  });
  const logs = logsWithTimes.sort((a, b) => b.createdAtMs - a.createdAtMs).map(item => item.log);
  const missedStats = {};
  for (const row of rows) {
    let ids = [];
    try { ids = JSON.parse(row.mistake_ids_json || '[]'); } catch { ids = []; }
    for (const id of ids) {
      const key = String(id);
      missedStats[key] = (missedStats[key] || 0) + 1;
    }
  }
  return { logs, missedStats, threshold };
}
