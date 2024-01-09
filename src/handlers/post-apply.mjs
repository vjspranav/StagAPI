import emailClient from '/opt/email-client.js';

const { EMAIL: email, PASSWORD: password } = process.env;

export const postApplyHandler = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`apply only accept POST method, you tried: ${event.httpMethod}`);
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);

    const transport = await emailClient(email, password);
    if (!transport) {
        throw new Error("Transport not available");
    }
    transport.sendMail({
        from: 'vjspranav@stag-os.org',
        to: 'pranavasri@live.in',
        subject: 'Test',
        text: 'Hello World!'
    }, (err, info) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log(info);
    }
    )
    try {
        const response = {
            statusCode: 200,
            body: JSON.stringify({ message: "Application submitted successfully" })
        };
    
        // All log statements are written to CloudWatch
        console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
        return response;
    } catch (err) {
        console.log("Error", err);
    }
}
