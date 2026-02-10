const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

let timeText;
let remainingTime = 15;
let timerEvent;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建倒计时文本，显示在屏幕中央
  timeText = this.add.text(
    400, 
    300, 
    `剩余时间: ${remainingTime} 秒`, 
    {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center'
    }
  );
  
  // 设置文本原点为中心，便于居中显示
  timeText.setOrigin(0.5, 0.5);
  
  // 创建定时器事件，每1000毫秒（1秒）触发一次
  timerEvent = this.time.addEvent({
    delay: 1000,           // 延迟1秒
    callback: updateTimer, // 回调函数
    callbackScope: this,   // 回调作用域
    loop: true             // 循环执行
  });
}

function updateTimer() {
  // 减少剩余时间
  remainingTime--;
  
  // 检查是否归零
  if (remainingTime <= 0) {
    // 显示"时间到"
    timeText.setText('时间到！');
    timeText.setStyle({ color: '#ff0000', fontSize: '64px' });
    
    // 停止定时器
    timerEvent.remove();
  } else {
    // 更新倒计时显示
    timeText.setText(`剩余时间: ${remainingTime} 秒`);
  }
}

new Phaser.Game(config);