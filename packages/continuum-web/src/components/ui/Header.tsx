/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useNetwork } from 'wagmi';
import Image from 'next/image';
import Link from 'next/link';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { MenuIcon, XIcon } from '@heroicons/react/outline';
import { shortenName } from 'utils/userName';
import { switchNetwork } from 'utils/switchNetwork';
import { GradientBtn } from './GradientBtn';
import network from 'utils/networks.json';

const userNavigation = [{ name: 'Disconnect', href: '/', id: 'disconnect' }];

function classNames(...classes: unknown[]) {
  return classes.filter(Boolean).join(' ');
}

const env = process.env.NEXT_PUBLIC_ENV as string;

const WalletButton = ({
  children,
  isLoggingIn,
  onHandleConnect,
}: {
  children: React.ReactNode;
  isLoggingIn: boolean;
  onHandleConnect: () => Promise<void>;
}) => {
  const { activeChain } = useNetwork();
  const [shouldSwitch, setShouldSwitch] = useState(false);
  const [networkName, setNetworkName] = useState<string | null>(null);
  const session = useSession();

  useEffect(() => {
    if (!activeChain?.id) return;
    switch (activeChain?.id.toString()) {
      // Harmony mainnet
      case network[1666600000].chainId:
        setShouldSwitch(env !== 'prod');
        setNetworkName('Harmony Mainnet');
        break;
      // Harmony testnet
      case network[1666700000].chainId:
        setShouldSwitch(env !== 'dev');
        setNetworkName('Harmony Testnet');
        break;
      default:
        setShouldSwitch(true);
        setNetworkName(`${activeChain.name} (Not supported)`);
    }
  }, [activeChain]);

  if (shouldSwitch) {
    return (
      <div className="hidden md:flex md:items-center md:ml-4">
        {networkName && (
          <div className="text-lg text-gray-500 pr-3">{networkName}</div>
        )}
        <GradientBtn onClick={switchNetwork} disabled={isLoggingIn}>
          Switch Network
        </GradientBtn>
        {isLoggingIn && (
          <div className="self-center ml-2">
            <div className="animate-spin rounded-full px-2 self-center h-4 w-4 border-t-2 border-b-2 border-indigo-500" />
          </div>
        )}
      </div>
    );
  }

  if (session.status === 'authenticated') {
    return (
      <div className="hidden md:ml-4 md:flex-shrink-0 md:flex md:items-center">
        {networkName && (
          <div className="text-lg text-gray-500 pr-3">{networkName}</div>
        )}
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
            {children}
          </Transition>
        </Menu>
      </div>
    );
  }
  // Not connected
  return (
    <div className="hidden md:flex md:items-center md:ml-4">
      <GradientBtn onClick={onHandleConnect} disabled={isLoggingIn}>
        Connect Wallet
      </GradientBtn>
      {isLoggingIn && (
        <div className="self-center ml-2">
          <div className="animate-spin rounded-full px-2 self-center h-4 w-4 border-t-2 border-b-2 border-indigo-500" />
        </div>
      )}
    </div>
  );
};

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
                  <a className="flex ">
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
                <WalletButton
                  isLoggingIn={isLoggingIn}
                  onHandleConnect={handleConnectBtn}
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
                </WalletButton>
              </div>
            </div>
          </div>
          {/** Mobile Dropdown.  */}
          <Disclosure.Panel className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <div className="flex-shrink-0">
                <GradientBtn onClick={() => {}}>
                  Mobile not supported. Use browser
                </GradientBtn>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};
