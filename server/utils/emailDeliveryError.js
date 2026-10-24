function getEmailDeliveryFailureDetails(error) {
    const code = typeof error?.code === "string" ? error.code : "";
    const smtpResponseCode = Number.isInteger(error?.responseCode)
        ? error.responseCode
        : undefined;
    const command = typeof error?.command === "string"
        ? error.command.toUpperCase()
        : "";

    let category = "smtp_delivery_failed";

    if (code === "EMAIL_CONFIG_MISSING") {
        category = "email_configuration_missing";
    } else if (code === "EMAIL_CONFIG_INVALID") {
        category = "email_configuration_invalid";
    } else if (
        code === "EAUTH" ||
        smtpResponseCode === 534 ||
        smtpResponseCode === 535
    ) {
        category = "smtp_authentication_rejected";
    } else if (
        code === "ECONNECTION" ||
        code === "ECONNREFUSED" ||
        code === "ETIMEDOUT" ||
        code === "ENOTFOUND" ||
        code === "EHOSTUNREACH" ||
        code === "ESOCKET"
    ) {
        category = "smtp_connection_or_tls_failed";
    } else if (
        command.startsWith("MAIL FROM") &&
        smtpResponseCode >= 500
    ) {
        category = "smtp_sender_rejected";
    } else if (
        command.startsWith("RCPT TO") &&
        smtpResponseCode >= 500
    ) {
        category = "smtp_recipient_rejected";
    } else if (smtpResponseCode >= 500) {
        category = "smtp_server_rejected";
    } else if (smtpResponseCode >= 400) {
        category = "smtp_temporary_failure";
    }

    return {
        category,
        ...(smtpResponseCode === undefined ? {} : { smtpResponseCode })
    };
}

function logEmailDeliveryFailure(flow, error) {
    console.error(`[email] ${flow} delivery failed`, getEmailDeliveryFailureDetails(error));
}

module.exports = {
    getEmailDeliveryFailureDetails,
    logEmailDeliveryFailure
};
