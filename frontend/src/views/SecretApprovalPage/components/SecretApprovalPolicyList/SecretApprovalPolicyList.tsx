import { faFileShield, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useNotificationContext } from "@app/components/context/Notifications/NotificationProvider";
import {
  Button,
  DeleteActionModal,
  EmptyState,
  Table,
  TableContainer,
  TableSkeleton,
  TBody,
  Td,
  Th,
  THead,
  Tr
} from "@app/components/v2";
import { usePopUp } from "@app/hooks";
import {
  useDeleteSecretApprovalPolicy,
  useGetSecretApprovalPolicies,
  useGetWorkspaceUsers
} from "@app/hooks/api";
import { TSecretApprovalPolicy } from "@app/hooks/api/types";

import { SecretApprovalPolicyRow } from "./components/SecretApprovalPolicyRow";
import { SecretPolicyForm } from "./components/SecretPolicyForm";

type Props = {
  workspaceId: string;
};

export const SecretApprovalPolicyList = ({ workspaceId }: Props) => {
  const { handlePopUpToggle, handlePopUpOpen, handlePopUpClose, popUp } = usePopUp([
    "secretPolicyForm",
    "deletePolicy"
  ] as const);
  const { createNotification } = useNotificationContext();

  const { data: members } = useGetWorkspaceUsers(workspaceId);
  const { data: policies, isLoading: isPoliciesLoading } = useGetSecretApprovalPolicies({
    workspaceId
  });

  const { mutateAsync: deleteSecretApprovalPolicy } = useDeleteSecretApprovalPolicy();

  const handleDeletePolicy = async () => {
    const { _id: id } = popUp.deletePolicy.data as TSecretApprovalPolicy;
    try {
      await deleteSecretApprovalPolicy({
        workspaceId,
        id
      });
      createNotification({
        type: "success",
        text: "Successfully deleted policy"
      });
      handlePopUpClose("deletePolicy");
    } catch (err) {
      console.log(err);
      createNotification({
        type: "error",
        text: "Failed  to delete policy"
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-6">
        <div className="flex flex-col">
          <span className="text-xl font-semibold text-mineshaft-100">Approval Policies</span>
          <div className="text-bunker-300 mt-2 text-sm">
            Implement policies to prevent unauthorized secret changes.
          </div>
        </div>
        <div>
          <Button
            onClick={() => handlePopUpOpen("secretPolicyForm")}
            leftIcon={<FontAwesomeIcon icon={faPlus} />}
          >
            Create policy
          </Button>
        </div>
      </div>
      <TableContainer>
        <Table>
          <THead>
            <Tr>
              <Th>Environment</Th>
              <Th>Secret Path</Th>
              <Th>Eligible Approvers</Th>
              <Th>Approval Required</Th>
              <Th />
            </Tr>
          </THead>
          <TBody>
            {isPoliciesLoading && (
              <TableSkeleton columns={4} innerKey="secret-policies" className="bg-mineshaft-700" />
            )}
            {!isPoliciesLoading && !policies?.length && (
              <Td colSpan={5}>
                <EmptyState title="No policies found" icon={faFileShield} />
              </Td>
            )}
            {policies?.map((policy) => (
              <SecretApprovalPolicyRow
                workspaceId={workspaceId}
                policy={policy}
                key={policy._id}
                members={members}
                onEdit={() => handlePopUpOpen("secretPolicyForm", policy)}
                onDelete={() => handlePopUpOpen("deletePolicy", policy)}
              />
            ))}
          </TBody>
        </Table>
      </TableContainer>
      <SecretPolicyForm
        workspaceId={workspaceId}
        isOpen={popUp.secretPolicyForm.isOpen}
        onToggle={(isOpen) => handlePopUpToggle("secretPolicyForm", isOpen)}
        members={members}
        editValues={popUp.secretPolicyForm.data as TSecretApprovalPolicy}
      />
      <DeleteActionModal
        isOpen={popUp.deletePolicy.isOpen}
        deleteKey="remove"
        title="Do you want to remove this polciy?"
        onChange={(isOpen) => handlePopUpToggle("deletePolicy", isOpen)}
        onDeleteApproved={handleDeletePolicy}
      />
    </div>
  );
};
