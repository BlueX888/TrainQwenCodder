class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shakeCount = 0;
    this.lastDirection = 'none';
    this.isShaking = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      shakeCount: 0,
      shakeHistory: [],
      lastDirection: 'none',
      isShaking: false
    };

    // 绘制背景网格，便于观察相机弹跳效果
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);
    
    // 绘制垂直线
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    
    // 绘制水平线
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 绘制中心标记
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(400, 300, 10);
    
    // 绘制中心十字
    graphics.lineStyle(3, 0xff0000, 1);
    graphics.lineBetween(400, 280, 400, 320);
    graphics.lineBetween(380, 300, 420, 300);

    // 添加提示文本
    this.add.text(400, 50, 'Press Arrow Keys to Shake Camera', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 显示弹跳计数
    this.countText = this.add.text(400, 100, 'Shake Count: 0', {
      fontSize: '20px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 显示最后方向
    this.directionText = this.add.text(400, 140, 'Last Direction: none', {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 显示状态
    this.statusText = this.add.text(400, 180, 'Status: Ready', {
      fontSize: '18px',
      color: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 监听相机 shake 开始事件
    this.mainCamera.on('camerashakestart', () => {
      this.isShaking = true;
      window.__signals__.isShaking = true;
      this.statusText.setText('Status: Shaking...');
      
      console.log(JSON.stringify({
        event: 'shake_start',
        count: this.shakeCount,
        direction: this.lastDirection,
        timestamp: Date.now()
      }));
    });

    // 监听相机 shake 完成事件
    this.mainCamera.on('camerashakecomplete', () => {
      this.isShaking = false;
      window.__signals__.isShaking = false;
      this.statusText.setText('Status: Ready');
      
      console.log(JSON.stringify({
        event: 'shake_complete',
        count: this.shakeCount,
        direction: this.lastDirection,
        timestamp: Date.now()
      }));
    });

    // 用于防止重复触发的标志
    this.keyPressed = {
      up: false,
      down: false,
      left: false,
      right: false
    };
  }

  update(time, delta) {
    // 检测方向键按下（只在不在弹跳状态时触发）
    if (!this.isShaking) {
      // 上键
      if (this.cursors.up.isDown && !this.keyPressed.up) {
        this.triggerShake('up');
        this.keyPressed.up = true;
      } else if (this.cursors.up.isUp) {
        this.keyPressed.up = false;
      }

      // 下键
      if (this.cursors.down.isDown && !this.keyPressed.down) {
        this.triggerShake('down');
        this.keyPressed.down = true;
      } else if (this.cursors.down.isUp) {
        this.keyPressed.down = false;
      }

      // 左键
      if (this.cursors.left.isDown && !this.keyPressed.left) {
        this.triggerShake('left');
        this.keyPressed.left = true;
      } else if (this.cursors.left.isUp) {
        this.keyPressed.left = false;
      }

      // 右键
      if (this.cursors.right.isDown && !this.keyPressed.right) {
        this.triggerShake('right');
        this.keyPressed.right = true;
      } else if (this.cursors.right.isUp) {
        this.keyPressed.right = false;
      }
    }
  }

  triggerShake(direction) {
    // 触发相机弹跳效果，持续 1000ms（1秒）
    // shake(duration, intensity)
    this.mainCamera.shake(1000, 0.01);

    // 更新计数和方向
    this.shakeCount++;
    this.lastDirection = direction;

    // 更新显示文本
    this.countText.setText(`Shake Count: ${this.shakeCount}`);
    this.directionText.setText(`Last Direction: ${direction}`);

    // 更新信号对象
    window.__signals__.shakeCount = this.shakeCount;
    window.__signals__.lastDirection = direction;
    window.__signals__.shakeHistory.push({
      direction: direction,
      timestamp: Date.now(),
      count: this.shakeCount
    });

    // 输出日志
    console.log(JSON.stringify({
      event: 'shake_triggered',
      direction: direction,
      count: this.shakeCount,
      timestamp: Date.now()
    }));
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