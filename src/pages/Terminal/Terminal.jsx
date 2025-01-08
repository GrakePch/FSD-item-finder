import { useParams, useSearchParams } from "react-router";
import "./Terminal.css";
import { useEffect } from "react";

const Terminal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const terminalId = useParams().tid;

  useEffect(() => {
    if (searchParams.get("key")) {
      searchParams.delete("key");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);
  return <div className="Terminal">Terminal {terminalId}</div>;
};

export default Terminal;
