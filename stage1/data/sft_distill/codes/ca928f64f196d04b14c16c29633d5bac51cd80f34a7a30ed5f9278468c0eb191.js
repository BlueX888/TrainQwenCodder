class FlashScene extends Phaser.Scene {
  constructor() {
    super('FlashScene');
    // 状态信号：闪烁是否完成
    this.flashComplete = false;
    this.flashStartTime = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 记录闪烁开始时间
    this.flashStartTime = this.time.now;

    // 创建背景（使用 Graphics 绘制）
    const background = this.add.graphics();
    background.fillStyle(0x2d2d2d, 1);
    background.fillRect(0, 0, 800, 600);

    // 创建一些可见对象用于观察闪烁效果
    const centerX = 400;
    const centerY = 300;

    // 绘制中心圆形
    const circle = this.add.graphics();
    circle.fillStyle(0xff6b6b, 1);
    circle.fillCircle(centerX, centerY, 80);

    // 绘制四个角的矩形
    const corners = [
      { x: 100, y: 100, color: 0x4ecdc4 },
      { x: 700, y: 100, color: 0xffe66d },
      { x: 100, y: 500, color: 0x95e1d3 },
      { x: 700, y: 500, color: 0xf38181 }
    ];

    corners.forEach(corner => {
      const rect = this.add.graphics();
      rect.fillStyle(corner.color, 1);
      rect.fillRect(corner.x - 40, corner.y - 40, 80, 80);
    });

    // 添加文本显示闪烁状态
    this.statusText = this.add.text(400, 50, 'Flash Effect Starting...', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setOrigin(0.5);

    // 添加计时器文本
    this.timerText = this.add.text(400, 550, 'Time: 0.00s', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.timerText.setOrigin(0.5);

    // 获取主摄像机并执行闪烁效果
    const camera = this.cameras.main;

    // flash(duration, red, green, blue, force, callback, context)
    // 白色闪烁，持续2000毫秒
    camera.flash(2000, 255, 255, 255, false, (cam, progress) => {
      // 闪烁完成回调
      if (progress === 1) {
        this.flashComplete = true;
        this.statusText.setText('Flash Complete!');
        this.statusText.setStyle({ color: '#00ff00' });
        console.log('Flash effect completed after 2 seconds');
      }
    });

    // 添加闪烁开始提示
    console.log('Flash effect started - duration: 2000ms');
  }

  update(time, delta) {
    // 更新计时器显示
    const elapsed = (time - this.flashStartTime) / 1000;
    this.timerText.setText(`Time: ${elapsed.toFixed(2)}s`);

    // 在闪烁进行中更新状态文本
    if (!this.flashComplete && elapsed < 2) {
      const progress = (elapsed / 2 * 100).toFixed(0);
      this.statusText.setText(`Flashing... ${progress}%`);
    }
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: FlashScene,
  // 可选：使用 HEADLESS 模式进行测试
  // type: Phaser.HEADLESS,
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态验证函数（用于测试）
function getFlashStatus() {
  const scene = game.scene.getScene('FlashScene');
  return {
    flashComplete: scene.flashComplete,
    elapsedTime: (scene.time.now - scene.flashStartTime) / 1000
  };
}