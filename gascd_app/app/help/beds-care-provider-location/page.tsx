import Layout from "@/components/common/layout/Layout";

const BedsCareProviderLocations: React.FC = () => {
	return (
		<Layout showLoginInformation={false} currentPage={""}>
			<div className="govuk-grid-row">
				<div className="govuk-grid-column-two-thirds">

					<h1 className="govuk-heading-l">
						Indicator definition and supporting information: number of adult social care beds in care provider location
					</h1>

					<p className="govuk-body-l">Find detailed information about this indicator.</p>

					<table className="govuk-table">
						<thead className="govuk-table__head">
							<tr className="govuk-table__row">
								<th scope="row" className="govuk-table__header govuk-!-width-one-third">What this measures</th>
								<td className="govuk-table__cell">The total number of adult social care beds in a specific care provider location.</td>
							</tr>
						</thead>
						<tbody className="govuk-table__body">
							<tr className="govuk-table__row">
								<th scope="row" className="govuk-table__header">Source</th>
								<td className="govuk-table__cell"><a href="https://www.necsu.nhs.uk/digital-applications/capacity-tracker/" className="govuk-link" target="_blank">Capacity Tracker (opens in new tab)</a></td>
							</tr>
							<tr className="govuk-table__row">
								<th scope="row" className="govuk-table__header">Data correct as of</th>
								<td className="govuk-table__cell">[Generated automatically]</td>
							</tr>
							<tr className="govuk-table__row">
								<th scope="row" className="govuk-table__header">Update frequency</th>
								<td className="govuk-table__cell">Daily</td>
							</tr>

							<tr className="govuk-table__row">
								<th scope="row" className="govuk-table__header">Data available for</th>
								<td className="govuk-table__cell">[Generated automatically, e.g. 5 February 2019 to 5 February 2025]</td>
							</tr>

							<tr className="govuk-table__row">
								<th scope="row" className="govuk-table__header">Methodology</th>
								<td className="govuk-table__cell">
									<p className="govuk-body">The data reflects the number of beds recorded by care providers. 'Beds' refers to adult social care beds 
									in care providers registered with the Care Quality Commission (CQC) and includes the following categories:</p>
									<ul className="govuk-list govuk-list--bullet">
										<li>dementia nursing</li>
										<li>general residential</li>
										<li>learning disability residential</li>
										<li>YPD - young physically disabled</li>
										<li>mental health nursing</li>
										<li>learning disability nursing</li>
										<li>dementia residential</li>
										<li>transitional</li>
										<li>mental health residential</li>
										<li>general nursing</li>
									</ul>
									<p className="govuk-body">The data covers both self-funded and local authority-funded beds.</p>
									<p className="govuk-body">Care providers registered with the CQC must update this information at least monthly using the 
									Capacity Tracker tool. The mandated reporting period is between the 8th and 14th every month, or 
									the next working day if the 14th falls on a weekend or holiday.</p>
								</td>
							</tr>

							<tr className="govuk-table__row">
								<th scope="row" className="govuk-table__header">Limitations</th>
								<td className="govuk-table__cell">
								<p className="govuk-body">Care providers may update their Capacity Tracker data at different times outside 
									the reporting period.</p>
									<p className="govuk-body">As a result, the data does not provide a snapshot of all providers at 
									the same time. It reflects the most recent information available when the data was retrieved. </p>
									<p className="govuk-body">The data is self-reported and not independently verified.</p>
									<p className="govuk-body">When adult social care beds are vacant, they can be used flexibly across a 
									range of bed types. We are exploring ways to reflect this in the data.</p>
									<p className="govuk-body">The current bed types are not clearly defined and may be interpreted differently
									by care providers submitting data. To improve consistency, we are working with Capacity Tracker to explore 
									whether more detailed bed descriptions can be provided.</p>
									</td>
							</tr>

							<tr className="govuk-table__row">
								<th scope="row" className="govuk-table__header">Data definitions</th>
								<td className="govuk-table__cell">Refer to the Limitations section for details about work relating to bed type descriptions.</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</Layout>
	)
}

export default BedsCareProviderLocations;