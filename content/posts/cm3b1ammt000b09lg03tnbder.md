---
title: "Exploring Your Cloud with Steampipe and Powerpipe: An Overview with OCI Focus"
datePublished: 2024-11-10T03:27:40.566Z
cuid: cm3b1ammt000b09lg03tnbder
slug: exploring-your-cloud-with-steampipe-and-powerpipe-an-overview-with-oci-focus
tags: cloud, terraform, oracle-cloud, steampipe

---

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1731208583927/a95dc693-a9c9-4d39-81fd-20e817690b19.png align="center")

## Introduction

This blog post explores Steampipe and Powerpipe, powerful tools for gaining insights into your cloud resources, particularly for Oracle Cloud Infrastructure (OCI). We'll cover the basics of Steampipe, Powerpipe, and their parent company Turbot, the supported cloud providers, and delve specifically into how these tools can be used with OCI and Terraform.

## What is Steampipe?

**Steampipe** is an open-source tool that enables users to query cloud APIs, code repositories, and other services using SQL. It acts as a universal translator, eliminating the need for specialized knowledge of various platforms and allowing you to leverage your existing SQL skills to interrogate your infrastructure. Steampipe essentially turns your cloud resources into a database that can be queried, analysed, and reported on.

## What is Powerpipe?

**Powerpipe** builds upon Steampipe's functionality by providing a visual interface for creating dashboards and reports. It takes the raw data gathered by Steampipe and transforms it into easily understandable visualisations, making it easier to identify trends, potential security risks, and cost optimization opportunities. Powerpipe is particularly beneficial for DevOps, SecOps, and FinOps teams as it provides a consolidated view of cloud resources and their configurations.

## What is Turbot?

Steampipe and Powerpipe are products of **Turbot**, a company that provides cloud governance and automation solutions. Turbot offers both open-source and commercial products based on Steampipe and Powerpipe technology.

## Cloud Providers Supported by Steampipe

Steampipe has a wide range of plugins that connect to various cloud providers and services. Some of the major supported cloud providers include:

* **Alibaba Cloud**
    
* **Amazon Web Services (AWS)**
    
* **Azure**
    
* **DigitalOcean**
    
* **Google Cloud Platform (GCP)**
    
* **Heroku**
    
* **IBM Cloud**
    
* **Linode**
    
* **Oracle Cloud Infrastructure (OCI)**
    
* **Scaleway**
    
* **Snowflake**
    

## Focusing on OCI: Steampipe, Powerpipe, and Terraform

For **Oracle Cloud Infrastructure (OCI)**, Steampipe provides comprehensive coverage through its plugin. This plugin allows users to query various OCI services and resources using SQL. In addition to basic querying, Steampipe for OCI can be used for:

* **Compliance Checks:** The `oci_compliance` mod allows you to run security and compliance checks against your OCI resources. It supports benchmarks like CIS, helping you identify misconfigurations and potential vulnerabilities.
    
    ![](https://cdn.hashnode.com/res/hashnode/image/upload/v1731208891028/894d18fa-b191-4c3a-b7a3-8b42073eb01f.png align="center")
    
    ![](https://cdn.hashnode.com/res/hashnode/image/upload/v1731208855213/1a5f9739-088a-4430-befb-7c1a3b035d92.png align="center")
    
* **Insights and Reporting:** The `oci_insights` mod provides pre-built dashboards for visualizing your OCI resources. This helps gain a better understanding of your cloud infrastructure and its configuration.
    
* **Cost Optimization:** The `oci_thrifty` mod focuses on finding unused and underutilized resources. This helps optimize your cloud spending and reduce costs.
    
* **Terraform** is a popular Infrastructure as Code (IaC) tool used to manage and provision cloud resources. The `terraform_oci_compliance` mod allows you to scan your Terraform code, plans, and state files for potential security misconfigurations before deploying to OCI.
    
* ![](https://cdn.hashnode.com/res/hashnode/image/upload/v1731208709109/9022775f-ba5a-409c-a035-61bd84a0fde9.png align="center")
    

## Examples and Use Cases for OCI

Let's illustrate the power of Steampipe with some practical examples for OCI:

* **Querying OCI Users:** You can retrieve details about your OCI users with a simple SQL query like:
    
    ```sql
    select name, id, is_mfa_activated from oci_identity_user;
    
    ```
    
    This query retrieves the name, ID, and MFA activation status of all OCI users.
    
* **Checking for Publicly Accessible Buckets:** To enhance security, you can identify object storage buckets that are publicly accessible using a query like:
    
    ```sql
    select name from oci_objectstorage_bucket where public_access_type != 'NoPublicAccess';
    
    ```
    
    This query lists the names of all buckets that allow some form of public access.
    
* **Identifying Unused Compute Instances:** For cost optimization, you can find compute instances that are potentially unused with a query like:
    
    ```sql
    select display_name, shape, time_created
    from oci_core_instance
    where state = 'Stopped'
    order by time_created desc;
    
    ```
    
    This query lists stopped instances, ordered by their creation time, allowing you to investigate instances that have been stopped for a long time.
    
    ## OCI Insights Dashboard Questions
    
    While the sources don't explicitly list the questions that OCI Insights dashboards answer, they do provide clues about their capabilities. Based on the information in the sources, here's a breakdown of potential questions these dashboards can help answer:
    
    **Resource Inventory and Properties:**
    
    * **How many resources do I have?** This basic question can be answered across various resource types, providing a quick overview of your OCI footprint.
        
    * **How old are my resources?** Understanding the age of resources can be helpful for lifecycle management and identifying potential candidates for decommissioning or upgrades.
        
    
    **Security Posture:**
    
    * **Are there any publicly accessible resources?** This is a critical security question, as publicly accessible resources can pose significant risks. OCI Insights dashboards can likely help identify such resources, allowing you to take corrective actions.
        
    * **Is encryption enabled, and what keys are used for encryption?** These dashboards can likely provide insights into the encryption status of resources, helping you assess your data protection measures.
        
    
    **Data Management:**
    
    * **Is versioning enabled?** This is particularly relevant for services like object storage, where versioning provides data recovery and protection against accidental deletions. OCI Insights dashboards can potentially show the versioning status of your resources.
        
    
    **Other Potential Insights:**
    
    The sources mention that OCI Insights dashboards are available for 10+ services, including Block Storage, Compute, Identity, Object Storage, VCN, and more. Given this breadth of coverage, it's likely that these dashboards can also help answer questions related to:
    
    * **Resource utilization and performance:** Dashboards could potentially show metrics related to CPU utilization, storage usage, network traffic, and other performance indicators.
        
    * **Cost allocation and trends:** Insights into resource usage can be further used to analyse cost allocation and identify potential areas for optimisation.
        
    * **Compliance with specific standards:** While the sources primarily focus on CIS benchmarks, it's possible that OCI Insights dashboards could also address compliance requirements for other standards, depending on the available mods and configurations.
        

## Conclusion and Next Steps

Steampipe and Powerpipe are valuable tools for anyone working with cloud infrastructure, especially OCI. They provide a unified and intuitive way to query, analyZe, and visualize your cloud resources using the familiar SQL language. By leveraging these tools, you can gain a deeper understanding of your cloud infrastructure, improve security and compliance, and optimize costs.

To learn more about Steampipe and Powerpipe:

* [**Visit the Steampipe Hub**](https://hub.steampipe.io/)**:** Explore the various Steampipe plugins and their documentation.
    
* [**Visit the Powerpipe Hub**](https://hub.powerpipe.io/#search)**:** Discover the available Powerpipe mods and see how they can be used to create insightful dashboards.
    
* [**Explore Turbot's Website**](https://turbot.com/pipes/docs)**:** Find information about Turbot's products and solutions built on Steampipe and Powerpipe technology.