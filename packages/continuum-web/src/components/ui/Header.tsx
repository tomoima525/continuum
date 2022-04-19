/* This example requires Tailwind CSS v2.0+ */
import { Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { MenuIcon, XIcon } from '@heroicons/react/outline';
import { shortenName } from 'utils/userName';
import { GradientBtn } from './GradientBtn';
import { useSession } from 'next-auth/react';

const userNavigation = [{ name: 'Disconnect', href: '/', id: 'disconnect' }];

function classNames(...classes: unknown[]) {
  return classes.filter(Boolean).join(' ');
}

export const Header = ({
  isLoggingIn,
  onLoginRequested,
  onSignOutRequested,
}: {
  isLoggingIn: boolean;
  onLoginRequested: () => Promise<void>;
  onSignOutRequested: () => Promise<void>;
}) => {
  const session = useSession();

  const handleConnectBtn = async () => {
    await onLoginRequested();
  };

  const handleSignOut = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();
    await onSignOutRequested();
  };
  return (
    <Disclosure as="nav" className="bg-proved-500">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link
                  href={session.status === 'authenticated' ? '/home' : '/'}
                  passHref
                >
                  <a className="flex-shrink-0 flex items-center">
                    <Image
                      width={196}
                      height={24}
                      src="/continuum-logo.svg"
                      alt="Logo"
                    />
                  </a>
                </Link>
              </div>
              <div className="flex items-center">
                <div className="ml-2 mr-2 flex items-center md:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                {/** user.isAuthenticated */}
                {session.status === 'authenticated' ? (
                  <div className="hidden md:ml-4 md:flex-shrink-0 md:flex md:items-center">
                    {/* Profile dropdown */}
                    <Menu as="div" className="ml-3 relative">
                      <div>
                        <Menu.Button className="bg-gray-800 flex text-sm rounded-full ">
                          <GradientBtn
                            onClick={async e => {
                              // await handleSignOut(e);
                            }}
                          >
                            {shortenName(session.data.user?.name || '')}
                          </GradientBtn>
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {userNavigation.map(item => (
                            <Menu.Item key={item.name}>
                              {({ active }) => {
                                if (item.id === 'disconnect') {
                                  return (
                                    <button
                                      className={classNames(
                                        active ? 'bg-gray-100' : '',
                                        'block px-4 py-2 text-sm text-gray-700 w-full text-left',
                                      )}
                                      onClick={handleSignOut}
                                    >
                                      {item.name}
                                    </button>
                                  );
                                }
                                return (
                                  <Link href={item.href} passHref>
                                    <a
                                      className={classNames(
                                        active ? 'bg-gray-100 ' : '',
                                        'block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100',
                                      )}
                                    >
                                      {item.name}
                                    </a>
                                  </Link>
                                );
                              }}
                            </Menu.Item>
                          ))}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                ) : (
                  <div className="hidden md:flex md:items-center md:ml-4">
                    <GradientBtn
                      onClick={handleConnectBtn}
                      disabled={isLoggingIn}
                    >
                      Connect Wallet
                    </GradientBtn>
                    {isLoggingIn && (
                      <div className="self-center ml-2">
                        <div className="animate-spin rounded-full px-2 self-center h-4 w-4 border-t-2 border-b-2 border-indigo-500" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/** Mobile Dropdown */}
          <Disclosure.Panel className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {session.status === 'authenticated' ? (
                <div className="flex-shrink-0">
                  <GradientBtn
                    onClick={() => {
                      // Do nothing
                    }}
                  >
                    {shortenName(session.data.user?.name || '')}
                  </GradientBtn>

                  <div className="pt-4 pb-3 border-t border-gray-700">
                    <div className="mt-3 px-2 space-y-1 sm:px-3">
                      {userNavigation.map(item => {
                        if (item.id === 'disconnect') {
                          return (
                            <button
                              key={item.name}
                              onClick={handleSignOut}
                              className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                            >
                              {item.name}
                            </button>
                          );
                        }
                        return (
                          <Link key={item.name} href={item.href} passHref>
                            <button className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700">
                              {item.name}
                            </button>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-shrink-0">
                  <GradientBtn onClick={handleConnectBtn}>
                    Connect Wallet
                  </GradientBtn>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};
