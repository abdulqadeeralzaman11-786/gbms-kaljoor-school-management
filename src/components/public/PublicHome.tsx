import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../services/db';
import {
  School,
  GraduationCap,
  Award,
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  BookOpen,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  LogIn,
  Languages,
  Sparkles,
  Building,
  Monitor,
  Flame,
} from 'lucide-react';

interface PublicHomeProps {
  onGoToPortal: () => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({ onGoToPortal }) => {
  const { profile, t, language, toggleLanguage, isRtl } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'academic' | 'sports' | 'campus'>('all');

  const teachers = db.getTeachers();
  const notices = db.getNotices().filter((n) => n.isPublic);
  const events = db.getEvents();

  const facilities = [
    {
      title: "Science Laboratory",
      titleUrdu: "سائنس لیبارٹری",
      desc: "Fully equipped with physics, chemistry, and biology experimental apparatus for middle grade curriculum.",
      descUrdu: "مڈل کلاسز کے نصاب کے مطابق فزکس، کیمسٹری اور بیالوجی کے تجرباتی آلات سے آراستہ۔",
      icon: Sparkles,
      color: "from-emerald-500 to-teal-700",
    },
    {
      title: "Computer Lab & IT",
      titleUrdu: "کمپیوٹر لیب و آئی ٹی سینٹر",
      desc: "Modern computer lab with internet access, teaching digital literacy, typing and computer science fundamentals.",
      descUrdu: "جدید کمپیوٹر لیب جہاں طلباء کو ڈیجیٹل تعلیم اور بنیادی کمپیوٹر سائنس سکھائی جاتی ہے۔",
      icon: Monitor,
      color: "from-blue-500 to-indigo-700",
    },
    {
      title: "Nazra Quran & Tajweed Hall",
      titleUrdu: "ناظرہ قرآن و تجوید ہال",
      desc: "Dedicated hall for Nazra Quran, Islamic ethics, character building and daily morning prayers.",
      descUrdu: "ناظرہ قرآن مجید بمعہ ترجمہ و تجوید اور اخلاقی تربیت کے لیے مخصوص پرسکون ہال۔",
      icon: BookOpen,
      color: "from-amber-500 to-orange-700",
    },
    {
      title: "Spacious Sports Ground",
      titleUrdu: "کھیلوں کا وسیع میدان",
      desc: "Large playground for Cricket, Football, Badminton, athletics and annual district tournaments.",
      descUrdu: "کرکٹ، فٹ بال اور دیگر کھیلوں کے لیے وسیع گراؤنڈ جہاں سالانہ ٹورنامنٹس منعقد ہوتے ہیں۔",
      icon: Flame,
      color: "from-rose-500 to-red-700",
    },
    {
      title: "Free Govt Textbooks",
      titleUrdu: "مفت درسی کتب کی فراہمی",
      desc: "100% free government published curriculum textbooks provided to all enrolled students on day one.",
      descUrdu: "حکومت آزاد کشمیر کے تحت تمام رجسٹرڈ طلباء کو مفت درسی کتب کی بروقت فراہمی۔",
      icon: CheckCircle,
      color: "from-teal-500 to-cyan-700",
    },
    {
      title: "Qualified & Experienced Faculty",
      titleUrdu: "تجربہ کار و کوالیفائیڈ اساتذہ",
      desc: "Highly qualified Subject Specialists, SSTs, JMTs, Qari and Physical Education teachers selected via NTS/PSC.",
      descUrdu: "محکمہ تعلیم کے منظور شدہ اعلیٰ تعلیم یافتہ اساتذہ کرام جو بچوں کی ہمہ جہت تربیت کرتے ہیں۔",
      icon: Award,
      color: "from-purple-500 to-violet-700",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Banner with Gov Logo & Language */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-2 px-4 border-b border-emerald-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium">
              {language === 'ur'
                ? "حکومت آزاد ریاست جموں و کشمیر • محکمہ ایلیمنٹری و سیکنڈری ایجوکیشن"
                : "Azad Govt. of the State of Jammu & Kashmir • Dept. of Elementary & Secondary Education"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer bg-emerald-800/80 px-2 py-0.5 rounded text-[11px]"
            >
              <Languages className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'en' ? 'اردو ورژن' : 'English Version'}</span>
            </button>
            <button
              onClick={onGoToPortal}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1 rounded text-xs transition-colors flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('adminPortal')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header / Nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-900 flex items-center justify-center text-white font-black text-xl shadow-md border border-emerald-600/30">
              AJK
            </div>
            <div>
              <h1 className={`text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight ${language === 'ur' ? 'font-urdu' : ''}`}>
                {language === 'ur' ? profile.nameUrdu : profile.name}
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                {language === 'ur' ? profile.addressUrdu : profile.address}
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <a href="#about" className="hover:text-emerald-700 transition-colors">
              {language === 'ur' ? 'تعارف' : 'About'}
            </a>
            <a href="#facilities" className="hover:text-emerald-700 transition-colors">
              {language === 'ur' ? 'سہولیات' : 'Facilities'}
            </a>
            <a href="#classes" className="hover:text-emerald-700 transition-colors">
              {language === 'ur' ? 'جماعتیں' : 'Classes'}
            </a>
            <a href="#teachers" className="hover:text-emerald-700 transition-colors">
              {language === 'ur' ? 'اساتذہ' : 'Faculty'}
            </a>
            <a href="#notices" className="hover:text-emerald-700 transition-colors">
              {language === 'ur' ? 'اعلانات' : 'Notices'}
            </a>
            <a href="#contact" className="hover:text-emerald-700 transition-colors">
              {language === 'ur' ? 'رابطہ' : 'Contact'}
            </a>
          </div>

          <button
            onClick={onGoToPortal}
            className="hidden sm:inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-sm transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-200" />
            <span>{language === 'ur' ? 'اساتذہ / ایڈمن لاگ ان' : 'Staff / Admin Login'}</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-emerald-950 text-white py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <School className="w-3.5 h-3.5" />
                <span>EMIS Code: {profile.code} • Est. {profile.estYear}</span>
              </div>

              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight ${language === 'ur' ? 'font-urdu' : ''}`}>
                {language === 'ur' ? (
                  <>علم، نظم و ضبط اور کردار سازی کا معتبر ادارہ</>
                ) : (
                  <>Inspiring Young Minds in Kaljoor, Dadyal</>
                )}
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                {language === 'ur'
                  ? "گورنمنٹ بوائز مڈل سکول کلجور (تحصیل ڈڈیال، ضلع میرپور آزاد کشمیر) نئی نسل کو معیاری عصری اور دینی تعلیم، سائنسی و کمپیوٹر کی تربیت اور اخلاقی نظم و ضبط فراہم کرنے کے لیے ہمہ وقت کوشاں ہے۔"
                  : "Dedicated to providing high-quality foundational middle schooling, character building, science experiments, computer skills, and religious ethics for boys in Kaljoor and adjoining villages."}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onGoToPortal}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg transition-all text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{language === 'ur' ? 'سکول مینجمنٹ پورٹل میں داخل ہوں' : 'Access School Portal'}</span>
                </button>
                <a
                  href="#about"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-3 rounded-xl border border-white/20 text-sm transition-all"
                >
                  <span>{language === 'ur' ? 'مزید جانیے' : 'Learn More'}</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>

              {/* Quick Highlights Bar */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/10">
                <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-emerald-400">Class 1-8</p>
                  <p className="text-[11px] text-slate-400">Elementary & Middle</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-emerald-400">100% Free</p>
                  <p className="text-[11px] text-slate-400">Govt Textbooks & Tuition</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-emerald-400">BPS Faculty</p>
                  <p className="text-[11px] text-slate-400">Trained Specialists</p>
                </div>
              </div>
            </div>

            {/* Right Card: Headmaster Message Preview */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md relative">
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-700">
                  <img
                    src={teachers[0]?.photoUrl}
                    alt={profile.headTeacherName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-400 shadow-md"
                  />
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-white">
                      {language === 'ur' ? profile.headTeacherNameUrdu : profile.headTeacherName}
                    </h3>
                    <p className="text-xs text-emerald-400 font-medium">
                      {language === 'ur' ? 'صدر مدرس / ہیڈ ماسٹر' : 'Headmaster (BPS-17)'}
                    </p>
                    <p className="text-[11px] text-slate-400">Govt. Boys Middle School Kaljoor</p>
                  </div>
                </div>

                <blockquote className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                  &quot;
                  {language === 'ur'
                    ? "ہمارا اولین مقصد دیہاتی علاقے کے بچوں کو وہ تمام تر مواقع اور سہولیات مہیا کرنا ہے جن سے وہ مستقبل کے باوقار، محنتی اور باصلاحیت شہری بن کر آزاد کشمیر اور پاکستان کا نام روشن کریں۔ والدین کے تعاون اور اساتذہ کی مخلصانہ کاوشوں سے سکول مسلسل کامیابی کی راہ پر گامزن ہے۔"
                    : "Our prime mission is to bestow the children of Kaljoor and rural Dadyal with world-class foundational knowledge, moral compass, and modern IT literacy. With dedicated teachers and proactive parental coordination, we prepare students for high academic honors."}
                  &quot;
                </blockquote>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>M.A Pol. Science, M.Ed</span>
                  <span className="text-emerald-400 font-semibold">Serving Kaljoor Community</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section id="facilities" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {language === 'ur' ? 'سکول کی خصوصیات' : 'School Infrastructure'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              {language === 'ur' ? 'طلباء کے لیے فراہم کردہ جدید سہولیات' : 'Facilities & Learning Environment'}
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              {language === 'ur'
                ? "حکومتی قواعد و ضوابط کے تحت قائم کردہ بہترین تعلیمی اور ہم نصابی وسائل"
                : "Equipped to foster academic excellence, sportsmanship, and civic ethics."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((fac, idx) => {
              const Icon = fac.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-50 hover:bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-200 group"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${fac.color} flex items-center justify-center text-white mb-4 shadow-sm group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                    {language === 'ur' ? fac.titleUrdu : fac.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {language === 'ur' ? fac.descUrdu : fac.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Classes Overview (Class 1 to 8) */}
      <section id="classes" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {language === 'ur' ? 'نصاب تعلیم' : 'Academic Classes'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              {language === 'ur' ? 'جماعت اول تا جماعت ہشتم (1 تا 8)' : 'Elementary & Middle Grade Classes'}
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              {language === 'ur'
                ? "محکمہ تعلیم آزاد کشمیر کے منظور شدہ جدید نصاب کے مطابق باقاعدہ تدریس"
                : "Curriculum aligned with the National Curriculum Framework and AJK Textbook Board."}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((grade) => (
              <div
                key={grade}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all text-center"
              >
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-lg mb-2">
                  {grade}
                </div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                  Class {grade}
                </h4>
                <p className="text-xs text-slate-500 font-urdu">
                  {grade === 1 && "جماعت اول"}
                  {grade === 2 && "جماعت دوم"}
                  {grade === 3 && "جماعت سوم"}
                  {grade === 4 && "جماعت چہارم"}
                  {grade === 5 && "جماعت پنجم"}
                  {grade === 6 && "جماعت ششم"}
                  {grade === 7 && "جماعت ہفتم"}
                  {grade === 8 && "جماعت ہشتم (بورڈ)"}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-emerald-700 font-medium">
                  {grade >= 6 ? "Science & Computers" : "Foundational Skills"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teachers Directory Section (Public View) */}
      <section id="teachers" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {language === 'ur' ? 'معلمین کرام' : 'Our Faculty'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              {language === 'ur' ? 'کوالیفائیڈ و باصلاحیت تدریسی عملہ' : 'Distinguished Faculty Members'}
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              {language === 'ur'
                ? "طلباء کے شاندار مستقبل کی تعمیر کے لیے پرعزم اساتذہ"
                : "Experienced educators dedicated to knowledge, character building and mentoring."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((t) => (
              <div
                key={t.id}
                className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all p-5 flex items-center gap-4"
              >
                <img
                  src={t.photoUrl}
                  alt={t.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-300 flex-shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                    {t.name}
                  </h4>
                  <p className="text-xs font-semibold text-emerald-700">
                    {t.designation} ({t.bps})
                  </p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {t.subject}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {t.qualification}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notice Board & Upcoming Events */}
      <section id="notices" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Notices (7 cols) */}
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    {language === 'ur' ? 'سکول نوٹس بورڈ و اعلانات' : 'Official Notice Board'}
                  </h3>
                  <p className="text-xs text-slate-500">Latest school circulars and notifications</p>
                </div>
              </div>

              <div className="space-y-4">
                {notices.map((notice) => (
                  <div
                    key={notice.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {notice.category}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {notice.date}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base mb-1.5">
                      {language === 'ur' ? notice.titleUrdu : notice.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {language === 'ur' ? notice.contentUrdu : notice.content}
                    </p>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span>Issued by: {notice.author}</span>
                      <span className="text-emerald-700 font-medium">Govt. Boys Middle School Kaljoor</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events (5 cols) */}
            <div className="lg:col-span-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    {language === 'ur' ? 'اہم تقریبات و ایونٹس' : 'Upcoming School Events'}
                  </h3>
                  <p className="text-xs text-slate-500">Co-curricular and national activities</p>
                </div>
              </div>

              <div className="space-y-4">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all"
                  >
                    <img
                      src={evt.photoUrl}
                      alt={evt.title}
                      className="w-full h-36 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex items-center justify-between text-xs text-emerald-700 font-bold mb-1">
                        <span>{evt.category.toUpperCase()}</span>
                        <span className="text-slate-400 font-normal">{evt.date}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">
                        {language === 'ur' ? evt.titleUrdu : evt.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {evt.description}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {evt.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* School Contact & Location */}
      <section id="contact" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-900/50 px-3 py-1 rounded-full border border-emerald-500/30">
                  {language === 'ur' ? 'سکول کا پتہ و رابطہ' : 'Visit & Inquiries'}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {language === 'ur' ? profile.nameUrdu : profile.name}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
                  {language === 'ur'
                    ? "والدین اور معزز شہریوں کو سکول کے اوقات (صبح 8:00 تا دوپہر 1:30) میں سکول آفس تشریف لانے کی دعوت دی جاتی ہے۔ داخلہ فارم، ٹرانسفر سرٹیفیکیٹ اور کسی بھی قسم کی معلومات کے لیے رابطہ فرمائیں۔"
                    : "Parents and community members are welcomed during school hours (8:00 AM to 1:30 PM). Visit the school office for new admissions, B-Form verification and academic inquiries."}
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-sm text-slate-200">
                    <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>{language === 'ur' ? profile.addressUrdu : profile.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-200">
                    <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>{profile.contactPhone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-200">
                    <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>{profile.contactEmail}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 flex flex-col justify-center text-center space-y-4">
                <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">
                  {language === 'ur' ? 'سرکاری انتظامی پورٹل' : 'Administrative Portal Access'}
                </h4>
                <p className="text-xs text-slate-300">
                  {language === 'ur'
                    ? "اساتذہ، کلرک اور ہیڈ ماسٹر پورٹل میں لاگ ان کر کے حاضری، رزلٹ اور طلباء کے ریکارڈ کا انتظام کریں۔"
                    : "For head teacher, teachers and administration staff to manage admissions, marks, results, and official registers."}
                </p>
                <button
                  onClick={onGoToPortal}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-colors shadow-lg text-sm flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{language === 'ur' ? 'ایڈمن لاگ ان کریں' : 'Enter Admin SMS Portal'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-8 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            © {new Date().getFullYear()} Govt. Boys Middle School Kaljoor, Dadyal, Mirpur AJK. All rights reserved.
          </p>
          <p className="text-slate-500">
            Azad Government of the State of Jammu and Kashmir • Education Management Information System (EMIS: 810204)
          </p>
        </div>
      </footer>
    </div>
  );
};
