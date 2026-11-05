import ApproverChangePage from '../ApproverChangePage';

type Props = { params: Promise<{ userId: string }> };

export default function CancelApproverPage({ params }: Props) {
  return <ApproverChangePage params={params} kind="cancel" />;
}
