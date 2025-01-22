'use strict';

var name = "Send WhatsApp Message";
var description = "Sends a WhatsApp message using the selected template";
var inputs = [
	{
		name: "phone_number",
		type: "text",
		label: "Phone Number",
		required: true
	},
	{
		name: "template",
		type: "dropdown",
		label: "Select Template",
		options: [
			{
				label: "Order Shipped",
				value: "order_shipped"
			},
			{
				label: "Order Cancelled",
				value: "order_cancelled"
			}
		]
	}
];
var actions = {
	name: name,
	description: description,
	inputs: inputs
};

module.exports = actions;
