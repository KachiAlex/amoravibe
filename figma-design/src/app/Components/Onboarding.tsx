import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ArrowRight, ArrowLeft, Check, User, Users, Sparkles, X } from 'lucide-react';

interface FormData {
  firstName: string;
  age: string;
  gender: string;
  sexualOrientation: string;
  community: string;
  lookingFor: string;
  interests: string[];
}

interface OnboardingProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Onboarding({ isOpen, onClose }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    age: '',
    gender: '',
    sexualOrientation: '',
    community: '',
    lookingFor: '',
    interests: [],
  });

  const totalSteps = 4;

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  const interests = [
    'Travel',
    'Fitness',
    'Music',
    'Movies',
    'Cooking',
    'Art',
    'Reading',
    'Gaming',
    'Sports',
    'Photography',
    'Dancing',
    'Yoga',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="min-h-screen px-4 py-8 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="relative w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute -top-4 -right-4 z-10 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>

                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-8"
                >
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                      <Heart className="w-7 h-7 text-white fill-white" />
                    </div>
                    <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      AmoraVibe
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
                    Find Your Perfect Match
                  </h2>
                  <p className="text-lg text-white/90">Let's get to know you better</p>
                </motion.div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    {Array.from({ length: totalSteps }).map((_, index) => (
                      <div key={index} className="flex items-center flex-1">
                        <motion.div
                          initial={false}
                          animate={{
                            backgroundColor:
                              index <= currentStep ? 'rgb(147, 51, 234)' : 'rgb(229, 231, 235)',
                            scale: index === currentStep ? 1.2 : 1,
                          }}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold z-10"
                        >
                          {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
                        </motion.div>
                        {index < totalSteps - 1 && (
                          <motion.div
                            initial={false}
                            animate={{
                              backgroundColor:
                                index < currentStep ? 'rgb(147, 51, 234)' : 'rgb(229, 231, 235)',
                            }}
                            className="h-1 flex-1 mx-2"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
                >
                  <AnimatePresence mode="wait">
                    {/* Step 1: Basic Info */}
                    {currentStep === 0 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <User className="w-6 h-6 text-purple-600" />
                          <h3 className="text-2xl font-bold">Tell Us About Yourself</h3>
                        </div>
                        <div className="space-y-5">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              First Name
                            </label>
                            <input
                              type="text"
                              value={formData.firstName}
                              onChange={(e) => updateFormData('firstName', e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
                              placeholder="Enter your first name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Age
                            </label>
                            <input
                              type="number"
                              value={formData.age}
                              onChange={(e) => updateFormData('age', e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
                              placeholder="Enter your age"
                              min="18"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Gender
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                              {['Male', 'Female', 'Non-binary'].map((gender) => (
                                <button
                                  key={gender}
                                  type="button"
                                  onClick={() => updateFormData('gender', gender)}
                                  className={`py-3 px-4 rounded-xl border-2 transition-all ${
                                    formData.gender === gender
                                      ? 'border-purple-600 bg-purple-50 text-purple-700 font-medium'
                                      : 'border-gray-200 hover:border-purple-300'
                                  }`}
                                >
                                  {gender}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Sexual Orientation & Community */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <Heart className="w-6 h-6 text-purple-600" />
                          <h3 className="text-2xl font-bold">Your Preferences</h3>
                        </div>
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Sexual Orientation
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                'Straight',
                                'Gay',
                                'Lesbian',
                                'Bisexual',
                                'Pansexual',
                                'Asexual',
                              ].map((orientation) => (
                                <button
                                  key={orientation}
                                  type="button"
                                  onClick={() => updateFormData('sexualOrientation', orientation)}
                                  className={`py-3 px-4 rounded-xl border-2 transition-all ${
                                    formData.sexualOrientation === orientation
                                      ? 'border-purple-600 bg-purple-50 text-purple-700 font-medium'
                                      : 'border-gray-200 hover:border-purple-300'
                                  }`}
                                >
                                  {orientation}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Community
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                              <button
                                type="button"
                                onClick={() => updateFormData('community', 'Straight')}
                                className={`py-6 px-6 rounded-2xl border-2 transition-all group ${
                                  formData.community === 'Straight'
                                    ? 'border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50'
                                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                                }`}
                              >
                                <Users
                                  className={`w-8 h-8 mx-auto mb-2 ${
                                    formData.community === 'Straight'
                                      ? 'text-purple-600'
                                      : 'text-gray-400'
                                  }`}
                                />
                                <div className="font-medium">Straight Community</div>
                              </button>
                              <button
                                type="button"
                                onClick={() => updateFormData('community', 'LGBTQ+')}
                                className={`py-6 px-6 rounded-2xl border-2 transition-all group ${
                                  formData.community === 'LGBTQ+'
                                    ? 'border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50'
                                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                                }`}
                              >
                                <Heart
                                  className={`w-8 h-8 mx-auto mb-2 ${
                                    formData.community === 'LGBTQ+'
                                      ? 'text-purple-600 fill-purple-600'
                                      : 'text-gray-400'
                                  }`}
                                />
                                <div className="font-medium">LGBTQ+ Community</div>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Looking For */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <Sparkles className="w-6 h-6 text-purple-600" />
                          <h3 className="text-2xl font-bold">What Are You Looking For?</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          {[
                            { value: 'Long-term relationship', emoji: '💑' },
                            { value: 'Short-term relationship', emoji: '💝' },
                            { value: 'Friendship', emoji: '🤝' },
                            { value: 'Casual dating', emoji: '☕' },
                            { value: 'Not sure yet', emoji: '🤔' },
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => updateFormData('lookingFor', option.value)}
                              className={`py-4 px-6 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                                formData.lookingFor === option.value
                                  ? 'border-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 font-medium'
                                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                              }`}
                            >
                              <span className="text-2xl">{option.emoji}</span>
                              <span>{option.value}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 4: Interests */}
                    {currentStep === 3 && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center gap-3 mb-6">
                          <Sparkles className="w-6 h-6 text-purple-600" />
                          <h3 className="text-2xl font-bold">Your Interests</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                          Select all that apply (Choose at least 3)
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          {interests.map((interest) => (
                            <button
                              key={interest}
                              type="button"
                              onClick={() => toggleInterest(interest)}
                              className={`py-3 px-4 rounded-xl border-2 transition-all ${
                                formData.interests.includes(interest)
                                  ? 'border-purple-600 bg-purple-50 text-purple-700 font-medium'
                                  : 'border-gray-200 hover:border-purple-300'
                              }`}
                            >
                              {interest}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 mt-8">
                    {currentStep > 0 && (
                      <button
                        onClick={prevStep}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-all"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                      </button>
                    )}
                    {currentStep < totalSteps - 1 ? (
                      <button
                        onClick={nextStep}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-all ml-auto"
                      >
                        Next
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-all ml-auto"
                      >
                        Complete
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </motion.div>

                {/* Bottom Text */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center text-gray-600 mt-6"
                >
                  Your information is secure and will only be used to match you with compatible
                  partners.
                </motion.p>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
