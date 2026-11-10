# IAM and AWS CLI

- **Course section:** 4
- **Status:** Complete
- **Last reviewed:** 2026-11-10
- **Course link:** <https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/>

## What this solves

AWS Identity and Access Management (IAM) controls who or what can access AWS and which actions they may perform. The goal is to grant only the permissions required for a task.

## IAM identities

### Users

An IAM user represents a person or workload with its own credentials. Users do not use the root account credentials.

### User groups

Groups collect IAM users so permissions can be managed together.

- A user can belong to multiple groups.
- A user does not have to belong to a group.
- Groups cannot contain other groups.
- Policies can be attached directly to a user, but group-based management is easier to maintain.

### Roles

A role is an AWS identity with permissions and no long-term credentials. A trusted user, application, federated identity, or AWS service can assume it and receive temporary credentials.

A common example is assigning a role to an EC2 instance so its application can access another AWS service without storing access keys on the instance.

## IAM policies

Policies are JSON documents that define permissions for AWS actions and resources. They can be associated with users, groups, roles, and supported AWS resources.

An individual statement can contain:

- `Sid`
- `Effect`
- `Action` or `NotAction`
- `Resource` or `NotResource`
- `Condition`
- `Principal` or `NotPrincipal` when the policy type requires it

`Version` belongs to the overall policy, not an individual statement. Identity-based policies normally do not include `Principal` because the attached identity is already known. Resource-based and role trust policies commonly specify a principal.

## IAM security tools

### Credentials Report

An account-level report listing IAM users and the status of credentials such as passwords, access keys, and MFA.

### Access Advisor information

Shows which AWS services an identity can access and when those services were last accessed. This helps identify permissions that may no longer be needed.

## Security practices

- Avoid using the root account except for tasks that require it.
- Give each person a separate identity.
- Assign permissions through groups and roles where practical.
- Require strong authentication and MFA.
- Prefer temporary role or IAM Identity Center credentials over long-lived access keys.
- Never share users, passwords, or access keys.
- Review permissions using credential and last-access information.
- Apply least privilege.

## MFA options

- Virtual authenticator applications
- FIDO security keys, such as a compatible YubiKey
- Supported hardware TOTP tokens

## AWS CLI access

AWS CloudShell provides browser-based shell access with AWS tooling. The AWS CLI can also run locally.

Named profiles separate credentials and settings for different accounts or roles:

```bash
aws configure list-profiles
aws s3 ls --profile second-account
export AWS_PROFILE=second-account
aws sts get-caller-identity
unset AWS_PROFILE
```

Always verify the active identity before running commands that change AWS resources.

## Test review

- IAM groups cannot contain other groups.
- IAM roles provide assumable permissions and temporary credentials.
- The IAM Credentials Report is the account-level credential auditing tool.
- IAM users use their own credentials, not root credentials.
- IAM policies are JSON permission documents.
- `Version` is policy-level rather than statement-level.

## Anki

Six review cards were added to the `saa-c03::iam` deck and recorded in [`../anki/cards.tsv`](../anki/cards.tsv).
