'use client';

import { parseMarkdownBlocks } from "@/utils/parseMarkdown"

type Props = {
	smartInsights: string[];
}
const SmartInsights: React.FC<Props> = ({ smartInsights }) => {
	return (
		<div>
			<h2 id="smart-insights" className="govuk-heading-m">
				Smart insights (experimental)
			</h2>
			<div className="govuk-inset-text">
				Smart insights use artificial intelligence (AI) to analyse this
				data, highlighting trends and patterns to support your own
				analysis. As this is experimental, verify the insights to check
				they are appropriate and meet your needs.&nbsp;
				<a href="/help/smart-insights" className="govuk-link">
					Learn more about smart insights
				</a>
			</div>
			<div>
				{parseMarkdownBlocks(smartInsights)}
			</div>
		</div>
	);
};

export default SmartInsights