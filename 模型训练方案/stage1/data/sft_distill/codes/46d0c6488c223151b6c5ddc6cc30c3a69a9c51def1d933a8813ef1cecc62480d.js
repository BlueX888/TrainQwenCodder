class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bounceCount = 0; // 状态信号：记录弹跳触发次数
    this.isShaking = false; // 防止重复触发
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景网格用于观察相机效果
    const graphics = this.add.graphics();
    
    // 绘制网格背景
    graphics.lineStyle(1, 0x00ff00, 0.3);
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 创建中心标记物
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(400, 300, 30);
    
    // 添加文本提示
    const text = this.add.text(400, 100, 'Press SPACE to shake camera', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setOrigin(0.5);

    // 添加状态显示文本
    this.statusText = this.add.text(400, 150, `Bounce Count: ${this.bounceCount}`, {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setOrigin(0.5);

    // 添加效果状态文本
    this.effectText = this.add.text(400, 200, 'Status: Ready', {
      fontSize: '18px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.effectText.setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    this.spaceKey.on('down', () => {
      this.triggerCameraBounce();
    });

    // 获取主相机
    this.mainCamera = this.cameras.main;
  }

  triggerCameraBounce() {
    // 防止在效果进行中重复触发
    if (this.isShaking) {
      console.log('Camera is already shaking, please wait...');
      return;
    }

    // 更新状态
    this.isShaking = true;
    this.bounceCount++;
    
    // 更新显示
    this.statusText.setText(`Bounce Count: ${this.bounceCount}`);
    this.effectText.setText('Status: Shaking...');
    this.effectText.setColor('#ff0000');

    console.log(`Camera bounce triggered! Count: ${this.bounceCount}`);

    // 触发相机震动效果
    // shake(duration, intensity, force, callback, context)
    // duration: 3000ms (3秒)
    // intensity: 0.01 (震动强度)
    this.mainCamera.shake(3000, 0.01, false, (camera, progress) => {
      // 震动完成回调
      if (progress === 1) {
        this.isShaking = false;
        this.effectText.setText('Status: Ready');
        this.effectText.setColor('#00ff00');
        console.log('Camera shake completed!');
      }
    });
  }

  update(time, delta) {
    // 可选：显示实时震动状态
    if (this.isShaking) {
      // 相机震动时可以添加额外的视觉反馈
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出验证信号（用于测试）
window.getGameStatus = function() {
  const scene = game.scene.getScene('GameScene');
  return {
    bounceCount: scene.bounceCount,
    isShaking: scene.isShaking
  };
};