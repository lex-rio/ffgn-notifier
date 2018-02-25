let config = {
    botToken: process.env.botToken || '',
    grabInterval: process.env.grabInterval || 60000,
    grabIntervalForError: process.env.grabIntervalForError || 600000,
    admin: 212565743
};
module.exports = config;
