const express = require('express');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const app = express();
const PORT = 8000;
const HOST = '0.0.0.0';

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Protect admin pages (create and dashboard) - only accessible from localhost
app.use(['/create', '/dashboard', '/create/', '/dashboard/'], requireLocalPath);

app.use(express.static('public'));

function isLocalRequest(req) {
    const host = (req.hostname || '').toLowerCase();
    const ip = (req.ip || '').replace('::ffff:', '');
    const localHosts = new Set(['localhost', '127.0.0.1', '::1']);
    return localHosts.has(host) || localHosts.has(ip);
}

function requireLocalPath(req, res, next) {
    if (!isLocalRequest(req)) {
        return res.redirect('/unauthorized/');
    }
    return next();
}

function requireLocal(req, res, next) {
    if (!isLocalRequest(req)) {
        return res.status(401).json({ success: false, message: 'Teacher access only.' });
    }
    return next();
}

const dataDir = path.join(__dirname, 'data');
const formsDir = path.join(dataDir, 'forms');
const answersDir = path.join(dataDir, 'answers');
const activeFormFile = path.join(dataDir, 'active-form.json');

[dataDir, formsDir, answersDir].forEach(dir => {
    if (!fsSync.existsSync(dir)) {
        fsSync.mkdirSync(dir, { recursive: true });
    }
});

async function readJson(file, fallback) {
    try {
        const content = await fs.readFile(file, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return fallback;
        }
        throw error;
    }
}

async function writeJson(file, data) {
    await fs.writeFile(file, JSON.stringify(data, null, 2));
}

function validateFormPayload(payload) {
    if (!payload.title || typeof payload.title !== 'string') {
        return 'Title is required.';
    }
    if (!Array.isArray(payload.questions) || payload.questions.length === 0) {
        return 'At least one question is required.';
    }
    for (const [index, question] of payload.questions.entries()) {
        if (!question.description || typeof question.description !== 'string') {
            return `Question ${index + 1} must have a description.`;
        }
        if (!Array.isArray(question.alternatives) || question.alternatives.length < 2) {
            return `Question ${index + 1} must have at least two alternatives.`;
        }
        if (!Number.isInteger(question.correct) || question.correct < 0 || question.correct >= question.alternatives.length) {
            return `Question ${index + 1} has an invalid correct answer index.`;
        }
    }
    return null;
}

function normalizeFormPayload(payload) {
    const now = new Date().toISOString();
    return {
        id: payload.id || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        title: payload.title.trim(),
        createdAt: payload.createdAt || now,
        questions: payload.questions.map(question => ({
            description: question.description.trim(),
            alternatives: question.alternatives.map(alt => alt.trim()),
            correct: question.correct,
            tags: Array.isArray(question.tags) ? question.tags.map(tag => tag.trim()).filter(Boolean) : [],
            weight: Number.isFinite(question.weight) ? question.weight : 1,
            idk: question.idk !== false
        }))
    };
}

async function getActiveFormId() {
    const active = await readJson(activeFormFile, null);
    return active ? active.id : null;
}

async function setActiveForm(id) {
    await writeJson(activeFormFile, { id, setAt: new Date().toISOString() });
}

async function listForms() {
    const files = await fs.readdir(formsDir);
    const forms = await Promise.all(
        files
            .filter(file => file.endsWith('.json'))
            .map(async file => readJson(path.join(formsDir, file), null))
    );
    return forms.filter(Boolean);
}

app.post('/api/forms', requireLocal, async (req, res) => {
    try {
        const errorMessage = validateFormPayload(req.body);
        if (errorMessage) {
            return res.status(400).json({ success: false, message: errorMessage });
        }

        const form = normalizeFormPayload(req.body);
        const filepath = path.join(formsDir, `${form.id}.json`);
        await writeJson(filepath, form);

        if (req.body.makeActive) {
            await setActiveForm(form.id);
        }

        res.json({ success: true, id: form.id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/forms/upload', requireLocal, async (req, res) => {
    try {
        const errorMessage = validateFormPayload(req.body);
        if (errorMessage) {
            return res.status(400).json({ success: false, message: errorMessage });
        }
        const form = normalizeFormPayload(req.body);
        const filepath = path.join(formsDir, `${form.id}.json`);
        await writeJson(filepath, form);
        res.json({ success: true, id: form.id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/forms', requireLocal, async (req, res) => {
    try {
        const activeId = await getActiveFormId();
        const forms = await listForms();
        const summaries = forms.map(form => ({
            id: form.id,
            title: form.title,
            questionCount: form.questions.length,
            createdAt: form.createdAt,
            active: form.id === activeId
        }));
        res.json({ success: true, data: summaries });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/forms/active', async (req, res) => {
    try {
        const activeId = await getActiveFormId();
        if (!activeId) {
            return res.status(404).json({ success: false, message: 'No active questionnaire.' });
        }
        const form = await readJson(path.join(formsDir, `${activeId}.json`), null);
        if (!form) {
            return res.status(404).json({ success: false, message: 'Active questionnaire not found.' });
        }
        res.json({ success: true, data: form });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/forms/:id', requireLocal, async (req, res) => {
    try {
        const form = await readJson(path.join(formsDir, `${req.params.id}.json`), null);
        if (!form) {
            return res.status(404).json({ success: false, message: 'Questionnaire not found.' });
        }
        res.json({ success: true, data: form });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/forms/:id/activate', requireLocal, async (req, res) => {
    try {
        const form = await readJson(path.join(formsDir, `${req.params.id}.json`), null);
        if (!form) {
            return res.status(404).json({ success: false, message: 'Questionnaire not found.' });
        }
        await setActiveForm(form.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/answers', async (req, res) => {
    try {
        const { formId, name, answers } = req.body;
        if (!formId || !Array.isArray(answers)) {
            return res.status(400).json({ success: false, message: 'formId and answers are required.' });
        }
        const form = await readJson(path.join(formsDir, `${formId}.json`), null);
        if (!form) {
            return res.status(404).json({ success: false, message: 'Questionnaire not found.' });
        }
        if (answers.length !== form.questions.length) {
            return res.status(400).json({ success: false, message: 'Answers length does not match questions.' });
        }
        for (const [index, answer] of answers.entries()) {
            if (answer === null) continue;
            if (!Number.isInteger(answer) || answer < 0 || answer >= form.questions[index].alternatives.length) {
                return res.status(400).json({ success: false, message: `Answer ${index + 1} is invalid.` });
            }
        }

        const payload = {
            id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
            formId,
            name: name && typeof name === 'string' ? name : 'Anonymous',
            answers,
            submittedAt: new Date().toISOString()
        };

        const answerFile = path.join(answersDir, `${formId}.json`);
        const existing = await readJson(answerFile, []);
        existing.push(payload);
        await writeJson(answerFile, existing);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/answers', requireLocal, async (req, res) => {
    try {
        if (req.query.formId) {
            const answers = await readJson(path.join(answersDir, `${req.query.formId}.json`), []);
            return res.json({ success: true, data: answers });
        }
        const files = await fs.readdir(answersDir);
        const allAnswers = await Promise.all(
            files
                .filter(file => file.endsWith('.json'))
                .map(async file => readJson(path.join(answersDir, file), []))
        );
        res.json({ success: true, data: allAnswers.flat() });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/dashboard', requireLocal, async (req, res) => {
    try {
        const forms = await listForms();
        const answersByForm = {};
        for (const form of forms) {
            answersByForm[form.id] = await readJson(path.join(answersDir, `${form.id}.json`), []);
        }
        const activeFormId = await getActiveFormId();
        res.json({
            success: true,
            data: {
                forms,
                answersByForm,
                activeFormId
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
});
