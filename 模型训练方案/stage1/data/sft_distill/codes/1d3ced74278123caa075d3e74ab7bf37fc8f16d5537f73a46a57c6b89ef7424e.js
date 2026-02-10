// 完整的 Phaser3 代码
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.rotationCount = 0;
    this.isRotating = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化状态信号
    window.__signals__ = {
      rotationCount: 0,
      isRotating: false,
      lastRotationTime: null,
      totalRotations: 0
    };

    // 创建背景网格作为参考
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x00ff00, 0.5);

    // 绘制网格
    for (let x = 0; x < 800; x += 100) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y < 600; y += 100) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 绘制中心参考点
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(400, 300, 10);

    // 绘制一些方块作为旋转参考
    const box1 = this.add.graphics();
    box1.fillStyle(0x0000ff, 1);
    box1.fillRect(200, 200, 80, 80);

    const box2 = this.add.graphics();
    box2.fillStyle(0xffff00, 1);
    box2.fillRect(520, 200, 80, 80);

    const box3 = this.add.graphics();
    box3.fillStyle(0xff00ff, 1);
    box3.fillRect(200, 420, 80, 80);

    const box4 = this.add.graphics();
    box4.fillStyle(0x00ffff, 1);
    box4.fillRect(520, 420, 80, 80);

    // 添加提示文本
    const text = this.add.text(400, 50, 'Click to Rotate Camera (3s)', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setOrigin(0.5);

    // 状态文本
    this.statusText = this.add.text(400, 550, 'Rotations: 0 | Status: Ready', {
      fontSize: '20px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setOrigin(0.5);

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      // 只响应左键
      if (pointer.leftButtonDown()) {
        this.triggerCameraRotation();
      }
    });

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 日志初始状态
    console.log(JSON.stringify({
      event: 'scene_created',
      timestamp: Date.now(),
      cameraRotation: this.mainCamera.rotation
    }));
  }

  triggerCameraRotation() {
    // 如果正在旋转，忽略新的点击
    if (this.isRotating) {
      console.log(JSON.stringify({
        event: 'rotation_ignored',
        reason: 'already_rotating',
        timestamp: Date.now()
      }));
      return;
    }

    this.isRotating = true;
    this.rotationCount++;

    // 更新状态信号
    window.__signals__.isRotating = true;
    window.__signals__.rotationCount = this.rotationCount;
    window.__signals__.lastRotationTime = Date.now();
    window.__signals__.totalRotations++;

    // 更新状态文本
    this.statusText.setText(`Rotations: ${this.rotationCount} | Status: Rotating...`);
    this.statusText.setColor('#ff0000');

    // 日志旋转开始
    console.log(JSON.stringify({
      event: 'rotation_started',
      rotationCount: this.rotationCount,
      timestamp: Date.now(),
      duration: 3000
    }));

    // 触发相机旋转效果
    // 旋转 360 度（2 * Math.PI 弧度），持续 3000 毫秒
    const targetRotation = this.mainCamera.rotation + Math.PI * 2;
    
    this.mainCamera.rotateTo(targetRotation, false, 3000, 'Linear', true, (camera, progress) => {
      // 旋转完成回调
      if (progress === 1) {
        this.onRotationComplete();
      }
    });
  }

  onRotationComplete() {
    this.isRotating = false;

    // 更新状态信号
    window.__signals__.isRotating = false;

    // 更新状态文本
    this.statusText.setText(`Rotations: ${this.rotationCount} | Status: Ready`);
    this.statusText.setColor('#00ff00');

    // 日志旋转完成
    console.log(JSON.stringify({
      event: 'rotation_completed',
      rotationCount: this.rotationCount,
      timestamp: Date.now(),
      finalRotation: this.mainCamera.rotation
    }));
  }

  update(time, delta) {
    // 实时更新信号中的相机旋转角度
    if (window.__signals__) {
      window.__signals__.currentRotation = this.mainCamera.rotation;
    }
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

// 初始化日志
console.log(JSON.stringify({
  event: 'game_initialized',
  timestamp: Date.now(),
  config: {
    width: config.width,
    height: config.height
  }
}));