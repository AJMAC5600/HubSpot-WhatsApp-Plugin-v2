import React, { useState } from "react";
import { Dropdown, Button } from "@hubspot/ui-extensions";
import { hubspot } from "@hubspot/ui-extensions";
import InputText from "./InputText.jsx";

hubspot.extend(() => <Extension />);

const Extension = () => {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [templateName, setTemplateName] = useState("");

  const handleSubmit = () => {
    console.log(
      `Sending WhatsApp Message to: ${whatsappNumber} using ${templateName}`
    );
    // Call the API to send the message using the selected template
  };

  return (
    <div>
      <InputText
        label="WhatsApp Number"
        value={whatsappNumber}
        onChange={(e) => setWhatsappNumber(e.target.value)}
      />
      <Dropdown
        label="Template Name"
        value={templateName}
        onChange={(e) => setTemplateName(e.target.value)}
        options={[
          { label: "Welcome Template", value: "welcome_template" },
          { label: "Follow-Up Template", value: "follow_up_template" },
        ]}
      />
      <Button onClick={handleSubmit}>Send WhatsApp Message</Button>
    </div>
  );
};

export default Extension;
