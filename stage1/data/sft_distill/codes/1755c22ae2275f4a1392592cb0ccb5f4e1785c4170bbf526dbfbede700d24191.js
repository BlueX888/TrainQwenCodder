// 初始化信号记录
window.__signals__ = {
  shakeCount: 0,
  lastShakeTime: 0,
  isShaking: false,
  events: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景网格，方便观察相机抖动效果
    const graphics = this.add.graphics();
    
    // 绘制网格背景
    graphics.lineStyle(1, 0x333333, 0.5);
    const gridSize = 50;
    
    for (let x = 0; x <= width; x += gridSize) {
      graphics.lineBetween(x, 0, x, height);
    }
    
    for (let y = 0; y <= height; y += gridSize) {
      graphics.lineBetween(0, y, width, y);
    }

    // 绘制中心标记物
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff6600, 1);
    centerGraphics.fillCircle(width / 2, height / 2, 30);
    
    centerGraphics.lineStyle(3, 0xffffff, 1);
    centerGraphics.strokeCircle(width / 2, height / 2, 30);

    // 添加提示文本
    const instructionText = this.add.text(width / 2, 50, 'Click to Shake Camera', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 状态文本
    this.statusText = this.add.text(width / 2, height - 50, 'Shake Count: 0', {
      fontSize: '20px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      // 只响应左键
      if (pointer.leftButtonDown()) {
        this.triggerCameraShake();
      }
    });

    // 监听相机 shake 完成事件
    this.cameras.main.on('camerashakecomplete', () => {
      window.__signals__.isShaking = false;
      window.__signals__.events.push({
        type: 'shake_complete',
        time: Date.now(),
        shakeCount: window.__signals__.shakeCount
      });
      
      console.log(JSON.stringify({
        event: 'camerashakecomplete',
        shakeCount: window.__signals__.shakeCount,
        timestamp: Date.now()
      }));
    });

    // 监听相机 shake 开始事件
    this.cameras.main.on('camerashakestart', () => {
      window.__signals__.isShaking = true;
      window.__signals__.events.push({
        type: 'shake_start',
        time: Date.now(),
        shakeCount: window.__signals__.shakeCount
      });
      
      console.log(JSON.stringify({
        event: 'camerashakestart',
        shakeCount: window.__signals__.shakeCount,
        timestamp: Date.now()
      }));
    });

    console.log(JSON.stringify({
      event: 'game_ready',
      message: 'Click anywhere to trigger camera shake',
      timestamp: Date.now()
    }));
  }

  triggerCameraShake() {
    // 如果已经在抖动中，忽略新的请求
    if (window.__signals__.isShaking) {
      console.log(JSON.stringify({
        event: 'shake_ignored',
        reason: 'already_shaking',
        timestamp: Date.now()
      }));
      return;
    }

    // 触发相机抖动效果
    // 参数：duration(ms), intensity(抖动强度)
    this.cameras.main.shake(1500, 0.01);

    // 更新信号
    window.__signals__.shakeCount++;
    window.__signals__.lastShakeTime = Date.now();
    window.__signals__.isShaking = true;

    // 更新状态文本
    this.statusText.setText(`Shake Count: ${window.__signals__.shakeCount}`);

    // 记录事件
    window.__signals__.events.push({
      type: 'shake_triggered',
      time: Date.now(),
      count: window.__signals__.shakeCount
    });

    console.log(JSON.stringify({
      event: 'shake_triggered',
      shakeCount: window.__signals__.shakeCount,
      duration: 1500,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 输出初始状态
console.log(JSON.stringify({
  event: 'game_initialized',
  config: {
    width: config.width,
    height: config.height
  },
  timestamp: Date.now()
}));