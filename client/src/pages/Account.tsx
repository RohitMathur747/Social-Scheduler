import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { dummyAccountsData, PLATFORMS } from "../assets/assets";
import AccountList from "../components/AccountList";
import PlatformPickerModel from "../components/PlatformPickerModel";

const Account = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showPlatformPicker, setShowPaltformPicker] = useState(false);

  const fetchAccounts = async (
    isSync = false,
    platform?: string | null,
    successMsg?: string,
  ) => {
    setAccounts(dummyAccountsData);
    if (isSync) console.log("Sync:", { isSync, platform, successMsg });
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    setTimeout(() => {
      setConnecting(null);
      setAccounts((prev) => [...prev, dummyAccountsData[0]]);
      setShowPaltformPicker(false);
    }, 1000);
  };

  const handleDisconnect = async (accountId: string) => {
    setAccounts(accounts.filter((a) => a.id !== accountId));
  };

  const connectedIds = accounts.map((a) => a.platform);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="ml-2 mb-4">
          <h2 className="text-slate-900 text-lg">Connected Accounts</h2>
          <p className="text-slate-700 text-lg">
            {accounts.length} of {PLATFORMS.length} platforms connected
          </p>
        </div>
        <button
          onClick={() => setShowPaltformPicker(true)}
          className="flex items-center gap-2 px-5  py-2.5
           bg-red-500 hover:bg-red-600 text-white rounded-full font-medium 
           transition-all sw:w-auto justify-center w-full"
        >
          <PlusIcon className="size-4" /> Connect Accounts
        </button>
      </div>

      {/* Platform Picker Modal */}
      {showPlatformPicker && (
        <PlatformPickerModel
          connectedIds={connectedIds}
          connecting={connecting}
          onClose={() => setShowPaltformPicker(false)}
          onConnect={handleConnect}
        />
      )}

      {/* Connected accounts List */}
      <AccountList accounts={accounts} onDisconnect={handleDisconnect} />
    </div>
  );
};

export default Account;
