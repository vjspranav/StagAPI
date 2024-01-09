const nodeMailer = require("nodemailer");

module.exports = (email, password) => {
    const transport = nodeMailer.createTransport({
        name: "zoho.in",
        host: "smtp.zoho.in",
        secure: true,
        port: 465,
        auth: {
          user: email,
          pass: password,
        },
    });

    return new Promise((resolve, reject) => {
        transport.verify((error, success) => {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                console.log("Server is ready to take messages");
                resolve(transport);
            }
        });
    });
}