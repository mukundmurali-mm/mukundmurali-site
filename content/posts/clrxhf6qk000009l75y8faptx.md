---
title: "Inbound NAT with Palo Alto in OCI"
datePublished: 2024-01-28T12:33:34.940Z
cuid: clrxhf6qk000009l75y8faptx
slug: inbound-nat-with-palo-alto-in-oci
tags: networking, oci, oracle-cloud, palo-alto-networks

---

This topic is with reference in accessing private resources like Load balancer through the untrust Vnic of NVA like Palo Alto. This is a general scenario when we have a firewall like Palo Alto inside OCI for monitoring North-south traffic. Also there are applications inside OCI which needs to be exposed to the internet for internet users to access it and we might need to use a reverse Proxy like Load balancer to expose it.

The problem in this scenario is, For monitoring all the north-south outbound traffic i.e. the egress internet traffic from the instances has to be sent to the Palo Alto so the ingress traffic cannot be directly to the Load balancer via the internet gateway because that would be asymmetric routing as the return traffic will be through Palo Alto. So the ingress traffic has to come through Untrust Vnic of the Palo Alto as that is the exit interface as well.

# Architecture

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1706444226752/65feaf31-b6e5-4de1-bfb0-952bf795db3c.png align="center")

# NAT Configuration inside Palo Alto

You can configure a direct D-NAT for this configuration to translate the untrust IP to the load balancer IP but the Palo alto just drops this traffic at the untrust VNIC itself and doesn't capture this traffic. The reason being forward session is not getting created. The solution for this is to create a **SNAT** with the Load balancer as the source and the untrust NIC as NAT IP with **Bi-Directional** checkbox checked.

# Palo Alto Configuration

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1706444278167/7e30b801-ce6c-4bba-a94c-649a2e846457.png align="center")

## Create the NAT policy :

1. Select **Policies &gt; NAT** and click **Add**
    
2. On the **General** tab, enter a descriptive **Name** for the NAT rule.
    
3. On the **Original Packet** tab, select the zone you created for your DMZ in the **Source Zone** section (click **Add** and then select the zone) and the zone you created for the external network from the **Destination Zone** list.
    
4. In the **Source Address** section, **Add** the address object you created for your internal web server address.
    
5. On the **Translated Packet** tab, select **Static IP** from the **Translation Type** list in the **Source Address Translation** section and then select the address object you created for your external web server address from the **Translated Address** list.
    
6. In the **Bi-directional** field, select **Yes**.
    
7. Click **OK**.
    
8. Click **Commit**.
    

> This type of architecture is not limited to OCI and can be applied to other cloud services as well.