class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.rotationCount = 0; // 状态信号：旋转触发次数
    this.isRotating = false; // 状态信号：是否正在旋转
    this.currentRotation = 0; // 当前目标旋转角度
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景网格作为参考（便于观察旋转效果）
    const graphics = this.add.graphics();
    
    // 绘制网格线
    graphics.lineStyle(1, 0x333333, 0.5);
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 绘制中心参考点
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(400, 300, 10);

    // 绘制方向指示器（箭头）
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillTriangle(
      400, 250,  // 顶点
      380, 280,  // 左下
      420, 280   // 右下
    );

    // 添加文字说明
    this.instructionText = this.add.text(400, 50, 
      'Press Arrow Keys to Rotate Camera\n(Rotation lasts 2.5 seconds)', 
      {
        fontSize: '20px',
        color: '#ffffff',
        align: 'center',
        backgroundColor: '#000000',
        padding: { x: 10, y: 10 }
      }
    ).setOrigin(0.5);

    // 状态显示文本
    this.statusText = this.add.text(400, 550, 
      'Rotation Count: 0 | Status: Ready', 
      {
        fontSize: '18px',
        color: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    ).setOrigin(0.5);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 记录上一帧的按键状态（避免重复触发）
    this.lastKeyState = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    // 获取主相机
    this.mainCamera = this.cameras.main;
  }

  update(time, delta) {
    // 检测方向键按下（边缘触发，避免持续触发）
    const upPressed = this.cursors.up.isDown && !this.lastKeyState.up;
    const downPressed = this.cursors.down.isDown && !this.lastKeyState.down;
    const leftPressed = this.cursors.left.isDown && !this.lastKeyState.left;
    const rightPressed = this.cursors.right.isDown && !this.lastKeyState.right;

    // 更新按键状态
    this.lastKeyState.up = this.cursors.up.isDown;
    this.lastKeyState.down = this.cursors.down.isDown;
    this.lastKeyState.left = this.cursors.left.isDown;
    this.lastKeyState.right = this.cursors.right.isDown;

    // 如果正在旋转，不处理新的输入
    if (this.isRotating) {
      return;
    }

    // 根据方向键设置旋转目标角度
    let targetRotation = null;

    if (upPressed) {
      // 上键：顺时针旋转 90 度
      targetRotation = this.currentRotation + Phaser.Math.DegToRad(90);
    } else if (downPressed) {
      // 下键：逆时针旋转 90 度
      targetRotation = this.currentRotation - Phaser.Math.DegToRad(90);
    } else if (leftPressed) {
      // 左键：逆时针旋转 45 度
      targetRotation = this.currentRotation - Phaser.Math.DegToRad(45);
    } else if (rightPressed) {
      // 右键：顺时针旋转 45 度
      targetRotation = this.currentRotation + Phaser.Math.DegToRad(45);
    }

    // 如果有目标旋转角度，触发旋转效果
    if (targetRotation !== null) {
      this.isRotating = true;
      this.rotationCount++;
      this.currentRotation = targetRotation;

      // 触发相机旋转效果，持续 2.5 秒
      this.mainCamera.rotateTo(targetRotation, false, 2500, 'Sine.easeInOut', false, (camera, progress) => {
        // 旋转完成回调
        if (progress === 1) {
          this.isRotating = false;
          this.updateStatus();
        }
      });

      this.updateStatus();
    }
  }

  updateStatus() {
    // 更新状态显示
    const status = this.isRotating ? 'Rotating...' : 'Ready';
    const rotationDegrees = Math.round(Phaser.Math.RadToDeg(this.currentRotation));
    this.statusText.setText(
      `Rotation Count: ${this.rotationCount} | Status: ${status} | Angle: ${rotationDegrees}°`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene
};

new Phaser.Game(config);