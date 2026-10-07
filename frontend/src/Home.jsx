import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
	Activity,
	ShieldCheck,
	History,
	FileText,
	Sparkles,
	Upload,
	UserPlus,
	LineChart,
} from 'lucide-react';

export default function Home() {
	return (
		<div
			className='relative bg-gradient-to-br from-indigo-50 via-white to-emerald-50'
			style={{
				backgroundImage:
					'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)',
				backgroundSize: '28px 28px',
			}}
		>
			<Hero />
			<FeatureGrid />
			<BenefitSection />
			<GetStartedSection />
		</div>
	);
}

function Blob({ className }) {
	return (
		<div
			className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
		/>
	);
}

function Hero() {
	const { t } = useTranslation();

	return (
		<section className='relative overflow-hidden'>
			<Blob className='-top-32 -right-32 w-[28rem] h-[28rem] bg-indigo-200/50' />
			<Blob className='top-20 -left-32 w-80 h-80 bg-emerald-200/50' />

			<div className='relative max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-24 grid md:grid-cols-2 gap-16 items-center'>
				<div>
					<span className='inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-100 px-3 py-1.5 rounded-full'>
						<Sparkles size={13} />
						{t('home.aiPowered')}
					</span>

					<h1 className='text-4xl md:text-5xl font-bold text-gray-900 mt-5 leading-tight'>
						{t('home.title')}
						<br />
						<span className='text-teal-700'>{t('home.titleHighlight')}</span>
					</h1>

					<p className='mt-5 text-gray-500 text-base max-w-md'>
						{t('home.description')}
					</p>

					<div className='flex gap-3 mt-7'>
						<Link
							to='/login'
							className='px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-teal-600 to-emerald-700 hover:opacity-90 transition'
						>
							{t('home.getStarted')}
						</Link>

						<a
							href='#how-it-works'
							className='px-6 py-3 rounded-lg font-medium text-gray-700 border border-gray-200 bg-white hover:bg-gray-50 transition'
						>
							{t('home.seeHow')}
						</a>
					</div>
				</div>

				<HeroMockup />
			</div>
		</section>
	);
}

function HeroMockup() {
	const { t } = useTranslation();

	return (
		<div className='relative'>
			<div className='absolute -top-4 -right-4 bg-white shadow-lg rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-medium text-gray-600 border border-gray-100 z-10'>
				<ShieldCheck size={14} className='text-emerald-600' />
				{t('home.private')}
			</div>

			<div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-6 rotate-1'>
				<div className='flex items-center gap-2 mb-4'>
					<div className='w-2.5 h-2.5 rounded-full bg-red-300' />
					<div className='w-2.5 h-2.5 rounded-full bg-amber-300' />
					<div className='w-2.5 h-2.5 rounded-full bg-emerald-300' />
				</div>

				<div className='rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4 mb-3'>
					<div className='text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1'>
						{t('home.threshold')}
					</div>

					<p className='text-sm text-gray-700'>{t('home.thresholdText')}</p>
				</div>

				<div className='rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4'>
					<div className='text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-1'>
						{t('home.trend')}
					</div>

					<p className='text-sm text-gray-700'>{t('home.trendText')}</p>
				</div>
			</div>
		</div>
	);
}

function FeatureGrid() {
	const { t } = useTranslation();

	const features = [
		{
			icon: <Activity size={18} />,
			title: t('home.features.extractionTitle'),
			body: t('home.features.extractionBody'),
		},
		{
			icon: <ShieldCheck size={18} />,
			title: t('home.features.insightsTitle'),
			body: t('home.features.insightsBody'),
		},
		{
			icon: <History size={18} />,
			title: t('home.features.historyTitle'),
			body: t('home.features.historyBody'),
		},
		{
			icon: <FileText size={18} />,
			title: t('home.features.recordTitle'),
			body: t('home.features.recordBody'),
		},
	];

	return (
		<section className='relative'>
			<Blob className='top-10 right-0 w-72 h-72 bg-teal-200/40 translate-x-1/3' />

			<div className='relative max-w-7xl mx-auto px-6 lg:px-10 py-16'>
				<div className='max-w-xl mb-10'>
					<h2 className='text-2xl font-bold text-gray-900'>
						{t('home.howWorks')}
					</h2>

					<p className='text-gray-500 mt-2 text-sm'>
						{t('home.howWorksDescription')}
					</p>
				</div>

				<div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4'>
					{features.map((f) => (
						<div
							key={f.title}
							className='bg-white border border-gray-200 rounded-xl p-5'
						>
							<div className='w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-3'>
								{f.icon}
							</div>

							<h3 className='text-sm font-semibold text-gray-800 mb-1'>
								{f.title}
							</h3>

							<p className='text-sm text-gray-500'>{f.body}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function BenefitSection() {
	const { t } = useTranslation();

	return (
		<section id='how-it-works' className='relative'>
			<Blob className='-bottom-10 -left-32 w-80 h-80 bg-indigo-200/40' />

			<div className='relative max-w-7xl mx-auto px-6 lg:px-10 py-16'>
				<div className='grid md:grid-cols-2 gap-6 items-center'>
					<div className='bg-teal-700 text-white rounded-2xl p-8'>
						<h3 className='text-2xl font-bold'>{t('home.timelineTitle')}</h3>

						<p className='mt-3 text-teal-50 text-sm leading-relaxed'>
							{t('home.timelineDescription')}
						</p>
					</div>

					<div className='bg-white border border-gray-200 rounded-2xl p-6'>
						<div className='text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3'>
							{t('home.hemoglobin')}
						</div>

						<table className='w-full text-sm'>
							<tbody>
								<tr className='border-b border-gray-100'>
									<td className='py-2 text-gray-500'>8 Jun 2026</td>
									<td className='py-2 text-red-600 font-medium text-right'>
										11.1 g/dL
									</td>
								</tr>

								<tr>
									<td className='py-2 text-gray-500'>2 Dec 2026</td>
									<td className='py-2 text-gray-800 text-right'>12.5 g/dL</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</section>
	);
}

function GetStartedSection() {
	const { t } = useTranslation();

	const steps = [
		{
			icon: <UserPlus size={16} />,
			text: t('home.steps.account'),
		},
		{
			icon: <Upload size={16} />,
			text: t('home.steps.upload'),
		},
		{
			icon: <LineChart size={16} />,
			text: t('home.steps.insights'),
		},
	];

	return (
		<section className='relative'>
			<Blob className='bottom-0 right-1/4 w-96 h-96 bg-emerald-200/40' />

			<div className='relative max-w-3xl mx-auto px-6 py-16 text-center'>
				<h2 className='text-2xl font-bold text-gray-900 mb-8'>
					{t('home.threeSteps')}
				</h2>

				<div className='grid sm:grid-cols-3 gap-4 mb-8'>
					{steps.map((s, i) => (
						<div
							key={s.text}
							className='bg-white border border-gray-200 rounded-xl p-5'
						>
							<div className='w-8 h-8 mx-auto rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-semibold mb-3'>
								{i + 1}
							</div>

							<p className='text-sm text-gray-600 flex items-center justify-center gap-1.5'>
								{s.icon}
								{s.text}
							</p>
						</div>
					))}
				</div>

				<Link
					to='/login'
					className='inline-block px-7 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-teal-600 to-emerald-700 hover:opacity-90 transition'
				>
					{t('home.getStarted')}
				</Link>
			</div>
		</section>
	);
}
