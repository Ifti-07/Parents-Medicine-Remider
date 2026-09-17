'use client';

import { HelpCircle, CheckCircle2, Clock, Phone, Droplets, Eye } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { formatTimeBengali, CORTISOL_SCHEDULE, FOUR_HOUR_SCHEDULE } from '@/lib/scheduling';

export default function HelpPage() {
  return (
    <main className="flex-1">
      {/* Header */}
      <div className="bg-white border-b-2 border-slate-100 px-4 py-5 sticky top-0 z-40">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-slate-900">সাহায্য</h1>
          <p className="text-base text-slate-500 mt-0.5">কীভাবে ব্যবহার করবেন</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">

        {/* Important medical disclaimer */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-5 py-5">
          <div className="flex items-start gap-3">
            <HelpCircle size={24} className="text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-bold text-amber-800 mb-2">গুরুত্বপূর্ণ</h2>
              <p className="text-base text-amber-700 leading-relaxed">
                ওষুধের নাম, সময় ও মাত্রা চিকিৎসকের পরামর্শ/প্রেসক্রিপশন অনুযায়ী ব্যবহার করুন।
              </p>
            </div>
          </div>
        </div>

        {/* How to use */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">কীভাবে ব্যবহার করবেন</h2>
          </div>

          <Accordion type="single" collapsible className="px-5">
            <AccordionItem value="how-to-give">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={22} className="text-green-600 flex-shrink-0" aria-hidden="true" />
                  <span>&quot;দিয়েছি&quot; বাটন কীভাবে চাপতে হবে</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm flex-shrink-0">১</span>
                    <p>হোম পেজে যান এবং ওষুধের কার্ড দেখুন।</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm flex-shrink-0">২</span>
                    <p>ওষুধ দেওয়ার পর বড় সবুজ <strong>&quot;দিয়েছি&quot;</strong> বাটনটি চাপুন।</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm flex-shrink-0">৩</span>
                    <p>বাটন চাপলে ✓ চিহ্ন দেখাবে এবং রেকর্ড সংরক্ষণ হবে।</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cortisol">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Droplets size={22} className="text-blue-600 flex-shrink-0" aria-hidden="true" />
                  <span>কর্টিসল (Cortisol) সম্পর্কে</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <p><strong>প্রতি ২ ঘণ্টায়</strong> একবার দিতে হবে।</p>
                  <p><strong>মাত্রা:</strong> ১ ফোঁটা</p>
                  <p><strong>সময়সূচি:</strong></p>
                  <div className="flex flex-wrap gap-2">
                    {CORTISOL_SCHEDULE.map((h) => (
                      <span key={h} className="px-3 py-1 bg-blue-50 text-blue-800 rounded-lg text-base font-medium border border-blue-100">
                        {formatTimeBengali(h)}
                      </span>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="four-hour">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Eye size={22} className="text-purple-600 flex-shrink-0" aria-hidden="true" />
                  <span>৪ ঘণ্টার ওষুধ (NCL ও Moxibac)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="font-bold text-lg text-blue-900">NCL (এনসিএল)</p>
                    <p className="text-base text-blue-700 mt-1">মাত্রা: ১ ফোঁটা</p>
                    <p className="text-base text-blue-700">প্রতি ৪ ঘণ্টায় একবার</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 border-l-4 border-amber-400">
                    <p className="font-bold text-base text-amber-800">
                      ⚠️ NCL দেওয়ার পর ২ মিনিট অপেক্ষা করুন
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="font-bold text-lg text-green-900">Moxibac (মক্সিব্যাক)</p>
                    <p className="text-base text-green-700 mt-1">মাত্রা: ১ ফোঁটা</p>
                    <p className="text-base text-green-700">NCL এর ২ মিনিট পরে</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 mb-2">৪ ঘণ্টার সময়সূচি:</p>
                    <div className="flex flex-wrap gap-2">
                      {FOUR_HOUR_SCHEDULE.map((h) => (
                        <span key={h} className="px-3 py-1 bg-purple-50 text-purple-800 rounded-lg text-base font-medium border border-purple-100">
                          {formatTimeBengali(h)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="order">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Clock size={22} className="text-orange-600 flex-shrink-0" aria-hidden="true" />
                  <span>ওষুধ দেওয়ার সঠিক ক্রম</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4">
                    <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">১</span>
                    <div>
                      <p className="font-bold text-slate-900">NCL দিন</p>
                      <p className="text-sm text-slate-600">প্রথমে এনসিএল এর ১ ফোঁটা দিন</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0">২</span>
                    <div>
                      <p className="font-bold text-amber-800">২ মিনিট অপেক্ষা করুন</p>
                      <p className="text-sm text-amber-700">অ্যাপ টাইমার দেবে না — নিজে মনে রাখুন</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-green-50 rounded-xl p-4">
                    <span className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0">৩</span>
                    <div>
                      <p className="font-bold text-slate-900">Moxibac দিন</p>
                      <p className="text-sm text-slate-600">তারপর মক্সিব্যাক এর ১ ফোঁটা দিন</p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="schedule">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <Clock size={22} className="text-slate-600 flex-shrink-0" aria-hidden="true" />
                  <span>ওষুধের সময় কখন?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <p>ওষুধের সময় শুরু হয় <strong>সকাল ৮:০০</strong> থেকে।</p>
                  <p>শেষ ওষুধ <strong>রাত ১০:০০ PM</strong> এ।</p>
                  <p>রাত ১১:০০ PM থেকে সকাল ৮:০০ AM পর্যন্ত কোনো রিমাইন্ডার নেই।</p>
                  <div className="bg-slate-50 rounded-xl p-4 mt-2">
                    <p className="text-slate-500 text-sm">সকালে ৮টায় অ্যাপ খুললেই প্রথম ওষুধ দেখাবে।</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Contact */}
        <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 px-5 py-5">
          <div className="flex items-start gap-3">
            <Phone size={24} className="text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-bold text-blue-800 mb-2">সাহায্য দরকার?</h2>
              <p className="text-base text-blue-700 leading-relaxed">
                প্রয়োজনে Admin-এর সাথে যোগাযোগ করুন।
              </p>
              <p className="text-base text-blue-700 mt-2">
                অ্যাপ সমস্যা হলে পৃষ্ঠা রিলোড করুন।
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
