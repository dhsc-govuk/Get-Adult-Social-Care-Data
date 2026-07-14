import { withBasePath } from '@/lib/basePath';
import React from 'react';

const TermsOfUse: React.FC = () => {
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <h1 className="govuk-heading-xl">Terms of use </h1>
        <p className="govuk-body">First published: 19 February 2026</p>
        <p className="govuk-body">Last updated: 18 June 2026</p>
        <p className="govuk-body">
          This page explains the Get Adult Social Care Data{' '}
          <abbr title="Get Adult Social Care Data">(GASCD)</abbr> service terms
          of use. You will be asked to agree to these terms of use when creating
          a <abbr title="Get Adult Social Care Data">GASCD</abbr> account.
        </p>

        <h2 className="govuk-heading-m">About the service</h2>
        <p className="govuk-body">
          Get Adult Social Care Data{' '}
          <abbr title="Get Adult Social Care Data">(GASCD)</abbr>is a new
          service provided by the Department for Health and Social Care as part
          of the Data Access Project. The{' '}
          <abbr title="Get Adult Social Care Data">GASCD</abbr> service gives
          CQC-registered care providers and local authority officers in the
          adult social care sector access to reliable, useful and secure adult
          social care data in one place, for internal management purposes.
        </p>
        <p className="govuk-body">
          This service is a pre-release version (&apos;Beta&apos;) and is
          provided &apos;as is&apos; without any warranty of any kind. During
          the beta phase we test and improve our services. The testing is
          designed to uncover service issues and improve service quality,
          usability, and availability by inviting users to experience new
          features of a pre-release service, to help us deliver a satisfying
          product for the official release. We encourage users to test the
          service and provide feedback.
        </p>
        <p className="govuk-body">
          To help improve this service, please provide any feedback on accuracy,
          usability, or missing features using{' '}
          <a
            href="https://forms.office.com/pages/responsepage.aspx?id=MIwnYaiRMUyMH-9N6Jc6HCTDIbGmpYFAqGjg7fX8zI9URDFZRFE1N0tBOE1NMFhCV08zN0hTN0lKMyQlQCN0PWcu&route=shorturl"
            className="govuk-link"
            rel="noreferrer noopener"
            target="_blank"
          >
            the feedback form embedded in the service
          </a>
          . Your insights help identify strengths and weaknesses to improve the
          user experience. Alternatively, you can email our team on{' '}
          <a
            href="mailto:getadultsocialcaredata.team@dhsc.gov.uk"
            className="govuk-link govuk-link--no-underline"
          >
            GetAdultSocialCareData.team@dhsc.gov.uk
          </a>
          .
        </p>
        <p className="govuk-body">
          We update and expand the{' '}
          <abbr title="Get Adult Social Care Data">GASCD</abbr> service
          regularly based on feedback and user research. We can change or remove
          content at any time without notice.
        </p>
        <h2 className="govuk-heading-m">
          Using the <abbr title="Get Adult Social Care Data">GASCD</abbr>{' '}
          service
        </h2>
        <p className="govuk-body">
          You agree to keep your{' '}
          <abbr title="Get Adult Social Care Data">GASCD</abbr> sign in details
          secure and not share them with anyone, including other colleagues in
          your organisation.
        </p>
        <p className="govuk-body">
          You agree to use data insight from the{' '}
          <abbr title="Get Adult Social Care Data">GASCD</abbr> service only for
          internal operational management purposes. This means that you agree
          not to share this insight with anyone in your organisation who does
          not have a rightful purpose to use it (ie for internal operational
          management purposes).
        </p>

        <p className="govuk-body">
          You agree to: (i) keep all shared data secure; (ii) use the data
          solely for the agreed purposes; and (iii) delete all data upon
          termination. Confidentiality obligations do not apply to data that is
          already public and/or required to be disclosed by law.
        </p>
        <p className="govuk-body">
          Unless otherwise indicated, the data insight is not provided for you
          to use in public documents. If you would like to make any insight from{' '}
          <abbr title="Get Adult Social Care Data">GASCD</abbr> available to the
          public, please contact DHSC first on{' '}
          <a
            href="mailto:getadultsocialcaredata.team@dhsc.gov.uk"
            className="govuk-link govuk-link--no-underline"
          >
            GetAdultSocialCareData.team@dhsc.gov.uk
          </a>
          , to check on permissions to publish.
        </p>
        <p className="govuk-body">
          You must also use the service in a way that does not infringe the
          rights of, or restrict or inhibit the use and enjoyment of, this
          service by anyone else.
        </p>
        <p className="govuk-body">
          We retain all right, title, and interest in and to the Software,
          including all copyrights, patents, trade secrets, and other
          intellectual property rights. The Software is licensed, not sold, to
          you. You agree not to copy, modify, reverse engineer, or claim
          ownership of our Software, or use it to create derivative works. All
          rights not expressly granted are reserved by us.
        </p>

        <h2 className="govuk-heading-m">GOV.UK One Login</h2>
        <p className="govuk-body">
          New users registering for a Get Adult Social Care Data service account
          will be asked to sign-up using GOV.UK One Login.
        </p>
        <p className="govuk-body">
          GOV.UK One Login is a new way of{' '}
          <a
            href="https://www.gov.uk/using-your-gov-uk-one-login/services"
            className="govuk-link"
            rel="noreferrer noopener"
            target="_blank"
          >
            signing in to government services
          </a>
          . It provides a simple way for you to sign in and prove your identity
          using an email address and password.
        </p>
        <p className="govuk-body">
          Over time it will replace all other sign in routes including
          Government Gateway that many customers and businesses currently use.
        </p>

        <h2 className="govuk-heading-m">Disclaimer</h2>
        <p className="govuk-body">
          The information in{' '}
          <abbr title="Get Adult Social Care Data">GASCD</abbr> offers local,
          regional, and national data insight based on sharing data and combined
          data from third party sources to support internal operational
          management purposes. This does not constitute advice or publication of
          metrics.
        </p>

        <p className="govuk-body">
          Rigorous quality control processes are applied, but while we make
          every effort to maintain high data quality and to access the latest
          available data from each data source, the data we use is provided by
          other data owners and may be subject to change after we have sourced
          it, or inaccuracies.
        </p>
        <p className="govuk-body">
          To maximise clarity and transparency, we explain the timeliness,
          definitions and sources of the data insight shared through{' '}
          <abbr title="Get Adult Social Care Data">GASCD</abbr>. However, we
          cannot be held responsible for any inaccuracies in the information
          provided. We are not responsible for any data loss, system damages, or
          consequences resulting from the use of this service. We recommend
          independently verifying any information.
        </p>
        <p className="govuk-body">
          While we strive to maintain a secure environment and have taken all
          reasonable precautions to ensure no viruses are present on our
          service, we cannot accept responsibility for any loss or damage
          arising from the use of this system.
        </p>
        <p className="govuk-body">
          Any attempt to breach this service or introduce malware will result in
          legal action and reporting to authorities.
        </p>
        <p className="govuk-body">
          We reserve the right to suspend or terminate the Beta Programme, or
          individual user access to the services, at any time, with or without
          cause, and without prior notice or liability to you. Upon termination,
          your right to use the service immediately ceases, and we may delete or
          restrict access to any associated user data.
        </p>
        <h2 className="govuk-heading-m">Emails from us to you</h2>
        <p className="govuk-body">
          From time to time, we may need to send you service emails; these will
          be operational communications or otherwise related to the service eg.
          opportunities to share your views on the service. They will never
          include marketing content. By signing up for a{' '}
          <abbr title="Get Adult Social Care Data">GASCD</abbr> account, you
          consent to receiving these emails, which will be sent via GOV.UK
          Notify. For further information read{' '}
          <a
            href="https://www.notifications.service.gov.uk/privacy"
            className="govuk-link"
            rel="noreferrer noopener"
            target="_blank"
          >
            GOV.UK Notify&apos;s privacy notice
          </a>
          .
        </p>
        <h2 className="govuk-heading-m">
          Information about you and your visits to the{' '}
          <abbr title="Get Adult Social Care Data">GASCD</abbr> service
        </h2>
        <p className="govuk-body">
          We collect information about you in accordance with our{' '}
          <a
            href={withBasePath('/privacy-policy')}
            className="govuk-link"
            rel="noreferrer noopener"
            target="_blank"
          >
            privacy policy
          </a>{' '}
          and our{' '}
          <a
            href={withBasePath('/cookies')}
            className="govuk-link"
            rel="noreferrer noopener"
            target="_blank"
          >
            cookie policy
          </a>
          . By using the <abbr title="Get Adult Social Care Data">GASCD</abbr>{' '}
          service, you agree to us collecting this information and confirm that
          any data you provide is accurate.
        </p>
        <h2 className="govuk-heading-m">
          Linking from the <abbr title="Get Adult Social Care Data">GASCD</abbr>{' '}
          service{' '}
        </h2>
        <p className="govuk-body">
          The GASCD service links to websites that are managed by other
          government departments and agencies, service providers or other
          organisations. We don&apos;t have any control over the content on
          these websites.
        </p>
      </div>
    </div>
  );
};

export default TermsOfUse;
