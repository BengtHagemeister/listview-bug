import { ListView } from "../components/ListView";
import { Item } from "@react-stately/collections";
import { useEffect, useState } from "react";

export default function Index() {
  const [set, setSomething] = useState<Array<string>>([]);

  /**
   * UNCOMMENT THIS USEEFFECT TO SEE THE BUG IN ACTION
   *
   */

  // useEffect(() => {
  //   setSomething(["hello"]);
  // }, []);

  return (
    <div style={{ height: "200px", backgroundColor: "red" }}>
      <ListView items={[{ key: 1 }, { key: 2 }]}>
        {(item) => <Item key={item.key}>Hello World</Item>}
      </ListView>
    </div>
  );
}
