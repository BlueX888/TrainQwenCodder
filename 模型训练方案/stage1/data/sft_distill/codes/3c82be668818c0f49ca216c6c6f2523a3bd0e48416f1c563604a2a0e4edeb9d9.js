class FlashScene extends Phaser.Scene {
  constructor() {
    super('FlashScene');
    this.flashComplete = false;
  }

  preload() {
    // 初始化信号对象
    window.__signals__ = {
      flashStarted: false,
      flashComplete: false,
      flashDuration: 500,
      timestamp: null
    };
  }

  create() {
    // 创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2d2d2d, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 创建一些可视元素来展示闪烁效果
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0x00ff00, 1);
    centerGraphics.fillCircle(400, 300, 80);

    const leftBox = this.add.graphics();
    leftBox.fillStyle(0xff0000, 1);
    leftBox.fillRect(100, 250, 100, 100);

    const rightBox = this.add.graphics();
    rightBox.fillStyle(0x0000ff, 1);
    rightBox.fillRect(600, 250, 100, 100);

    // 添加文本提示
    this.statusText = this.add.text(400, 100, 'Flash Effect Starting...', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.timerText = this.add.text(400, 500, '', {
      fontSize: '18px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    // 获取主摄像机
    const camera = this.cameras.main;

    // 监听闪烁开始事件
    camera.on('cameraflashstart', (cam, effect, duration, red, green, blue) => {
      window.__signals__.flashStarted = true;
      window.__signals__.timestamp = Date.now();
      this.statusText.setText('Flashing...');
      
      console.log(JSON.stringify({
        event: 'flashstart',
        duration: duration,
        color: { r: red, g: green, b: blue },
        time: Date.now()
      }));
    });

    // 监听闪烁完成事件
    camera.on('cameraflashcomplete', (cam, effect) => {
      this.flashComplete = true;
      window.__signals__.flashComplete = true;
      this.statusText.setText('Flash Complete!');
      this.statusText.setColor('#00ff00');
      
      console.log(JSON.stringify({
        event: 'flashcomplete',
        totalDuration: Date.now() - window.__signals__.timestamp,
        time: Date.now()
      }));
    });

    // 启动闪烁效果
    // flash(duration, red, green, blue, force, callback, context)
    // 使用白色闪烁，持续 500ms (0.5秒)
    camera.flash(500, 255, 255, 255, false);

    // 记录开始时间用于显示计时器
    this.flashStartTime = this.time.now;
  }

  update(time, delta) {
    // 更新计时器显示
    if (!this.flashComplete) {
      const elapsed = time - this.flashStartTime;
      const remaining = Math.max(0, 500 - elapsed);
      this.timerText.setText(`Remaining: ${(remaining / 1000).toFixed(2)}s`);
    } else {
      this.timerText.setText('Effect finished!');
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: FlashScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 输出最终状态验证（3秒后）
setTimeout(() => {
  console.log('=== Final Signals ===');
  console.log(JSON.stringify(window.__signals__, null, 2));
}, 3000);