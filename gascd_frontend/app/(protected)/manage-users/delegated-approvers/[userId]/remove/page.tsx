import ApproverChangePage from '../ApproverChangePage';

type Props = { params: Promise<{ userId: string }> };

export default function RemoveApproverPage({ params }: Props) {
  return <ApproverChangePage params={params} kind="remove" />;
}
