const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

let timerText;
let remainingTime = 15;
let timerEvent;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建倒计时文本，居中显示
  timerText = this.add.text(400, 300, remainingTime.toString(), {
    fontSize: '64px',
    color: '#ffffff',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  
  // 设置文本原点为中心，方便居中对齐
  timerText.setOrigin(0.5, 0.5);
  
  // 创建计时器事件，每1000毫秒（1秒）触发一次
  timerEvent = this.time.addEvent({
    delay: 1000,                // 每秒触发一次
    callback: updateTimer,      // 回调函数
    callbackScope: this,        // 回调函数的作用域
    loop: true                  // 循环执行
  });
}

function updateTimer() {
  // 减少剩余时间
  remainingTime--;
  
  // 更新显示
  if (remainingTime > 0) {
    timerText.setText(remainingTime.toString());
  } else {
    // 时间到，显示提示信息
    timerText.setText('时间到');
    timerText.setColor('#ff0000'); // 变为红色
    
    // 停止计时器
    timerEvent.remove();
  }
}

new Phaser.Game(config);