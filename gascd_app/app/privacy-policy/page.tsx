import React from 'react';
import Layout from '@/components/common/layout/Layout';

const PrivacyPage = () => {
  return (
    <>
      <Layout
        title="Privacy notice"
        showLoginInformation={false}
        currentPage="disclaimer"
        showNavBar={false}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Privacy notice</h1>

            <h2 className="govuk-heading-m">Summary of initiative or policy</h2>
            <p className="govuk-body">
              The Data Access Project will design, develop and deliver a new
              digital service called Get adult social care data to improve
              access to adult social care data for key stakeholders such as care
              providers, local authorities, academic researchers and government
              analysts. The aim of the service is to help you make better
              strategic decisions to improve care outcomes.
            </p>
            <p className="govuk-body">
              The service will process information drawn from existing datasets
              to show ready-made analytical insight on one place on GOV.UK and
              provide easy access to the raw data held on different sites.
            </p>
            <p className="govuk-body">
              To ensure that users of the service can only access information
              that you are legally allowed to see under current data sharing
              agreements, you will need to apply for a user account. To create
              and maintain the account, we will collect and store some personal
              information. This information will be submitted by you, the user
              of the service.
            </p>

            <h2 className="govuk-heading-m">Data controller</h2>
            <p className="govuk-body">
              The Department of Health and Social Care (DHSC) is the data
              controller for the Get adult social care data service.
            </p>

            <h2 className="govuk-heading-m">What personal data we collect</h2>
            <p className="govuk-body">
              The personal data we collect from you includes:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>your name</li>
              <li>your email address</li>
              <li>the name and location of your employer or organisation</li>
              <li>
                any questions, queries or feedback you share, including your
                email address if you contact us via email
              </li>
              <li>
                your Internet Protocol (IP) address, and details of which
                version of web browser you used
              </li>
              <li>
                information on how you use the service, using cookies and page
                tagging techniques
              </li>
            </ul>
            <p className="govuk-body">
              When you provide your consent, we use{' '}
              <a
                href="https://azure.microsoft.com/en-us/products/monitor"
                className="govuk-link"
              >
                Azure App Insights
              </a>{' '}
              cookies to collect information about how you use the service. This
              includes IP addresses.
            </p>
            <p className="govuk-body">
              Azure App Insights processes information about:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>the pages you visit in the service</li>
              <li>how long you spend on each page</li>
              <li>how you got to the service</li>
              <li>what you click on while you’re using the service</li>
            </ul>

            <h2 className="govuk-heading-m">How we use your data (purposes)</h2>
            <p className="govuk-body">
              We collect your personal information directly from you (via
              email). We save this data in a spreadsheet and use it to create
              your user account and manage your access to Get adult social care
              data.{' '}
            </p>
            <p className="govuk-body">
              We also use your personal information for data analysis, to
              understand user demographics of Get adult social care data.
            </p>

            <h2 className="govuk-heading-m">
              Legal basis for processing personal data
            </h2>
            <p className="govuk-body">
              Under Article 6 of the United Kingdom General Data Protection
              Regulation (UK GDPR), the lawful basis we rely on for processing
              personal data is:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                (e) the processing is necessary to perform a task or function in
                the public interest or for our official functions and the task
                or function has a clear basis in law
              </li>
            </ul>

            <h2 className="govuk-heading-m">
              Data processors and other recipients of personal data
            </h2>
            <p className="govuk-body">
              We share your personal information with our technical supplier who
              is approved by{' '}
              <abbr title="Department of Health and Social Care">DHSC</abbr> and
              is bound by data protection and security obligations. The supplier
              uses this information to create user accounts which will allow
              access to the Get adult social care data service.
            </p>

            <h2 className="govuk-heading-m">
              International data transfers and storage locations
            </h2>
            <p className="govuk-body">
              We will process your personal information in the UK. We will not
              transfer your data outside of the UK.
            </p>

            <h2 className="govuk-heading-m">Retention and disposal policy</h2>
            <p className="govuk-body">
              We keep your data for up to one year after your last sign-in. We
              review accounts every 6 months. If you have not signed in during
              the past year, your account and data will be deleted.
            </p>

            <h2 className="govuk-heading-m">How we keep your data secure</h2>
            <p className="govuk-body">
              We receive your data via an email inbox which is only accessible
              by individuals working on Get adult social care data.
            </p>
            <p className="govuk-body">
              We save your personal information in an Excel spreadsheet which
              has restricted access; this means that only our technical supplier
              and <abbr title="Department of Health and Social Care">DHSC</abbr>{' '}
              employees working on Get adult social care data are able to access
              it.{' '}
            </p>

            <h2 className="govuk-heading-m">Your rights as a data subject</h2>
            <p className="govuk-body">
              By law, data subjects have a number of rights, and this processing
              does not take away or reduce these rights under the UK General
              Data Protection Regulation and the UK Data Protection Act 2018.
            </p>
            <p className="govuk-body">These rights are:</p>
            <ul className="govuk-list govuk-list--number">
              <li>
                The right to get copies of information &ndash; individuals have
                the right to ask for a copy of any information about them that
                is used.
              </li>
              <li>
                The right to get information corrected &ndash; individuals have
                the right to ask for any information held about them that they
                think is inaccurate, to be corrected.
              </li>
              <li>
                The right to limit how the information is used &ndash;
                individuals have the right to ask for any of the information
                held about them to be restricted, for example, if they think
                inaccurate information is being used.
              </li>
              <li>
                The right to object to the information being used &ndash;
                individuals can ask for any information held about them to not
                be used. However, this is not an absolute right, and continued
                use of the information may be necessary, with individuals being
                advised if this is the case.
              </li>
              <li>
                The right to get information deleted &ndash; this is not an
                absolute right, and continued use of the information may be
                necessary, with individuals being advised if this is the case.
              </li>
            </ul>

            <h2 className="govuk-heading-m">Comments or complaints</h2>
            <p className="govuk-body">
              Anyone unhappy or wishing to complain about how personal data is
              used as part of this programme should contact{' '}
              <abbr title="Department of Health and Social Care">DHSC</abbr>
              &apos;s Data Protection Officer:
            </p>
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

            <h2 className="govuk-heading-m">
              Automated decision making or profiling
            </h2>
            <p className="govuk-body">
              No decision will be made about individuals solely based on
              automated decision making (where a decision is taken about them
              using an electronic system without human involvement) which has a
              significant impact on them.
            </p>

            <h2 className="govuk-heading-m">Changes to this policy</h2>
            <p className="govuk-body">
              This privacy notice is kept under regular review. This privacy
              notice was last updated on 13 June 2025.
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default PrivacyPage;
