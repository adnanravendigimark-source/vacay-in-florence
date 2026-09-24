"use client";

interface SecurityManagerProps {
  error?: string;
  success?: string;
  formAction: (formData: FormData) => void;
}

export function SecurityManager({ error, success, formAction }: SecurityManagerProps) {
  return (
    <div className="max-w-xl rounded-3xl bg-white border border-stone shadow-[0_4px_25px_rgba(43,9,52,0.03)] p-6 sm:p-7">
      <div className="flex items-center gap-3 pb-5 border-b border-stone">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-light text-brand">
          <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-none stroke-current stroke-2">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <div>
          <h2 className="font-display text-xl font-medium text-ink tracking-tight">
            Change Password
          </h2>
          <p className="text-xs text-ink-faint mt-0.5">
            Update your password to keep your account secure.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
          Your password has been updated successfully.
        </div>
      )}

      <form action={formAction} className="mt-6 space-y-4.5">
        {/* Current Password */}
        <div>
          <label htmlFor="currentPassword" className="block text-xs font-medium text-ink mb-1.5">
            Current password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            placeholder="Enter your current password"
            required
            autoComplete="current-password"
            className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone text-xs sm:text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-[#2b0934] focus:ring-1 focus:ring-[#2b0934] transition shadow-2xs"
          />
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="block text-xs font-medium text-ink mb-1.5">
            New password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            placeholder="At least 8 characters"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone text-xs sm:text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-[#2b0934] focus:ring-1 focus:ring-[#2b0934] transition shadow-2xs"
          />
        </div>

        {/* Confirm New Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-medium text-ink mb-1.5">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your new password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full px-4 py-2.5 rounded-2xl bg-white border border-stone text-xs sm:text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-[#2b0934] focus:ring-1 focus:ring-[#2b0934] transition shadow-2xs"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-[#2b0934] hover:bg-[#3d0d4a] text-white text-xs font-semibold px-6 py-2.5 rounded-full transition-all duration-150 shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <span>Update Password</span>
            <span className="text-sm">&rarr;</span>
          </button>
        </div>
      </form>
    </div>
  );
}
