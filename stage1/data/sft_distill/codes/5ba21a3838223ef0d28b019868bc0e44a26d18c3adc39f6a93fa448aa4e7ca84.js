class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.rotationCount = 0; // 状态信号：记录旋转次数
    this.isRotating = false; // 状态信号：是否正在旋转
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景和参考图形，方便观察旋转效果
    const graphics = this.add.graphics();
    
    // 绘制背景网格
    graphics.lineStyle(1, 0x333333, 0.5);
    for (let i = 0; i <= 800; i += 50) {
      graphics.lineBetween(i, 0, i, 600);
    }
    for (let i = 0; i <= 600; i += 50) {
      graphics.lineBetween(0, i, 800, i);
    }

    // 绘制中心参考矩形
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(350, 250, 100, 100);

    // 绘制中心圆形标记
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(400, 300, 30);

    // 绘制箭头指示方向
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillTriangle(400, 200, 380, 240, 420, 240);

    // 添加文字提示
    const instructionText = this.add.text(400, 50, 'Click to Rotate Camera (4 seconds)', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    instructionText.setOrigin(0.5);

    // 显示旋转次数
    this.statusText = this.add.text(400, 550, `Rotations: ${this.rotationCount} | Status: Idle`, {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setOrigin(0.5);

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      // 只响应左键点击，且不在旋转中时才触发
      if (pointer.leftButtonDown() && !this.isRotating) {
        this.triggerRotation();
      }
    });

    // 监听相机旋转完成事件
    this.mainCamera.on('camerarotatecomplete', () => {
      this.isRotating = false;
      this.rotationCount++;
      this.updateStatusText();
      console.log(`Rotation completed! Total rotations: ${this.rotationCount}`);
    });
  }

  triggerRotation() {
    this.isRotating = true;
    this.updateStatusText();

    // 触发相机旋转效果
    // 参数：目标角度（弧度），持续时间（毫秒），缓动函数，强制旋转
    // 每次旋转 360 度（2 * Math.PI 弧度），持续 4 秒
    const currentRotation = this.mainCamera.rotation;
    const targetRotation = currentRotation + Math.PI * 2; // 完整旋转一圈

    this.mainCamera.rotateTo(targetRotation, 4000, 'Sine.easeInOut', true);

    console.log(`Camera rotation triggered! Duration: 4000ms`);
  }

  updateStatusText() {
    const status = this.isRotating ? 'Rotating...' : 'Idle';
    this.statusText.setText(`Rotations: ${this.rotationCount} | Status: ${status}`);
  }

  update(time, delta) {
    // 可选：显示当前相机旋转角度（用于调试）
    // console.log('Camera rotation:', this.mainCamera.rotation);
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