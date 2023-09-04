export const getBreakpointItems = (breakpointData, defaultItems = 1, pageWidth = window.innerWidth) => {
    let breakPoints = Object.keys(breakpointData).map(item => parseInt(item));


    let items = defaultItems;
    breakPoints = breakPoints.sort((a, b) => a - b);

    breakPoints.forEach((breakPoint, index) => {
        if (index === breakPoints.length - 1) {
            if (pageWidth >= breakPoint) {
                items = breakpointData[breakPoint]
            }
        } else {
            let next = breakPoints[index + 1];

            if (index === 0) {
                if (pageWidth <= breakPoint) {
                    items = breakpointData[breakPoint]
                } else {
                    if (pageWidth > breakPoint && pageWidth < next) {
                        items = breakpointData[breakPoint]
                    }
                }
            } else {
                if (pageWidth > breakPoint && pageWidth < next) {
                    items = breakpointData[breakPoint]
                }
            }

        }
    })

    return items;
}
