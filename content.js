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
    const lesson = `lesson_${window.location.pathname.split("/").pop()}`;
    const regex = new RegExp(`^${lesson}.*${enrollment}$`, "gm");

    const storage = window.localStorage;
    const key = Object.keys(storage).filter((k) => k.match(regex))[0];
    const value = JSON.parse(storage[key]);

    // TODO Use current card type instead of contentBox matching.
    const current = value.cards.filter((card) => {
      if (card.alternatives?.length) {
        const element = card.content.filter((item) => item.contentBox);
        const paragraphs = element[0].contentBox.map(
          (content) => content.paragraph
        );
        return paragraphs.every((element) => description.includes(element));
      } else {
        return false;
      }
    })[0];
    const isDraggable = current.alternatives.every((item) => item.value > 0);

    if (isDraggable) {
      current.alternatives.forEach((alternative) => {
        const boxXpath = `//*[text()='${alternative.description}']`;
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
      const alternatives = current.alternatives.filter(
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
