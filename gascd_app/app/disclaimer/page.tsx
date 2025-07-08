import React from 'react';
import Layout from '@/components/common/layout/Layout';

const DisclaimerPage: React.FC = () => {
  return (
    <>
      <Layout showLoginInformation={false} 
        currentPage='disclaimer'
        showNavBar={false}>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">
                Disclaimer
            </h1>
            <p className="govuk-body">Get adult social care data is in a beta testing phase and is being shared with users for the purposes of validating its usefulness and identifying improvements to the service. The information in Get adult social care data does not constitute advice. While we make every effort to keep Get adult social care data up to date, we do not provide any guarantees, conditions, or warranties that the information will be:</p>
            <ul className="govuk-list govuk-list--bullet">
              <li>current</li>
              <li>secure</li>
              <li>accurate</li>
              <li>complete</li>
              <li>free from bugs or viruses</li>
            </ul>
            <p className="govuk-body">We are not liable for any loss or damage that may come from using Get adult social care data. This includes:</p>
            <ul className="govuk-list govuk-list--bullet">
              <li>any direct, indirect, or consequential losses</li>
              <li>any loss or damage caused by civil wrongs (including negligence), breach of contract or otherwise</li>
              <li>the use of Get adult social care data and any websites that are linked to or from it</li>
              <li>the inability to use Get adult social care data and any websites that are linked to or from it</li>
            </ul>
            <p className="govuk-body">This applies whether or not the loss or damage was foreseeable, arose in the normal course of things, or you advised us that it might happen.</p>
            <p className="govuk-body">This includes (but is not limited to) the loss of your:</p>
            <ul className="govuk-list govuk-list--bullet">
              <li>income or revenue</li>
              <li>salary, benefits or other payments</li>
              <li>business</li>
              <li>profits or contracts</li>
              <li>opportunity</li>
              <li>anticipated savings</li>
              <li>data</li>
              <li>goodwill or reputation</li>
              <li>tangible property</li>
              <li>intangible property, including loss, corruption or damage to data or any computer system</li>
              <li>wasted management or office time</li>
            </ul>
            <p className="govuk-body">Information from Get adult social care data is not to be published, copied, shared with third parties (save for professional and specialist advisers) or otherwise reproduced nor used for commercial purposes.</p>
            <h2 className="govuk-heading-m">Virus protection</h2>
            <p className="govuk-body">We take every effort to protect this service from viruses. You must ensure the way you use this service does not expose you to the risk of viruses or other malicious interference that can damage your computer system.</p>
            <p className="govuk-body">We are not responsible for any loss or damage to your computer system that might come from using this service.</p>
            <h2 className="govuk-heading-m">Hacking and other offences</h2>
            <p className="govuk-body">You must not introduce viruses, trojans, or any malicious or technologically harmful material to this service. You must not try to gain unauthorised access to this service, its server or any databases connected to it.</p>
            <p className="govuk-body">We will report any attacks or attempts to gain unauthorised access to the relevant law enforcement authorities and share information about you with them.</p>
          </div>

        </div>
      </Layout>
    </>
  );
};

export default DisclaimerPage;