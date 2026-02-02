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
  // 初始化倒计时时间（秒）
  let timeLeft = 12;
  
  // 在屏幕中央创建文本对象显示倒计时
  const timerText = this.add.text(
    400, 
    300, 
    timeLeft.toString(), 
    {
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold'
    }
  );
  
  // 设置文本居中对齐
  timerText.setOrigin(0.5, 0.5);
  
  // 创建定时器事件，每1000毫秒（1秒）触发一次
  this.time.addEvent({
    delay: 1000,           // 延迟1秒
    callback: function() {
      // 减少剩余时间
      timeLeft--;
      
      // 更新文本显示
      if (timeLeft > 0) {
        timerText.setText(timeLeft.toString());
      } else {
        // 时间归零，显示"时间到"
        timerText.setText('时间到');
        timerText.setColor('#ff0000'); // 改为红色
      }
    },
    callbackScope: this,
    repeat: 11             // 重复11次（加上第一次共12次，倒计时12秒到0）
  });
}

// 启动游戏
new Phaser.Game(config);