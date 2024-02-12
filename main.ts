import {App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting} from 'obsidian';
import {getAPI, DataviewApi} from "obsidian-dataview";
import {openOrSwitch} from 'obsidian-community-lib/dist/utils';
import {Arr} from "tern";

export default class BreadcrumbPlugin extends Plugin {

	async onload() {
		this.registerEvent(this.app.metadataCache.on("dataview:index-ready", () => {
			// FIXME: fix this probably
			const statusBarItem = this.app.workspace.activeEditor?.titleContainerEl
			this.registerEvent(this.app.workspace.on('file-open', async () => {
					statusBarItem.setText("")
					const file = this.app.workspace.getActiveFile()
					const dv = getAPI(this.app);
					if (dv && file) {
						const pages: Set<string> = new Set();
						const stack = [file.path];

						while (stack.length > 0) {
							const elem = stack.pop();
							const meta = dv.page(elem);
							if (!meta) continue;

							for (const inlink of meta.file.inlinks.array()) {
								if (!inlink.path.contains("+")) continue
								if (pages.has(inlink.path)) continue;
								pages.add(inlink.path);
								stack.push(inlink.path);
							}
						}
						const toRender = Array.from(pages).reverse().concat(file.path)
						let i = 0
						toRender.forEach(p => {
							const page = dv.page(p).file
							const link = statusBarItem.createEl("a", {
								cls: "internal-link 1",
								href: page.path,
								text: `${page.name}`,

							})
							link.onClickEvent(async (evt: MouseEvent) => {
								await openOrSwitch(page.path, evt)
							})
							i += 1
							if (i != toRender.length) {
								statusBarItem.createEl("p", {
									text: ">"
								})
							} else {
								link.style.fontWeight = "bold"
							}
						})
					}
				}))
			})
		)

	}

	onunload() {

	}

}
