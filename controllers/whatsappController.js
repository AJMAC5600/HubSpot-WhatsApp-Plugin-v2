// Importing necessary modules
// const fetch = require("node-fetch"); // You can remove the dynamic import as it's not necessary

const config = require("../config/config"); // Your configuration
const db = require("../config/database"); // Your database (if used)
require("dotenv").config(); // Load environment variables early

// Function to send a WhatsApp message
const sendWhatsAppMessage = async (contact, jsonbody, channelNumber) => {
  const whatsappApiUrl = `${process.env.WHATSAPP_API_URL}/api/v1.0/messages/send-template/${channelNumber}`;

  const headers = {
    Authorization: `Bearer ${process.env.WHATSAPP_API_KEY}`,
    "Content-Type": "application/json",
  };

  let body = jsonbody;
  let phone = contact.replace("+",""); // Remove non-numeric characters
  body.to = phone;
  body = JSON.stringify(body);
  // console.log("Sending WhatsApp message:", body);
  try {
    const response = await fetch(whatsappApiUrl, {
      method: "POST",
      headers,
      body,
    });

    const result = await response.json();
    // console.log("WhatsApp Message Sent:", result);
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
  }
};

// Function to retrieve channel data from the API
const getChannelsFromAPI = async () => {
  const apiUrl = `${process.env.WHATSAPP_API_URL}/api/v1.0/channels`; // Your API URL from environment variables
  const apiKey = process.env.WHATSAPP_API_KEY; // Your API key from environment variables

  const headers = {
    Authorization: `Bearer ${apiKey}`,
  };

  const requestOptions = {
    method: "GET",
    headers: headers,
    redirect: "follow",
  };

  try {
    const response = await fetch(apiUrl, requestOptions);
    const result = await response.json(); // Parse JSON directly
    // console.log("Fetched Channels:", result);
    return result || []; // Adjust according to the actual response format
  } catch (error) {
    console.error("Error fetching channels:", error);
    return []; // Return an empty array in case of error
  }
};

const getChannelTemplates = async (channelNumber) => {
  // Construct the URL dynamically based on channel number and the API domain
  const apiUrl = `${process.env.WHATSAPP_API_URL}/api/v1.0/channel-templates/${channelNumber}`;
  const apiKey = process.env.WHATSAPP_API_KEY; // Assuming you have your API key in the config

  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${apiKey}`);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  try {
    const response = await fetch(apiUrl, requestOptions);
    const result = await response.json(); // Parse the response as JSON

    return result; // Return the response for further use
  } catch (error) {
    console.error("Error fetching channel templates:", error);
    throw error; // Throw error to be handled by the calling function
  }
};

// Function to render channel data and send WhatsApp message
const getChannelsAndSendMessage = async (req, res) => {
  try {
    const channels = await getChannelsFromAPI(); // Fetch channel data
    res.render("channelsView", { channels }); // Render view with channels data

    // Send a test WhatsApp message (optional)
    if (channels.length > 0) {
      const message = "Hello from the WhatsApp API!";
      const phoneNumber = channels[0].phone_number; // Assuming the first channel has a phone number
      await sendWhatsAppMessage(phoneNumber, message); // Send message to the first channel's phone number
    }
  } catch (error) {
    console.error("Error rendering channels view or sending message:", error);
    res
      .status(500)
      .send("Error fetching channels or sending WhatsApp message.");
  }
};

const fetchTemplatePayload = async (templateName, channelNumber) => {
  const apiUrl = process.env.WHATSAPP_API_URL; // Your API URL from environment variables
  const apiKey = process.env.WHATSAPP_API_KEY; // Your API key from environment variables
  // Prepare headers and request options
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${apiKey}`); // Use the actual API key

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  // Construct the URL with dynamic parameters
  const url = `${apiUrl}/api/v1.0/template-payload/${channelNumber}/${templateName}`;

  try {
    // Fetch the template payload
    const response = await fetch(url, requestOptions);

    // Check if the response is OK (status code 200)
    if (response.ok) {
      const result = await response.json(); // Parse JSON response
      // console.log(result); // Process the result (log for now)
      return result; // Return the result for further processing
    } else {
      throw new Error(`Error fetching template: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error in fetching template:", error);
    throw error; // Propagate the error for further handling
  }
};

const sendMessage = async (req, res) => {
  const { whatsapp_number, template_name } = req.body;

  // Example: Call your WhatsApp API or a 3rd party service to send a message
  const message = `Sending WhatsApp message to ${whatsapp_number} using template ${template_name}`;
  console.log(message);

  try {
    // Example API call (replace with your WhatsApp API integration)
    const response = await axios.post("https://api.whatsapp.com/sendMessage", {
      phone: whatsapp_number,
      template: template_name,
      message: message,
    });

    res
      .status(200)
      .send({ success: true, message: "Message sent successfully" });
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: "Failed to send message", error });
  }
};

const paramsByTemplate= async(templateName,)=> {
  const params=[];
  const channelNumber= await getChannelsFromAPI();
 
  try {
    const templatePayload = await fetchTemplatePayload(templateName, channelNumber[0].Number);
    const templateComponents=templatePayload.template.components;
    templateComponents.forEach((component)=> {
      if(component.type==="body"){
        component.parameters.forEach((parameter)=> {
          params.push(parameter.text.replace("{{","").replace("}}",""));
        })
      }
    })
  } catch (error) {
    console.error("Error in getting template components:", error);
  }
  if(params.length>0){
    return params.join(",");
  }else{
    return null;
  }
}

module.exports = {
  sendWhatsAppMessage,
  getChannelsFromAPI,
  getChannelsAndSendMessage,
  getChannelTemplates,
  fetchTemplatePayload,
  sendMessage,
  paramsByTemplate
};
