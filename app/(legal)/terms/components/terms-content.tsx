// app/(legal)/terms/components/terms-content.tsx

'use client'

import Link from 'next/link'
import LegalDocument, { LegalParagraph, LegalList, type LegalSection } from '@/app/(legal)/components/legal-document'

export default function TermsContent() {
  const sections: LegalSection[] = [
    {
      id: 'introduction',
      title: '1. Introduction',
      content: (
        <>
          <LegalParagraph>
            Please read these Terms of Service (&quot;Terms&quot;) carefully before using the Trakyz website and platform (collectively, the &quot;Service&quot;) operated by Trakyz (&quot;Trakyz,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). 
          </LegalParagraph>
          <LegalParagraph className="mt-2">
            By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the Terms, you may not access the Service.
          </LegalParagraph>
          <LegalParagraph className="mt-2">
            These Terms constitute a legally binding agreement between you and Trakyz regarding your use of the Service. Trakyz reserves the right to update or modify these Terms at any time without prior notice. Your continued use of the Service following the posting of revised Terms means you accept and agree to the changes.
          </LegalParagraph>
        </>
      )
    },
    {
      id: 'definitions',
      title: '2. Definitions',
      content: (
        <>
          <LegalParagraph>
            Throughout these Terms, the following definitions apply:
          </LegalParagraph>
          <LegalList items={[
            <><strong>Account</strong>: A unique account created for you to access our Service or parts of our Service.</>,
            <><strong>Affiliate</strong>: An entity that controls, is controlled by, or is under common control with a party, where &quot;control&quot; means ownership of 50% or more of the shares or equity interest entitled to vote for the election of directors or equivalent governing body.</>,
            <><strong>Content</strong>: Information such as text, images, or other information that can be posted, uploaded, linked to, or otherwise made available through the Service.</>,
            <><strong>Subscription</strong>: The services or access to the Service offered on a subscription basis by Trakyz to you.</>,
            <><strong>Third-Party Service</strong>: Any third-party services or content (including data, information, applications, and other products) provided with, or used by, the Service.</>,
            <><strong>User</strong>: The individual accessing or using the Service, or the company or other legal entity on behalf of which such individual is accessing or using the Service.</>
          ]}/>
        </>
      )
    },
    {
      id: 'financial-advice-disclaimer',
      title: '3. Financial Advice Disclaimer',
      content: (
        <>
          <LegalParagraph>
            Trakyz is not a registered financial advisor, broker-dealer, or investment advisor. The information provided through the Service is for informational and educational purposes only and should not be considered financial, investment, tax, or legal advice. Your investment decisions should be based on your own research, risk tolerance, and financial situation.
          </LegalParagraph>
          <LegalParagraph className="mt-2">
            The Service may provide tools to track and analyze your financial data, but these tools are not a substitute for professional financial advice. We recommend consulting with qualified professionals regarding your specific circumstances before making significant financial decisions.
          </LegalParagraph>
        </>
      )
    },
    {
      id: 'user-accounts',
      title: '4. User Accounts',
      content: (
        <>
          <LegalParagraph>
            When you create an account with us, you must provide an email address through one of our authentication methods: Google, X, LinkedIn, GitHub, Apple, Microsoft, or direct email registration. All data associated with your account is fully encrypted for your security.
          </LegalParagraph>
          <LegalParagraph className="mt-2">
            You are responsible for:
          </LegalParagraph>
          <LegalList items={[
            'Safeguarding the password that you use to access the Service;',
            'Any activities or actions under your account, whether your password is with our Service or a third-party authentication service;',
            'Notifying us immediately upon becoming aware of any breach of security or unauthorized use of your account.'
          ]}/>
          <LegalParagraph className="mt-2">
            You may not use as a username the name of another person or entity, or one that is not lawfully available for use, or one that is protected by trademark or other proprietary rights without appropriate authorization. You may not use a username that is offensive, vulgar, or obscene.
          </LegalParagraph>
          <LegalParagraph className="mt-2">
            Trakyz reserves the right to disable any user account at any time, including if you have failed to comply with any of the provisions of these Terms.
          </LegalParagraph>
        </>
      )
    },
    {
      id: 'data-security',
      title: '5. Data Security and Encryption',
      content: (
        <>
          <LegalParagraph>
            We take the security of your data extremely seriously. All data stored in our systems is fully encrypted using industry-standard encryption protocols. We implement comprehensive security measures including:
          </LegalParagraph>
          <LegalList items={[
            'End-to-end encryption for all personal and financial data',
            'Secure authentication through trusted providers (Google, X, LinkedIn, GitHub, Apple, Microsoft)',
            'Regular security audits and penetration testing',
            'Strict access controls and authentication procedures',
            'Continuous monitoring for unauthorized access attempts'
          ]}/>
          <LegalParagraph className="mt-2">
            While we implement robust security measures, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security of your data, but we are committed to protecting your information using industry best practices.
          </LegalParagraph>
        </>
      )
    },
    {
      id: 'subscriptions',
      title: '6. Subscriptions',
      content: (
        <>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mt-4 mb-2">6.1 Subscription Period</h3>
          <LegalParagraph>
            Some parts of the Service may be available only with a paid Subscription. You will be billed in advance on a recurring basis (monthly or annually), depending on the Subscription plan you select.
          </LegalParagraph>
          <LegalParagraph className="mt-2">
            At the end of each period, your Subscription will automatically renew under the same conditions unless you cancel it or Trakyz cancels it.
          </LegalParagraph>
          
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mt-4 mb-2">6.2 Subscription Cancellations</h3>
          <LegalParagraph>
            You may cancel your Subscription renewal either through your account settings page or by contacting our customer support team. The cancellation will take effect at the end of your current Subscription period.
          </LegalParagraph>
          <LegalParagraph className="mt-2">
            You will not receive a refund for the fees you already paid for your current Subscription period, and you will continue to have access to the Service until the end of your current Subscription period.
          </LegalParagraph>
          
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mt-4 mb-2">6.3 Fee Changes</h3>
          <LegalParagraph>
            Trakyz, in its sole discretion, may modify Subscription fees at any time. Any Subscription fee change will become effective at the end of the then-current Subscription period. We will provide reasonable prior notice of any fee changes to give you an opportunity to terminate your Subscription before the change becomes effective.
          </LegalParagraph>
        </>
      )
    },
    {
      id: 'user-data',
      title: '7. User Data',
      content: (
        <>
          <LegalParagraph>
            Our Service allows you to connect external financial accounts to automatically import financial data. When you connect such accounts, you authorize us to access and retrieve your account information on your behalf. However, we do not store your login credentials for these external accounts; this information is securely handled by our trusted third-party data providers.
          </LegalParagraph>
          <LegalParagraph className="mt-2">
            <strong>All data processed and stored in our system is fully encrypted.</strong> We only collect your email address for account identification purposes, and we do not sell, rent, or trade your personal information to third parties under any circumstances.
          </LegalParagraph>
          <LegalParagraph className="mt-2">
            You acknowledge and agree that:
          </LegalParagraph>
          <LegalList items={[
            'You are granting us permission to access your external account data;',
            'Your use of this feature is subject to the terms and conditions of your agreements with your financial institutions;',
            'Your financial institutions may charge fees or limit functionality related to such connections; and',
            'We are not responsible for any acts or omissions by your financial institutions or any third-party data providers.'
          ]}/>
        </>
      )
    },
    {
      id: 'content',
      title: '8. Content',
      content: (
        <>
          <LegalParagraph>
            Our Service allows you to post, link, store, share, and otherwise make available certain information, text, graphics, or other material (&quot;Content&quot;). You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.
          </LegalParagraph>
          <LegalParagraph className="mt-2">
            By posting Content on or through the Service, you represent and warrant that:
          </LegalParagraph>
          <LegalList items={[
            'The Content is yours or you have the right to use it and to grant us the rights and license as provided in these Terms; and',
            'The posting of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights, or any other rights of any person or entity.'
          ]}/>
        </>
      )
    },
    {
      id: 'intellectual-property',
      title: '9. Intellectual Property',
      content: (
        <>
          <LegalParagraph>
            The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of Trakyz and its licensors. The Service is protected by copyright, trademark, and other laws of both the country where Trakyz operates and foreign countries.
          </LegalParagraph>
          <LegalParagraph className="mt-2">
            Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Trakyz.
          </LegalParagraph>
        </>
      )
    },
    {
      id: 'third-party-services',
      title: '10. Third-Party Services',
      content: (
        <>
          <LegalParagraph>
            The Service may contain links to third-party websites or services that are not owned or controlled by Trakyz. Trakyz has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
          </LegalParagraph>
          <LegalParagraph className="mt-2">
            You acknowledge and agree that Trakyz shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or services available on or through any such third-party websites or services.
          </LegalParagraph>
          <LegalParagraph className="mt-2">
            We strongly advise you to read the terms and conditions and privacy policies of any third-party websites or services that you visit or interact with through our Service.
          </LegalParagraph>
        </>
      )
    },
    {
      id: 'termination',
      title: '11. Termination',
      content: (
        <>
          <LegalParagraph>
            We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including but not limited to a breach of these Terms.
          </LegalParagraph>
          <LegalParagraph className="mt-2">
            Upon termination, your right to use the Service will cease immediately. If you wish to terminate your account, you may simply discontinue using the Service or delete your account through the account settings.
          </LegalParagraph>
          <LegalParagraph className="mt-2">
            When you delete your account, we will delete or anonymize your personal information within 30 days, unless longer retention is required by law.
          </LegalParagraph>
        </>
      )
    },
    {
      id: 'limitation-of-liability',
      title: '12. Limitation of Liability',
      content: (
        <>
          <LegalParagraph>
            To the maximum extent permitted by applicable law, in no event shall Trakyz, its directors, employees, partners, agents, suppliers, or affiliates be liable for:
          </LegalParagraph>
          <LegalList items={[
            'Any indirect, incidental, special, consequential, or punitive damages;',
            'Loss of profits, data, use, goodwill, or other intangible losses;',
            'Any unauthorized access to, use of, or alteration of your Content;',
            'Any conduct or content of any third party on the Service;',
            'Any financial decisions made based on information obtained through the Service; or',
            'Any other damages or losses resulting from your use or inability to use the Service, regardless of the theory of liability and even if Trakyz has been advised of the possibility of such damages.'
          ]}/>
          <LegalParagraph className="mt-2">
            Some jurisdictions do not allow the exclusion of certain warranties or the limitation or exclusion of liability for certain types of damages. Accordingly, some of the above limitations may not apply to you. In such jurisdictions, our liability is limited to the greatest extent permitted by law.
          </LegalParagraph>
        </>
      )
    },
    {
      id: 'disclaimer',
      title: '13. Disclaimer',
      content: (
        <>
          <LegalParagraph>
            The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. Trakyz expressly disclaims all warranties of any kind, whether express or implied, including but not limited to:
          </LegalParagraph>
          <LegalList items={[
            'Implied warranties of merchantability, fitness for a particular purpose, and non-infringement;',
            'Any warranties concerning the availability, accuracy, reliability, or content of the Service;',
            'Any warranties that the Service will meet your requirements or be available uninterrupted, timely, secure, or error-free;',
            'Any warranties regarding the accuracy of financial data retrieved from external sources; and',
            'Any warranties that defects in the Service will be corrected.'
          ]}/>
          <LegalParagraph className="mt-2">
            Trakyz does not warrant that the Service is free of viruses or other harmful components. You use the Service at your own risk and discretion.
          </LegalParagraph>
        </>
      )
    },
    {
      id: 'governing-law',
      title: '14. Governing Law',
      content: (
        <>
          <LegalParagraph>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Trakyz operates, without regard to its conflict of law provisions.
          </LegalParagraph>
          <LegalParagraph className="mt-2">
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
          </LegalParagraph>
        </>
      )
    },
    {
      id: 'dispute-resolution',
      title: '15. Dispute Resolution',
      content: (
        <>
          <LegalParagraph>
            If you have any concerns or disputes about the Service, you agree to first try to resolve the dispute informally by contacting us. If a dispute cannot be resolved informally, you and Trakyz agree to resolve any disputes through binding arbitration as follows:
          </LegalParagraph>
          <LegalList items={[
            'The arbitration will be conducted by a neutral arbitrator in accordance with the arbitration rules applicable in the jurisdiction where Trakyz operates;',
            'The arbitration may be conducted in person, through the submission of documents, by phone, or online;',
            'Each party shall bear its own costs of arbitration;',
            'The arbitrator\'s decision shall be final and binding and may be entered as a judgment in any court of competent jurisdiction.'
          ]}/>
          <LegalParagraph className="mt-2">
            To the fullest extent permitted by law, any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action.
          </LegalParagraph>
        </>
      )
    },
    {
      id: 'changes-to-terms',
      title: '16. Changes to These Terms',
      content: (
        <>
          <LegalParagraph>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </LegalParagraph>
          <LegalParagraph className="mt-2">
            By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
          </LegalParagraph>
        </>
      )
    },
    {
      id: 'contact-us',
      title: '17. Contact Us',
      content: (
        <LegalParagraph>
          If you have any questions about these Terms, please contact us at:{' '}
          <Link href="/contact" className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors">
            support@trakyz.com
          </Link>
        </LegalParagraph>
      )
    }
  ];

  return <LegalDocument sections={sections} lastUpdated="March 10, 2025" />;
}