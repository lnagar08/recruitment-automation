const nodemailer = require('nodemailer');
const axios = require('axios');
const { User } = require('../models');

const sendNotification = async (candidate, agency, type = 'BOTH', message, subject) => {
    
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
                subject: subject,
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

const notifyAgencyInterviewFailure = async (interview, agency) => {
    //const smtpConfig = JSON.parse(agency.smtp_config);
    const smtpConfig = JSON.parse('{"host": "smtp.gmail.com", "port": 587, "user": "deepaktailor5921@gmail.com", "pass": "pryjokmkxwzzuugr"}');
    const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        auth: { user: smtpConfig.user, pass: smtpConfig.pass },
    });

    const message = `🚨 Action Required: Interview Confirmation Failed for Candidate: ${interview.Candidate.name}. 
    Company: ${interview.company_name}
    Time: ${interview.interview_datetime}
    The candidate did not confirm after 3 reminders. Please contact them directly at ${interview.Candidate.phone}.`;

    await transporter.sendMail({
        from: `"Interview System Alert" <${smtpConfig.user}>`,
        to: agency.email,
        subject: `⚠️ Unconfirmed Interview Alert - ${interview.Candidate.name}`,
        text: message,
    });
    
    console.log(`📢 Agency notified about Interview ID: ${interview.id}`);
};

const notifyRecruiterOnConfirmation = async (interview, candidate, agency) => {
    
    //const smtpConfig = JSON.parse(agency.smtp_config);
    const smtpConfig = JSON.parse('{"host": "smtp.gmail.com", "port": 587, "user": "deepaktailor5921@gmail.com", "pass": "pryjokmkxwzzuugr"}');
    const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        auth: { user: smtpConfig.user, pass: smtpConfig.pass },
    });

    const message = `✅ Great News! Candidate ${candidate.name} has CONFIRMED the interview.
    
    Details:
    - Company: ${interview.company_name}
    - Time: ${interview.interview_datetime}
    - Candidate Email: ${candidate.email}
    - Candidate Phone: ${candidate.phone}`;

    const agencyUsers = await User.findAll({ 
        attributes: ['email'],
        where: { agency_id: agency.id }
    });
    
    await transporter.sendMail({
        from: `"Interview System" <${smtpConfig.user}>`,
        to: agencyUsers[0].email,
        subject: `Confirmed: Interview with ${candidate.name}`,
        text: message,
    });
    
    console.log(`📩 Recruiter notified about confirmation: ${interview.id}`);
};

exports.notifyRecruiterOnReschedule = async (interview, agency) => {
    //const smtpConfig = JSON.parse(agency.smtp_config);
    const smtpConfig = JSON.parse('{"host": "smtp.gmail.com", "port": 587, "user": "deepaktailor5921@gmail.com", "pass": "pryjokmkxwzzuugr"}');
    const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        auth: { user: smtpConfig.user, pass: smtpConfig.pass },
    });

    const agencyUsers = await User.findAll({ 
        attributes: ['email'],
        where: { agency_id: agency.id }
    });
    
    const adminEmail = agencyUsers[0]?.email;

    const message = `🔄 Interview Rescheduled successfully.
    
    Details:
    - Candidate: ${interview.Candidate.name}
    - New Time: ${interview.interview_datetime}
    - Status: Pending Confirmation
    
    The system will start reminder cycles for this new slot.`;

    await transporter.sendMail({
        from: `"Interview System" <${smtpConfig.user}>`,
        to: adminEmail,
        subject: `Rescheduled: Interview with ${interview.Candidate.name}`,
        text: message,
    });
};


module.exports = { sendNotification, notifyAgency, notifyAgencyInterviewFailure, notifyRecruiterOnConfirmation };
