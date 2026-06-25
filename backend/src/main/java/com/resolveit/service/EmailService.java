package com.resolveit.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Send a welcome email to new users
     * This method is async so registration doesn't wait for email to be sent
     */
    @Async
    public void sendWelcomeEmail(String toEmail, String fullName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("fromEmail"); // From your application.properties
            message.setTo(toEmail);
            message.setSubject("Welcome to ResolveIt - Your Complaint Management System");

            String emailContent = String.format(
                    """
                    Dear %s,
                    
                    🎉 Welcome to ResolveIt! 🎉
                    
                    Thank you for registering with our Complaint Management System. 
                    We're excited to have you on board!
                    
                    With ResolveIt, you can:
                    • Submit complaints easily and securely
                    • Track the progress of your complaints
                    • Communicate with our support team
                    • View public complaints from other users
                    
                    Get started by logging into your account and submitting your first complaint.
                    
                    If you have any questions or need assistance, feel free to reach out to us.
                    
                    Best regards,
                    The ResolveIt Team
                    
                    ---
                    ResolveIt - Voice Your Concern, See It Resolved
                    """,
                    fullName
            );

            message.setText(emailContent);

            mailSender.send(message);
            log.info("✅ Welcome email sent successfully to: {}", toEmail);

        } catch (Exception e) {
            // Log error but don't throw - we don't want registration to fail if email fails
            log.error("❌ Failed to send welcome email to {}: {}", toEmail, e.getMessage());
            log.debug("Email sending error details: ", e);
        }
    }

    /**
     * Simple test method to verify email configuration
     */
    public void sendTestEmail(String toEmail) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("fromEmail");
            message.setTo(toEmail);
            message.setSubject("Test Email from ResolveIt");
            message.setText("This is a test email to verify email configuration is working.");

            mailSender.send(message);
            log.info("✅ Test email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("❌ Failed to send test email: {}", e.getMessage());
        }
    }
}