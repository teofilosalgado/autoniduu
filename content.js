function onClicked() {
  const descriptionElements = document.evaluate(
    "//div[@class='content-box']/p",
    document,
    null,
    XPathResult.ORDERED_NODE_ITERATOR_TYPE,
    null
  );
  if (descriptionElements) {
    let description = [];
    while ((descriptionElement = descriptionElements.iterateNext())) {
      description.push(descriptionElement.innerHTML);
    }

    const params = new URLSearchParams(window.location.search);
    const enrollment = `enrollment_${params.get("enrollmentId")}`;

    const storage = window.localStorage;
    const key = Object.keys(storage).filter((k) => k.endsWith(enrollment))[0];
    const value = JSON.parse(storage[key]);

    const choosen = value.cards.filter((card) => {
      if (card.alternatives?.length) {
        const paragraphs = card.content[0].contentBox.map(
          (content) => content.paragraph
        );
        return paragraphs.every((element) => description.includes(element));
      } else {
        return false;
      }
    })[0];

    const isDraggable = choosen.alternatives.every((item) => item.value > 0);

    if (isDraggable) {
      choosen.alternatives.forEach((alternative) => {
        const boxXpath = `//p[text()='${alternative.description}']`;
        const boxMatchingElement = document.evaluate(
          boxXpath,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;
        if (boxMatchingElement) {
          boxMatchingElement.innerHTML = `<b>(${alternative.value})</b> ${boxMatchingElement.innerHTML}`;
        }
      });
    } else {
      const alternatives = choosen.alternatives.filter(
        (item) => item.value === 1
      );
      alternatives.forEach((alternative) => {
        const labelXpath = `//label[text()='${alternative.description}']`;
        const inputXpath = `${labelXpath}/parent::span/parent::div/input`;

        const labelMatchingElement = document.evaluate(
          labelXpath,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;
        const inputMatchingElement = document.evaluate(
          inputXpath,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;
        if (labelMatchingElement && inputMatchingElement) {
          labelMatchingElement.style.color = "green";
          labelMatchingElement.style.textDecoration = "underline";
          inputMatchingElement.click();
        }
      });
    }
  }
}

browser.runtime.onMessage.addListener(onClicked);
