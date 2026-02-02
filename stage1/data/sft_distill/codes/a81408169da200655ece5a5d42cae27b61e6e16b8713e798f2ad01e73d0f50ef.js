class CountdownScene extends Phaser.Scene {
  constructor() {
    super('CountdownScene');
    this.remainingTime = 12; // 初始倒计时时间（秒）
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建倒计时文本，显示在屏幕中央
    this.countdownText = this.add.text(
      width / 2,
      height / 2,
      this.remainingTime.toString(),
      {
        fontSize: '64px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    // 设置文本原点为中心，便于居中显示
    this.countdownText.setOrigin(0.5, 0.5);

    // 创建计时器事件，每秒触发一次
    this.timerEvent = this.time.addEvent({
      delay: 1000,                    // 每1000毫秒（1秒）触发一次
      callback: this.updateCountdown, // 回调函数
      callbackScope: this,            // 回调函数的作用域
      repeat: 11                      // 重复11次（加上初始的1次，共12秒）
    });
  }

  updateCountdown() {
    // 减少剩余时间
    this.remainingTime--;

    if (this.remainingTime > 0) {
      // 更新文本显示剩余时间
      this.countdownText.setText(this.remainingTime.toString());
    } else {
      // 倒计时结束，显示"时间到"
      this.countdownText.setText('时间到');
      this.countdownText.setColor('#ff0000'); // 改为红色以突出显示
    }
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: CountdownScene
};

// 创建游戏实例
new Phaser.Game(config);