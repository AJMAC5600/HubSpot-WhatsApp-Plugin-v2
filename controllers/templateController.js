// controllers/templateController.js

// Static data for template selection
const getTemplateData = (type) => {
  // Static data (replace with actual values you need)
  const data = {
    categories: ["Marketing", "Utility", "Authentication"],
    channels: [
      { id: "channel1", name: "Channel 1" },
      { id: "channel2", name: "Channel 2" },
      { id: "channel3", name: "Channel 3" },
    ],
    templates: [
      { id: "template1", name: "Template 1" },
      { id: "template2", name: "Template 2" },
      { id: "template3", name: "Template 3" },
    ],
    contacts: [
      { id: "contact1", name: "John Doe", phone: "+123456789" },
      { id: "contact2", name: "Jane Smith", phone: "+987654321" },
      { id: "contact3", name: "Alice Brown", phone: "+1122334455" },
    ],
  };

  return data[type];
};

module.exports = { getTemplateData };
