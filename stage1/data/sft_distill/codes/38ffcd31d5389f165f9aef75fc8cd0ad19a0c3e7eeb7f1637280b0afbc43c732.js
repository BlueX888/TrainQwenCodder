const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 初始倒计时秒数
  let countdown = 3;
  
  // 创建文本对象，显示初始倒计时
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
  
  // 设置文本居中对齐
  countdownText.setOrigin(0.5, 0.5);
  
  // 创建定时器，每1000毫秒（1秒）触发一次
  this.time.addEvent({
    delay: 1000,           // 延迟1秒
    callback: () => {
      countdown--;         // 递减倒计时
      
      if (countdown > 0) {
        // 更新显示的数字
        countdownText.setText(countdown.toString());
      } else {
        // 倒计时结束，显示"时间到"
        countdownText.setText('时间到');
        countdownText.setFontSize('64px');
      }
    },
    callbackScope: this,
    repeat: 3              // 重复3次（总共触发4次：3秒递减 + 1次显示"时间到"）
  });
}

new Phaser.Game(config);