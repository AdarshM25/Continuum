import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Navbar() {
	const navigate = useNavigate();
	const { t, i18n } = useTranslation();

	const changeLanguage = (event) => {
		const language = event.target.value;
		i18n.changeLanguage(language);
	};

	const handleLogout = () => {
		localStorage.removeItem('token');
		navigate('/login');
	};

	return (
		<nav className='flex items-center justify-between px-8 py-5 bg-white border-b'>
			{/* Logo */}
			<Link to='/' className='text-2xl font-bold text-teal-600'>
				CONTINUUM
			</Link>

			{/* Right side */}
			<div className='flex items-center gap-6'>
				<Link to='/dashboard' className='text-gray-700 hover:text-teal-600'>
					{t('navbar.dashboard')}
				</Link>

				<Link to='/upload' className='text-gray-700 hover:text-teal-600'>
					{t('navbar.upload')}
				</Link>

				{/* Language */}
				<select
					value={i18n.language || 'en'}
					onChange={changeLanguage}
					className='border rounded-lg px-3 py-2'
				>
					<option value='en'>English</option>
					<option value='hi'>हिन्दी</option>
					<option value='pa'>ਪੰਜਾਬੀ</option>
				</select>

				<button onClick={handleLogout} className='border rounded-lg px-4 py-2'>
					{t('navbar.logout')}
				</button>
			</div>
		</nav>
	);
}

export default Navbar;
