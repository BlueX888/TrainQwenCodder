// 全局信号对象，用于验证功能
window.__signals__ = {
  shakeCount: 0,
  lastShakeTime: 0,
  isShaking: false
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建网格背景，便于观察抖动效果
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x00ff00, 0.3);
    
    // 绘制垂直线
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    
    // 绘制水平线
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 添加中心参考点
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(400, 300, 10);

    // 添加提示文本
    const instructionText = this.add.text(400, 100, 'Press SPACE to shake camera', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    instructionText.setOrigin(0.5);

    // 添加状态显示文本
    this.statusText = this.add.text(400, 150, 'Shake Count: 0', {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setOrigin(0.5);

    // 添加抖动状态指示器
    this.shakeIndicator = this.add.text(400, 200, '', {
      fontSize: '18px',
      color: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.shakeIndicator.setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    this.spaceKey.on('down', () => {
      this.triggerCameraShake();
    });

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 监听相机抖动完成事件
    this.mainCamera.on('camerashakecomplete', () => {
      window.__signals__.isShaking = false;
      this.shakeIndicator.setText('');
      console.log(JSON.stringify({
        event: 'shake_complete',
        timestamp: Date.now(),
        totalShakes: window.__signals__.shakeCount
      }));
    });

    // 监听相机抖动开始事件
    this.mainCamera.on('camerashakestart', () => {
      window.__signals__.isShaking = true;
      this.shakeIndicator.setText('SHAKING!');
      console.log(JSON.stringify({
        event: 'shake_start',
        timestamp: Date.now(),
        shakeNumber: window.__signals__.shakeCount
      }));
    });

    console.log(JSON.stringify({
      event: 'scene_ready',
      message: 'Press SPACE to trigger camera shake'
    }));
  }

  triggerCameraShake() {
    // 检查相机是否正在抖动
    if (this.mainCamera.shakeEffect && this.mainCamera.shakeEffect.isRunning) {
      console.log(JSON.stringify({
        event: 'shake_ignored',
        reason: 'already_shaking',
        timestamp: Date.now()
      }));
      return;
    }

    // 触发相机抖动效果
    // 参数：持续时间(ms), 强度(默认0.05), 是否强制, 回调, 上下文
    this.mainCamera.shake(1500, 0.01);

    // 更新信号
    window.__signals__.shakeCount++;
    window.__signals__.lastShakeTime = Date.now();

    // 更新状态文本
    this.statusText.setText(`Shake Count: ${window.__signals__.shakeCount}`);

    // 输出日志
    console.log(JSON.stringify({
      event: 'shake_triggered',
      shakeCount: window.__signals__.shakeCount,
      duration: 1500,
      intensity: 0.01,
      timestamp: window.__signals__.lastShakeTime
    }));
  }

  update(time, delta) {
    // 可选：显示实时抖动状态
    if (this.mainCamera.shakeEffect && this.mainCamera.shakeEffect.isRunning) {
      const progress = this.mainCamera.shakeEffect.progress;
      this.shakeIndicator.setText(`SHAKING! (${Math.floor(progress * 100)}%)`);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 初始化日志
console.log(JSON.stringify({
  event: 'game_initialized',
  config: {
    width: config.width,
    height: config.height,
    type: 'AUTO'
  }
}));