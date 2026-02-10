class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.rotationCount = 0; // 可验证的状态信号
    this.isRotating = false; // 防止重复触发
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建背景网格用于观察旋转效果
    const graphics = this.add.graphics();
    
    // 绘制网格
    graphics.lineStyle(2, 0x00ff00, 0.5);
    for (let x = 0; x <= 800; x += 100) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 100) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 绘制中心标记
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(400, 300, 20);

    // 绘制方向指示器（箭头形状）
    graphics.fillStyle(0xffff00, 1);
    graphics.fillTriangle(400, 250, 380, 280, 420, 280); // 上箭头

    // 添加文字提示
    this.instructionText = this.add.text(400, 50, 
      'Press Arrow Keys to Rotate Camera\n(2.5s duration)', 
      {
        fontSize: '20px',
        color: '#ffffff',
        align: 'center',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    ).setOrigin(0.5);

    // 显示旋转次数
    this.statusText = this.add.text(400, 550, 
      `Rotations: ${this.rotationCount}`, 
      {
        fontSize: '24px',
        color: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    ).setOrigin(0.5);

    // 显示当前角度
    this.angleText = this.add.text(400, 500, 
      `Camera Angle: 0°`, 
      {
        fontSize: '18px',
        color: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    ).setOrigin(0.5);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 获取主相机
    this.camera = this.cameras.main;

    // 监听旋转完成事件
    this.camera.on('camerarotatecomplete', () => {
      this.isRotating = false;
      console.log('Camera rotation completed');
    });

    // 添加按键状态跟踪（防止按住不放重复触发）
    this.keyPressed = {
      left: false,
      right: false,
      up: false,
      down: false
    };
  }

  update(time, delta) {
    // 更新角度显示
    const currentAngle = Phaser.Math.RadToDeg(this.camera.rotation);
    this.angleText.setText(`Camera Angle: ${currentAngle.toFixed(1)}°`);

    // 如果正在旋转，不处理新的输入
    if (this.isRotating) {
      return;
    }

    // 检测方向键按下（使用 JustDown 模式防止重复触发）
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.rotateCamera(-45); // 向左旋转到 -45 度
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.rotateCamera(45); // 向右旋转到 45 度
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.rotateCamera(0); // 向上旋转到 0 度（复位）
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.rotateCamera(180); // 向下旋转到 180 度
    }
  }

  rotateCamera(targetAngleDegrees) {
    // 转换为弧度
    const targetAngleRadians = Phaser.Math.DegToRad(targetAngleDegrees);
    
    // 触发相机旋转效果，持续 2500 毫秒（2.5秒）
    this.camera.rotateTo(targetAngleRadians, false, 2500, 'Sine.easeInOut');
    
    // 设置旋转标志
    this.isRotating = true;
    
    // 增加旋转计数
    this.rotationCount++;
    this.statusText.setText(`Rotations: ${this.rotationCount}`);
    
    // 控制台输出
    console.log(`Rotating camera to ${targetAngleDegrees}° (count: ${this.rotationCount})`);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);