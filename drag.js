'use strict';

window.addEventListener('DOMContentLoaded', () => {




    const navPanel = document.querySelector('.sidebar-nav__list');
    const navPanelItems = document.querySelectorAll('.sidebar-nav__list-item');
    const widgetBar = document.querySelector('.widget-bar');
    const metersZone = document.querySelectorAll('.meters__zone');
    let metersBox = document.querySelector('.meters');
    const widgets = document.querySelectorAll('.widget-bar__item');
    const widgetBarControll = document.querySelector('.widget-bar-control');
    const widgetBox = document.querySelector('.widget-box');
    const eventTypes = ['mouseenter', 'mouseleave'];


    class Widgets {
        runningTimer = false;
        delay = 0;

        constructor(id, url, delay) {
            this.id = id;
            this.url = url;
            this.currentDelay = delay;
        }

        sendRequest = () => {
            return fetch(this.url);
        };

        startTimer = () => {
            if (!this.isRunning) {
                this.isRunning = true;
                this.executeAction();
                this.delay = this.currentDelay;
            }
        };

        stopTimer = () => {
            clearTimeout(this.timerId);
            this.delay = 0;
            this.isRunning = false;
        };

        executeAction = () => {
            this.timerId = setTimeout(async () => {
                await this.callback();
                if (this.isRunning) {
                    this.executeAction();
                }
            }, this.delay);

        };

        getValue = () => { };

        callback = async () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(this.getValue());
                }, 0);
            });
        };
    }

    class ControlWIdget extends Widgets {

        constructor(...args) {
            super(...args);
            this.timerId = null;
            this.isRunning = false;
        }

        getValue = () => {
            this.sendRequest()
                .then(data => data.json())
                .then(response => this.setValue(response.value))
                .catch(err => console.log(err));
        };

        setValue = (value) => {
            let controlValue = document.querySelector('.w-control__price-data');
            if (value.currentValue > 5.5) {
                controlValue.parentNode.style.background = '#FF7A7A';
            } else if (value.currentValue > value.maxValue) {
                controlValue.parentNode.style.background = '#FF9B1B';
            } else if (value.currentValue < value.minValue) {
                controlValue.parentNode.style.background = '#B9B9B9';
            } else {
                controlValue.parentNode.removeAttribute('style');
            }

            if (controlValue) {
                controlValue.innerHTML = value.currentValue;
            } else {
                false;
            }
        };

        generateHtml = () => {
            let result = document.createElement('div');
            let content = document.createElement('div');
            let priceRow = document.createElement('div');
            let priceRowTitle = document.createElement('div');
            let priceRowData = document.createElement('div');
            let priceRowText = document.createElement('div');
            let plan = document.createElement('div');
            let planRow1 = document.createElement('div');
            let planRowData = document.createElement('div');
            let planRowText = document.createElement('div');
            let planRow2 = document.createElement('div');
            let planRowTitle = document.createElement('div');
            result.classList.add('w-control');
            content.classList.add('w-control__content');
            priceRow.classList.add('w-control__price');
            priceRowTitle.classList.add('w-control__price-title');
            priceRowData.classList.add('w-control__price-data');
            priceRowText.classList.add('w-control__price-data-text');
            plan.classList.add('w-control__plan');
            planRow1.classList.add('w-control__plan-row');
            planRow2.classList.add('w-control__plan-row');
            planRowData.classList.add('w-control__plan-data');
            planRowText.classList.add('w-control__plan-text');
            planRowTitle.classList.add('w-control__plan-title');
            priceRowTitle.innerHTML = 'Цена';
            priceRowText.innerHTML = 'руб./кВт*ч';
            planRowText.innerHTML = '50 руб./кВт*ч';
            planRowTitle.innerHTML = 'План';
            priceRow.append(priceRowTitle, priceRowData, priceRowText);
            planRow1.append(planRowData, planRowText);
            planRow2.append(planRowTitle);
            plan.append(planRow1, planRow2);
            content.append(priceRow, plan);
            result.append(content);

            return content.outerHTML;
        };
    }

    class TableWidget extends Widgets {

        constructor(...args) {
            super(...args);
            this.timerId = null;
            this.isRunning = false;
        }

        getValue = () => {
            this.sendRequest()
                .then(data => data.json())
                .then(response => this.setValue(response))
                .catch(err => console.log(err));
        };


        setValue = (value) => {
            let table = document.querySelector('.w-table__table');

            if (table) {
                let change, currentValue, prevValue, timestep;
                let tbody = document.querySelector('.w-table__tbody');
                if (tbody) {
                    tbody.remove();
                }
                const tableBody = document.createElement('tbody');
                tableBody.classList.add('w-table__tbody');
                table.append(tableBody);

                value.forEach((item, idx) => {
                    ({ change, currentValue, prevValue, timestep } = item);
                    const row = tableBody.insertRow(idx);
                    row.insertCell(0).innerHTML = timestep;
                    row.insertCell(1).innerHTML = currentValue;
                    row.insertCell(2).innerHTML = prevValue;
                    row.insertCell(3).innerHTML = `${(change * 100).toFixed()}%`;
                });
            } else {
                false;
            }
        };

        generateHtml = function () {
            let columns = [
                'Время показателя',
                'Текущее значение',
                'Предыдущее значение',
                'Изменение в долях'
            ];

            let table = document.createElement('table');
            table.classList.add('w-table__table');
            let thead = document.createElement('thead');
            let tr = document.createElement('tr');
            columns.forEach(elem => {
                let th = document.createElement('th');
                th.textContent = elem;
                tr.append(th);
            });
            thead.append(tr);
            table.append(thead);

            return table.outerHTML;
        };
    }

    class GraphWidget extends Widgets {

        constructor(...args) {
            super(...args);
            this.timerId = null;
            this.isRunning = false;
            this.chart = null;
        }

        getValue = () => {
            this.sendRequest()
                .then(data => data.json())
                .then(response => this.setValue(response))
                .catch(err => console.log(err));
        };


        setValue = (value) => {
            const ctx = document.querySelector('.w-graph__chart');
            if (ctx) {
                ctx.remove();
            }

            document.querySelector('.w-graph__content').append(ctx);
            const data = {
                labels: value.map(row => row.timestep),
                datasets: [{
                    label: 'Потребление',
                    data: value.map(row => row.currentValue),
                    fill: false,
                    borderWidth: 2,
                    borderColor: '#000000',
                    backgroundColor: '#FFFFFF',
                    tension: 0
                }]
            };
            Chart.defaults.borderColor = '#000000';

            if (this.chart) {
                this.chart.destroy();
            }
            this.chart = new Chart(ctx, {

                type: 'line',
                data: data,
                options: {
                    legend: {
                        display: false
                    },
                    radius: 5,
                    animation: false,
                    layout: {
                        padding: {
                            top: 20,
                            right: 34,
                            left: 34,
                            bottom: 28
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {

                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'white',
                            },
                            border: {
                                width: 2
                            },
                            ticks: {
                                display: false
                            }
                        },
                        x: {
                            grid: {
                                color: 'white',
                            },
                            border: {
                                width: 2
                            },
                            ticks: {
                                display: false
                            }
                        }
                    }
                },
            });
            ctx.style.backgroundColor = '#FFFFFF';

        };


        generateHtml = function () {

            let graphBlock = document.createElement('div');
            let graphBlockTitle = document.createElement('div');
            let graphBlockChart = document.createElement('canvas');
            graphBlock.classList.add('w-graph__content');
            graphBlockTitle.classList.add('w-graph__title');
            graphBlockChart.classList.add('w-graph__chart');
            graphBlockTitle.innerHTML = 'Потребление';

            graphBlock.append(graphBlockTitle);
            graphBlock.append(graphBlockChart);

            return graphBlock.outerHTML;
        };
    }

    let controlWidget = new ControlWIdget(
        'w-control',
        'https://dashboard.bit76.ru/controlValue',
        5000
    );
    let tableWidget = new TableWidget(
        'w-table',
        'https://dashboard.bit76.ru/tableValues',
        (6000 * 10)
    );
    let graphWidget = new GraphWidget(
        'w-graph',
        'https://dashboard.bit76.ru/graphValues',
        (6000 * 10)
    );

    const allWidgets = {
        [controlWidget.id]: controlWidget,
        [tableWidget.id]: tableWidget,
        [graphWidget.id]: graphWidget
    };


    function widgetBarToggle() {
        widgetBox.classList.toggle('widget-box--open');
    }

    function widgetBarControlToggle() {
        widgetBarControll.classList.toggle('widget-bar-control--open');
    }

    function setHeight(elem1, elem2) {
        if (window.innerWidth > 768) {
            let height = elem2.clientHeight - 159;
            elem1.style.height = height + 'px';
        } else {
            elem1.removeAttribute('style');
        }
    }

    function minifedPanel() {
        if (window.innerWidth > 1023) {
            navPanel.classList.remove('sidebar-nav__list--minifed');
            navPanelItems.forEach(e => {
                e.lastElementChild.classList.remove('visually-hidden');
            });
        } else {
            navPanel.classList.add('sidebar-nav__list--minifed');
            navPanelItems.forEach(e => {
                e.lastElementChild.classList.add('visually-hidden');
            });
        }
    }

    function punchDragControll() {
        if (window.innerWidth > 768) {
            document.querySelector('.content').append(widgetBarControll);
        } else {
            document.querySelector('.header').append(widgetBarControll);
        }
    }

    function hoverWidgetBarControll(event) {
        event.stopPropagation();
        if (window.innerWidth > 1023
            && event.type == 'mouseenter') {
            this.classList.add('widget-bar-control--open');
        } else if (window.innerWidth > 1023 && event.type == 'mouseleave'
            && !widgetBox.classList.contains('widget-box--open')) {
            this.classList.remove('widget-bar-control--open');
        }
    }

    function handleDragStart(e) {
        this.style.opacity = '0.4';
        showWidgetsZone();
        const currentDragElement = e.currentTarget;
        if (currentDragElement.parentNode == widgetBar && widgetBox.classList.contains('widget-box--open')) {
            widgetBarToggle();
            widgetBarControlToggle();
        } else {
            false;
        }
        e.dataTransfer.effectAllowed = 'move';
        let widgetName = e.target.dataset.name;
        if (allWidgets.hasOwnProperty(widgetName) && widgetName == allWidgets[widgetName].id) {
            e.dataTransfer.setData('text/plain', e.target.parentNode.id);
            e.dataTransfer.setData('text/widgetName', e.target.dataset.name);
            e.dataTransfer.setData('text/html', [allWidgets[widgetName].generateHtml()]);
        } else {
            e.dataTransfer.setData('text/plain', e.target.id);
            e.dataTransfer.setData('text/widgetName', e.target.lastElementChild.dataset.name);
            e.dataTransfer.setData('text/html', [allWidgets[e.target.lastElementChild.dataset.name].generateHtml()]);
        }
    }

    function handleDragEnd(e) {

        this.style.opacity = '1';
        showWidgetsZone();
        const currentDragElement = e.currentTarget;
        if (currentDragElement.parentNode == widgetBar || widgetBox.classList.contains('widget-box--open')) {
            false;
        } else {
            widgetBarToggle();
            widgetBarControlToggle();
        }
    }

    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }

        return false;
    }

    function handleDrop(e) {
        e.stopPropagation();

        const id = e
            .dataTransfer
            .getData('text/plain');
        const draggableElement = document.getElementById(id);
        const currentDropzone = e.currentTarget;
        let img = draggableElement.firstElementChild;
        let box = draggableElement.lastElementChild;


        if (currentDropzone == draggableElement || currentDropzone.childNodes.length > 0 && currentDropzone !== widgetBar) {
            false;
        } else {

            if (currentDropzone == widgetBar) {
                img.classList.remove('visually-hidden');
                box.classList.add('hidden');
                box.innerHTML = '';
                currentDropzone.append(draggableElement);

                if (allWidgets[e.dataTransfer.getData('text/widgetName')].timer !== null) {
                    allWidgets[e.dataTransfer.getData('text/widgetName')].stopTimer();
                }

            } else {
                box.classList.remove('hidden');
                img.classList.add('visually-hidden');
                box.innerHTML = e.dataTransfer.getData('text/html');
                currentDropzone.append(draggableElement);

                if (allWidgets[e.dataTransfer.getData('text/widgetName')].timer !== null) {
                    allWidgets[e.dataTransfer.getData('text/widgetName')].startTimer();
                }

            }

        }
    }

    eventTypes.forEach(e => widgetBarControll.addEventListener(e, hoverWidgetBarControll));

    minifedPanel();
    setHeight(widgetBar, metersBox);
    punchDragControll();

    window.addEventListener('resize', () => {
        minifedPanel();
        setHeight(widgetBar, metersBox);
        punchDragControll();
    });

    window.addEventListener('click', (event) => {
        let target = event.target;

        if (target.classList.contains('widget-bar-control')) {
            widgetBarControlToggle();
            widgetBarToggle();
        }
    });

    function showWidgetsZone() {
        metersZone.forEach((item, idx) => {

            if (idx !== metersZone.length - 1 && idx !== metersZone.length - 2) {
                item.classList.toggle(`meters__zone--over-bottom`);
            }
            if (idx % 2 == 0) {
                item.classList.toggle(`meters__zone--over-right`);
            }
        });
    }



    widgetBar.addEventListener('dragover', handleDragOver);
    widgetBar.addEventListener('drop', handleDrop);

    metersZone.forEach(item => {
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);

    });

    widgets.forEach(function (item) {

        item.addEventListener('touchstart', (event) => {
            let target = event.currentTarget;
        });
        item.addEventListener('touchmove', (event) => {
            let target = event.currentTarget;
        });
        item.addEventListener('touchend', (event) => {
            let target = event.currentTarget;
            target.setAttribute('draggable', false);
        });
        
        item.addEventListener('dragstart', handleDragStart, false);
        item.addEventListener('dragend', handleDragEnd, false);
    });
})

