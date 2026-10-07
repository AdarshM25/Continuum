import { useState } from 'react';

function VoiceAssistant() {
	const [listening, setListening] = useState(false);
	const [text, setText] = useState('');

	const startListening = () => {
		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;

		if (!SpeechRecognition) {
			alert('Speech recognition is not supported in this browser.');
			return;
		}

		const recognition = new SpeechRecognition();

		recognition.lang = 'en-IN';
		recognition.continuous = false;
		recognition.interimResults = false;

		recognition.onstart = () => {
			setListening(true);
			setText('Listening...');
		};

		recognition.onresult = (event) => {
			const transcript = event.results[0][0].transcript;

			setText(transcript);

			handleCommand(transcript);
		};

		recognition.onerror = () => {
			setListening(false);
			setText('Could not understand your voice.');
		};

		recognition.onend = () => {
			setListening(false);
		};

		recognition.start();
	};

	const handleCommand = (command) => {
		const text = command.toLowerCase();

		if (text.includes('dashboard')) {
			window.location.href = '/dashboard';
		}

		if (text.includes('upload') && text.includes('report')) {
			window.location.href = '/upload';
		}

		if (text.includes('lab report')) {
			window.location.href = '/reports';
		}

		if (text.includes('health trend')) {
			window.location.href = '/health-trends';
		}

		if (text.includes('ai insight')) {
			window.location.href = '/ai-insights';
		}
	};

	return (
		<button
			onClick={startListening}
			style={{
				position: 'fixed',
				bottom: '25px',
				right: '25px',
				width: '60px',
				height: '60px',
				borderRadius: '50%',
				border: 'none',
				background: '#008f83',
				color: 'white',
				fontSize: '25px',
				cursor: 'pointer',
				zIndex: 1000,
			}}
		>
			{listening ? '🔴' : '🎙️'}
		</button>
	);
}

export default VoiceAssistant;
