class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.rotationCount = 0; // 状态信号：记录旋转次数
    this.isRotating = false; // 防止重复触发
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 绘制参考网格和中心点，用于观察旋转效果
    const graphics = this.add.graphics();
    
    // 绘制网格背景
    graphics.lineStyle(1, 0x333333, 0.5);
    for (let i = 0; i <= 800; i += 50) {
      graphics.lineBetween(i, 0, i, 600);
    }
    for (let j = 0; j <= 600; j += 50) {
      graphics.lineBetween(0, j, 800, j);
    }

    // 绘制中心点
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(400, 300, 10);

    // 绘制一些参考矩形
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(200, 150, 100, 80);
    
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillRect(500, 350, 120, 100);

    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(100, 400, 80, 60);

    graphics.fillStyle(0xff00ff, 1);
    graphics.fillRect(600, 100, 90, 90);

    // 添加文本提示
    const text = this.add.text(400, 50, 'Press Arrow Keys to Rotate Camera', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setOrigin(0.5);

    // 添加旋转计数显示
    this.countText = this.add.text(400, 550, `Rotations: ${this.rotationCount}`, {
      fontSize: '20px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.countText.setOrigin(0.5);

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 监听方向键按下事件
    this.input.keyboard.on('keydown-LEFT', () => {
      this.rotateCamera(-Math.PI / 2); // 逆时针旋转 90 度
    });

    this.input.keyboard.on('keydown-RIGHT', () => {
      this.rotateCamera(Math.PI / 2); // 顺时针旋转 90 度
    });

    this.input.keyboard.on('keydown-UP', () => {
      this.rotateCamera(-Math.PI); // 旋转 180 度
    });

    this.input.keyboard.on('keydown-DOWN', () => {
      this.rotateCamera(0); // 回到初始角度
    });

    // 添加状态提示文本
    this.statusText = this.add.text(10, 10, 'Status: Ready', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
  }

  rotateCamera(targetAngle) {
    // 如果正在旋转，忽略新的输入
    if (this.isRotating) {
      return;
    }

    this.isRotating = true;
    this.rotationCount++;
    
    // 更新状态文本
    this.statusText.setText('Status: Rotating...');
    this.countText.setText(`Rotations: ${this.rotationCount}`);

    // 使用 rotateTo 方法实现 2.5 秒的旋转效果
    this.mainCamera.rotateTo(targetAngle, false, 2500, 'Sine.easeInOut', false, (camera, progress) => {
      // 旋转完成回调
      if (progress === 1) {
        this.isRotating = false;
        this.statusText.setText('Status: Ready');
        console.log(`Rotation ${this.rotationCount} completed. Current angle: ${camera.rotation}`);
      }
    });
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
  backgroundColor: '#222222',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);