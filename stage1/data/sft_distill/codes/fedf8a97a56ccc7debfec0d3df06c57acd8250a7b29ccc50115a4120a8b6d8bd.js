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
  // 初始倒计时秒数
  let countdown = 10;
  
  // 创建倒计时文本，显示在屏幕中央
  const countdownText = this.add.text(
    400, 
    300, 
    countdown.toString(), 
    {
      fontSize: '128px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }
  );
  
  // 设置文本锚点为中心，使其居中显示
  countdownText.setOrigin(0.5, 0.5);
  
  // 创建定时器事件
  this.time.addEvent({
    delay: 1000,           // 每1000毫秒（1秒）触发一次
    callback: () => {
      countdown--;         // 递减倒计时
      
      if (countdown > 0) {
        // 更新显示的数字
        countdownText.setText(countdown.toString());
      } else {
        // 倒计时结束，显示"时间到"
        countdownText.setText('时间到');
        countdownText.setFontSize('96px');
      }
    },
    callbackScope: this,
    repeat: 9              // 重复9次，加上首次共10次（10秒）
  });
}

new Phaser.Game(config);