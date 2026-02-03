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

function preload() {
  // 无需预加载资源
}

function create() {
  // 初始化倒计时秒数
  let countdown = 10;
  
  // 创建文本对象显示倒计时，居中显示
  const countdownText = this.add.text(
    400, 
    300, 
    countdown.toString(), 
    {
      fontSize: '128px',
      color: '#ffffff',
      fontStyle: 'bold'
    }
  );
  
  // 设置文本原点为中心，便于居中对齐
  countdownText.setOrigin(0.5, 0.5);
  
  // 创建定时器事件
  const timerEvent = this.time.addEvent({
    delay: 1000,                // 每1000毫秒（1秒）触发一次
    callback: () => {
      countdown--;              // 倒计时减1
      
      if (countdown > 0) {
        // 更新显示的数字
        countdownText.setText(countdown.toString());
      } else {
        // 倒计时结束，显示"时间到"
        countdownText.setText('时间到');
        countdownText.setFontSize('64px');
        
        // 停止定时器
        timerEvent.remove();
      }
    },
    callbackScope: this,
    loop: true                  // 循环执行
  });
}

new Phaser.Game(config);