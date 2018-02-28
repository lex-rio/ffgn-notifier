let config = {
    botToken: process.env.botToken || '',
    grabInterval: process.env.grabInterval || 60000,
    grabIntervalForError: process.env.grabIntervalForError || 600000,
    appUrl: process.env.APP_URL || 'https://<app>.herokuapp.com:443',
    appPort: process.env.PORT,
    admin: 212565743
};
module.exports = config;
