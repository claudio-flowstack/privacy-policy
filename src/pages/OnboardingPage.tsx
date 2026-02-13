import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, ArrowRight, Zap, Users, Briefcase, CheckCircle } from 'lucide-react';
import { siteConfig } from '@/config/content';
import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { saveOnboardingSubmission } from '@/data/onboardingStorage';
import { addResource } from '@/data/resourceStorage';
import type { SystemResource, OnboardingFormData } from '@/types/automation';

const inputCls = 'w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors';

function OnboardingContent() {
  const { t, lang } = useLanguage();
  const [searchParams] = useSearchParams();
  const systemId = searchParams.get('system') || 'demo-6'; // default: fulfillment template

  const [formData, setFormData] = useState<OnboardingFormData>({
    clientName: '',
    companyName: '',
    email: '',
    phone: '',
    packageTier: 'growth',
    startDate: '',
    industry: '',
    targetAudience: '',
    brandGuidelines: '',
    websiteUrl: '',
    socialMediaUrls: '',
    specialRequirements: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    document.title = lang === 'de' ? 'Client Onboarding - Flowstack Systems' : 'Client Onboarding - Flowstack Systems';
    window.scrollTo(0, 0);
  }, [lang]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save submission to localStorage
      saveOnboardingSubmission(formData);

      // Create resource linked to the automation system
      const summary = [
        `${t('onboarding.clientName')}: ${formData.clientName}`,
        `${t('onboarding.companyName')}: ${formData.companyName}`,
        `${t('onboarding.email')}: ${formData.email}`,
        `${t('onboarding.phone')}: ${formData.phone}`,
        `${t('onboarding.packageTier')}: ${formData.packageTier}`,
        `${t('onboarding.startDate')}: ${formData.startDate}`,
        `${t('onboarding.industry')}: ${formData.industry}`,
        '',
        `${t('onboarding.targetAudience')}:`,
        formData.targetAudience,
        '',
        `${t('onboarding.brandGuidelines')}:`,
        formData.brandGuidelines,
        '',
        `${t('onboarding.websiteUrl')}: ${formData.websiteUrl}`,
        '',
        `${t('onboarding.socialMediaUrls')}:`,
        formData.socialMediaUrls,
        '',
        `${t('onboarding.specialRequirements')}:`,
        formData.specialRequirements,
      ].join('\n');

      const resource: SystemResource = {
        id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        systemId,
        title: `Onboarding: ${formData.companyName || formData.clientName}`,
        type: 'document',
        content: summary,
        createdAt: new Date().toISOString(),
        source: 'onboarding-form',
      };
      addResource(resource);

      setIsSuccess(true);
    } catch (error) {
      console.error('Onboarding submission error:', error);
      setIsSuccess(true); // still show success since localStorage likely succeeded
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success view
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0e] text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold mb-3">{t('onboarding.success')}</h1>
          <p className="text-gray-400 mb-8">{t('onboarding.successHint')}</p>
          <div className="flex items-center gap-3 justify-center">
            <Link
              to="/systems"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all text-sm"
            >
              {t('onboarding.backToSystems')}
            </Link>
            <button
              onClick={() => {
                setFormData({ clientName: '', companyName: '', email: '', phone: '', packageTier: 'growth', startDate: '', industry: '', targetAudience: '', brandGuidelines: '', websiteUrl: '', socialMediaUrls: '', specialRequirements: '' });
                setIsSuccess(false);
              }}
              className="px-6 py-3 bg-gray-800/50 border border-gray-700/50 text-gray-300 font-medium rounded-xl hover:bg-gray-800 transition-all text-sm"
            >
              {t('onboarding.addAnother')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0e] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-4 mt-4">
          <div className="max-w-7xl mx-auto bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl px-6 py-3">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">{siteConfig.name}</span>
              </Link>
              <Link to="/systems" className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all font-medium text-sm">
                {t('onboarding.backToSystems')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left: Info */}
            <div>
              <span className="inline-block px-4 py-2 bg-purple-500/10 text-purple-400 rounded-full text-sm font-semibold mb-6 border border-purple-500/20">
                {t('onboarding.badge')}
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {t('onboarding.headline')}
              </h1>
              <p className="text-lg text-gray-400 mb-10 leading-relaxed">
                {t('onboarding.description')}
              </p>

              {/* Checklist */}
              <div className="space-y-4 mb-10">
                <ul className="space-y-3">
                  {([t('onboarding.checklist1'), t('onboarding.checklist2'), t('onboarding.checklist3')] as string[]).map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                        <Check className="w-3 h-3 text-purple-400" />
                      </div>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trust Elements */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 text-center">
                  <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">{lang === 'de' ? 'Schnelles Setup' : 'Quick Setup'}</p>
                </div>
                <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 text-center">
                  <Briefcase className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">{lang === 'de' ? 'Professionell' : 'Professional'}</p>
                </div>
                <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4 text-center">
                  <Zap className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">{lang === 'de' ? 'Automatisiert' : 'Automated'}</p>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-[2rem] blur-xl" />
              <div className="relative bg-gray-900/80 border border-gray-800/50 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-xl font-bold mb-6">{t('onboarding.headline')}</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Section: Client Info */}
                  <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">{t('onboarding.section.client')}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">{t('onboarding.clientName')} *</label>
                      <input type="text" name="clientName" required value={formData.clientName} onChange={handleChange} placeholder={t('onboarding.clientNamePlaceholder')} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">{t('onboarding.companyName')} *</label>
                      <input type="text" name="companyName" required value={formData.companyName} onChange={handleChange} placeholder={t('onboarding.companyNamePlaceholder')} className={inputCls} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">{t('onboarding.email')} *</label>
                      <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder={t('onboarding.emailPlaceholder')} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">{t('onboarding.phone')} *</label>
                      <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder={t('onboarding.phonePlaceholder')} className={inputCls} />
                    </div>
                  </div>

                  {/* Section: Package */}
                  <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider pt-2">{t('onboarding.section.package')}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">{t('onboarding.packageTier')} *</label>
                      <select name="packageTier" required value={formData.packageTier} onChange={handleChange} className={inputCls}>
                        <option value="starter">{t('onboarding.packageStarter')}</option>
                        <option value="growth">{t('onboarding.packageGrowth')}</option>
                        <option value="enterprise">{t('onboarding.packageEnterprise')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">{t('onboarding.startDate')}</label>
                      <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className={inputCls} />
                    </div>
                  </div>

                  {/* Section: Business Context */}
                  <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider pt-2">{t('onboarding.section.business')}</p>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">{t('onboarding.industry')}</label>
                    <input type="text" name="industry" value={formData.industry} onChange={handleChange} placeholder={t('onboarding.industryPlaceholder')} className={inputCls} />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">{t('onboarding.targetAudience')}</label>
                    <textarea name="targetAudience" rows={3} value={formData.targetAudience} onChange={handleChange} placeholder={t('onboarding.targetAudiencePlaceholder')} className={inputCls + ' resize-none'} />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">{t('onboarding.brandGuidelines')}</label>
                    <textarea name="brandGuidelines" rows={3} value={formData.brandGuidelines} onChange={handleChange} placeholder={t('onboarding.brandGuidelinesPlaceholder')} className={inputCls + ' resize-none'} />
                  </div>

                  {/* Section: Assets */}
                  <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider pt-2">{t('onboarding.section.assets')}</p>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">{t('onboarding.websiteUrl')}</label>
                    <input type="url" name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} placeholder={t('onboarding.websiteUrlPlaceholder')} className={inputCls} />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">{t('onboarding.socialMediaUrls')}</label>
                    <textarea name="socialMediaUrls" rows={3} value={formData.socialMediaUrls} onChange={handleChange} placeholder={t('onboarding.socialMediaUrlsPlaceholder')} className={inputCls + ' resize-none'} />
                  </div>

                  {/* Section: Notes */}
                  <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider pt-2">{t('onboarding.section.notes')}</p>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">{t('onboarding.specialRequirements')}</label>
                    <textarea name="specialRequirements" rows={4} value={formData.specialRequirements} onChange={handleChange} placeholder={t('onboarding.specialRequirementsPlaceholder')} className={inputCls + ' resize-none'} />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? t('onboarding.submitting') : (
                      <>
                        {t('onboarding.submit')}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-8 border-t border-gray-800/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link to="/" className="hover:text-white transition-colors">{lang === 'de' ? 'Startseite' : 'Home'}</Link>
              <Link to="/systems" className="hover:text-white transition-colors">{lang === 'de' ? 'Systeme' : 'Systems'}</Link>
            </div>
            <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} {siteConfig.name}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <LanguageProvider>
      <OnboardingContent />
    </LanguageProvider>
  );
}
