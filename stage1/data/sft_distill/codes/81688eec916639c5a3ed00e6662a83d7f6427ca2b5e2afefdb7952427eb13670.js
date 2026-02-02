const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

let timeText;
let remainingTime = 12;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建倒计时文本，显示在屏幕中央
  timeText = this.add.text(
    config.width / 2,
    config.height / 2,
    remainingTime.toString(),
    {
      fontSize: '128px',
      color: '#ffffff',
      fontStyle: 'bold'
    }
  );
  
  // 设置文本锚点为中心，使其居中显示
  timeText.setOrigin(0.5, 0.5);
  
  // 创建定时器事件，每1000毫秒（1秒）触发一次
  this.time.addEvent({
    delay: 1000,           // 延迟1秒
    callback: updateTimer, // 回调函数
    callbackScope: this,   // 回调函数的作用域
    loop: true             // 循环执行
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
    timeText.setFontSize('96px');
    
    // 停止定时器（通过设置 loop 为 false 或移除事件）
    // 由于我们在回调中检查了条件，这里不需要额外操作
    // 但为了更好的实践，可以保存事件引用并移除
  }
}

new Phaser.Game(config);