import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import SEOHead from "@/components/SEOHead";

const Terms = () => {
  return (
    <PageLayout>
      <SEOHead
        title="Terms of Service - LOVIX AI Video & Image Generation"
        description="Terms of Service for LOVIX AI platform. Read our terms and conditions for using AI video generation, image creation, and motion control services."
        keywords="LOVIX terms of service, AI platform terms, video generation terms, AI service agreement"
        canonicalPath="/terms"
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
            <FileText className="w-4 h-4" />
            Legal
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">
            Last updated: January 14, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground mb-4">
              By accessing or using LOVIX ("Service"), you agree to be bound by these Terms of Service 
              ("Terms"). If you do not agree to these Terms, you may not use the Service. These Terms 
              constitute a legally binding agreement between you and LOVIX Inc. ("we," "us," or "our").
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              2. Description of Service
            </h2>
            <p className="text-muted-foreground mb-4">
              LOVIX is an AI-powered creative platform that enables users to generate and edit videos, 
              images, and motion content using artificial intelligence. Our services include:
            </p>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li>AI video generation from text prompts</li>
              <li>AI image generation and editing</li>
              <li>Motion transfer and lip sync capabilities</li>
              <li>Asset management and storage</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              3. Account Registration
            </h2>
            <p className="text-muted-foreground mb-4">
              To use certain features of the Service, you must create an account. You agree to:
            </p>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li>Provide accurate and complete information during registration</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Be at least 13 years old to create an account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              4. Subscription and Credits
            </h2>
            <h3 className="font-medium text-foreground mt-4 mb-2">4.1 Credit System</h3>
            <p className="text-muted-foreground mb-4">
              Our Service operates on a credit-based system. Credits are required to generate content 
              and are consumed based on the type and quality of generation. Credit costs are displayed 
              before each generation.
            </p>

            <h3 className="font-medium text-foreground mt-4 mb-2">4.2 Subscriptions</h3>
            <p className="text-muted-foreground mb-4">
              Paid subscriptions provide monthly credit allocations and additional features. Subscriptions 
              automatically renew unless cancelled before the renewal date. Unused credits may expire 
              according to your plan terms.
            </p>

            <h3 className="font-medium text-foreground mt-4 mb-2">4.3 Refunds</h3>
            <p className="text-muted-foreground mb-4">
              Refund requests are handled on a case-by-case basis. We may provide refunds for technical 
              issues that prevent service delivery. Credits spent on successful generations are generally 
              non-refundable.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              5. Content Ownership and Rights
            </h2>
            <h3 className="font-medium text-foreground mt-4 mb-2">5.1 Your Content</h3>
            <p className="text-muted-foreground mb-4">
              You retain ownership of content you create using our Service, subject to these Terms. 
              By using the Service, you grant us a license to process and store your content as 
              necessary to provide the Service.
            </p>

            <h3 className="font-medium text-foreground mt-4 mb-2">5.2 Generated Content</h3>
            <p className="text-muted-foreground mb-4">
              Content generated through our AI tools is owned by you. You may use generated content 
              for personal and commercial purposes, subject to applicable laws and these Terms.
            </p>

            <h3 className="font-medium text-foreground mt-4 mb-2">5.3 Our Rights</h3>
            <p className="text-muted-foreground mb-4">
              We retain all rights to the Service, including our AI models, software, branding, and 
              technology. Nothing in these Terms transfers ownership of our intellectual property to you.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              6. Acceptable Use
            </h2>
            <p className="text-muted-foreground mb-4">You agree not to use the Service to:</p>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li>Generate illegal, harmful, or abusive content</li>
              <li>Create deepfakes or deceptive content intended to mislead</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Generate content depicting minors in inappropriate contexts</li>
              <li>Create content promoting violence, hate, or discrimination</li>
              <li>Impersonate others without consent</li>
              <li>Distribute malware or engage in hacking activities</li>
              <li>Circumvent technical limitations or access restrictions</li>
              <li>Resell or redistribute the Service without authorization</li>
              <li>Use automated systems to access the Service at excessive rates</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              7. Content Moderation
            </h2>
            <p className="text-muted-foreground mb-4">
              We reserve the right to review and moderate content created through our Service. We may:
            </p>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li>Remove content that violates these Terms</li>
              <li>Suspend or terminate accounts for violations</li>
              <li>Report illegal content to appropriate authorities</li>
              <li>Implement automated content filtering</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              8. Disclaimers
            </h2>
            <p className="text-muted-foreground mb-4">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE 
              DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR MEET YOUR 
              SPECIFIC REQUIREMENTS. AI-GENERATED CONTENT MAY CONTAIN ERRORS OR UNEXPECTED RESULTS.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              9. Limitation of Liability
            </h2>
            <p className="text-muted-foreground mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, 
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE 
              SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE 
              MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              10. Indemnification
            </h2>
            <p className="text-muted-foreground mb-4">
              You agree to indemnify and hold harmless LOVIX, its officers, directors, employees, and 
              agents from any claims, damages, losses, or expenses arising from your use of the Service 
              or violation of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              11. Termination
            </h2>
            <p className="text-muted-foreground mb-4">
              We may suspend or terminate your account at any time for violations of these Terms or for 
              any other reason at our discretion. You may delete your account at any time through your 
              account settings. Upon termination, your right to use the Service ceases immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              12. Changes to Terms
            </h2>
            <p className="text-muted-foreground mb-4">
              We may modify these Terms at any time. We will notify you of material changes by posting 
              the updated Terms and updating the "Last updated" date. Continued use of the Service after 
              changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              13. Governing Law
            </h2>
            <p className="text-muted-foreground mb-4">
              These Terms shall be governed by and construed in accordance with applicable laws. Any 
              disputes arising from these Terms or your use of the Service shall be resolved through 
              binding arbitration, except where prohibited by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
              14. Contact
            </h2>
            <p className="text-muted-foreground mb-4">
              For questions about these Terms, please contact us at:
            </p>
            <p className="text-foreground">
              Email: legal@lovix.ai<br />
              Address: LOVIX Inc., Legal Department
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default Terms;
