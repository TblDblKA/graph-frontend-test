import React from "react";
import { it, expect } from "vitest";
import { render, within, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import graphs from "../src/mocks/graphs";
import { App } from "../src/App";

function setup(jsx: JSX.Element) {
    return {
        user: userEvent.setup(),
        ...render(jsx),
    };
}

it("Приложение отображается", () => {
    render(<App />);
});

it("Есть выпадающий список со всеми доступными графами", async() => {
    const { getByRole } = setup(<App />);
    const options = await waitFor(() => within(getByRole("combobox")).getAllByRole("option"))

    expect(options.length).toBe(graphs.length);
});

it("Выбранный граф отображается после выбора в выпадающем списке", async () => {
    const selectedGraph = 2;
    const { getByRole, findByText, user } = setup(<App />);

    await waitFor(() => user.selectOptions(getByRole("combobox"), `${selectedGraph}`))

    for (let node of graphs[selectedGraph].nodes) {
        await findByText(node.name);
    }
});

it("Узлы в простом графе организованы в столбцы", async () => {
    const selectedGraph = 1;
    const { getByRole, findByText, user } = setup(<App />);

    const correctColumns = [["start"], ["foo", "bar"], ["end1", "end2"]];

    await waitFor(() => user.selectOptions(getByRole("combobox"), `${selectedGraph}`))

    for (let idx = 0; idx < correctColumns.length; idx++) {
        const col = correctColumns[idx];
        const otherCols = correctColumns.flatMap((c, i) => (i === idx ? [] : c));
        console.log(correctColumns[idx], otherCols);

        let parent = await findByText(col[0]);
        console.log(parent);
        while (parent) {
            parent = parent.parentElement as HTMLElement;
            const hasEveryCorrect = col.every((n) => !!within(parent).queryByText(n));
            const doesntHaveAnyOther = otherCols.every(
                (n) => !within(parent).queryByText(n)
            );
            if (hasEveryCorrect) {
                console.log(parent)
                expect(doesntHaveAnyOther).toBeTruthy();
                break;
            }
        }

        expect(parent).not.toBeNull();
    }
});