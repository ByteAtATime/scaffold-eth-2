import { ReactElement, useState } from "react";
import { TransactionBase, TransactionReceipt, formatEther, isAddress, isHex } from "viem";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/solid";
import { Address } from "~~/components/scaffold-eth";
import { replacer } from "~~/utils/scaffold-eth/common";

type DisplayContent =
  | string
  | number
  | bigint
  | Record<string, any>
  | TransactionBase
  | TransactionReceipt
  | undefined
  | unknown;

export const displayTxResult = (displayContent: DisplayContent | DisplayContent[]): string | ReactElement | number => {
  if (displayContent == null) {
    return "";
  }

  if (typeof displayContent === "bigint") {
    return <NumberDisplay value={displayContent} />;
  }

  if (typeof displayContent === "string") {
    if (isAddress(displayContent)) {
      return <Address address={displayContent} />;
    }

    if (isHex(displayContent)) {
      return displayContent; // don't add quotes
    }
  }

  if (Array.isArray(displayContent)) {
    return <ArrayDisplay value={displayContent} />;
  }

  if (typeof displayContent === "object") {
    return <StructDisplay value={displayContent} />;
  }

  return JSON.stringify(displayContent, replacer, 2);
};

const NumberDisplay = ({ value }: { value: bigint }) => {
  const [isEther, setIsEther] = useState(false);

  const asNumber = Number(value);
  if (asNumber <= Number.MAX_SAFE_INTEGER && asNumber >= Number.MIN_SAFE_INTEGER) {
    return String(value);
  }

  return (
    <span>
      {isEther ? "Ξ" + formatEther(value) : String(value)}
      <span
        className="tooltip tooltip-secondary font-sans ml-2"
        data-tip={isEther ? "Format as number" : "Format as ether"}
      >
        <button className="btn btn-primary btn-circle btn-xs" onClick={() => setIsEther(!isEther)}>
          <ArrowsRightLeftIcon className="h-3 w-3" />
        </button>
      </span>
    </span>
  );
};

export const ObjectFieldDisplay = ({ name, value }: { name: string; value: DisplayContent }) => {
  return (
    <div className="flex flex-row ml-4">
      <span className="text-gray-500 dark:text-gray-400 mr-2">{name}:</span>
      <span className="text-base-content">{displayTxResult(value)}</span>
    </div>
  );
};

const ArrayDisplay = ({ value }: { value: DisplayContent[] }) => {
  return (
    <div className="flex flex-col">
      tuple
      {value.map((v, i) => (
        <ObjectFieldDisplay key={i} name={String(i)} value={v} />
      ))}
    </div>
  );
};

const StructDisplay = ({ value }: { value: Record<string, any> }) => {
  return (
    <div className="flex flex-col">
      struct
      {Object.entries(value).map(([k, v]) => (
        <ObjectFieldDisplay key={k} name={k} value={v} />
      ))}
    </div>
  );
};
