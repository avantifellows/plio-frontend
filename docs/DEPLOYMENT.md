## Deployment
This document covers steps on setting up this repository on various cloud hosting providers.

  - [AWS](#aws)

# AWS

## Pre-requisites

Deploying on AWS requires a basic understanding of the following tools and services:
1. Docker
2. GitHub actions & workflows
3. GitHub environments and secrets
4. AWS Elastic Container Registry (ECR)
5. AWS Elastic Container Service (ECS)
6. AWS Virtual Private Cloud (VPC)
7. AWS Fargate
8. AWS Elastic Load Balancer (ELB)
9. AWS Elastic IPs
10. AWS Identity and Access Management (IAM)
11. AWS Relational Database Service (RDS)

## Staging

### Continuous Delivery process

An overview of how the continuous delivery cycle works in Plio with GitHub action and Amazon ECR & ECS.

![Overview of Continuous Delivery process](./images/aws-gh-cd.png)

Setting up staging environment on AWS is pretty straightforward.
1. Login to your AWS console.
2. Go to VPC. (skip this step if you've already created a VPC when setting up backend repository)
   1. Create a new VPC.
   2. Name it `plio-staging`.
   3. In IPv4 CIDR block, enter `10.0.0.0/16` - this will reserve 255 * 255 IPs within the VPC.
   4. Click on the create button. You will see the new VPC under the list of VPCs.
   5. Check out this [AWS guide for more details on VPC](https://docs.aws.amazon.com/vpc/latest/userguide/working-with-vpcs.html).
   6. You'll need to attach an Internet Gateway to this VPC.
      1. Click on `Internet Gateways` in the VPC Dashboard.
      2. Select `Create internet Gateaway`.
      3. Name it as `plio-staging` and save it.
      4. Click on `Attach to a VPC` in the next page and select the VPC created above.
   7. Next, you'll need to attach Subnets to the VPC created above.
      1. Click on `Subnets` in the VPC Dashboard.
      2. Click on `Create Subnet`.
      3. Choose the VPC created above as VPC ID.
      4. Enter the `Subnet name` as `plio-staging-1`.
      5. Either choose the `Availability Zone` if you have a preference or leave it to the default
      6. Under `IPv4 CIDR block`, add a range of IPv4s that belong to your subnet. If you followed the steps above exactly, you can set this value as `10.0.0.0/24`. This will reserve the IPs `10.0.0.0` to `10.0.0.255` to this Subnet.
      7. If you want to, you can create more subnets using `Add new subnet`  but it's not needed going forward. If you do choose to do so, you'll need to choose a different non-overlapping range of IPv4s for the `IPv4 CIDR block` option - for example, you could set it to: `10.0.1.0/24` to reserve the  IPs `10.0.1.0` to `10.0.1.255`.
      8. Finally, create the subnet.
   8. You need to update your `Route Tables` to give make your subnets publicly accessible.
      1. Click on `Route Tables` in the VPC Dashboard
      2. Select the entry corresponding to the VPC you created above.
      3. Navigate to the `Routes` tab.
      4. Click on `Edit routes`.
      5. Click on `Add route`.
      6. Add `0.0.0.0/0` as the `Destination`.
      7. Select `Internet Gateway` under `Target` and link to the Internet Gateway you created above.
      8. Click on `Save routes`.
3. Create a new Elastic IP by going to EC2 dashboard and navigating to the `Elastic IP` section.
   1. Click on `Allocate Elastic IP address` and click on `Allocate` .
   2. You will see a new IP address in the IPs list. Name it `plio-frontend-staging`.
   3. This will be used in later steps to give the load balancer a permanent IP address.
4. Go to Target groups.
   1. Create a new target group.
   2. Choose target type to be `IP addresses`.
   3. Name the target group as `plio-frontend-staging`.
   4. Set the protocol to `TCP` and port to `80`.
   5. Select the `plio-staging` for the target group VPC.
   6. In the next step, add an IP address in the `IP` text area - the IP address should belong to your VPC - if you followed the steps above exactly, you can use any IP address between `10.0.0.0` to `10.0.255.255`.
   7. Proceed to create target group. You will see target group in the list.
5. Go to Load Balancers (LBs).
   1. Create a new load balancer.
   2. Select `Network Load Balancer` option. We use NLB for easy support of web socket connections.
   3. Name the LB as `plio-frontend-staging`.
   4. Select the `plio-staging` for the load balancer.
   5. In the subnet mappings, check the first desired zone and use Elastic IP under IPv4 settings for that subnet.
   6. Under listeners and routing, select the target group `plio-frontend-staging` for TCP port 80.
   7. Proceed to create the load balancer. You will see the created load balancer in the list of all load balancers.
6. Go to ECR and create a new repository named `plio-frontend-staging` and set the settings as per your needs.
7. Now go to ECS and create a new task definition.
   1. Select Fargate and name the task definition as `plio-backend-staging`
   2. Set the task role as `ecsTaskExecutionRole`.
   3. Set the task memory and task CPU based on your needs. Good defaults to use are: 2 GB for memory and 0.5 vCPU.
   4. Create a new container with name `plio-frontend-staging`.
   5. In the image field, you can just type in `image_arn`. This is not a valid entry and just a placeholder for now as it'll be replaced by the actual image ARN once the GitHub workflow triggers.
   6. Enter port `80` in the port mapping field.
   7. Save the container definition and the task definition.
   8. You will see the new task definition within the list of all task definitions.

8. Under ECS, go to `Clusters` and create a new cluster with name `plio-staging-cluster`. (skip this step if you've already created a Cluster when setting up backend repository)
   1. Use `Networking only` option. We will go with serverless deployment so that we don't worry about managing our own server instances.
   2. Don't create a new VPC for your cluster. We'll use the VPC created in previous step in the next step of creating a service.
   3. Click on the create button.
   4. You will see the new cluster within the list of clusters.
9. Get into `plio-staging-cluster` and create a new service.
   1. Set launch type to Fargate. We'll use serverless deployments for Plio.
   2. Name the service as `plio-frontend-staging`.
   3. Under task definition, select `plio-frontend-staging` and use latest revision.
   4. Set the number of tasks to be one.
   5. Service type to be `REPLICA`.
   6. Minimum healthy percentage should be 100 and maximum percent to be 200. Minimum healthy percentage defines the percentage of tasks that should be running at all times. Maximum percent defines how many additional tasks the service can create in parallel to running tasks, before killing the running tasks.
   7. Deployment type to be `rolling update`.
   8. Keep other values as default.
   9. Use the Cluster VPC and the subnet that you configured previously with Elastic IP.
   10. Set Auto-assign public IP to `ENABLED`. Otherwise, it makes the task accessible only through VPC and not public.
   11. Under load balancing, select the `Network Load Balancing` option and select the `plio-frontend-staging` load balancer.
   12. Inside `Container to Load Balancer`, click on `Add to load balancer option` and select `plio-frontend-staging` in the target group.
   13. For auto-scaling, go with `Do not adjust the service's desired count` for staging.
   14. Review and create the service.
10. Next, go to your GitHub repository and create a new environment from settings tab.
    1. Name the environment as `Staging`.
    2. Make sure you have added the following GitHub secrets on repository level. If not, add these as your environment secrets.
       - AWS_ACCESS_KEY_ID
       - AWS_SECRET_ACCESS_KEY
       - AWS_REGION
    3. Additionally, refer to `.env.example` file to set all the other required environment variables for your project.
11. We are using Github Actions to trigger deployments. You can find the workflow defined in `.github/workflows/deploy_to_ecs_staging.yml`. It defines a target branch such that a deployment is initiated whenever a change is pushed to the target branch.
12. Once done, push some changes to the target branch so that the GitHub workflow `deploy_to_ecs_staging.yml` gets triggered.

## Production

Setting up a production environment on AWS is same as staging. Take care of the following things:
1. Rename all services as `plio-frontend-production` or a similar naming convention.
2. Go with auto-scaling option when creating a new service from ECS.
   1. When creating a service or when updating it, navigate to the service auto-scaling section.
   2. Select `Configure Service Auto Scaling to adjust your service's desired count`.
   3. Set minimum number of tasks to `1`. This is the minimum count of running tasks when scale-in operation happen.
   4. Set desired number of tasks to `1`. This may come pre-populated if you had set it before.
   5. Set maximum number of tasks to `2` or more based on your desired need. This is the maximum count of total running tasks in case of scale-out operation.
   6. In IAM role for Service Auto Scaling, select `AWSServiceRoleForApplicationAutoScaling_ECSService`.
   7. Click on `Add scaling policy`.
   8. Select policy type to `Target tracking`.
   9. Set policy name to `plio-frontend-production-autoscaling-cpu`
   10. In ECS service metric, select the option for average CPU utilization.
   11. Target value should be `60` (or as per your requirement). This is the threshold value when the service will trigger a new event and perform scale-out operation.
   12. Scale-out & Scale-in cooldown period to be `300` seconds.
   13. `Disable scale-in` to remain unchecked.
   14. Save the scaling policy.
   15. Create or update the service name.
   16. Use [k6.io](https://k6.io/) or other load testing tool to check if auto-scaling is working fine or not. You can lower down the target threshold for testing purposes.
