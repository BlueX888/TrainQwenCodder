class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shakeCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      shakeCount: 0,
      lastShakeTime: 0,
      isShaking: false
    };

    // 创建背景网格以便观察弹跳效果
    const graphics = this.add.graphics();
    
    // 绘制背景
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, 800, 600);
    
    // 绘制网格
    graphics.lineStyle(1, 0x16213e, 0.5);
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 创建一些可视化对象
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0x0f3460, 1);
    centerGraphics.fillCircle(400, 300, 80);
    
    centerGraphics.fillStyle(0xe94560, 1);
    centerGraphics.fillCircle(400, 300, 50);
    
    // 添加文字提示
    const style = {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    };
    
    this.instructionText = this.add.text(400, 100, 'Click to Shake Camera', style);
    this.instructionText.setOrigin(0.5);
    
    this.statusText = this.add.text(400, 500, 'Shake Count: 0', style);
    this.statusText.setOrigin(0.5);

    // 获取主相机
    this.mainCamera = this.cameras.main;
    
    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      // 只响应左键
      if (pointer.leftButtonDown()) {
        this.triggerCameraShake();
      }
    });

    // 监听相机 shake 完成事件
    this.mainCamera.on('camerashakecomplete', () => {
      window.__signals__.isShaking = false;
      console.log(JSON.stringify({
        event: 'shake_complete',
        totalShakes: window.__signals__.shakeCount,
        timestamp: Date.now()
      }));
    });

    // 监听相机 shake 开始事件
    this.mainCamera.on('camerashakestart', () => {
      window.__signals__.isShaking = true;
      console.log(JSON.stringify({
        event: 'shake_start',
        shakeCount: window.__signals__.shakeCount,
        timestamp: Date.now()
      }));
    });
  }

  triggerCameraShake() {
    // 如果相机正在弹跳，忽略新的触发
    if (window.__signals__.isShaking) {
      console.log(JSON.stringify({
        event: 'shake_ignored',
        reason: 'already_shaking',
        timestamp: Date.now()
      }));
      return;
    }

    // 增加弹跳计数
    this.shakeCount++;
    window.__signals__.shakeCount = this.shakeCount;
    window.__signals__.lastShakeTime = Date.now();

    // 更新状态文字
    this.statusText.setText(`Shake Count: ${this.shakeCount}`);

    // 触发相机弹跳效果
    // 参数: duration(ms), intensity(弹跳强度), force(是否强制重启)
    this.mainCamera.shake(1500, 0.01);

    // 记录日志
    console.log(JSON.stringify({
      event: 'shake_triggered',
      shakeCount: this.shakeCount,
      duration: 1500,
      intensity: 0.01,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  parent: 'game-container',
  scene: GameScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 初始化全局信号对象（防止场景创建前访问）
window.__signals__ = {
  shakeCount: 0,
  lastShakeTime: 0,
  isShaking: false
};