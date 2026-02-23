import React from 'react';
import Layout from '@/components/common/layout/Layout';

const AccessibilityStatementPage: React.FC = () => {
  return (
    <>
      <Layout
        title="Accessibility statement"
        showLoginInformation={false}
        currentPage="accessibility-statement"
        showNavBar={false}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">
              Accessibility statement for Get adult social care data
            </h1>
            <p className="govuk-body">
              This accessibility statement applies to the Get Adult Social Care
              (GASCD) service at{' '}
              <a
                href="https://getadultsocialcaredata.com"
                className="govuk-link"
              >
                https://getadultsocialcaredata.com
              </a>
              .
            </p>

            <h2 className="govuk-heading-m">Using the service</h2>
            <p className="govuk-body">
              {' '}
              This service is run by the Department for Health and Social Care
              (DHSC). We want as many people as possible to be able to use this
              service. For example, that means you should be able to:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                change colours, contrast levels and fonts using browser or
                device settings
              </li>
              <li>
                zoom in up to 400&#37; without the text spilling off the screen
              </li>
              <li>
                navigate most of the website and platform using a keyboard or
                speech recognition software
              </li>
              <li>
                listen to most of the website and platform using a screen reader
                (including the most recent versions of JAWS, NVDA and VoiceOver)
              </li>
            </ul>
            <p className="govuk-body">
              We&apos;ve also made the text as simple as possible to understand.
            </p>
            <p className="govuk-body">
              <a href="https://mcmw.abilitynet.org.uk" className="govuk-link">
                AbilityNet
              </a>{' '}
              has advice on making your device easier to use if you have a
              disability.
            </p>

            <h2 className="govuk-heading-m">How accessible this service is</h2>
            <p className="govuk-body">
              We know that some parts of the service are not yet fully
              accessible:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                There are several issues with the Provision and occupancy topic
                area which assisted technology users may wish to avoid for the
                time being
              </li>
              <li>
                We recommend assisted technology users to use the read mode when
                accessing the sign in page to allow you to avoid issues with the
                cookie messaging
              </li>
            </ul>

            <h2 className="govuk-heading-m">
              Feedback and contact information
            </h2>
            <p className="govuk-body">
              We&apos;re always looking to improve the accessibility of the
              service.
            </p>
            <p className="govuk-body">
              If you find any problems not listed on this page, or think
              we&apos;re not meeting accessibility requirements,{' '}
              <a
                href="mailto:gascd.enquiries@dhsc.gov.uk"
                className="govuk-link"
              >
                contact us
              </a>
              .
            </p>

            <h2 className="govuk-heading-m">Enforcement procedure</h2>
            <p className="govuk-body">
              The Equality and Human Rights Commission (EHRC) is responsible for
              enforcing the Public Sector Bodies (Websites and Mobile
              Applications) (No. 2) Accessibility Regulations 2018 (the
              &apos;accessibility regulations&apos;).
            </p>
            <p className="govuk-body">
              If you&apos;re not happy with how we respond to your complaint,
              contact the{' '}
              <a
                href="https://www.equalityadvisoryservice.com"
                className="govuk-link"
              >
                Equality Advisory and Support Service
              </a>
              , which is run on behalf of{' '}
              <abbr title="Equality and Human Rights Commission">EHRC</abbr>.
            </p>

            <h2 className="govuk-heading-m">
              Technical information about this service&apos;s accessibility
            </h2>
            <p className="govuk-body">
              The <abbr title="Department of Health and Social Care">DHSC</abbr>{' '}
              is committed to making the service accessible, in accordance with
              the Public Sector Bodies (Websites and Mobile Applications) (No.
              2) Accessibility Regulations 2018.
            </p>

            <h2 className="govuk-heading-m">Compliance status</h2>
            <p className="govuk-body">
              The Digital Accessibility Centre (DAC) tested the{' '}
              <abbr title="{{serviceName}}">GASCD</abbr> service on 03 February
              2026.
            </p>
            <p className="govuk-body">
              This website is not compliant with the{' '}
              <a href="https://www.w3.org/TR/WCAG22/" className="govuk-link">
                Web Content Accessibility Guidelines version 2.2
              </a>{' '}
              AA standard. The non-compliances are listed below.
            </p>

            <h2 className="govuk-heading-m">Non-accessible content</h2>
            <p className="govuk-body">
              The content listed below is non-accessible for the following
              reasons:
            </p>

            <h3 className="govuk-heading-s">
              Non-compliance with the accessibility regulations
            </h3>
            <ol className="govuk-list govuk-list--number">
              <li>
                In the provision and occupancy topic a filter box where only one
                filter can be applied currently gives screen reader users
                unnecessary list information. This fails WCAG 2.2 success
                criterion 1.3.1 (Info and Relationships).
              </li>
              <li>
                In the provision and occupancy topic there is an incorrect
                heading structure causing confusion in some filter boxes for
                screen reader users. This fails WCAG 2.2 success criterion 1.3.1
                (Info and Relationships).
              </li>
              <li>
                On the location select page, there is currently incomplete error
                messaging when users try to submit with mandatory fields left
                empty. This fails WCAG 2.2 success criterion 3.3.1 (Error
                Identification).
              </li>
              <li>
                On the home page, skip links may not go to the start of page
                content and will move to the middle of the page instead. This
                affects some assistive technologies. This fails WCAG 2.2 success
                criterion 2.4.1 (Bypass Blocks).
              </li>
              <li>
                In the provision and occupancy topic a filter button &apos;show
                bed numbers&apos; currently has the wrong voice command attached
                to it. This affects voice activation users. This fails WCAG 2.2
                success criterion 2.5.3 (Label in Name).
              </li>
              <li>
                In the provision and occupancy topic the &apos;bed type&apos;
                search feature presented has been programmed incorrectly. Some
                search inputs have duplicate ids meaning that some voice
                activation software cannot select all options. Search results
                may also be presented in a nested form to screen reader users.
                There are some duplicate ids between filter functions on the
                same page which may lead to unexpected filtering results. The
                clear all button within some search features may result in
                unexpected change of focus on the page making keyboard
                navigation difficult. This is affecting a variety of assistive
                technology users. This fails WCAG 2.2 success criterion 1.3.1
                (Info and Relationships), 4.1.2 (Name, Role, Value), 2.5.3
                (Label in Name) and 2.4.3 (Focus Order).
              </li>
              <li>
                In the Provision and occupancy topic, there is an html error
                which may cause some screen readers to display incomplete
                information. This fails WCAG 2.2 success criterion 4.1.2 (Name,
                Role, Value).
              </li>
              <li>
                In the provision and occupancy topic the trend graph currently
                does not have an alternative version and does not work with
                screen readers. This graph also currently has restricted
                navigation when using a keyboard. This fails WCAG 2.2 success
                criterion 1.1.1 (Non-text Content), 1.3.1 (Info and
                Relationships), 2.1.1 (Keyboard) and 4.1.2 (Name, Role, Value).
              </li>
              <li>
                In the provision and occupancy topic there are currently some
                graphs using non-compliant colour contrast and there is no
                alternative way of viewing the data. This fails WCAG 2.2 success
                criterion 1.4.1 (Use of Colour).
              </li>
              <li>
                At the top of the home page the blue link text &apos;give your
                feedback&apos; against the pale blue background fails to meet
                the minimum text contrast requirements making it difficult for
                some users to identify the link text. This fails WCAG 2.2
                success criterion 1.4.3 (Contrast).
              </li>
              <li>
                In the provision and occupancy topic text within the figure 1
                graph does not meet minimum text contrast requirements which may
                cause issues for some users. This fails WCAG 2.2 success
                criterion 1.4.3 (Contrast).
              </li>
              <li>
                In the provision and occupancy topic some graph content does not
                meet the minimum non text contrast requirements which may cause
                issues for some users. This fails WCAG 2.2 success criterion
                1.4.11 (Non-text Contrast).
              </li>
              <li>
                In the provision and occupancy topic some table captions require
                unexpected scrolling to read them when displayed in 320 x 700
                reflow resolution. This may cause difficulties for some users.
                This fails WCAG 2.2 success criterion 1.4.10 (Reflow).
              </li>
              <li>
                In the provision and occupancy topic a text box on a graph
                currently does not display correctly for users with additional
                text spacing turned on. This fails WCAG 2.2 success criterion
                1.4.12 (Text Spacing).
              </li>
              <li>
                In the provision and occupancy topic a graph currently has
                content that displays when hovered over with a mouse cursor but
                does not disappear when cursor is moved. This may obscure
                information and cause navigation issues for some users. This
                fails WCAG 2.2 success criterion 1.4.13 (Content on Hover or
                Focus).
              </li>
            </ol>
            <p className="govuk-body">
              We plan to resolve this by the 1 July 2026.
            </p>

            <h2 className="govuk-heading-m">
              Preparation of this accessibility statement
            </h2>
            <p className="govuk-body">
              This statement was prepared on 20 February 2026.
            </p>
            <p className="govuk-body">
              The service was last tested on 3 February 2026. The test was
              carried out by the Digital Accessibility Centre (DAC).
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default AccessibilityStatementPage;
