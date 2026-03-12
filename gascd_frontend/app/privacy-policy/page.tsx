import React from 'react';
import Layout from '@/components/common/layout/Layout';

const PrivacyPage = () => {
  return (
    <>
      <Layout
        title="Privacy notice"
        showLoginInformation={false}
        currentPage="privacy-policy"
        showNavBar={false}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Our privacy notice</h1>
            <p className="govuk-body">Last updated 19 February 2026</p>
            <p className="govuk-body">
              Your privacy is important to us. This privacy policy covers what
              we collect and how we use it.
            </p>

            <h2 className="govuk-heading-m">Who we are</h2>
            <p className="govuk-body">
              Get Adult Social Care Data (GASCD) is a new service provided by
              the Department for Health and Social Care as part of the Data
              Access Project. The GASCD service gives key stakeholders in the
              adult social care sector access to adult social care data in one
              place.
            </p>

            <h2 className="govuk-heading-m">Data controller</h2>
            <p className="govuk-body">
              The Department of Health and Social Care (DHSC) is the data
              controller for the GASCD service.
            </p>

            <h2 className="govuk-heading-m">What data we collect from you</h2>
            <p className="govuk-body">
              The personal data we collect from you when you create a GASCD
              service account includes:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>your name</li>
              <li>your CQC registered or GOV.UK email address</li>
              <li>name and location of your employer or organisation.</li>
              <li>the IP address you use to access the GASCD service</li>
            </ul>

            <h2 className="govuk-heading-m">
              What data we collect from other sources
            </h2>
            <p className="govuk-body">
              We work closely with trusted partners such as the Care Quality
              Commission (CQC) who provide us with information on:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>name of registered CQC nominated individuals</li>
              <li>email address of CQC nominated individuals</li>
              <li>
                name and location of the CQC registered care provider
                organisation.
              </li>
            </ul>
            <p className="govuk-body">
              We use this information for verification and pre-authorisation to
              allow access to the data the DHSC provides through its free Get
              Adult Social Care Data service. To find out more about how the CQC
              shares your data with us read the{' '}
              <a href="https://www.cqc.org.uk/about-us/our-policies/privacy-statement">
                CQC&apos;s privacy statement
              </a>
              .
            </p>

            <h2 className="govuk-heading-m">
              When you subscribe to our mailing list{' '}
            </h2>
            <p className="govuk-body">
              If you subscribe to the GASCD service mailing list, we&apos;ll
              collect your:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>email address</li>
              <li>organisation</li>
            </ul>
            <p className="govuk-body">
              We use the GOV.UK Notify platform to send updates and requests.
              This involves us sharing your email address with the platform
              provider, Government Digital Service (GDS) as the data processor.
              For more information, you can read the{' '}
              <a href="https://www.notifications.service.gov.uk/privacy">
                GOV.UK Notify privacy notice
              </a>
              .
            </p>

            <h2 className="govuk-heading-m">When you contact us</h2>
            <p className="govuk-body">
              If you contact us about the GASCD service, we&apos;ll collect your
              name, email address and any other personal information you choose
              to include in your message.
            </p>

            <h2 className="govuk-heading-m">Why we need your data</h2>
            <p className="govuk-body">We collect your personal data to:</p>
            <ul className="govuk-list govuk-list--bullet">
              <li>allow you to access the GASCD service</li>
              <li>understand who is using the service</li>
              <li>gather feedback to improve our services</li>
              <li>
                respond to any feedback you send us, if you$&apos;ve asked us to
              </li>
              <li>send email alerts to users who request them</li>
              <li>monitor use of the service to identify security threats</li>
              <li>understand who is using the service</li>
              <li>
                monitor the performance of the service to identify
                inefficiencies and errors
              </li>
              <li>
                analyse the information we collect using Google Analytics to see
                how you use the GASCD service and to see how well it performs on
                your device.
              </li>
            </ul>
            <p className="govuk-body">We do this to help:</p>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                make sure the GASCD service is meeting the needs of our intended
                users
              </li>
              <li>make performance improvements to the service</li>
            </ul>

            <h2 className="govuk-heading-m">
              Our legal basis for processing your data
            </h2>
            <p className="govuk-body">
              The legal basis for processing your personal data is Public
              Interest.
            </p>
            <p className="govuk-body">
              The legal basis for processing data collected with Google
              Analytics and government digital services is your consent. For
              more information you can read about the{' '}
              <a href="/cookies">cookies we use</a>.
            </p>

            <h2 className="govuk-heading-m">What we do with your data </h2>
            <p className="govuk-body">
              We use your data to check that you are allowed to access the GASCD
              service and to carry out the purposes mentioned earlier.
            </p>
            <p className="govuk-body">We will not:</p>
            <ul className="govuk-list govuk-list--bullet">
              <li>sell or rent your data to third parties</li>
              <li>share your data with third parties for marketing purposes</li>
            </ul>
            <p className="govuk-body">
              We will share your data if we are required to do so by law – for
              example, by court order, or to prevent fraud or other crime.
            </p>

            <h2 className="govuk-heading-m">How long we keep your data </h2>
            <p className="govuk-body">
              we&apos;ll keep your personal data for as long as you have a GASCD
              service account.
            </p>
            <p className="govuk-body">
              We review accounts every six months. If you have not logged into
              your account for more than a year, your account will be deleted.
            </p>
            <p className="govuk-body">
              When you ask us to close your account, we will delete your data
              within 1 year.
            </p>
            <p className="govuk-body">
              When we close your account, we&apos;ll delete your:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>name</li>
              <li>name and location of your employer or organisation.</li>
            </ul>
            <p className="govuk-body">
              So that we can carry out security audits, we&apos;ll keep your
              email address and IP addresses for 1 year before we delete them.
            </p>

            <h2 className="govuk-heading-m">
              Where your data is processed and stored{' '}
            </h2>
            <p className="govuk-body">
              We design, build and run our systems to make sure that your data
              is as safe as possible at any stage, both while it&apos;s
              processed and when it&apos;s stored.
            </p>
            <p className="govuk-body">
              Your personal data will be processed in the UK only.{' '}
            </p>

            <h2 className="govuk-heading-m">
              How we protect your data and keep it secure{' '}
            </h2>
            <p className="govuk-body">
              We are committed to doing all that we can to keep your data
              secure. To prevent unauthorised access or disclosure we have put
              in place technical and organisational procedures to secure the
              data we collect about you – for example, we protect your data
              using varying levels of encryption. We also make sure that any
              third parties that we deal with have an obligation to keep all
              personal data they process on our behalf secure.
            </p>

            <h2 className="govuk-heading-m">What are your rights </h2>
            <p className="govuk-body">You have the right to:</p>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                get copies of information - individuals have the right to ask
                for a copy of any information about them that is used
              </li>
              <li>
                limit how the information is used - individuals have the right
                to ask for any of the information held about them to be
                restricted - for example, if they think inaccurate information
                is being used
              </li>
              <li>
                get information corrected - individuals have the right to ask
                for any information held about them that they think is
                inaccurate to be corrected - this is not an absolute right under
                UK GDPR and will be assessed on a case-by-case basis
              </li>
              <li>
                object to the information being used - individuals can ask for
                any information held about them to not be used - this is not an
                absolute right under UK GDPR and will be assessed on a
                case-by-case basis
              </li>
              <li>
                get information deleted - this is not an absolute right under UK
                GDPR and will be assessed on a case-by-case basis
              </li>
            </ul>
            <p className="govuk-body">
              If you have any of these requests, get in contact with our Data
              Protection Officer, you can find their contact details below.
            </p>

            <h2 className="govuk-heading-m">Questions or complaints </h2>
            <p className="govuk-body">
              Contact the DHSC&apos;s Data Protection Team if you either:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>have questions about anything in this document</li>
              <li>
                think that your personal data has been misused or mishandled
              </li>
            </ul>
            <p className="govuk-body">DHSC&apos;s Data Protection Officer </p>
            <p className="govuk-body">
              Email:{' '}
              <a
                href="mailto:data_protection@dhsc.gov.uk"
                className="govuk-link govuk-link--no-underline"
              >
                data_protection@dhsc.gov.uk
              </a>
            </p>
            <p className="govuk-body">Post:</p>
            <p className="govuk-body">
              Data Protection Officer
              <br />
              1st Floor North
              <br />
              39 Victoria Street
              <br />
              London
              <br />
              SW1H 0EU
            </p>
            <p className="govuk-body">
              Anyone who is still not satisfied can complain to the Information
              Commissioner&apos;s Office. Their website address is{' '}
              <a href="https://ico.org.uk" className="govuk-link">
                www.ico.org.uk
              </a>{' '}
              and their postal address is:
            </p>
            <p className="govuk-body">
              Information Commissioner&apos;s Office
              <br />
              Wycliffe House
              <br />
              Water Lane
              <br />
              Wilmslow
              <br />
              Cheshire
              <br />
              SK9 5AF
            </p>

            <h2 className="govuk-heading-m">Changes to this notice</h2>
            <p className="govuk-body">
              We may modify or amend this privacy notice at our discretion at
              any time. When we make changes to this notice, we will amend the
              last modified date at the top of this page. Any modification or
              amendment to this privacy notice will be applied to you and your
              data as of that revision date. We encourage you to periodically
              review this privacy notice to be informed about how we are
              protecting your data.
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default PrivacyPage;
