import { initSvg, clearSvg, drawTree } from "./d3.js";
import Queue from "./queue.js";

var xmlString2 = `
<personalInfo>
    <name>John Doe</name>
    <age>30</age>
    <email>john.doe@example.com</email>
    <address>
        <street>123 Main Street</street>
        <city>New York</city>
        <state>NY</state>
        <zip>10001</zip>
    </address>
    <phoneNumbers>
        <phoneNumber type="home">555-1234</phoneNumber>
        <phoneNumber type="work" test="haha">555-5678</phoneNumber>
    </phoneNumbers>
</personalInfo>
`;

initSvg();

document.getElementById("xml-input").addEventListener("blur", function (event) {
  var parser = new DOMParser();
  var xmlString = event.target.value;
  var xmlDoc = parser.parseFromString(xmlString, "application/xml");
  if (xmlString.trim() === "") {
    clearSvg();
    return;
  }
  if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
    alert("XML格式錯誤！");
    return;
  }
  var rootNode = xmlDoc.documentElement;

  var q = new Queue();
  var tree = [];
  var top = 0;
  var typeDict = {
    1: "node",
    2: "attr",
    3: "text",
  };
  q.push(rootNode);
  while (!q.isEmpty()) {
    var node = q.pop();
    var nodeData = {
      nodeName: node.nodeName,
      nodeValue: node.nodeValue,
      nodeType: typeDict[node.nodeType],
      children: [],
    };
    node.childNodes.forEach((childNode) => {
      if (childNode.nodeName === "#text" && childNode.nodeValue.trim() === "") {
        return;
      }
      if (childNode.nodeName === "#text") {
        nodeData.children.push({ id: ++top, type: "text" });
      } else {
        nodeData.children.push({ id: ++top, type: "node" });
      }
      q.push(childNode);
    });
    if (node.attributes) {
      for (let i = 0; i < node.attributes.length; i++) {
        nodeData.children.push({ id: ++top, type: "attr" });
        q.push(node.attributes[i]);
      }
    }
    tree.push(nodeData);
  }
  drawTree(tree);
});

// TODO: 縮放拖移功能、legend、deployment
