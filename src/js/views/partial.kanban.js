var createKanbanPartial = function ({
  onSave= undefined,
  onClose= undefined,
  container=undefined,
  originalData = ""
  }={}) {
  var self ={};
  var objectIsActive = false;
  var catId = undefined
  var timeline = undefined

  var containerBottom = undefined


  let theme = {
    menu : function (name) {
      return `
      <div class="ui mini secondary menu">
        <div class="item">
          <h2>V&V plan, ${name?name:""}</h2>
        </div>
        <div class="item">

        </div>
        <div class="right menu">
          <div class="item">
            <div class="ui clearable multiple dropdown target_timeline_elements_list">
              <div class="text">Filter Capacity</div>
              <i class="filter icon"></i>
              <i class="dropdown icon"></i>
            </div>
          </div>
          <div class="item">
              <div class="ui red button action_vv_set_close">close</div>
          </div>
        </div>
        </div>
      `
    }
  }



  var init = function () {
    connections()
  }
  var connections =function () {
    // document.addEventListener("storeUpdated", async function () {
    //   console.log(objectIsActive,currentSetList);
    //   if (objectIsActive && currentSetList) {
    //
    //   }
    // })
    // connect(".action_vv_set_close","click",(e)=>{
    //   $('.target_timeline_elements_list').dropdown('destroy')
    //   objectIsActive = false;
    //   currentPlanning = undefined;
    //   capacityDataset = undefined;
    //   container.innerHTML=""
    //   ganttObject.destroy()
    //   ganttObject = undefined
    //   sourceOccElement.remove()
    // })
  }

  var prepareData = function (store) {
    let colToItems = []
    let elemDic = {}
    let data = []
    let catData = ephHelpers.createCatData(store)
    let cat = catData.dic[catId]
    let ef = cat._assignedExtraFields
    let efRel = cat._assignedExtraFields.filter(ef=>ef.type =="relation")
    if (efRel[0]) {

       let typeToDisplay = catId
       let relatedNodesLinks = store.metaLinks.filter(m=>m.target==typeToDisplay)
       let relatedNodesId = relatedNodesLinks.map(rn=>rn.source)
       console.log(relatedNodesId);
       // let nodeMap = {}
       // let nodes=[]
       for (var i = 0; i < store.currentPbs.length; i++) {
         elemDic[store.currentPbs[i].uuid] = store.currentPbs[i]
       }


       for (var i = 0; i < store.currentPbs.length; i++) {
        // nodeMap[store.currentPbs[i].uuid] = store.currentPbs[i]
        if (relatedNodesId.includes(store.currentPbs[i].uuid)) {
          // nodes.push(store.currentPbs[i])
          let elem = store.currentPbs[i]
          let allInterfacesWhereSource = store.interfaces.filter(i=>i.target==elem.uuid)
          for (var j = 0; j < allInterfacesWhereSource.length; j++) {
            let interf = allInterfacesWhereSource[j]
            if (!colToItems[interf.source]) {
              colToItems[interf.source] =[]
            }
            colToItems[interf.source].push(elem)
          }
         }
       }
       console.log(colToItems);
       let colToItemsKeys = Object.keys(colToItems)
       console.log(colToItemsKeys);
       for (var i = 0; i < colToItemsKeys.length; i++) {
         let key = colToItemsKeys[i]
         console.log(elemDic);
         console.log(key);
         console.log(elemDic[key]);
         console.log(elemDic[key].name);
         data.push({
           name: elemDic[key].name,
           type: elemDic[key].name,
           color: elemDic[key].color,
           items: colToItems[key].map(i=>i.name),
         })
       }
     }
     console.log(data);
     return data
   }

   var render = async function () {
    var store = await query.currentProject()
    let data = prepareData(store)
    let domElement = document.querySelector(container)
    renderDomMarkup(domElement)
    setUpKanban(data)
  }

  var setUpKanban = function (data) {
    console.log("starkanvan");
      const dragContainer = document.querySelector('.drag-container');
      const boardContainer = document.querySelector('.kanban-demo .board-container');
      const board = document.querySelector('.kanban-demo .board');
      const colTemplate = document.querySelector('.board-column-template');
      const itemTemplate = document.querySelector('.board-item-template');
      const colGrids = [];

      let colDragCounter = 0;

      //
      // INIT BOARD GRID
      //

      const boardGrid = new Muuri(board, {
        layoutDuration: 300,
        layoutEasing: 'cubic-bezier(0.625, 0.225, 0.100, 0.890)',
        layout: (grid, layoutId, items, width, height, callback) => {
          Muuri.defaultPacker.setOptions({ horizontal: true });
          return Muuri.defaultPacker.createLayout(
            grid,
            layoutId,
            items,
            width,
            height,
            (layoutData) => {
              delete layoutData.styles;
              callback(layoutData);
            }
          );
        },
        dragEnabled: true,
        dragAxis: 'x',
        dragSortHeuristics: {
          sortInterval: 0,
        },
        dragHandle: '.board-column-title',
        dragRelease: {
          duration: 300,
          esaing: 'cubic-bezier(0.625, 0.225, 0.100, 0.890)',
          useDragContainer: false,
        },
        dragAutoScroll: {
          targets: [{ element: boardContainer, axis: Muuri.AutoScroller.AXIS_X }],
        },
      })
        .on('dragInit', () => {
          if (!colDragCounter) {
            const width = boardGrid.getItems().reduce((a, item) => a + item.getWidth(), 0);
            board.style.width = `${width}px`;
            board.style.overflow = 'hidden';
          }
          ++colDragCounter;
        })
        .on('dragEnd', () => {
          --colDragCounter;
        })
        .on('dragReleaseEnd', () => {
          if (!colDragCounter) {
            board.style.width = '';
            board.style.overflow = '';
          }
        });

      //
      // CREATE INITIAL COLUMN GRIDS
      //
      data.forEach(({ name, type, color, items }, i) => {
        window.setTimeout(() => {
          addCol(name, type, color, (grid) => {
            items.reverse().forEach((item, i) => {
              window.setTimeout(() => {
                addColItem(grid, item);
              }, i * 100);
            });
          });
        }, i * 100);
      });

      //
      // BIND ACTIONS
      //

      // Toggle edit.
      let selectedItemElem = null;
      let selectedTitleElem = null;
      board.addEventListener('click', (e) => {
        if (e.target.matches('.board-item-action.edit')) {
          const editElem = e.target;
          const itemElem = editElem.closest('.board-item');
          const titleElem = itemElem.querySelector('.board-item-title');
          const activate = selectedItemElem !== itemElem;

          if (selectedItemElem) {
            selectedItemElem.classList.remove('editing');
            selectedTitleElem.setAttribute('contenteditable', false);
            selectedTitleElem.setAttribute('focusable', false);
            selectedTitleElem.setAttribute('tabindex', '');
            selectedTitleElem.blur();
            selectedItemElem = null;
            selectedTitleElem = null;
          }

          if (activate) {
            selectedItemElem = itemElem;
            selectedTitleElem = titleElem;
            selectedItemElem.classList.add('editing');
            selectedTitleElem.setAttribute('contenteditable', true);
            selectedTitleElem.setAttribute('focusable', true);
            selectedTitleElem.setAttribute('tabindex', 0);
            selectedTitleElem.focus();
          }
        }
      });

      // Add column item.
      board.addEventListener('click', (e) => {
        if (e.target.matches('.board-column-action.add')) {
          const gridElem = e.target.closest('.board-column').querySelector('.board-column-items');
          const grid = colGrids.reduce((acc, grid) => {
            if (acc) return acc;
            return grid.getElement() === gridElem ? grid : undefined;
          }, undefined);
          addColItem(grid, 'Hello world!');
        }
      });

      // Remove column item.
      board.addEventListener('click', (e) => {
        if (e.target.matches('.board-item-action.delete')) {
          const itemElem = e.target.closest('.board-item');
          const item = colGrids.reduce((acc, grid) => acc || grid.getItem(itemElem), undefined);
          const grid = item.getGrid();
          grid.hide([item], {
            onFinish: () => {
              grid.remove([], { removeElements: true });
            },
          });
        }
      });

      // Update layout when title is modified.
      board.addEventListener('input', (e) => {
        if (e.target.matches('.board-item-title')) {
          const itemElem = e.target.closest('.board-item');
          const item = colGrids.reduce((acc, grid) => acc || grid.getItem(itemElem), undefined);
          const width = item.getWidth();
          const height = item.getHeight();
          const grid = item.getGrid();

          grid.refreshItems([item]);

          if (width !== item.getWidth() || height !== item.getHeight()) {
            grid.layout();
          }
        }
      });

      //
      // UTILS
      //

      function addCol(title = '', type = 'todo', color="#29b5ad", onReady = null) {
        // Create column element.
        const colElem = document.importNode(colTemplate.content.children[0], true);
        colElem.classList.add(type);
        colElem.querySelector('.board-column-header').style.backgroundColor = color;
        colElem.querySelector('.board-column-title').innerHTML = title;

        // Add column to the board.
        boardGrid.show(
          boardGrid.add([colElem], {
            active: false,
          }),
          {
            onFinish: () => {
              const grid = new Muuri(colElem.querySelector('.board-column-items'), {
                items: '.board-item',
                showDuration: 300,
                showEasing: 'ease',
                hideDuration: 300,
                hideEasing: 'ease',
                layoutDuration: 300,
                layoutEasing: 'cubic-bezier(0.625, 0.225, 0.100, 0.890)',
                dragEnabled: true,
                dragSort: () => colGrids,
                dragContainer: dragContainer,
                dragHandle: '.board-item-handle',
                dragRelease: {
                  duration: 300,
                  easing: 'cubic-bezier(0.625, 0.225, 0.100, 0.890)',
                  useDragContainer: true,
                },
                dragPlaceholder: {
                  enabled: true,
                  createElement: (item) => item.getElement().cloneNode(true),
                },
                dragAutoScroll: {
                  targets: (item) => {
                    return [
                      window,
                      {
                        element: boardContainer,
                        priority: 1,
                        axis: Muuri.AutoScroller.AXIS_X,
                      },
                      {
                        element: item.getGrid().getElement().parentNode,
                        priority: 1,
                        axis: Muuri.AutoScroller.AXIS_Y,
                      },
                    ];
                  },
                  sortDuringScroll: false,
                },
              })
                .on('dragInit', (item) => {
                  const style = item.getElement().style;
                  style.width = item.getWidth() + 'px';
                  style.height = item.getHeight() + 'px';
                })
                .on('beforeSend', ({ item, toGrid }) => {
                  const style = item.getElement().style;
                  style.width = toGrid._width - 20 + 'px';
                  toGrid.refreshItems([item]);
                })
                .on('dragReleaseEnd', (item) => {
                  const style = item.getElement().style;
                  style.width = '';
                  style.height = '';
                  grid.refreshItems([item]);
                })
                .on('layoutEnd', () => {
                  boardGrid.layout();
                });

              colGrids.push(grid);

              if (onReady) onReady(grid);
            },
          }
        );
      }

      function addColItem(colGrid, title = '', onReady = null) {
        const itemElem = document.importNode(itemTemplate.content.children[0], true);
        const titleElem = itemElem.querySelector('.board-item-title');
        titleElem.innerHTML = title;
        colGrid.show(
          colGrid.add([itemElem], {
            active: false,
            index: 0,
            onFinish: (items) => {
              if (onReady) onReady(items[0]);
            },
          })
        );
      }



  }

  var renderDomMarkup =function (container) {
    container.innerHTML = `
    <div class="drag-container"></div>
    <section style="height:100%; width:100%;" class="kanban-demo">
      <div style="height:100%; width:100%;"  class="demo">
        <template class="board-item-template">
          <div class="board-item">
            <div class="board-item-content">
              <div class="board-item-title"></div>
              <div class="board-item-handle"></div>
              <div class="board-item-action edit">
                <svg
                  class="board-item-action-icon icon-edit"
                  aria-hidden="true"
                  focusable="false"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 576 512"
                >
                  <path
                    fill="currentColor"
                    d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"
                  ></path>
                </svg>
                <svg
                  class="board-item-action-icon icon-save"
                  aria-hidden="true"
                  focusable="false"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="currentColor"
                    d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"
                  ></path>
                </svg>
              </div>
              <div class="board-item-action delete">
                <svg
                  class="board-item-action-icon icon-delete"
                  aria-hidden="true"
                  focusable="false"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                >
                  <path
                    fill="currentColor"
                    d="M439.15 453.06L297.17 384l141.99-69.06c7.9-3.95 11.11-13.56 7.15-21.46L432 264.85c-3.95-7.9-13.56-11.11-21.47-7.16L224 348.41 37.47 257.69c-7.9-3.95-17.51-.75-21.47 7.16L1.69 293.48c-3.95 7.9-.75 17.51 7.15 21.46L150.83 384 8.85 453.06c-7.9 3.95-11.11 13.56-7.15 21.47l14.31 28.63c3.95 7.9 13.56 11.11 21.47 7.15L224 419.59l186.53 90.72c7.9 3.95 17.51.75 21.47-7.15l14.31-28.63c3.95-7.91.74-17.52-7.16-21.47zM150 237.28l-5.48 25.87c-2.67 12.62 5.42 24.85 16.45 24.85h126.08c11.03 0 19.12-12.23 16.45-24.85l-5.5-25.87c41.78-22.41 70-62.75 70-109.28C368 57.31 303.53 0 224 0S80 57.31 80 128c0 46.53 28.22 86.87 70 109.28zM280 112c17.65 0 32 14.35 32 32s-14.35 32-32 32-32-14.35-32-32 14.35-32 32-32zm-112 0c17.65 0 32 14.35 32 32s-14.35 32-32 32-32-14.35-32-32 14.35-32 32-32z"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </template>

        <template class="board-column-template">
          <div class="board-column">
            <div class="board-column-content">
              <div class="board-column-header">
                <div class="board-column-title"></div>
                <button class="board-column-action add">
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                  >
                    <path
                      fill="currentColor"
                      d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"
                    ></path>
                  </svg>
                </button>
              </div>
              <div class="board-column-items-container">
                <div class="board-column-items"></div>
              </div>
            </div>
          </div>
        </template>

        <div style="height:100%" class="board-container">
          <div class="board"></div>
        </div>
      </div>
    </section>`
  }





  var updateModule = function (store) {
    let data = prepareData(store)
    // timeline.setItems(data)
  }
  var update = function () {
      render()
  }
  // var update = function (uuid) {
  //   if (uuid) {
  //     currentSetUuid = uuid
  //     render(uuid)
  //   }else if(currentSetUuid) {
  //     render(currentSetUuid)
  //   }else {
  //     render()
  //     console.log("no set found");
  //     return
  //   }
  //
  // }

  var setActive =function (data) {
    if (data) {
      catId = data.catId
    }
    objectIsActive = true;
    update()
  }

  var setInactive = function () {
    objectIsActive = false;
  }

  self.updateModule = updateModule
  // self.setPlanningMode = setPlanningMode
  // self.eventsTimeline = eventsTimeline
  self.setActive = setActive
  self.setInactive = setInactive
  self.update = update
  self.init = init

  return self
}

// var timelinePartial = createTimelinePartial()
// timelinePartial.init()
// createInputPopup({originalData:jsonFile})
