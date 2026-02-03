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
  // 无需预加载外部资源
}

function create() {
  // 初始化倒计时变量
  let countdown = 8;
  
  // 创建文本对象显示倒计时，居中显示
  const timerText = this.add.text(
    400, 
    300, 
    countdown.toString(), 
    {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }
  );
  
  // 设置文本居中对齐
  timerText.setOrigin(0.5, 0.5);
  
  // 创建定时器事件，每1000毫秒（1秒）触发一次
  this.time.addEvent({
    delay: 1000,                // 每秒触发
    callback: () => {
      countdown--;              // 倒计时减1
      
      if (countdown > 0) {
        // 更新显示的倒计时数字
        timerText.setText(countdown.toString());
      } else {
        // 倒计时归零，显示"时间到"
        timerText.setText('时间到');
        timerText.setColor('#ff6666'); // 改变颜色以突出显示
      }
    },
    callbackScope: this,
    repeat: 7                   // 重复7次（加上初始的1次，共8次）
  });
}

// 创建游戏实例
new Phaser.Game(config);