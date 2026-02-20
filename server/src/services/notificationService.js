const nodemailer = require('nodemailer');
const axios = require('axios');

const sendNotification = async (candidate, agency, type = 'BOTH') => {
    const uploadLink = `${process.env.FRONTEND_URL}/upload/${candidate.id}`;
    const message = `Hello ${candidate.name}, please upload your documents here: ${uploadLink}`;

    // 1. SMTP Email Logic
    if (type === 'EMAIL' || type === 'BOTH') {
        //const smtpConfig = JSON.parse(agency.smtp_config); 
        const smtpConfig = JSON.parse('{"host": "smtp.gmail.com", "port": 587, "user": "deepaktailor5921@gmail.com", "pass": "pryjokmkxwzzuugr"}');
        //console.log("SMTP Config: ", smtpConfig);
        const transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port,
            auth: {
                user: smtpConfig.user,
                pass: smtpConfig.pass,
            },
        });

        try {
            const info = await transporter.sendMail({
                from: `"Recruiter" <${smtpConfig.user}>`,
                to: candidate.email,
                subject: 'Document Upload Request',
                text: message,
            });
            console.log("✅ Email sent: ", info.messageId);
        } catch (error) {
            console.error("❌ Nodemailer Error: ", error); 
        }
    }

    // 2. WhatsApp API Logic (Example using a generic API)
    if (type === 'WHATSAPP' || type === 'BOTH') {
        const waConfig = JSON.parse(agency.whatsapp_config);
        
        await axios.post(waConfig.apiUrl, {
            phoneNumber: candidate.phone,
            message: message,
            apiKey: waConfig.apiKey
        });
    }
};

const notifyAgency = async (candidate, agency) => {
    //const smtpConfig = JSON.parse(agency.smtp_config);
    const smtpConfig = JSON.parse('{"host": "smtp.gmail.com", "port": 587, "user": "deepaktailor5921@gmail.com", "pass": "pryjokmkxwzzuugr"}');
    const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        auth: { user: smtpConfig.user, pass: smtpConfig.pass },
    });

    await transporter.sendMail({
        from: `"System Alert" <${smtpConfig.user}>`,
        to: agency.email || smtpConfig.user, 
        subject: `🚨 Action Required: Candidate Pending - ${candidate.name}`,
        text: `Candidate ${candidate.name} (Phone: ${candidate.phone}) has not uploaded documents after 3 reminders. Please contact them directly.`,
    });
    
    console.log(`📢 Agency notified about Candidate: ${candidate.id}`);
};

module.exports = { sendNotification, notifyAgency };
