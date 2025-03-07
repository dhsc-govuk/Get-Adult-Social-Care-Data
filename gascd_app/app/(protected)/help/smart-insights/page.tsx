'use client';
import Layout from '@/components/common/layout/Layout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const SmartInsightsPage: React.FC = () => {
  const router = useRouter();
  return (
    <Layout showLoginInformation={false} currentPage={'smart insights'}>
      <Link className="govuk-back-link" href="/metric/total-beds">
        Back
      </Link>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-l">
            About smart insights (experimental)
          </h1>

          <p className="govuk-body-l">
            Learn more about smart insights and how they can help you uncover useful patterns and trends in the data.
          </p>

          <h3 className="govuk-heading-m">Overview</h3>

          <p className="govuk-body">
            Smart insights is a feature that uses artificial intelligence (AI) to help analyse data and identify key trends and patterns.
          </p>
          <p className="govuk-body">
            This is designed to support - but not replace - your own analysis of the data.            
          </p>
          <p className="govuk-body">
            As it&apos;s experimental, there are some limitations to keep in mind.
          </p>

          <h3 className="govuk-heading-m">How it works</h3>

          <p className="govuk-body">
            Smart insights uses AI models trained on large datasets to identify relationships within the data.
            </p>

          <p className="govuk-body">
            These models generate summaries and interpretations designed to simplify complex information and help you uncover useful insights.
            </p>

          <h3 className="govuk-heading-m">Limitations</h3>

          <p className="govuk-body">
            AI-generated insights are generally reliable, but may not always be complete, reflect the most recent policy changes, or capture important context.
          </p>

          <p className="govuk-body">
            Sometimes, AI might misinterpret data, producing insights that do not fully align with the underlying trends or patterns.
          </p>

          <h3 className="govuk-heading-m">Best practices</h3>

          <p className="govuk-body">
            Always cross-check the AI-generated insights with other data sources to get a fuller picture.
          </p>

          <p className="govuk-body">
            Review the insights carefully, and verify they are correct and appropriate for your needs before sharing or using them.
          </p>

          <p className="govuk-body">
            To help us refine and improve this feature, please 
            <a href="" className="govuk-link">share your feedback</a>.
          </p>

          <hr className="govuk-section-break govuk-section-break--xl govuk-section-break--visible"/>
          
        </div>
      </div>
    </Layout>
  );
};

export default SmartInsightsPage;
