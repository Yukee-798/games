var $ = e => document.querySelector(e) || document.getElementById(e) || document.getElementsByClassName(e)[0];
var mapNodeList = $('.container').children;
var myConsole = $('console');

// 食物类
class Food {
    // 记录蛇占据的位置
    static snakeSpace = [];
    // 记录食物存放过的位置
    static foodArr = [];
    // 记录当前食物存在的位置
    postion = this.randomFood();

    constructor() {
        Food.foodArr.push(this.postion);
        // 在页面中渲染
        this.render();
    }

    // 不在蛇身上生成食物
    randomFood() {
        // 生成一个 0 ～ 2499 的随机数
        let index = Math.round(Math.random() * 2499);
        while (Food.snakeSpace.includes(index)) {
            index = Math.round(Math.random() * 2499);
        }
        return index;
    }
    render() {
        mapNodeList[this.postion].style.background = 'red';
    }
}

// 用户行为
class UserAction {
    static LEFT = 37;
    static UP = 38;
    static RIGHT = 39;
    static DOWN = 40;
    static NORMAL_SPEED = 0.3;
    static FAST_SPEED = 0.1;
    static RUNNING = true;
    static PAUSE = true;
    constructor() {
        this.bindEvent();
    }

    bindEvent() {
        myConsole.addEventListener('click', e => {
            switch(e.target.id) {
                case 'start-btn':
                    snake.isPause = false;
                    break;
                case 'pause-btn':
                    snake.isPause = true;
                    break;
                case 'restart-btn':
                    history.go(0);
                    break;
            }
        });
    }
}

// 蛇类
class Snake {
    // 蛇的主要部分
    main = {
        // 蛇的头部下标
        head: -1,
        // 蛇的身体
        body: [],
    };

    // 蛇的长度
    length = 1;

    // 蛇的移动方向
    direction = [UserAction.RIGHT];

    // 蛇的移动速度
    speed = UserAction.FAST_SPEED;

    // 判断蛇是否暂停
    isPause = true;
    constructor() {
        // 随机生成一个食物
        new Food();
        // 绑定蛇的行为事件
        this.bindEvent();
        // 随机出生
        this.randomBirth();
        this.render();
    }

    bindEvent() {
        // 缓冲流接收一下键盘输入
        let buffer = [];

        // 获取用户的操作
        document.addEventListener('keydown', e => {
            // 先获取蛇当前移动方向
            let currentDirection = this.direction[this.direction.length - 1];
            // 判断蛇是否水平移动
            let isHorizontal = currentDirection === UserAction.LEFT || currentDirection ===
                UserAction.RIGHT;
            // 判断蛇是否竖直移动
            let isVertical = currentDirection === UserAction.UP || currentDirection === UserAction
                .DOWN;

            // 如果蛇本身的移动方向水平，则只用判断用户是否输入了垂直方向
            // 如果蛇本身的移动方向为垂直，则只用判断用户是否输入了水平方向
            switch (e.keyCode) {
                case UserAction.LEFT:
                    if (isHorizontal) break;
                    buffer.push(e.keyCode);
                    break;
                case UserAction.UP:
                    if (isVertical) break;
                    buffer.push(e.keyCode);
                    break;
                case UserAction.RIGHT:
                    if (isHorizontal) break;
                    buffer.push(e.keyCode);
                    break;
                case UserAction.DOWN:
                    if (isVertical) break;
                    buffer.push(e.keyCode);
                    break;
            }
        });

        // 开启一个定时器每隔 0.499s 把缓冲流中用户的最后一次操作存入direction
        // 并且存入转折点
        let timer = setInterval(() => {
            // 将缓冲流中用户的最后一次操作存入direction
            // 判断一下是否是一次有效的操作：如果buffer为空则一定为非有效操作，那么就不用pop buffer了
            if (buffer.length !== 0) this.direction.push(buffer.pop());

            // 判断一下是否是有效的转折，即蛇的方向改变了
            if (buffer.length !== 0) this.main.turn.push(this.main.head);

            // 清空缓冲流
            buffer.length = 0;

            if (this.isDead()) {
                clearInterval(timer);
            }

        }, (this.speed - 0.01) * 1000);
    }

    isEat() {
        let currentFood = Food.foodArr[Food.foodArr.length - 1];
        let [...copy] = Food.foodArr;
        // 如果蛇头坐标与最新食物坐标重叠，说明吃到食物
        if (this.main.head === currentFood) {

            // 从食物列表中删除对应下标
            for (const e of copy.entries()) {
                if (e[1] === currentFood) {
                    Food.foodArr.splice(e[0], 1);
                }
            }
            // 重新生成一个食物
            new Food();

            return true;
        }
        return false;
    }


    render() {

        // 每隔 0.5s 判断一次用户输入的最新方向
        let timer = setInterval(() => {

            if (this.isPause) {
                return;
            }

            if (this.isDead()) {
                clearInterval(timer);
                alert('YOU ARE DEAD!');
                return;
            }

            this.move(this.direction[this.direction.length - 1]);

            // 在框内把 body 内的坐标渲染为黑色
            for (const e of this.main.body) {
                mapNodeList[e].style.background = 'black';
            }

            // 把除了 body 内的坐标和食物坐标外的格子渲染为白色
            for (let i = 0; i < mapNodeList.length; i++) {
                if (this.main.body.includes(i) || Food.foodArr.includes(i)) continue;
                mapNodeList[i].style.background = 'none';
            }

        }, this.speed * 1000);
    }

    // 接受用户输入的最后一次有效方向
    move(dir) {
        switch (dir) {
            // 左
            case UserAction.LEFT:
                this.main.head--;
                this.upDateBody();
                break;
                // 上
            case UserAction.UP:
                this.main.head -= 50;
                this.upDateBody();
                break;

                // 右
            case UserAction.RIGHT:
                ++this.main.head;
                this.upDateBody();
                break;

                // 下
            case UserAction.DOWN:
                this.main.head += 50;
                this.upDateBody();
                break;

        }
    }

    upDateBody() {

        let body = this.main.body;
        body.push(this.main.head);

        // 如果吃到食物
        if (this.isEat()) {
            this.length++;
        }

        // 保证 body 内存放的坐标数量等于蛇的长度
        if (body.length > this.length) {
            body.shift();
        }
        Food.snakeSpace = body;
    }

    // 判断是否暂停
    isPause() {

    }

    // 判断蛇是否死亡
    isDead() {

        // 运动方向为上且头部处于上边界
        let overTop = this.main.head >= 0 && this.main.head <= 49 && this.direction[this.direction.length -
            1] === UserAction.UP;
        // 运动方向为下且头部处于下边界
        let overBottom = this.main.head >= 2450 && this.main.head <= 2499 && this.direction[this.direction
            .length - 1] === UserAction.DOWN;

        // 运动方向为左且头部处于左边界
        let overLeft = this.main.head % 50 === 0 && this.direction[this.direction.length - 1] === UserAction
            .LEFT;

        // 运动方向为右且头部处于右边界
        let overRight = (this.main.head + 1) % 50 === 0 && this.direction[this.direction.length - 1] ===
            UserAction.RIGHT;

        // 如果蛇头超出了边界则死亡
        if (overTop || overBottom || overLeft || overRight) return true;

        // log
        // console.log(this.main.body);

        // 如果蛇头重叠了蛇身则死亡
        if (this.length >= 5)
            for (let i = 0; i < this.length - 1; i++) {
                if (this.main.body[i] === this.main.head) return true;
            }

        return false;
    }

    randomBirth() {
        let birthPosition = Math.round(Math.random() * 2499);
        // 不能与食物的出生点重叠
        while (birthPosition == Food.foodArr[0]) {
            birthPosition = Math.round(Math.random() * 2499);
        }
        this.main.head = birthPosition;
        this.main.body[0] = birthPosition;

        mapNodeList[birthPosition].style.background = 'black';
    }
}


var snake = new Snake();
var userAction = new UserAction();