import SignOutLink from "./sign-out-link";

export const metadata = { title: "No portal access" };

export default function NoAccess() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow">
        <h1 className="text-lg font-bold text-gray-900">No tenant portal for this account</h1>
        <p className="mt-2 text-sm text-gray-600">
          This account isn&apos;t linked to a current lease. Sign in with the email address your landlord has on file,
          or contact your landlord.
        </p>
        <SignOutLink />
      </div>
    </main>
  );
}
