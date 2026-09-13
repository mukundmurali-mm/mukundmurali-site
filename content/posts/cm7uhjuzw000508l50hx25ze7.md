---
title: "How to Create a Smart Research Assistant Using OCI AI Agents"
datePublished: 2025-03-04T12:49:11.852Z
cuid: cm7uhjuzw000508l50hx25ze7
slug: how-to-create-a-smart-research-assistant-using-oci-ai-agents
tags: ai, research, oci, ai-agents

---

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1741091443260/3e9dfd3b-b2bc-4080-87d3-d5336c46c53e.png align="center")

In today's rapidly evolving technological landscape, artificial intelligence has become an integral part of how we conduct research and analyze information. This simple solution helps you setup a research assistant chatbot which will help you to converse with your document.

## **Project Overview**

Oracle Cloud Infrastructure's AI Agents provide robust, scalable, and secure AI capabilities that can transform how businesses conduct research and analyze information. Our application leverages these capabilities through a sleek, user-friendly interface built with Streamlit, making advanced AI interactions accessible to everyone.

## **Pre-requisites**

* Create the OCI AI Agent endpoints.
    
* Create the data source with Bucket with All objects option selected.
    
* Create the Bucket in the same compartment as OCI AI Agent.
    
* IAM policies for authorization - [https://docs.oracle.com/en-us/iaas/Content/generative-ai-agents/iam-policies.htm](https://docs.oracle.com/en-us/iaas/Content/generative-ai-agents/iam-policies.htm)
    

## **Key Features**

* Seamless Authentication: The application integrates smoothly with OCI's authentication system, using your existing OCI CLI config credentials for secure access.
    
* Interactive Chat Interface: Built with Streamlit, the application provides a responsive and intuitive chat experience that feels natural and engaging.
    
* Session Persistence: Your chat history is maintained throughout your session, allowing for contextual conversations and easy reference to previous interactions.
    
* Enterprise-Ready: With built-in error handling and user feedback mechanisms, the application is designed for reliability and professional use.
    
* Data Privacy: All Files are securely stored in OCI Object Storage Bucket.
    

## **Limitation**

* Currently OCI AI Agents supports only TXT and PDF format files.
    
* The maximum size for a file to be ingested is 100 MB.
    
* Your tenancy must have the US Midwest (Chicago) region. Generative AI Agents is only available in this region.
    
* Your OCI AI Agents and Buckets should be in the same compartment(This is a limitation for this application alone and not a general OCI AI Agent limitation).
    

## **Technical Implementation**

The application is built using Python and leverages several key technologies:

* Streamlit: For creating a responsive and modern web interface
    
* OCI Python SDK: For seamless integration with Oracle Cloud Infrastructure
    
* Python 3.7+: Ensuring compatibility with modern Python features
    

## **Getting Started**

### Setting up the application is straightforward:

1\. Create and activate a Python virtual environment:

```python
python -m venv .venv 
source .venv/bin/activate  # On macOS/Linux
```

or

```python
.venv\Scripts\activate  # On Windows
```

2\. Install the required dependencies using pip:

```python
pip install -r requirements.txt
```

3\. Configure your OCI credentials in the OCI CLI config profile (~/.oci/config)

4\. Save the below code inside the virtual env(ex: app.py) and run the application

```python
Streamlit run app.py
```

5\. Pass in your required parameters in the application and start chatting.

*P.S: whenever there is a new object added or exiting object is deleted to the bucket which needs to be part of this Application then run 'create Injection job' once the object is uploaded/deleted.*

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1741091742855/5e644579-e4f4-42fa-8608-73025eb9982a.png align="center")

## **Code**

```python
import streamlit as st
import oci
import os
import time
# Set page configuration with OCI favicon
st.set_page_config(
    page_title="OCI AI Research Assistant",
    page_icon="https://www.oracle.com/favicon.ico",
    layout="wide"
)
from oci.config import from_file
from oci.generative_ai_agent_runtime.generative_ai_agent_runtime_client import GenerativeAiAgentRuntimeClient
from oci.generative_ai_agent_runtime.models.chat_details import ChatDetails
from oci.generative_ai_agent import GenerativeAiAgentClient
from oci.generative_ai_agent.models import CreateDataIngestionJobDetails
from oci.object_storage import ObjectStorageClient
from oci.object_storage.models import CreateBucketDetails
from tempfile import NamedTemporaryFile
def initialize_oci_clients(profile_name="DEFAULT", agent_endpoint_id=None):
    """Initialize OCI clients with the specified profile and create a session"""
    try:
        st.write(f"Attempting to load config profile: {profile_name}")
        config = from_file(profile_name=profile_name)
        st.write("Config loaded successfully")
        st.write(f"Using region: {config.get('region')}")
        
        # Use the appropriate service endpoint based on your region
        service_endpoint = "https://agent-runtime.generativeai.us-chicago-1.oci.oraclecloud.com"
        st.write(f"Using service endpoint: {service_endpoint}")
        
        # Initialize GenAI client with service endpoint
        genai_client = GenerativeAiAgentRuntimeClient(
            config,
            service_endpoint=service_endpoint
        )
        
        # Create a session if agent_endpoint_id is provided and session doesn't exist
        if agent_endpoint_id and 'chat_session_id' not in st.session_state:
            try:
                create_session_response = genai_client.create_session(
                    create_session_details=oci.generative_ai_agent_runtime.models.CreateSessionDetails(
                        display_name="USER_Session",
                        description="User Session"),
                    agent_endpoint_id=agent_endpoint_id)
                st.session_state.chat_session_id = create_session_response.data.id
                st.write("Chat session created successfully")
            except Exception as e:
                st.error(f"Error creating chat session: {str(e)}")
        
        # Initialize Object Storage client
        object_storage_client = ObjectStorageClient(config)
        
        # Initialize Identity client
        identity_client = oci.identity.IdentityClient(config)
        
        st.write("OCI clients initialized")
        return genai_client, object_storage_client, identity_client, config
    except Exception as e:
        st.error(f"Error initializing OCI clients: {str(e)}")
        st.error("Please check if your OCI config file (~/.oci/config) exists and contains the correct profile")
        return None, None, None, None
def list_objects(object_storage_client, namespace, bucket_name):
    """List objects in a bucket"""
    try:
        # Send the request to service with minimal required parameters
        list_objects_response = object_storage_client.list_objects(
            namespace_name=namespace,
            bucket_name=bucket_name,
            fields="name,size,timeCreated"  # Only fetch essential fields
        )
        return list_objects_response.data.objects
    except Exception as e:
        st.error(f"Error listing objects: {str(e)}")
        return []
def upload_file(object_storage_client, namespace, bucket_name, file):
    """Upload a file to object storage"""
    try:
        # Read the file content
        file_content = file.read()
        
        # Upload the file to Object Storage using put_object
        put_object_response = object_storage_client.put_object(
            namespace_name=namespace,
            bucket_name=bucket_name,
            object_name=file.name,
            put_object_body=file_content,
            content_type=file.type if hasattr(file, 'type') else None
        )
        return True
    except Exception as e:
        st.error(f"Error uploading file: {str(e)}")
        return False
def delete_object(object_storage_client, namespace, bucket_name, object_name):
    """Delete an object from object storage"""
    try:
        # Send the delete request to service
        object_storage_client.delete_object(
            namespace_name=namespace,
            bucket_name=bucket_name,
            object_name=object_name
        )
        # Verify deletion by trying to get object metadata
        try:
            object_storage_client.head_object(
                namespace_name=namespace,
                bucket_name=bucket_name,
                object_name=object_name
            )
            st.error(f"Failed to delete {object_name}. Object still exists.")
            return False
        except:
            # If we get an error trying to get the object, it means it's deleted
            return True
    except Exception as e:
        st.error(f"Error deleting object: {str(e)}")
        return False
def list_data_sources(profile_name, compartment_id):
    """List available data sources"""
    try:
        # Initialize the GenerativeAiAgent client
        config = from_file(profile_name=profile_name)
        generative_ai_agent_client = GenerativeAiAgentClient(config)
        
        # List data sources
        response = generative_ai_agent_client.list_data_sources(
            compartment_id=compartment_id,
            lifecycle_state="ACTIVE"
        )
        
        return response.data.items if response.data else []
    except Exception as e:
        st.error(f"Error listing data sources: {str(e)}")
        return []
def create_ingestion_job(profile_name, compartment_id, data_source_id):
    """Create a data ingestion job"""
    try:
        # Initialize the GenerativeAiAgent client
        config = from_file(profile_name=profile_name)
        generative_ai_agent_client = GenerativeAiAgentClient(config)
        
        # Create the ingestion job
        response = generative_ai_agent_client.create_data_ingestion_job(
            create_data_ingestion_job_details=CreateDataIngestionJobDetails(
                compartment_id=compartment_id,
                data_source_id=data_source_id,
                display_name=f"Ingestion-Job-{int(time.time())}",  # Unique name using timestamp
                description="Data ingestion job created from Research Assistant"
            )
        )
        
        return response.data
    except Exception as e:
        st.error(f"Error creating ingestion job: {str(e)}")
        return None
def get_chat_response(client, agent_endpoint_id, message):
    """Get response from the chat agent"""
    try:
        # Validate agent endpoint ID
        if not agent_endpoint_id or not agent_endpoint_id.strip():
            st.error("Agent Endpoint ID is required")
            return None
            
        # Ensure we have a session ID
        if 'chat_session_id' not in st.session_state:
            # Create a new session if we don't have one
            try:
                create_session_response = client.create_session(
                    create_session_details=oci.generative_ai_agent_runtime.models.CreateSessionDetails(
                        display_name="USER_Session",
                        description="User Session"),
                    agent_endpoint_id=agent_endpoint_id)
                st.session_state.chat_session_id = create_session_response.data.id
            except Exception as e:
                st.error(f"Error creating chat session: {str(e)}")
                return None
        
        # Send the chat request
        response = client.chat(
            agent_endpoint_id=agent_endpoint_id,
            chat_details=ChatDetails(
                user_message=message,
                should_stream=False,  # Set to False for now until we implement streaming properly
                session_id=st.session_state.chat_session_id
            )
        )
        
        # Debug: Print response structure
        st.write("Response data attributes:", dir(response.data))
        
        # Return the response - accessing the correct attribute
        return response.data.message
    except Exception as e:
        st.error(f"Error getting chat response: {str(e)}")
        return None
def main():
    """Main function for the OCI AI Research Assistant application"""
    st.title("OCI AI Research Assistant")
    
    # Configuration Section in Sidebar
    with st.sidebar:
        st.header("Configuration")
        
        # Display available profiles from ~/.oci/config
        config_file = os.path.expanduser("~/.oci/config")
        available_profiles = []
        
        if os.path.exists(config_file):
            with open(config_file, 'r') as f:
                content = f.read()
                profiles = [line.strip('[').strip(']') for line in content.split('\n') if line.strip().startswith('[')]
                available_profiles = profiles
        
        #st.write("Available profiles:", ", ".join(available_profiles))
        
        # OCI Configuration
        profile_name = st.selectbox(
            "OCI Profile Name",
            options=available_profiles,
            index=available_profiles.index("DEFAULT") if "DEFAULT" in available_profiles else 0
        )
        agent_endpoint_id = st.text_input("Agent Endpoint ID")
        compartment_id = st.text_input("Compartment ID")
        
        # Object Storage Configuration
        namespace = st.text_input("Namespace Name")
        bucket_name = st.text_input("Bucket Name")
        
        # Initialize button
        if st.button("Initialize Clients"):
            # Validate required inputs
            if not agent_endpoint_id or not agent_endpoint_id.strip():
                st.error("Agent Endpoint ID is required")
                return
                
            # Store all inputs in session state
            st.session_state.profile_name = profile_name
            st.session_state.agent_endpoint_id = agent_endpoint_id
            st.session_state.compartment_id = compartment_id
            st.session_state.namespace = namespace
            st.session_state.bucket_name = bucket_name
        
            # Initialize OCI clients with agent endpoint ID
            genai_client, object_storage_client, identity_client, config = initialize_oci_clients(
                profile_name=profile_name,
                agent_endpoint_id=agent_endpoint_id
            )
            
            if all([genai_client, object_storage_client, identity_client]):
                st.session_state.genai_client = genai_client
                st.session_state.object_storage_client = object_storage_client
                st.session_state.identity_client = identity_client
                st.session_state.config = config
                st.success("OCI clients and chat session initialized successfully!")
    
    # Main content area for chat
    if hasattr(st.session_state, 'genai_client'):
        st.markdown("""
        Welcome to your AI Research Assistant! Ask any question, and I'll help you find the information you need.
        """)
        
        # Initialize chat history if it doesn't exist
        if 'messages' not in st.session_state:
            st.session_state.messages = []
        # Display chat history
        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                st.markdown(message["content"])
        # Chat input
        if prompt := st.chat_input("What would you like to research?"):
            # Add user message to chat history
            st.session_state.messages.append({"role": "user", "content": prompt})
            
            # Display user message
            with st.chat_message("user"):
                st.markdown(prompt)
            
            # Get AI response
            with st.chat_message("assistant"):
                try:
                    response = get_chat_response(
                        st.session_state.genai_client,
                        st.session_state.agent_endpoint_id,
                        prompt
                    )
                    if response:
                        st.markdown(response)
                        # Add assistant response to chat history
                        st.session_state.messages.append({"role": "assistant", "content": response})
                except Exception as e:
                    st.error(f"Error getting response: {str(e)}")
        
        # Object Storage in Sidebar
        if hasattr(st.session_state, 'object_storage_client'):
            with st.sidebar:
                st.markdown("---")
                
                # Ingestion Job Section
                st.header("Data Ingestion")
                
                # List data sources
                data_sources = list_data_sources(
                    st.session_state.profile_name,
                    st.session_state.compartment_id
                )
                
                if data_sources:
                    # Create a list of data source names and IDs for the selectbox
                    data_source_options = {f"{ds.display_name} ({ds.id})": ds.id for ds in data_sources}
                    selected_source = st.selectbox(
                        "Select Data Source",
                        options=list(data_source_options.keys())
                    )
                    
                    if st.button("Create Ingestion Job", type="primary"):
                        with st.spinner("Creating ingestion job..."):
                            result = create_ingestion_job(
                                st.session_state.profile_name,
                                st.session_state.compartment_id,
                                data_source_options[selected_source]
                            )
                            if result:
                                st.success(f"Created ingestion job: {result.id}")
                else:
                    st.warning("No active data sources found in the compartment.")
                
                st.markdown("---")
                st.header("Object Storage")
                
                # Upload section
                st.subheader("Upload File")
                uploaded_file = st.file_uploader("Choose a file to upload", key="sidebar_uploader")
                if uploaded_file is not None:
                    if st.button("Upload"):
                        if upload_file(st.session_state.object_storage_client, 
                                     st.session_state.namespace, 
                                     st.session_state.bucket_name, 
                                     uploaded_file):
                            st.success(f"File {uploaded_file.name} uploaded successfully!")
                            st.experimental_rerun()
                
                # List Objects section
                st.subheader("Objects in Bucket")
                
                # Get the current list of objects
                objects = list_objects(
                    st.session_state.object_storage_client,
                    st.session_state.namespace,
                    st.session_state.bucket_name
                )
                
                # Add refresh button
                if st.button("Refresh Objects", type="primary"):
                    st.rerun()
                
                if objects:
                    for obj in objects:
                        col1, col2 = st.columns([3, 1])
                        with col1:
                            st.write(f"📄 {obj.name}\n{obj.size:,} bytes")
                        with col2:
                            delete_button_key = f"delete_{obj.name}"
                            if st.button("🗑", key=delete_button_key, help=f"Delete {obj.name}"):
                                try:
                                    with st.spinner(f"Deleting {obj.name}..."):
                                        if delete_object(
                                            st.session_state.object_storage_client,
                                            st.session_state.namespace,
                                            st.session_state.bucket_name,
                                            obj.name
                                        ):
                                            st.success(f"Deleted {obj.name}")
                                            st.rerun()
                                        else:
                                            st.error(f"Failed to delete {obj.name}")
                                except Exception as e:
                                    st.error(f"Error deleting {obj.name}: {str(e)}")
                        st.divider()
                else:
                    st.info("No objects found in this bucket")
        
                    st.markdown(response)
                    # Add assistant response to chat history
                    st.session_state.messages.append({"role": "assistant", "content": response})
if __name__ == "__main__":
    main()
```

## **Conclusion**

The OCI AI Research Assistant showcases how enterprise-grade AI can be made accessible and user-friendly. Whether you're conducting academic research, analyzing complex data, or building knowledge management solutions, this project provides a solid foundation for your AI-powered research endeavors.

New features will be added to this application in the future.