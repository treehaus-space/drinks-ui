import { DateTime } from 'luxon';

/*
Wish List:
* Zeige zeit seit annahme
* vll: Zeige order id?
 */

interface FlatOrderItem {
  drink: string;
  amount: number;
}

interface FlatOrderModel {
  id: number;
  table: string;
  items: Array<FlatOrderItem>;
  attendant: string;
  created: string;
  accepted?: string | undefined;
  done?: string | undefined;
}

interface Order {
  source: FlatOrderModel;
  selected: boolean;
  finishTimeout: SnackbarTimer;
}

interface CurrentOrders {
  [orderId: string]: Order;
}

const currentOrders: CurrentOrders = {};
const ordersOl: HTMLElement = document.getElementById('orders');
const snackbarContainerDiv: HTMLElement = document.getElementById('snackbar-container');
let blockerShows: boolean = false;
let userName: string = 'UNDEFINED';
const create = (tagName: string) => document.createElement(tagName);
const userNameSpan: HTMLElement = document.getElementById('user-name');

function setAttendant(orderId: number, attendant: string) {
  currentOrders[orderId].source.attendant = attendant;
  const orderLi = getOrderLiByOrderId(orderId) as HTMLElement;
  const attendantDisplayDiv = orderLi.querySelector('.attendant-display') as HTMLElement;
  attendantDisplayDiv.innerText = attendant;
}

function removeOrdersThatAreNoLongerReceived(fetchedOrders: Array<FlatOrderModel>) {
  doForAllCurrentOrders((orderId) => {
    if (!fetchedOrders.some((fetchedOrder) => fetchedOrder.id === orderId)) {
      deleteOrder(getOrderLiByOrderId(orderId));
    }
  });
}

const processFetchedOrders = (fetchedOrders: Array<FlatOrderModel>) => {
  if (blockerShows) {
    document.getElementById('blocker').style.display = 'none';
    blockerShows = false;
  }
  removeOrdersThatAreNoLongerReceived(fetchedOrders);
  fetchedOrders.forEach((fetchedOrder) => {
    const fetchedOrderInCurrentOrders = fetchedOrder.id in currentOrders;
    if (fetchedOrderInCurrentOrders) {
      const orderLi = getOrderLiByOrderId(fetchedOrder.id);
      const localAttendant = currentOrders[fetchedOrder.id].source.attendant;
      if (localAttendant !== fetchedOrder.attendant) {
        // localAttendant is not fetchedAttendant -> use remote.
        if (!fetchedOrder.attendant) {
          fetchedOrder.attendant = '';
        }
        setAttendant(fetchedOrder.id, fetchedOrder.attendant);
      }

      if (fetchedOrder.done) {
        // already done but still available on client -> Remove the order locally.
        deleteOrder(orderLi);
      } else if (fetchedOrder.accepted) {
        if (!currentOrders[fetchedOrder.id].selected) {
          // accepted but not selected -> select it
          select(getOrderLiByOrderId(fetchedOrder.id));
        }
      } else if (currentOrders[fetchedOrder.id].selected && !fetchedOrder.accepted) {
        console.warn(
          'a locally accepted orders selection status was not (yet) propagated to the server.'
        );
      }
    } else if (!fetchedOrderInCurrentOrders) {
      if (!fetchedOrder.done) {
        // not available on client and not done: Add locally.
        let selected = false;
        if (fetchedOrder.accepted) {
          selected = true;
        }
        currentOrders[fetchedOrder.id] = {
          source: fetchedOrder,
          selected: selected,
          finishTimeout: null,
        };
        renderOrder(fetchedOrder);
        if (selected) select(getOrderLiByOrderId(fetchedOrder.id));
      }
    } else {
      console.warn(
        'fetched order does not match processing scheme, unexpected state reached.',
        fetchedOrder
      );
    }
  });
  return fetchedOrders;
};

function getOrderLiByOrderId(orderId: Number): HTMLOListElement {
  for (let orderLi of ordersOl.childNodes as NodeListOf<HTMLOListElement>) {
    if (parseInt(orderLi.dataset.orderId) === orderId) {
      return orderLi as HTMLOListElement;
    }
  }
  throw 'No order element (li inside of the #orders ul) found with id ' + orderId;
}

function renderOrder(order: FlatOrderModel) {
  const orderLi = create('li');
  orderLi.dataset.orderId = order.id.toString();
  orderLi.style.order = order.id.toString();
  orderLi.addEventListener('click', clickOrderHandler);

  const headlineH2 = create('h2');
  orderLi.appendChild(headlineH2);
  headlineH2.appendChild(document.createTextNode(order.table));

  const ageDisplayDiv = create('div');
  ageDisplayDiv.appendChild(document.createTextNode(''));
  ageDisplayDiv.classList.add('order-age');
  orderLi.appendChild(ageDisplayDiv);

  const attendantDiv = create('div');
  attendantDiv.appendChild(document.createTextNode(order.attendant ? order.attendant : ``));
  attendantDiv.classList.add('attendant-display');
  orderLi.appendChild(attendantDiv);

  const orderItemsUl = create('ul');
  orderLi.appendChild(orderItemsUl);
  ordersOl.appendChild(orderLi);
  order.items.forEach((item) => {
    const orderItemLi = create('li');
    orderItemLi.appendChild(document.createTextNode(item.amount + 'x ' + item.drink));
    orderItemsUl.appendChild(orderItemLi);
  });
  return orderLi;
}

function select(orderLi: HTMLOListElement) {
  orderLi.style.transform = `scale(1.08) rotate(${Math.random() >= 0.5 ? '' : '-'}${
    Math.random() + 1
  }deg)`;
  orderLi.style.background = '#bcfebc linear-gradient(150deg, #88efbb 0%, #bcfec7 100%)';
  currentOrders[orderLi.dataset.orderId].selected = true;
}

function acceptOrderAs(orderId: number, user: string) {
  fetch(`../../order/${orderId}/accept`, {
    method: 'POST',
    body: JSON.stringify({ attendant: user }),
  }).catch((error) => {
    console.error('Error:', error);
  });
}

function clickOrderHandler(event: Event) {
  const orderLi: HTMLOListElement = event.currentTarget as HTMLOListElement;
  const orderId: number = parseInt(orderLi.dataset.orderId);
  const order = currentOrders[orderId];
  if (!order.selected || (order.selected && order.source.attendant !== userName)) {
    // accept or overtake order
    select(orderLi);
    setAttendant(orderId, userName);
    acceptOrderAs(orderId, userName);
  } else {
    // finish order
    if (order.finishTimeout) return;
    fetch(`../../order/${orderId}/done`, { method: 'POST' })
      .then(() => {
        makeFinishReversible(orderLi, order);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
}

function makeFinishReversible(orderLi: HTMLOListElement, order: Order) {
  orderLi.style.display = 'none';
  const snackbarDiv: HTMLDivElement = create('div') as HTMLDivElement;
  snackbarContainerDiv.appendChild(snackbarDiv);
  snackbarDiv.classList.add('snackbar');
  snackbarDiv.appendChild(document.createTextNode(`Bestellung ${order.source.id} abgeschlossen.`));
  const undoButton = create('button');
  undoButton.textContent = '↩ Rückgängig machen';
  undoButton.classList.add('undo-button');
  snackbarDiv.appendChild(undoButton);
  order.finishTimeout = new SnackbarTimer(order.source.id, orderLi, snackbarDiv);
  undoButton.onclick = () => {
    snackbarDiv.innerHTML = '💫 Mache Rückgängig...';
    order.finishTimeout.pause();
    fetch(`../../order/${order.source.id}/accept`, { method: 'DELETE' })
      .then(() => {
        snackbarDiv.remove();
        order.finishTimeout.clear();
        orderLi.style.display = 'unset';
        orderLi.style.transform = 'scale(1)';
        orderLi.style.background = '#fefabc linear-gradient(150deg, #efec88 0%, #fefabc 100%)';
        order.finishTimeout = null;
        order.selected = false;
      })
      .catch((error) => {
        console.error(error);
        snackbarDiv.innerHTML = "(╯°□°）╯︵ ┻━┻ Well, that didn't work...";
      });
  };
}

function updateTimeDisplays() {
  const ageDisplays = document.getElementsByClassName('order-age');
  for (let ageDisplay of ageDisplays) {
    const parentOrder = ageDisplay.parentElement.dataset.orderId;
    const createdAt = DateTime.fromISO(currentOrders[parentOrder].source.created, { zone: 'UTC' });
    const diff = DateTime.local().diff(createdAt, ['minutes', 'seconds']);
    //@ts-ignore
    ageDisplay.textContent = `⏲️ ${diff.values.minutes}:${diff.values.seconds
      .toFixed(0)
      .toString()
      .padStart(2, '0')}`;
  }
}

const fetchOrders = () => {
  fetch('../../orders?only_in_state=created_and_accepted&flat=true')
    .then((response) => response.json())
    .then(processFetchedOrders)
    .catch(() => {
      blockerShows = true;
      document.getElementById('blocker').style.display = 'block';
    });
};

function deleteOrder(orderLi: HTMLOListElement) {
  orderLi.removeEventListener('click', clickOrderHandler);
  orderLi.classList.add('fade-out');
  setTimeout(() => {
    orderLi.remove();
    delete currentOrders[orderLi.dataset.orderId];
  }, 550);
}

// noinspection JSUnusedGlobalSymbols
class SnackbarTimer {
  timerId: number;
  start: number;
  orderLi: HTMLOListElement;
  snackbar: HTMLElement;
  remaining: number;

  constructor(orderId: number, orderLi: HTMLOListElement, snackbarDiv: HTMLDivElement) {
    this.timerId = undefined;
    this.start = undefined;
    this.orderLi = orderLi;
    this.snackbar = snackbarDiv;
    this.remaining = 5000;
    this.resume();
  }

  pause() {
    window.clearTimeout(this.timerId);
    this.remaining -= Date.now() - this.start;
  }

  resume() {
    this.start = Date.now();
    window.clearTimeout(this.timerId);
    this.timerId = this.finishTimeout();
  }

  clear() {
    clearTimeout(this.timerId);
  }

  finishTimeout() {
    return setTimeout(() => {
      deleteOrder(this.orderLi);
      this.snackbar.remove();
    }, this.remaining);
  }
}

function changeUserName(previousUsername: string) {
  userName = prompt('Wie sollen wir dich oder deinen Arbeitsplatz nennen?', previousUsername);
  if (!userName || userName.length === 0) {
    userName = previousUsername;
  }
  window.localStorage.setItem('userName', userName);
  userNameSpan.textContent = userName;

  // Change attendant name on all of the current users orders
  doForAllCurrentOrders((orderId, order) => {
    if (order.source.attendant === previousUsername) {
      const orderIdInt = orderId;
      setAttendant(orderIdInt, userName);
      acceptOrderAs(orderIdInt, userName);
    }
  });
}

type DoForAllNumbersProcessor = (orderId: number, order: Order) => void;

function doForAllCurrentOrders(fun: DoForAllNumbersProcessor) {
  for (const [orderId, order] of Object.entries(currentOrders) as Array<[string, Order]>) {
    fun(parseInt(orderId), order);
  }
}

function setUsernameInitial() {
  userName = window.localStorage.getItem('userName');
  if (!userName) {
    fetch('../../random-name')
      .then((res) => res.json())
      .then((randomUserName) => {
        changeUserName(randomUserName);
      });
  } else {
    userNameSpan.textContent = userName;
  }
}

userNameSpan.onclick = (e) => {
  const target = e.currentTarget as HTMLElement;
  changeUserName(target.innerText);
};

setUsernameInitial();
fetchOrders();
setInterval(updateTimeDisplays, 1000);
setInterval(fetchOrders, 1000);
