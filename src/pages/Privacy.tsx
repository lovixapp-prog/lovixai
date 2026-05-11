import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";

const Privacy = () => {
  return (
    <PageLayout>
      <SEOHead
        title="Privacy Policy - LOVIX AI Platform"
        description="Privacy Policy for LOVIX AI platform. Learn how we collect, use, and protect your data when using our AI video and image generation services."
        keywords="LOVIX privacy policy, AI platform privacy, data protection AI, video generation privacy"
        canonicalPath="/privacy"
        noIndex={true}
      />
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </Link>

        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            Legal
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: January 14, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              1. Introduction
            </h2>
            <p className="text-muted-foreground mb-4">
              Welcome to LOVIX ("we," "our," or "us"). We are committed to protecting your privacy 
              and ensuring transparency about how we collect, use, and share your information. This 
              Privacy Policy explains our practices regarding your personal data when you use our 
              AI-powered creative platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              2. Information We Collect
            </h2>
            <h3 className="font-medium text-foreground mt-4 mb-2">2.1 Information You Provide</h3>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li>Account information: email address, name, and password when you create an account</li>
              <li>Payment information: processed securely through our payment providers</li>
              <li>Content: prompts, images, videos, and other files you upload or generate</li>
              <li>Communications: when you contact our support team</li>
            </ul>

            <h3 className="font-medium text-foreground mt-4 mb-2">2.2 Information Collected Automatically</h3>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li>Device information: browser type, operating system, device identifiers</li>
              <li>Usage data: features used, generation history, interaction patterns</li>
              <li>Log data: IP address, access times, pages viewed</li>
              <li>Cookies and similar technologies: for session management and analytics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-muted-foreground mb-4">We use collected information to:</p>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your transactions and manage your account</li>
              <li>Generate AI content based on your prompts and inputs</li>
              <li>Send service-related communications and updates</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Analyze usage patterns to improve user experience</li>
              <li>Detect and prevent fraud, abuse, and security issues</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              4. Data Sharing and Disclosure
            </h2>
            <p className="text-muted-foreground mb-4">We may share your information with:</p>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li><strong className="text-foreground">Service providers:</strong> Third parties that help us operate our platform (hosting, payment processing, analytics)</li>
              <li><strong className="text-foreground">AI model providers:</strong> To process your generation requests (prompts are sent securely)</li>
              <li><strong className="text-foreground">Legal requirements:</strong> When required by law or to protect our rights</li>
              <li><strong className="text-foreground">Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              We do not sell your personal information to third parties for marketing purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              5. Your Content and AI Training
            </h2>
            <p className="text-muted-foreground mb-4">
              <strong className="text-foreground">Your generated content belongs to you.</strong> We do not use your 
              personal uploads or generated content to train our AI models without your explicit consent. 
              Your creative work remains private unless you choose to share it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              6. Data Security
            </h2>
            <p className="text-muted-foreground mb-4">
              We implement industry-standard security measures to protect your data, including:
            </p>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and assessments</li>
              <li>Access controls and authentication requirements</li>
              <li>Secure cloud infrastructure with trusted providers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              7. Data Retention
            </h2>
            <p className="text-muted-foreground mb-4">
              We retain your data for as long as your account is active or as needed to provide services. 
              You may request deletion of your account and associated data at any time. Some information 
              may be retained as required by law or for legitimate business purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              8. Your Rights
            </h2>
            <p className="text-muted-foreground mb-4">Depending on your location, you may have the right to:</p>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability (receive your data in a structured format)</li>
              <li>Withdraw consent where processing is based on consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              9. Cookies
            </h2>
            <p className="text-muted-foreground mb-4">
              We use cookies and similar technologies to maintain your session, remember preferences, 
              and analyze usage. You can control cookie settings through your browser, though some 
              features may not function properly if cookies are disabled.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              10. Children's Privacy
            </h2>
            <p className="text-muted-foreground mb-4">
              Our services are not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children. If you believe a child has provided us with 
              personal data, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              11. Changes to This Policy
            </h2>
            <p className="text-muted-foreground mb-4">
              We may update this Privacy Policy periodically. We will notify you of significant changes 
              by posting the new policy on this page and updating the "Last updated" date. Continued use 
              of our services after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              12. Contact Us
            </h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p className="text-foreground">
              Email: privacy@lovix.ai<br />
              Address: LOVIX Inc., Privacy Team
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default Privacy;