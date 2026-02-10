// 完整的 Phaser3 相机抖动示例
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shakeCount = 0;
    this.isShaking = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      shakeCount: 0,
      isShaking: false,
      lastShakeTime: null
    };

    // 绘制背景网格，便于观察抖动效果
    const graphics = this.add.graphics();
    
    // 绘制网格
    graphics.lineStyle(2, 0x00ff00, 0.5);
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 绘制中心参考点
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(400, 300, 20);

    // 绘制四角参考点
    graphics.fillStyle(0x00ffff, 1);
    graphics.fillCircle(50, 50, 15);
    graphics.fillCircle(750, 50, 15);
    graphics.fillCircle(50, 550, 15);
    graphics.fillCircle(750, 550, 15);

    // 添加提示文本
    const instructionText = this.add.text(400, 50, 'Press SPACE to shake camera', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    instructionText.setOrigin(0.5);

    // 添加状态显示文本
    this.statusText = this.add.text(400, 550, 'Shake Count: 0 | Status: Ready', {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 当空格键按下时触发抖动
    this.spaceKey.on('down', () => {
      if (!this.isShaking) {
        this.triggerCameraShake();
      }
    });

    // 获取主相机
    this.mainCamera = this.cameras.main;

    console.log('[GAME] Scene created, press SPACE to shake camera');
  }

  triggerCameraShake() {
    // 标记正在抖动
    this.isShaking = true;
    this.shakeCount++;

    // 更新信号
    window.__signals__.shakeCount = this.shakeCount;
    window.__signals__.isShaking = true;
    window.__signals__.lastShakeTime = Date.now();

    // 更新状态文本
    this.updateStatusText();

    // 触发相机抖动效果
    // 参数：持续时间(ms), 强度(可选，默认0.05)
    this.mainCamera.shake(1500, 0.01);

    // 记录日志
    console.log(JSON.stringify({
      event: 'camera_shake_triggered',
      shakeCount: this.shakeCount,
      duration: 1500,
      timestamp: Date.now()
    }));

    // 监听抖动完成事件
    this.mainCamera.once('camerashakecomplete', () => {
      this.isShaking = false;
      window.__signals__.isShaking = false;
      this.updateStatusText();

      console.log(JSON.stringify({
        event: 'camera_shake_complete',
        shakeCount: this.shakeCount,
        timestamp: Date.now()
      }));
    });
  }

  updateStatusText() {
    const status = this.isShaking ? 'Shaking...' : 'Ready';
    this.statusText.setText(`Shake Count: ${this.shakeCount} | Status: ${status}`);
  }

  update(time, delta) {
    // 每帧更新逻辑（本例中不需要）
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 初始化全局信号对象
window.__signals__ = {
  shakeCount: 0,
  isShaking: false,
  lastShakeTime: null
};

console.log('[GAME] Phaser game initialized');