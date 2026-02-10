class FlashScene extends Phaser.Scene {
  constructor() {
    super('FlashScene');
    this.flashCount = 0;  // 状态信号：闪烁次数
    this.isFlashing = true;  // 状态信号：是否正在闪烁
    this.flashDuration = 3000;  // 闪烁总持续时间（毫秒）
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2d2d2d, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 添加文本显示闪烁状态
    this.statusText = this.add.text(400, 250, 'Flashing...', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 添加计数器文本
    this.counterText = this.add.text(400, 320, `Flash Count: ${this.flashCount}`, {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 添加一些装饰元素让闪烁效果更明显
    const circle = this.add.graphics();
    circle.fillStyle(0xff6b6b, 1);
    circle.fillCircle(200, 450, 50);

    const rect = this.add.graphics();
    rect.fillStyle(0x4ecdc4, 1);
    rect.fillRect(500, 400, 100, 100);

    // 获取主摄像机
    const camera = this.cameras.main;

    // 开始闪烁效果
    this.startFlashing(camera);

    // 3秒后停止闪烁
    this.time.delayedCall(this.flashDuration, () => {
      this.isFlashing = false;
      this.statusText.setText('Flashing Complete!');
      this.statusText.setColor('#00ff00');
      console.log(`Flashing finished. Total flashes: ${this.flashCount}`);
    });
  }

  startFlashing(camera) {
    // 闪烁参数配置
    const flashInterval = 200;  // 每次闪烁间隔（毫秒）
    const singleFlashDuration = 150;  // 单次闪烁持续时间（毫秒）

    // 创建闪烁循环
    this.flashTimer = this.time.addEvent({
      delay: flashInterval,
      callback: () => {
        if (this.isFlashing) {
          // 执行闪烁效果（白色闪光）
          camera.flash(singleFlashDuration, 255, 255, 255, false);
          
          // 增加闪烁计数
          this.flashCount++;
          this.counterText.setText(`Flash Count: ${this.flashCount}`);
          
          console.log(`Flash #${this.flashCount}`);
        } else {
          // 停止定时器
          this.flashTimer.remove();
        }
      },
      loop: true
    });

    // 立即执行第一次闪烁
    camera.flash(singleFlashDuration, 255, 255, 255, false);
    this.flashCount++;
    this.counterText.setText(`Flash Count: ${this.flashCount}`);
  }

  update(time, delta) {
    // 可选：添加一些动态效果
    if (this.isFlashing) {
      this.statusText.setAlpha(0.5 + Math.sin(time / 100) * 0.5);
    } else {
      this.statusText.setAlpha(1);
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
  // 如果需要在 Node.js 环境运行，使用 Phaser.HEADLESS
  // type: Phaser.HEADLESS,
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 状态验证接口（可在控制台调用）
window.getFlashStatus = function() {
  const scene = game.scene.scenes[0];
  return {
    flashCount: scene.flashCount,
    isFlashing: scene.isFlashing,
    flashDuration: scene.flashDuration
  };
};