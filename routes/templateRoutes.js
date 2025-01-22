const express = require("express");
const {
  sendWhatsAppMessage,
  getChannelsFromAPI,
  getChannelTemplates,
  fetchTemplatePayload,
} = require("../controllers/whatsappController"); // Import functions from the controller
const { fetchHubSpotContacts } = require("../controllers/hubSpotController");
const db = require("../config/database"); // Import the database connection
const router = express.Router();

// Route to load template selection page
router.get("/templates", async (req, res) => {
  try {
    // Fetch channels dynamically from the API
    const channels = await getChannelsFromAPI();
    
    // Static data for categories and contacts
    const categories = ["MARKETING", "UTILITY", "AUTHENTICATION"];
    const contacts = await fetchHubSpotContacts(); // Fetch contacts from HubSpot

    // Render the template selection page with empty templates initially
    res.render("templateSelection", {
      categories,
      channels,
      templates: [], // Empty initially
      contacts,
    });
  } catch (error) {
    console.error("Error fetching data for template selection:", error);
    res.status(500).send("Error fetching data for template selection.");
  }
});

// Function to fetch settings from the database (example of future database interaction)
const fetchSettingsFromDatabase = async () => {
  const query = `SELECT * FROM settings WHERE id = 1`;
  return new Promise((resolve, reject) => {
    db.get(query, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const fetchTemplateFromRequest = async (req, res) => {
  const { template, channel } = req.body; // Get template name and channel number from the request body

  if (!template || !channel) {
    return res.status(400).send("Template or channel not provided");
  }

  try {
    // Fetch the template payload from the API
    const templateData = await fetchTemplatePayload(template, channel);
    // Return the template data to the frontend
    res.json({ success: true, template: templateData });
  } catch (error) {
    console.error("Error fetching template payload:", error);
    res.status(500).send("Error fetching template data");
  }
};

// Example route to handle template fetching
router.post("/templates/fetch", fetchTemplateFromRequest);

// Route to handle fetching templates for a selected channel
router.post("/save-channel", async (req, res) => {
  const { channel } = req.body;
  if (!channel) {
    return res.status(400).json({ error: "Channel is required." });
  }

  try {
    // Fetch templates for the selected channel
    const templates = await getChannelTemplates(channel);
    // Send the templates back as a JSON response
    res.json({ success: true, templates });
  } catch (error) {
    console.error("Error fetching channel templates:", error);
    res.status(500).json({ success: false, error: "Failed to fetch templates." });
  }
});

// Route to handle form submission (after selecting category, template, etc.)
router.post("/submit-endpoint", async (req, res) => {
  const { updatedJsonbody, contact, channel } = req.body;

  // Fetch HubSpot contacts
  const contacts = await fetchHubSpotContacts();

  // Extract phone numbers from contacts
  let phoneNumbers = contacts.map((contact) => contact.properties.phone);

  // Check if we need to send the message to multiple contacts or a single one
  if (contact === "true") {
    // Send message to all phone numbers
    phoneNumbers.forEach((phoneNumber) => {
      sendWhatsAppMessage(phoneNumber, updatedJsonbody, channel);
    });
  } else if (Array.isArray(contact)) {
    // Send message to all selected contacts
    contact.forEach((contact) => {
      sendWhatsAppMessage(contact, updatedJsonbody, channel);
    });
    sendWhatsAppMessage(contact, updatedJsonbody, channel);
  }

  // Handle the form submission (store, send, etc.)
  res.send("Form submitted successfully!");
});

router.post("/webhook", async (req, res) => {
  try {
    // Extract input data with multiple fallback strategies
    const inputData = 
      req.body.input?.inputFields || 
      req.body.input?.fields || 
      req.body.inputFields || 
      req.body.fields || 
      req.body;

    // Validate input
    if (!inputData) {
      return res.status(400).json({ 
        error: "No input fields found", 
        receivedPayload: req.body 
      });
    }

    // Parse custom message parameters
    const customMessageParams = parseCustomMessage(inputData.custom_message);

    // Extract phone number
    const phoneNumber = 
      inputData.phone_number || 
      customMessageParams.phone || 
      null;

    if (!phoneNumber) {
      throw new Error("Phone number is required");
    }

    // Fetch channel
    const channels = await getChannelsFromAPI();
    if (!channels || channels.length === 0) {
      throw new Error("No channels available");
    }

    // Fetch template payload
    const template = await fetchTemplatePayload(
      inputData.message_template, 
      channels[0].Number
    );

    // Validate template
    if (!template || !template.template || !template.template.components) {
      throw new Error("Invalid template configuration");
    }

    // Directly modify template components
    modifyTemplateComponents(template, customMessageParams);

    // Send WhatsApp message with modified template
    const apiResponse = await sendWhatsAppMessage(
      phoneNumber, 
      template, 
      channels[0].Number
    );

    // Comprehensive logging
    logWebhookProcessing({
      templateName: inputData.message_template,
      phoneNumber,
      context: req.body.input?.context || req.body.context || {}
    });

    // Respond to webhook
    res.status(200).json({ 
      message: "Webhook processed successfully",
      apiResponse 
    });

  } catch (error) {
    // Error handling
    handleWebhookError(res, error, req.body);
  }
});

// Function to modify template components directly
function modifyTemplateComponents(template, params) {
  // Ensure we're working with a mutable copy
  const components = template.template.components;

  components.forEach(component => {
    if (component.type === "body" && component.parameters) {
      component.parameters.forEach(parameter => {
        const variableName = parameter.text
          .replace(/{{|}}/g, '')
          .trim()
          .toLowerCase();

        // Check if variable exists in params
        if (params[variableName]) {
          parameter.text = params[variableName];
        }
      });
    }
  });
}

// Custom message parsing function
function parseCustomMessage(customMessage) {
  if (!customMessage) return {};

  try {
    return customMessage.split(',').reduce((acc, param) => {
      const [key, value] = param.split(':').map(p => p.trim());
      
      if (key && value) {
        acc[key.toLowerCase()] = value;
      }
      
      return acc;
    }, {});
  } catch (error) {
    console.error('Error parsing custom message:', {
      customMessage,
      error: error.message
    });
    return {};
  }
}

// Logging utility
function logWebhookProcessing(details) {
  console.log('Webhook Processing Details:', {
    timestamp: new Date().toISOString(),
    ...details
  });
}

// Centralized error handling
function handleWebhookError(res, error, originalPayload) {
  // Log the full error details
  console.error('Webhook Processing Error:', {
    message: error.message,
    stack: error.stack,
    payload: originalPayload
  });

  // Differentiate error responses
  if (error.name === 'ValidationError') {
    return res.status(400).json({ 
      error: "Invalid input", 
      details: error.details 
    });
  }

  // Generic error response
  res.status(500).json({ 
    error: "Internal server error", 
    message: error.message 
  });
}

module.exports = router;
