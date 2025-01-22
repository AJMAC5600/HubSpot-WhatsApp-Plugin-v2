
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cron = require("node-cron");


// Load environment variables early
const session = require("express-session");
const db = require("./config/database");
const hubspot = require('@hubspot/api-client');
require("dotenv").config();
const oauthRoutes = require('./routes/oauthRoutes');  // Adjust path as needed
const settingsRoutes = require('./routes/settingsRoutes');  // Adjust path as needed
const templateRoutes = require('./routes/templateRoutes'); 
const port = process.env.PORT || 3000;
const {
  sendWhatsAppMessage,
  getChannelsFromAPI,
  getChannelTemplates,
  fetchTemplatePayload,
  paramsByTemplate,
} = require("./controllers/whatsappController");
// Middleware
const app = express();
app.use(express.static(path.join(__dirname, "assets"))); // Serve static files
app.use(express.static(path.join(__dirname, "public"))); // Serve static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Using a hardcoded secret key (not recommended for production)
app.use(
  session({
    secret: "mySuperSecretKey12345", // Choose any strong string
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.get("/template-selection", async (req, res) => {
  try {
    const contacts = await getContactsFromHubSpot(); // Function to fetch contacts
    const channels = await getChannels(); // Function to fetch channels
    const categories = await getCategories(); // Function to fetch categories
    const templates = await getTemplates(); // Function to fetch templates

    res.render("templateSelection", {
      contacts,
      channels,
      categories,
      templates,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
// Middleware to parse JSON bodies (if needed)
app.use(express.json());

// Routes
app.use(oauthRoutes);
app.use(settingsRoutes);
app.use(templateRoutes);

// Token Renewal Scheduler
cron.schedule("*/5 * * * *", () => {
  console.log("Running scheduled token refresh...");
  refreshAccessToken();
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).send("Something went wrong!");
});
// reloadEnv();


// (async () => {
//   const hubspot = await import("@hubspot/api-client");

//   const hubspotClient = new hubspot.Client({
//     developerApiKey: "0636eb80-296c-412c-bbcb-44512c603113",
//   });

//   // Function to fetch phone numbers from HubSpot
 
//   const templateData = await getChannelTemplates(919833533311);

//   const PublicActionDefinitionEgg = {
//     inputFields: [
//       {
//         isRequired: true,
//         automationFieldType: "string",
//         typeDefinition: {
//           name: "phone_number",
//           label: "Phone Number",
//           type: "string",
//         },
//         supportedValueTypes: ["OBJECT_PROPERTY"],
//       },
//       {
//         isRequired: true,
//         automationFieldType: "string",
//         typeDefinition: {
//           name: "message_template",
//           label: "Message Template",
//           type: "enumeration",
//           options: templateData.map((template) => ({ label: template.name, value: template.name })),
//         },
//         supportedValueTypes: ["STATIC_VALUE"],
//       },
//       {
//         isRequired: false,
//         automationFieldType: "string",
//         typeDefinition: {
//           name: "custom_message",
//           label: "Custom Message",
//           type: "string",
//           fieldType: "textarea", // Set fieldType to 'textarea' for a multi-line input
//         },
//         supportedValueTypes: ["STATIC_VALUE"],
//       },
//     ],
//     outputFields: [
//       {
//         typeDefinition: {
//           name: "status",
//           label: "Message Status",
//           type: "string",
//           supportedValueTypes: ["STATIC_VALUE"],
//         },
//       },
//     ],
//     actionDescription: "Send WhatsApp message via Alot",
//     actionUrl: "https://7531-2405-201-10-d877-8d35-a46a-f2de-eadd.ngrok-free.app/webhook",
//     published: true,
//     labels: {
//       en: {
//         actionName: "Send WhatsApp Message",
//         appDisplayName: "WhatsApp Integration",
//         inputFieldLabels: {
//           phone_number: "Phone Number",
//           message_template: "Message Template",
//           custom_message: "Custom Message", // Label for the new text area field
//         },
//         outputFieldLabels: {
//           status: "Message Status",
//         },
//       },
//     },
//   };
  
  
  
  
  

//   const appId = 7121167; // Replace with your app ID

//   async function createCustomAction() {
//     try {
//       const apiResponse = await hubspotClient.automation.actions.definitionsApi.create(
//         appId,
//         PublicActionDefinitionEgg
//       );
//       console.log("Custom action created successfully:", JSON.stringify(apiResponse, null, 2));
//     } catch (e) {
//       console.error("Error creating custom action:", e.message || e);
//       if (e.response) {
//         console.error("API Response:", JSON.stringify(e.response, null, 2));
//       }
//     }
//   }

//   createCustomAction();
// })();

//update code


(async () => {
  const appid = process.env.APPID; // Accessing appid from environment variables
 // Accessing developer API key from environment variables
  try {
    const developerApiKey = process.env.DEVELOPER_API_KEY;
    const hubspot = await import("@hubspot/api-client");
    const channels = await getChannelsFromAPI();
    // console.log(developerApiKey);
    const hubspotClient = new hubspot.Client({
      developerApiKey: `0636eb80-296c-412c-bbcb-44512c603113`,
    });

    // Get updated template data
    const templateData = await getChannelTemplates(channels[0].Number);

    // Enhanced template processing
    const processedTemplateOptions = await Promise.all(
      templateData.map(async (template) => {
        let templateParams = {};
        try {
          // Safely fetch template parameters
          const params = await paramsByTemplate(template.name);
          templateParams = params || {};
        } catch (paramError) {
          console.warn(`Could not fetch params for template ${template.name}:`, paramError);
        }

        return {
          label: `${template.name} {Params: ${JSON.stringify(templateParams)}}`,
          value: template.name
        };
      })
    );

    const PublicActionDefinitionPatch = {
      inputFields: [
        {
          isRequired: true,
          automationFieldType: "string",
          typeDefinition: {
            name: "phone_number",
            label: "Phone Number",
            type: "string",
          },
          supportedValueTypes: ["OBJECT_PROPERTY"],
        },
        {
          isRequired: true,
          automationFieldType: "string",
          typeDefinition: {
            name: "message_template",
            label: "Message Template",
            type: "enumeration",
            options: processedTemplateOptions,
          },
          supportedValueTypes: ["STATIC_VALUE"],
        },
        {
          isRequired: false,
          automationFieldType: "string",
          typeDefinition: {
            name: "custom_message",
            label: "Custom Message",
            type: "string",
            fieldType: "textarea",
          },
          supportedValueTypes: ["STATIC_VALUE"],
        },
      ],
      outputFields: [
        {
          typeDefinition: {
            name: "status",
            label: "Message Status",
            type: "string",
            supportedValueTypes: ["STATIC_VALUE"],
          },
        },
      ],
      actionDescription: "Send WhatsApp message via Alot",
      actionUrl: "https://7531-2405-201-10-d877-8d35-a46a-f2de-eadd.ngrok-free.app/webhook",
      published: true,
      labels: {
        en: {
          actionName: "Send WhatsApp Message",
          appDisplayName: "WhatsApp Integration",
          inputFieldLabels: {
            phone_number: "Phone Number",
            message_template: "Message Template",
            custom_message: "Custom Message",
          },
          outputFieldLabels: {
            status: "Message Status",
          },
        },
      },
    };

    const definitionId = "187782059";
    const appId = appid;

    async function updateTemplateOptions() {
      try {
        // Validate input before API call
        if (!processedTemplateOptions || processedTemplateOptions.length === 0) {
          throw new Error("No template options available");
        }

        const apiResponse = await hubspotClient.automation.actions.definitionsApi.update(
          definitionId,
          appId,
          PublicActionDefinitionPatch
        );

        console.log("Template options updated successfully", apiResponse);
      } catch (e) {
        console.error("Comprehensive Error updating template options:", {
          message: e.message,
          stack: e.stack,
          response: e.response ? JSON.stringify(e.response) : 'No response details'
        });

        // Additional error handling
        if (e.response && e.response.body) {
          console.error("Detailed API Error:", e.response.body);
        }
      }
    }

    // Execute update
    await updateTemplateOptions();

  } catch (mainError) {
    console.error("Critical Error in HubSpot Template Update Process:", {
      message: mainError.message,
      stack: mainError.stack
    });
  }
})();

// Enhanced paramsByTemplate function


// Utility function to fetch template parameters

    

app.use(session({
  secret: '560056',
  resave: false,  // (async () => {
    //   const hubspot = await import("@hubspot/api-client");
    //   const channels = await getChannelsFromAPI();
    
    //   const hubspotClient = new hubspot.Client({
    //     developerApiKey: "0636eb80-296c-412c-bbcb-44512c603113",
    //   });
    
    //   // Get updated template data
    //   const templateData = await getChannelTemplates(channels[0].Number);
    
    //   const PublicActionDefinitionPatch = {
    //     inputFields: [
    //       {
    //         isRequired: true,
    //         automationFieldType: "string",
    //         typeDefinition: {
    //           name: "phone_number",
    //           label: "Phone Number",
    //           type: "string",
    //         },
    //         supportedValueTypes: ["OBJECT_PROPERTY"],
    //       },
    //       {
    //         isRequired: true,
    //         automationFieldType: "string",
    //         typeDefinition: {
    //           name: "message_template",
    //           label: "Message Template",
    //           type: "enumeration",
    //           options: templateData.map((template) => ({ 
    //             label: `${template.name}`, 
    //             value: template.name })),
    //         },
    //         supportedValueTypes: ["STATIC_VALUE"],
    //       },
    //       {
    //         isRequired: false,
    //         automationFieldType: "string",
    //         typeDefinition: {
    //           name: "custom_message",
    //           label: "Custom Message",
    //           type: "string",
    //           fieldType: "textarea", // Set fieldType to 'textarea' for a multi-line input
    //         },
    //         supportedValueTypes: ["STATIC_VALUE"],
    //       },
    //     ],
    //     outputFields: [
    //       {
    //         typeDefinition: {
    //           name: "status",
    //           label: "Message Status",
    //           type: "string",
    //           supportedValueTypes: ["STATIC_VALUE"],
    //         },
    //       },
    //     ],
    //     actionDescription: "Send WhatsApp message via Alot",
    //     actionUrl: "https://7531-2405-201-10-d877-8d35-a46a-f2de-eadd.ngrok-free.app/webhook",
    //     published: true,
    //     labels: {
    //       en: {
    //         actionName: "Send WhatsApp Message",
    //         appDisplayName: "WhatsApp Integration",
    //         inputFieldLabels: {
    //           phone_number: "Phone Number",
    //           message_template: "Message Template",
    //           custom_message: "Custom Message", // Label for the new text area field
    //         },
    //         outputFieldLabels: {
    //           status: "Message Status",
    //         },
    //       },
    //     },
    //   };
    
    //   const definitionId = "187782059";
    //   const appId = 7121167;
    
    //   async function updateTemplateOptions() {
    //     try {
          

    //       const apiResponse = await hubspotClient.automation.actions.definitionsApi.update(
    //         definitionId,
    //         appId,
    //         PublicActionDefinitionPatch
    //       );
    //       console.log("Template options updated successfully:", JSON.stringify(apiResponse, null, 2));
    //     } catch (e) {
    //       console.error("Error updating template options:", e.message || e);
    //       if (e.response) {
    //         console.error("API Response:", JSON.stringify(e.response, null, 2));
    //       }
    //     }
    //   }
    
    //   updateTemplateOptions();
    // })();
  saveUninitialized: true,
  cookie: { secure: true } // Set `true` only if using HTTPS
}));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Graceful Shutdown
process.on("SIGINT", () => {
  console.log("Shutting down gracefully...");
  process.exit();
});
