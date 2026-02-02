const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let timeText;
let remainingTime = 8;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建文本对象显示倒计时
  timeText = this.add.text(400, 300, remainingTime.toString(), {
    fontSize: '64px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  
  // 设置文本居中对齐
  timeText.setOrigin(0.5, 0.5);
  
  // 创建定时器，每1000毫秒（1秒）触发一次
  this.time.addEvent({
    delay: 1000,                // 延迟1秒
    callback: updateTimer,      // 回调函数
    callbackScope: this,        // 回调函数的作用域
    loop: true,                 // 循环执行
    repeat: 7                   // 重复7次（加上第一次共8次，倒计时8秒）
  });
}

function updateTimer() {
  // 减少剩余时间
  remainingTime--;
  
  // 更新文本显示
  if (remainingTime > 0) {
    timeText.setText(remainingTime.toString());
  } else {
    // 倒计时结束，显示"时间到"
    timeText.setText('时间到');
    timeText.setColor('#ff0000');  // 改变颜色为红色以示强调
  }
}

function update(time, delta) {
  // 本示例无需每帧更新逻辑
}

new Phaser.Game(config);