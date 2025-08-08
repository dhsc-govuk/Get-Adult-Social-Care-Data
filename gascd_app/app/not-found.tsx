import Layout from '@/components/common/layout/Layout';

function NotFound() {
  return (
    <Layout
      title="Page not found"
      showLoginInformation={false}
      currentPage="not-found"
      showNavBar={true}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-l">Page not found</h1>
          <p className="govuk-body">
            If you typed the web address, check it is correct.
          </p>
          <p className="govuk-body">
            If you pasted the web address, check you copied the entire address.
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default NotFound;
