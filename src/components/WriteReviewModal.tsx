import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { User, Review } from '../types/index.ts';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  currentUser: User;
  stayDate: string;
  onSubmitReview: (review: Omit<Review, 'id' | 'date'>) => Promise<void>;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  listingId,
  listingTitle,
  currentUser,
  stayDate,
  onSubmitReview
}) => {
  const [overallRating, setOverallRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [cleanliness, setCleanliness] = useState(5);
  const [accuracy, setAccuracy] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [locationScore, setLocationScore] = useState(5);
  const [checkInScore, setCheckInScore] = useState(5);
  const [valueScore, setValueScore] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim().length < 15) {
      setError('Please write at least 15 characters sharing your experience.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onSubmitReview({
        listingId,
        userId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        authorLocation: 'Verified Guest',
        rating: overallRating,
        stayDate,
        comment: comment.trim(),
        ratingsBreakdown: {
          cleanliness,
          accuracy,
          communication,
          location: locationScore,
          checkIn: checkInScore,
          value: valueScore
        }
      });
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not submit your review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-neutral-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Review your stay</h3>
            <p className="text-xs text-neutral-500 truncate max-w-xs">{listingTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Overall Star Rating */}
          <div className="text-center py-2 bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
            <span className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
              Overall Experience
            </span>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setOverallRating(star)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || overallRating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-neutral-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="inline-block mt-1 text-xs font-semibold text-neutral-700">
              {overallRating === 5 ? 'Exceptional · 5 Stars' : `${overallRating} Stars`}
            </span>
          </div>

          {/* Sub-categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
              Category Breakdown
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { label: 'Cleanliness', val: cleanliness, set: setCleanliness },
                { label: 'Accuracy', val: accuracy, set: setAccuracy },
                { label: 'Communication', val: communication, set: setCommunication },
                { label: 'Location', val: locationScore, set: setLocationScore },
                { label: 'Check-in', val: checkInScore, set: setCheckInScore },
                { label: 'Value', val: valueScore, set: setValueScore }
              ].map((cat) => (
                <div key={cat.label} className="p-2.5 border border-neutral-200 rounded-xl flex items-center justify-between">
                  <span className="font-medium text-neutral-800">{cat.label}</span>
                  <select
                    value={cat.val}
                    onChange={(e) => cat.set(Number(e.target.value))}
                    className="border border-neutral-300 rounded-md px-1.5 py-0.5 text-xs font-semibold bg-white"
                  >
                    {[5, 4, 3, 2, 1].map(n => (
                      <option key={n} value={n}>{n} ★</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
              Your Review
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (error) setError('');
              }}
              placeholder="What made this stay memorable? Mention the architecture, cleanliness, host hospitality, or surrounding neighborhood..."
              className="w-full p-3.5 border border-neutral-300 rounded-2xl text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none"
            />
            {error && <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>}
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
            >
              {isSubmitting ? 'Submitting…' : 'Submit Verified Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
