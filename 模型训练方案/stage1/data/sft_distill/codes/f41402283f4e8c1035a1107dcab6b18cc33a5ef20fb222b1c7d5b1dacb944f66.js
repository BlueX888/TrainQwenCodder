class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shakeCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号记录
    window.__signals__ = {
      shakes: [],
      totalShakes: 0
    };

    // 创建背景网格
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);
    
    // 绘制网格
    for (let x = 0; x < 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y < 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 绘制中心参考点
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(400, 300, 20);
    
    // 绘制四个角的标记
    const cornerGraphics = this.add.graphics();
    cornerGraphics.fillStyle(0x00ff00, 1);
    cornerGraphics.fillCircle(50, 50, 15);
    cornerGraphics.fillCircle(750, 50, 15);
    cornerGraphics.fillCircle(50, 550, 15);
    cornerGraphics.fillCircle(750, 550, 15);

    // 添加提示文本
    this.instructionText = this.add.text(400, 50, 'Press Arrow Keys to Shake Camera', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 显示触发次数
    this.countText = this.add.text(400, 100, 'Shakes: 0', {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 显示最后触发的方向
    this.directionText = this.add.text(400, 140, 'Last Direction: None', {
      fontSize: '18px',
      color: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 记录上一次按键状态，避免重复触发
    this.lastKeyState = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    // 监听相机 shake 完成事件
    this.mainCamera.on('camerashakecomplete', () => {
      console.log(JSON.stringify({
        event: 'shake_complete',
        timestamp: Date.now(),
        totalShakes: this.shakeCount
      }));
    });
  }

  update(time, delta) {
    // 检测方向键按下（只在按下瞬间触发，避免长按重复触发）
    
    // 上键
    if (this.cursors.up.isDown && !this.lastKeyState.up) {
      this.triggerShake('UP');
      this.lastKeyState.up = true;
    } else if (!this.cursors.up.isDown) {
      this.lastKeyState.up = false;
    }

    // 下键
    if (this.cursors.down.isDown && !this.lastKeyState.down) {
      this.triggerShake('DOWN');
      this.lastKeyState.down = true;
    } else if (!this.cursors.down.isDown) {
      this.lastKeyState.down = false;
    }

    // 左键
    if (this.cursors.left.isDown && !this.lastKeyState.left) {
      this.triggerShake('LEFT');
      this.lastKeyState.left = true;
    } else if (!this.cursors.left.isDown) {
      this.lastKeyState.left = false;
    }

    // 右键
    if (this.cursors.right.isDown && !this.lastKeyState.right) {
      this.triggerShake('RIGHT');
      this.lastKeyState.right = true;
    } else if (!this.cursors.right.isDown) {
      this.lastKeyState.right = false;
    }
  }

  triggerShake(direction) {
    // 触发相机弹跳效果，持续 1000 毫秒（1秒）
    // shake(duration, intensity, force, callback, context)
    this.mainCamera.shake(1000, 0.01);

    // 增加计数
    this.shakeCount++;

    // 更新显示
    this.countText.setText(`Shakes: ${this.shakeCount}`);
    this.directionText.setText(`Last Direction: ${direction}`);

    // 记录信号
    const signal = {
      event: 'camera_shake',
      direction: direction,
      timestamp: Date.now(),
      count: this.shakeCount,
      duration: 1000,
      intensity: 0.01
    };

    window.__signals__.shakes.push(signal);
    window.__signals__.totalShakes = this.shakeCount;

    // 输出日志 JSON
    console.log(JSON.stringify(signal));
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 导出游戏实例供测试使用
window.__game__ = game;