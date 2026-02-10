class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.shakeCompleted = false;
    this.shakeStartTime = 0;
    this.shakeEndTime = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 记录抖动开始时间
    this.shakeStartTime = this.time.now;

    // 创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2d2d2d, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 创建一些装饰性方块，用于观察抖动效果
    this.createDecorativeBoxes();

    // 添加标题文字
    const titleText = this.add.text(400, 100, 'Camera Shake Demo', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);

    // 添加状态显示文字
    this.statusText = this.add.text(400, 200, 'Shaking...', {
      fontSize: '24px',
      color: '#ffff00'
    });
    this.statusText.setOrigin(0.5);

    // 获取主相机
    const camera = this.cameras.main;

    // 启动相机抖动效果
    // 参数：duration(ms), intensity(抖动强度), force(是否强制), callback, context
    camera.shake(500, 0.01);

    // 监听抖动完成事件
    camera.once('camerashakecomplete', () => {
      this.shakeCompleted = true;
      this.shakeEndTime = this.time.now;
      
      // 更新状态文字
      this.statusText.setText('Shake Completed!');
      this.statusText.setColor('#00ff00');

      // 计算实际抖动持续时间
      const duration = this.shakeEndTime - this.shakeStartTime;
      
      // 添加完成信息
      const infoText = this.add.text(400, 250, 
        `Duration: ${duration}ms\nExpected: 500ms`, {
        fontSize: '18px',
        color: '#aaaaaa',
        align: 'center'
      });
      infoText.setOrigin(0.5);

      console.log('Camera shake completed!');
      console.log(`Actual duration: ${duration}ms`);
    });

    // 添加调试信息
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  createDecorativeBoxes() {
    // 创建多个彩色方块，用于更明显地观察抖动效果
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    const boxSize = 60;
    const spacing = 100;

    for (let i = 0; i < 6; i++) {
      const x = 150 + (i % 3) * spacing * 2;
      const y = 350 + Math.floor(i / 3) * spacing;

      const graphics = this.add.graphics();
      graphics.fillStyle(colors[i], 1);
      graphics.fillRect(x - boxSize / 2, y - boxSize / 2, boxSize, boxSize);

      // 添加边框
      graphics.lineStyle(3, 0xffffff, 1);
      graphics.strokeRect(x - boxSize / 2, y - boxSize / 2, boxSize, boxSize);
    }
  }

  update(time, delta) {
    // 更新调试信息
    const camera = this.cameras.main;
    this.debugText.setText([
      `Shake Active: ${camera.shakeEffect.isRunning}`,
      `Shake Completed: ${this.shakeCompleted}`,
      `Time Elapsed: ${Math.floor(time - this.shakeStartTime)}ms`
    ]);
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  // 可选：使用 HEADLESS 模式进行无界面测试
  // type: Phaser.HEADLESS,
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态用于验证（可选）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, GameScene };
}