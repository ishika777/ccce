"use client";

import * as SignUp from "@clerk/elements/sign-up";
import * as Clerk from "@clerk/elements/common";

export default function SignUpPage() {
    return (
        <div className="grid min-h-screen w-full place-items-center !bg-[#09090b] gradient-button-bg">
            <SignUp.Root>
                <SignUp.Step
                    name="start"
                    className="w-full max-w-md rounded-xl p-8 text-white shadow-xl gradient-button"
                >
                    {/* ---------- Header ---------- */}
                    <header className="text-center">
                        <h1 className="mt-4 text-2xl font-semibold text-gray-100">
                            Create your account
                        </h1>
                    </header>

                    {/* ---------- Global Error ---------- */}
                    <Clerk.GlobalError className="mt-4 block text-sm text-red-400" />

                    {/* ---------- Email Field ---------- */}
                    <Clerk.Field name="emailAddress">
                        <Clerk.Label className="sr-only">Email</Clerk.Label>
                        <Clerk.Input
                            type="email"
                            placeholder="Email"
                            className="mt-4 w-full border-b border-[#4c1d95] bg-transparent
                             px-4 py-2 text-gray-200 placeholder-gray-400
                             focus:border-violet-400 focus:outline-none
                             data-[invalid]:border-red-500 data-[invalid]:text-red-400"
                        />
                        <Clerk.FieldError className="mt-1 text-xs text-red-400" />
                    </Clerk.Field>

                    {/* ---------- Password Field ---------- */}
                    <Clerk.Field name="password">
                        <Clerk.Label className="sr-only">Password</Clerk.Label>
                        <Clerk.Input
                            type="password"
                            placeholder="Password"
                            className="mt-4 w-full border-b border-[#4c1d95] bg-transparent
                             px-4 py-2 text-gray-200 placeholder-gray-400
                             focus:border-violet-400 focus:outline-none
                             data-[invalid]:border-red-500 data-[invalid]:text-red-400"
                        />
                        <Clerk.FieldError className="mt-1 text-xs text-red-400" />
                    </Clerk.Field>

                    {/* ---------- Sign Up Button ---------- */}
                    <SignUp.Action
                        submit
                        className="mt-6 w-full rounded-md bg-violet-700 py-2
                         text-sm font-semibold text-white shadow hover:bg-violet-800
                         focus:outline-none focus:ring-2 focus:ring-violet-400
                         focus:ring-offset-2 focus:ring-offset-[#09090b]"
                    >
                        Sign Up
                    </SignUp.Action>

                    {/* ---------- Divider ---------- */}
                    <div className="my-6 flex items-center gap-3 text-gray-400">
                        <span className="h-px flex-1 bg-gray-600" />
                        or
                        <span className="h-px flex-1 bg-gray-600" />
                    </div>

                    {/* ---------- Google OAuth ---------- */}
                    <Clerk.Connection
                        name="google"
                        className="flex w-full items-center justify-center gap-3 rounded-md
                         border border-gray-700 bg-gray-800 py-2 text-sm font-medium
                         text-gray-200 shadow hover:bg-gray-700 focus:outline-none
                         focus:ring-2 focus:ring-violet-400 focus:ring-offset-2
                         focus:ring-offset-[#09090b]"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            className="h-4 w-4"
                            aria-hidden
                        >
                            <path
                                d="M8.16 7.52v2.187h5.228c-.161 1.226-.57 2.124-1.193 2.755-.764.765-1.955 1.6-4.035 1.6-3.218 0-5.732-2.595-5.732-5.813 0-3.219 2.514-5.814 5.732-5.814 1.733 0 3.005.684 3.938 1.564l1.538-1.538C12.34.96 10.596 0 8.16 0 3.75 0 .046 3.591.046 8s3.704 8 8.114 8c2.382 0 4.178-.782 5.582-2.24 1.44-1.44 1.893-3.475 1.893-5.111 0-.507-.035-.978-.115-1.369H8.16Z"
                                fill="currentColor"
                            />
                        </svg>
                        Sign up with Google
                    </Clerk.Connection>

                    {/* ---------- Footer Link ---------- */}
                    <p className="mt-6 text-center text-sm text-gray-400">
                        Already have an account?{" "}
                        <Clerk.Link
                            navigate="sign-in"
                            className="text-violet-300 hover:underline focus:outline-none
                             focus:ring-2 focus:ring-violet-500"
                        >
                            Sign in
                        </Clerk.Link>
                    </p>
                </SignUp.Step>
                <SignUp.Step
                    name="verifications"
                    className="w-full max-w-md rounded-xl p-8 bg-[#0e0d14] text-white shadow-xl gradient-button"
                >
                    <header className="text-center mb-6">
                        <h1 className="mt-4 text-xl font-semibold tracking-tight text-violet-300">
                            Verify email code
                        </h1>
                    </header>

                    <Clerk.GlobalError className="block text-sm text-red-400 mb-4" />

                    <SignUp.Strategy name="email_code">
                        <Clerk.Field name="code" className="flex justify-center gap-3">
                            <Clerk.Label className="sr-only">Email code</Clerk.Label>

                            <Clerk.Input
                                type="otp"
                                required
                                className="flex w-full items-center justify-center gap-3"
                                render={({ value, status }) => (
                                    <div
                                        data-status={status}
                                        className="relative h-12 w-10 rounded-md bg-[#1c1a2a] ring-1 ring-inset ring-violet-500
                                      data-[status=selected]:ring-violet-900 flex items-center justify-center text-violet-300 font-semibold"
                                    >
                                        {value || "\u00A0"}
                                        {status === "cursor" && (
                                            <div
                                                className="absolute inset-0 z-10 rounded-md border border-violet-500"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </div>
                                )}
                            />
                            <Clerk.FieldError className="sr-only" />
                        </Clerk.Field>

                        <SignUp.Action
                            submit
                            className="mt-6 w-full rounded-md bg-violet-700 py-2
                              text-sm font-semibold text-white shadow hover:bg-violet-800
                              focus:outline-none focus:ring-2 focus:ring-violet-400
                              focus:ring-offset-2 focus:ring-offset-[#09090b]"
                        >
                            Finish registration
                        </SignUp.Action>
                    </SignUp.Strategy>

                    <p className="mt-6 text-center text-sm text-violet-300">
                        Have an account?{" "}
                        <Clerk.Link
                            navigate="sign-in"
                            className="font-medium underline decoration-violet-400 underline-offset-4 outline-none hover:underline focus-visible:underline"
                        >
                            Sign in
                        </Clerk.Link>
                    </p>
                </SignUp.Step>
            </SignUp.Root>
        </div>
    );
}
