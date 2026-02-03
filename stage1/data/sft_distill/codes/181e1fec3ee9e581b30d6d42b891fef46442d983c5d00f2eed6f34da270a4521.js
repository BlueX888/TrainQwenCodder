class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.rotationCount = 0; // 状态信号：记录旋转次数
    this.currentRotation = 0; // 当前目标旋转角度
    this.isRotating = false; // 是否正在旋转
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景网格用于观察旋转效果
    const graphics = this.add.graphics();
    
    // 绘制网格
    graphics.lineStyle(1, 0x444444, 0.5);
    for (let x = 0; x <= width; x += 50) {
      graphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y <= height; y += 50) {
      graphics.lineBetween(0, y, width, y);
    }

    // 绘制中心参考点
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(width / 2, height / 2, 10);

    // 绘制方向指示器
    const arrow = this.add.graphics();
    arrow.fillStyle(0x00ff00, 1);
    arrow.fillTriangle(
      width / 2, height / 2 - 50,
      width / 2 - 20, height / 2 + 20,
      width / 2 + 20, height / 2 + 20
    );

    // 绘制四个角的标记
    const cornerSize = 30;
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillRect(10, 10, cornerSize, cornerSize); // 左上
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(width - cornerSize - 10, 10, cornerSize, cornerSize); // 右上
    graphics.fillStyle(0xff00ff, 1);
    graphics.fillRect(10, height - cornerSize - 10, cornerSize, cornerSize); // 左下
    graphics.fillStyle(0x00ffff, 1);
    graphics.fillRect(width - cornerSize - 10, height - cornerSize - 10, cornerSize, cornerSize); // 右下

    // 添加文本显示旋转次数
    this.statusText = this.add.text(16, 16, 'Rotation Count: 0', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setScrollFactor(0); // 固定在屏幕上不随相机旋转

    // 添加提示文本
    this.hintText = this.add.text(width / 2, height - 50, 'Press Arrow Keys to Rotate Camera', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.hintText.setOrigin(0.5);
    this.hintText.setScrollFactor(0);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 监听方向键按下事件
    this.input.keyboard.on('keydown-LEFT', () => this.rotateCamera(-90));
    this.input.keyboard.on('keydown-RIGHT', () => this.rotateCamera(90));
    this.input.keyboard.on('keydown-UP', () => this.rotateCamera(0));
    this.input.keyboard.on('keydown-DOWN', () => this.rotateCamera(180));

    // 监听相机旋转完成事件
    this.cameras.main.on('camerarotatecomplete', () => {
      this.isRotating = false;
      console.log('Camera rotation completed. Total rotations:', this.rotationCount);
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
    this.statusText.setText(`Rotation Count: ${this.rotationCount}`);

    // 将角度转换为弧度
    const targetRadian = Phaser.Math.DegToRad(targetAngle);

    // 触发相机旋转效果，持续 1500 毫秒（1.5 秒）
    this.cameras.main.rotateTo(targetRadian, false, 1500, 'Sine.easeInOut');

    console.log(`Rotating camera to ${targetAngle} degrees (${this.rotationCount} rotations)`);
  }

  update(time, delta) {
    // 可选：显示当前相机旋转角度
    const currentAngle = Phaser.Math.RadToDeg(this.cameras.main.rotation);
    // console.log('Current camera angle:', currentAngle.toFixed(2));
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

new Phaser.Game(config);