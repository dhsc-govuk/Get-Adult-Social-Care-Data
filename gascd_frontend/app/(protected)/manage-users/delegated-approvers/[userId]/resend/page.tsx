import ApproverChangePage from '../ApproverChangePage';

type Props = { params: Promise<{ userId: string }> };

export default function ResendApproverPage({ params }: Props) {
  return <ApproverChangePage params={params} kind="resend" />;
}
