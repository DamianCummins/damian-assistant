import React from "react";
import { Chat } from '@progress/kendo-react-conversational-ui';
import "./Assistant.css";

export default class Assistant extends React.Component {
	constructor (props) {
		super (props);
	
		this.user = {
            id: 1,
            avatarUrl: "https://via.placeholder.com/24/008000/008000.png"
		};
		
		this.bot = { 
			id: 0,
            avatarUrl: "https://via.placeholder.com/24/800000/800000.png"
		};
		
		this.state = {
			messages: [{
				author: this.bot,
				timestamp: new Date(),
				text: "Ask me something about Damian."
			}]
		}
	}

	onSend = (event = []) => {
		if (event.message && event.message.text) {
			this.setState((previousState) => ({
				messages: [...this.state.messages, {
					author: this.user,
					timestamp: new Date(),
					text: event.message.text
				}],
			}), () => {
				this.getMessage(event.message.text);
			});
		}
	}

	getMessage = async (text) => {
		fetch("/v1/deployments/assistant/message?logPayload=true", {
			headers: {
				"Content-Type": "application/json"
			},
			method: "POST",
			body: JSON.stringify({
				"fields": ["text"],
				"values": [[text]]
			})
		}).then(response => response.json())
		.then(response => {
			let value = response.values[0][0];
			this.setState((previousState) => ({
				messages: [...this.state.messages, {
					author: this.bot,
					timestamp: new Date(),
					text: value
				}],
			}));
		});
	}
	

	render() {
		return (
			<div>
				<div className="assistantChat">
					<Chat user={this.user}
						messages={this.state.messages}
						onMessageSend={(messages) => this.onSend(messages)}
						placeholder={"Type a message..."}
						width={400}>
					</Chat>
				</div>
			</div>
		);
	}
}